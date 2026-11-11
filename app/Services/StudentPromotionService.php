<?php

namespace App\Services;

use App\Models\FeeHead;
use App\Models\FeeStructure;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Student;
use App\Models\StudentEnrollment;
use App\Models\StudentFeeProfile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class StudentPromotionService
{
    /**
     * Get students eligible for promotion based on source class and section.
     */
    public function getEligibleStudents(
        int $sourceClassId,
        ?int $sourceSectionId = null,
        ?string $sourceSessionYear = null,
        ?string $targetSessionYear = null
    ): Collection {
        $query = Student::where('status', 'active')
            ->whereHas('current_enrollment', function ($q) use ($sourceClassId, $sourceSectionId, $sourceSessionYear) {
                $q->where('school_class_id', $sourceClassId);
                if ($sourceSectionId) {
                    $q->where('section_id', $sourceSectionId);
                }
                if ($sourceSessionYear) {
                    $q->where('session_year', $sourceSessionYear);
                }
            })
            ->with([
                'current_enrollment.school_class',
                'current_enrollment.section',
                'enrollments.school_class',
                'enrollments.section',
                'feeProfile',
            ])
            ->orderBy('roll_number')
            ->orderBy('first_name');

        $students = $query->get();

        $sourceClass = SchoolClass::find($sourceClassId);
        $nextClass = $sourceClass ? SchoolClass::where('numeric_value', '>', $sourceClass->numeric_value)
            ->orderBy('numeric_value')
            ->first() : null;

        return $students->map(function ($student) use ($targetSessionYear, $nextClass, $sourceClass) {
            // Check if student already has an enrollment for target session year
            $targetEnrollment = null;
            if ($targetSessionYear) {
                $targetEnrollment = $student->enrollments
                    ->firstWhere('session_year', $targetSessionYear);
            }

            $currentFeeProfile = $student->feeProfile;

            return [
                'id' => $student->id,
                'admission_number' => $student->admission_number,
                'roll_number' => $student->roll_number,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
                'full_name' => $student->full_name,
                'photo_url' => $student->photo_url,
                'gender' => $student->gender,
                'current_class_id' => $student->current_enrollment?->school_class_id,
                'current_class_name' => $student->current_enrollment?->school_class?->name,
                'current_section_id' => $student->current_enrollment?->section_id,
                'current_section_name' => $student->current_enrollment?->section?->name,
                'current_session_year' => $student->current_enrollment?->session_year,
                'current_base_fee' => (float) ($currentFeeProfile?->base_monthly_fee ?? 0),
                'current_discount' => (float) ($currentFeeProfile?->monthly_discount ?? 0),
                'current_net_fee' => (float) ($currentFeeProfile?->net_monthly_fee ?? 0),
                'current_discount_reason' => $currentFeeProfile?->discount_reason ?? '',
                'current_waive_admission' => (bool) ($currentFeeProfile?->waive_admission_fee ?? false),
                'is_already_promoted' => $targetEnrollment !== null,
                'target_enrollment_class' => $targetEnrollment?->school_class?->name,
                'target_enrollment_section' => $targetEnrollment?->section?->name,
                'suggested_target_class_id' => $nextClass?->id ?? $sourceClass?->id,
                'suggested_target_class_name' => $nextClass?->name ?? $sourceClass?->name,
            ];
        });
    }

    /**
     * Promote multiple students to target class/section with fee configuration.
     */
    public function promoteBulk(array $data, ?int $operatorId = null): array
    {
        return DB::transaction(function () use ($data, $operatorId) {
            $sourceClassId = (int) $data['source_class_id'];
            $defaultTargetClassId = (int) $data['target_class_id'];
            $defaultTargetSectionId = ! empty($data['target_section_id']) ? (int) $data['target_section_id'] : null;
            $targetSessionYear = trim($data['target_session_year']);
            $studentIds = $data['student_ids'];

            $feeStrategy = $data['fee_strategy'] ?? 'class_default';
            $bulkBaseMonthlyFee = isset($data['base_monthly_fee']) && $data['base_monthly_fee'] !== '' ? (float) $data['base_monthly_fee'] : null;
            $bulkAdmissionFee = isset($data['admission_fee']) && $data['admission_fee'] !== '' ? (float) $data['admission_fee'] : null;
            $bulkWaiveAdmission = ! empty($data['waive_admission_fee']);
            $discountStrategy = $data['discount_strategy'] ?? 'keep_existing';
            $bulkCustomDiscount = isset($data['custom_discount']) ? (float) $data['custom_discount'] : 0.00;
            $bulkDiscountReason = $data['custom_discount_reason'] ?? null;
            $individualOverrides = $data['individual_overrides'] ?? [];

            // If an admission fee is specified, save/update target class FeeStructure
            if ($bulkAdmissionFee !== null && $bulkAdmissionFee > 0) {
                $admissionHead = FeeHead::firstOrCreate(
                    ['type' => 'one_time', 'title' => 'Admission Fee'],
                    ['description' => 'Annual Admission Fee', 'is_active' => true]
                );

                FeeStructure::updateOrCreate(
                    [
                        'school_class_id' => $defaultTargetClassId,
                        'fee_head_id' => $admissionHead->id,
                        'session_year' => $targetSessionYear,
                    ],
                    ['amount' => $bulkAdmissionFee]
                );
            }

            // If a custom monthly fee is specified, save/update target class FeeStructure for Tuition Fee
            if ($feeStrategy === 'custom' && $bulkBaseMonthlyFee !== null && $bulkBaseMonthlyFee > 0) {
                $tuitionHead = FeeHead::firstOrCreate(
                    ['title' => 'Monthly Tuition Fee'],
                    ['type' => 'recurring', 'is_active' => true]
                );

                FeeStructure::updateOrCreate(
                    [
                        'school_class_id' => $defaultTargetClassId,
                        'fee_head_id' => $tuitionHead->id,
                        'session_year' => $targetSessionYear,
                    ],
                    ['amount' => $bulkBaseMonthlyFee]
                );
            }

            // Cache class default fee amounts for target classes
            $classDefaultFees = [];

            $sourceClass = SchoolClass::find($sourceClassId);
            $stats = [
                'total' => 0,
                'promoted' => 0,
                'skipped' => 0,
                'retained' => 0,
            ];

            foreach ($studentIds as $studentId) {
                $studentId = (int) $studentId;
                $student = Student::with(['feeProfile'])->find($studentId);

                if (! $student) {
                    continue;
                }

                $override = $individualOverrides[$studentId] ?? [];

                // Resolve student target class & section
                $targetClassId = ! empty($override['target_class_id'])
                    ? (int) $override['target_class_id']
                    : $defaultTargetClassId;

                $targetClass = SchoolClass::find($targetClassId);
                if (! $targetClass) {
                    continue;
                }

                $targetSectionId = ! empty($override['target_section_id'])
                    ? (int) $override['target_section_id']
                    : $defaultTargetSectionId;

                // If no specific section chosen, select the first available section of target class
                if (! $targetSectionId) {
                    $targetSectionId = Section::where('school_class_id', $targetClassId)->value('id');
                    if (! $targetSectionId) {
                        // Auto-create a default 'A' section if none exists
                        $newSection = Section::create([
                            'school_class_id' => $targetClassId,
                            'name' => 'A',
                            'capacity' => 40,
                        ]);
                        $targetSectionId = $newSection->id;
                    }
                }

                // Calculate promotion type (normal promotion, skipped class, or retained)
                if ($sourceClass && $targetClass) {
                    if ($targetClass->numeric_value > ($sourceClass->numeric_value + 1)) {
                        $stats['skipped']++;
                    } elseif ($targetClass->numeric_value <= $sourceClass->numeric_value) {
                        $stats['retained']++;
                    } else {
                        $stats['promoted']++;
                    }
                } else {
                    $stats['promoted']++;
                }

                // 1. Deactivate old active enrollments
                StudentEnrollment::where('student_id', $student->id)
                    ->where('is_current', true)
                    ->update(['is_current' => false]);

                // 2. Create or Update enrollment for the target session year
                StudentEnrollment::updateOrCreate(
                    [
                        'student_id' => $student->id,
                        'session_year' => $targetSessionYear,
                    ],
                    [
                        'school_class_id' => $targetClassId,
                        'section_id' => $targetSectionId,
                        'is_current' => true,
                    ]
                );

                // 3. Fee Profile Calculations
                // Determine Base Monthly Fee
                if (isset($override['base_monthly_fee']) && $override['base_monthly_fee'] !== '') {
                    $baseFee = (float) $override['base_monthly_fee'];
                } elseif ($feeStrategy === 'custom' && $bulkBaseMonthlyFee !== null) {
                    $baseFee = $bulkBaseMonthlyFee;
                } else {
                    // Fetch default class tuition fee
                    if (! isset($classDefaultFees[$targetClassId])) {
                        $defaultAmount = FeeStructure::where('school_class_id', $targetClassId)
                            ->where('session_year', $targetSessionYear)
                            ->whereHas('feeHead', fn ($q) => $q->where('type', 'recurring'))
                            ->sum('amount');

                        if ($defaultAmount <= 0) {
                            $defaultAmount = FeeStructure::where('school_class_id', $targetClassId)
                                ->whereHas('feeHead', fn ($q) => $q->where('type', 'recurring'))
                                ->sum('amount');
                        }

                        $classDefaultFees[$targetClassId] = (float) $defaultAmount;
                    }
                    $baseFee = $classDefaultFees[$targetClassId];
                }

                // Determine Monthly Discount & Reason
                $existingProfile = $student->feeProfile;
                if (isset($override['monthly_discount']) && $override['monthly_discount'] !== '') {
                    $discount = (float) $override['monthly_discount'];
                    $discountReason = $override['discount_reason'] ?? $existingProfile?->discount_reason;
                } elseif ($discountStrategy === 'reset_zero') {
                    $discount = 0.00;
                    $discountReason = null;
                } elseif ($discountStrategy === 'custom') {
                    $discount = $bulkCustomDiscount;
                    $discountReason = $bulkDiscountReason;
                } else {
                    // keep_existing
                    $discount = (float) ($existingProfile?->monthly_discount ?? 0.00);
                    $discountReason = $existingProfile?->discount_reason;
                }

                // Determine Waive Admission Fee
                if (isset($override['waive_admission_fee'])) {
                    $waiveAdmission = (bool) $override['waive_admission_fee'];
                } else {
                    $waiveAdmission = $bulkWaiveAdmission;
                }

                $netMonthlyFee = max(0, $baseFee - $discount);

                // 4. Create or update Student Fee Profile for target session
                StudentFeeProfile::updateOrCreate(
                    [
                        'student_id' => $student->id,
                        'session_year' => $targetSessionYear,
                    ],
                    [
                        'school_class_id' => $targetClassId,
                        'base_monthly_fee' => $baseFee,
                        'monthly_discount' => $discount,
                        'net_monthly_fee' => $netMonthlyFee,
                        'waive_admission_fee' => $waiveAdmission,
                        'discount_reason' => $discountReason,
                        'is_locked' => false,
                        'approved_by' => $operatorId,
                    ]
                );

                $stats['total']++;
            }

            return $stats;
        });
    }

    /**
     * Promote a single student with specific options.
     */
    public function promoteSingle(int $studentId, array $data, ?int $operatorId = null): array
    {
        $payload = [
            'source_class_id' => $data['source_class_id'],
            'target_class_id' => $data['target_class_id'],
            'target_section_id' => $data['target_section_id'] ?? null,
            'target_session_year' => $data['target_session_year'],
            'student_ids' => [$studentId],
            'fee_strategy' => 'custom',
            'base_monthly_fee' => $data['base_monthly_fee'] ?? null,
            'admission_fee' => $data['admission_fee'] ?? null,
            'waive_admission_fee' => ! empty($data['waive_admission_fee']),
            'discount_strategy' => 'custom',
            'custom_discount' => $data['monthly_discount'] ?? 0.00,
            'custom_discount_reason' => $data['discount_reason'] ?? null,
            'individual_overrides' => [
                $studentId => [
                    'target_class_id' => $data['target_class_id'],
                    'target_section_id' => $data['target_section_id'] ?? null,
                    'base_monthly_fee' => $data['base_monthly_fee'] ?? null,
                    'monthly_discount' => $data['monthly_discount'] ?? null,
                    'waive_admission_fee' => ! empty($data['waive_admission_fee']),
                    'discount_reason' => $data['discount_reason'] ?? null,
                ],
            ],
        ];

        return $this->promoteBulk($payload, $operatorId);
    }
}

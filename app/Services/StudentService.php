<?php

namespace App\Services;

use App\Models\Student;
use App\Models\StudentEnrollment;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class StudentService
{
    /**
     * Paginate students with optional filters
     */
    public function getPaginatedStudents(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = Student::query()
            ->with([
                'current_enrollment.school_class',
                'current_enrollment.section',
                'feeProfile.items.feeHead', // Eager-load student-specific fee structure & overrides
                'invoices' => function ($query) {
                    $query->whereIn('status', ['unpaid', 'partially_paid', 'overdue'])
                        ->orderBy('session_year', 'asc')
                        ->orderBy('month_order', 'asc');
                },
            ]);

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('admission_number', 'like', "%{$search}%")
                    ->orWhere('guardian_phone', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['class_id'])) {
            $query->whereHas('current_enrollment', function ($q) use ($filters) {
                $q->where('school_class_id', $filters['class_id']);
            });
        }

        if (! empty($filters['section_id'])) {
            $query->whereHas('current_enrollment', function ($q) use ($filters) {
                $q->where('section_id', $filters['section_id']);
            });
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->latest()->paginate($perPage)->withQueryString();
    }

    /**
     * Create a new student with auto-enrollment
     */
    public function createStudent(array $data): Student
    {
        return DB::transaction(function () use ($data) {
            // Auto-generate Admission Number if not provided
            if (empty($data['admission_number'])) {
                $data['admission_number'] = $this->generateAdmissionNumber();
            }

            $student = Student::create($data);

            // Enroll in Class & Section
            StudentEnrollment::create([
                'student_id' => $student->id,
                'school_class_id' => $data['school_class_id'],
                'section_id' => $data['section_id'],
                'session_year' => $data['session_year'] ?? date('Y').'-'.(date('Y') + 1),
                'is_current' => true,
            ]);

            return $student;
        });
    }

    /**
     * Update existing student & enrollment section
     */
    public function updateStudent(Student $student, array $data): Student
    {
        return DB::transaction(function () use ($student, $data) {
            $student->update($data);

            if (isset($data['school_class_id']) && isset($data['section_id'])) {
                StudentEnrollment::updateOrCreate(
                    [
                        'student_id' => $student->id,
                        'is_current' => true,
                    ],
                    [
                        'school_class_id' => $data['school_class_id'],
                        'section_id' => $data['section_id'],
                        'session_year' => $data['session_year'] ?? date('Y'),
                    ]
                );
            }

            return $student;
        });
    }

    /**
     * Auto-generate sequential admission number (e.g. ADM-2026-0001)
     */
    private function generateAdmissionNumber(): string
    {
        $year = date('Y');
        $lastStudent = Student::withTrashed()
            ->where('admission_number', 'like', "ADM-{$year}-%")
            ->latest('id')
            ->first();

        $sequence = $lastStudent ? ((int) substr($lastStudent->admission_number, -4)) + 1 : 1;

        return sprintf('ADM-%s-%04d', $year, $sequence);
    }
}

<?php

namespace App\Http\Controllers;

use App\Http\Requests\CollectPaymentRequest;
use App\Http\Requests\GenerateInvoicesRequest;
use App\Http\Requests\SaveFeeStructureRequest;
use App\Http\Requests\SaveStudentProfileRequest;
use App\Services\FeeService;
use Exception;
use Illuminate\Http\JsonResponse;

class FeeController extends Controller
{
    public function __construct(protected FeeService $feeService) {}

    /**
     * Set Class Level Default Fees
     */
    public function storeClassStructure(SaveFeeStructureRequest $request): JsonResponse
    {
        $this->feeService->saveClassFeeStructure(
            $request->validated('school_class_id'),
            $request->validated('session_year'),
            $request->validated('fees')
        );

        return response()->json(['message' => 'Class fee structure saved successfully.']);
    }

    /**
     * Set Principal Custom Discount / Student Personal Profile
     */
    public function storeStudentProfile(SaveStudentProfileRequest $request): JsonResponse
    {
        try {
            $profile = $this->feeService->saveStudentFeeProfile(
                studentId: $request->validated('student_id'),
                classId: $request->validated('school_class_id'),
                sessionYear: $request->validated('session_year'),
                baseMonthlyFee: (float) $request->validated('base_monthly_fee'),
                monthlyDiscount: (float) $request->validated('monthly_discount', 0),
                waiveAdmissionFee: $request->boolean('waive_admission_fee'),
                reason: $request->validated('discount_reason'),
                approvedById: auth()->id()
            );

            return response()->json([
                'message' => 'Student fee profile updated successfully.',
                'data'    => $profile,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Bulk Generate Monthly Invoices
     */
    public function generateInvoices(GenerateInvoicesRequest $request): JsonResponse
    {
        $count = $this->feeService->generateMonthlyInvoices(
            $request->validated('session_year'),
            $request->validated('month'),
            $request->validated('month_order'),
            $request->validated('issue_date'),
            $request->validated('due_date'),
            $request->validated('school_class_id'),
            $request->boolean('include_one_time')
        );

        return response()->json([
            'message'         => "Successfully generated {$count} invoices.",
            'generated_count' => $count,
        ]);
    }

    /**
     * Collect Single, Multi-Month, Partial, or Defaulter Lump-Sum Payment
     */
    public function collectPayment(CollectPaymentRequest $request)
    {
        $payment = $this->feeService->processPayment(
            $request->validated(),
            (int) (auth()->id() ?? 1)
        );

        return redirect()->back()->with('success', 'Payment processed and ledger updated successfully.');
    }

}
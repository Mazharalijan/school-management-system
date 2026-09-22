<?php

namespace App\Http\Controllers;

use App\Http\Requests\IssueSalaryAdvanceRequest;
use App\Http\Requests\ProcessSalarySettlementRequest;
use App\Services\StaffSalaryService;
use Illuminate\Http\RedirectResponse;

class StaffSalaryController extends Controller
{
    protected StaffSalaryService $salaryService;

    public function __construct(StaffSalaryService $salaryService)
    {
        $this->salaryService = $salaryService;
    }

    public function issueAdvance(IssueSalaryAdvanceRequest $request): RedirectResponse
    {
        $this->salaryService->issueAdvance($request->validated(), auth()->id()?? 1);

        return redirect()->back()->with('success', 'Advance salary payment issued successfully.');
    }

    public function processSettlement(ProcessSalarySettlementRequest $request): RedirectResponse
    {
        $this->salaryService->processSettlement($request->validated(), auth()->id());

        return redirect()->back()->with('success', 'Salary settlement completed successfully.');
    }
}

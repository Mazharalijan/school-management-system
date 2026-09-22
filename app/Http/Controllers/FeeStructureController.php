<?php

namespace App\Http\Controllers;

use App\Models\FeeHead;
use App\Models\FeeStructure;
use App\Models\SchoolClass;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class FeeStructureController extends Controller
{
    public function index(Request $request): Response
    {
        $sessionYear = $request->input('session_year', SystemSetting::first()?->current_session_year ?? date('Y'));
        $selectedClassId = $request->input('school_class_id');

        $classes = SchoolClass::active()->select('id', 'name')->get();
        $feeHeads = FeeHead::where('is_active', true)->select('id', 'title', 'type')->get();

        $structures = [];
        if ($selectedClassId) {
            $structures = FeeStructure::where('school_class_id', $selectedClassId)
                ->where('session_year', $sessionYear)
                ->get()
                ->keyBy('fee_head_id');
        }

        return Inertia::render('Fees/Structure/Index', [
            'classes' => $classes,
            'feeHeads' => $feeHeads,
            'structures' => $structures,
            'filters' => [
                'session_year' => $sessionYear,
                'school_class_id' => $selectedClassId,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'school_class_id' => 'required|exists:school_classes,id',
            'session_year' => 'required|string',
            'fees' => 'required|array',
            'fees.*.fee_head_id' => 'required|exists:fee_heads,id',
            'fees.*.amount' => 'required|numeric|min:0',
        ]);

        foreach ($validated['fees'] as $fee) {
            FeeStructure::updateOrCreate(
                [
                    'school_class_id' => $validated['school_class_id'],
                    'fee_head_id' => $fee['fee_head_id'],
                    'session_year' => $validated['session_year'],
                ],
                [
                    'amount' => $fee['amount'],
                ]
            );
        }

        return back()->with('success', 'Fee structure saved successfully.');
    }
}
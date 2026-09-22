<?php

namespace App\Http\Controllers;

use App\Models\FeeHead;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class FeeHeadController extends Controller
{
    public function index(): Response
    {
        $feeHeads = FeeHead::latest()->get();

        return Inertia::render('Fees/Heads/Index', [
            'feeHeads' => $feeHeads,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255|unique:fee_heads,title',
            'type' => 'required|in:recurring,one_time,optional',
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        FeeHead::create($validated);

        return back()->with('success', 'Fee head created successfully.');
    }

    public function update(Request $request, FeeHead $head): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255|unique:fee_heads,title,' . $head->id,
            'type' => 'required|in:recurring,one_time,optional',
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        $head->update($validated);

        return back()->with('success', 'Fee head updated successfully.');
    }

    public function destroy(FeeHead $head): RedirectResponse
    {
        if ($head->structures()->exists()) {
            return back()->with('error', 'Cannot delete a fee head assigned to a class structure.');
        }

        $head->delete();

        return back()->with('success', 'Fee head deleted successfully.');
    }
}
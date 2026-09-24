<?php

namespace App\Http\Controllers\Exam;

use App\Http\Controllers\Controller;
use App\Http\Requests\Exam\StoreExamSessionRequest;
use App\Models\ExamSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExamSessionController extends Controller
{
    public function index(Request $request): Response
    {
        $sessions = ExamSession::withCount('schedules')
            ->when($request->search, fn ($q) => $q->where('title', 'like', "%{$request->search}%"))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Exam/Sessions/Index', [
            'sessions' => $sessions,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(StoreExamSessionRequest $request): RedirectResponse
    {
        ExamSession::create($request->validated());

        return back()->with('success', 'Exam session created successfully.');
    }

    public function update(StoreExamSessionRequest $request, ExamSession $examSession): RedirectResponse
    {
        $examSession->update($request->validated());

        return back()->with('success', 'Exam session updated successfully.');
    }

    public function destroy(ExamSession $examSession): RedirectResponse
    {
        $examSession->delete();

        return back()->with('success', 'Exam session deleted successfully.');
    }
}

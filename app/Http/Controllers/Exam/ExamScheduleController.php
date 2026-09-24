<?php

namespace App\Http\Controllers\Exam;

use App\Http\Controllers\Controller;
use App\Http\Requests\Exam\StoreExamScheduleRequest;
use App\Models\ExamSchedule;
use App\Models\ExamSession;
use App\Models\SchoolClass;
use App\Models\Subject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExamScheduleController extends Controller
{
    public function index(Request $request): Response
    {
        $schedules = ExamSchedule::with(['examSession', 'schoolClass', 'subject'])
            ->when($request->exam_session_id, fn ($q) => $q->where('exam_session_id', $request->exam_session_id))
            ->when($request->school_class_id, fn ($q) => $q->where('school_class_id', $request->school_class_id))
            ->orderBy('exam_date')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Exam/Schedules/Index', [
            'schedules' => $schedules,
            'examSessions' => ExamSession::latest()->get(),
            'classes' => SchoolClass::all(),
            'subjects' => Subject::all(),
            'filters' => $request->only(['exam_session_id', 'school_class_id']),
        ]);
    }

    public function store(StoreExamScheduleRequest $request): RedirectResponse
    {
        ExamSchedule::create($request->validated());

        return back()->with('success', 'Exam schedule entry added successfully.');
    }

    public function update(StoreExamScheduleRequest $request, ExamSchedule $examSchedule): RedirectResponse
    {
        $examSchedule->update($request->validated());

        return back()->with('success', 'Exam schedule entry updated successfully.');
    }

    public function destroy(ExamSchedule $examSchedule): RedirectResponse
    {
        $examSchedule->delete();

        return back()->with('success', 'Exam schedule entry deleted successfully.');
    }
}

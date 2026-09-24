<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Services\StudentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    protected StudentService $studentService;

    public function __construct(StudentService $studentService)
    {
        $this->studentService = $studentService;
    }

    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'class_id', 'section_id', 'status']);
        $students = $this->studentService->getPaginatedStudents($filters);
        $classes = SchoolClass::with('sections')->get();

        return Inertia::render('Students/Index', [
            'students' => $students,
            'classes' => $classes,
            'filters' => $filters,
        ]);
    }

    public function store(StoreStudentRequest $request): RedirectResponse
    {
        $this->studentService->createStudent($request->validated());

        return redirect()->back()->with('success', 'Student admitted successfully.');
    }

    public function update(UpdateStudentRequest $request, Student $student): RedirectResponse
    {
        $this->studentService->updateStudent($student, $request->validated());

        return redirect()->back()->with('success', 'Student details updated successfully.');
    }

    public function destroy(Student $student): RedirectResponse
    {
        $student->delete();

        return redirect()->back()->with('success', 'Student record removed.');
    }
}

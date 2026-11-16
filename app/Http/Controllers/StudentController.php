<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Services\StudentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

    public function search(Request $request): JsonResponse
    {
        $term = trim((string) $request->query('q', ''));
        if (mb_strlen($term) < 1) {
            return response()->json([]);
        }

        $driver = DB::getDriverName();
        $concatSql = $driver === 'sqlite' ? "first_name || ' ' || last_name" : "CONCAT(first_name, ' ', last_name)";

        $students = Student::with([
            'current_enrollment.school_class',
            'current_enrollment.section',
            'enrollments.school_class',
            'enrollments.section',
            'feeProfile.items.feeHead',
            'invoices',
            'examResults.examSession',
            'examResults.schoolClass',
            'documentPrints.printLogs.printedBy',
        ])
            ->where(function ($q) use ($term, $concatSql) {
                $q->where('first_name', 'like', "%{$term}%")
                    ->orWhere('last_name', 'like', "%{$term}%")
                    ->orWhereRaw("{$concatSql} LIKE ?", ["%{$term}%"])
                    ->orWhere('roll_number', 'like', "%{$term}%")
                    ->orWhere('admission_number', 'like', "%{$term}%")
                    ->orWhere('guardian_name', 'like', "%{$term}%")
                    ->orWhere('guardian_phone', 'like', "%{$term}%")
                    ->orWhere('father_cnic', 'like', "%{$term}%")
                    ->orWhereHas('current_enrollment.school_class', fn ($cq) => $cq->where('name', 'like', "%{$term}%"))
                    ->orWhereHas('current_enrollment.section', fn ($sq) => $sq->where('name', 'like', "%{$term}%"));
            })
            ->take(10)
            ->get();

        return response()->json($students);
    }

    public function show(Student $student): JsonResponse
    {
        $student->load([
            'current_enrollment.school_class',
            'current_enrollment.section',
            'enrollments.school_class',
            'enrollments.section',
            'feeProfile.items.feeHead',
            'invoices',
            'examResults.examSession',
            'examResults.schoolClass',
            'documentPrints.printLogs.printedBy',
            'fines.imposedBy',
            'fines.collectedBy',
            'paperFees.examSession',
        ]);

        return response()->json($student);
    }
}

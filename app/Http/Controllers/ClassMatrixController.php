<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClassRequest;
use App\Http\Requests\StoreSectionRequest;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Services\ClassMatrixService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ClassMatrixController extends Controller
{
    public function __construct(
        protected ClassMatrixService $matrixService
    ) {}

    public function index(): Response
    {
        return Inertia::render('Classes/Index', [
            'matrix' => $this->matrixService->getClassMatrix(),
        ]);
    }

    public function storeClass(StoreClassRequest $request): RedirectResponse
    {
        $this->matrixService->createClassWithDefaultSection($request->validated());

        return redirect()->back()->with('success', 'Class created successfully with initial section.');
    }

    public function updateClass(StoreClassRequest $request, SchoolClass $class): RedirectResponse
    {
        $this->matrixService->updateClass($class, $request->validated());

        return redirect()->back()->with('success', 'Class details updated.');
    }

    public function storeSection(StoreSectionRequest $request): RedirectResponse
    {
        $this->matrixService->createSection($request->validated());

        return redirect()->back()->with('success', 'New section attached.');
    }

    public function updateSection(StoreSectionRequest $request, Section $section): RedirectResponse
    {
        $this->matrixService->updateSection($section, $request->validated());

        return redirect()->back()->with('success', 'Section updated.');
    }

    public function destroySection(Section $section): RedirectResponse
    {
        try {
            $this->matrixService->deleteSection($section);

            return redirect()->back()->with('success', 'Section removed.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function destroyClass(SchoolClass $class): RedirectResponse
    {
        try {
            // Prevent deletion if class has active students/sections
            if ($class->sections()->has('students')->exists()) {
                return redirect()->back()->withErrors(['error' => 'Cannot delete class with assigned students.']);
            }

            $class->sections()->delete();
            $class->delete();

            return redirect()->back()->with('success', 'Class removed successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}

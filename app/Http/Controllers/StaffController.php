<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStaffRequest;
use App\Http\Requests\UpdateStaffRequest;
use App\Models\Staff;
use App\Services\StaffService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StaffController extends Controller
{
    public function __construct(
        protected StaffService $staffService
    ) {}

    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'designation', 'status']);
        $perPage = $request->input('per_page', 10);

        $staffMembers = $this->staffService->getPaginatedStaff($filters, $perPage);

        return Inertia::render('Staff/Index', [
            'staff' => $staffMembers,
            'filters' => $filters,
            'designations' => [
                'Principal / Vice Principal' => 'Principal / Vice Principal',
                'Senior Teacher' => 'Senior Teacher',
                'Junior Teacher' => 'Junior Teacher',
                'Subject Specialist' => 'Subject Specialist',
                'Accountant' => 'Accountant',
                'Admin Support / Security' => 'Admin Support / Security',
            ],
            'statusOptions' => [
                'active' => 'Active',
                'inactive' => 'Inactive',
                'on_leave' => 'On Leave',
                'resigned' => 'Resigned',
                'terminated' => 'Terminated',
            ],
        ]);
    }

    public function store(StoreStaffRequest $request): RedirectResponse
    {
        $this->staffService->createStaff($request->validated());

        return redirect()->back()->with('success', 'Staff member created successfully.');
    }

    public function update(UpdateStaffRequest $request, Staff $staff): RedirectResponse
    {
        $this->staffService->updateStaff($staff, $request->validated());

        return redirect()->back()->with('success', 'Staff record updated successfully.');
    }

    public function destroy(Staff $staff): RedirectResponse
    {
        $staff->delete();

        return redirect()->back()->with('success', 'Staff member deleted successfully.');
    }
}
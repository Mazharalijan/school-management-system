<?php

namespace App\Services;

use App\Models\Staff;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class StaffService
{
    /**
     * Fetch paginated staff members with optional search filtering.
     */
    public function getPaginatedStaff(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Staff::query()
            // Eager load ledgers sorted by newest first
            ->with(['ledgers' => function ($q) {
                $q->orderBy('id', 'desc');
            }])
            // Calculate pending advance total directly in the SQL query
            ->withSum(['salaryAdvances as pending_advances_sum' => function ($q) {
                $q->where('status', 'pending_adjustment');
            }], 'amount');

        // Search across Name, Father Name, CNIC, Employee ID, Phone, and Email
        if (!empty($filters['search'])) {
            $search = $filters['search'];

            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                ->orWhere('last_name', 'like', "%{$search}%")
                ->orWhere('father_name', 'like', "%{$search}%")
                ->orWhere('cnic', 'like', "%{$search}%")
                ->orWhere('employee_id', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$search}%"]);
            });
        }

        // Filter by Designation
        if (!empty($filters['designation'])) {
            $query->where('designation', $filters['designation']);
        }

        // Filter by Status
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->latest()->paginate($perPage)->withQueryString();
    }

    /**
     * Create a new staff member and provision a linked system user account.
     */
    public function createStaff(array $data): Staff
    {
        return DB::transaction(function () use ($data) {
            $userId = null;

            // Provision login account if email is provided
            if (!empty($data['email'])) {
                $user = User::create([
                    'name' => "{$data['first_name']} {$data['last_name']}",
                    'email' => $data['email'],
                    'password' => Hash::make($data['password'] ?? 'Password123!'),
                    'role' => 'staff',
                ]);
                $userId = $user->id;
            }

            // Generate sequential Employee ID (e.g., EMP-2026-0001)
            $employeeId = $this->generateEmployeeId();

            return Staff::create(array_merge($data, [
                'user_id' => $userId,
                'employee_id' => $employeeId,
            ]));
        });
    }

    /**
     * Update staff record and sync linked user credentials.
     */
    public function updateStaff(Staff $staff, array $data): Staff
    {
        return DB::transaction(function () use ($staff, $data) {
            $staff->update($data);

            if ($staff->user_id && $staff->user) {
                $staff->user->update([
                    'name' => "{$staff->first_name} {$staff->last_name}",
                    'email' => $data['email'] ?? $staff->user->email,
                ]);
            }

            return $staff;
        });
    }

    /**
     * Generate unique sequential employee ID.
     */
    private function generateEmployeeId(): string
    {
        $year = date('Y');
        $lastStaff = Staff::withTrashed()
            ->where('employee_id', 'like', "EMP-{$year}-%")
            ->orderBy('id', 'desc')
            ->first();

        if (!$lastStaff) {
            return "EMP-{$year}-0001";
        }

        $lastNumber = (int) substr($lastStaff->employee_id, -4);
        $nextNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);

        return "EMP-{$year}-{$nextNumber}";
    }
}
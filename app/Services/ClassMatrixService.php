<?php

namespace App\Services;

use App\Models\SchoolClass;
use App\Models\Section;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class ClassMatrixService
{
    public function getClassMatrix(): Collection
    {
        return SchoolClass::with(['sections' => function ($query) {
            $query->orderBy('name');
        }])
        ->orderBy('numeric_value')
        ->get();
    }

    public function createClassWithDefaultSection(array $data): SchoolClass
    {
        return DB::transaction(function () use ($data) {
            $class = SchoolClass::create([
                'name' => $data['name'],
                'numeric_value' => $data['numeric_value'],
                'code' => $data['code'],
                'description' => $data['description'] ?? null,
            ]);

            // Guarantee that every created class has at least one Section (Rule 3 scaling)
            $class->sections()->create([
                'name' => $data['default_section_name'] ?? 'A',
                'capacity' => $data['capacity'] ?? 40,
                'room_number' => $data['room_number'] ?? null,
                'is_active' => true,
            ]);

            return $class->load('sections');
        });
    }

    public function updateClass(SchoolClass $class, array $data): SchoolClass
    {
        $class->update([
            'name' => $data['name'],
            'numeric_value' => $data['numeric_value'],
            'code' => $data['code'],
            'description' => $data['description'] ?? null,
        ]);

        return $class;
    }

    public function createSection(array $data): Section
    {
        return Section::create([
            'school_class_id' => $data['school_class_id'],
            'name' => strtoupper(trim($data['name'])),
            'capacity' => $data['capacity'] ?? 40,
            'room_number' => $data['room_number'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ]);
    }

    public function updateSection(Section $section, array $data): Section
    {
        $section->update([
            'name' => strtoupper(trim($data['name'])),
            'capacity' => $data['capacity'],
            'room_number' => $data['room_number'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ]);

        return $section;
    }

    public function deleteSection(Section $section): void
    {
        DB::transaction(function () use ($section) {
            $class = $section->schoolClass;
            
            // Prevent removing the last remaining section from a Class
            if ($class->sections()->count() <= 1) {
                throw new \Exception("Cannot delete the last remaining section of a class.");
            }

            $section->delete();
        });
    }
}
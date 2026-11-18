<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class SystemAndAcademicSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        DB::table('topics')->truncate();
        DB::table('chapters')->truncate();
        DB::table('subjects')->truncate();
        DB::table('sections')->truncate();
        DB::table('school_classes')->truncate();
        DB::table('system_settings')->truncate();
        Schema::enableForeignKeyConstraints();

        // 1. System Settings
        DB::table('system_settings')->insert([
            'id' => 1,
            'school_name' => 'Army Public School & College System',
            'school_tagline' => 'Excellence, Discipline & Character Building',
            'logo_path' => 'logos/aps_logo.png',
            'registration_number' => 'REG-2026-99481',
            'current_session_year' => '2026-2027',
            'currency_symbol' => 'Rs.',
            'currency_code' => 'PKR',
            'timezone' => 'Asia/Karachi',
            'date_format' => 'Y-m-d',
            'phone' => '+92-91-5550192',
            'alt_phone' => '+92-91-5550193',
            'email' => 'info@aps.edu.pk',
            'website' => 'https://aps.edu.pk',
            'address' => 'The Mall Road, Peshawar Cantt, Khyber Pakhtunkhwa',
            'invoice_prefix' => 'INV-',
            'receipt_footer_note' => 'Fees once deposited are non-refundable. Computer generated receipt.',
            'dashboard_theme' => 'shadcn',
            'theme_mode' => 'system',
            'include_fines_in_financial_flow' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Users (Admin + 15 Staff users)
        DB::table('users')->updateOrInsert(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'Master Administrator',
                'first_name' => 'Master',
                'last_name' => 'Admin',
                'password' => Hash::make('password123'),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        for ($i = 1; $i <= 15; $i++) {
            DB::table('users')->updateOrInsert(
                ['email' => "staff{$i}@school.edu.pk"],
                [
                    'name' => 'Staff Member '.$i,
                    'first_name' => 'Staff',
                    'last_name' => 'Member '.$i,
                    'password' => Hash::make('password123'),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        // 3. School Classes (Nursery, Prep, Grade 1 up to Grade 5 = 7 Classes)
        $classes = [
            ['name' => 'Nursery', 'numeric_value' => 0, 'code' => 'NUR', 'description' => 'Early Childhood Education - Nursery Class'],
            ['name' => 'Prep', 'numeric_value' => 1, 'code' => 'PREP', 'description' => 'Pre-Primary Preparatory Foundation Class'],
            ['name' => 'Grade 1', 'numeric_value' => 2, 'code' => 'G1', 'description' => 'Primary Level Academic Curriculum - Grade 1'],
            ['name' => 'Grade 2', 'numeric_value' => 3, 'code' => 'G2', 'description' => 'Primary Level Academic Curriculum - Grade 2'],
            ['name' => 'Grade 3', 'numeric_value' => 4, 'code' => 'G3', 'description' => 'Primary Level Academic Curriculum - Grade 3'],
            ['name' => 'Grade 4', 'numeric_value' => 5, 'code' => 'G4', 'description' => 'Primary Level Academic Curriculum - Grade 4'],
            ['name' => 'Grade 5', 'numeric_value' => 6, 'code' => 'G5', 'description' => 'Primary Level Academic Curriculum - Grade 5'],
        ];

        foreach ($classes as $idx => $cls) {
            DB::table('school_classes')->insert([
                'id' => $idx + 1,
                'name' => $cls['name'],
                'numeric_value' => $cls['numeric_value'],
                'code' => $cls['code'],
                'description' => $cls['description'],
                'is_full_time_teacher_class' => true,
                'class_teacher_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 4. Sections (Each class has Section A with 20 seats capacity)
        for ($classId = 1; $classId <= 7; $classId++) {
            DB::table('sections')->insert([
                'id' => $classId,
                'school_class_id' => $classId,
                'name' => 'A',
                'capacity' => 20,
                'room_number' => 'Room '.(100 + $classId),
                'is_active' => true,
                'is_full_time_teacher_class' => true,
                'class_teacher_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 5. Subjects (8 Core Primary Subjects)
        $subjectList = [
            ['id' => 1, 'name' => 'English'],
            ['id' => 2, 'name' => 'Urdu'],
            ['id' => 3, 'name' => 'Mathematics'],
            ['id' => 4, 'name' => 'General Science'],
            ['id' => 5, 'name' => 'Islamiyat'],
            ['id' => 6, 'name' => 'Social Studies'],
            ['id' => 7, 'name' => 'Computer Education'],
            ['id' => 8, 'name' => 'Nazira Quran & Ethics'],
        ];

        foreach ($subjectList as $sub) {
            DB::table('subjects')->insert([
                'id' => $sub['id'],
                'subject_name' => $sub['name'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 6. Chapters (Chapters across subjects & classes)
        $chapterId = 1;
        for ($subId = 1; $subId <= 8; $subId++) {
            for ($cId = 1; $cId <= 7; $cId++) {
                for ($chapNo = 1; $chapNo <= 4; $chapNo++) {
                    DB::table('chapters')->insert([
                        'id' => $chapterId,
                        'school_class_id' => $cId,
                        'subject_id' => $subId,
                        'chapter_name' => "Unit {$chapNo}: Fundamental Concepts in ".$subjectList[$subId - 1]['name'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    $chapterId++;
                }
            }
        }

        // 7. Topics
        $totalChapters = DB::table('chapters')->count();
        $topicId = 1;
        for ($chap = 1; $chap <= min($totalChapters, 60); $chap++) {
            for ($t = 1; $t <= 2; $t++) {
                DB::table('topics')->insert([
                    'id' => $topicId,
                    'chapter_id' => $chap,
                    'topic_name' => "Core Topic {$t} - Learning Objectives & Practice Exercises",
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $topicId++;
            }
        }
    }
}

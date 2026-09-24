<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SystemAndAcademicSeeder extends Seeder
{
    public function run(): void
    {
        // 1. System Settings
        DB::table('system_settings')->insert([
            'school_name' => 'Army Public School & College System',
            'school_tagline' => 'Excellence in Education',
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
            'address' => 'The Mall Road, Peshawar Cantt, Pakistan',
            'invoice_prefix' => 'INV-',
            'receipt_footer_note' => 'Thank you for timely payment. Computer generated receipt.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Users (Admin + Staff users)
        for ($i = 1; $i <= 12; $i++) {
            DB::table('users')->insert([
                // 'id' => $i,
                'name' => 'User '.$i,
                'email' => "user{$i}@school.edu.pk",
                'password' => Hash::make('password'),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 3. School Classes (10 Grades)
        $classes = [
            ['name' => 'Grade 1', 'numeric_value' => 1, 'code' => 'CLS-01'],
            ['name' => 'Grade 2', 'numeric_value' => 2, 'code' => 'CLS-02'],
            ['name' => 'Grade 3', 'numeric_value' => 3, 'code' => 'CLS-03'],
            ['name' => 'Grade 4', 'numeric_value' => 4, 'code' => 'CLS-04'],
            ['name' => 'Grade 5', 'numeric_value' => 5, 'code' => 'CLS-05'],
            ['name' => 'Grade 6', 'numeric_value' => 6, 'code' => 'CLS-06'],
            ['name' => 'Grade 7', 'numeric_value' => 7, 'code' => 'CLS-07'],
            ['name' => 'Grade 8', 'numeric_value' => 8, 'code' => 'CLS-08'],
            ['name' => 'Grade 9', 'numeric_value' => 9, 'code' => 'CLS-09'],
            ['name' => 'Grade 10', 'numeric_value' => 10, 'code' => 'CLS-10'],
        ];
        foreach ($classes as $cls) {
            DB::table('school_classes')->insert(array_merge($cls, [
                'description' => 'Standard academic curriculum for '.$cls['name'],
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // 4. Sections (20 sections across classes)
        $sectionNames = ['A', 'B'];
        for ($classId = 1; $classId <= 10; $classId++) {
            foreach ($sectionNames as $sName) {
                DB::table('sections')->insert([
                    'school_class_id' => $classId,
                    'name' => $sName,
                    'capacity' => 40,
                    'room_number' => 'Room '.($classId * 10 + ($sName == 'A' ? 1 : 2)),
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // 5. Subjects (10 Subjects)
        $subjectList = [
            'Mathematics', 'English Literature', 'Physics', 'Chemistry',
            'Biology', 'Computer Science', 'Urdu', 'Islamiyat',
            'Pakistan Studies', 'General Science',
        ];
        foreach ($subjectList as $subName) {
            DB::table('subjects')->insert([
                'subject_name' => $subName,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 6. Chapters (At least 10 chapters per subject across classes)
        for ($subId = 1; $subId <= 10; $subId++) {
            for ($chapNo = 1; $chapNo <= 10; $chapNo++) {
                $classId = (($chapNo - 1) % 10) + 1;
                DB::table('chapters')->insert([
                    'school_class_id' => $classId,
                    'subject_id' => $subId,
                    'chapter_name' => "Chapter {$chapNo}: Fundamental Principles of ".$subjectList[$subId - 1],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // 7. Topics (At least 10 topics per chapter)
        $chapterCount = DB::table('chapters')->count();
        for ($chapId = 1; $chapId <= $chapterCount; $chapId++) {
            for ($tNo = 1; $tNo <= 2; $tNo++) { // Generates 200 topics overall
                DB::table('topics')->insert([
                    'chapter_id' => $chapId,
                    'topic_name' => "Detailed Analysis Part {$tNo} for Chapter {$chapId}",
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}

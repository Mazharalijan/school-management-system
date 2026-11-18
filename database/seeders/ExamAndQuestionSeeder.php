<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ExamAndQuestionSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        DB::table('document_print_logs')->truncate();
        DB::table('student_document_prints')->truncate();
        DB::table('exam_paper_expenses')->truncate();
        DB::table('exam_paper_fees')->truncate();
        DB::table('exam_paper_section_questions')->truncate();
        DB::table('exam_paper_sections')->truncate();
        DB::table('exam_class_papers')->truncate();
        DB::table('exam_schedules')->truncate();
        DB::table('exam_results')->truncate();
        DB::table('student_marks')->truncate();
        DB::table('exam_sessions')->truncate();
        DB::table('question_banks')->truncate();
        Schema::enableForeignKeyConstraints();

        // ---------------------------------------------------------------------
        // 1. Question Bank (Sample Questions across 8 Subjects & 7 Classes)
        // ---------------------------------------------------------------------
        $subjects = DB::table('subjects')->get();
        $qTypes = ['mcq', 'short', 'long', 'letter', 'essay'];

        $sampleQuestions = [
            1 => [ // English
                ['q' => 'Choose the correct synonym of "Splendid": (A) Dull (B) Magnificent (C) Weak (D) Silent', 'type' => 'mcq', 'marks' => 2.00],
                ['q' => 'Write a short paragraph of 5 lines describing your favorite pet or personality.', 'type' => 'short', 'marks' => 5.00],
                ['q' => 'Write an application to the Principal requesting three days sick leave.', 'type' => 'letter', 'marks' => 10.00],
            ],
            2 => [ // Urdu
                ['q' => 'درج ذیل الفاظ کے متضاد لکھیں: بہار، زمین، محبت، اندھیرا', 'type' => 'short', 'marks' => 4.00],
                ['q' => 'نظم "حمد" کا بنیادی اور مرکزی خیال اپنے آسان الفاظ میں بیان کریں۔', 'type' => 'short', 'marks' => 6.00],
                ['q' => 'مضمون تحریر کریں: "وقت کی پابندی" یا "علم بڑی دولت ہے"', 'type' => 'essay', 'marks' => 10.00],
            ],
            3 => [ // Mathematics
                ['q' => 'Find the Lowest Common Multiple (LCM) of 12, 18, and 24 using prime factorisation.', 'type' => 'short', 'marks' => 5.00],
                ['q' => 'Solve the linear equation: 4(2x - 3) + 7 = 31', 'type' => 'short', 'marks' => 5.00],
                ['q' => 'Calculate the perimeter and area of a rectangular classroom measuring 18m by 12m.', 'type' => 'long', 'marks' => 8.00],
            ],
            4 => [ // General Science
                ['q' => 'Explain the fundamental stages of Photosynthesis in green plants with a labelled diagram.', 'type' => 'long', 'marks' => 8.00],
                ['q' => 'Differentiate clearly between Physical Changes and Chemical Changes with daily life examples.', 'type' => 'short', 'marks' => 5.00],
            ],
            5 => [ // Islamiyat
                ['q' => 'ارکانِ اسلام کے نام ترتیب کے ساتھ لکھیں اور نماز کے معاشرتی فوائد بیان کریں۔', 'type' => 'long', 'marks' => 8.00],
                ['q' => 'قرآن پاک کی فضیلت اور روزمرہ زندگی میں تلاوت کی اہمیت پر روشنی ڈالیں۔', 'type' => 'short', 'marks' => 5.00],
            ],
            6 => [ // Social Studies
                ['q' => 'Name the major geographical mountain ranges and rivers of Pakistan.', 'type' => 'short', 'marks' => 5.00],
                ['q' => 'What is the importance of traffic rules and civics in maintaining public safety?', 'type' => 'short', 'marks' => 5.00],
            ],
            7 => [ // Computer Education
                ['q' => 'Which of the following is an input device? (A) Monitor (B) Printer (C) Scanner (D) Speaker', 'type' => 'mcq', 'marks' => 2.00],
                ['q' => 'What is the primary role of the CPU and RAM inside a computer system?', 'type' => 'short', 'marks' => 5.00],
            ],
            8 => [ // Nazira Quran & Ethics
                ['q' => 'مخارج الحروف کی بنیادی اقسام اور تجوید کے ساتھ درست قراءت کی اہمیت بیان کریں۔', 'type' => 'short', 'marks' => 5.00],
            ],
        ];

        $qBankId = 1;
        for ($cId = 1; $cId <= 7; $cId++) {
            for ($subId = 1; $subId <= 8; $subId++) {
                $qTemplates = $sampleQuestions[$subId] ?? [
                    ['q' => "Sample Question for Subject {$subId}: Review fundamental concepts.", 'type' => 'short', 'marks' => 5.00],
                ];

                foreach ($qTemplates as $tmpl) {
                    DB::table('question_banks')->insert([
                        'id' => $qBankId++,
                        'school_class_id' => $cId,
                        'subject_id' => $subId,
                        'chapter_id' => null,
                        'topic_id' => null,
                        'question_type' => $tmpl['type'],
                        'question' => $tmpl['q'],
                        'default_marks' => $tmpl['marks'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        // ---------------------------------------------------------------------
        // 2. 6 Exam Sessions Across 2 Years (3 Terms per Year)
        // ---------------------------------------------------------------------
        $examSessions = [
            // Year 1 (2025-2026)
            [
                'id' => 1,
                'title' => 'First Term Examination 2025',
                'session_year' => '2025-2026',
                'start_date' => '2025-09-01',
                'end_date' => '2025-09-18',
                'status' => 'completed',
            ],
            [
                'id' => 2,
                'title' => 'Mid Term Examination 2025',
                'session_year' => '2025-2026',
                'start_date' => '2025-12-05',
                'end_date' => '2025-12-22',
                'status' => 'completed',
            ],
            [
                'id' => 3,
                'title' => 'Annual Examination 2026',
                'session_year' => '2025-2026',
                'start_date' => '2026-03-05',
                'end_date' => '2026-03-24',
                'status' => 'completed',
            ],
            // Year 2 (2026-2027)
            [
                'id' => 4,
                'title' => 'First Term Examination 2026',
                'session_year' => '2026-2027',
                'start_date' => '2026-09-01',
                'end_date' => '2026-09-18',
                'status' => 'completed',
            ],
            [
                'id' => 5,
                'title' => 'Mid Term Examination 2026',
                'session_year' => '2026-2027',
                'start_date' => '2026-12-05',
                'end_date' => '2026-12-22',
                'status' => 'published',
            ],
            [
                'id' => 6,
                'title' => 'Annual Examination 2027',
                'session_year' => '2026-2027',
                'start_date' => '2027-03-05',
                'end_date' => '2027-03-24',
                'status' => 'draft',
            ],
        ];

        foreach ($examSessions as $sess) {
            DB::table('exam_sessions')->insert(array_merge($sess, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // ---------------------------------------------------------------------
        // 3. Exam Schedules, Class Papers & Sections for All 7 Classes & 8 Subjects
        // ---------------------------------------------------------------------
        $subjectNames = [
            1 => 'English',
            2 => 'Urdu',
            3 => 'Mathematics',
            4 => 'General Science',
            5 => 'Islamiyat',
            6 => 'Social Studies',
            7 => 'Computer Education',
            8 => 'Nazira Quran & Ethics',
        ];

        $classNames = [
            1 => 'Nursery',
            2 => 'Prep',
            3 => 'Grade 1',
            4 => 'Grade 2',
            5 => 'Grade 3',
            6 => 'Grade 4',
            7 => 'Grade 5',
        ];

        // Seed schedules and papers across the 6 sessions
        foreach ($examSessions as $sess) {
            $sessId = $sess['id'];
            $startDate = Carbon::parse($sess['start_date']);

            for ($cId = 1; $cId <= 7; $cId++) {
                for ($subId = 1; $subId <= 8; $subId++) {
                    $examDate = $startDate->copy()->addDays($subId - 1)->format('Y-m-d');

                    // Schedule
                    $scheduleId = DB::table('exam_schedules')->insertGetId([
                        'exam_session_id' => $sessId,
                        'school_class_id' => $cId,
                        'subject_id' => $subId,
                        'exam_date' => $examDate,
                        'start_time' => '09:00:00',
                        'end_time' => '12:00:00',
                        'total_marks' => 100.00,
                        'passing_marks' => 40.00,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    // Class Paper
                    $paperId = DB::table('exam_class_papers')->insertGetId([
                        'exam_schedule_id' => $scheduleId,
                        'exam_session_id' => $sessId,
                        'school_class_id' => $cId,
                        'subject_id' => $subId,
                        'paper_title' => "{$classNames[$cId]} {$sess['title']} - {$subjectNames[$subId]}",
                        'total_marks' => 100.00,
                        'duration_minutes' => 150,
                        'instructions' => 'Read all questions carefully. Section A (Objective) is compulsory. Use blue or black ink only.',
                        'print_status' => $sessId <= 4 ? 'printed' : ($sessId === 5 ? 'queued' : 'pending'),
                        'total_copies_needed' => 25,
                        'total_copies_printed' => $sessId <= 4 ? 25 : 0,
                        'printed_at' => $sessId <= 4 ? $examDate.' 08:00:00' : null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    // Section A: Objective (40 marks)
                    $secA = DB::table('exam_paper_sections')->insertGetId([
                        'exam_class_paper_id' => $paperId,
                        'section_name' => 'A',
                        'title' => 'Objective & Multiple Choice Questions',
                        'total_marks' => 40.00,
                        'total_questions' => 20,
                        'question_type' => 'mcq',
                        'order' => 1,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    // Section B: Subjective (60 marks)
                    $secB = DB::table('exam_paper_sections')->insertGetId([
                        'exam_class_paper_id' => $paperId,
                        'section_name' => 'B',
                        'title' => 'Short & Conceptual Descriptive Answers',
                        'total_marks' => 60.00,
                        'total_questions' => 8,
                        'question_type' => 'short',
                        'order' => 2,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        // ---------------------------------------------------------------------
        // 4. Student Marks & Results Across Completed Sessions (1, 2, 3, 4)
        // ---------------------------------------------------------------------
        // In session 1, 2, 3 (2025-2026), students with tenure >= 1 year (IDs 1..75) participated.
        // In session 4 (2026-2027 First Term), all 100 students participated!

        $completedSessions = [
            1 => ['year' => '2025-2026', 'students' => range(1, 75)],
            2 => ['year' => '2025-2026', 'students' => range(1, 75)],
            3 => ['year' => '2025-2026', 'students' => range(1, 75)],
            4 => ['year' => '2026-2027', 'students' => range(1, 100)],
        ];

        foreach ($completedSessions as $sessId => $sConf) {
            $studentsInExam = $sConf['students'];

            // Group students by their enrolled class in this session
            $classGroups = [];
            foreach ($studentsInExam as $stId) {
                $enrollment = DB::table('student_enrollments')
                    ->where('student_id', $stId)
                    ->where('session_year', $sConf['year'])
                    ->first();

                $cId = $enrollment ? $enrollment->school_class_id : (int) ceil($stId / 14);
                $classGroups[$cId][] = $stId;
            }

            foreach ($classGroups as $cId => $classStudentIds) {
                $classResults = [];

                foreach ($classStudentIds as $stId) {
                    $totalObtained = 0.00;
                    $hasFailedSubject = false;
                    $isAbsentInAny = false;

                    for ($subId = 1; $subId <= 8; $subId++) {
                        // Deterministic pseudo-random variation based on student id and subject id
                        $seedFactor = (($stId * 7) + ($subId * 13) + ($sessId * 17)) % 100;

                        $isAbsent = ($seedFactor === 99 && $stId % 15 === 0);
                        if ($isAbsent) {
                            $obtained = 0.00;
                            $remarks = 'Absent on medical grounds';
                            $isAbsentInAny = true;
                        } else {
                            // Marks distribution between 45 and 98
                            $baseScore = 55 + (($stId * 3 + $subId * 5) % 40);
                            if ($stId % 8 === 0 && $subId === 3) {
                                // Specific student struggling in Mathematics
                                $baseScore = 32.00; // Fail in math
                                $hasFailedSubject = true;
                            }
                            $obtained = min(100.00, max(28.00, $baseScore));
                            $remarks = $obtained >= 80 ? 'Excellent performance' : ($obtained >= 60 ? 'Satisfactory' : 'Needs attention');
                        }

                        DB::table('student_marks')->insert([
                            'exam_session_id' => $sessId,
                            'school_class_id' => $cId,
                            'student_id' => $stId,
                            'subject_id' => $subId,
                            'obtained_marks' => $obtained,
                            'total_marks' => 100.00,
                            'is_absent' => $isAbsent,
                            'remarks' => $remarks,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);

                        $totalObtained += $obtained;
                    }

                    $totalMax = 800.00;
                    $pct = round(($totalObtained / $totalMax) * 100, 2);

                    if ($pct >= 85) {
                        $grade = 'A1';
                    } elseif ($pct >= 75) {
                        $grade = 'A';
                    } elseif ($pct >= 65) {
                        $grade = 'B';
                    } elseif ($pct >= 50) {
                        $grade = 'C';
                    } elseif ($pct >= 40) {
                        $grade = 'D';
                    } else {
                        $grade = 'F';
                    }

                    $status = ($pct >= 40 && ! $hasFailedSubject) ? 'pass' : 'fail';
                    if ($status === 'pass' && $sessId === 3) {
                        $status = 'promoted'; // Promoted at Annual exam
                    }

                    $classResults[] = [
                        'student_id' => $stId,
                        'class_id' => $cId,
                        'total_obtained' => $totalObtained,
                        'total_max' => $totalMax,
                        'percentage' => $pct,
                        'grade' => $grade,
                        'status' => $status,
                    ];
                }

                // Sort by total obtained marks descending to compute rank/position
                usort($classResults, fn ($a, $b) => $b['total_obtained'] <=> $a['total_obtained']);

                foreach ($classResults as $pos => $res) {
                    $rank = $pos + 1;
                    $teacherRemark = match (true) {
                        $rank === 1 => 'Brilliant top academic achievement. First position in class!',
                        $rank <= 3 => 'Excellent understanding and consistency across all subjects.',
                        $res['percentage'] >= 70 => 'Very good performance and steady effort throughout term.',
                        $res['percentage'] >= 50 => 'Promising results; extra practice recommended in numerical subjects.',
                        default => 'Special remedial support recommended for fundamental concepts.',
                    };

                    DB::table('exam_results')->insert([
                        'exam_session_id' => $sessId,
                        'school_class_id' => $res['class_id'],
                        'student_id' => $res['student_id'],
                        'total_obtained_marks' => $res['total_obtained'],
                        'total_max_marks' => $res['total_max'],
                        'percentage' => $res['percentage'],
                        'grade' => $res['grade'],
                        'status' => $res['status'],
                        'position_in_class' => $rank,
                        'teacher_remarks' => $teacherRemark,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        // ---------------------------------------------------------------------
        // 5. Paper Money Module: Paper Fees & Expenses (for Profit/Loss Flow)
        // ---------------------------------------------------------------------
        // Term Exam Paper Money collection per student: Rs. 500
        // Paper Expenses per session: Printing, Answer Reams, Composing, Stationery

        $paperReceiptSeq = 1001;

        foreach ($examSessions as $sess) {
            $sessId = $sess['id'];

            // Skip draft session 6 for paper collections
            if ($sessId === 6) {
                continue;
            }

            $studentsForThisSess = ($sessId <= 3) ? range(1, 75) : range(1, 100);

            // 1. Exam Paper Fees
            foreach ($studentsForThisSess as $stId) {
                $enrollment = DB::table('student_enrollments')
                    ->where('student_id', $stId)
                    ->where('session_year', $sess['session_year'])
                    ->first();
                $cId = $enrollment ? $enrollment->school_class_id : (int) ceil($stId / 14);

                $isPaid = ! ($stId % 14 === 0 && $sessId >= 4); // 95% paid
                $paidAmt = $isPaid ? 500.00 : 0.00;
                $payStatus = $isPaid ? 'paid' : 'unpaid';
                $receipt = $isPaid ? sprintf('PPR-%04d-%04d', substr($sess['start_date'], 0, 4), $paperReceiptSeq++) : null;
                $payMethod = ($stId % 2 === 0) ? 'cash' : (($stId % 3 === 0) ? 'online' : 'bank_transfer');

                DB::table('exam_paper_fees')->insert([
                    'exam_session_id' => $sessId,
                    'student_id' => $stId,
                    'school_class_id' => $cId,
                    'amount' => 500.00,
                    'paid_amount' => $paidAmt,
                    'status' => $payStatus,
                    'receipt_no' => $receipt,
                    'paid_date' => $isPaid ? Carbon::parse($sess['start_date'])->subDays(5)->format('Y-m-d') : null,
                    'payment_method' => $isPaid ? $payMethod : null,
                    'fee_invoice_id' => null,
                    'notes' => "Term paper and stationery fee for {$sess['title']}",
                    'created_by' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // 2. Exam Paper Expenses (4 - 5 expenses per term)
            $termExpDate = Carbon::parse($sess['start_date'])->subDays(10)->format('Y-m-d');
            $termExpenses = [
                [
                    'title' => "Master Stencil Printing & Offset Question Papers ({$sess['title']})",
                    'category' => 'printing',
                    'amount' => 12500.00,
                    'vendor_name' => 'Khyber Fast Print & Offset Printers',
                    'bill' => "PRN-OFF-{$sessId}01",
                    'notes' => 'Question papers printing for all classes with confidential watermark packaging.',
                ],
                [
                    'title' => 'Standard Lined Answer Booklets & Continuation Sheets (25 Reams)',
                    'category' => 'stationery',
                    'amount' => 8400.00,
                    'vendor_name' => 'Al-Rehman Paper Mart Saddar',
                    'bill' => "PAP-BKT-{$sessId}02",
                    'notes' => '80 GSM legal size answer sheets and 4-page continuation inserts.',
                ],
                [
                    'title' => 'Urdu & English Dual Script Computer Composing & Proofreading',
                    'category' => 'typing_composing',
                    'amount' => 4500.00,
                    'vendor_name' => 'Creative Graphics & Typesetting Hub',
                    'bill' => "TYP-CMP-{$sessId}03",
                    'notes' => 'Typesetting of InPage Urdu Nastaliq and English exam questions.',
                ],
                [
                    'title' => 'Exam Confidential Sealing Envelopes, Cloth Bags & Wax Seals',
                    'category' => 'stationery',
                    'amount' => 2800.00,
                    'vendor_name' => 'Pak Stationery Distributors',
                    'bill' => "STA-ENV-{$sessId}04",
                    'notes' => 'Sealed packet envelopes for invigilators and hall superintendents.',
                ],
                [
                    'title' => 'Evaluation Markers, Staplers, Pins & Hall Stationery Packets',
                    'category' => 'marking_evaluation',
                    'amount' => 2200.00,
                    'vendor_name' => 'Universal General Store',
                    'bill' => "MRK-STA-{$sessId}05",
                    'notes' => 'Red and green marking pens for teachers and staplers for hall tables.',
                ],
            ];

            foreach ($termExpenses as $tExp) {
                DB::table('exam_paper_expenses')->insert([
                    'exam_session_id' => $sessId,
                    'title' => $tExp['title'],
                    'category' => $tExp['category'],
                    'amount' => $tExp['amount'],
                    'expense_date' => $termExpDate,
                    'vendor_name' => $tExp['vendor_name'],
                    'invoice_bill_no' => $tExp['bill'],
                    'payment_method' => 'cash',
                    'notes' => $tExp['notes'],
                    'created_by' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // ---------------------------------------------------------------------
        // 6. Sample DMC Print Logs for Verification & History
        // ---------------------------------------------------------------------
        $sampleDmcStudents = [
            ['student_id' => 1,  'exam_session_id' => 4, 'doc_no' => 'DMC-2026-0001', 'title' => 'DMC - Muhammad Ayaan Khan - First Term 2026'],
            ['student_id' => 18, 'exam_session_id' => 4, 'doc_no' => 'DMC-2026-0018', 'title' => 'DMC - Seema Bibi - First Term 2026'],
            ['student_id' => 29, 'exam_session_id' => 4, 'doc_no' => 'DMC-2026-0029', 'title' => 'DMC - Muhammad Musa Khattak - First Term 2026'],
            ['student_id' => 44, 'exam_session_id' => 4, 'doc_no' => 'DMC-2026-0044', 'title' => 'DMC - Muhammad Ibrahim Tariq - First Term 2026'],
            ['student_id' => 87, 'exam_session_id' => 4, 'doc_no' => 'DMC-2026-0087', 'title' => 'DMC - Muhammad Ahmed Siddiqui - First Term 2026'],
        ];

        foreach ($sampleDmcStudents as $dmc) {
            $examResult = DB::table('exam_results')
                ->where('student_id', $dmc['student_id'])
                ->where('exam_session_id', $dmc['exam_session_id'])
                ->first();

            $printId = DB::table('student_document_prints')->insertGetId([
                'student_id' => $dmc['student_id'],
                'document_type' => 'dmc',
                'sub_type' => 'dmc_term',
                'document_number' => $dmc['doc_no'],
                'title' => $dmc['title'],
                'exam_session_id' => $dmc['exam_session_id'],
                'exam_result_id' => $examResult ? $examResult->id : null,
                'issue_date' => '2026-09-25',
                'metadata' => json_encode(['paper_format' => 'A4', 'print_watermark' => true]),
                'print_count' => 1,
                'last_printed_at' => Carbon::parse('2026-09-26 11:30:00'),
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('document_print_logs')->insert([
                'student_document_print_id' => $printId,
                'print_number' => 1,
                'printer_type' => 'standard',
                'copy_label' => 'ORIGINAL',
                'printed_by' => 1,
                'printed_at' => Carbon::parse('2026-09-26 11:30:00'),
                'notes' => 'Official term report card issued to guardian at parent-teacher meeting.',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}

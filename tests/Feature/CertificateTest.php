<?php

namespace Tests\Feature;

use App\Models\ExamResult;
use App\Models\ExamSession;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Student;
use App\Models\StudentDocumentPrint;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CertificateTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected Student $student;

    protected SchoolClass $class;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        $this->class = SchoolClass::create([
            'name' => 'Grade 10',
            'numeric_value' => 10,
            'code' => 'G10',
        ]);

        $section = Section::create([
            'school_class_id' => $this->class->id,
            'name' => 'A',
            'capacity' => 30,
        ]);

        $this->student = Student::create([
            'admission_number' => 'ADM-2026-101',
            'roll_number' => '101',
            'first_name' => 'Hamza',
            'last_name' => 'Khan',
            'gender' => 'male',
            'date_of_birth' => '2010-06-01',
            'guardian_name' => 'Tariq Khan',
            'guardian_relation' => 'Father',
            'guardian_phone' => '03001234567',
            'father_cnic' => '35201-1234567-1',
            'admission_date' => '2026-01-01',
            'status' => 'active',
        ]);
    }

    public function test_can_issue_new_certificate_with_initial_print_count(): void
    {
        $payload = [
            'student_id' => $this->student->id,
            'sub_type' => 'character',
            'issue_date' => '2026-11-16',
            'conduct' => 'Exemplary',
            'reason' => 'College Admission',
            'remarks' => 'Outstanding academic conduct.',
        ];

        $response = $this->actingAs($this->user)->post(route('certificates.store'), $payload);
        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $this->assertDatabaseHas('student_document_prints', [
            'student_id' => $this->student->id,
            'document_type' => 'certificate',
            'sub_type' => 'character',
            'print_count' => 1,
        ]);

        $cert = StudentDocumentPrint::where('student_id', $this->student->id)->first();
        $this->assertEquals('ORIGINAL', $cert->copy_label);
        $this->assertCount(1, $cert->printLogs);
        $this->assertEquals('ORIGINAL', $cert->printLogs->first()->copy_label);
    }

    public function test_can_record_multiple_prints_and_increment_count(): void
    {
        $cert = StudentDocumentPrint::create([
            'student_id' => $this->student->id,
            'document_type' => 'certificate',
            'sub_type' => 'leaving',
            'document_number' => 'SLC-2026-0001',
            'title' => 'School Leaving Certificate',
            'issue_date' => '2026-11-16',
            'print_count' => 1,
            'created_by' => $this->user->id,
        ]);

        // First print log
        $cert->printLogs()->create([
            'print_number' => 1,
            'printer_type' => 'standard',
            'copy_label' => 'ORIGINAL',
            'printed_by' => $this->user->id,
            'printed_at' => now(),
        ]);

        // 2nd Print (Duplicate)
        $printResponse2 = $this->actingAs($this->user)->postJson(route('certificates.record-print', $cert->id), [
            'printer_type' => 'standard',
            'notes' => 'Duplicate copy requested by parent',
        ]);

        $printResponse2->assertOk();
        $this->assertEquals(2, $printResponse2->json('print_count'));
        $this->assertEquals('DUPLICATE (Copy #2)', $printResponse2->json('copy_label'));

        // 3rd Print (Triplicate)
        $printResponse3 = $this->actingAs($this->user)->postJson(route('certificates.record-print', $cert->id), [
            'printer_type' => 'standard',
            'notes' => 'Third copy',
        ]);

        $printResponse3->assertOk();
        $this->assertEquals(3, $printResponse3->json('print_count'));
        $this->assertEquals('TRIPLICATE (Copy #3)', $printResponse3->json('copy_label'));

        $cert->refresh();
        $this->assertEquals(3, $cert->print_count);
        $this->assertCount(3, $cert->printLogs);
    }

    public function test_can_record_dmc_print_and_increment_count(): void
    {
        $session = ExamSession::create([
            'title' => 'Annual Exam 2026',
            'session_year' => '2026-2027',
            'start_date' => '2026-10-01',
            'end_date' => '2026-10-15',
            'status' => 'published',
        ]);

        $result = ExamResult::create([
            'exam_session_id' => $session->id,
            'school_class_id' => $this->class->id,
            'student_id' => $this->student->id,
            'total_obtained_marks' => 450,
            'total_max_marks' => 500,
            'percentage' => 90.00,
            'grade' => 'A+',
            'status' => 'pass',
            'position_in_class' => 1,
        ]);

        // First DMC Print
        $response1 = $this->actingAs($this->user)->postJson(route('marks.dmc.print', $result->id), [
            'printer_type' => 'standard',
        ]);

        $response1->assertOk();
        $this->assertEquals(1, $response1->json('print_count'));
        $this->assertEquals('ORIGINAL', $response1->json('copy_label'));

        // Second DMC Print
        $response2 = $this->actingAs($this->user)->postJson(route('marks.dmc.print', $result->id), [
            'printer_type' => 'standard',
        ]);

        $response2->assertOk();
        $this->assertEquals(2, $response2->json('print_count'));
        $this->assertEquals('DUPLICATE (Copy #2)', $response2->json('copy_label'));
    }

    public function test_can_list_and_delete_certificates(): void
    {
        $cert = StudentDocumentPrint::create([
            'student_id' => $this->student->id,
            'document_type' => 'certificate',
            'sub_type' => 'bonafide',
            'document_number' => 'BON-2026-0001',
            'title' => 'Bonafide Certificate',
            'issue_date' => '2026-11-16',
            'print_count' => 1,
        ]);

        $response = $this->actingAs($this->user)->get(route('certificates.index'));
        $response->assertOk();

        $delResponse = $this->actingAs($this->user)->delete(route('certificates.destroy', $cert->id));
        $delResponse->assertRedirect();

        $this->assertDatabaseMissing('student_document_prints', [
            'id' => $cert->id,
        ]);
    }
}

<?php

use App\Http\Controllers\ClassMatrixController;
use App\Http\Controllers\Exam\ExamClassPaperController;
use App\Http\Controllers\Exam\ExamPaperController;
use App\Http\Controllers\Exam\ExamScheduleController;
use App\Http\Controllers\Exam\ExamSessionController;
use App\Http\Controllers\Exam\StudentMarkController;
use App\Http\Controllers\FeeController;
use App\Http\Controllers\FeeHeadController;
use App\Http\Controllers\FeeInvoiceController;
use App\Http\Controllers\FeeStructureController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\QuestionBankController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\StaffSalaryController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SystemSettingController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Dashboard');
});

// --- Class Matrix Routes ---
Route::get('/classes', [ClassMatrixController::class, 'index'])->name('classes.index');
Route::post('/classes', [ClassMatrixController::class, 'storeClass'])->name('classes.store');
Route::put('/classes/{class}', [ClassMatrixController::class, 'updateClass'])->name('classes.update');
Route::delete('/classes/{class}', [ClassMatrixController::class, 'destroyClass'])->name('classes.destroy');

Route::post('/sections', [ClassMatrixController::class, 'storeSection'])->name('sections.store');
Route::put('/sections/{section}', [ClassMatrixController::class, 'updateSection'])->name('sections.update');
Route::delete('/sections/{section}', [ClassMatrixController::class, 'destroySection'])->name('sections.destroy');

// --- Student & Staff Routes ---
Route::resource('students', StudentController::class);
Route::resource('staff', StaffController::class)->except(['create', 'edit', 'show']);

// --- System Settings Routes ---
Route::get('/settings', [SystemSettingController::class, 'edit'])->name('settings.edit');
Route::post('/settings', [SystemSettingController::class, 'update'])->name('settings.update');

// --- Fee Management Routes ---
Route::prefix('fees')->name('fees.')->group(function () {
    // Fee Heads
    Route::resource('heads', FeeHeadController::class)->except(['create', 'edit', 'show']);

    // Class Fee Structure Setup
    Route::get('structure', [FeeStructureController::class, 'index'])->name('structure.index');
    Route::post('structure', [FeeStructureController::class, 'store'])->name('structure.store');

    // Invoices & Voucher Generation
    Route::get('invoices', [FeeInvoiceController::class, 'index'])->name('invoices.index');
    Route::post('invoices/generate', [FeeInvoiceController::class, 'generate'])->name('invoices.generate');
    Route::get('invoices/{invoice}', [FeeInvoiceController::class, 'show'])->name('invoices.show');
    Route::post('invoices/{invoice}/collect', [FeeInvoiceController::class, 'collectPayment'])->name('invoices.collect');

    // Additional Fee Configurations
    Route::post('/class-structure', [FeeController::class, 'storeClassStructure'])->name('class-structure.store');
    Route::post('/student-profile', [FeeController::class, 'storeStudentProfile'])->name('student-profile.store');
    Route::post('/payments/collect', [FeeController::class, 'collectPayment'])->name('payments.collect');
});

// --- Staff Salary Routes ---
Route::post('/staff/salary/advance', [StaffSalaryController::class, 'issueAdvance'])->name('staff.salary.advance');
Route::post('/staff/salary/settlement', [StaffSalaryController::class, 'processSettlement'])->name('staff.salary.settlement');

// --- Inventory Routes ---
Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory.index');
Route::post('/inventory/items', [InventoryController::class, 'store'])->name('inventory.items.store');
Route::post('/inventory/allocate', [InventoryController::class, 'allocate'])->name('inventory.allocate');
Route::post('/inventory/return/{id}', [InventoryController::class, 'returnAsset'])->name('inventory.return');
Route::post('/inventory/report-damaged', [InventoryController::class, 'reportDamaged'])->name('inventory.report-damaged');

// --- Question Bank & Hierarchy Routes ---
Route::prefix('question-bank')->name('question-bank.')->group(function () {
    Route::get('/', [QuestionBankController::class, 'index'])->name('index');
    Route::get('/create', [QuestionBankController::class, 'create'])->name('create');
    Route::post('/', [QuestionBankController::class, 'store'])->name('store');
    Route::post('/batch', [QuestionBankController::class, 'storeBatch'])->name('batch.store');
    Route::get('/{questionBank}', [QuestionBankController::class, 'show'])->name('show');
    Route::get('/{questionBank}/edit', [QuestionBankController::class, 'edit'])->name('edit');
    Route::put('/{questionBank}', [QuestionBankController::class, 'update'])->name('update');
    Route::delete('/{questionBank}', [QuestionBankController::class, 'destroy'])->name('destroy');

    // Subjects CRUD
    Route::post('/subjects', [QuestionBankController::class, 'storeSubject'])->name('subjects.store');
    Route::put('/subjects/{subject}', [QuestionBankController::class, 'updateSubject'])->name('subjects.update');
    Route::delete('/subjects/{subject}', [QuestionBankController::class, 'destroySubject'])->name('subjects.destroy');

    // Chapters CRUD
    Route::post('/chapters', [QuestionBankController::class, 'storeChapter'])->name('chapters.store');
    Route::put('/chapters/{chapter}', [QuestionBankController::class, 'updateChapter'])->name('chapters.update');
    Route::delete('/chapters/{chapter}', [QuestionBankController::class, 'destroyChapter'])->name('chapters.destroy');

    // Topics CRUD
    Route::post('/topics', [QuestionBankController::class, 'storeTopic'])->name('topics.store');
    Route::put('/topics/{topic}', [QuestionBankController::class, 'updateTopic'])->name('topics.update');
    Route::delete('/topics/{topic}', [QuestionBankController::class, 'destroyTopic'])->name('topics.destroy');

    // AJAX Dependent Dropdown Helpers
    Route::get('/ajax/subjects/{subject}/chapters', [QuestionBankController::class, 'getChapters'])->name('ajax.chapters');
    Route::get('/ajax/chapters/{chapter}/topics', [QuestionBankController::class, 'getTopics'])->name('ajax.topics');
});

// --- Exam Class Papers & Printing Management Routes ---
Route::resource('exam-class-papers', ExamClassPaperController::class);

Route::prefix('exam-class-papers')->name('exam-class-papers.')->group(function () {
    // Print Views & Bulk Printing
    Route::get('/bulk-print', [ExamClassPaperController::class, 'bulkPrint'])->name('bulk-print');
    Route::post('/mark-printed', [ExamClassPaperController::class, 'markPrinted'])->name('mark-printed');
    Route::get('/{examClassPaper}/print-single', [ExamClassPaperController::class, 'printSingle'])->name('print-single');

    // Section Management under Paper context
    Route::post('/{examClassPaper}/sections', [ExamClassPaperController::class, 'storeSection'])->name('sections.store');
});

// Flat Section Management Alias Route
Route::post('paper/sections', [ExamClassPaperController::class, 'storeSection'])->name('paper.sections.store');

// --- Exam Paper Sections & Questions Management Routes ---
Route::prefix('exam-paper-sections/{section}')->name('exam-paper-sections.')->group(function () {
    Route::put('/', [ExamClassPaperController::class, 'updateSection'])->name('update');
    Route::delete('/', [ExamClassPaperController::class, 'destroySection'])->name('destroy');

    // Section Questions Management
    Route::post('/questions', [ExamClassPaperController::class, 'storeSectionQuestion'])->name('questions.store');
});

Route::prefix('exam-paper-section-questions/{sectionQuestion}')->name('exam-paper-section-questions.')->group(function () {
    Route::put('/', [ExamClassPaperController::class, 'updateSectionQuestion'])->name('update');
    Route::delete('/', [ExamClassPaperController::class, 'destroySectionQuestion'])->name('destroy');
});
Route::get('/exam-class-papers/{exam_class_paper}/preview', [ExamClassPaperController::class, 'preview'])
        ->name('exam-class-papers.preview');

// --- Exam Sessions & Schedules Routes ---
Route::resource('sessions', ExamSessionController::class)->except(['create', 'edit', 'show']);
Route::resource('schedules', ExamScheduleController::class)->except(['create', 'edit', 'show']);

// --- Question Papers Legacy Routes ---
Route::resource('papers', ExamPaperController::class);
Route::patch('papers/{examPaper}/print-status', [ExamPaperController::class, 'updatePrintStatus'])
    ->name('papers.update-print-status');

// --- Marks Entry, Processing & DMC Routes ---
Route::get('marks/entry', [StudentMarkController::class, 'entryForm'])->name('marks.entry');
Route::post('marks/bulk-store', [StudentMarkController::class, 'storeBulkMarks'])->name('marks.bulk-store');
Route::post('marks/process-results', [StudentMarkController::class, 'processResults'])->name('marks.process-results');
Route::get('marks/dmc/{examResult}', [StudentMarkController::class, 'dmcView'])->name('marks.dmc');

Route::middleware(['auth', 'verified'])->group(function () {
    // Authenticated routes can be grouped here as required
});
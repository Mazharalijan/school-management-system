<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Fee Types / Categories (e.g., Tuition, Admission, Exam, Bus)
        Schema::create('fee_heads', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // e.g., "Monthly Tuition Fee", "Admission Fee"
            $table->enum('type', ['recurring', 'one_time', 'optional'])->default('recurring');
            $table->string('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Default Class Fee Structure (Session-level class defaults set by Admin)
        Schema::create('fee_structures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_class_id')->constrained('school_classes')->cascadeOnDelete();
            $table->foreignId('fee_head_id')->constrained('fee_heads')->cascadeOnDelete();
            $table->decimal('amount', 10, 2)->default(0.00);
            $table->string('session_year'); // e.g., "2026-2027"
            $table->timestamps();

            $table->unique(['school_class_id', 'fee_head_id', 'session_year'], 'class_fee_session_unique');
        });

        // 3. Student Personal Fee Profiles (Customized agreed fees & discounts set by Principal)
        Schema::create('student_fee_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignId('school_class_id')->constrained('school_classes')->cascadeOnDelete();
            $table->string('session_year'); // e.g., "2026-2027"

            // Fee calculations
            $table->decimal('base_monthly_fee', 10, 2)->default(0);
            $table->decimal('monthly_discount', 10, 2)->default(0);
            $table->decimal('net_monthly_fee', 10, 2)->default(0);
            $table->boolean('waive_admission_fee')->default(false);

            // Approval & locking
            $table->text('discount_reason')->nullable(); // e.g., "Principal Concession / Sibling Discount"
            $table->boolean('is_locked')->default(false);
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            $table->unique(['student_id', 'session_year'], 'student_session_fee_unique');
        });

        // 4. Student Personal Fee Items Breakdown (Per-head custom amounts per student)
        Schema::create('student_fee_profile_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_fee_profile_id')->constrained('student_fee_profiles')->cascadeOnDelete();
            $table->foreignId('fee_head_id')->constrained('fee_heads')->cascadeOnDelete();
            $table->decimal('amount', 10, 2)->default(0.00); // Specific customized amount for this student
            $table->timestamps();

            $table->unique(['student_fee_profile_id', 'fee_head_id'], 'student_profile_head_unique');
        });

        // 5. Fee Invoices / Vouchers (Issued to individual students)
        Schema::create('fee_invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_no')->unique()->index(); // e.g., "INV-202609-0001"
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignId('school_class_id')->constrained('school_classes')->cascadeOnDelete();
            $table->foreignId('section_id')->nullable()->constrained('sections')->nullOnDelete();

            $table->string('month'); // e.g., "September"
            $table->integer('month_order'); // 1 to 12 (used to sort multi-month arrears sequentially)
            $table->string('session_year'); // e.g., "2026-2027"
            $table->date('issue_date');
            $table->date('due_date');

            $table->decimal('subtotal', 10, 2)->default(0.00); // Current month charges
            $table->decimal('previous_arrears', 10, 2)->default(0.00); // Unpaid balance brought forward
            $table->decimal('discount', 10, 2)->default(0.00);
            $table->decimal('fine', 10, 2)->default(0.00);
            $table->decimal('total_amount', 10, 2)->default(0.00); // (Subtotal + Previous Arrears + Fine) - Discount
            $table->decimal('paid_amount', 10, 2)->default(0.00);
            $table->decimal('due_amount', 10, 2)->default(0.00); // total_amount - paid_amount

            $table->enum('status', ['unpaid', 'partially_paid', 'paid', 'overdue'])->default('unpaid');
            $table->text('remarks')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // 6. Invoice Line Items Breakdown
        Schema::create('fee_invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fee_invoice_id')->constrained('fee_invoices')->cascadeOnDelete();
            $table->foreignId('fee_head_id')->nullable()->constrained('fee_heads')->nullOnDelete();
            $table->string('title'); // e.g. "Monthly Tuition Fee"
            $table->decimal('amount', 10, 2);
            $table->timestamps();
        });

        // 7. Payment Receipts Ledger
        Schema::create('fee_payments', function (Blueprint $table) {
            $table->id();
            $table->string('receipt_no')->unique()->index(); // e.g., "REC-2026-0001"
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignId('received_by')->nullable()->constrained('users')->nullOnDelete();

            $table->decimal('amount_paid', 10, 2);
            $table->date('payment_date');
            $table->enum('payment_method', ['cash', 'bank_transfer', 'cheque', 'online'])->default('cash');
            $table->string('transaction_reference')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
        });

        // 8. Payment-to-Invoice Allocation Pivot (Handles multi-month & partial payments)
        Schema::create('fee_invoice_payment', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fee_invoice_id')->constrained('fee_invoices')->cascadeOnDelete();
            $table->foreignId('fee_payment_id')->constrained('fee_payments')->cascadeOnDelete();
            $table->decimal('amount_allocated', 10, 2); // Exact portion of receipt spent on this invoice
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fee_invoice_payment');
        Schema::dropIfExists('fee_payments');
        Schema::dropIfExists('fee_invoice_items');
        Schema::dropIfExists('fee_invoices');
        Schema::dropIfExists('student_fee_profile_items');
        Schema::dropIfExists('student_fee_profiles');
        Schema::dropIfExists('fee_structures');
        Schema::dropIfExists('fee_heads');
    }
};

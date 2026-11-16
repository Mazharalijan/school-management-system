<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('student_fines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignId('school_class_id')->nullable()->constrained('school_classes')->nullOnDelete();
            $table->string('fine_type'); // 'leave', 'exam', 'test', 'discipline', 'other'
            $table->string('collection_mode')->default('on_the_spot'); // 'on_the_spot', 'monthly', 'year_end'
            $table->decimal('amount', 10, 2);
            $table->decimal('paid_amount', 10, 2)->default(0.00);
            $table->string('reason');
            $table->date('fine_date');
            $table->string('status')->default('unpaid'); // 'unpaid', 'paid', 'waived', 'invoiced'
            $table->string('receipt_no')->nullable()->index();
            $table->date('paid_date')->nullable();
            $table->string('payment_method')->nullable();
            $table->foreignId('fee_invoice_id')->nullable()->constrained('fee_invoices')->nullOnDelete();
            $table->string('waived_reason')->nullable();
            $table->foreignId('imposed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('collected_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_fines');
    }
};

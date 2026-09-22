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
        Schema::create('staff_salary_advances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id')->constrained('staff')->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->date('issued_date');
            $table->enum('status', ['pending_adjustment', 'adjusted', 'cancelled'])->default('pending_adjustment');
            $table->string('reason')->nullable();
            $table->foreignId('issued_by')->constrained('users');
            $table->timestamps();
        });

        Schema::create('staff_salary_settlements', function (Blueprint $table) {
                $table->id();
                $table->foreignId('staff_id')->constrained('staff')->onDelete('cascade');
                $table->string('voucher_no')->unique(); // e.g., SAL-2026-09-001
                $table->enum('settlement_type', ['monthly', 'resignation_prorated', 'advance_payout']);
                $table->string('month_year')->nullable(); // e.g. "2026-09"
                $table->decimal('base_salary', 10, 2);
                
                // Prorated & Leave Fields
                $table->integer('worked_days')->nullable();
                $table->integer('total_days_in_month')->nullable();
                $table->integer('unpaid_leaves')->default(0);
                $table->boolean('apply_leave_cutoff')->default(false);
                $table->decimal('leave_cutoff_amount', 10, 2)->default(0);
                
                // Deductions & Payout calculations
                $table->decimal('advance_adjusted', 10, 2)->default(0);
                $table->decimal('gross_payable', 10, 2);
                $table->decimal('net_paid', 10, 2);
                
                $table->enum('payment_method', ['cash', 'bank_transfer', 'cheque'])->default('cash');
                $table->string('reference_no')->nullable();
                $table->date('payment_date');
                $table->foreignId('processed_by')->constrained('users');
                $table->text('notes')->nullable();
                $table->timestamps();
            });

            Schema::create('staff_ledgers', function (Blueprint $table) {
                $table->id();
                $table->foreignId('staff_id')->constrained('staff')->onDelete('cascade');
                $table->date('transaction_date');
                $table->string('description');
                $table->enum('type', ['credit', 'debit']); // Debit = Advance/Payout given to staff, Credit = Earned Salary
                $table->decimal('amount', 10, 2);
                $table->decimal('balance', 10, 2); // Running balance
                $table->nullableMorphs('reference'); // Dynamic link to advances or settlements
                $table->timestamps();
            });
    }
  
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff_salary_advances');
        Schema::dropIfExists('staff_salary_settlements');
        Schema::dropIfExists('staff_ledgers');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('staff', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            // Identification & Personal Info
            $table->string('employee_id')->nullable()->unique()->index();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('father_name');
            $table->string('cnic', 15)->unique()->index(); // Accommodates XXXXX-XXXXXXX-X format

            // Employment & Roles
            $table->string('designation'); // e.g., "Principal / Vice Principal", "Senior Teacher"
            $table->enum('gender', ['male', 'female', 'other']);
            $table->date('date_of_birth');
            $table->date('joining_date');

            // Academic & Skills
            $table->string('qualification'); // e.g., "BS (4-Year Program)", "MS / M.Phil"
            $table->json('skills')->nullable(); // Stores array of selected certificates/diplomas

            // Contact Information
            $table->string('phone')->index();
            $table->string('email')->unique();
            $table->text('address')->nullable();

            // Financial & Status
            $table->decimal('salary', 10, 2)->default(0.00);
            $table->enum('status', ['active', 'inactive', 'on_leave', 'resigned', 'terminated'])->default('active');

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff');
    }
};

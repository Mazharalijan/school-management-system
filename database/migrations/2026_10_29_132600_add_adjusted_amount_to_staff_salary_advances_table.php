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
        Schema::table('staff_salary_advances', function (Blueprint $table) {
            $table->decimal('adjusted_amount', 10, 2)->default(0)->after('amount');
            $table->string('status', 30)->default('pending_adjustment')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('staff_salary_advances', function (Blueprint $table) {
            $table->dropColumn('adjusted_amount');
            $table->enum('status', ['pending_adjustment', 'adjusted', 'cancelled'])->default('pending_adjustment')->change();
        });
    }
};

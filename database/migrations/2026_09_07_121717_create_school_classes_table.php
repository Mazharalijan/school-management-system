<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('school_classes', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., Grade 1, Grade 5, Grade 8, Grade 10
            $table->integer('numeric_value')->index(); // 1, 2, ..., 5, 8, 10 for sorting/promotion logic
            $table->string('code')->unique(); // e.g., CLS-01, CLS-05
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('school_classes');
    }
};

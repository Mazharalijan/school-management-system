<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_class_id')->constrained('school_classes')->cascadeOnDelete();
            $table->string('name'); // e.g., "A", "B", "Rose", "Tulip"
            $table->integer('capacity')->default(40);
            $table->string('room_number')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['school_class_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sections');
    }
};
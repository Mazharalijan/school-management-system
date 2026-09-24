<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();

            // General Details
            $table->string('school_name');
            $table->string('school_tagline')->nullable();
            $table->string('logo_path')->nullable();
            $table->string('registration_number')->nullable();

            // Academic & Operations
            $table->string('current_session_year'); // e.g. "2026-2027"
            $table->string('currency_symbol')->default('Rs.');
            $table->string('currency_code')->default('PKR');
            $table->string('timezone')->default('Asia/Karachi');
            $table->string('date_format')->default('Y-m-d');

            // Contact & Location
            $table->string('phone')->nullable();
            $table->string('alt_phone')->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->text('address')->nullable();

            // Invoice / Receipt Configuration
            $table->string('invoice_prefix')->default('INV-');
            $table->text('receipt_footer_note')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_settings');
    }
};

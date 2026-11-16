<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Clean up duplicate rows if any exist
        $firstId = DB::table('system_settings')->min('id');
        if ($firstId) {
            DB::table('system_settings')->where('id', '>', $firstId)->delete();
        }

        Schema::table('system_settings', function (Blueprint $table) {
            $table->string('theme_mode')->default('system')->after('dashboard_theme');
        });
    }

    public function down(): void
    {
        Schema::table('system_settings', function (Blueprint $table) {
            $table->dropColumn('theme_mode');
        });
    }
};

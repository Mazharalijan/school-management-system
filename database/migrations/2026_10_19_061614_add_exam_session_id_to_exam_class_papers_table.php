<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasColumn('exam_class_papers', 'exam_session_id')) {
            Schema::table('exam_class_papers', function (Blueprint $table) {
                $table->foreignId('exam_session_id')
                    ->nullable()
                    ->after('exam_schedule_id')
                    ->constrained('exam_sessions')
                    ->nullOnDelete();
            });
        }

        if (Schema::hasTable('exam_schedules')) {
            $schedules = DB::table('exam_schedules')->pluck('exam_session_id', 'id');
            foreach ($schedules as $scheduleId => $sessionId) {
                DB::table('exam_class_papers')
                    ->where('exam_schedule_id', $scheduleId)
                    ->whereNull('exam_session_id')
                    ->update(['exam_session_id' => $sessionId]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exam_class_papers', function (Blueprint $table) {
            $table->dropForeign(['exam_session_id']);
            $table->dropColumn('exam_session_id');
        });
    }
};

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
        Schema::create('inventory_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique()->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('inventory_categories')->onDelete('cascade');
            $table->string('name');
            $table->string('asset_code')->unique(); // e.g. AST-LAP-001
            $table->enum('type', ['fixed_asset', 'consumable']); // Fixed Asset (e.g., Laptops) vs Consumable (e.g., Stationery)
            $table->integer('quantity')->default(1);
            $table->integer('available_quantity')->default(1);
            $table->decimal('unit_price', 10, 2)->default(0);
            $table->decimal('total_price', 10, 2)->default(0);
            $table->date('purchase_date')->nullable();
            $table->enum('status', ['available', 'assigned', 'under_maintenance', 'disposed'])->default('available');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('asset_allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->onDelete('cascade');
            $table->foreignId('staff_id')->nullable()->constrained('staff')->onDelete('cascade');
            $table->string('assigned_location')->nullable()->after('staff_id');
            $table->integer('quantity_allocated')->default(1);
            $table->date('allocated_date');
            $table->date('return_date')->nullable();
            $table->enum('status', ['allocated', 'returned', 'damaged_loss'])->default('allocated');
            $table->text('allocation_notes')->nullable();
            $table->foreignId('allocated_by')->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_allocations');
        Schema::dropIfExists('inventory_items');
        Schema::dropIfExists('inventory_categories');
    }
};

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InventorySeeder extends Seeder
{
    public function run(): void
    {
        // 1. Categories
        $categories = [
            ['name' => 'Electronics & IT', 'code' => 'CAT-IT'],
            ['name' => 'Classroom Furniture', 'code' => 'CAT-FUR'],
            ['name' => 'Lab Equipment', 'code' => 'CAT-LAB'],
            ['name' => 'Stationery Consumables', 'code' => 'CAT-STA'],
            ['name' => 'Sports Goods', 'code' => 'CAT-SPT'],
            ['name' => 'Library Books', 'code' => 'CAT-LIB'],
            ['name' => 'Security & CCTV', 'code' => 'CAT-SEC'],
            ['name' => 'Electrical Appliances', 'code' => 'CAT-ELE'],
            ['name' => 'Printing & Paper', 'code' => 'CAT-PRN'],
            ['name' => 'Janitorial Supplies', 'code' => 'CAT-JAN'],
        ];
        foreach ($categories as $cat) {
            DB::table('inventory_categories')->insert(array_merge($cat, ['created_at' => now(), 'updated_at' => now()]));
        }

        // 2. Inventory Items (10 Items)
        for ($i = 1; $i <= 10; $i++) {
            $itemId = DB::table('inventory_items')->insertGetId([
                'category_id' => $i,
                'name' => "Inventory Equipment/Asset " . $i,
                'asset_code' => "AST-ITEM-00" . $i,
                'type' => $i % 2 == 0 ? 'consumable' : 'fixed_asset',
                'quantity' => 20,
                'available_quantity' => 15,
                'unit_price' => 15000.00,
                'total_price' => 300000.00,
                'purchase_date' => '2025-01-10',
                'status' => 'available',
                'notes' => 'Stocked in store room A',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 3. Allocations (10 Records)
            DB::table('asset_allocations')->insert([
                'inventory_item_id' => $itemId,
                'staff_id' => $i,
                'assigned_location' => "Computer Lab " . ($i % 3 + 1),
                'quantity_allocated' => 5,
                'allocated_date' => '2025-02-01',
                'return_date' => null,
                'status' => 'allocated',
                'allocation_notes' => 'Handed over for departmental use',
                'allocated_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
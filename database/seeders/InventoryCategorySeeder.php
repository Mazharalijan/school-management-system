<?php

namespace Database\Seeders;

use App\Models\InventoryCategory;
use Illuminate\Database\Seeder;

class InventoryCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Furniture & Fixtures',
                'code' => 'FUR',
                'description' => 'Tables, chairs, whiteboards, desks, and structural fixtures',
            ],
            [
                'name' => 'Crockery & Kitchenware',
                'code' => 'KITCHEN',
                'description' => 'Glasses, cups, water dispensers, trays, and utensils',
            ],
            [
                'name' => 'Classroom & Office Supplies',
                'code' => 'SUPPLIES',
                'description' => 'Whiteboard dusters, markers, chalks, dustbins, and accessories',
            ],
        ];

        foreach ($categories as $category) {
            InventoryCategory::firstOrCreate(['code' => $category['code']], $category);
        }
    }
}

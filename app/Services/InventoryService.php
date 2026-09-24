<?php

namespace App\Services;

use App\Models\AssetAllocation;
use App\Models\InventoryItem;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    public function getPaginatedItems(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = InventoryItem::with(['category', 'allocations.staff']);

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('asset_code', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (! empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        return $query->latest()->paginate($perPage)->withQueryString();
    }

    public function createItem(array $data): InventoryItem
    {
        $data['available_quantity'] = $data['quantity'];

        return InventoryItem::create($data);
    }

    public function allocateAsset(array $data, int $userId): AssetAllocation
    {
        return DB::transaction(function () use ($data, $userId) {
            $item = InventoryItem::findOrFail($data['inventory_item_id']);

            if ($item->available_quantity < $data['quantity']) {
                throw new Exception('Insufficient available item stock for allocation.');
            }

            // Deduct available stock
            $item->decrement('available_quantity', $data['quantity']);

            if ($item->type === 'fixed_asset' && $item->available_quantity === 0) {
                $item->update(['status' => 'assigned']);
            }

            return AssetAllocation::create([
                'inventory_item_id' => $item->id,
                'staff_id' => $data['staff_id'] ?? null,
                'assigned_location' => $data['assigned_location'] ?? null,
                'quantity_allocated' => $data['quantity'],
                'allocated_date' => $data['allocated_date'],
                'status' => 'allocated',
                'allocation_notes' => $data['notes'] ?? null,
                'allocated_by' => $userId,
            ]);
        });
    }

    public function returnAsset(int $allocationId, ?string $returnDate = null): AssetAllocation
    {
        return DB::transaction(function () use ($allocationId, $returnDate) {
            $allocation = AssetAllocation::findOrFail($allocationId);

            if ($allocation->status === 'returned') {
                throw new Exception('Asset is already marked as returned.');
            }

            $allocation->update([
                'status' => 'returned',
                'return_date' => $returnDate ?? now()->toDateString(),
            ]);

            // Restore available inventory count
            $item = $allocation->item;
            $item->increment('available_quantity', $allocation->quantity_allocated);

            if ($item->status === 'assigned' && $item->available_quantity > 0) {
                $item->update(['status' => 'available']);
            }

            return $allocation;
        });
    }

    public function reportDamagedOrLost(array $data): void
    {
        DB::transaction(function () use ($data) {
            $item = InventoryItem::findOrFail($data['inventory_item_id']);

            if ($item->available_quantity < $data['quantity']) {
                throw new Exception('Quantity to write off exceeds available stock.');
            }

            // Permanently reduce total stock and available stock
            $item->decrement('quantity', $data['quantity']);
            $item->decrement('total_price', $item->unit_price * $data['quantity']);
            $item->decrement('available_quantity', $data['quantity']);

            // Record entry in allocation history for audit trail
            AssetAllocation::create([
                'inventory_item_id' => $item->id,
                'quantity_allocated' => $data['quantity'],
                'allocated_date' => now()->toDateString(),
                'status' => 'damaged_loss',
                'allocation_notes' => "Stock written off: {$data['reason']}",
                'staff_id' => $data['staff_id'] ?? null,
                'allocated_by' => auth()->id() ?? 1,
            ]);
        });
    }
}

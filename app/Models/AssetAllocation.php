<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetAllocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'inventory_item_id',
        'staff_id',
        'assigned_location',
        'quantity_allocated',
        'allocated_date',
        'return_date',
        'status',
        'allocation_notes',
        'allocated_by',
    ];

    protected $casts = [
        'allocated_date' => 'date',
        'return_date' => 'date',
    ];

    public function item(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_item_id');
    }

    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class);
    }

    public function allocator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'allocated_by');
    }
}
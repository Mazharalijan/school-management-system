<?php

namespace App\Http\Controllers;

use App\Http\Requests\AllocateAssetRequest;
use App\Http\Requests\ReportDamagedAssetRequest;
use App\Http\Requests\StoreInventoryItemRequest;
use App\Models\InventoryCategory;
use App\Models\Staff;
use App\Services\InventoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    protected InventoryService $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'category_id', 'type']);
        $items = $this->inventoryService->getPaginatedItems($filters);
        $categories = InventoryCategory::all();
        $staffMembers = Staff::where('status', 'active')->select('id', 'first_name', 'last_name', 'employee_code')->get();

        return Inertia::render('Inventory/Index', [
            'items' => $items,
            'categories' => $categories,
            'staffMembers' => $staffMembers,
            'filters' => $filters,
        ]);
    }

    public function store(StoreInventoryItemRequest $request): RedirectResponse
    {
        $this->inventoryService->createItem($request->validated());

        return redirect()->back()->with('success', 'Inventory item created successfully.');
    }

    public function allocate(AllocateAssetRequest $request): RedirectResponse
    {
        try {
            $this->inventoryService->allocateAsset($request->validated(), auth()->id() ?? 1);

            return redirect()->back()->with('success', 'Asset allocated successfully.');
        } catch (\Exception $e) {
            throw ValidationException::withMessages([
                'quantity' => $e->getMessage(),
            ]);
        }
    }

    public function returnAsset(Request $request, int $id): RedirectResponse
    {
        try {
            $this->inventoryService->returnAsset($id, $request->input('return_date'));

            return redirect()->back()->with('success', 'Asset returned successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function reportDamaged(ReportDamagedAssetRequest $request): RedirectResponse
    {
        try {
            $this->inventoryService->reportDamagedOrLost($request->validated(), auth()->id() ?? 1);

            return redirect()->back()->with('success', 'Damage or stock loss reported successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['quantity' => $e->getMessage()]);
        }
    }
}

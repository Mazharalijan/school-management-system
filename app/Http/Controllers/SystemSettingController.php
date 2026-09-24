<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateSystemSettingsRequest;
use App\Models\SystemSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SystemSettingController extends Controller
{
    public function edit(): Response
    {
        $settings = SystemSetting::firstOrCreate(
            ['id' => 1],
            [
                'school_name' => 'My School System',
                'current_session_year' => '2026-2027',
                'currency_symbol' => 'Rs.',
                'currency_code' => 'PKR',
                'timezone' => 'Asia/Karachi',
                'date_format' => 'Y-m-d',
                'invoice_prefix' => 'INV-',
            ]
        );

        return Inertia::render('Settings/Index', [
            'settings' => $settings,
        ]);
    }

    public function update(UpdateSystemSettingsRequest $request): RedirectResponse
    {
        $settings = SystemSetting::firstOrFail();
        $data = $request->validated();

        if ($request->hasFile('logo')) {
            if ($settings->logo_path && Storage::exists($settings->logo_path)) {
                Storage::delete($settings->logo_path);
            }
            $data['logo_path'] = $request->file('logo')->store('settings', 'public');
        }

        $settings->update($data);

        return redirect()->back()->with('success', 'System settings updated successfully.');
    }
}

import React from 'react';

export default function FilterSelect({
    value = '',
    onChange,
    options = [],
    placeholder = 'Select option',
    valueKey = 'id',
    labelKey = 'name',
    className = 'w-48 shrink-0',
}) {
    return (
        <div className={className}>
            <select
                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="">{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt[valueKey]} value={opt[valueKey]}>
                        {opt[labelKey]}
                    </option>
                ))}
            </select>
        </div>
    );
}
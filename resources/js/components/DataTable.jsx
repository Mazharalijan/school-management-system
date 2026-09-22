import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function DataTable({
    columns = [],
    data = [],
    keyExtractor = (item) => item.id,
    emptyMessage = 'No records found.',
    className = '',
}) {
    // Supports both paginated Inertia objects (data.data) and plain arrays
    const list = Array.isArray(data) ? data : data?.data || [];

    return (
        <Card className={`border-slate-200 shadow-sm ${className}`}>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                            <tr>
                                {columns.map((col, index) => (
                                    <th
                                        key={col.key || index}
                                        className={`px-4 py-3 ${col.align === 'right' ? 'text-right' : 'text-left'} ${col.headerClassName || ''}`}
                                    >
                                        {col.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {list.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="text-center py-8 text-slate-400"
                                    >
                                        {emptyMessage}
                                    </td>
                                </tr>
                            ) : (
                                list.map((item, rowIndex) => (
                                    <tr
                                        key={keyExtractor(item, rowIndex)}
                                        className="hover:bg-slate-50/80 transition-colors"
                                    >
                                        {columns.map((col, colIndex) => (
                                            <td
                                                key={col.key || colIndex}
                                                className={`px-4 py-3 ${col.align === 'right' ? 'text-right' : 'text-left'} ${col.className || ''}`}
                                            >
                                                {col.render
                                                    ? col.render(item, rowIndex)
                                                    : item[col.accessor]}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
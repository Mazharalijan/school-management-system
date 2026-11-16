import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
        <Card className={cn("border-border bg-card shadow-sm text-card-foreground", className)}>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-foreground">
                        <thead className="text-xs uppercase bg-muted/60 text-muted-foreground border-b border-border font-medium">
                            <tr>
                                {columns.map((col, index) => (
                                    <th
                                        key={col.key || index}
                                        className={cn(
                                            "px-4 py-3 font-semibold",
                                            col.align === 'right' ? 'text-right' : 'text-left',
                                            col.headerClassName || ''
                                        )}
                                    >
                                        {col.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {list.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="text-center py-10 text-muted-foreground text-sm"
                                    >
                                        {emptyMessage}
                                    </td>
                                </tr>
                            ) : (
                                list.map((item, rowIndex) => (
                                    <tr
                                        key={keyExtractor(item, rowIndex)}
                                        className="hover:bg-muted/50 transition-colors"
                                    >
                                        {columns.map((col, colIndex) => (
                                            <td
                                                key={col.key || colIndex}
                                                className={cn(
                                                    "px-4 py-3.5",
                                                    col.align === 'right' ? 'text-right' : 'text-left',
                                                    col.className || ''
                                                )}
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

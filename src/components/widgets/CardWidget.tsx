'use client';

import { Widget } from '@/types';
import { getValueByPath, formatValue } from '@/lib/dataMapper';

interface CardWidgetProps {
    widget: Widget;
    data: unknown;
}

export default function CardWidget({ widget, data }: CardWidgetProps) {
    if (widget.selectedFields.length === 0) {
        return (
            <div className="text-center text-[var(--text-muted)]">
                No fields selected
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {widget.selectedFields.map((field, index) => {
                const value = getValueByPath(data, field.path);
                const formattedValue = formatValue(value, field.format);

                return (
                    <div
                        key={`${field.path}-${index}`}
                        className="flex items-center justify-between"
                    >
                        <span className="text-sm text-[var(--text-secondary)]">
                            {field.label}
                        </span>
                        <span className="font-mono font-medium text-[var(--text-primary)]">
                            {formattedValue}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

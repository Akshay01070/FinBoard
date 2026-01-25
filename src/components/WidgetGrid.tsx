'use client';

import { useDashboardStore } from '@/store/dashboardStore';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import Widget from './widgets/Widget';
import AddWidgetCard from './AddWidgetCard';

export default function WidgetGrid() {
    const { widgets, reorderWidgets } = useDashboardStore();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            reorderWidgets(active.id as string, over.id as string);
        }
    };

    const sortedWidgets = [...widgets].sort((a, b) => a.position - b.position);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={sortedWidgets.map((w) => w.id)}
                strategy={rectSortingStrategy}
            >
                <div className="widget-grid">
                    {sortedWidgets.map((widget) => (
                        <div
                            key={widget.id}
                            className="widget-item"
                            style={{
                                gridColumn: `span ${widget.layout?.w || 4}`,
                            }}
                        >
                            <Widget widget={widget} />
                        </div>
                    ))}
                    {/* Add Widget Card - same size as card widgets (4 cols, 4 rows) */}
                    <div
                        style={{
                            gridColumn: 'span 4',
                            gridRow: 'span 4',
                            minHeight: '400px'
                        }}
                    >
                        <AddWidgetCard />
                    </div>
                </div>
            </SortableContext>
        </DndContext>
    );
}

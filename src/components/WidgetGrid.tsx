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
    arrayMove,
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
                        <Widget key={widget.id} widget={widget} />
                    ))}
                    <AddWidgetCard />
                </div>
            </SortableContext>
        </DndContext>
    );
}

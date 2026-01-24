import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Widget, Theme, DashboardState } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface DashboardActions {
    // Widget actions
    addWidget: (widget: Omit<Widget, 'id' | 'position' | 'layout'> & { layout?: Widget['layout'] }) => void;
    removeWidget: (id: string) => void;
    updateWidget: (id: string, updates: Partial<Widget>) => void;
    reorderWidgets: (activeId: string, overId: string) => void;

    // Modal actions
    openModal: (editingId?: string) => void;
    closeModal: () => void;

    // Theme actions
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;

    // Data actions
    setWidgetData: (id: string, data: unknown) => void;
    setWidgetLoading: (id: string, loading: boolean) => void;
    setWidgetError: (id: string, error: string | null) => void;
}

const initialState: DashboardState = {
    widgets: [],
    theme: 'dark',
    isModalOpen: false,
    editingWidgetId: null,
};

export const useDashboardStore = create<DashboardState & DashboardActions>()(
    persist(
        (set, get) => ({
            ...initialState,

            addWidget: (widgetData) => {
                // Uniform height for all widgets (easier arrangement)
                const defaultLayouts = {
                    card: { w: 4, h: 3 },    // Card widget
                    table: { w: 6, h: 3 },   // Table widget
                    chart: { w: 6, h: 3 },   // Chart widget
                };

                const newWidget: Widget = {
                    ...widgetData,
                    id: uuidv4(),
                    position: get().widgets.length,
                    layout: widgetData.layout || defaultLayouts[widgetData.displayMode] || { w: 4, h: 2 },
                };
                set((state) => ({
                    widgets: [...state.widgets, newWidget],
                    isModalOpen: false,
                }));
            },

            removeWidget: (id) => {
                set((state) => ({
                    widgets: state.widgets
                        .filter((w) => w.id !== id)
                        .map((w, index) => ({ ...w, position: index })),
                }));
            },

            updateWidget: (id, updates) => {
                set((state) => ({
                    widgets: state.widgets.map((w) =>
                        w.id === id ? { ...w, ...updates } : w
                    ),
                }));
            },

            reorderWidgets: (activeId, overId) => {
                set((state) => {
                    const oldIndex = state.widgets.findIndex((w) => w.id === activeId);
                    const newIndex = state.widgets.findIndex((w) => w.id === overId);

                    if (oldIndex === -1 || newIndex === -1) return state;

                    const newWidgets = [...state.widgets];
                    const [removed] = newWidgets.splice(oldIndex, 1);
                    newWidgets.splice(newIndex, 0, removed);

                    return {
                        widgets: newWidgets.map((w, index) => ({ ...w, position: index })),
                    };
                });
            },

            openModal: (editingId) => {
                set({ isModalOpen: true, editingWidgetId: editingId || null });
            },

            closeModal: () => {
                set({ isModalOpen: false, editingWidgetId: null });
            },

            setTheme: (theme) => {
                set({ theme });
                if (typeof document !== 'undefined') {
                    document.documentElement.classList.toggle('dark', theme === 'dark');
                }
            },

            toggleTheme: () => {
                const newTheme = get().theme === 'dark' ? 'light' : 'dark';
                get().setTheme(newTheme);
            },

            setWidgetData: (id, data) => {
                set((state) => ({
                    widgets: state.widgets.map((w) =>
                        w.id === id
                            ? { ...w, cachedData: data, lastUpdated: new Date().toISOString(), error: null }
                            : w
                    ),
                }));
            },

            setWidgetLoading: (id, loading) => {
                set((state) => ({
                    widgets: state.widgets.map((w) =>
                        w.id === id ? { ...w, isLoading: loading } : w
                    ),
                }));
            },

            setWidgetError: (id, error) => {
                set((state) => ({
                    widgets: state.widgets.map((w) =>
                        w.id === id ? { ...w, error, isLoading: false } : w
                    ),
                }));
            },
        }),
        {
            name: 'finboard-storage',
            partialize: (state) => ({
                widgets: state.widgets.map((w) => ({
                    ...w,
                    isLoading: false,
                    error: null,
                    cachedData: undefined,
                })),
                theme: state.theme,
            }),
        }
    )
);

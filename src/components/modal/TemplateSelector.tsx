'use client';

import { widgetTemplates, WidgetTemplate } from '@/lib/templates';
import { useDashboardStore } from '@/store/dashboardStore';

interface TemplateSelectorProps {
    onSelectTemplate: (template: WidgetTemplate) => void;
    onCustomWidget: () => void;
}

export default function TemplateSelector({ onSelectTemplate, onCustomWidget }: TemplateSelectorProps) {
    const categories = [
        { id: 'crypto', name: 'Cryptocurrency', icon: '🪙' },
        { id: 'forex', name: 'Forex', icon: '💱' },
    ] as const;

    return (
        <div className="space-y-6">
            <div className="text-center">
                <p className="text-sm text-[var(--text-secondary)]">
                    Choose a template or create a custom widget
                </p>
            </div>

            {/* Custom Widget Option */}
            <button
                onClick={onCustomWidget}
                className="w-full rounded-lg border-2 border-dashed border-[var(--border-color)] p-4 text-left transition-colors hover:border-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/5"
            >
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--bg-secondary)] text-xl">
                        ⚙️
                    </div>
                    <div>
                        <h4 className="font-medium text-[var(--text-primary)]">Custom Widget</h4>
                        <p className="text-sm text-[var(--text-muted)]">Connect to any API endpoint</p>
                    </div>
                </div>
            </button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--border-color)]"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-[var(--bg-modal)] px-3 text-sm text-[var(--text-muted)]">
                        or choose a template
                    </span>
                </div>
            </div>

            {/* Templates by Category */}
            {categories.map((category) => {
                const templates = widgetTemplates.filter((t) => t.category === category.id);
                if (templates.length === 0) return null;

                return (
                    <div key={category.id}>
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
                            <span>{category.icon}</span>
                            {category.name}
                        </h3>
                        <div className="grid gap-2">
                            {templates.map((template) => (
                                <button
                                    key={template.id}
                                    onClick={() => onSelectTemplate(template)}
                                    className="flex items-center gap-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] p-3 text-left transition-all hover:border-[var(--accent-primary)] hover:bg-[var(--bg-card)]"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--bg-card)] text-xl">
                                        {template.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-[var(--text-primary)]">{template.name}</h4>
                                        <p className="text-xs text-[var(--text-muted)]">{template.description}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className={`rounded px-2 py-0.5 text-xs ${template.displayMode === 'card'
                                                ? 'bg-blue-500/10 text-blue-400'
                                                : template.displayMode === 'table'
                                                    ? 'bg-green-500/10 text-green-400'
                                                    : 'bg-purple-500/10 text-purple-400'
                                            }`}>
                                            {template.displayMode}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

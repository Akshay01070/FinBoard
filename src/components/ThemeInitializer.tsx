'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';

export default function ThemeInitializer() {
    const theme = useDashboardStore((state) => state.theme);

    useEffect(() => {
        // Apply theme class to html element
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    return null;
}

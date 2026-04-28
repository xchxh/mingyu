import { useState, useEffect } from 'react';
import type { AISettings } from '@/lib/ai-service';
import { defaultAISettings } from '@/lib/ai-service';

export function useAISettings() {
    const [settings, setSettings] = useState<AISettings>(() => {
        try {
            const saved = localStorage.getItem('ai-settings');
            if (saved) return JSON.parse(saved);
        } catch { }
        return defaultAISettings;
    });

    useEffect(() => {
        try {
            localStorage.setItem('ai-settings', JSON.stringify(settings));
        } catch { }
    }, [settings]);

    return [settings, setSettings] as const;
}

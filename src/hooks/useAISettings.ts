import { useState, useEffect } from 'react';
import type { AISettings } from '@/lib/ai-service';
import { defaultAISettings } from '@/lib/ai-service';

export function useAISettings() {
    const [settings, setSettings] = useState<AISettings>(() => {
        try {
            const saved = localStorage.getItem('ai-settings');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && typeof parsed === 'object') {
                    return { ...defaultAISettings, ...parsed };
                }
            }
        } catch { }
        return defaultAISettings;
    });

    useEffect(() => {
        try {
            localStorage.setItem('ai-settings', JSON.stringify(settings));
        } catch { }
    }, [settings]);
    // 包装 setSettings 以支持对象式更新
    const updateSettings = (partial: Partial<AISettings>) => {
        setSettings(prev => ({ ...prev, ...partial }));
    };

    return [settings, updateSettings] as const;
}

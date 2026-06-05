import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StoryDisplayMode } from './StoryDisplayToggle';

export default function usePersistedStoryDisplayMode(storageKey: string, fallback: StoryDisplayMode = 'list') {
    const [mode, setMode] = useState<StoryDisplayMode>(fallback);

    useEffect(() => {
        AsyncStorage.getItem(storageKey)
            .then((saved) => {
                if (saved === 'list' || saved === 'standard' || saved === 'large') {
                    setMode(saved);
                }
            })
            .catch(() => undefined);
    }, [storageKey]);

    useEffect(() => {
        AsyncStorage.setItem(storageKey, mode).catch(() => undefined);
    }, [storageKey, mode]);

    return [mode, setMode] as const;
}

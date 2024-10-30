// src/hooks/use-user-settings.ts
import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { supabase } from '@/lib/supabase';
import type { UserSettings } from '@/types/user';

export const useUserSettings = () => {
    const { user } = useAuth();
    const [settings, setSettings] = useState<UserSettings>({
        fontSize: 'medium',
        theme: 'light'
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadSettings();
        } else {
            // Load from localStorage when not authenticated
            const savedSettings = localStorage.getItem('user-settings');
            if (savedSettings) {
                setSettings(JSON.parse(savedSettings));
            }
            setIsLoading(false);
        }
    }, [user]);

    const loadSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('user_metadata')
                .select('settings')
                .eq('id', user?.id)
                .single();

            if (error) throw error;
            if (data?.settings) {
                setSettings(data.settings);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateSettings = async (newSettings: Partial<UserSettings>) => {
        const updatedSettings = { ...settings, ...newSettings };
        setSettings(updatedSettings);

        if (user) {
            try {
                const { error } = await supabase
                    .from('user_metadata')
                    .update({ settings: updatedSettings })
                    .eq('id', user.id);

                if (error) throw error;
            } catch (error) {
                console.error('Error updating settings:', error);
            }
        } else {
            // Save to localStorage when not authenticated
            localStorage.setItem('user-settings', JSON.stringify(updatedSettings));
        }
    };

    return {
        settings,
        isLoading,
        updateSettings
    };
};
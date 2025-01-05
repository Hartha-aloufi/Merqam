// hooks/use-auto-save.ts
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import debounce from 'lodash/debounce';

interface AutoSaveOptions {
    onSave: () => Promise<void>;
    debounceMs?: number;
    successMessage?: string;
    errorMessage?: string;
}

export function useAutoSave({
    onSave,
    debounceMs = 2000,
    successMessage = "تم الحفظ تلقائياً",
    errorMessage = "فشل الحفظ التلقائي"
}: AutoSaveOptions) {
    const [isSaving, setIsSaving] = useState(false);

    // Create debounced save function
    const debouncedSave = useCallback(
        debounce(async () => {
            try {
                setIsSaving(true);
                await onSave();
                toast.success(successMessage);
            } catch (error) {
                console.error('Auto-save error:', error);
                toast.error(errorMessage);
            } finally {
                setIsSaving(false);
            }
        }, debounceMs),
        [onSave, successMessage, errorMessage, debounceMs]
    );

    // Clean up on unmount
    useEffect(() => {
        return () => {
            debouncedSave.cancel();
        };
    }, [debouncedSave]);

    return {
        isSaving,
        triggerSave: debouncedSave
    };
}
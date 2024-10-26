// src/components/settings/SettingsSheet.tsx
'use client';

import { useTheme } from 'next-themes';
import { useSettings } from '@/hooks/use-settings';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Settings, Sun, Moon, Coffee, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

const ThemeOption = ({ 
  theme, 
  current, 
  onClick, 
  icon: Icon, 
  label 
}: { 
  theme: string;
  current: string | undefined;
  onClick: () => void;
  icon: any;
  label: string;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-2 p-4 rounded-lg transition-all",
      "hover:bg-accent hover:text-accent-foreground",
      theme === current && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
    )}
  >
    <Icon className="h-8 w-8" />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const FontSizePreview = ({
  size,
  current,
  onClick,
  label
}: {
  size: string;
  current: string;
  onClick: () => void;
  label: string;
}) => {
  const sizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-4 rounded-lg border-2 transition-all",
        "hover:bg-accent hover:text-accent-foreground",
        size === current ? "border-primary" : "border-transparent",
        sizes[size as keyof typeof sizes]
      )}
    >
      <div className="space-y-1">
        <p className="font-bold">عنوان تجريبي</p>
        <p className="opacity-90">هذا نص تجريبي لمعاينة حجم الخط {label}</p>
      </div>
    </button>
  );
};

export function SettingsSheet() {
  const { theme, setTheme } = useTheme();
  const { fontSize, setFontSize } = useSettings();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
          <span className="sr-only">الإعدادات</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader className="pb-6">
        <SheetTitle>إعدادات المِرْقَم</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-8">
          {/* Theme Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">السمة</h3>
            <div className="grid grid-cols-3 gap-2">
              <ThemeOption
                theme="light"
                current={theme}
                onClick={() => setTheme('light')}
                icon={Sun}
                label="فاتح"
              />
              <ThemeOption
                theme="dark"
                current={theme}
                onClick={() => setTheme('dark')}
                icon={Moon}
                label="داكن"
              />
              <ThemeOption
                theme="sepia"
                current={theme}
                onClick={() => setTheme('sepia')}
                icon={Coffee}
                label="بني"
              />
            </div>
          </div>

          {/* Font Size Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-lg font-medium">حجم الخط</h3>
              <Type className="h-5 w-5" />
            </div>
            <div className="space-y-3">
              <FontSizePreview
                size="small"
                current={fontSize}
                onClick={() => setFontSize('small')}
                label="صغير"
              />
              <FontSizePreview
                size="medium"
                current={fontSize}
                onClick={() => setFontSize('medium')}
                label="متوسط"
              />
              <FontSizePreview
                size="large"
                current={fontSize}
                onClick={() => setFontSize('large')}
                label="كبير"
              />
            </div>
          </div>

          {/* Reset Button */}
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              setTheme('light');
              setFontSize('small');
            }}
          >
            إعادة تعيين الإعدادات
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
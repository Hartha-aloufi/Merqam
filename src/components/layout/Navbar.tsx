// src/components/layout/Navbar.tsx
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SettingsSheet } from '../settings/SettingsSheet';
import ThemeToggle  from './ThemeToggle';

const Navbar = () => {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          منصة التعليم
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/topics">
            <Button variant="ghost">المواضيع</Button>
          </Link>
          <SettingsSheet />
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
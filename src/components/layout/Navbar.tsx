// src/components/layout/Navbar.tsx
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { SettingsSheet } from '../settings/SettingsSheet';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          {/* Logo Container with fixed dimensions */}
          <div className="relative h-8 w-8">
            <Image
              src="/logo.webp"
              alt="مِرْقَم"
              fill
              sizes="32px"
              className="object-contain"
              priority // Loads the logo immediately as it's above the fold
            />
          </div>
          <span className="text-xl font-bold hidden sm:inline-block">
            مِرْقَم 
          </span>
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
// src/components/layout/Navbar.tsx
'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { SettingsSheet } from '../settings/SettingsSheet'
import ThemeToggle from './ThemeToggle'
import { useAuth } from '@/contexts/auth-context'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, LogOut } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useState } from 'react'
import { toast } from 'sonner'

const Navbar = () => {
  const { user, isLoading, signOut } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      await signOut()
    } catch (error) {
      toast.error('حدث خطأ أثناء تسجيل الخروج')
      console.error('Error signing out:', error)
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-8 w-8">
            <Image
              src="/logo.webp"
              alt="مِرْقَم"
              fill
              sizes="32px"
              className="object-contain"
              priority
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

          {!isLoading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user.email?.[0].toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                    >
                      {isSigningOut ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-r-transparent" />
                          جاري تسجيل الخروج...
                        </span>
                      ) : (
                        <>
                          <LogOut className="ml-2 h-4 w-4" />
                          <span>تسجيل الخروج</span>
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  href={`/auth/signin?returnUrl=${encodeURIComponent(window.location.pathname)}`}
                >
                  <Button>تسجيل الدخول</Button>
                </Link>
              )}
            </>
          )}

          <SettingsSheet />
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
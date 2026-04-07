'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Film, User, LogOut, Menu } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-bg-primary/90 backdrop-blur-md border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="text-accent-primary group-hover:scale-110 transition-transform">
              <Film size={32} />
            </div>
            <span className="font-display text-3xl tracking-wider text-text-primary">GENZ CINEMA</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-text-secondary hover:text-accent-neon transition-colors font-medium">TRANG CHỦ</Link>
            <Link href="/rooms" className="text-text-secondary hover:text-accent-neon transition-colors font-medium">PHÒNG</Link>
            {user && (
              <Link href="/history" className="text-text-secondary hover:text-accent-neon transition-colors font-medium">LỊCH SỬ PHÒNG</Link>
            )}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <User size={18} className="text-accent-neon" />
                  <span>Xin chào, <strong className="text-text-primary">{user.name}</strong></span>
                </div>
                {user.role !== 'customer' && (
                  <Link href={`/${user.role === 'manager' ? 'admin' : user.role === 'receptionist' ? 'staff' : 'cleaner'}/dashboard`} className="text-xs bg-bg-secondary border border-border-subtle px-3 py-1.5 rounded hover:border-accent-neon transition-colors">
                    Vào Dashboard
                  </Link>
                )}
                <button onClick={logout} className="text-text-muted hover:text-accent-primary transition-colors" title="Đăng xuất">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-text-primary font-medium hover:text-accent-neon transition-colors">Đăng nhập</Link>
                <Link href="/login?register=true" className="btn-primary py-2 px-4 text-sm">Đăng ký</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button className="text-text-secondary hover:text-text-primary">
              <Menu size={28} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

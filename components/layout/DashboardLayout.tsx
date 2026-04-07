'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { 
  LayoutDashboard, 
  BedDouble, 
  CalendarCheck, 
  Users, 
  Settings, 
  LogOut, 
  Film,
  Menu,
  Bell,
  Brush
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function DashboardLayout({ children, allowedRoles }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Simple role check (in a real app, this would redirect)
  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary text-text-primary">
        <div className="text-center">
          <h1 className="text-4xl mb-4 text-accent-primary">Truy cập bị từ chối</h1>
          <p className="text-text-secondary mb-6">Bạn không có quyền truy cập trang này.</p>
          <Link href="/" className="btn-primary">Về trang chủ</Link>
        </div>
      </div>
    );
  }

  const getMenuItems = () => {
    switch (user.role) {
      case 'manager':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
          { icon: BedDouble, label: 'Quản lý phòng', path: '/admin/rooms' },
          { icon: CalendarCheck, label: 'Đặt phòng', path: '/admin/bookings' },
          { icon: Users, label: 'Khách hàng', path: '/admin/customers' },
          { icon: Settings, label: 'Tài khoản', path: '/admin/accounts' },
        ];
      case 'receptionist':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/staff/dashboard' },
          { icon: CalendarCheck, label: 'Đặt phòng', path: '/staff/bookings' },
          { icon: BedDouble, label: 'Trạng thái phòng', path: '/staff/rooms' },
          { icon: Users, label: 'Khách hàng', path: '/staff/customers' },
        ];
      case 'cleaner':
        return [
          { icon: Brush, label: 'Phòng cần dọn', path: '/cleaner/dashboard' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen flex bg-bg-primary">
      {/* Sidebar */}
      <aside className={`bg-bg-secondary border-r border-border-subtle transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="h-20 flex items-center justify-center border-b border-border-subtle px-4">
          <Link href="/" className="flex items-center gap-3 text-accent-primary overflow-hidden whitespace-nowrap">
            <Film size={32} className="shrink-0" />
            {isSidebarOpen && <span className="font-display text-2xl tracking-wider text-text-primary mt-1">GENZ CINEMA</span>}
          </Link>
        </div>

        <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-accent-primary text-white border-l-2 border-accent-primary' 
                    : 'text-text-secondary hover:bg-accent-primary hover:text-white'
                }`}
                title={!isSidebarOpen ? item.label : undefined}
              >
                <item.icon size={20} className="shrink-0" />
                {isSidebarOpen && <span className="font-medium whitespace-nowrap">{item.label}</span>}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-border-subtle">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-3 py-3 w-full rounded-lg text-text-muted hover:text-accent-primary hover:bg-accent-primary/10 transition-all"
            title={!isSidebarOpen ? "Đăng xuất" : undefined}
          >
            <LogOut size={20} className="shrink-0" />
            {isSidebarOpen && <span className="font-medium">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-20 bg-bg-secondary/50 backdrop-blur-sm border-b border-border-subtle flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:block text-sm text-text-muted">
              <span className="text-accent-neon font-mono">[{user.role.toUpperCase()}]</span> Dashboard
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-text-secondary hover:text-text-primary transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent-primary rounded-full border-2 border-bg-secondary"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-border-subtle">
              <div className="w-8 h-8 rounded-full bg-accent-primary/20 text-accent-primary flex items-center justify-center font-bold border border-accent-primary/30">
                {user.name.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-bold text-text-primary">{user.name}</div>
                <div className="text-xs text-text-muted">{user.email}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-hidden p-4 md:p-6 flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { CheckCircle, LogOut, Clock } from 'lucide-react';
import { mockService, Booking, Room } from '@/lib/mock-data';

export default function StaffDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    setBookings(mockService.getBookings());
    setRooms(mockService.getRooms());
  }, []);

  const upcomingBookings = bookings.filter(b => b.status === 'upcoming');
  const activeBookings = bookings.filter(b => b.status === 'active');
  
  const availableRooms = rooms.filter(r => r.status === 'available').length;
  const cleaningRooms = rooms.filter(r => r.status === 'cleaning').length;

  const handleCheckIn = (id: string) => {
    mockService.updateBookingStatus(id, 'active');
    setBookings(mockService.getBookings());
  };

  const handleCheckOut = (id: string) => {
    mockService.updateBookingStatus(id, 'completed');
    setBookings(mockService.getBookings());
  };

  return (
    <DashboardLayout allowedRoles={['receptionist', 'manager']}>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl text-text-primary mb-2">LỄ TÂN CA TRỰC</h1>
          <p className="text-text-secondary">Công việc cần xử lý hôm nay</p>
        </div>
        <Link href="/rooms" className="btn-primary py-2 text-sm flex items-center gap-2">
          <span>+ TẠO ĐẶT PHÒNG</span>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-bg-secondary border border-border-subtle rounded-xl p-4 text-center">
          <div className="text-text-muted text-xs font-bold uppercase mb-1">Chờ Check-in</div>
          <div className="text-3xl font-display text-warning">{upcomingBookings.length}</div>
        </div>
        <div className="bg-bg-secondary border border-border-subtle rounded-xl p-4 text-center">
          <div className="text-text-muted text-xs font-bold uppercase mb-1">Đang ở (Chờ Check-out)</div>
          <div className="text-3xl font-display text-accent-neon">{activeBookings.length}</div>
        </div>
        <div className="bg-bg-secondary border border-border-subtle rounded-xl p-4 text-center">
          <div className="text-text-muted text-xs font-bold uppercase mb-1">Phòng Trống</div>
          <div className="text-3xl font-display text-success">{availableRooms}</div>
        </div>
        <div className="bg-bg-secondary border border-border-subtle rounded-xl p-4 text-center">
          <div className="text-text-muted text-xs font-bold uppercase mb-1">Đang dọn</div>
          <div className="text-3xl font-display text-danger">{cleaningRooms}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Check-in List */}
        <div className="card-cinema p-0 overflow-hidden flex flex-col">
          <div className="bg-bg-secondary border-b border-border-subtle p-4 flex items-center gap-2">
            <Clock className="text-warning" size={20} />
            <h2 className="text-lg text-text-primary font-bold">CẦN CHECK-IN HÔM NAY</h2>
          </div>
          <div className="p-4 flex-1">
            <div className="space-y-3">
              {upcomingBookings.length === 0 ? (
                <p className="text-text-secondary">Không có lịch check-in.</p>
              ) : upcomingBookings.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-border-subtle bg-bg-primary hover:border-warning transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-warning bg-warning/10 px-2 py-0.5 rounded">{item.id}</span>
                      <span className="text-sm font-bold text-text-primary">{item.userId}</span>
                    </div>
                    <div className="text-xs text-text-secondary">Phòng: <span className="text-text-primary">{item.roomName}</span> • Dự kiến: {item.checkIn}</div>
                  </div>
                  <button onClick={() => handleCheckIn(item.id)} className="bg-warning text-black font-bold text-xs px-4 py-2 rounded hover:bg-yellow-500 transition-colors flex items-center gap-1">
                    <CheckCircle size={14} /> CHECK-IN
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Check-out List */}
        <div className="card-cinema p-0 overflow-hidden flex flex-col">
          <div className="bg-bg-secondary border-b border-border-subtle p-4 flex items-center gap-2">
            <LogOut className="text-accent-neon" size={20} />
            <h2 className="text-lg text-text-primary font-bold">ĐANG Ở (CẦN CHECK-OUT)</h2>
          </div>
          <div className="p-4 flex-1">
            <div className="space-y-3">
              {activeBookings.length === 0 ? (
                <p className="text-text-secondary">Không có lịch check-out.</p>
              ) : activeBookings.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-border-subtle bg-bg-primary hover:border-accent-neon transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-accent-neon bg-accent-neon/10 px-2 py-0.5 rounded">{item.id}</span>
                      <span className="text-sm font-bold text-text-primary">{item.userId}</span>
                    </div>
                    <div className="text-xs text-text-secondary">Phòng: <span className="text-text-primary">{item.roomName}</span> • Thanh toán: <span className="text-accent-gold">{item.total.toLocaleString()}đ</span></div>
                  </div>
                  <button onClick={() => handleCheckOut(item.id)} className="bg-accent-primary text-white font-bold text-xs px-4 py-2 rounded hover:bg-red-600 transition-colors">
                    THANH TOÁN & CHECK-OUT
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

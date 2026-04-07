'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { TrendingUp, Users, BedDouble, CalendarCheck, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { mockService, Booking, Room } from '@/lib/mock-data';

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    setBookings(mockService.getBookings());
    setRooms(mockService.getRooms());
  }, []);

  const totalRevenue = bookings.filter(b => b.status === 'completed').reduce((acc, curr) => acc + curr.total, 0);
  const totalBookings = bookings.length;
  const availableRooms = rooms.filter(r => r.status === 'available').length;
  const activeRooms = rooms.filter(r => r.status === 'full' || r.status === 'few_left').length;
  const cleaningRooms = rooms.filter(r => r.status === 'cleaning').length;
  
  const occupancyRate = rooms.length > 0 ? Math.round((activeRooms / rooms.length) * 100) : 0;

  return (
    <DashboardLayout allowedRoles={['manager']}>
      <div className="h-full flex flex-col min-h-0">
        {/* Header */}
        <div className="shrink-0 mb-4">
          <h1 className="text-2xl text-text-primary mb-1">TỔNG QUAN HỆ THỐNG</h1>
          <p className="text-sm text-text-secondary">Báo cáo hiệu suất kinh doanh hôm nay</p>
        </div>

        {/* KPI Cards */}
        <div className="shrink-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="card-cinema p-4 border-l-4 border-l-accent-gold">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-1">Tổng Doanh thu</p>
                <h3 className="text-2xl font-display text-accent-gold">{totalRevenue.toLocaleString()}đ</h3>
              </div>
              <div className="p-1.5 bg-accent-gold/10 rounded-lg text-accent-gold">
                <TrendingUp size={20} />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-success">
              <ArrowUpRight size={14} />
              <span>+15% so với hôm qua</span>
            </div>
          </div>

          <div className="card-cinema p-4 border-l-4 border-l-accent-neon">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-1">Lượt đặt phòng</p>
                <h3 className="text-2xl font-display text-text-primary">{totalBookings}</h3>
              </div>
              <div className="p-1.5 bg-accent-neon/10 rounded-lg text-accent-neon">
                <CalendarCheck size={20} />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-success">
              <ArrowUpRight size={14} />
              <span>+3 lượt</span>
            </div>
          </div>

          <div className="card-cinema p-4 border-l-4 border-l-accent-primary">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-1">Công suất phòng</p>
                <h3 className="text-2xl font-display text-text-primary">{occupancyRate}%</h3>
              </div>
              <div className="p-1.5 bg-accent-primary/10 rounded-lg text-accent-primary">
                <BedDouble size={20} />
              </div>
            </div>
            <div className="w-full bg-bg-secondary h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-accent-primary h-full" style={{ width: `${occupancyRate}%` }}></div>
            </div>
          </div>

          <div className="card-cinema p-4 border-l-4 border-l-blue-400">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-1">Khách hàng mới</p>
                <h3 className="text-2xl font-display text-text-primary">12</h3>
              </div>
              <div className="p-1.5 bg-blue-400/10 rounded-lg text-blue-400">
                <Users size={20} />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-danger">
              <ArrowDownRight size={14} />
              <span>-2 so với tuần trước</span>
            </div>
          </div>
        </div>

        {/* Bottom Section (Takes remaining height) */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Recent Bookings Table */}
          <div className="lg:col-span-2 card-cinema flex flex-col">
            <div className="shrink-0 p-4 border-b border-border-subtle flex justify-between items-center bg-bg-secondary/50">
              <h2 className="text-lg text-text-primary font-bold">ĐẶT PHÒNG GẦN ĐÂY</h2>
              <Link href="/admin/bookings" className="text-sm text-accent-neon hover:underline font-medium">
                Xem tất cả &rarr;
              </Link>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-bg-card z-10">
                  <tr className="border-b border-border-subtle text-text-muted text-xs uppercase tracking-wider">
                    <th className="pb-2 font-medium">Mã</th>
                    <th className="pb-2 font-medium">Khách hàng</th>
                    <th className="pb-2 font-medium">Phòng</th>
                    <th className="pb-2 font-medium">Tổng tiền</th>
                    <th className="pb-2 font-medium">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {bookings.slice(0, 6).map((row) => {
                    let statusColor = 'bg-bg-secondary text-text-muted border border-border-subtle';
                    if (row.status === 'upcoming') statusColor = 'bg-warning text-black';
                    if (row.status === 'active') statusColor = 'bg-accent-neon text-black';
                    if (row.status === 'completed') statusColor = 'bg-success text-black';

                    return (
                      <tr key={row.id} className="border-b border-border-subtle/50 hover:bg-bg-secondary/50 transition-colors group">
                        <td className="py-3 font-mono text-text-secondary group-hover:text-text-primary">{row.id}</td>
                        <td className="py-3 text-text-primary">{row.userId}</td>
                        <td className="py-3 text-text-secondary">{row.roomName}</td>
                        <td className="py-3 text-accent-gold font-mono">{row.total.toLocaleString()}đ</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${statusColor}`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Room Status Heatmap */}
          <div className="card-cinema flex flex-col">
            <div className="shrink-0 p-4 border-b border-border-subtle flex justify-between items-center bg-bg-secondary/50">
              <h2 className="text-lg text-text-primary font-bold">TRẠNG THÁI PHÒNG</h2>
              <Link href="/admin/rooms" className="text-sm text-accent-neon hover:underline font-medium">
                Xem toàn bộ &rarr;
              </Link>
            </div>
            
            <div className="shrink-0 p-4 grid grid-cols-3 gap-2 border-b border-border-subtle bg-bg-primary/50">
              <div className="text-center p-2 rounded bg-success/10 border border-success/20">
                <div className="text-xl font-display text-success">{availableRooms}</div>
                <div className="text-[10px] uppercase font-bold text-text-muted">Trống</div>
              </div>
              <div className="text-center p-2 rounded bg-warning/10 border border-warning/20">
                <div className="text-xl font-display text-warning">{activeRooms}</div>
                <div className="text-[10px] uppercase font-bold text-text-muted">Đang ở</div>
              </div>
              <div className="text-center p-2 rounded bg-danger/10 border border-danger/20">
                <div className="text-xl font-display text-danger">{cleaningRooms}</div>
                <div className="text-[10px] uppercase font-bold text-text-muted">Đang dọn</div>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4">
              <div className="grid grid-cols-4 gap-2">
                {rooms.map((room) => {
                  let bgClass = 'bg-success/20 border-success/50 text-success hover:bg-success/30'; 
                  if (room.status === 'full' || room.status === 'few_left') bgClass = 'bg-warning/20 border-warning/50 text-warning hover:bg-warning/30'; 
                  if (room.status === 'cleaning') bgClass = 'bg-danger/20 border-danger/50 text-danger hover:bg-danger/30'; 

                  return (
                    <div key={room.id} className={`aspect-square rounded border flex items-center justify-center font-mono text-xs font-bold cursor-pointer transition-colors ${bgClass}`} title={room.name}>
                      {room.id.replace('RM-', '')}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

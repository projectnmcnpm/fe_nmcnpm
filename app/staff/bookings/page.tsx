'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Search, Calendar, Download, Plus, Edit2, Trash2 } from 'lucide-react';

const INITIAL_BOOKINGS = [
  { id: 'BO-1045', customer: 'Nguyễn Văn A', phone: '0901234567', room: 'RM-101', checkIn: '20/10/2023', checkOut: '22/10/2023', total: 900000, deposit: 270000, method: 'Chuyển khoản', status: 0 },
  { id: 'BO-1044', customer: 'Trần Thị B', phone: '0912345678', room: 'RM-205', checkIn: '19/10/2023', checkOut: '21/10/2023', total: 1900000, deposit: 570000, method: 'Tiền mặt', status: 1 },
  { id: 'BO-1043', customer: 'Lê Hoàng C', phone: '0923456789', room: 'RM-102', checkIn: '18/10/2023', checkOut: '20/10/2023', total: 1100000, deposit: 330000, method: 'Chuyển khoản', status: 2 },
  { id: 'BO-1042', customer: 'Phạm D', phone: '0934567890', room: 'RM-301', checkIn: '25/10/2023', checkOut: '27/10/2023', total: 2400000, deposit: 0, method: '-', status: 3 },
];

export default function StaffBookings() {
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleDeleteBooking = (id: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa đặt phòng ${id}?`)) {
      setBookings(bookings.filter(b => b.id !== id));
    }
  };

  const handleStatusChange = (id: string, newStatus: number) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const matchesSearch = booking.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            booking.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            booking.phone.includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || booking.status.toString() === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0: return <span className="px-2 py-1 bg-warning text-black rounded text-xs font-bold uppercase">Đã cọc</span>;
      case 1: return <span className="px-2 py-1 bg-accent-neon text-black rounded text-xs font-bold uppercase">Đang ở</span>;
      case 2: return <span className="px-2 py-1 bg-success text-black rounded text-xs font-bold uppercase">Đã thanh toán</span>;
      case 3: return <span className="px-2 py-1 bg-bg-secondary text-text-muted border border-border-subtle rounded text-xs font-bold uppercase">Đã hủy</span>;
      default: return null;
    }
  };

  return (
    <DashboardLayout allowedRoles={['receptionist', 'manager']}>
      <div className="h-full flex flex-col min-h-0">
        <div className="shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl text-text-primary mb-1">ĐẶT PHÒNG</h1>
            <p className="text-text-secondary">Quản lý danh sách đặt phòng của khách hàng</p>
          </div>
          <Link href="/staff/bookings/add" className="btn-primary flex items-center gap-2 py-2">
            <Plus size={18} /> TẠO ĐẶT PHÒNG
          </Link>
        </div>

        {/* Filter Row */}
        <div className="shrink-0 bg-bg-secondary p-4 rounded-xl border border-border-subtle mb-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 flex-1">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input 
                type="text" 
                placeholder="Tên, SĐT, Mã booking..." 
                className="input-field pl-10 py-2 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative flex items-center gap-2">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input type="date" className="input-field pl-10 py-2 text-sm w-40" />
              </div>
              <span className="text-text-muted">-</span>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input type="date" className="input-field pl-10 py-2 text-sm w-40" />
              </div>
            </div>
            <select 
              className="input-field py-2 text-sm w-auto"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="0">Đã cọc</option>
              <option value="1">Đang ở</option>
              <option value="2">Đã thanh toán</option>
              <option value="3">Đã hủy</option>
            </select>
          </div>
          
          <button className="btn-outline py-2 text-sm flex items-center gap-2 text-accent-neon border-accent-neon/50 hover:border-accent-neon hover:bg-accent-neon/10">
            <Download size={16} /> XUẤT EXCEL
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 min-h-0 card-cinema flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="sticky top-0 bg-bg-card z-10">
                <tr className="border-b border-border-subtle text-text-muted text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Mã Booking</th>
                  <th className="p-4 font-medium">Khách hàng</th>
                  <th className="p-4 font-medium">Phòng</th>
                  <th className="p-4 font-medium">Check-in / Check-out</th>
                  <th className="p-4 font-medium">Tổng tiền</th>
                  <th className="p-4 font-medium">Đã cọc</th>
                  <th className="p-4 font-medium">Trạng thái</th>
                  <th className="p-4 font-medium text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-text-muted">Không tìm thấy đặt phòng nào phù hợp.</td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-border-subtle/50 hover:bg-bg-secondary/50 transition-colors group">
                      <td className="p-4">
                        <span className="font-mono text-accent-gold bg-accent-gold/10 px-2 py-1 rounded">{booking.id}</span>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-text-primary">{booking.customer}</div>
                        <div className="text-xs text-text-muted">{booking.phone}</div>
                      </td>
                      <td className="p-4 font-mono text-text-secondary">{booking.room}</td>
                      <td className="p-4">
                        <div className="text-text-primary">{booking.checkIn}</div>
                        <div className="text-xs text-text-muted">đến {booking.checkOut}</div>
                      </td>
                      <td className="p-4 text-text-primary font-mono">{booking.total.toLocaleString('vi-VN')}đ</td>
                      <td className="p-4 text-text-secondary font-mono">{booking.deposit.toLocaleString('vi-VN')}đ</td>
                      <td className="p-4">
                        <div className="flex flex-col gap-2 items-start">
                          {getStatusBadge(booking.status)}
                          <select 
                            className="bg-bg-primary border border-border-subtle text-text-secondary text-xs rounded px-2 py-1 outline-none focus:border-accent-neon w-full max-w-[140px]"
                            value={booking.status}
                            onChange={(e) => handleStatusChange(booking.id, parseInt(e.target.value))}
                          >
                            <option value="0">Đổi: Đã cọc</option>
                            <option value="1">Đổi: Đang ở (Check-in)</option>
                            <option value="2">Đổi: Đã xong (Check-out)</option>
                            <option value="3">Đổi: Đã hủy</option>
                          </select>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/staff/bookings/edit/${booking.id}`} className="p-2 text-text-muted hover:text-accent-neon hover:bg-accent-neon/10 rounded transition-colors" title="Sửa">
                            <Edit2 size={16} />
                          </Link>
                          <button onClick={() => handleDeleteBooking(booking.id)} className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-colors" title="Xóa đặt phòng">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="shrink-0 p-4 border-t border-border-subtle flex justify-between items-center text-sm text-text-muted bg-bg-secondary/30">
            <span>Hiển thị {filteredBookings.length} lượt đặt</span>
            <div className="flex gap-1">
              <button className="px-3 py-1 border border-border-subtle rounded hover:bg-bg-secondary disabled:opacity-50" disabled>Trước</button>
              <button className="px-3 py-1 border border-border-subtle rounded bg-accent-primary text-white border-accent-primary">1</button>
              <button className="px-3 py-1 border border-border-subtle rounded hover:bg-bg-secondary disabled:opacity-50" disabled>Sau</button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

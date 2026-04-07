'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ArrowLeft } from 'lucide-react';

export default function StaffEditBookingPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Cập nhật đặt phòng ${bookingId} thành công!`);
    router.push('/staff/bookings');
  };

  return (
    <DashboardLayout allowedRoles={['receptionist', 'manager']}>
      <div className="h-full flex flex-col min-h-0 max-w-4xl mx-auto w-full">
        <div className="shrink-0 flex items-center gap-4 mb-6">
          <Link href="/staff/bookings" className="p-2 bg-bg-secondary rounded hover:bg-border-subtle transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl text-text-primary">CẬP NHẬT ĐẶT PHÒNG: <span className="text-accent-neon font-mono">{bookingId}</span></h1>
            <p className="text-sm text-text-secondary">Chỉnh sửa thông tin đặt phòng của khách hàng</p>
          </div>
        </div>

        <div className="flex-1 overflow-auto pr-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section 1: Customer Info */}
            <div className="card-cinema p-6">
              <h2 className="text-lg text-text-primary font-bold mb-4">Thông tin khách hàng</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">Tên khách hàng *</label>
                  <input type="text" className="input-field" defaultValue="Nguyễn Văn A" required />
                </div>
                <div>
                  <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">Số điện thoại *</label>
                  <input type="tel" className="input-field" defaultValue="0901234567" required />
                </div>
                <div>
                  <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">Email</label>
                  <input type="email" className="input-field" defaultValue="nguyenvana@email.com" />
                </div>
                <div>
                  <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">CCCD / Passport</label>
                  <input type="text" className="input-field" defaultValue="012345678912" />
                </div>
              </div>
            </div>

            {/* Section 2: Booking Details */}
            <div className="card-cinema p-6">
              <h2 className="text-lg text-text-primary font-bold mb-4">Chi tiết đặt phòng</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">Phòng *</label>
                  <select className="input-field" defaultValue="RM-101" required>
                    <option value="RM-101">RM-101 (Single Standard)</option>
                    <option value="RM-205">RM-205 (Director Cut VIP)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">Trạng thái</label>
                  <select className="input-field" defaultValue="0">
                    <option value="0">Đã cọc</option>
                    <option value="1">Đang ở</option>
                    <option value="2">Đã thanh toán</option>
                    <option value="3">Đã hủy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">Ngày Check-in *</label>
                  <input type="date" className="input-field" defaultValue="2023-10-20" required />
                </div>
                <div>
                  <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">Ngày Check-out *</label>
                  <input type="date" className="input-field" defaultValue="2023-10-22" required />
                </div>
                <div>
                  <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">Tổng tiền (VNĐ)</label>
                  <input type="number" className="input-field font-mono text-accent-gold" defaultValue={900000} />
                </div>
                <div>
                  <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">Số tiền đã cọc (VNĐ)</label>
                  <input type="number" className="input-field font-mono" defaultValue={270000} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">Ghi chú</label>
                  <textarea className="input-field min-h-[80px] resize-y" defaultValue="Khách yêu cầu phòng yên tĩnh."></textarea>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pb-8">
              <Link href="/staff/bookings" className="btn-outline">
                HỦY BỎ
              </Link>
              <button type="submit" className="btn-primary">
                LƯU THAY ĐỔI
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

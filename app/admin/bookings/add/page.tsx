"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/layout/ToastProvider";
import { BOOKING_FORM_ROOM_OPTIONS } from "@/lib/status-config";

export default function AddBookingPage() {
  const router = useRouter();
  const { success } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    success("Thêm đặt phòng thành công!");
    router.push("/admin/bookings");
  };

  return (
    <DashboardLayout allowedRoles={["manager"]}>
      <div className="h-full flex flex-col min-h-0 max-w-4xl mx-auto w-full">
        <div className="shrink-0 flex items-center gap-4 mb-6">
          <Link
            href="/admin/bookings"
            className="p-2 bg-bg-secondary rounded hover:bg-border-subtle transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl text-text-primary">THÊM ĐẶT PHÒNG MỚI</h1>
            <p className="text-sm text-text-secondary">
              Tạo mới thông tin đặt phòng cho khách hàng
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-auto pr-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Customer Info */}
            <div className="card-cinema p-6">
              <h2 className="text-lg text-text-primary font-bold mb-4">
                Thông tin khách hàng
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                    Tên khách hàng *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="VD: Nguyễn Văn A"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="VD: 0901234567"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="VD: email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                    CCCD / Passport
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Số giấy tờ tùy thân"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Booking Details */}
            <div className="card-cinema p-6">
              <h2 className="text-lg text-text-primary font-bold mb-4">
                Chi tiết đặt phòng
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                    Chọn phòng *
                  </label>
                  <select className="input-field" required>
                    <option value="">-- Chọn phòng trống --</option>
                    {BOOKING_FORM_ROOM_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                    Số lượng khách *
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    min="1"
                    max="10"
                    defaultValue={1}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                    Ngày Check-in *
                  </label>
                  <input type="date" className="input-field" required />
                </div>
                <div>
                  <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                    Ngày Check-out *
                  </label>
                  <input type="date" className="input-field" required />
                </div>
                <div>
                  <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                    Tổng tiền dự kiến (VNĐ)
                  </label>
                  <input
                    type="number"
                    className="input-field font-mono text-accent-gold"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                    Số tiền đã cọc (VNĐ)
                  </label>
                  <input
                    type="number"
                    className="input-field font-mono"
                    placeholder="0"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                    Ghi chú
                  </label>
                  <textarea
                    className="input-field min-h-[80px] resize-y"
                    placeholder="Yêu cầu đặc biệt của khách hàng..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pb-8">
              <Link href="/admin/bookings" className="btn-outline">
                HỦY BỎ
              </Link>
              <button type="submit" className="btn-primary">
                TẠO ĐẶT PHÒNG
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

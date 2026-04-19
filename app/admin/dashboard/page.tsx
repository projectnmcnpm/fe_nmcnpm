"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  TrendingUp,
  Users,
  BedDouble,
  CalendarCheck,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { dataService } from "@/lib/data-service";
import type { Booking, Room } from "@/lib/mock-data";
import {
  ADMIN_ROOM_HEATMAP_CLASSES,
  ADMIN_ROOM_STATUS_FILTERS,
  BOOKING_STATUS_BADGE_CLASSES,
  BOOKING_STATUS_LABELS,
} from "@/lib/status-config";

export default function AdminDashboard() {
  const RECENT_BOOKINGS_LIMIT = 14;
  const ROOM_STATUS_LIMIT = 16;
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      const [bookingResult, roomResult] = await Promise.all([
        dataService.getBookings(),
        dataService.getRooms(),
      ]);
      setBookings(bookingResult);
      setRooms(roomResult);
    };

    void loadDashboardData();
  }, []);

  const totalRevenue = bookings
    .filter((b) => b.paymentStatus === "paid" && b.refundStatus !== "refunded")
    .reduce((acc, curr) => acc + curr.total, 0);
  const totalBookings = bookings.length;
  const availableRooms = rooms.filter((r) =>
    ADMIN_ROOM_STATUS_FILTERS["0"].includes(r.status),
  ).length;
  const activeRooms = rooms.filter((r) =>
    ADMIN_ROOM_STATUS_FILTERS["1"].includes(r.status),
  ).length;
  const cleaningRooms = rooms.filter((r) =>
    ADMIN_ROOM_STATUS_FILTERS["-1"].includes(r.status),
  ).length;
  const recentBookings = bookings.slice(0, RECENT_BOOKINGS_LIMIT);
  const visibleRooms = rooms.slice(0, ROOM_STATUS_LIMIT);

  const occupancyRate =
    rooms.length > 0 ? Math.round((activeRooms / rooms.length) * 100) : 0;

  const getCustomerName = (booking: Booking) => {
    if (booking.customerName && booking.customerName.trim().length > 0) {
      return booking.customerName;
    }
    return booking.userId?.split("@")[0] || "Khách hàng";
  };

  return (
    <DashboardLayout allowedRoles={["manager"]}>
      <div className="h-full flex flex-col min-h-0">
        {/* Header */}
        <div className="shrink-0 mb-4">
          <h1 className="text-2xl text-text-primary mb-1">
            TỔNG QUAN HỆ THỐNG
          </h1>
          <p className="text-sm text-text-secondary">
            Báo cáo hiệu suất kinh doanh hôm nay
          </p>
        </div>

        {/* KPI Cards */}
        <div className="shrink-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="card-cinema p-4 border-l-4 border-l-accent-gold">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-1">
                  Tổng Doanh thu
                </p>
                <h3 className="text-2xl font-display text-accent-gold">
                  {totalRevenue.toLocaleString()}đ
                </h3>
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
                <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-1">
                  Lượt đặt phòng
                </p>
                <h3 className="text-2xl font-display text-text-primary">
                  {totalBookings}
                </h3>
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
                <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-1">
                  Công suất phòng
                </p>
                <h3 className="text-2xl font-display text-text-primary">
                  {occupancyRate}%
                </h3>
              </div>
              <div className="p-1.5 bg-accent-primary/10 rounded-lg text-accent-primary">
                <BedDouble size={20} />
              </div>
            </div>
            <div className="w-full bg-bg-secondary h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-accent-primary h-full"
                style={{ width: `${occupancyRate}%` }}
              ></div>
            </div>
          </div>

          <div className="card-cinema p-4 border-l-4 border-l-blue-400">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-1">
                  Khách hàng mới
                </p>
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
              <h2 className="text-lg text-text-primary font-bold">
                ĐẶT PHÒNG GẦN ĐÂY
              </h2>
              <Link
                href="/admin/bookings"
                className="text-sm text-accent-neon hover:underline font-medium"
              >
                Xem tất cả &rarr;
              </Link>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-bg-card z-10">
                  <tr className="border-b border-border-subtle text-text-muted text-xs uppercase tracking-wider">
                    <th className="pb-2 font-medium">Email</th>
                    <th className="pb-2 font-medium">Tên khách hàng</th>
                    <th className="pb-2 font-medium">Phòng</th>
                    <th className="pb-2 font-medium">Tổng tiền</th>
                    <th className="pb-2 font-medium">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {recentBookings.map((row) => {
                    return (
                      <tr
                        key={row.id}
                        className="border-b border-border-subtle/50 hover:bg-bg-secondary/50 transition-colors group"
                      >
                        <td className="py-3 font-mono text-text-secondary group-hover:text-text-primary">
                          {row.userId}
                        </td>
                        <td className="py-3 text-text-primary">
                          {getCustomerName(row)}
                        </td>
                        <td className="py-3 text-text-secondary">
                          {row.roomName}
                        </td>
                        <td className="py-3 text-accent-gold font-mono">
                          {row.total.toLocaleString()}đ
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold uppercase ${BOOKING_STATUS_BADGE_CLASSES[row.status]}`}
                          >
                            {BOOKING_STATUS_LABELS[row.status]}
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
              <h2 className="text-lg text-text-primary font-bold">
                TRẠNG THÁI PHÒNG
              </h2>
              <Link
                href="/admin/rooms"
                className="text-sm text-accent-neon hover:underline font-medium"
              >
                Xem toàn bộ &rarr;
              </Link>
            </div>

            <div className="shrink-0 p-4 grid grid-cols-3 gap-2 border-b border-border-subtle bg-bg-primary/50">
              <div className="text-center p-2 rounded bg-success/10 border border-success/20">
                <div className="text-xl font-display text-success">
                  {availableRooms}
                </div>
                <div className="text-[10px] uppercase font-bold text-text-muted">
                  Trống
                </div>
              </div>
              <div className="text-center p-2 rounded bg-warning/10 border border-warning/20">
                <div className="text-xl font-display text-warning">
                  {activeRooms}
                </div>
                <div className="text-[10px] uppercase font-bold text-text-muted">
                  Đang ở
                </div>
              </div>
              <div className="text-center p-2 rounded bg-danger/10 border border-danger/20">
                <div className="text-xl font-display text-danger">
                  {cleaningRooms}
                </div>
                <div className="text-[10px] uppercase font-bold text-text-muted">
                  Đang dọn
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-hidden p-4">
              <div className="grid grid-cols-4 gap-2">
                {visibleRooms.map((room) => {
                  return (
                    <div
                      key={room.id}
                      className={`aspect-square rounded border flex items-center justify-center text-[11px] font-bold text-center leading-tight p-1 cursor-pointer transition-colors ${ADMIN_ROOM_HEATMAP_CLASSES[room.status]}`}
                      title={room.name}
                    >
                      {room.name}
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

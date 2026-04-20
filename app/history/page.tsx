"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Clock, CheckCircle, XCircle, Film } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/lib/auth-context";
import { dataService } from "@/lib/data-service";
import type { Booking } from "@/lib/mock-data";
import { useToast } from "@/components/layout/ToastProvider";

export default function HistoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [history, setHistory] = useState<Booking[]>([]);
  const { warning, success, error } = useToast();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const loadHistory = async () => {
        try {
          const bookings = await dataService.getBookings(user.email);
          setHistory(bookings);
        } catch (loadError) {
          console.error(loadError);
          error("Không thể tải lịch sử đặt phòng");
        }
      };

      void loadHistory();
    }
  }, [error, user]);

  const handleCancelClick = (bookingId: string) => {
    setBookingToCancel(bookingId);
    setCancelModalOpen(true);
  };

  const [cancelReason, setCancelReason] = useState("");

  const confirmCancelBooking = async () => {
    if (bookingToCancel && user) {
      const booking = history.find((b) => b.id === bookingToCancel);
      if (booking && booking.createdAt) {
        const createdTime = new Date(booking.createdAt).getTime();
        const now = new Date().getTime();
        const diffMinutes = (now - createdTime) / (1000 * 60);
        if (diffMinutes > 30) {
          warning(
            "Đã quá 30 phút kể từ lúc đặt phòng. Bạn sẽ mất cọc theo chính sách của chúng tôi.",
          );
        }
      }

      // In real app, we would pass cancelReason to backend
      try {
        await dataService.cancelBooking(bookingToCancel, cancelReason);
        const bookings = await dataService.getBookings(user.email);
        setHistory(bookings);
        setCancelModalOpen(false);
        setBookingToCancel(null);
        setCancelReason("");
        success("Đã hủy đặt phòng thành công.");
      } catch (cancelError) {
        console.error(cancelError);
        error("Hủy đặt phòng thất bại");
      }
    }
  };

  const closeCancelModal = () => {
    setCancelModalOpen(false);
    setBookingToCancel(null);
    setCancelReason("");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-bg-primary">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <Film size={64} className="text-accent-primary mb-6 opacity-50" />
          <h1 className="text-3xl text-text-primary mb-4">
            Vui lòng đăng nhập
          </h1>
          <p className="text-text-secondary mb-8">
            Bạn cần đăng nhập để xem lịch sử đặt phòng của mình.
          </p>
          <Link href="/login" className="btn-primary">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  const filteredHistory = history.filter((booking) => {
    if (filter === "all") return true;
    return booking.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "checked_in":
        return (
          <span className="px-3 py-1 bg-success/20 text-success rounded-full text-xs font-bold uppercase flex items-center gap-1">
            <CheckCircle size={14} /> Đã check-in
          </span>
        );
      case "in_stay":
        return (
          <span className="px-3 py-1 bg-accent-primary/20 text-accent-primary rounded-full text-xs font-bold uppercase flex items-center gap-1">
            <CheckCircle size={14} /> Đang ở
          </span>
        );
      case "upcoming":
        return (
          <span className="px-3 py-1 bg-accent-neon/20 text-accent-neon rounded-full text-xs font-bold uppercase flex items-center gap-1">
            <Clock size={14} /> Sắp tới
          </span>
        );
      case "cancelled":
        return (
          <span className="px-3 py-1 bg-danger/20 text-danger rounded-full text-xs font-bold uppercase flex items-center gap-1">
            <XCircle size={14} /> Đã hủy
          </span>
        );
      default:
        return null;
    }
  };

  const getRefundBadge = (booking: Booking) => {
    if (booking.status !== "cancelled") return null;

    const map = {
      refunded: {
        label: "Đã hoàn tiền",
        className: "bg-success/20 text-success border border-success/30",
      },
      eligible: {
        label: "Hủy được hoàn tiền",
        className: "bg-warning/20 text-warning border border-warning/30",
      },
      ineligible: {
        label: "Hủy không hoàn tiền",
        className: "bg-danger/20 text-danger border border-danger/30",
      },
      none: {
        label: "Không áp dụng",
        className:
          "bg-bg-secondary text-text-muted border border-border-subtle",
      },
    } as const;

    const resolved = map[booking.refundStatus || "none"];

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold uppercase inline-flex items-center gap-1 ${resolved.className}`}
      >
        {resolved.label}
      </span>
    );
  };

  const parseLocalDate = (value: string) => new Date(`${value}T00:00:00`);

  const formatBookingMoment = (
    date: string,
    time?: string,
    bookingType?: Booking["bookingType"],
  ) => {
    if (!date) return "-";

    const localDate = parseLocalDate(date);
    if (bookingType === "hour" && time) {
      return `${localDate.toLocaleDateString("vi-VN")} ${time}`;
    }

    return localDate.toLocaleDateString("vi-VN");
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="mb-10">
          <h1 className="text-4xl text-text-primary mb-2">LỊCH SỬ ĐẶT PHÒNG</h1>
          <p className="text-text-secondary">
            Quản lý các chuyến đi và trải nghiệm của bạn tại GenZ Cinema
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${filter === "all" ? "bg-text-primary text-bg-primary" : "bg-bg-secondary text-text-secondary hover:text-text-primary"}`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilter("upcoming")}
            className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${filter === "upcoming" ? "bg-accent-neon text-bg-primary" : "bg-bg-secondary text-text-secondary hover:text-text-primary"}`}
          >
            Sắp tới
          </button>
          <button
            onClick={() => setFilter("checked_in")}
            className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${filter === "checked_in" ? "bg-success text-bg-primary" : "bg-bg-secondary text-text-secondary hover:text-text-primary"}`}
          >
            Đã check-in
          </button>
          <button
            onClick={() => setFilter("in_stay")}
            className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${filter === "in_stay" ? "bg-accent-primary text-white" : "bg-bg-secondary text-text-secondary hover:text-text-primary"}`}
          >
            Đang ở
          </button>
          <button
            onClick={() => setFilter("cancelled")}
            className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${filter === "cancelled" ? "bg-danger text-white" : "bg-bg-secondary text-text-secondary hover:text-text-primary"}`}
          >
            Đã hủy
          </button>
        </div>

        {/* History List */}
        <div className="space-y-6">
          {filteredHistory.length === 0 ? (
            <div className="bg-bg-secondary border border-border-subtle rounded-2xl p-12 text-center">
              <h3 className="text-2xl text-text-primary mb-2">
                Không có dữ liệu
              </h3>
              <p className="text-text-secondary">
                Bạn chưa có đặt phòng nào trong danh mục này.
              </p>
            </div>
          ) : (
            filteredHistory.map((booking) => (
              <div
                key={booking.id}
                className="bg-bg-secondary border border-border-subtle rounded-2xl overflow-hidden flex flex-col md:flex-row group"
              >
                <div className="w-full md:w-64 h-48 md:h-auto relative overflow-hidden shrink-0">
                  <img
                    src={booking.image}
                    alt={booking.roomName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3">
                    {getStatusBadge(booking.status)}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-accent-primary font-mono text-sm mb-1">
                          Mã đặt phòng: {booking.id}
                        </div>
                        <h3 className="text-2xl text-text-primary font-display">
                          {booking.roomName}
                        </h3>
                        <div className="text-text-muted text-sm">
                          {booking.roomId}
                        </div>
                      </div>
                      <div className="text-right hidden md:block">
                        <div className="text-accent-gold font-display text-2xl">
                          {booking.total.toLocaleString("vi-VN")}đ
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-6 mt-6">
                      <div className="flex items-center gap-3 text-text-secondary bg-bg-primary px-4 py-2 rounded-lg border border-border-subtle">
                        <Calendar size={18} className="text-accent-neon" />
                        <div>
                          <div className="text-xs text-text-muted uppercase">
                            Nhận phòng
                          </div>
                          <div className="font-bold text-text-primary">
                            {formatBookingMoment(
                              booking.checkIn,
                              booking.checkInTime,
                              booking.bookingType,
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-text-secondary bg-bg-primary px-4 py-2 rounded-lg border border-border-subtle">
                        <Calendar size={18} className="text-accent-neon" />
                        <div>
                          <div className="text-xs text-text-muted uppercase">
                            Trả phòng
                          </div>
                          <div className="font-bold text-text-primary">
                            {formatBookingMoment(
                              booking.checkOut,
                              booking.checkOutTime,
                              booking.bookingType,
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-text-secondary bg-bg-primary px-4 py-2 rounded-lg border border-border-subtle">
                        <Clock size={18} className="text-accent-gold" />
                        <div>
                          <div className="text-xs text-text-muted uppercase">
                            Loại đặt
                          </div>
                          <div className="font-bold text-text-primary">
                            {booking.bookingType === "hour"
                              ? "Theo giờ"
                              : "Theo ngày"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-text-secondary bg-bg-primary px-4 py-2 rounded-lg border border-border-subtle">
                        <CheckCircle size={18} className="text-success" />
                        <div>
                          <div className="text-xs text-text-muted uppercase">
                            Hoàn tiền
                          </div>
                          <div className="font-bold text-text-primary">
                            {getRefundBadge(booking) || (
                              <span className="text-text-muted">
                                Chỉ hiển thị khi hủy
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {booking.status === "cancelled" && booking.cancelReason && (
                      <div className="mt-4 p-3 bg-danger/5 border border-danger/20 rounded-lg text-sm">
                        <span className="text-danger font-bold">
                          Lý do hủy:{" "}
                        </span>
                        <span className="text-text-secondary">
                          {booking.cancelReason}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-6 border-t border-border-subtle flex justify-between items-center">
                    <div className="md:hidden">
                      <div className="text-xs text-text-muted uppercase">
                        Tổng tiền
                      </div>
                      <div className="text-accent-gold font-display text-xl">
                        {booking.total.toLocaleString("vi-VN")}đ
                      </div>
                    </div>
                    <div className="flex gap-3 ml-auto">
                      <Link
                        href={`/rooms/${booking.roomId}`}
                        className="btn-outline py-2 px-4 text-sm"
                      >
                        Xem lại phòng
                      </Link>
                      {booking.status === "upcoming" && (
                        <button
                          onClick={() => handleCancelClick(booking.id)}
                          className="bg-danger/10 text-danger border border-danger/30 hover:bg-danger hover:text-white px-4 py-2 rounded font-bold text-sm transition-colors"
                        >
                          Hủy đặt phòng
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-bg-secondary border border-border-subtle rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 text-danger mb-4">
              <XCircle size={32} />
              <h3 className="text-2xl font-display text-text-primary">
                Xác nhận hủy phòng
              </h3>
            </div>
            <p className="text-text-secondary mb-4">
              Bạn có chắc chắn muốn hủy đặt phòng này không? Hành động này không
              thể hoàn tác.
            </p>
            <div className="bg-danger/10 text-danger p-3 rounded-lg text-sm mb-6 border border-danger/20">
              <strong>Lưu ý:</strong> Hủy miễn phí trong vòng 30 phút kể từ lúc
              đặt. Sau 30 phút, bạn sẽ mất cọc.
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-text-primary mb-2">
                Lý do hủy phòng (Bắt buộc)
              </label>
              <textarea
                className="w-full bg-bg-primary border border-border-subtle rounded-lg p-3 text-text-primary focus:outline-none focus:border-accent-primary transition-colors resize-none"
                rows={3}
                placeholder="Vui lòng cho chúng tôi biết lý do bạn hủy phòng..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              ></textarea>
            </div>

            <div className="flex gap-4 justify-end">
              <button
                onClick={closeCancelModal}
                className="btn-outline py-2 px-4 text-sm"
              >
                Đóng
              </button>
              <button
                onClick={confirmCancelBooking}
                disabled={!cancelReason.trim()}
                className="bg-danger text-white hover:bg-red-600 px-6 py-2 rounded font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Đồng ý hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

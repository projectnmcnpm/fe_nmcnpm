"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Users } from "lucide-react";
import { useToast } from "@/components/layout/ToastProvider";
import { useAuth } from "@/lib/auth-context";
import { dataService } from "@/lib/data-service";
import type { Room } from "@/lib/mock-data";

type BookingType = "day" | "hour";

type BookingEditFormProps = {
  bookingId: string;
  backHref: string;
  successRedirectHref: string;
  successMessage: string;
  pageTitle: string;
  pageSubtitle: string;
  submitLabel: string;
};

const DEPOSIT_RATE = 0.3;

function formatCurrency(value: number) {
  return value.toLocaleString("vi-VN");
}

function parseDateTime(date: string, time: string) {
  return new Date(`${date}T${time}`);
}

export default function BookingEditForm({
  bookingId,
  backHref,
  successRedirectHref,
  successMessage,
  pageTitle,
  pageSubtitle,
  submitLabel,
}: BookingEditFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { success, error: showError } = useToast();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isLoadingBooking, setIsLoadingBooking] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [bookingType, setBookingType] = useState<BookingType>("day");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [bookingUserId, setBookingUserId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerIdNumber, setCustomerIdNumber] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingRooms(true);
        setIsLoadingBooking(true);

        const [roomList, booking] = await Promise.all([
          dataService.getRooms(),
          dataService.getBookingById(bookingId),
        ]);

        if (!booking) {
          showError("Không tìm thấy đặt phòng");
          router.push(successRedirectHref);
          return;
        }

        setRooms(roomList);
        setSelectedRoomId(booking.roomId);
        setBookingUserId(booking.userId || "");
        setBookingType(booking.bookingType === "hour" ? "hour" : "day");
        setCheckIn(booking.checkIn || "");
        setCheckOut(booking.checkOut || "");
        setCheckInTime(booking.checkInTime || "");
        setCheckOutTime(booking.checkOutTime || "");
        setCustomerName(booking.customerName || "");
        setCustomerEmail(booking.userId || "");
        setCustomerPhone(booking.customerPhone || "");
        setCustomerIdNumber(booking.customerIdNumber || "");
        setNotes(booking.note || "");
      } catch (error) {
        console.error(error);
        showError("Không thể tải thông tin đặt phòng");
      } finally {
        setIsLoadingRooms(false);
        setIsLoadingBooking(false);
      }
    };

    void loadData();
  }, [bookingId, router, showError, successRedirectHref]);

  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === selectedRoomId) || null,
    [rooms, selectedRoomId],
  );

  const hourlyPrice = useMemo(() => {
    if (!selectedRoom) return 0;
    return selectedRoom.pricePerHour || Math.round(selectedRoom.price / 4);
  }, [selectedRoom]);

  const calculateTotalPrice = () => {
    if (!selectedRoom) return 0;

    if (bookingType === "hour") {
      if (!checkIn || !checkOut || !checkInTime || !checkOutTime) return 0;

      const start = parseDateTime(checkIn, checkInTime);
      const end = parseDateTime(checkOut, checkOutTime);
      const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

      if (Number.isNaN(diffHours) || diffHours <= 0) return 0;

      return Math.ceil(diffHours) * hourlyPrice;
    }

    if (!checkIn || !checkOut) return 0;

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

    if (Number.isNaN(diffDays) || diffDays <= 0) return 0;

    return Math.ceil(diffDays) * selectedRoom.price;
  };

  const totalPrice = calculateTotalPrice();
  const depositAmount =
    totalPrice > 0 ? Math.round(totalPrice * DEPOSIT_RATE) : 0;

  const validateBooking = () => {
    if (!user) {
      showError("Vui lòng đăng nhập để cập nhật đặt phòng");
      router.push("/login");
      return false;
    }

    if (!selectedRoom) {
      showError("Vui lòng chọn phòng");
      return false;
    }

    if (selectedRoom.status === "maintenance") {
      showError("Phòng đang bảo trì, không thể đặt");
      return false;
    }

    if (!customerName.trim()) {
      showError("Vui lòng nhập họ và tên khách hàng");
      return false;
    }

    if (!customerEmail.trim()) {
      showError("Vui lòng nhập email khách hàng");
      return false;
    }

    if (!customerPhone.trim()) {
      showError("Vui lòng nhập số điện thoại khách hàng");
      return false;
    }

    if (!customerIdNumber.trim()) {
      showError("Vui lòng nhập số CCCD/Passport");
      return false;
    }

    const normalizedEmail = customerEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      showError("Email khách hàng không hợp lệ");
      return false;
    }

    const normalizedPhone = customerPhone.replace(/\s+/g, "");
    if (!/^(0\d{9,10}|\+84\d{9,10})$/.test(normalizedPhone)) {
      showError(
        "Số điện thoại không hợp lệ (VD: 0901234567 hoặc +84901234567)",
      );
      return false;
    }

    if (!/^\d{12}$/.test(customerIdNumber.replace(/\s+/g, ""))) {
      showError("Số CCCD phải gồm đúng 12 chữ số");
      return false;
    }

    if (!checkIn || !checkOut) {
      showError("Vui lòng chọn ngày nhận và trả phòng");
      return false;
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (
      Number.isNaN(checkInDate.getTime()) ||
      Number.isNaN(checkOutDate.getTime())
    ) {
      showError("Ngày nhận/trả phòng không hợp lệ");
      return false;
    }

    if (bookingType === "day") {
      if (checkOutDate.getTime() <= checkInDate.getTime()) {
        showError("Đặt theo đêm cần ngày trả phòng sau ngày nhận phòng");
        return false;
      }
    } else {
      if (!checkInTime || !checkOutTime) {
        showError("Vui lòng chọn giờ nhận và giờ trả phòng");
        return false;
      }

      const start = parseDateTime(checkIn, checkInTime);
      const end = parseDateTime(checkOut, checkOutTime);

      if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime()) ||
        end.getTime() <= start.getTime()
      ) {
        showError("Giờ trả phòng phải sau giờ nhận phòng");
        return false;
      }
    }

    if (totalPrice <= 0) {
      showError("Vui lòng kiểm tra lại phòng và thời gian đặt");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateBooking()) {
      return;
    }

    if (!selectedRoom || !user) {
      return;
    }

    try {
      setIsSubmitting(true);

      await dataService.updateBooking(bookingId, {
        roomId: selectedRoom.id,
        roomName: selectedRoom.name,
        userId: bookingUserId || customerEmail.trim().toLowerCase(),
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        customerPhone: customerPhone.replace(/\s+/g, ""),
        customerIdNumber: customerIdNumber.replace(/\s+/g, ""),
        checkIn,
        checkOut,
        checkInTime: bookingType === "hour" ? checkInTime : undefined,
        checkOutTime: bookingType === "hour" ? checkOutTime : undefined,
        bookingType,
        total: totalPrice,
        note: notes.trim() || undefined,
      });

      success(successMessage);
      router.push(successRedirectHref);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể cập nhật đặt phòng";
      showError(message);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col min-h-0 max-w-6xl mx-auto w-full">
      <div className="shrink-0 flex items-center gap-4 mb-6">
        <Link
          href={backHref}
          className="p-2 bg-bg-secondary rounded hover:bg-border-subtle transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl text-text-primary">{pageTitle}</h1>
          <p className="text-sm text-text-secondary">{pageSubtitle}</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto pr-2">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="card-cinema p-6">
            <h2 className="text-lg text-text-primary font-bold mb-4">
              Thông tin khách hàng
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                  Họ và tên khách hàng *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="VD: Nguyễn Văn A"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                  Email *
                </label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="VD: email@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
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
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                  CCCD / Passport *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="12 chữ số"
                  value={customerIdNumber}
                  onChange={(e) => setCustomerIdNumber(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="card-cinema p-6">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h2 className="text-lg text-text-primary font-bold">
                    Chi tiết đặt phòng
                  </h2>
                  <div className="flex gap-2 p-1 bg-bg-primary rounded-lg border border-border-subtle">
                    <button
                      type="button"
                      onClick={() => setBookingType("day")}
                      className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${bookingType === "day" ? "bg-accent-primary text-white" : "text-text-secondary hover:text-text-primary"}`}
                    >
                      Theo đêm
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingType("hour")}
                      className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${bookingType === "hour" ? "bg-accent-primary text-white" : "text-text-secondary hover:text-text-primary"}`}
                    >
                      Theo giờ
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                      Chọn phòng *
                    </label>
                    <select
                      className="input-field"
                      value={selectedRoomId}
                      onChange={(e) => setSelectedRoomId(e.target.value)}
                      required
                      disabled={isLoadingRooms || isLoadingBooking}
                    >
                      <option value="">
                        {isLoadingRooms ? "Đang tải..." : "-- Chọn phòng --"}
                      </option>
                      {rooms.map((room) => {
                        const hourly =
                          room.pricePerHour || Math.round(room.price / 4);
                        const isMaintenance = room.status === "maintenance";

                        return (
                          <option
                            key={room.id}
                            value={room.id}
                            disabled={isMaintenance}
                          >
                            {room.name} - {room.type} - {room.capacity ?? "?"}{" "}
                            khách - {formatCurrency(room.price)}đ/đêm -{" "}
                            {formatCurrency(hourly)}đ/giờ
                            {isMaintenance ? " (bảo trì)" : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                      Ghi chú
                    </label>
                    <textarea
                      className="input-field min-h-[112px] resize-y"
                      placeholder="Yêu cầu đặc biệt của khách hàng..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                        Ngày check-in *
                      </label>
                      <div className="relative">
                        <Calendar
                          className="absolute left-3 top-3 text-text-muted"
                          size={18}
                        />
                        <input
                          type="date"
                          className="input-field bg-bg-primary pl-10"
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {bookingType === "hour" && (
                      <div>
                        <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                          Giờ check-in *
                        </label>
                        <div className="relative">
                          <Clock
                            className="absolute left-3 top-3 text-text-muted"
                            size={18}
                          />
                          <input
                            type="time"
                            className="input-field bg-bg-primary pl-10"
                            value={checkInTime}
                            onChange={(e) => setCheckInTime(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                        Ngày check-out *
                      </label>
                      <div className="relative">
                        <Calendar
                          className="absolute left-3 top-3 text-text-muted"
                          size={18}
                        />
                        <input
                          type="date"
                          className="input-field bg-bg-primary pl-10"
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {bookingType === "hour" && (
                      <div>
                        <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                          Giờ check-out *
                        </label>
                        <div className="relative">
                          <Clock
                            className="absolute left-3 top-3 text-text-muted"
                            size={18}
                          />
                          <input
                            type="time"
                            className="input-field bg-bg-primary pl-10"
                            value={checkOutTime}
                            onChange={(e) => setCheckOutTime(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="card-cinema p-6 sticky top-6">
                <h3 className="text-lg text-text-primary font-bold mb-4">
                  Tóm tắt đặt phòng
                </h3>

                {selectedRoom ? (
                  <div className="space-y-5">
                    <div className="bg-bg-primary border border-border-subtle rounded-xl p-4">
                      <div className="flex justify-between gap-4 mb-3">
                        <div>
                          <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
                            Phòng đang chọn
                          </p>
                          <h4 className="text-lg text-text-primary font-semibold">
                            {selectedRoom.name}
                          </h4>
                          <p className="text-sm text-text-secondary">
                            {selectedRoom.type}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
                            Trạng thái
                          </p>
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase ${selectedRoom.status === "maintenance" ? "bg-danger/15 text-danger" : "bg-success/15 text-success"}`}
                          >
                            {selectedRoom.status === "maintenance"
                              ? "Bảo trì"
                              : "Trống"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm text-text-secondary">
                        <div className="bg-bg-secondary rounded-lg p-3">
                          <div className="text-xs text-text-muted uppercase tracking-wider mb-1">
                            Sức chứa
                          </div>
                          <div className="font-semibold text-text-primary flex items-center gap-2">
                            <Users size={16} />
                            {selectedRoom.capacity ?? "Chưa cập nhật"}
                          </div>
                        </div>
                        <div className="bg-bg-secondary rounded-lg p-3">
                          <div className="text-xs text-text-muted uppercase tracking-wider mb-1">
                            Giá theo đêm
                          </div>
                          <div className="font-semibold text-text-primary">
                            {formatCurrency(selectedRoom.price)}đ
                          </div>
                        </div>
                        <div className="bg-bg-secondary rounded-lg p-3 col-span-2">
                          <div className="text-xs text-text-muted uppercase tracking-wider mb-1">
                            Giá theo giờ
                          </div>
                          <div className="font-semibold text-text-primary">
                            {formatCurrency(hourlyPrice)}đ/giờ
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border-subtle pt-5 space-y-3">
                      <div className="flex justify-between items-center text-text-secondary">
                        <span>Loại đặt phòng</span>
                        <span className="font-semibold text-text-primary">
                          {bookingType === "day" ? "Theo đêm" : "Theo giờ"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-text-secondary">
                        <span>Tổng tiền</span>
                        <span className="font-semibold text-accent-gold text-lg">
                          {formatCurrency(totalPrice)}đ
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-text-secondary">
                        <span>Tiền cọc (30%)</span>
                        <span className="font-semibold text-text-primary">
                          {formatCurrency(depositAmount)}đ
                        </span>
                      </div>
                      <div className="text-xs text-text-muted leading-relaxed bg-bg-primary border border-border-subtle rounded-lg p-3">
                        Tổng tiền và tiền cọc được tính tự động theo loại đặt
                        phòng, giá phòng và thời gian bạn chọn.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-text-muted bg-bg-primary border border-border-subtle rounded-xl p-4">
                    Vui lòng chọn phòng để xem giá và sức chứa.
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting || isLoadingRooms || isLoadingBooking}
                >
                  {isSubmitting ? "Đang xử lý..." : submitLabel}
                </button>
                <Link
                  href={backHref}
                  className="btn-outline w-full text-center"
                >
                  HỦY BỎ
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

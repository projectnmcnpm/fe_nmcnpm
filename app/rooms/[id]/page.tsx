"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  MonitorPlay,
  Wifi,
  Coffee,
  Calendar,
  CheckCircle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/lib/auth-context";
import { dataService } from "@/lib/data-service";
import type { Room } from "@/lib/mock-data";
import { useToast } from "@/components/layout/ToastProvider";

export default function RoomDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { warning } = useToast();
  const bookingFormRef = useRef<HTMLDivElement>(null);

  const roomId = params.id as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("30");
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerIdNumber, setCustomerIdNumber] = useState("");
  const [showRecentHistory, setShowRecentHistory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [bookingType, setBookingType] = useState<"day" | "hour">("day");
  const [checkInTime, setCheckInTime] = useState("14:00");
  const [checkOutTime, setCheckOutTime] = useState("12:00");

  // 1: Chọn phòng, 2: Xác nhận, 3: Hoàn tất
  const [step, setStep] = useState(1);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Mock schedule for the room (10 days)
  const roomSchedule = Array.from({ length: 10 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      date: date.toLocaleDateString("vi-VN"),
      time: i % 3 === 0 ? "14:00 - 18:00" : i % 4 === 0 ? "Cả ngày" : "Trống",
      status: i % 3 === 0 || i % 4 === 0 ? "booked" : "available",
    };
  });

  useEffect(() => {
    const loadRoom = async () => {
      const foundRoom = await dataService.getRoomById(roomId);
      if (foundRoom) {
        setRoom(foundRoom);
      }
    };

    void loadRoom();
  }, [roomId]);

  const validateBookingDateTime = () => {
    if (!checkIn || !checkOut) {
      warning("Vui lòng chọn ngày nhận và trả phòng!");
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate < today) {
      warning("Ngày nhận phòng không được ở quá khứ.");
      return false;
    }

    if (checkOutDate < checkInDate) {
      warning("Ngày trả phòng phải sau hoặc bằng ngày nhận phòng.");
      return false;
    }

    if (
      bookingType === "day" &&
      checkOutDate.getTime() === checkInDate.getTime()
    ) {
      warning("Đặt theo ngày yêu cầu ngày trả phòng phải sau ngày nhận phòng.");
      return false;
    }

    if (bookingType === "hour") {
      const t1 = new Date(`2000-01-01T${checkInTime}`);
      const t2 = new Date(`2000-01-01T${checkOutTime}`);
      let hours = (t2.getTime() - t1.getTime()) / (1000 * 60 * 60);
      if (hours <= 0) hours += 24;

      if (hours <= 0) {
        warning("Khung giờ đặt phòng không hợp lệ.");
        return false;
      }
    }

    return true;
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      warning("Vui lòng đăng nhập để đặt phòng!");
      router.push("/login");
      return;
    }

    if (!validateBookingDateTime()) {
      return;
    }

    setStep(2);
  };

  const calculateTotalPrice = () => {
    if (!room) return 0;
    if (bookingType === "hour") {
      // Simple calculation: 1 hour minimum
      const t1 = new Date(`2000-01-01T${checkInTime}`);
      const t2 = new Date(`2000-01-01T${checkOutTime}`);
      let hours = (t2.getTime() - t1.getTime()) / (1000 * 60 * 60);
      if (hours <= 0) hours += 24; // next day
      return (
        (room.pricePerHour || Math.round(room.price / 4)) * Math.ceil(hours)
      );
    } else {
      const d1 = new Date(checkIn);
      const d2 = new Date(checkOut);
      let days = (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24);
      if (days <= 0) days = 1;
      return room.price * days;
    }
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!room || !user || isSubmitting) return;

    if (!validateBookingDateTime()) {
      return;
    }

    if (!customerPhone.trim() || !customerIdNumber.trim()) {
      warning("Vui lòng nhập đầy đủ số điện thoại và CCCD.");
      return;
    }

    const normalizedPhone = customerPhone.replace(/\s+/g, "");
    const normalizedIdNumber = customerIdNumber.replace(/\s+/g, "");

    if (!/^(0\d{9,10}|\+84\d{9,10})$/.test(normalizedPhone)) {
      warning("Số điện thoại không hợp lệ (VD: 0901234567 hoặc +84901234567).");
      return;
    }

    if (!/^\d{12}$/.test(normalizedIdNumber)) {
      warning("Số CCCD phải gồm đúng 12 chữ số.");
      return;
    }

    const totalPrice = calculateTotalPrice();
    const totalToPay = paymentAmount === "30" ? totalPrice * 0.3 : totalPrice;

    setIsSubmitting(true);
    try {
      await dataService.createBooking({
        roomId: room.id,
        roomName: room.name,
        userId: user.email,
        customerPhone: normalizedPhone,
        customerIdNumber: normalizedIdNumber,
        checkIn,
        checkOut,
        checkInTime: bookingType === "hour" ? checkInTime : undefined,
        checkOutTime: bookingType === "hour" ? checkOutTime : undefined,
        bookingType,
        total: totalToPay,
        status: "upcoming",
        image: room.image,
        paymentMethod,
        paymentAmount,
        createdAt: new Date().toISOString(),
      });

      setStep(3);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!room) {
    return (
      <div className="min-h-screen flex flex-col bg-bg-primary">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-text-primary">
          Đang tải thông tin phòng...
        </div>
      </div>
    );
  }

  const totalPrice = calculateTotalPrice();
  const totalToPay = paymentAmount === "30" ? totalPrice * 0.3 : totalPrice;

  const scrollToBooking = () => {
    bookingFormRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8 w-full">
        {step === 1 && (
          <Link
            href="/rooms"
            className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-8"
          >
            <ArrowLeft size={20} />
            Quay lại danh sách phòng
          </Link>
        )}

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8 md:mb-12 relative max-w-3xl mx-auto gap-2">
          <div className="absolute left-0 top-1/2 w-full h-1 bg-border-subtle -z-10 -translate-y-1/2"></div>
          <div
            className={`absolute left-0 top-1/2 h-1 bg-accent-primary -z-10 -translate-y-1/2 transition-all duration-500 ${step === 1 ? "w-0" : step === 2 ? "w-1/2" : "w-full"}`}
          ></div>

          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? "bg-accent-primary text-white" : "bg-bg-secondary border-2 border-border-subtle text-text-muted"}`}
            >
              1
            </div>
            <span
              className={`hidden sm:inline text-sm font-bold ${step >= 1 ? "text-text-primary" : "text-text-muted"}`}
            >
              Chọn phòng
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? "bg-accent-primary text-white" : "bg-bg-secondary border-2 border-border-subtle text-text-muted"}`}
            >
              2
            </div>
            <span
              className={`hidden sm:inline text-sm font-bold ${step >= 2 ? "text-text-primary" : "text-text-muted"}`}
            >
              Xác nhận
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? "bg-accent-primary text-white" : "bg-bg-secondary border-2 border-border-subtle text-text-muted"}`}
            >
              3
            </div>
            <span
              className={`hidden sm:inline text-sm font-bold ${step >= 3 ? "text-text-primary" : "text-text-muted"}`}
            >
              Hoàn tất
            </span>
          </div>
        </div>

        {step === 1 && (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Room Details */}
            <div className="order-2 lg:order-1 w-full lg:w-2/3">
              {/* Main Image */}
              <div className="relative h-[250px] sm:h-[320px] md:h-[460px] rounded-2xl overflow-hidden mb-4">
                <img
                  src={room.image}
                  alt={room.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white text-sm font-bold px-4 py-2 rounded border border-white/10 uppercase">
                  {room.type}
                </div>
              </div>

              {/* Gallery Images */}
              {room.gallery && room.gallery.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                  {room.gallery
                    .slice(0, 4)
                    .map((imgUrl: string, idx: number) => (
                      <div
                        key={idx}
                        className="h-24 md:h-32 rounded-lg overflow-hidden border border-border-subtle"
                      >
                        <img
                          src={imgUrl}
                          alt={`${room.name} gallery ${idx}`}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500 cursor-pointer"
                        />
                      </div>
                    ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-6 mt-8">
                <div>
                  <div className="text-accent-primary font-mono mb-2">
                    {room.id}
                  </div>
                  <h1 className="text-3xl md:text-5xl text-text-primary leading-tight">
                    {room.name}
                  </h1>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-accent-gold font-display text-3xl md:text-4xl">
                    {room.price.toLocaleString("vi-VN")}đ
                  </div>
                  <div className="text-text-muted">/ đêm</div>
                </div>
              </div>

              <div className="prose prose-invert max-w-none mb-10">
                <p className="text-lg text-text-secondary leading-relaxed">
                  {room.description}
                </p>
              </div>

              <h3 className="text-2xl text-text-primary mb-6 border-b border-border-subtle pb-4">
                Tiện nghi phòng
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-10">
                {room.amenities.map((amenity: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 text-text-secondary bg-bg-secondary p-3 md:p-4 rounded-xl border border-border-subtle"
                  >
                    {amenity.includes("Người") && (
                      <Users size={18} className="text-accent-primary" />
                    )}
                    {(amenity.includes("4K") || amenity.includes("HD")) && (
                      <MonitorPlay size={18} className="text-accent-neon" />
                    )}
                    {amenity.includes("Wifi") && (
                      <Wifi size={18} className="text-accent-primary" />
                    )}
                    {amenity.includes("Bồn tắm") && (
                      <Coffee size={18} className="text-accent-gold" />
                    )}
                    {amenity.includes("Netflix") && (
                      <MonitorPlay size={18} className="text-danger" />
                    )}
                    {amenity.includes("PS5") && (
                      <MonitorPlay size={18} className="text-blue-500" />
                    )}
                    {amenity.includes("Ban công") && (
                      <Coffee size={18} className="text-success" />
                    )}
                    {amenity.includes("Massage") && (
                      <Users size={18} className="text-accent-gold" />
                    )}
                    {amenity.includes("Mini Bar") && (
                      <Coffee size={18} className="text-accent-neon" />
                    )}
                    <span className="font-medium text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Booking Form Sidebar */}
            <div
              ref={bookingFormRef}
              className="order-1 lg:order-2 w-full lg:w-1/3"
            >
              <div className="bg-bg-secondary border border-border-subtle rounded-2xl p-5 md:p-8 lg:sticky lg:top-24">
                <h3 className="text-2xl text-text-primary mb-6 font-display">
                  Đặt phòng này
                </h3>

                {room.status === "full" ? (
                  <div className="bg-danger/10 border border-danger/30 text-danger p-4 rounded-xl text-center font-medium">
                    Phòng này hiện đã được đặt kín. Vui lòng chọn phòng khác
                    hoặc ngày khác.
                  </div>
                ) : (
                  <form onSubmit={handleNextStep} className="space-y-6">
                    {/* Booking Type Selection */}
                    <div className="flex gap-2 p-1 bg-bg-primary rounded-lg border border-border-subtle">
                      <button
                        type="button"
                        onClick={() => setBookingType("day")}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${bookingType === "day" ? "bg-accent-primary text-white" : "text-text-secondary hover:text-text-primary"}`}
                      >
                        Theo ngày
                      </button>
                      <button
                        type="button"
                        onClick={() => setBookingType("hour")}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${bookingType === "hour" ? "bg-accent-primary text-white" : "text-text-secondary hover:text-text-primary"}`}
                      >
                        Theo giờ
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className={bookingType === "day" ? "col-span-2" : ""}
                      >
                        <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                          Nhận phòng
                        </label>
                        <div className="relative">
                          <Calendar
                            className="absolute left-3 top-3 text-text-muted"
                            size={18}
                          />
                          <input
                            type="date"
                            required
                            value={checkIn}
                            onChange={(e) => setCheckIn(e.target.value)}
                            className="input-field bg-bg-primary pl-10 text-sm"
                          />
                        </div>
                      </div>

                      {bookingType === "hour" && (
                        <div>
                          <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                            Giờ nhận
                          </label>
                          <input
                            type="time"
                            required
                            value={checkInTime}
                            onChange={(e) => setCheckInTime(e.target.value)}
                            className="input-field bg-bg-primary text-sm"
                          />
                        </div>
                      )}

                      <div
                        className={bookingType === "day" ? "col-span-2" : ""}
                      >
                        <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                          Trả phòng
                        </label>
                        <div className="relative">
                          <Calendar
                            className="absolute left-3 top-3 text-text-muted"
                            size={18}
                          />
                          <input
                            type="date"
                            required
                            value={checkOut}
                            onChange={(e) => setCheckOut(e.target.value)}
                            className="input-field bg-bg-primary pl-10 text-sm"
                          />
                        </div>
                      </div>

                      {bookingType === "hour" && (
                        <div>
                          <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                            Giờ trả
                          </label>
                          <input
                            type="time"
                            required
                            value={checkOutTime}
                            onChange={(e) => setCheckOutTime(e.target.value)}
                            className="input-field bg-bg-primary text-sm"
                          />
                        </div>
                      )}
                    </div>

                    <div className="border-t border-border-subtle pt-6 mt-6">
                      <div className="flex justify-between items-center mb-2 text-text-secondary">
                        <span>
                          Giá {bookingType === "day" ? "mỗi đêm" : "mỗi giờ"}
                        </span>
                        <span>
                          {bookingType === "day"
                            ? room.price.toLocaleString("vi-VN")
                            : (
                                room.pricePerHour || Math.round(room.price / 4)
                              ).toLocaleString("vi-VN")}
                          đ
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-lg font-bold text-text-primary mt-2">
                        <span>Tạm tính</span>
                        <span className="text-accent-gold">
                          {calculateTotalPrice().toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn-primary w-full py-4 text-lg mt-4"
                    >
                      TIẾP TỤC ĐẶT PHÒNG
                    </button>
                  </form>
                )}

                {/* Room Schedule Button */}
                <div className="mt-8 pt-6 border-t border-border-subtle">
                  <button
                    onClick={() => setIsScheduleModalOpen(true)}
                    className="w-full btn-outline py-3 flex items-center justify-center gap-2"
                  >
                    <Calendar size={18} />
                    Xem lịch trống (10 ngày tới)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="order-2 lg:order-1 lg:col-span-2 space-y-6">
                {/* Thông tin khách hàng */}
                <div className="bg-bg-secondary border border-border-subtle rounded-2xl p-5 md:p-6">
                  <h3 className="text-xl text-text-primary mb-4 font-bold">
                    Thông tin khách hàng
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-text-muted font-bold mb-1 uppercase tracking-wider">
                        Họ và tên
                      </label>
                      <div className="text-text-primary bg-bg-primary px-4 py-3 rounded-lg border border-border-subtle">
                        {user?.name}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-text-muted font-bold mb-1 uppercase tracking-wider">
                        Email
                      </label>
                      <div className="text-text-primary bg-bg-primary px-4 py-3 rounded-lg border border-border-subtle">
                        {user?.email}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-text-muted font-bold mb-1 uppercase tracking-wider">
                        Số điện thoại *
                      </label>
                      <input
                        type="tel"
                        className="input-field bg-bg-primary"
                        placeholder="Nhập số điện thoại của bạn"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-text-muted font-bold mb-1 uppercase tracking-wider">
                        Số CCCD *
                      </label>
                      <input
                        type="text"
                        className="input-field bg-bg-primary"
                        placeholder="Nhập số CCCD của bạn"
                        value={customerIdNumber}
                        onChange={(e) => setCustomerIdNumber(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Thanh toán */}
                <div className="bg-bg-secondary border border-border-subtle rounded-2xl p-5 md:p-6">
                  <h3 className="text-xl text-text-primary mb-4 font-bold">
                    Thanh toán
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm text-text-muted font-bold uppercase tracking-wider mb-3">
                        Mức thanh toán
                      </label>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <label
                          className={`flex items-center gap-3 cursor-pointer bg-bg-primary px-4 py-4 rounded-xl border flex-1 transition-colors ${paymentAmount === "30" ? "border-accent-primary" : "border-border-subtle"}`}
                        >
                          <input
                            type="radio"
                            name="paymentAmount"
                            value="30"
                            checked={paymentAmount === "30"}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            className="accent-accent-primary w-4 h-4"
                          />
                          <span className="text-text-primary font-medium">
                            Cọc 30%
                          </span>
                        </label>
                        <label
                          className={`flex items-center gap-3 cursor-pointer bg-bg-primary px-4 py-4 rounded-xl border flex-1 transition-colors ${paymentAmount === "100" ? "border-accent-primary" : "border-border-subtle"}`}
                        >
                          <input
                            type="radio"
                            name="paymentAmount"
                            value="100"
                            checked={paymentAmount === "100"}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            className="accent-accent-primary w-4 h-4"
                          />
                          <span className="text-text-primary font-medium">
                            Thanh toán 100%
                          </span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-text-muted font-bold uppercase tracking-wider mb-3">
                        Phương thức thanh toán
                      </label>
                      <div className="flex flex-col gap-3">
                        <label
                          className={`flex items-center gap-3 cursor-pointer bg-bg-primary px-4 py-4 rounded-xl border transition-colors ${paymentMethod === "bank" ? "border-accent-primary" : "border-border-subtle"}`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="bank"
                            checked={paymentMethod === "bank"}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="accent-accent-primary w-4 h-4"
                          />
                          <span className="text-text-primary font-medium">
                            Chuyển khoản ngân hàng (QR Code)
                          </span>
                        </label>
                        <label
                          className={`flex items-center gap-3 cursor-pointer bg-bg-primary px-4 py-4 rounded-xl border transition-colors ${paymentMethod === "counter" ? "border-accent-primary" : "border-border-subtle"}`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="counter"
                            checked={paymentMethod === "counter"}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="accent-accent-primary w-4 h-4"
                          />
                          <span className="text-text-primary font-medium">
                            Thanh toán tại quầy
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chính sách hủy phòng */}
                <div className="bg-bg-secondary border border-border-subtle rounded-2xl p-5 md:p-6">
                  <h3 className="text-xl text-text-primary mb-4 font-bold">
                    Chính sách hủy phòng
                  </h3>
                  <ul className="list-disc list-inside text-text-secondary space-y-2 text-sm">
                    <li>Hủy miễn phí trong vòng 30 phút kể từ lúc đặt.</li>
                    <li>Sau 30 phút (kể từ lúc đặt) sẽ mất cọc nếu hủy.</li>
                    <li>
                      Không đến nhận phòng (No-show) sẽ bị tính phí 100% giá trị
                      đơn đặt.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Tóm tắt */}
              <div className="order-1 lg:order-2 lg:col-span-1">
                <div className="bg-bg-secondary border border-border-subtle rounded-2xl p-5 md:p-6 lg:sticky lg:top-24">
                  <h3 className="text-xl text-text-primary mb-6 font-bold border-b border-border-subtle pb-4">
                    Tóm tắt đặt phòng
                  </h3>

                  <div className="flex gap-4 mb-6">
                    <img
                      src={room.image}
                      alt={room.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div>
                      <div className="text-xs text-accent-primary font-mono mb-1">
                        {room.id}
                      </div>
                      <div className="text-text-primary font-bold">
                        {room.name}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 text-sm mb-6 border-b border-border-subtle pb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted">Nhận phòng</span>
                      <div className="text-right">
                        <div className="text-text-primary font-bold bg-bg-primary px-3 py-1 rounded border border-border-subtle inline-block">
                          {checkIn}
                        </div>
                        {bookingType === "hour" && (
                          <div className="text-xs text-text-muted mt-1">
                            {checkInTime}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted">Trả phòng</span>
                      <div className="text-right">
                        <div className="text-text-primary font-bold bg-bg-primary px-3 py-1 rounded border border-border-subtle inline-block">
                          {checkOut}
                        </div>
                        {bookingType === "hour" && (
                          <div className="text-xs text-text-muted mt-1">
                            {checkOutTime}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm mb-6 border-b border-border-subtle pb-6">
                    <div className="flex justify-between">
                      <span className="text-text-muted">
                        Giá {bookingType === "day" ? "mỗi đêm" : "mỗi giờ"}
                      </span>
                      <span className="text-text-primary">
                        {bookingType === "day"
                          ? room.price.toLocaleString("vi-VN")
                          : (
                              room.pricePerHour || Math.round(room.price / 4)
                            ).toLocaleString("vi-VN")}
                        đ
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Phụ phí</span>
                      <span className="text-text-primary">0đ</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-border-subtle/50">
                      <span className="text-text-primary">Tổng tiền</span>
                      <span className="text-text-primary">
                        {totalPrice.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xl font-bold mb-8 bg-bg-primary p-4 rounded-xl border border-border-subtle">
                    <span className="text-text-primary">Cần thanh toán</span>
                    <span className="text-accent-gold">
                      {totalToPay.toLocaleString("vi-VN")}đ
                    </span>
                  </div>

                  <div className="hidden lg:flex flex-col gap-3">
                    <button
                      onClick={handleConfirmBooking}
                      disabled={isSubmitting}
                      className="btn-primary w-full py-4 text-lg"
                    >
                      {isSubmitting
                        ? "ĐANG XỬ LÝ..."
                        : "XÁC NHẬN VÀ THANH TOÁN"}
                    </button>
                    <button
                      onClick={() => setStep(1)}
                      className="btn-outline w-full py-3"
                    >
                      Quay lại chọn ngày
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            <div className="bg-bg-secondary border border-success/30 rounded-2xl p-5 md:p-8 text-center flex-1">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={40} />
              </div>
              <h2 className="text-2xl text-text-primary mb-3">
                Đặt phòng thành công!
              </h2>
              <p className="text-text-secondary mb-4 md:mb-6">
                Cảm ơn bạn đã đặt phòng <strong>{room.name}</strong>.
              </p>

              <div className="flex flex-wrap justify-center gap-2 mb-5">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-accent-neon/12 text-accent-neon border border-accent-neon/20 uppercase">
                  {paymentMethod === "bank"
                    ? "Chuyển khoản"
                    : "Thanh toán tại quầy"}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-accent-primary/12 text-accent-primary border border-accent-primary/20 uppercase">
                  {paymentAmount === "30" ? "Cọc 30%" : "Thanh toán 100%"}
                </span>
              </div>

              {paymentMethod === "bank" && (
                <div className="bg-bg-primary p-4 md:p-6 rounded-xl border border-border-subtle w-full md:max-w-[520px] mx-auto mb-6 md:mb-8">
                  <h3 className="text-text-primary font-bold mb-4">
                    Quét mã QR để thanh toán{" "}
                    {paymentAmount === "30" ? "cọc" : "toàn bộ"}
                  </h3>
                  <div className="w-40 h-40 md:w-48 md:h-48 bg-white mx-auto rounded-lg flex items-center justify-center mb-4">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ChuyenKhoanGenZCinema_${totalToPay}`}
                      alt="QR Code"
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                  <div className="text-left text-sm text-text-secondary space-y-2">
                    <p>
                      Ngân hàng:{" "}
                      <strong className="text-text-primary">MB Bank</strong>
                    </p>
                    <p>
                      STK:{" "}
                      <strong className="text-text-primary">0901234567</strong>
                    </p>
                    <p>
                      Chủ TK:{" "}
                      <strong className="text-text-primary">GENZ CINEMA</strong>
                    </p>
                    <p>
                      Số tiền:{" "}
                      <strong className="text-accent-gold">
                        {totalToPay.toLocaleString("vi-VN")}đ
                      </strong>
                    </p>
                    <p>
                      Nội dung:{" "}
                      <strong className="text-text-primary">
                        {user?.name} dat phong {room.id}
                      </strong>
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/rooms" className="btn-outline text-center">
                  Khám phá phòng khác
                </Link>
                <Link href="/history" className="btn-primary text-center">
                  Xem lịch sử đặt phòng
                </Link>
              </div>

              <button
                onClick={() => setShowRecentHistory((value) => !value)}
                className="lg:hidden mt-4 w-full text-sm font-bold text-text-secondary flex items-center justify-center gap-2"
              >
                {showRecentHistory
                  ? "Ẩn lịch sử gần đây"
                  : "Xem lịch sử gần đây"}
                {showRecentHistory ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
            </div>

            {/* Lịch sử đặt phòng */}
            <div
              className={`${showRecentHistory ? "block" : "hidden"} lg:block bg-bg-secondary border border-border-subtle rounded-2xl p-5 md:p-8 flex-1`}
            >
              <h3 className="text-xl text-text-primary mb-6 font-display border-b border-border-subtle pb-4">
                Lịch sử đặt phòng của bạn
              </h3>
              <div className="space-y-4">
                {/* Current booking */}
                <div className="bg-bg-primary p-4 rounded-xl border border-border-subtle flex gap-4">
                  <img
                    src={room.image}
                    alt={room.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div>
                    <div className="text-accent-neon text-xs font-bold uppercase mb-1">
                      Vừa đặt
                    </div>
                    <h4 className="text-text-primary font-bold">{room.name}</h4>
                    <p className="text-text-muted text-sm">
                      {checkIn} - {checkOut}
                    </p>
                    <p className="text-accent-gold font-bold mt-1">
                      {totalToPay.toLocaleString("vi-VN")}đ (
                      {paymentAmount === "30" ? "Cọc 30%" : "100%"})
                    </p>
                  </div>
                </div>
                {/* Mock past booking */}
                <div className="bg-bg-primary p-4 rounded-xl border border-border-subtle flex gap-4 opacity-70">
                  <img
                    src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=2070&auto=format&fit=crop"
                    alt="Indie Vibe"
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div>
                    <div className="text-success text-xs font-bold uppercase mb-1">
                      Đã hoàn thành
                    </div>
                    <h4 className="text-text-primary font-bold">Indie Vibe</h4>
                    <p className="text-text-muted text-sm">
                      05/09/2023 - 06/09/2023
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <Link
                  href="/history"
                  className="text-accent-primary hover:text-red-600 transition-colors text-sm font-bold"
                >
                  Xem toàn bộ lịch sử &rarr;
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {step === 1 && room.status !== "full" && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[85] bg-bg-secondary/95 backdrop-blur-xl border-t border-border-subtle px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-text-muted font-bold">
                Giá từ
              </p>
              <p className="text-xl text-accent-gold font-display leading-none">
                {room.price.toLocaleString("vi-VN")}đ
              </p>
            </div>
            <button onClick={scrollToBooking} className="btn-primary py-3 px-5">
              ĐẶT NGAY
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[86] bg-bg-secondary/95 backdrop-blur-xl border-t border-border-subtle px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-text-muted font-bold">
                Cần thanh toán
              </p>
              <p className="text-xl text-accent-gold font-display leading-none">
                {totalToPay.toLocaleString("vi-VN")}đ
              </p>
            </div>
            <button
              onClick={handleConfirmBooking}
              disabled={isSubmitting}
              className="btn-primary py-3 px-5"
            >
              {isSubmitting ? "ĐANG XỬ LÝ..." : "XÁC NHẬN"}
            </button>
          </div>
          <button
            onClick={() => setStep(1)}
            className="w-full text-xs font-bold uppercase tracking-wider text-text-secondary"
          >
            Quay lại chọn ngày
          </button>
        </div>
      )}

      {/* Schedule Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-bg-secondary border border-border-subtle rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-border-subtle pb-4">
              <h3 className="text-xl font-display text-text-primary flex items-center gap-2">
                <Calendar size={24} className="text-accent-primary" />
                Lịch trống 10 ngày tới
              </h3>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                Đóng
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pr-2 space-y-3">
              {roomSchedule.map((schedule, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center text-sm bg-bg-primary p-4 rounded-xl border border-border-subtle"
                >
                  <div>
                    <span className="text-text-primary font-bold block text-base mb-1">
                      {schedule.date}
                    </span>
                    <span className="text-text-secondary">{schedule.time}</span>
                  </div>
                  {schedule.status === "booked" ? (
                    <span className="text-xs font-bold px-3 py-1.5 bg-danger/10 text-danger rounded-md uppercase">
                      Đã đặt
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-3 py-1.5 bg-success/10 text-success rounded-md uppercase">
                      Trống
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

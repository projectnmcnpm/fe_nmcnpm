"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Search, Calendar, Download, Plus, Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/components/layout/ToastProvider";
import { useFilteredPagination } from "@/hooks/use-filtered-pagination";
import { dataService } from "@/lib/data-service";
import {
  STAFF_BOOKING_STATUS_BADGE_CLASSES,
  STAFF_BOOKING_STATUS_CODE_MAP,
  STAFF_BOOKING_STATUS_FILTER_OPTIONS,
  STAFF_BOOKING_STATUS_LABELS,
  STAFF_BOOKING_STATUS_SELECT_OPTIONS,
  type StaffBookingStatusCode,
} from "@/lib/status-config";

type StaffBookingRow = {
  id: string;
  email: string;
  customerName: string;
  phone: string;
  room: string;
  checkIn: string;
  checkOut: string;
  checkInTime?: string;
  checkOutTime?: string;
  bookingType?: "day" | "hour";
  total: number;
  deposit: number;
  status: StaffBookingStatusCode;
  paymentStatus?: "unpaid" | "deposited" | "paid";
  refundStatus?: "none" | "eligible" | "ineligible" | "refunded";
};

const toStatusCode = (status: string): StaffBookingStatusCode => {
  if (status === "checked_in" || status === "active") return 1;
  if (status === "checked_out" || status === "completed") return 4;
  if (status === "in_stay") return 2;
  if (status === "cancelled") return 3;
  return 0;
};

const toStatusValue = (statusCode: StaffBookingStatusCode) => {
  if (statusCode === 1) return "checked_in" as const;
  if (statusCode === 2) return "in_stay" as const;
  if (statusCode === 4) return "checked_out" as const;
  if (statusCode === 3) return "cancelled" as const;
  return "upcoming" as const;
};

const isCancelledStatus = (statusCode: StaffBookingStatusCode) =>
  statusCode === 3;

const toDateLabel = (isoDate: string) => {
  if (!isoDate) return "-";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("vi-VN");
};

const mapToRow = (
  booking: Awaited<ReturnType<typeof dataService.getBookings>>[number],
): StaffBookingRow => {
  const deposited =
    booking.paymentStatus === "paid"
      ? booking.total
      : booking.paymentStatus === "deposited"
        ? Math.round(
            (booking.total * Number(booking.paymentAmount || 0)) / 100,
          ) || 0
        : 0;

  return {
    id: booking.id,
    email: booking.userId || "-",
    customerName:
      booking.customerName || booking.userId?.split("@")[0] || "Khách hàng",
    phone: booking.customerPhone || "-",
    room: booking.roomName || booking.roomId || "-",
    checkIn: toDateLabel(booking.checkIn),
    checkOut: toDateLabel(booking.checkOut),
    checkInTime: booking.checkInTime,
    checkOutTime: booking.checkOutTime,
    bookingType: booking.bookingType,
    total: booking.total,
    deposit: deposited,
    status: toStatusCode(booking.status),
    paymentStatus: booking.paymentStatus,
    refundStatus: booking.refundStatus,
  };
};

export default function StaffBookings() {
  const ITEMS_PER_PAGE = 10;
  const [bookings, setBookings] = useState<StaffBookingRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingPaymentBookingId, setUpdatingPaymentBookingId] = useState<
    string | null
  >(null);
  const { confirm, success, error, warning } = useToast();

  const parseLocalDate = (value: string) => new Date(`${value}T00:00:00`);

  const formatBookingDateTime = (
    date: string,
    time?: string,
    bookingType?: string,
  ) => {
    if (!date) return "-";

    const localDate = parseLocalDate(date);
    if (bookingType === "hour" && time) {
      return `${localDate.toLocaleDateString("vi-VN")} ${time}`;
    }

    return localDate.toLocaleDateString("vi-VN");
  };

  const getRefundLabel = (booking: StaffBookingRow) => {
    if (booking.status !== 3) return null;
    if (booking.refundStatus === "refunded") return "Đã hoàn tiền";
    if (booking.refundStatus === "eligible") return "Hủy được hoàn tiền";
    if (booking.refundStatus === "ineligible") return "Hủy không hoàn tiền";
    return "Không áp dụng";
  };

  const mapFilterToExportStatus = (filterValue: string) => {
    const statusMap: Record<string, string | undefined> = {
      all: undefined,
      "0": "upcoming",
      "1": "checked_in",
      "2": "in_stay",
      "4": "checked_out",
      "3": "cancelled",
    };
    return statusMap[filterValue];
  };

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const result = await dataService.getBookings();
        setBookings(result.map(mapToRow));
      } catch (loadError) {
        console.error(loadError);
        error("Không thể tải danh sách đặt phòng");
      }
    };

    void loadBookings();
  }, [error]);

  const handleDeleteBooking = async (id: string) => {
    const target = bookings.find((booking) => booking.id === id);
    const displayName = target ? `${target.customerName} - ${target.room}` : id;
    const shouldDelete = await confirm(
      `Bạn có chắc chắn muốn xóa đặt phòng ${displayName}?`,
      { confirmLabel: "Xóa", cancelLabel: "Hủy" },
    );
    if (shouldDelete) {
      try {
        await dataService.deleteBooking(id);
        setBookings(bookings.filter((b) => b.id !== id));
        success(`Đã xóa đặt phòng ${displayName}.`);
      } catch (deleteError) {
        console.error(deleteError);
        error("Xóa đặt phòng thất bại");
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: number) => {
    const statusCode = newStatus as StaffBookingStatusCode;
    try {
      await dataService.updateBookingStatus(id, toStatusValue(statusCode));
      setBookings(
        bookings.map((b) => (b.id === id ? { ...b, status: statusCode } : b)),
      );
      success("Đã cập nhật trạng thái đặt phòng.");
    } catch (statusError) {
      console.error(statusError);
      error("Cập nhật trạng thái đặt phòng thất bại");
    }
  };

  const handlePaymentStatusChange = async (
    id: string,
    paymentStatus: "unpaid" | "deposited" | "paid",
  ) => {
    const target = bookings.find((booking) => booking.id === id);
    if (target && isCancelledStatus(target.status)) {
      warning("Booking đã hủy không thể thay đổi trạng thái thanh toán.");
      return;
    }

    setUpdatingPaymentBookingId(id);
    try {
      await dataService.updateBookingPaymentStatus(id, paymentStatus);
      const result = await dataService.getBookings();
      setBookings(result.map(mapToRow));
      success("Đã cập nhật trạng thái thanh toán.");
    } finally {
      setUpdatingPaymentBookingId(null);
    }
  };

  const handleExportBookings = async () => {
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      error("Ngày bắt đầu không được lớn hơn ngày kết thúc");
      return;
    }

    try {
      setIsExporting(true);
      const file = await dataService.exportBookingsCsv({
        status: mapFilterToExportStatus(statusFilter),
        from: fromDate || undefined,
        to: toDate || undefined,
      });

      const downloadUrl = window.URL.createObjectURL(file.blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      success("Xuất file đặt phòng thành công");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Xuất file thất bại";
      error(message);
    } finally {
      setIsExporting(false);
    }
  };

  const bookingFilter = useCallback(
    (booking: StaffBookingRow) => {
      const matchesSearch =
        booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.phone.includes(searchTerm);
      const allowedStatuses =
        statusFilter === "all"
          ? [0, 1, 2, 4, 3]
          : (STAFF_BOOKING_STATUS_CODE_MAP[statusFilter] ?? [0, 1, 2, 4, 3]);
      const matchesStatus = allowedStatuses.includes(booking.status);

      return matchesSearch && matchesStatus;
    },
    [searchTerm, statusFilter],
  );

  const {
    filteredItems: filteredBookings,
    paginatedItems: paginatedBookings,
    totalPages,
  } = useFilteredPagination<StaffBookingRow>({
    items: bookings,
    itemsPerPage: ITEMS_PER_PAGE,
    currentPage,
    setCurrentPage,
    filterFn: bookingFilter,
    resetDeps: [searchTerm, statusFilter],
  });

  const getStatusBadge = (status: number) => {
    const statusCode =
      status in STAFF_BOOKING_STATUS_LABELS
        ? (status as StaffBookingStatusCode)
        : 0;

    return (
      <span
        className={`px-2 py-1 rounded text-xs font-bold uppercase ${STAFF_BOOKING_STATUS_BADGE_CLASSES[statusCode]}`}
      >
        {STAFF_BOOKING_STATUS_LABELS[statusCode]}
      </span>
    );
  };

  const getPaymentStatusBadge = (status?: StaffBookingRow["paymentStatus"]) => {
    const map = {
      unpaid: {
        label: "Chưa thanh toán",
        className:
          "bg-bg-secondary text-text-muted border border-border-subtle",
      },
      deposited: {
        label: "Đã cọc",
        className: "bg-warning/20 text-warning border border-warning/30",
      },
      paid: {
        label: "Đã thanh toán",
        className: "bg-success/20 text-success border border-success/30",
      },
    } as const;

    const resolved = map[status || "unpaid"];
    return (
      <span
        className={`px-2 py-1 rounded text-xs font-bold uppercase ${resolved.className}`}
      >
        {resolved.label}
      </span>
    );
  };

  return (
    <DashboardLayout allowedRoles={["receptionist", "manager"]}>
      <div className="h-full flex flex-col min-h-0">
        <div className="shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl text-text-primary mb-1">ĐẶT PHÒNG</h1>
            <p className="text-text-secondary">
              Quản lý danh sách đặt phòng của khách hàng
            </p>
          </div>
          <Link
            href="/staff/bookings/add"
            className="btn-primary flex items-center gap-2 py-2"
          >
            <Plus size={18} /> TẠO ĐẶT PHÒNG
          </Link>
        </div>

        <div className="shrink-0 bg-bg-secondary p-4 rounded-xl border border-border-subtle mb-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 flex-1">
            <div className="relative w-full md:w-64">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                size={18}
              />
              <input
                type="text"
                placeholder="Tên khách, phòng, SĐT..."
                className="input-field pl-10 py-2 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative flex items-center gap-2">
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                  size={18}
                />
                <input
                  type="date"
                  className="input-field pl-10 py-2 text-sm w-40"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <span className="text-text-muted">-</span>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                  size={18}
                />
                <input
                  type="date"
                  className="input-field pl-10 py-2 text-sm w-40"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>
            <select
              className="input-field py-2 text-sm w-auto"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STAFF_BOOKING_STATUS_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            className="btn-outline py-2 text-sm flex items-center gap-2 text-accent-neon border-accent-neon/50 hover:border-accent-neon hover:bg-accent-neon/10 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={() => void handleExportBookings()}
            disabled={isExporting}
          >
            <Download size={16} /> {isExporting ? "ĐANG XUẤT..." : "XUẤT EXCEL"}
          </button>
        </div>

        <div className="flex-1 min-h-0 card-cinema flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="sticky top-0 bg-bg-card z-10">
                <tr className="border-b border-border-subtle text-text-muted text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Tên khách hàng</th>
                  <th className="p-4 font-medium">Số điện thoại</th>
                  <th className="p-4 font-medium">Phòng</th>
                  <th className="p-4 font-medium">Check-in / Check-out</th>
                  <th className="p-4 font-medium">Tổng tiền</th>
                  <th className="p-4 font-medium">Đã cọc</th>
                  <th className="p-4 font-medium">Trạng thái đặt phòng</th>
                  <th className="p-4 font-medium">Trạng thái thanh toán</th>
                  <th className="p-4 font-medium">Hoàn tiền</th>
                  <th className="p-4 font-medium text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-text-muted">
                      Không tìm thấy đặt phòng nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  paginatedBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-b border-border-subtle/50 hover:bg-bg-secondary/50 transition-colors group"
                    >
                      <td className="p-4">
                        <div className="font-bold text-text-primary">
                          {booking.customerName}
                        </div>
                      </td>
                      <td className="p-4 text-text-secondary font-mono">
                        {booking.phone}
                      </td>
                      <td className="p-4 font-mono text-text-secondary">
                        {booking.room}
                      </td>
                      <td className="p-4">
                        <div className="text-text-primary">
                          {formatBookingDateTime(
                            booking.checkIn,
                            booking.checkInTime,
                            booking.bookingType,
                          )}
                        </div>
                        <div className="text-xs text-text-muted">
                          đến{" "}
                          {formatBookingDateTime(
                            booking.checkOut,
                            booking.checkOutTime,
                            booking.bookingType,
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-text-primary font-mono">
                        {booking.total.toLocaleString("vi-VN")}đ
                      </td>
                      <td className="p-4 text-text-secondary font-mono">
                        {booking.deposit.toLocaleString("vi-VN")}đ
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-2 items-start">
                          {getStatusBadge(booking.status)}
                          <select
                            className="bg-bg-primary border border-border-subtle text-text-secondary text-xs rounded px-2 py-1 outline-none focus:border-accent-neon w-full max-w-[140px]"
                            value={booking.status}
                            onChange={(e) =>
                              handleStatusChange(
                                booking.id,
                                parseInt(e.target.value, 10),
                              )
                            }
                          >
                            {STAFF_BOOKING_STATUS_SELECT_OPTIONS.map(
                              (option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ),
                            )}
                          </select>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-2 items-start">
                          {getPaymentStatusBadge(booking.paymentStatus)}
                          <select
                            className="bg-bg-primary border border-border-subtle text-text-secondary text-xs rounded px-2 py-1 outline-none focus:border-accent-neon w-full max-w-[160px]"
                            value={booking.paymentStatus || "unpaid"}
                            disabled={
                              updatingPaymentBookingId === booking.id ||
                              isCancelledStatus(booking.status)
                            }
                            onChange={(e) =>
                              void handlePaymentStatusChange(
                                booking.id,
                                e.target.value as
                                  | "unpaid"
                                  | "deposited"
                                  | "paid",
                              )
                            }
                          >
                            <option value="unpaid">Đổi: Chưa thanh toán</option>
                            <option value="deposited">Đổi: Đã cọc</option>
                            <option value="paid">Đổi: Đã thanh toán</option>
                          </select>
                        </div>
                      </td>
                      <td className="p-4">
                        {getRefundLabel(booking) ? (
                          <span className="px-2 py-1 rounded text-xs font-bold uppercase bg-bg-primary border border-border-subtle text-text-secondary">
                            {getRefundLabel(booking)}
                          </span>
                        ) : (
                          <span className="text-xs text-text-muted">-</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/staff/bookings/edit/${booking.id}`}
                            className="p-2 text-text-muted hover:text-accent-neon hover:bg-accent-neon/10 rounded transition-colors"
                            title="Sửa"
                          >
                            <Edit2 size={16} />
                          </Link>
                          <button
                            onClick={() => handleDeleteBooking(booking.id)}
                            className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-colors"
                            title="Xóa đặt phòng"
                          >
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
            <span>
              Hiển thị{" "}
              {filteredBookings.length === 0
                ? 0
                : (currentPage - 1) * ITEMS_PER_PAGE + 1}
              -{Math.min(currentPage * ITEMS_PER_PAGE, filteredBookings.length)}{" "}
              / {filteredBookings.length} lượt đặt
            </span>
            <div className="flex gap-1">
              <button
                className="px-3 py-1 border border-border-subtle rounded hover:bg-bg-secondary disabled:opacity-50"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              >
                Trước
              </button>
              <button className="px-3 py-1 border border-border-subtle rounded bg-accent-primary text-white border-accent-primary">
                {currentPage}
              </button>
              <button
                className="px-3 py-1 border border-border-subtle rounded hover:bg-bg-secondary disabled:opacity-50"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

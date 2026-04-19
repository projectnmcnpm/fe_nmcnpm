"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Search,
  Calendar,
  Download,
  Eye,
  Plus,
  Edit2,
  Trash2,
} from "lucide-react";
import { dataService } from "@/lib/data-service";
import type { Booking, BookingStatus } from "@/lib/mock-data";
import { useToast } from "@/components/layout/ToastProvider";
import { useFilteredPagination } from "@/hooks/use-filtered-pagination";
import {
  BOOKING_STATUS_BADGE_CLASSES,
  BOOKING_STATUS_FILTER_OPTIONS,
  BOOKING_STATUS_FILTERS,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_SELECT_OPTIONS,
} from "@/lib/status-config";

export default function AdminBookings() {
  const ITEMS_PER_PAGE = 10;
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingPaymentBookingId, setUpdatingPaymentBookingId] = useState<
    string | null
  >(null);
  const { confirm, success, error } = useToast();

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

  const getDisplayStatus = (booking: Booking): BookingStatus => {
    if (booking.status === "cancelled") {
      return "cancelled";
    }

    const checkOutDate = new Date(booking.checkOut);
    const now = new Date();
    if (
      booking.status === "in_stay" &&
      !Number.isNaN(checkOutDate.getTime()) &&
      checkOutDate < now
    ) {
      return "checked_out";
    }

    return booking.status;
  };

  const getCustomerName = (booking: Booking) => {
    if (booking.customerName && booking.customerName.trim().length > 0) {
      return booking.customerName;
    }
    if (!booking.userId) {
      return "Khách hàng";
    }
    return booking.userId.split("@")[0] || "Khách hàng";
  };

  const getDepositedAmount = (booking: Booking) => {
    if (booking.paymentStatus === "unpaid" || !booking.paymentStatus) {
      return 0;
    }

    if (booking.paymentStatus === "paid") {
      return booking.total;
    }

    const percent = Number(booking.paymentAmount || 0);
    if (Number.isFinite(percent) && percent > 0) {
      return Math.round((booking.total * percent) / 100);
    }

    return 0;
  };

  const getPaymentStatusBadge = (status?: Booking["paymentStatus"]) => {
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

  useEffect(() => {
    const loadBookings = async () => {
      const result = await dataService.getBookings();
      setBookings(result);
    };

    void loadBookings();
  }, []);

  const handleDeleteBooking = async (id: string) => {
    const target = bookings.find((booking) => booking.id === id);
    const displayName = target
      ? `${getCustomerName(target)} - ${target.roomName}`
      : id;
    const shouldDelete = await confirm(
      `Bạn có chắc chắn muốn xóa đặt phòng ${displayName}?`,
      { confirmLabel: "Xóa", cancelLabel: "Hủy" },
    );
    if (shouldDelete) {
      await dataService.deleteBooking(id);
      setBookings(bookings.filter((b) => b.id !== id));
      success(`Đã xóa đặt phòng ${displayName}.`);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await dataService.updateBookingStatus(id, newStatus as BookingStatus);
    const result = await dataService.getBookings();
    setBookings(result);
  };

  const handlePaymentStatusChange = async (
    id: string,
    paymentStatus: "unpaid" | "deposited" | "paid",
  ) => {
    const target = bookings.find((booking) => booking.id === id);
    if (target && getDisplayStatus(target) === "cancelled") {
      return;
    }

    setUpdatingPaymentBookingId(id);
    try {
      await dataService.updateBookingPaymentStatus(id, paymentStatus);
      const result = await dataService.getBookings();
      setBookings(result);
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
    (booking: Booking) => {
      const matchesSearch =
        booking.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCustomerName(booking)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        booking.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.customerPhone || "").includes(searchTerm);
      const allowedStatuses =
        BOOKING_STATUS_FILTERS[statusFilter] ?? BOOKING_STATUS_FILTERS.all;
      const matchesStatus = allowedStatuses.includes(getDisplayStatus(booking));

      return matchesSearch && matchesStatus;
    },
    [searchTerm, statusFilter, getCustomerName, getDisplayStatus],
  );

  const {
    filteredItems: filteredBookings,
    paginatedItems: paginatedBookings,
    totalPages,
  } = useFilteredPagination<Booking>({
    items: bookings,
    itemsPerPage: ITEMS_PER_PAGE,
    currentPage,
    setCurrentPage,
    filterFn: bookingFilter,
    resetDeps: [searchTerm, statusFilter],
  });

  const getStatusBadge = (status: Booking["status"]) => {
    return (
      <span
        className={`px-2 py-1 rounded text-xs font-bold uppercase ${BOOKING_STATUS_BADGE_CLASSES[status]}`}
      >
        {BOOKING_STATUS_LABELS[status]}
      </span>
    );
  };

  return (
    <DashboardLayout allowedRoles={["manager"]}>
      <div className="h-full flex flex-col min-h-0">
        <div className="shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl text-text-primary mb-1">
              QUẢN LÝ ĐẶT PHÒNG
            </h1>
            <p className="text-text-secondary">
              Theo dõi toàn bộ lịch sử và trạng thái đặt phòng
            </p>
          </div>
          <Link
            href="/admin/bookings/add"
            className="btn-primary flex items-center gap-2 py-2"
          >
            <Plus size={18} /> THÊM ĐẶT PHÒNG
          </Link>
        </div>

        {/* Filter Row */}
        <div className="shrink-0 bg-bg-secondary p-4 rounded-xl border border-border-subtle mb-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 flex-1">
            <div className="relative w-full md:w-64">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                size={18}
              />
              <input
                type="text"
                placeholder="Email, tên khách, phòng, SĐT..."
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
              {BOOKING_STATUS_FILTER_OPTIONS.map((option) => (
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

        {/* Table */}
        <div className="flex-1 min-h-0 card-cinema flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="sticky top-0 bg-bg-card z-10">
                <tr className="border-b border-border-subtle text-text-muted text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Tên khách hàng</th>
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
                    <td
                      colSpan={10}
                      className="p-8 text-center text-text-muted"
                    >
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
                        <div className="font-mono text-text-primary">
                          {booking.userId}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-text-primary">
                        {getCustomerName(booking)}
                      </td>
                      <td className="p-4 font-mono text-text-secondary">
                        {booking.roomName}
                      </td>
                      <td className="p-4">
                        <div className="text-text-primary">
                          {new Date(booking.checkIn).toLocaleDateString(
                            "vi-VN",
                          )}
                        </div>
                        <div className="text-xs text-text-muted">
                          đến{" "}
                          {new Date(booking.checkOut).toLocaleDateString(
                            "vi-VN",
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-text-primary font-mono">
                        {booking.total.toLocaleString("vi-VN")}đ
                      </td>
                      <td className="p-4 text-text-secondary font-mono">
                        {getDepositedAmount(booking).toLocaleString("vi-VN")}đ
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-2 items-start">
                          {getStatusBadge(getDisplayStatus(booking))}
                          <select
                            className="bg-bg-primary border border-border-subtle text-text-secondary text-xs rounded px-2 py-1 outline-none focus:border-accent-neon w-full max-w-[140px]"
                            value={booking.status}
                            onChange={(e) =>
                              handleStatusChange(booking.id, e.target.value)
                            }
                          >
                            {BOOKING_STATUS_SELECT_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
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
                              getDisplayStatus(booking) === "cancelled"
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
                        {getDisplayStatus(booking) === "cancelled" ? (
                          <span className="px-2 py-1 rounded text-xs font-bold uppercase bg-bg-primary border border-border-subtle text-text-secondary">
                            {booking.refundStatus === "eligible"
                              ? "Hủy được hoàn tiền"
                              : booking.refundStatus === "ineligible"
                                ? "Hủy không hoàn tiền"
                                : booking.refundStatus === "refunded"
                                  ? "Đã hoàn tiền"
                                  : "Không áp dụng"}
                          </span>
                        ) : (
                          <span className="text-xs text-text-muted">-</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/bookings/edit/${booking.id}`}
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

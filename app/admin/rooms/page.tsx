"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Search, Filter, Plus, Edit2, Trash2 } from "lucide-react";
import { dataService } from "@/lib/data-service";
import type { Room } from "@/lib/mock-data";
import { useToast } from "@/components/layout/ToastProvider";
import { useFilteredPagination } from "@/hooks/use-filtered-pagination";
import {
  ADMIN_ROOM_STATUS_BADGE_CLASSES,
  ADMIN_ROOM_STATUS_EDIT_OPTIONS,
  ADMIN_ROOM_STATUS_FILTER_OPTIONS,
  ADMIN_ROOM_STATUS_FILTERS,
  ADMIN_ROOM_STATUS_LABELS,
  ADMIN_ROOM_TYPE_FILTER_OPTIONS,
  ADMIN_ROOM_TYPE_FILTERS,
} from "../../../lib/status-config";

export default function AdminRooms() {
  const ITEMS_PER_PAGE = 10;
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingRoomId, setUpdatingRoomId] = useState<string | null>(null);
  const { confirm, success, error } = useToast();

  const loadRooms = useCallback(async () => {
    const result = await dataService.getRooms();
    setRooms(result);
  }, []);

  useEffect(() => {
    void loadRooms();

    const intervalId = window.setInterval(() => {
      void loadRooms();
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, [loadRooms]);

  const handleDelete = async (id: string) => {
    const room = rooms.find((item) => item.id === id);
    const displayName = room ? room.name : id;
    const shouldDelete = await confirm(
      `Bạn có chắc chắn muốn xóa phòng ${displayName}?`,
      { confirmLabel: "Xóa", cancelLabel: "Hủy" },
    );
    if (!shouldDelete) {
      return;
    }

    try {
      await dataService.deleteRoom(id);
      setRooms((prev) => prev.filter((room) => room.id !== id));
      success(`Đã xóa phòng ${displayName}.`);
    } catch (deleteError) {
      const message =
        deleteError instanceof Error && deleteError.message
          ? deleteError.message
          : "Xóa phòng thất bại";
      error(message);
    }
  };

  const handleQuickStatusChange = async (
    roomId: string,
    nextStatus: Room["status"],
  ) => {
    const room = rooms.find((item) => item.id === roomId);
    if (!room || room.status === nextStatus) {
      return;
    }

    setUpdatingRoomId(roomId);
    try {
      await dataService.updateRoomStatus(roomId, nextStatus);
      setRooms((prev) =>
        prev.map((item) =>
          item.id === roomId ? { ...item, status: nextStatus } : item,
        ),
      );
      success(
        `Đã đổi trạng thái ${room.name} thành ${ADMIN_ROOM_STATUS_LABELS[nextStatus]}.`,
      );
    } catch (updateError) {
      const message =
        updateError instanceof Error && updateError.message
          ? updateError.message
          : "Cập nhật trạng thái phòng thất bại";
      error(message);
    } finally {
      setUpdatingRoomId(null);
    }
  };

  const roomFilter = useCallback(
    (room: Room) => {
      const matchesSearch = room.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const selectedType = ADMIN_ROOM_TYPE_FILTERS[typeFilter];
      const matchesType = typeFilter === "all" || room.type === selectedType;

      const allowedStatuses =
        ADMIN_ROOM_STATUS_FILTERS[statusFilter] ??
        ADMIN_ROOM_STATUS_FILTERS.all;
      const matchesStatus = allowedStatuses.includes(room.status);

      return matchesSearch && matchesType && matchesStatus;
    },
    [searchTerm, typeFilter, statusFilter],
  );

  const {
    filteredItems: filteredRooms,
    paginatedItems: paginatedRooms,
    totalPages,
  } = useFilteredPagination<Room>({
    items: rooms,
    itemsPerPage: ITEMS_PER_PAGE,
    currentPage,
    setCurrentPage,
    filterFn: roomFilter,
    resetDeps: [searchTerm, typeFilter, statusFilter],
  });

  const getStatusBadge = (status: Room["status"]) => {
    return (
      <span
        className={`px-2 py-1 rounded text-xs font-bold uppercase ${ADMIN_ROOM_STATUS_BADGE_CLASSES[status]}`}
      >
        {ADMIN_ROOM_STATUS_LABELS[status]}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      "Single Room": "bg-blue-500/20 text-blue-400",
      "Twin Room": "bg-purple-500/20 text-purple-400",
      "Double Room": "bg-accent-gold/20 text-accent-gold",
      "VIP Room": "bg-accent-primary/20 text-accent-primary",
    };
    return (
      <span
        className={`px-2 py-1 rounded text-xs font-bold ${colors[type] || "bg-gray-500/20 text-gray-400"}`}
      >
        {type}
      </span>
    );
  };

  return (
    <DashboardLayout allowedRoles={["manager"]}>
      <div className="h-full flex flex-col min-h-0">
        <div className="shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl text-text-primary mb-1">QUẢN LÝ PHÒNG</h1>
            <p className="text-text-secondary">
              Thêm, sửa, xóa và theo dõi trạng thái phòng
            </p>
          </div>
          <Link
            href="/admin/rooms/add"
            className="btn-primary flex items-center gap-2 py-2"
          >
            <Plus size={18} /> THÊM PHÒNG
          </Link>
        </div>

        {/* Toolbar */}
        <div className="shrink-0 bg-bg-secondary p-4 rounded-xl border border-border-subtle mb-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 flex-1">
            <div className="relative w-full md:w-64">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                size={18}
              />
              <input
                type="text"
                placeholder="Tìm theo tên phòng..."
                className="input-field pl-10 py-2 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                size={18}
              />
              <select
                className="input-field pl-10 py-2 text-sm appearance-none pr-8"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                {ADMIN_ROOM_TYPE_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <select
              className="input-field py-2 text-sm w-auto"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {ADMIN_ROOM_STATUS_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 card-cinema flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-bg-card z-10">
                <tr className="border-b border-border-subtle text-text-muted text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Ảnh</th>
                  <th className="p-4 font-medium">Tên phòng</th>
                  <th className="p-4 font-medium">Loại</th>
                  <th className="p-4 font-medium">Giá</th>
                  <th className="p-4 font-medium">Trạng thái</th>
                  <th className="p-4 font-medium text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredRooms.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-text-muted">
                      Không tìm thấy phòng nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  paginatedRooms.map((room) => (
                    <tr
                      key={room.id}
                      className="border-b border-border-subtle/50 hover:bg-bg-secondary/50 transition-colors group"
                    >
                      <td className="p-4">
                        <img
                          src={room.image}
                          alt={room.name}
                          className="w-12 h-12 rounded object-cover border border-border-subtle"
                        />
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-text-secondary bg-bg-primary px-2 py-1 rounded border border-border-subtle group-hover:border-accent-neon transition-colors">
                          {room.name}
                        </span>
                      </td>
                      <td className="p-4">{getTypeBadge(room.type)}</td>
                      <td className="p-4 text-accent-gold font-mono">
                        <div className="text-sm">
                          {room.price.toLocaleString("vi-VN")}đ/đêm
                        </div>
                        {room.pricePerHour && (
                          <div className="text-xs text-text-muted">
                            {room.pricePerHour.toLocaleString("vi-VN")}đ/giờ
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="space-y-2">
                          {getStatusBadge(room.status)}
                          <select
                            className="input-field py-1.5 px-2 text-xs bg-bg-primary min-w-[150px]"
                            value={room.status}
                            disabled={updatingRoomId === room.id}
                            onChange={(e) =>
                              void handleQuickStatusChange(
                                room.id,
                                e.target.value as Room["status"],
                              )
                            }
                          >
                            {ADMIN_ROOM_STATUS_EDIT_OPTIONS.map((option) => {
                              const statusMap: Record<string, Room["status"]> =
                                {
                                  "-2": "maintenance",
                                  "-1": "cleaning_in_progress",
                                  "0": "available",
                                  "1": "in_use",
                                  "2": "pending_cleaning",
                                  "3": "cleaned",
                                };
                              const mappedStatus = statusMap[option.value];

                              if (!mappedStatus) {
                                return null;
                              }

                              return (
                                <option key={option.value} value={mappedStatus}>
                                  {ADMIN_ROOM_STATUS_LABELS[mappedStatus]}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/rooms/edit/${room.id}`}
                            className="p-2 text-text-muted hover:text-accent-neon hover:bg-accent-neon/10 rounded transition-colors"
                            title="Sửa"
                          >
                            <Edit2 size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(room.id)}
                            className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-colors"
                            title="Xóa"
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
              {filteredRooms.length === 0
                ? 0
                : (currentPage - 1) * ITEMS_PER_PAGE + 1}
              -{Math.min(currentPage * ITEMS_PER_PAGE, filteredRooms.length)} /{" "}
              {filteredRooms.length} phòng
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

"use client";

import React, { useState, useCallback, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Brush,
} from "lucide-react";
import { useFilteredPagination } from "@/hooks/use-filtered-pagination";
import { dataService } from "@/lib/data-service";
import {
  ADMIN_ROOM_TYPE_FILTER_OPTIONS,
  STAFF_ROOM_STATUS_BADGE_CLASSES,
  STAFF_ROOM_STATUS_CODE_MAP,
  STAFF_ROOM_STATUS_FILTER_OPTIONS,
  STAFF_ROOM_STATUS_LABELS,
  STAFF_ROOM_STATUS_SELECT_OPTIONS,
  type StaffRoomStatusCode,
} from "@/lib/status-config";

type StaffRoomRow = {
  id: string;
  type: string;
  name: string;
  capacity: number;
  price: number;
  status: StaffRoomStatusCode;
  image: string;
};

const roomTypeToCode = (type: string) => {
  if (type === "Single Room") return "SGL";
  if (type === "Twin Room") return "TWN";
  if (type === "Double Room") return "DBL";
  if (type === "VIP Room") return "TRPL";
  return type;
};

const roomStatusToCode = (status: string): StaffRoomStatusCode => {
  if (status === "cleaning") return -1;
  if (status === "full" || status === "few_left") return 1;
  return 0;
};

const statusCodeToRoomStatus = (statusCode: StaffRoomStatusCode) => {
  if (statusCode === -1) return "cleaning" as const;
  if (statusCode === 1) return "full" as const;
  return "available" as const;
};

export default function StaffRooms() {
  const ITEMS_PER_PAGE = 10;
  const [rooms, setRooms] = useState<StaffRoomRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadRooms = async () => {
      const result = await dataService.getRooms();
      setRooms(
        result.map((room) => ({
          id: room.id,
          type: roomTypeToCode(room.type),
          name: room.name,
          capacity: 1,
          price: room.price,
          status: roomStatusToCode(room.status),
          image: room.image,
        })),
      );
    };

    void loadRooms();
  }, []);

  const roomFilter = useCallback(
    (room: StaffRoomRow) => {
      const matchesSearch =
        room.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "all" || room.type === typeFilter;
      const allowedStatuses =
        STAFF_ROOM_STATUS_CODE_MAP[statusFilter] ??
        STAFF_ROOM_STATUS_CODE_MAP.all;
      const matchesStatus = allowedStatuses.includes(
        room.status as StaffRoomStatusCode,
      );

      return matchesSearch && matchesType && matchesStatus;
    },
    [searchTerm, typeFilter, statusFilter],
  );

  const {
    filteredItems: filteredRooms,
    paginatedItems: paginatedRooms,
    totalPages,
  } = useFilteredPagination({
    items: rooms,
    itemsPerPage: ITEMS_PER_PAGE,
    currentPage,
    setCurrentPage,
    filterFn: roomFilter,
    resetDeps: [searchTerm, typeFilter, statusFilter],
  });

  const handleStatusChange = async (
    id: string,
    newStatus: StaffRoomStatusCode,
  ) => {
    await dataService.updateRoomStatus(id, statusCodeToRoomStatus(newStatus));
    setRooms(rooms.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
  };

  const getStatusBadge = (status: number) => {
    const statusCode =
      status in STAFF_ROOM_STATUS_LABELS ? (status as StaffRoomStatusCode) : 0;

    switch (status) {
      case 0:
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-bold uppercase flex items-center gap-1 ${STAFF_ROOM_STATUS_BADGE_CLASSES[statusCode]}`}
          >
            <CheckCircle size={12} /> {STAFF_ROOM_STATUS_LABELS[statusCode]}
          </span>
        );
      case 1:
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-bold uppercase flex items-center gap-1 ${STAFF_ROOM_STATUS_BADGE_CLASSES[statusCode]}`}
          >
            <AlertTriangle size={12} /> {STAFF_ROOM_STATUS_LABELS[statusCode]}
          </span>
        );
      case -1:
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-bold uppercase flex items-center gap-1 ${STAFF_ROOM_STATUS_BADGE_CLASSES[statusCode]}`}
          >
            <Brush size={12} /> {STAFF_ROOM_STATUS_LABELS[statusCode]}
          </span>
        );
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      SGL: "bg-blue-500/20 text-blue-400",
      TWN: "bg-purple-500/20 text-purple-400",
      DBL: "bg-accent-gold/20 text-accent-gold",
      TRPL: "bg-accent-primary/20 text-accent-primary",
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
    <DashboardLayout allowedRoles={["receptionist", "manager"]}>
      <div className="h-full flex flex-col min-h-0">
        <div className="shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl text-text-primary mb-1">
              TRẠNG THÁI PHÒNG
            </h1>
            <p className="text-text-secondary">
              Theo dõi và cập nhật trạng thái các phòng hiện tại
            </p>
          </div>
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
                placeholder="Tìm mã phòng, tên..."
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
              {STAFF_ROOM_STATUS_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
            {filteredRooms.length === 0 ? (
              <div className="col-span-full p-8 text-center text-text-muted card-cinema">
                Không tìm thấy phòng nào phù hợp.
              </div>
            ) : (
              paginatedRooms.map((room) => (
                <div
                  key={room.id}
                  className="card-cinema p-4 flex flex-col gap-4"
                >
                  <div className="flex gap-4">
                    <img
                      src={room.image}
                      alt={room.name}
                      className="w-20 h-20 rounded-lg object-cover border border-border-subtle"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-mono text-accent-neon font-bold">
                          {room.id}
                        </span>
                        {getTypeBadge(room.type)}
                      </div>
                      <h3 className="text-text-primary font-bold text-sm line-clamp-1">
                        {room.name}
                      </h3>
                      <p className="text-text-muted text-xs mt-1">
                        {room.capacity} người
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                    <div>{getStatusBadge(room.status)}</div>
                    <select
                      className="bg-bg-primary border border-border-subtle text-text-primary text-xs rounded px-2 py-1 outline-none focus:border-accent-neon"
                      value={room.status}
                      onChange={(e) =>
                        handleStatusChange(
                          room.id,
                          parseInt(e.target.value) as StaffRoomStatusCode,
                        )
                      }
                    >
                      {STAFF_ROOM_STATUS_SELECT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="shrink-0 p-4 border border-border-subtle rounded-xl flex justify-between items-center text-sm text-text-muted bg-bg-secondary/30">
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

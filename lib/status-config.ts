import type { BookingStatus, RoomStatus } from "@/lib/mock-data";

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  upcoming: "Đã cọc",
  active: "Đang ở",
  completed: "Đã thanh toán",
  cancelled: "Đã hủy",
};

export const BOOKING_STATUS_BADGE_CLASSES: Record<BookingStatus, string> = {
  upcoming: "bg-warning text-black",
  active: "bg-accent-neon text-black",
  completed: "bg-success text-black",
  cancelled: "bg-bg-secondary text-text-muted border border-border-subtle",
};

export const BOOKING_STATUS_FILTERS: Record<string, BookingStatus[]> = {
  all: ["upcoming", "active", "completed", "cancelled"],
  "0": ["upcoming"],
  "1": ["active"],
  "2": ["completed"],
  "3": ["cancelled"],
};

export const BOOKING_STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "0", label: BOOKING_STATUS_LABELS.upcoming },
  { value: "1", label: BOOKING_STATUS_LABELS.active },
  { value: "2", label: BOOKING_STATUS_LABELS.completed },
  { value: "3", label: BOOKING_STATUS_LABELS.cancelled },
] as const;

export const BOOKING_STATUS_SELECT_OPTIONS = [
  { value: "upcoming", label: `Đổi: ${BOOKING_STATUS_LABELS.upcoming}` },
  { value: "active", label: `Đổi: ${BOOKING_STATUS_LABELS.active} (Check-in)` },
  { value: "completed", label: `Đổi: Đã xong (Check-out)` },
  { value: "cancelled", label: `Đổi: ${BOOKING_STATUS_LABELS.cancelled}` },
] as const;

export type StaffBookingStatusCode = 0 | 1 | 2 | 3;

export const STAFF_BOOKING_STATUS_LABELS: Record<StaffBookingStatusCode, string> = {
  0: BOOKING_STATUS_LABELS.upcoming,
  1: BOOKING_STATUS_LABELS.active,
  2: BOOKING_STATUS_LABELS.completed,
  3: BOOKING_STATUS_LABELS.cancelled,
};

export const STAFF_BOOKING_STATUS_BADGE_CLASSES: Record<
  StaffBookingStatusCode,
  string
> = {
  0: "bg-warning text-black",
  1: "bg-accent-neon text-black",
  2: "bg-success text-black",
  3: "bg-bg-secondary text-text-muted border border-border-subtle",
};

export const STAFF_BOOKING_STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "0", label: STAFF_BOOKING_STATUS_LABELS[0] },
  { value: "1", label: STAFF_BOOKING_STATUS_LABELS[1] },
  { value: "2", label: STAFF_BOOKING_STATUS_LABELS[2] },
  { value: "3", label: STAFF_BOOKING_STATUS_LABELS[3] },
] as const;

export const STAFF_BOOKING_STATUS_CODE_MAP: Record<
  string,
  StaffBookingStatusCode[]
> = {
  all: [0, 1, 2, 3],
  "0": [0],
  "1": [1],
  "2": [2],
  "3": [3],
};

export const STAFF_BOOKING_STATUS_SELECT_OPTIONS = [
  { value: 0, label: `Đổi: ${STAFF_BOOKING_STATUS_LABELS[0]}` },
  { value: 1, label: `Đổi: ${STAFF_BOOKING_STATUS_LABELS[1]} (Check-in)` },
  { value: 2, label: "Đổi: Đã xong (Check-out)" },
  { value: 3, label: `Đổi: ${STAFF_BOOKING_STATUS_LABELS[3]}` },
] as const;

export const BOOKING_FORM_ROOM_OPTIONS = [
  { value: "RM-101", label: "RM-101 (Single Standard)" },
  { value: "RM-205", label: "RM-205 (Director Cut VIP)" },
] as const;

export const BOOKING_FORM_STATUS_OPTIONS = [
  { value: "0", label: STAFF_BOOKING_STATUS_LABELS[0] },
  { value: "1", label: STAFF_BOOKING_STATUS_LABELS[1] },
  { value: "2", label: STAFF_BOOKING_STATUS_LABELS[2] },
  { value: "3", label: STAFF_BOOKING_STATUS_LABELS[3] },
] as const;

export const ADMIN_ROOM_STATUS_FILTERS: Record<string, RoomStatus[]> = {
  all: ["available", "few_left", "full", "cleaning"],
  "0": ["available"],
  "1": ["few_left", "full"],
  "-1": ["cleaning"],
};

export const ADMIN_ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  available: "Trống",
  few_left: "Đã đặt",
  full: "Đã đặt",
  cleaning: "Đang dọn",
};

export const ADMIN_ROOM_STATUS_BADGE_CLASSES: Record<RoomStatus, string> = {
  available: "bg-success/20 text-success",
  few_left: "bg-warning/20 text-warning",
  full: "bg-warning/20 text-warning",
  cleaning: "bg-danger/20 text-danger",
};

export const ADMIN_ROOM_HEATMAP_CLASSES: Record<RoomStatus, string> = {
  available: "bg-success/20 border-success/50 text-success hover:bg-success/30",
  few_left: "bg-warning/20 border-warning/50 text-warning hover:bg-warning/30",
  full: "bg-warning/20 border-warning/50 text-warning hover:bg-warning/30",
  cleaning: "bg-danger/20 border-danger/50 text-danger hover:bg-danger/30",
};

export const ADMIN_ROOM_STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "0", label: "Trống" },
  { value: "1", label: "Đã đặt" },
  { value: "-1", label: "Đang dọn" },
] as const;

export const ADMIN_ROOM_TYPE_FILTER_OPTIONS = [
  { value: "all", label: "Tất cả loại phòng" },
  { value: "SGL", label: "Single (SGL)" },
  { value: "TWN", label: "Twin (TWN)" },
  { value: "DBL", label: "Double (DBL)" },
  { value: "TRPL", label: "Triple (TRPL)" },
] as const;

export const ADMIN_ROOM_TYPE_FORM_OPTIONS = [
  { value: "SGL", label: "Single (1 giường đơn)" },
  { value: "TWN", label: "Twin (2 giường đơn)" },
  { value: "DBL", label: "Double (1 giường đôi)" },
  { value: "TRPL", label: "Triple (1 đôi + 1 đơn)" },
] as const;

export const ADMIN_ROOM_STATUS_CREATE_OPTIONS = [
  { value: "0", label: "Trống (Sẵn sàng)" },
  { value: "-1", label: "Đang dọn dẹp" },
] as const;

export const ADMIN_ROOM_STATUS_EDIT_OPTIONS = [
  { value: "0", label: "Trống (Sẵn sàng)" },
  { value: "1", label: "Đã đặt / Đang ở" },
  { value: "-1", label: "Đang dọn dẹp" },
] as const;

export const ADMIN_ROOM_TYPE_FILTERS: Record<string, string> = {
  SGL: "Single Room",
  TWN: "Twin Room",
  DBL: "Double Room",
  TRPL: "VIP Room",
};

export type StaffRoomStatusCode = -1 | 0 | 1;

export const STAFF_ROOM_STATUS_LABELS: Record<StaffRoomStatusCode, string> = {
  [-1]: "Đang dọn",
  0: "Trống",
  1: "Đang ở",
};

export const STAFF_ROOM_STATUS_BADGE_CLASSES: Record<StaffRoomStatusCode, string> = {
  [-1]: "bg-danger/20 text-danger",
  0: "bg-success/20 text-success",
  1: "bg-warning/20 text-warning",
};

export const STAFF_ROOM_STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "0", label: STAFF_ROOM_STATUS_LABELS[0] },
  { value: "1", label: STAFF_ROOM_STATUS_LABELS[1] },
  { value: "-1", label: STAFF_ROOM_STATUS_LABELS[-1] },
] as const;

export const STAFF_ROOM_STATUS_CODE_MAP: Record<string, StaffRoomStatusCode[]> = {
  all: [0, 1, -1],
  "0": [0],
  "1": [1],
  "-1": [-1],
};

export const STAFF_ROOM_STATUS_SELECT_OPTIONS = [
  { value: 0, label: `Đổi thành: ${STAFF_ROOM_STATUS_LABELS[0]}` },
  { value: 1, label: `Đổi thành: ${STAFF_ROOM_STATUS_LABELS[1]}` },
  { value: -1, label: `Đổi thành: ${STAFF_ROOM_STATUS_LABELS[-1]}` },
] as const;

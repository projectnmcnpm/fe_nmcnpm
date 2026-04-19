import type { BookingStatus, RoomStatus } from "@/lib/mock-data";

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  upcoming: "Chờ nhận phòng",
  checked_in: "Đã check-in",
  in_stay: "Đang ở",
  checked_out: "Đã check-out",
  cancelled: "Đã hủy",
};

export const BOOKING_STATUS_BADGE_CLASSES: Record<BookingStatus, string> = {
  upcoming: "bg-warning text-black",
  checked_in: "bg-accent-neon text-black",
  in_stay: "bg-accent-primary text-white",
  checked_out: "bg-blue-500/20 text-blue-300 border border-blue-400/30",
  cancelled: "bg-bg-secondary text-text-muted border border-border-subtle",
};

export const BOOKING_STATUS_FILTERS: Record<string, BookingStatus[]> = {
  all: ["upcoming", "checked_in", "in_stay", "checked_out", "cancelled"],
  "0": ["upcoming"],
  "1": ["checked_in"],
  "2": ["in_stay"],
  "4": ["checked_out"],
  "3": ["cancelled"],
};

export const BOOKING_STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "0", label: BOOKING_STATUS_LABELS.upcoming },
  { value: "1", label: BOOKING_STATUS_LABELS.checked_in },
  { value: "2", label: BOOKING_STATUS_LABELS.in_stay },
  { value: "4", label: BOOKING_STATUS_LABELS.checked_out },
  { value: "3", label: BOOKING_STATUS_LABELS.cancelled },
] as const;

export const BOOKING_STATUS_SELECT_OPTIONS = [
  { value: "upcoming", label: `Đổi: ${BOOKING_STATUS_LABELS.upcoming}` },
  { value: "checked_in", label: `Đổi: ${BOOKING_STATUS_LABELS.checked_in}` },
  { value: "in_stay", label: `Đổi: ${BOOKING_STATUS_LABELS.in_stay}` },
  { value: "checked_out", label: `Đổi: ${BOOKING_STATUS_LABELS.checked_out}` },
  { value: "cancelled", label: `Đổi: ${BOOKING_STATUS_LABELS.cancelled}` },
] as const;

export type StaffBookingStatusCode = 0 | 1 | 2 | 3 | 4;

export const STAFF_BOOKING_STATUS_LABELS: Record<StaffBookingStatusCode, string> = {
  0: BOOKING_STATUS_LABELS.upcoming,
  1: BOOKING_STATUS_LABELS.checked_in,
  2: BOOKING_STATUS_LABELS.in_stay,
  3: BOOKING_STATUS_LABELS.cancelled,
  4: BOOKING_STATUS_LABELS.checked_out,
};

export const STAFF_BOOKING_STATUS_BADGE_CLASSES: Record<
  StaffBookingStatusCode,
  string
> = {
  0: "bg-warning text-black",
  1: "bg-accent-neon text-black",
  2: "bg-accent-primary text-white",
  3: "bg-bg-secondary text-text-muted border border-border-subtle",
  4: "bg-blue-500/20 text-blue-300 border border-blue-400/30",
};

export const STAFF_BOOKING_STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "0", label: STAFF_BOOKING_STATUS_LABELS[0] },
  { value: "1", label: STAFF_BOOKING_STATUS_LABELS[1] },
  { value: "2", label: STAFF_BOOKING_STATUS_LABELS[2] },
  { value: "4", label: STAFF_BOOKING_STATUS_LABELS[4] },
  { value: "3", label: STAFF_BOOKING_STATUS_LABELS[3] },
] as const;

export const STAFF_BOOKING_STATUS_CODE_MAP: Record<
  string,
  StaffBookingStatusCode[]
> = {
  all: [0, 1, 2, 4, 3],
  "0": [0],
  "1": [1],
  "2": [2],
  "4": [4],
  "3": [3],
};

export const STAFF_BOOKING_STATUS_SELECT_OPTIONS = [
  { value: 0, label: `Đổi: ${STAFF_BOOKING_STATUS_LABELS[0]}` },
  { value: 1, label: `Đổi: ${STAFF_BOOKING_STATUS_LABELS[1]}` },
  { value: 2, label: `Đổi: ${STAFF_BOOKING_STATUS_LABELS[2]}` },
  { value: 4, label: `Đổi: ${STAFF_BOOKING_STATUS_LABELS[4]}` },
  { value: 3, label: `Đổi: ${STAFF_BOOKING_STATUS_LABELS[3]}` },
] as const;

export const BOOKING_FORM_ROOM_OPTIONS = [] as const;

export const BOOKING_FORM_STATUS_OPTIONS = [
  { value: "0", label: STAFF_BOOKING_STATUS_LABELS[0] },
  { value: "1", label: STAFF_BOOKING_STATUS_LABELS[1] },
  { value: "2", label: STAFF_BOOKING_STATUS_LABELS[2] },
  { value: "4", label: STAFF_BOOKING_STATUS_LABELS[4] },
  { value: "3", label: STAFF_BOOKING_STATUS_LABELS[3] },
] as const;

export const ADMIN_ROOM_STATUS_FILTERS: Record<string, RoomStatus[]> = {
  all: [
    "available",
    "in_use",
    "pending_cleaning",
    "cleaning_in_progress",
    "cleaned",
    "maintenance",
  ],
  "0": ["available"],
  "1": ["in_use"],
  "2": ["pending_cleaning"],
  "-1": ["cleaning_in_progress"],
  "3": ["cleaned"],
  "-2": ["maintenance"],
};

export const ADMIN_ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  available: "Trống",
  in_use: "Đang sử dụng",
  pending_cleaning: "Chờ dọn",
  cleaning_in_progress: "Đang dọn",
  cleaned: "Đã dọn",
  maintenance: "Bảo trì",
};

export const ADMIN_ROOM_STATUS_BADGE_CLASSES: Record<RoomStatus, string> = {
  available: "bg-success/20 text-success",
  in_use: "bg-warning/20 text-warning",
  pending_cleaning: "bg-orange-500/20 text-orange-300",
  cleaning_in_progress: "bg-danger/20 text-danger",
  cleaned: "bg-cyan-500/20 text-cyan-300",
  maintenance: "bg-slate-500/20 text-slate-300",
};

export const ADMIN_ROOM_HEATMAP_CLASSES: Record<RoomStatus, string> = {
  available: "bg-success/20 border-success/50 text-success hover:bg-success/30",
  in_use: "bg-warning/20 border-warning/50 text-warning hover:bg-warning/30",
  pending_cleaning: "bg-orange-500/20 border-orange-400/50 text-orange-300 hover:bg-orange-500/30",
  cleaning_in_progress: "bg-danger/20 border-danger/50 text-danger hover:bg-danger/30",
  cleaned: "bg-cyan-500/20 border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/30",
  maintenance: "bg-slate-500/20 border-slate-400/50 text-slate-300 hover:bg-slate-500/30",
};

export const ADMIN_ROOM_STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "0", label: "Trống" },
  { value: "1", label: "Đang sử dụng" },
  { value: "2", label: "Chờ dọn" },
  { value: "-1", label: "Đang dọn" },
  { value: "3", label: "Đã dọn" },
  { value: "-2", label: "Bảo trì" },
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
  { value: "-2", label: "Bảo trì" },
] as const;

export const ADMIN_ROOM_STATUS_EDIT_OPTIONS = [
  { value: "0", label: "Trống" },
  { value: "1", label: "Đang sử dụng" },
  { value: "2", label: "Chờ dọn" },
  { value: "-1", label: "Đang dọn" },
  { value: "3", label: "Đã dọn" },
  { value: "-2", label: "Bảo trì" },
] as const;

export const ADMIN_ROOM_TYPE_FILTERS: Record<string, string> = {
  SGL: "Single Room",
  TWN: "Twin Room",
  DBL: "Double Room",
  TRPL: "VIP Room",
};

export type StaffRoomStatusCode = -2 | -1 | 0 | 1 | 2 | 3;

export const STAFF_ROOM_STATUS_LABELS: Record<StaffRoomStatusCode, string> = {
  [-2]: "Bảo trì",
  [-1]: "Đang dọn",
  0: "Trống",
  1: "Đang sử dụng",
  2: "Chờ dọn",
  3: "Đã dọn",
};

export const STAFF_ROOM_STATUS_BADGE_CLASSES: Record<StaffRoomStatusCode, string> = {
  [-2]: "bg-slate-500/20 text-slate-300",
  [-1]: "bg-danger/20 text-danger",
  0: "bg-success/20 text-success",
  1: "bg-warning/20 text-warning",
  2: "bg-orange-500/20 text-orange-300",
  3: "bg-cyan-500/20 text-cyan-300",
};

export const STAFF_ROOM_STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "0", label: STAFF_ROOM_STATUS_LABELS[0] },
  { value: "1", label: STAFF_ROOM_STATUS_LABELS[1] },
  { value: "2", label: STAFF_ROOM_STATUS_LABELS[2] },
  { value: "-1", label: STAFF_ROOM_STATUS_LABELS[-1] },
  { value: "3", label: STAFF_ROOM_STATUS_LABELS[3] },
  { value: "-2", label: STAFF_ROOM_STATUS_LABELS[-2] },
] as const;

export const STAFF_ROOM_STATUS_CODE_MAP: Record<string, StaffRoomStatusCode[]> = {
  all: [0, 1, 2, -1, 3, -2],
  "0": [0],
  "1": [1],
  "2": [2],
  "-1": [-1],
  "3": [3],
  "-2": [-2],
};

export const STAFF_ROOM_STATUS_SELECT_OPTIONS = [
  { value: 0, label: `Đổi thành: ${STAFF_ROOM_STATUS_LABELS[0]}` },
  { value: 1, label: `Đổi thành: ${STAFF_ROOM_STATUS_LABELS[1]}` },
  { value: 2, label: `Đổi thành: ${STAFF_ROOM_STATUS_LABELS[2]}` },
  { value: -1, label: `Đổi thành: ${STAFF_ROOM_STATUS_LABELS[-1]}` },
  { value: 3, label: `Đổi thành: ${STAFF_ROOM_STATUS_LABELS[3]}` },
  { value: -2, label: `Đổi thành: ${STAFF_ROOM_STATUS_LABELS[-2]}` },
] as const;

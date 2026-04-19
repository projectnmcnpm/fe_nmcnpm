import type { Booking, BookingStatus, Room, RoomStatus } from "@/lib/mock-data";

type Primitive = string | number | boolean | null | undefined;

type QueryValue = Primitive | Primitive[];

type QueryParams = Record<string, QueryValue>;

type ApiEnvelope<T> = {
  data?: T;
  message?: string;
};

type PagedResultDto<T> = {
  content?: T[];
};

type RoomDto = {
  id?: string;
  roomId?: string;
  name?: string;
  roomName?: string;
  type?: string;
  roomType?: string;
  capacity?: number | string;
  price?: number | string;
  pricePerHour?: number | string;
  status?: string | number;
  image?: string;
  coverImageUrl?: string;
  thumbnail?: string;
  gallery?: string[];
  galleryUrls?: string[];
  amenities?: string[];
  description?: string;
};

type RoomAvailabilityDayDto = {
  date?: string;
  booked?: boolean;
  bookedRanges?: string[];
  availableFrom?: string;
  note?: string;
};

type BookingDto = {
  id?: string;
  bookingId?: string;
  roomId?: string;
  roomName?: string;
  userId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerIdNumber?: string;
  checkIn?: string;
  checkOut?: string;
  checkInTime?: string;
  checkOutTime?: string;
  bookingType?: "day" | "hour";
  total?: number | string;
  status?: string | number;
  paymentStatus?: "unpaid" | "deposited" | "paid";
  stayStatus?: "check_in" | "in_stay" | "check_out" | "cancelled";
  refundStatus?: "none" | "eligible" | "ineligible" | "refunded";
  image?: string;
  paymentMethod?: string;
  paymentAmount?: string;
  payAmountVnd?: number | string;
  transferContent?: string;
  paymentQrUrl?: string;
  paymentExpiresAt?: string;
  paymentExpiresInSeconds?: number | string;
  cancelReason?: string;
  note?: string;
  createdAt?: string;
};

type PaymentQrDto = {
  bookingId?: string;
  paymentMethod?: string;
  paymentPercent?: number | string;
  payAmountVnd?: number | string;
  transferContent?: string;
  paymentQrType?: string;
  paymentExpiresInSeconds?: number | string;
  paymentExpiresAt?: string;
  paymentQrUrl?: string;
  bankBin?: string;
  bankAccountNo?: string;
  bankAccountName?: string;
};

export type AccountRole = "manager" | "receptionist" | "cleaner" | "customer";
export type AccountStatus = "active" | "disabled";

export type AccountRecord = {
  id: string;
  email: string;
  name: string;
  role: AccountRole;
  created: string;
  status: AccountStatus;
};

export type CreateAccountPayload = {
  email: string;
  name: string;
  role: AccountRole;
  status?: AccountStatus;
  password: string;
};

type AccountDto = {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  created?: string;
  status?: string;
};

export type CustomerRecord = {
  id: string;
  name: string;
  phone: string;
  cccd: string;
  email: string;
  bookings: number;
  created?: string;
  lastVisit?: string;
  color?: string;
};

type CustomerDto = {
  id?: string;
  name?: string;
  phone?: string;
  cccd?: string;
  email?: string;
  bookings?: number | string;
  created?: string;
  lastVisit?: string;
  color?: string;
};

export type CreateBookingPayload = Omit<
  Booking,
  "id" | "status" | "image"
> & {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerIdNumber: string;
  status?: BookingStatus;
  image?: string;
};

export type UpdateBookingPayload = {
  roomId: string;
  roomName?: string;
  userId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerIdNumber?: string;
  checkIn: string;
  checkOut: string;
  checkInTime?: string;
  checkOutTime?: string;
  bookingType?: "day" | "hour";
  total: number;
  note?: string;
};

export type CreateRoomPayload = {
  name: string;
  type: string;
  capacity?: number;
  pricePerNight: number;
  pricePerHour?: number;
  status?: RoomStatus;
  amenities?: string[];
  description?: string;
  coverImage?: File;
  galleryFiles?: File[];
};

export type UpdateRoomPayload = {
  name: string;
  type: string;
  capacity?: number;
  pricePerNight: number;
  pricePerHour?: number;
  status?: RoomStatus;
  amenities?: string[];
  description?: string;
};

export type BookingPaymentQrRecord = {
  bookingId: string;
  paymentMethod?: string;
  paymentPercent?: number;
  payAmountVnd: number;
  transferContent?: string;
  paymentQrType?: string;
  paymentExpiresInSeconds?: number;
  paymentExpiresAt?: string;
  paymentQrUrl?: string;
  bankBin?: string;
  bankAccountNo?: string;
  bankAccountName?: string;
};

export type BookingExportParams = {
  status?: string;
  from?: string;
  to?: string;
};

export type BookingExportFile = {
  blob: Blob;
  fileName: string;
  contentType: string;
};

export type RoomAvailabilityDayRecord = {
  date: string;
  booked: boolean;
  bookedRanges: string[];
  availableFrom: string;
  note?: string;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: AccountRole;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: number;
  user: AuthUser;
};

type AuthUserDto = {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
};

type AuthResponseDto = {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number | string;
  user?: AuthUserDto;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "";

const AUTH_STORAGE_KEY = "genz_auth_session";

const DEFAULT_HEADERS: HeadersInit = {
  "Content-Type": "application/json",
};

const DEFAULT_ROOM_IMAGE =
  "https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=2057&auto=format&fit=crop";

const DEFAULT_BOOKING_IMAGE = DEFAULT_ROOM_IMAGE;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function normalizeAuthRole(role: string | undefined): AccountRole {
  if (role === "manager" || role === "receptionist" || role === "cleaner" || role === "customer") {
    return role;
  }

  return "customer";
}

function normalizeAuthSession(dto: AuthResponseDto): AuthSession {
  const expiresIn = toNumber(dto.expiresIn, 0);
  const user = dto.user || {};

  return {
    accessToken: dto.accessToken || "",
    refreshToken: dto.refreshToken || "",
    expiresIn,
    expiresAt: Date.now() + expiresIn * 1000,
    user: {
      id: user.id || "",
      email: user.email || "",
      name: user.name || "",
      role: normalizeAuthRole(user.role),
    },
  };
}

export function getStoredAuth(): AuthSession | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function setStoredAuth(session: AuthSession | null): void {
  if (!isBrowser()) {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredAuth(): void {
  setStoredAuth(null);
}

export function getStoredAccessToken(): string {
  return getStoredAuth()?.accessToken || "";
}

export function getStoredRefreshToken(): string {
  return getStoredAuth()?.refreshToken || "";
}

function toNumber(value: number | string | undefined, fallback = 0): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function normalizeRoomStatus(status: unknown): RoomStatus {
  if (status === "available" || status === 0 || status === "0") return "available";
  if (status === "in_use" || status === 1 || status === "1") return "in_use";
  if (status === "pending_cleaning" || status === 2 || status === "2") return "pending_cleaning";
  if (status === "cleaning_in_progress" || status === -1 || status === "-1") return "cleaning_in_progress";
  if (status === "cleaned" || status === 3 || status === "3") return "cleaned";
  if (status === "maintenance" || status === -2 || status === "-2") return "maintenance";

  // Backward compatibility for legacy backend statuses.
  if (status === "few_left" || status === "full") return "in_use";
  if (status === "cleaning") return "cleaning_in_progress";

  return "available";
}

function normalizeBookingStatus(status: unknown): BookingStatus {
  if (status === "upcoming" || status === 0 || status === "0") return "upcoming";
  if (status === "checked_in" || status === 1 || status === "1") return "checked_in";
  if (status === "in_stay" || status === 2 || status === "2") return "in_stay";
  if (status === "checked_out" || status === 4 || status === "4") return "checked_out";
  if (status === "cancelled" || status === 3 || status === "3") return "cancelled";

  // Backward compatibility for legacy backend statuses.
  if (status === "active") return "checked_in";
  if (status === "completed") return "checked_out";

  return "upcoming";
}

function buildQuery(params?: QueryParams): string {
  if (!params) return "";

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== null && item !== undefined && item !== "") {
          searchParams.append(key, String(item));
        }
      });
      return;
    }

    searchParams.append(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

function withBaseUrl(path: string): string {
  if (!API_BASE_URL) return path;
  return `${API_BASE_URL}${path}`;
}

function parseFilenameFromContentDisposition(
  contentDisposition: string | null,
  fallback: string,
): string {
  if (!contentDisposition) {
    return fallback;
  }

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return utf8Match[1];
    }
  }

  const quotedMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (quotedMatch?.[1]) {
    return quotedMatch[1];
  }

  return fallback;
}

function canAttachAuthHeader(path: string): boolean {
  return !path.startsWith("/api/auth/login")
    && !path.startsWith("/api/auth/register")
    && !path.startsWith("/api/auth/refresh");
}

function canRetryWithRefresh(path: string): boolean {
  return !path.startsWith("/api/auth/");
}

async function refreshStoredAuthSession(): Promise<AuthSession | null> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const result = await performRequest<AuthResponseDto>(
      "/api/auth/refresh",
      {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      },
      undefined,
      {
        attachAuth: false,
        allowRefreshRetry: false,
      },
    );

    const session = normalizeAuthSession(result);
    setStoredAuth(session);
    return session;
  } catch {
    clearStoredAuth();
    return null;
  }
}

type RequestOptions = {
  attachAuth?: boolean;
  allowRefreshRetry?: boolean;
};

async function performRequest<T>(
  path: string,
  init?: RequestInit,
  query?: QueryParams,
  options: RequestOptions = {},
): Promise<T> {
  const url = withBaseUrl(`${path}${buildQuery(query)}`);
  const attachAuth = options.attachAuth ?? true;
  const allowRefreshRetry = options.allowRefreshRetry ?? true;
  const isFormDataBody = init?.body instanceof FormData;
  const headers = new Headers(isFormDataBody ? undefined : DEFAULT_HEADERS);

  if (init?.headers) {
    new Headers(init.headers).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  if (attachAuth && canAttachAuthHeader(path)) {
    const accessToken = getStoredAccessToken();
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  const response = await fetch(url, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    const rawBody = await response.text();
    if (
      response.status === 401
      && attachAuth
      && allowRefreshRetry
      && canRetryWithRefresh(path)
    ) {
      const refreshed = await refreshStoredAuthSession();
      if (refreshed?.accessToken) {
        return performRequest<T>(path, init, query, {
          attachAuth,
          allowRefreshRetry: false,
        });
      }
    }

    if (response.status === 401 && attachAuth) {
      clearStoredAuth();
    }

    let message = "Yeu cau that bai";

    if (contentType.includes("application/json")) {
      try {
        const parsed = JSON.parse(rawBody) as
          | { message?: string; error?: string }
          | undefined;
        message = parsed?.message || parsed?.error || rawBody || message;
      } catch {
        message = rawBody || message;
      }
    } else if (contentType.includes("text/html") || /<!doctype html>/i.test(rawBody)) {
      message =
        "Khong ket noi duoc API backend. Vui long kiem tra NEXT_PUBLIC_API_BASE_URL va CORS tren backend.";
    } else {
      message = rawBody || message;
    }

    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json()) as T | ApiEnvelope<T>;

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    (payload as ApiEnvelope<T>).data !== undefined
  ) {
    return (payload as ApiEnvelope<T>).data as T;
  }

  return payload as T;
}

async function request<T>(
  path: string,
  init?: RequestInit,
  query?: QueryParams,
): Promise<T> {
  return performRequest<T>(path, init, query);
}

function mapRoomDto(dto: RoomDto): Room {
  const gallery = dto.gallery || dto.galleryUrls || [];

  return {
    id: dto.id || dto.roomId || "",
    name: dto.name || dto.roomName || "Unknown Room",
    type: dto.type || dto.roomType || "Single Room",
    capacity: dto.capacity !== undefined ? toNumber(dto.capacity) : undefined,
    price: toNumber(dto.price),
    pricePerHour: toNumber(dto.pricePerHour),
    status: normalizeRoomStatus(dto.status),
    image: dto.image || dto.coverImageUrl || dto.thumbnail || DEFAULT_ROOM_IMAGE,
    gallery,
    amenities: dto.amenities || [],
    description: dto.description || "",
  };
}

function mapRoomAvailabilityDayDto(dto: RoomAvailabilityDayDto): RoomAvailabilityDayRecord {
  return {
    date: dto.date || "",
    booked: Boolean(dto.booked),
    bookedRanges: dto.bookedRanges || [],
    availableFrom: dto.availableFrom || "",
    note: dto.note,
  };
}

function mapBookingDto(dto: BookingDto): Booking {
  return {
    id: dto.id || dto.bookingId || "",
    roomId: dto.roomId || "",
    roomName: dto.roomName || "",
    userId: dto.userId || dto.customerEmail || "",
    customerName: dto.customerName,
    customerPhone: dto.customerPhone,
    customerIdNumber: dto.customerIdNumber,
    checkIn: dto.checkIn || "",
    checkOut: dto.checkOut || "",
    checkInTime: dto.checkInTime,
    checkOutTime: dto.checkOutTime,
    bookingType: dto.bookingType,
    total: toNumber(dto.total),
    status: normalizeBookingStatus(dto.status),
    paymentStatus: dto.paymentStatus,
    stayStatus: dto.stayStatus,
    refundStatus: dto.refundStatus,
    image: dto.image || DEFAULT_BOOKING_IMAGE,
    paymentMethod: dto.paymentMethod,
    paymentAmount: dto.paymentAmount,
    payAmountVnd: toNumber(dto.payAmountVnd),
    transferContent: dto.transferContent,
    paymentQrUrl: dto.paymentQrUrl,
    paymentExpiresAt: dto.paymentExpiresAt,
    paymentExpiresInSeconds: toNumber(dto.paymentExpiresInSeconds),
    cancelReason: dto.cancelReason,
    note: dto.note,
    createdAt: dto.createdAt,
  };
}

function mapPaymentQrDto(dto: PaymentQrDto): BookingPaymentQrRecord {
  return {
    bookingId: dto.bookingId || "",
    paymentMethod: dto.paymentMethod,
    paymentPercent: dto.paymentPercent !== undefined
      ? toNumber(dto.paymentPercent)
      : undefined,
    payAmountVnd: toNumber(dto.payAmountVnd),
    transferContent: dto.transferContent,
    paymentQrType: dto.paymentQrType,
    paymentExpiresInSeconds: dto.paymentExpiresInSeconds !== undefined
      ? toNumber(dto.paymentExpiresInSeconds)
      : undefined,
    paymentExpiresAt: dto.paymentExpiresAt,
    paymentQrUrl: dto.paymentQrUrl,
    bankBin: dto.bankBin,
    bankAccountNo: dto.bankAccountNo,
    bankAccountName: dto.bankAccountName,
  };
}

function toBookingCreateDto(payload: CreateBookingPayload): Record<string, unknown> {
  return {
    roomId: payload.roomId,
    roomName: payload.roomName,
    userId: payload.userId,
    customerName: payload.customerName,
    customerEmail: payload.customerEmail,
    customerPhone: payload.customerPhone,
    customerIdNumber: payload.customerIdNumber,
    checkIn: payload.checkIn,
    checkOut: payload.checkOut,
    checkInTime: payload.checkInTime,
    checkOutTime: payload.checkOutTime,
    bookingType: payload.bookingType,
    total: payload.total,
    status: payload.status || "upcoming",
    image: payload.image || DEFAULT_BOOKING_IMAGE,
    paymentMethod: payload.paymentMethod,
    paymentAmount: payload.paymentAmount,
    note: payload.note,
    cancelReason: payload.cancelReason,
  };
}

function toBookingUpdateDto(payload: UpdateBookingPayload): Record<string, unknown> {
  return {
    roomId: payload.roomId,
    roomName: payload.roomName,
    userId: payload.userId,
    customerName: payload.customerName,
    customerEmail: payload.customerEmail,
    customerPhone: payload.customerPhone,
    customerIdNumber: payload.customerIdNumber,
    checkIn: payload.checkIn,
    checkOut: payload.checkOut,
    checkInTime: payload.checkInTime,
    checkOutTime: payload.checkOutTime,
    bookingType: payload.bookingType,
    total: payload.total,
    note: payload.note,
  };
}

function mapAccountDto(dto: AccountDto): AccountRecord {
  return {
    id: dto.id || "",
    email: dto.email || "",
    name: dto.name || "",
    role: (dto.role as AccountRole) || "customer",
    created: dto.created || "",
    status: (dto.status as AccountStatus) || "active",
  };
}

function mapCustomerDto(dto: CustomerDto): CustomerRecord {
  return {
    id: dto.id || "",
    name: dto.name || "",
    phone: dto.phone || "",
    cccd: dto.cccd || "",
    email: dto.email || "",
    bookings: toNumber(dto.bookings),
    created: dto.created,
    lastVisit: dto.lastVisit,
    color: dto.color,
  };
}

export const apiClient = {
  async login(email: string, password: string): Promise<AuthSession> {
    const result = await performRequest<AuthResponseDto>(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
      undefined,
      {
        attachAuth: false,
        allowRefreshRetry: false,
      },
    );

    const session = normalizeAuthSession(result);
    setStoredAuth(session);
    return session;
  },

  async register(name: string, email: string, password: string): Promise<AuthSession> {
    const result = await performRequest<AuthResponseDto>(
      "/api/auth/register",
      {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      },
      undefined,
      {
        attachAuth: false,
        allowRefreshRetry: false,
      },
    );

    const session = normalizeAuthSession(result);
    setStoredAuth(session);
    return session;
  },

  async refreshSession(): Promise<AuthSession | null> {
    return refreshStoredAuthSession();
  },

  async logout(): Promise<void> {
    try {
      await performRequest<void>(
        "/api/auth/logout",
        {
          method: "POST",
        },
        undefined,
        {
          allowRefreshRetry: false,
        },
      );
    } catch {
      // Ignore logout failures and clear local state anyway.
    } finally {
      clearStoredAuth();
    }
  },

  async getRooms(params?: { status?: string; search?: string }) {
    const result = await request<RoomDto[] | PagedResultDto<RoomDto>>(
      "/api/rooms",
      undefined,
      params,
    );

    const roomList = Array.isArray(result) ? result : (result.content || []);
    return roomList.map(mapRoomDto);
  },

  async getRoomById(id: string) {
    const result = await request<RoomDto>(`/api/rooms/${id}`);
    return mapRoomDto(result);
  },

  async getRoomAvailability(id: string, days = 6): Promise<RoomAvailabilityDayRecord[]> {
    const result = await request<RoomAvailabilityDayDto[]>(
      `/api/rooms/${id}/availability`,
      undefined,
      { days },
    );
    return result.map(mapRoomAvailabilityDayDto);
  },

  async createRoom(payload: CreateRoomPayload) {
    const createData = new FormData();
    createData.append("name", payload.name);
    createData.append("type", payload.type);
    createData.append("pricePerNight", String(payload.pricePerNight));

    if (payload.capacity !== undefined) {
      createData.append("capacity", String(payload.capacity));
    }

    if (payload.pricePerHour !== undefined) {
      createData.append("pricePerHour", String(payload.pricePerHour));
    }

    if (payload.status) {
      createData.append("status", payload.status);
    }

    if (payload.amenities && payload.amenities.length > 0) {
      payload.amenities.forEach((item) => {
        createData.append("amenities", item);
      });
    }

    if (payload.description) {
      createData.append("description", payload.description);
    }

    if (payload.coverImage) {
      createData.append("coverImage", payload.coverImage);
    }

    const createdRoom = await request<RoomDto>("/api/rooms", {
      method: "POST",
      body: createData,
    });

    const room = mapRoomDto(createdRoom);

    if (payload.galleryFiles && payload.galleryFiles.length > 0) {
      for (const file of payload.galleryFiles) {
        const galleryData = new FormData();
        galleryData.append("file", file);
        await request<RoomDto>(`/api/rooms/${room.id}/gallery`, {
          method: "POST",
          body: galleryData,
        });
      }
    }

    return room;
  },

  async updateRoom(id: string, payload: UpdateRoomPayload) {
    const updateData = new FormData();
    updateData.append("name", payload.name);
    updateData.append("type", payload.type);
    updateData.append("pricePerNight", String(payload.pricePerNight));

    if (payload.capacity !== undefined) {
      updateData.append("capacity", String(payload.capacity));
    }

    if (payload.pricePerHour !== undefined) {
      updateData.append("pricePerHour", String(payload.pricePerHour));
    }

    if (payload.status) {
      updateData.append("status", payload.status);
    }

    if (payload.amenities && payload.amenities.length > 0) {
      payload.amenities.forEach((item) => {
        updateData.append("amenities", item);
      });
    }

    if (payload.description) {
      updateData.append("description", payload.description);
    }

    const result = await request<RoomDto>(`/api/rooms/${id}`, {
      method: "PUT",
      body: updateData,
    });

    return mapRoomDto(result);
  },

  async updateRoomStatus(id: string, status: RoomStatus) {
    const result = await request<RoomDto>(`/api/rooms/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    return mapRoomDto(result);
  },

  async deleteRoom(id: string) {
    await request<unknown>(`/api/rooms/${id}`, {
      method: "DELETE",
    });
  },

  async getBookings(params?: { userId?: string; status?: string; roomId?: string }) {
    const result = await request<BookingDto[] | PagedResultDto<BookingDto>>(
      "/api/bookings",
      undefined,
      params,
    );

    const bookingList = Array.isArray(result) ? result : (result.content || []);
    return bookingList.map(mapBookingDto);
  },

  async exportBookingsCsv(params?: BookingExportParams): Promise<BookingExportFile> {
    const path = "/api/bookings/export";
    const url = withBaseUrl(`${path}${buildQuery(params)}`);
    const headers = new Headers();

    const setAuthHeader = () => {
      const accessToken = getStoredAccessToken();
      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }
    };

    setAuthHeader();

    const fetchExport = async () => {
      return fetch(url, {
        method: "GET",
        headers,
        cache: "no-store",
      });
    };

    let response = await fetchExport();

    if (response.status === 401) {
      const refreshed = await refreshStoredAuthSession();
      if (refreshed?.accessToken) {
        setAuthHeader();
        response = await fetchExport();
      }
    }

    if (!response.ok) {
      const rawBody = await response.text();
      throw new ApiError(rawBody || "Khong the xuat danh sach dat phong", response.status);
    }

    const blob = await response.blob();
    const fileName = parseFilenameFromContentDisposition(
      response.headers.get("content-disposition"),
      "bookings_export.csv",
    );

    return {
      blob,
      fileName,
      contentType: response.headers.get("content-type") || "text/csv",
    };
  },

  async getBookingById(id: string) {
    const result = await request<BookingDto>(`/api/bookings/${id}`);
    return mapBookingDto(result);
  },

  async createBooking(payload: CreateBookingPayload) {
    const result = await request<BookingDto>("/api/bookings", {
      method: "POST",
      body: JSON.stringify(toBookingCreateDto(payload)),
    });
    return mapBookingDto(result);
  },

  async updateBooking(id: string, payload: UpdateBookingPayload) {
    const result = await request<BookingDto>(`/api/bookings/${id}`, {
      method: "PATCH",
      body: JSON.stringify(toBookingUpdateDto(payload)),
    });
    return mapBookingDto(result);
  },

  async getBookingPaymentQr(id: string) {
    const result = await request<PaymentQrDto>(`/api/bookings/${id}/payment-qr`);
    return mapPaymentQrDto(result);
  },

  async refreshBookingPaymentQr(id: string) {
    try {
      const result = await request<PaymentQrDto>(`/api/bookings/${id}/payment-qr/refresh`, {
        method: "POST",
      });
      return mapPaymentQrDto(result);
    } catch (error) {
      // Fallback to GET for backends that refresh on regular fetch.
      if (error instanceof ApiError && (error.status === 404 || error.status === 405)) {
        return this.getBookingPaymentQr(id);
      }
      throw error;
    }
  },

  async updateBookingStatus(id: string, status: BookingStatus) {
    const result = await request<BookingDto>(`/api/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    return mapBookingDto(result);
  },

  async cancelBooking(id: string, reason?: string) {
    const result = await request<BookingDto>(`/api/bookings/${id}/cancel`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    });
    return mapBookingDto(result);
  },

  async updateBookingPaymentStatus(
    id: string,
    paymentStatus: "unpaid" | "deposited" | "paid",
  ) {
    const result = await request<BookingDto>(`/api/bookings/${id}/payment-status`, {
      method: "PATCH",
      body: JSON.stringify({ paymentStatus }),
    });
    return mapBookingDto(result);
  },

  async updateBookingRefundStatus(
    id: string,
    refundStatus: "none" | "eligible" | "ineligible" | "refunded",
  ) {
    const result = await request<BookingDto>(`/api/bookings/${id}/refund-status`, {
      method: "PATCH",
      body: JSON.stringify({ refundStatus }),
    });
    return mapBookingDto(result);
  },

  async deleteBooking(id: string) {
    await request<unknown>(`/api/bookings/${id}`, {
      method: "DELETE",
    });
  },

  async getAccounts() {
    const result = await request<AccountDto[]>("/api/accounts");
    return result.map(mapAccountDto);
  },

  async createAccount(payload: CreateAccountPayload) {
    const result = await request<AccountDto>("/api/accounts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return mapAccountDto(result);
  },

  async updateAccount(id: string, payload: Partial<AccountRecord>) {
    const result = await request<AccountDto>(`/api/accounts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return mapAccountDto(result);
  },

  async deleteAccount(id: string) {
    await request<unknown>(`/api/accounts/${id}`, {
      method: "DELETE",
    });
  },

  async getCustomers() {
    const result = await request<CustomerDto[]>("/api/customers");
    return result.map(mapCustomerDto);
  },

  async createCustomer(payload: Omit<CustomerRecord, "id" | "bookings">) {
    const result = await request<CustomerDto>("/api/customers", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return mapCustomerDto(result);
  },

  async updateCustomer(id: string, payload: Partial<CustomerRecord>) {
    const result = await request<CustomerDto>(`/api/customers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return mapCustomerDto(result);
  },

  async deleteCustomer(id: string) {
    await request<unknown>(`/api/customers/${id}`, {
      method: "DELETE",
    });
  },
};

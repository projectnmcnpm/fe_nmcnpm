import type { Booking, BookingStatus, Room, RoomStatus } from "@/lib/mock-data";

type Primitive = string | number | boolean | null | undefined;

type QueryValue = Primitive | Primitive[];

type QueryParams = Record<string, QueryValue>;

type ApiEnvelope<T> = {
  data?: T;
  message?: string;
};

type RoomDto = {
  id?: string;
  roomId?: string;
  name?: string;
  roomName?: string;
  type?: string;
  roomType?: string;
  price?: number | string;
  pricePerHour?: number | string;
  status?: string | number;
  image?: string;
  thumbnail?: string;
  gallery?: string[];
  amenities?: string[];
  description?: string;
};

type BookingDto = {
  id?: string;
  bookingId?: string;
  roomId?: string;
  roomName?: string;
  userId?: string;
  customerPhone?: string;
  customerIdNumber?: string;
  checkIn?: string;
  checkOut?: string;
  checkInTime?: string;
  checkOutTime?: string;
  bookingType?: "day" | "hour";
  total?: number | string;
  status?: string | number;
  image?: string;
  paymentMethod?: string;
  paymentAmount?: string;
  cancelReason?: string;
  createdAt?: string;
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
  status?: BookingStatus;
  image?: string;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "";

const DEFAULT_HEADERS: HeadersInit = {
  "Content-Type": "application/json",
};

const DEFAULT_ROOM_IMAGE =
  "https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=2057&auto=format&fit=crop";

const DEFAULT_BOOKING_IMAGE = DEFAULT_ROOM_IMAGE;

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
  if (status === "few_left") return "few_left";
  if (status === "full" || status === 1 || status === "1") return "full";
  if (status === "cleaning" || status === -1 || status === "-1") return "cleaning";
  return "available";
}

function normalizeBookingStatus(status: unknown): BookingStatus {
  if (status === "upcoming" || status === 0 || status === "0") return "upcoming";
  if (status === "active" || status === 1 || status === "1") return "active";
  if (status === "completed" || status === 2 || status === "2") return "completed";
  if (status === "cancelled" || status === 3 || status === "3") return "cancelled";
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

async function request<T>(
  path: string,
  init?: RequestInit,
  query?: QueryParams,
): Promise<T> {
  const url = withBaseUrl(`${path}${buildQuery(query)}`);

  const response = await fetch(url, {
    ...init,
    headers: {
      ...DEFAULT_HEADERS,
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(text || "Request failed", response.status);
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

function mapRoomDto(dto: RoomDto): Room {
  return {
    id: dto.id || dto.roomId || "",
    name: dto.name || dto.roomName || "Unknown Room",
    type: dto.type || dto.roomType || "Single Room",
    price: toNumber(dto.price),
    pricePerHour: toNumber(dto.pricePerHour),
    status: normalizeRoomStatus(dto.status),
    image: dto.image || dto.thumbnail || DEFAULT_ROOM_IMAGE,
    gallery: dto.gallery || [],
    amenities: dto.amenities || [],
    description: dto.description || "",
  };
}

function mapBookingDto(dto: BookingDto): Booking {
  return {
    id: dto.id || dto.bookingId || "",
    roomId: dto.roomId || "",
    roomName: dto.roomName || "",
    userId: dto.userId || "",
    customerPhone: dto.customerPhone,
    customerIdNumber: dto.customerIdNumber,
    checkIn: dto.checkIn || "",
    checkOut: dto.checkOut || "",
    checkInTime: dto.checkInTime,
    checkOutTime: dto.checkOutTime,
    bookingType: dto.bookingType,
    total: toNumber(dto.total),
    status: normalizeBookingStatus(dto.status),
    image: dto.image || DEFAULT_BOOKING_IMAGE,
    paymentMethod: dto.paymentMethod,
    paymentAmount: dto.paymentAmount,
    cancelReason: dto.cancelReason,
    createdAt: dto.createdAt,
  };
}

function toBookingCreateDto(payload: CreateBookingPayload): Record<string, unknown> {
  return {
    roomId: payload.roomId,
    roomName: payload.roomName,
    userId: payload.userId,
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
    cancelReason: payload.cancelReason,
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
  async getRooms(params?: { status?: string; search?: string }) {
    const result = await request<RoomDto[]>("/api/rooms", undefined, params);
    return result.map(mapRoomDto);
  },

  async getRoomById(id: string) {
    const result = await request<RoomDto>(`/api/rooms/${id}`);
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
    const result = await request<BookingDto[]>("/api/bookings", undefined, params);
    return result.map(mapBookingDto);
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

  async deleteBooking(id: string) {
    await request<unknown>(`/api/bookings/${id}`, {
      method: "DELETE",
    });
  },

  async getAccounts() {
    const result = await request<AccountDto[]>("/api/accounts");
    return result.map(mapAccountDto);
  },

  async createAccount(payload: Omit<AccountRecord, "id" | "created">) {
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

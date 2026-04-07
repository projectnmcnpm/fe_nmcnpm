import {
  apiClient,
  type AccountRecord,
  type AccountStatus,
  type CustomerRecord,
} from "@/lib/api-client";
import {
  mockService,
  type Booking,
  type BookingStatus,
  type Room,
  type RoomStatus,
} from "@/lib/mock-data";

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";

export const dataService = {
  usingMockData: USE_MOCK_DATA,

  async getRooms(): Promise<Room[]> {
    if (USE_MOCK_DATA) return mockService.getRooms();
    return apiClient.getRooms();
  },

  async getRoomById(id: string): Promise<Room | undefined> {
    if (USE_MOCK_DATA) return mockService.getRoomById(id);
    return apiClient.getRoomById(id);
  },

  async updateRoomStatus(id: string, status: RoomStatus): Promise<void> {
    if (USE_MOCK_DATA) {
      mockService.updateRoomStatus(id, status);
      return;
    }
    await apiClient.updateRoomStatus(id, status);
  },

  async deleteRoom(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      return;
    }
    await apiClient.deleteRoom(id);
  },

  async getBookings(userId?: string): Promise<Booking[]> {
    if (USE_MOCK_DATA) return mockService.getBookings(userId);
    return apiClient.getBookings({ userId });
  },

  async createBooking(booking: Omit<Booking, "id">): Promise<Booking> {
    if (USE_MOCK_DATA) return mockService.createBooking(booking);

    return apiClient.createBooking({
      roomId: booking.roomId,
      roomName: booking.roomName,
      userId: booking.userId,
      customerPhone: booking.customerPhone,
      customerIdNumber: booking.customerIdNumber,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      checkInTime: booking.checkInTime,
      checkOutTime: booking.checkOutTime,
      bookingType: booking.bookingType,
      total: booking.total,
      paymentMethod: booking.paymentMethod,
      paymentAmount: booking.paymentAmount,
      cancelReason: booking.cancelReason,
      status: booking.status,
      image: booking.image,
      createdAt: booking.createdAt,
    });
  },

  async cancelBooking(id: string, reason?: string): Promise<void> {
    if (USE_MOCK_DATA) {
      mockService.cancelBooking(id, reason);
      return;
    }
    await apiClient.cancelBooking(id, reason);
  },

  async updateBookingStatus(id: string, status: BookingStatus): Promise<void> {
    if (USE_MOCK_DATA) {
      mockService.updateBookingStatus(id, status);
      return;
    }
    await apiClient.updateBookingStatus(id, status);
  },

  async deleteBooking(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      return;
    }
    await apiClient.deleteBooking(id);
  },

  async getAccounts(): Promise<AccountRecord[]> {
    if (USE_MOCK_DATA) return [];
    return apiClient.getAccounts();
  },

  async createAccount(
    payload: Omit<AccountRecord, "id" | "created">,
  ): Promise<AccountRecord> {
    if (USE_MOCK_DATA) {
      return {
        id: "",
        created: new Date().toLocaleDateString("vi-VN"),
        ...payload,
      };
    }
    return apiClient.createAccount(payload);
  },

  async updateAccount(
    id: string,
    payload: Partial<AccountRecord>,
  ): Promise<AccountRecord> {
    if (USE_MOCK_DATA) {
      return {
        id,
        email: "",
        name: "",
        role: "customer",
        created: "",
        status: "active" as AccountStatus,
        ...payload,
      } as AccountRecord;
    }
    return apiClient.updateAccount(id, payload);
  },

  async deleteAccount(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      return;
    }
    await apiClient.deleteAccount(id);
  },

  async getCustomers(): Promise<CustomerRecord[]> {
    if (USE_MOCK_DATA) return [];
    return apiClient.getCustomers();
  },

  async createCustomer(
    payload: Omit<CustomerRecord, "id" | "bookings">,
  ): Promise<CustomerRecord> {
    if (USE_MOCK_DATA) {
      return {
        id: "",
        bookings: 0,
        ...payload,
      };
    }
    return apiClient.createCustomer(payload);
  },

  async updateCustomer(
    id: string,
    payload: Partial<CustomerRecord>,
  ): Promise<CustomerRecord> {
    if (USE_MOCK_DATA) {
      return {
        id,
        name: "",
        phone: "",
        cccd: "",
        email: "",
        bookings: 0,
        ...payload,
      } as CustomerRecord;
    }
    return apiClient.updateCustomer(id, payload);
  },

  async deleteCustomer(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      return;
    }
    await apiClient.deleteCustomer(id);
  },
};

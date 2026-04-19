import {
  apiClient,
  type AccountRecord,
  type CreateAccountPayload,
  type BookingExportFile,
  type BookingExportParams,
  type BookingPaymentQrRecord,
  type CreateBookingPayload,
  type CreateRoomPayload,
  type RoomAvailabilityDayRecord,
  type UpdateBookingPayload,
  type UpdateRoomPayload,
  type CustomerRecord,
} from "@/lib/api-client";
import {
  type Booking,
  type BookingStatus,
  type Room,
  type RoomStatus,
} from "@/lib/mock-data";

export const dataService = {
  usingMockData: false,

  async getRooms(): Promise<Room[]> {
    return apiClient.getRooms();
  },

  async getRoomById(id: string): Promise<Room | undefined> {
    return apiClient.getRoomById(id);
  },

  async getRoomAvailability(id: string, days = 6): Promise<RoomAvailabilityDayRecord[]> {
    return apiClient.getRoomAvailability(id, days);
  },

  async createRoom(payload: CreateRoomPayload): Promise<Room> {
    return apiClient.createRoom(payload);
  },

  async updateRoom(id: string, payload: UpdateRoomPayload): Promise<Room> {
    return apiClient.updateRoom(id, payload);
  },

  async updateRoomStatus(id: string, status: RoomStatus): Promise<void> {
    await apiClient.updateRoomStatus(id, status);
  },

  async deleteRoom(id: string): Promise<void> {
    await apiClient.deleteRoom(id);
  },

  async getBookings(userId?: string): Promise<Booking[]> {
    return apiClient.getBookings({ userId });
  },

  async exportBookingsCsv(params?: BookingExportParams): Promise<BookingExportFile> {
    return apiClient.exportBookingsCsv(params);
  },

  async getBookingById(id: string): Promise<Booking | undefined> {
    return apiClient.getBookingById(id);
  },

  async createBooking(booking: CreateBookingPayload): Promise<Booking> {
    return apiClient.createBooking({
      roomId: booking.roomId,
      roomName: booking.roomName,
      userId: booking.userId,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
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
      note: booking.note,
      cancelReason: booking.cancelReason,
      status: booking.status,
      image: booking.image,
      createdAt: booking.createdAt,
    });
  },

  async updateBooking(id: string, booking: UpdateBookingPayload): Promise<Booking> {
    return apiClient.updateBooking(id, {
      roomId: booking.roomId,
      roomName: booking.roomName,
      userId: booking.userId,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      customerIdNumber: booking.customerIdNumber,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      checkInTime: booking.checkInTime,
      checkOutTime: booking.checkOutTime,
      bookingType: booking.bookingType,
      total: booking.total,
      note: booking.note,
    });
  },

  async getBookingPaymentQr(id: string): Promise<BookingPaymentQrRecord> {
    return apiClient.getBookingPaymentQr(id);
  },

  async refreshBookingPaymentQr(id: string): Promise<BookingPaymentQrRecord> {
    return apiClient.refreshBookingPaymentQr(id);
  },

  async cancelBooking(id: string, reason?: string): Promise<void> {
    await apiClient.cancelBooking(id, reason);
  },

  async updateBookingStatus(id: string, status: BookingStatus): Promise<void> {
    await apiClient.updateBookingStatus(id, status);
  },

  async updateBookingPaymentStatus(
    id: string,
    paymentStatus: "unpaid" | "deposited" | "paid",
  ): Promise<void> {
    await apiClient.updateBookingPaymentStatus(id, paymentStatus);
  },

  async deleteBooking(id: string): Promise<void> {
    await apiClient.deleteBooking(id);
  },

  async getAccounts(): Promise<AccountRecord[]> {
    return apiClient.getAccounts();
  },

  async createAccount(payload: CreateAccountPayload): Promise<AccountRecord> {
    return apiClient.createAccount(payload);
  },

  async updateAccount(
    id: string,
    payload: Partial<AccountRecord>,
  ): Promise<AccountRecord> {
    return apiClient.updateAccount(id, payload);
  },

  async deleteAccount(id: string): Promise<void> {
    await apiClient.deleteAccount(id);
  },

  async getCustomers(): Promise<CustomerRecord[]> {
    return apiClient.getCustomers();
  },

  async createCustomer(
    payload: Omit<CustomerRecord, "id" | "bookings">,
  ): Promise<CustomerRecord> {
    return apiClient.createCustomer(payload);
  },

  async updateCustomer(
    id: string,
    payload: Partial<CustomerRecord>,
  ): Promise<CustomerRecord> {
    return apiClient.updateCustomer(id, payload);
  },

  async deleteCustomer(id: string): Promise<void> {
    await apiClient.deleteCustomer(id);
  },
};

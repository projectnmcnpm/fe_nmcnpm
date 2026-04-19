export type RoomStatus =
  | "available"
  | "in_use"
  | "pending_cleaning"
  | "cleaning_in_progress"
  | "cleaned"
  | "maintenance";
export type BookingStatus =
  | "upcoming"
  | "checked_in"
  | "in_stay"
  | "checked_out"
  | "cancelled";
export type BookingPaymentStatus = "unpaid" | "deposited" | "paid";
export type BookingStayStatus = "check_in" | "in_stay" | "check_out" | "cancelled";
export type BookingRefundStatus = "none" | "eligible" | "ineligible" | "refunded";

export interface Room {
  id: string;
  name: string;
  type: string;
  capacity?: number;
  price: number;
  pricePerHour?: number;
  status: RoomStatus;
  image: string;
  gallery?: string[];
  amenities: string[];
  description?: string;
}

export interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  userId: string;
  customerName?: string;
  customerPhone?: string;
  customerIdNumber?: string;
  checkIn: string;
  checkOut: string;
  checkInTime?: string;
  checkOutTime?: string;
  bookingType?: "day" | "hour";
  total: number;
  status: BookingStatus;
  paymentStatus?: BookingPaymentStatus;
  stayStatus?: BookingStayStatus;
  refundStatus?: BookingRefundStatus;
  image: string;
  paymentMethod?: string;
  paymentAmount?: string;
  payAmountVnd?: number;
  transferContent?: string;
  paymentQrUrl?: string;
  paymentExpiresAt?: string;
  paymentExpiresInSeconds?: number;
  cancelReason?: string;
  note?: string;
  createdAt?: string;
}

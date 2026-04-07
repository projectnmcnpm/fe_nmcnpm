export type RoomStatus = 'available' | 'few_left' | 'full' | 'cleaning';
export type BookingStatus = 'upcoming' | 'completed' | 'cancelled' | 'active';

export interface Room {
  id: string;
  name: string;
  type: string;
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
  checkIn: string;
  checkOut: string;
  checkInTime?: string;
  checkOutTime?: string;
  bookingType?: 'day' | 'hour';
  total: number;
  status: BookingStatus;
  image: string;
  paymentMethod?: string;
  paymentAmount?: string;
  cancelReason?: string;
  createdAt?: string;
}

export let mockRooms: Room[] = [
  { id: 'RM-101', name: 'Netflix & Chill Suite', type: 'Double Room', price: 650000, pricePerHour: 150000, status: 'available', image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=2057&auto=format&fit=crop', gallery: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=2070&auto=format&fit=crop'], amenities: ['2 Người', 'Máy chiếu 4K', 'Wifi Tốc độ cao', 'Netflix Premium'], description: 'Không gian hoàn hảo cho các cặp đôi với máy chiếu 4K màn hình 120 inch, âm thanh vòm sống động và tài khoản Netflix Premium sẵn sàng.' },
  { id: 'RM-205', name: "Director's Cut", type: 'VIP Room', price: 950000, pricePerHour: 200000, status: 'few_left', image: 'https://images.unsplash.com/photo-1598928636135-d146006ff4be?q=80&w=2070&auto=format&fit=crop', gallery: [], amenities: ['2 Người', 'Máy chiếu 4K', 'Bồn tắm', 'Mini Bar'], description: 'Trải nghiệm đẳng cấp với bồn tắm view thành phố, máy chiếu 4K và mini bar miễn phí. Phù hợp cho những dịp kỷ niệm đặc biệt.' },
  { id: 'RM-102', name: 'Indie Vibe', type: 'Twin Room', price: 550000, pricePerHour: 120000, status: 'full', image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=2070&auto=format&fit=crop', gallery: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1974&auto=format&fit=crop'], amenities: ['2 Người', 'TV Smart HD', 'Ban công'], description: 'Phòng Twin với thiết kế tối giản, ấm cúng. Có ban công nhỏ nhìn ra phố, trang bị Smart TV với đầy đủ ứng dụng giải trí.' },
  { id: 'RM-301', name: 'Blockbuster Suite', type: 'VIP Room', price: 1200000, pricePerHour: 250000, status: 'available', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop', gallery: ['https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=2057&auto=format&fit=crop', 'https://images.unsplash.com/photo-1598928636135-d146006ff4be?q=80&w=2070&auto=format&fit=crop', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=2070&auto=format&fit=crop', 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?q=80&w=1974&auto=format&fit=crop'], amenities: ['4 Người', 'Máy chiếu 4K', 'Bồn tắm', 'Ghế Massage'], description: 'Phòng VIP lớn dành cho nhóm bạn hoặc gia đình nhỏ. Trang bị ghế massage cao cấp và hệ thống rạp hát tại gia chuyên nghiệp.' },
  { id: 'RM-302', name: 'Classic Cinema', type: 'Double Room', price: 700000, pricePerHour: 160000, status: 'available', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=2070&auto=format&fit=crop', gallery: [], amenities: ['2 Người', 'Máy chiếu 4K', 'Wifi Tốc độ cao'], description: 'Thiết kế mang phong cách rạp chiếu phim cổ điển với tone màu đỏ đen đặc trưng. Giường King size siêu êm ái.' },
  { id: 'RM-401', name: 'Sci-Fi Pod', type: 'Single Room', price: 450000, pricePerHour: 100000, status: 'few_left', image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1974&auto=format&fit=crop', gallery: [], amenities: ['1 Người', 'TV Smart HD', 'Wifi Tốc độ cao'], description: 'Phòng đơn với thiết kế tương lai, đèn LED RGB có thể tùy chỉnh màu sắc theo tâm trạng.' },
  { id: 'RM-402', name: 'Romantic Comedy', type: 'Double Room', price: 800000, pricePerHour: 180000, status: 'available', image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?q=80&w=1974&auto=format&fit=crop', gallery: [], amenities: ['2 Người', 'Máy chiếu 4K', 'Bồn tắm'], description: 'Không gian lãng mạn với tone màu pastel, bồn tắm hoa hồng và danh sách phim Rom-Com được tuyển chọn kỹ lưỡng.' },
  { id: 'RM-501', name: 'Horror Night', type: 'Twin Room', price: 600000, pricePerHour: 140000, status: 'full', image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2070&auto=format&fit=crop', gallery: [], amenities: ['2 Người', 'TV Smart HD', 'Wifi Tốc độ cao'], description: 'Dành cho những tín đồ phim kinh dị với hệ thống âm thanh dội âm đặc biệt và ánh sáng mờ ảo.' },
  { id: 'RM-502', name: 'Action Packed', type: 'VIP Room', price: 1100000, pricePerHour: 220000, status: 'available', image: 'https://images.unsplash.com/photo-1501127122-f385ca6ddd9d?q=80&w=1935&auto=format&fit=crop', gallery: [], amenities: ['4 Người', 'Máy chiếu 4K', 'Bồn tắm', 'PS5'], description: 'Phòng giải trí đỉnh cao trang bị sẵn máy chơi game PS5 với nhiều tựa game hành động bom tấn.' },
  { id: 'RM-601', name: 'Anime World', type: 'Single Room', price: 400000, pricePerHour: 90000, status: 'cleaning', image: 'https://images.unsplash.com/photo-1522771731470-ea43836b6fa0?q=80&w=2070&auto=format&fit=crop', gallery: [], amenities: ['1 Người', 'HD', 'Wifi'], description: 'Không gian đậm chất văn hóa Nhật Bản.' },
];

export let mockBookings: Booking[] = [
  { id: 'BO-1045', roomName: 'Netflix & Chill Suite', roomId: 'RM-101', userId: 'khachhang@genz.com', checkIn: '2023-10-20', checkOut: '2023-10-22', total: 1300000, status: 'completed', image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=2057&auto=format&fit=crop' },
  { id: 'BO-1089', roomName: "Director's Cut", roomId: 'RM-205', userId: 'khachhang@genz.com', checkIn: '2023-11-15', checkOut: '2023-11-16', total: 950000, status: 'upcoming', image: 'https://images.unsplash.com/photo-1598928636135-d146006ff4be?q=80&w=2070&auto=format&fit=crop' },
  { id: 'BO-0932', roomName: 'Indie Vibe', roomId: 'RM-102', userId: 'khachhang@genz.com', checkIn: '2023-09-05', checkOut: '2023-09-06', total: 550000, status: 'cancelled', image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=2070&auto=format&fit=crop' }
];

export const mockService = {
  getRooms: () => [...mockRooms],
  getRoomById: (id: string) => mockRooms.find(r => r.id === id),
  updateRoomStatus: (id: string, status: RoomStatus) => {
    mockRooms = mockRooms.map(r => r.id === id ? { ...r, status } : r);
  },
  getBookings: (userId?: string) => userId ? mockBookings.filter(b => b.userId === userId) : [...mockBookings],
  createBooking: (booking: Omit<Booking, 'id'>) => {
    const newBooking = { ...booking, id: `BO-${Math.floor(1000 + Math.random() * 9000)}` };
    mockBookings = [newBooking, ...mockBookings];
    return newBooking;
  },
  cancelBooking: (id: string, reason?: string) => {
    mockBookings = mockBookings.map(b => b.id === id ? { ...b, status: 'cancelled', cancelReason: reason } : b);
  },
  updateBookingStatus: (id: string, status: BookingStatus) => {
    mockBookings = mockBookings.map(b => b.id === id ? { ...b, status } : b);
  }
};

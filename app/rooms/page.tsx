'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, MonitorPlay, Wifi, Coffee, Filter, Search } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { mockService, Room } from '@/lib/mock-data';

export default function RoomsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [allRooms, setAllRooms] = useState<Room[]>([]);

  useEffect(() => {
    setAllRooms(mockService.getRooms());
  }, []);

  const filteredRooms = allRooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) || room.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || room.type === typeFilter;
    
    let matchesPrice = true;
    if (priceFilter === 'under500') matchesPrice = room.price < 500000;
    if (priceFilter === '500to1000') matchesPrice = room.price >= 500000 && room.price <= 1000000;
    if (priceFilter === 'over1000') matchesPrice = room.price > 1000000;

    return matchesSearch && matchesType && matchesPrice;
  });

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl text-text-primary mb-4">DANH SÁCH PHÒNG</h1>
          <p className="text-text-secondary">Tìm không gian điện ảnh hoàn hảo cho bạn</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-1/4">
            <div className="bg-bg-secondary border border-border-subtle rounded-xl p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6 text-text-primary font-bold text-lg border-b border-border-subtle pb-4">
                <Filter size={20} className="text-accent-primary" />
                BỘ LỌC TÌM KIẾM
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-text-muted font-bold mb-3 uppercase tracking-wider">Tìm kiếm</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-text-muted" size={18} />
                    <input 
                      type="text" 
                      placeholder="Tên phòng, mã phòng..." 
                      className="input-field bg-bg-primary pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-text-muted font-bold mb-3 uppercase tracking-wider">Loại phòng</label>
                  <select 
                    className="input-field bg-bg-primary"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="all">Tất cả loại phòng</option>
                    <option value="Single Room">Single Room</option>
                    <option value="Twin Room">Twin Room</option>
                    <option value="Double Room">Double Room</option>
                    <option value="VIP Room">VIP Room</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-text-muted font-bold mb-3 uppercase tracking-wider">Mức giá</label>
                  <select 
                    className="input-field bg-bg-primary"
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                  >
                    <option value="all">Tất cả mức giá</option>
                    <option value="under500">Dưới 500.000đ</option>
                    <option value="500to1000">500.000đ - 1.000.000đ</option>
                    <option value="over1000">Trên 1.000.000đ</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="w-full lg:w-3/4">
            <div className="mb-6 text-text-secondary">
              Hiển thị <strong className="text-text-primary">{filteredRooms.length}</strong> phòng phù hợp
            </div>

            {filteredRooms.length === 0 ? (
              <div className="bg-bg-secondary border border-border-subtle rounded-xl p-12 text-center">
                <h3 className="text-2xl text-text-primary mb-2">Không tìm thấy phòng</h3>
                <p className="text-text-secondary">Vui lòng thử thay đổi bộ lọc tìm kiếm của bạn.</p>
                <button 
                  onClick={() => { setSearchTerm(''); setTypeFilter('all'); setPriceFilter('all'); }}
                  className="mt-6 btn-outline"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredRooms.map((room) => (
                  <div key={room.id} className="card-cinema group">
                    <div className="relative h-56 overflow-hidden">
                      <img src={room.image} alt={room.name} className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${room.status === 'full' ? 'grayscale' : ''}`} />
                      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded border border-white/10 uppercase">{room.type}</div>
                      {room.status === 'available' && <div className="absolute top-4 right-4 bg-success text-black text-xs font-bold px-3 py-1 rounded uppercase">Còn phòng</div>}
                      {room.status === 'few_left' && <div className="absolute top-4 right-4 bg-warning text-black text-xs font-bold px-3 py-1 rounded uppercase">Chỉ còn 1</div>}
                      {room.status === 'full' && <div className="absolute top-4 right-4 bg-bg-secondary text-text-muted text-xs font-bold px-3 py-1 rounded border border-border-subtle uppercase">Hết phòng</div>}
                    </div>
                    <div className={`p-6 ${room.status === 'full' ? 'opacity-60' : ''}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="text-xs font-mono text-text-muted mb-1">{room.id}</div>
                          <h3 className="text-2xl text-text-primary">{room.name}</h3>
                        </div>
                        <div className="text-right">
                          <div className="text-accent-gold font-display text-xl">{room.price.toLocaleString('vi-VN')}đ</div>
                          <div className="text-xs text-text-muted">/ đêm</div>
                        </div>
                      </div>
                      <div className="flex gap-4 mb-6 text-text-secondary">
                        {room.amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center gap-1 text-sm">
                            {amenity.includes('Người') && <Users size={14}/>}
                            {(amenity.includes('4K') || amenity.includes('HD')) && <MonitorPlay size={14}/>}
                            {amenity.includes('Wifi') && <Wifi size={14}/>}
                            {amenity.includes('Bồn tắm') && <Coffee size={14}/>}
                            {amenity}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-3">
                        {room.status === 'full' ? (
                          <Link href={`/rooms/${room.id}`} className="btn-outline flex-1 py-2 text-sm text-center">Chi tiết</Link>
                        ) : (
                          <Link href={`/rooms/${room.id}?book=true`} className="btn-primary flex-1 py-2 text-sm text-center">Đặt ngay</Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

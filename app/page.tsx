"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Users, MonitorPlay, Wifi, Coffee } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { dataService } from "@/lib/data-service";
import type { Room } from "@/lib/mock-data";

export default function HomePage() {
  const [featuredRooms, setFeaturedRooms] = useState<Room[]>([]);

  useEffect(() => {
    const loadRooms = async () => {
      const rooms = await dataService.getRooms();
      setFeaturedRooms(rooms.slice(0, 9));
    };

    void loadRooms();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1522771731470-ea43836b6fa0?q=80&w=2070&auto=format&fit=crop")',
          }}
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-bg-primary via-bg-primary/60 to-transparent" />

        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto mt-16">
          <h1 className="text-6xl md:text-8xl lg:text-9xl text-text-primary mb-6 drop-shadow-2xl">
            PHONG CÁCH SỐNG
            <br />
            <span className="text-accent-primary">THẾ HỆ MỚI</span>
          </h1>
          <p className="text-xl md:text-2xl text-text-secondary mb-12 font-light">
            Homestay GenZ Cinema – Kim Mã | Mỹ Đình | Long Biên
          </p>

          {/* Search Box */}
          <div className="bg-bg-card/80 backdrop-blur-md border border-border-subtle p-4 md:p-6 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-1/4 text-left">
              <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                Cơ sở
              </label>
              <select className="input-field bg-bg-secondary">
                <option>Tất cả cơ sở</option>
                <option>Kim Mã, Ba Đình</option>
                <option>Mỹ Đình, Nam Từ Liêm</option>
                <option>Ngọc Lâm, Long Biên</option>
              </select>
            </div>
            <div className="w-full md:w-1/4 text-left">
              <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                Nhận phòng
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-3 text-text-muted"
                  size={18}
                />
                <input
                  type="date"
                  className="input-field bg-bg-secondary pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-1/4 text-left">
              <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                Trả phòng
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-3 text-text-muted"
                  size={18}
                />
                <input
                  type="date"
                  className="input-field bg-bg-secondary pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-1/4">
              <Link
                href="/rooms"
                className="btn-primary w-full h-[50px] text-lg flex items-center justify-center"
              >
                TÌM PHÒNG
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="py-24 px-4 max-w-7xl mx-auto w-full">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl text-text-primary mb-2">
              PHÒNG NỔI BẬT
            </h2>
            <p className="text-text-secondary">
              Trải nghiệm không gian điện ảnh riêng tư
            </p>
          </div>
          <Link
            href="/rooms"
            className="hidden md:block text-accent-neon hover:text-text-primary transition-colors font-medium"
          >
            Xem tất cả phòng &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredRooms.map((room) => (
            <div key={room.id} className="card-cinema group">
              <div className="relative h-64 overflow-hidden">
                <img
                  src={room.image}
                  alt={room.name}
                  className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${room.status === "full" ? "grayscale" : ""}`}
                />
                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded border border-white/10 uppercase">
                  {room.type}
                </div>
                {room.status === "available" && (
                  <div className="absolute top-4 right-4 bg-success text-black text-xs font-bold px-3 py-1 rounded uppercase">
                    Còn phòng
                  </div>
                )}
                {room.status === "few_left" && (
                  <div className="absolute top-4 right-4 bg-warning text-black text-xs font-bold px-3 py-1 rounded uppercase">
                    Chỉ còn 1
                  </div>
                )}
                {room.status === "full" && (
                  <div className="absolute top-4 right-4 bg-bg-secondary text-text-muted text-xs font-bold px-3 py-1 rounded border border-border-subtle uppercase">
                    Hết phòng
                  </div>
                )}
              </div>
              <div
                className={`p-6 ${room.status === "full" ? "opacity-60" : ""}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-xs font-mono text-text-muted mb-1">
                      {room.id}
                    </div>
                    <h3 className="text-2xl text-text-primary">{room.name}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-accent-gold font-display text-2xl">
                      {room.price.toLocaleString("vi-VN")}đ
                    </div>
                    <div className="text-xs text-text-muted">/ đêm</div>
                  </div>
                </div>
                <div className="flex gap-4 mb-6 text-text-secondary">
                  {room.amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 text-sm"
                    >
                      {amenity.includes("Người") && <Users size={16} />}
                      {(amenity.includes("4K") || amenity.includes("HD")) && (
                        <MonitorPlay size={16} />
                      )}
                      {amenity.includes("Wifi") && <Wifi size={16} />}
                      {amenity.includes("Bồn tắm") && <Coffee size={16} />}
                      {amenity}
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  {room.status === "full" ? (
                    <Link
                      href={`/rooms/${room.id}`}
                      className="btn-outline flex-1 py-2 text-sm text-center"
                    >
                      Chi tiết
                    </Link>
                  ) : (
                    <Link
                      href={`/rooms/${room.id}?book=true`}
                      className="btn-primary flex-1 py-2 text-sm text-center"
                    >
                      Đặt ngay
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center md:hidden">
          <Link href="/rooms" className="btn-outline inline-block px-8 py-3">
            Xem tất cả phòng
          </Link>
        </div>
      </section>
    </div>
  );
}

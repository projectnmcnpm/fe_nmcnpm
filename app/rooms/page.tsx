"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  MonitorPlay,
  Wifi,
  Coffee,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { dataService } from "@/lib/data-service";
import type { Room } from "@/lib/mock-data";

export default function RoomsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [allRooms, setAllRooms] = useState<Room[]>([]);

  useEffect(() => {
    const loadRooms = async () => {
      const rooms = await dataService.getRooms();
      setAllRooms(rooms);
    };

    void loadRooms();
  }, []);

  const filteredRooms = useMemo(() => {
    return allRooms.filter((room) => {
      const matchesSearch =
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "all" || room.type === typeFilter;

      let matchesPrice = true;
      if (priceFilter === "under500") matchesPrice = room.price < 500000;
      if (priceFilter === "500to1000")
        matchesPrice = room.price >= 500000 && room.price <= 1000000;
      if (priceFilter === "over1000") matchesPrice = room.price > 1000000;

      return matchesSearch && matchesType && matchesPrice;
    });
  }, [allRooms, searchTerm, typeFilter, priceFilter]);

  const hasActiveFilters =
    typeFilter !== "all" ||
    priceFilter !== "all" ||
    searchTerm.trim().length > 0;

  const resetFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setPriceFilter("all");
  };

  const FilterControls = ({ mobile = false }: { mobile?: boolean }) => (
    <div
      className={`bg-bg-secondary border border-border-subtle rounded-2xl ${mobile ? "p-4" : "p-6 sticky top-24"}`}
    >
      <div className="flex items-center justify-between gap-3 mb-5 border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2 text-text-primary font-bold text-lg">
          <SlidersHorizontal size={18} className="text-accent-primary" />
          BỘ LỌC
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-xs font-bold uppercase tracking-wider text-accent-primary hover:underline"
          >
            Xóa lọc
          </button>
        )}
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
            Loại phòng
          </label>
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
          <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
            Mức giá
          </label>
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

      {mobile && (
        <button
          onClick={() => setIsFilterOpen(false)}
          className="btn-primary w-full mt-6"
        >
          ÁP DỤNG BỘ LỌC
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl text-text-primary mb-3">
            DANH SÁCH PHÒNG
          </h1>
          <p className="text-text-secondary">
            Tìm không gian điện ảnh hoàn hảo cho bạn
          </p>
        </div>

        <div className="lg:hidden mb-4 space-y-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc mã phòng..."
              className="input-field bg-bg-secondary pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsFilterOpen(true)}
            className="w-full min-h-12 rounded-xl border border-border-subtle bg-bg-secondary text-text-primary font-bold flex items-center justify-center gap-2"
          >
            <SlidersHorizontal size={18} className="text-accent-primary" />
            TÙY CHỈNH BỘ LỌC
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="hidden lg:block w-full lg:w-1/4">
            <div className="mb-4">
              <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                Tìm kiếm
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Tên phòng, mã phòng..."
                  className="input-field bg-bg-secondary pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <FilterControls />
          </div>

          {/* Rooms Grid */}
          <div className="w-full lg:w-3/4">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="text-text-secondary">
                Hiển thị{" "}
                <strong className="text-text-primary">
                  {filteredRooms.length}
                </strong>{" "}
                phòng phù hợp
              </div>
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2">
                  {typeFilter !== "all" && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
                      {typeFilter}
                    </span>
                  )}
                  {priceFilter !== "all" && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-warning/10 text-warning border border-warning/20">
                      {priceFilter}
                    </span>
                  )}
                  <button
                    onClick={resetFilters}
                    className="text-xs font-bold text-accent-primary hover:underline"
                  >
                    Xóa tất cả
                  </button>
                </div>
              )}
            </div>

            {filteredRooms.length === 0 ? (
              <div className="bg-bg-secondary border border-border-subtle rounded-xl p-12 text-center">
                <h3 className="text-2xl text-text-primary mb-2">
                  Không tìm thấy phòng
                </h3>
                <p className="text-text-secondary">
                  Vui lòng thử thay đổi bộ lọc tìm kiếm của bạn.
                </p>
                <button onClick={resetFilters} className="mt-6 btn-outline">
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredRooms.map((room) => (
                  <article key={room.id} className="card-cinema group">
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={room.image}
                        alt={room.name}
                        className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${room.status === "full" ? "grayscale" : ""}`}
                      />
                      <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded border border-white/10 uppercase">
                        {room.type}
                      </div>
                      {room.status === "available" && (
                        <div className="absolute top-3 right-3 bg-success text-black text-[11px] font-bold px-2.5 py-1 rounded uppercase">
                          Còn phòng
                        </div>
                      )}
                      {room.status === "few_left" && (
                        <div className="absolute top-3 right-3 bg-warning text-black text-[11px] font-bold px-2.5 py-1 rounded uppercase">
                          Sắp hết
                        </div>
                      )}
                      {room.status === "full" && (
                        <div className="absolute top-3 right-3 bg-bg-secondary text-text-muted text-[11px] font-bold px-2.5 py-1 rounded border border-border-subtle uppercase">
                          Hết phòng
                        </div>
                      )}
                    </div>
                    <div
                      className={`p-5 ${room.status === "full" ? "opacity-70" : ""}`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="text-xs font-mono text-text-muted mb-1">
                            {room.id}
                          </div>
                          <h3 className="text-xl text-text-primary leading-tight">
                            {room.name}
                          </h3>
                        </div>
                        <div className="text-right">
                          <div className="text-accent-gold font-display text-2xl leading-none">
                            {room.price.toLocaleString("vi-VN")}đ
                          </div>
                          <div className="text-xs text-text-muted">/ đêm</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-6 text-text-secondary">
                        {room.amenities.slice(0, 3).map((amenity, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-border-subtle bg-bg-primary"
                          >
                            {amenity.includes("Người") && <Users size={13} />}
                            {(amenity.includes("4K") ||
                              amenity.includes("HD")) && (
                              <MonitorPlay size={13} />
                            )}
                            {amenity.includes("Wifi") && <Wifi size={13} />}
                            {amenity.includes("Bồn tắm") && (
                              <Coffee size={13} />
                            )}
                            {amenity}
                          </span>
                        ))}
                        {room.amenities.length > 3 && (
                          <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-full border border-border-subtle bg-bg-primary text-text-muted">
                            +{room.amenities.length - 3} tiện ích
                          </span>
                        )}
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
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm">
          <button
            aria-label="Đóng bộ lọc"
            onClick={() => setIsFilterOpen(false)}
            className="absolute inset-0"
          />
          <div className="absolute left-0 right-0 bottom-0 rounded-t-3xl bg-bg-primary border-t border-border-subtle max-h-[85vh] overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl text-text-primary font-bold">
                Bộ lọc tìm phòng
              </h3>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="w-10 h-10 rounded-xl bg-bg-secondary border border-border-subtle flex items-center justify-center text-text-muted"
              >
                <X size={18} />
              </button>
            </div>
            <FilterControls mobile />
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Search, Filter, Plus, Edit2, Trash2 } from 'lucide-react';
import { mockService, Room } from '@/lib/mock-data';

export default function AdminRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    setRooms(mockService.getRooms());
  }, []);

  const handleDelete = (id: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa phòng ${id}?`)) {
      setRooms(rooms.filter(room => room.id !== id));
    }
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const matchesSearch = room.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            room.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesType = true;
      if (typeFilter !== 'all') {
        if (typeFilter === 'SGL' && room.type !== 'Single Room') matchesType = false;
        if (typeFilter === 'TWN' && room.type !== 'Twin Room') matchesType = false;
        if (typeFilter === 'DBL' && room.type !== 'Double Room') matchesType = false;
        if (typeFilter === 'TRPL' && room.type !== 'VIP Room') matchesType = false;
      }

      let matchesStatus = true;
      if (statusFilter !== 'all') {
        if (statusFilter === '0' && room.status !== 'available') matchesStatus = false;
        if (statusFilter === '1' && (room.status !== 'full' && room.status !== 'few_left')) matchesStatus = false;
        if (statusFilter === '-1' && room.status !== 'cleaning') matchesStatus = false;
      }
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [rooms, searchTerm, typeFilter, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available': return <span className="px-2 py-1 bg-success/20 text-success rounded text-xs font-bold uppercase">Trống</span>;
      case 'full': 
      case 'few_left': return <span className="px-2 py-1 bg-warning/20 text-warning rounded text-xs font-bold uppercase">Đã đặt</span>;
      case 'cleaning': return <span className="px-2 py-1 bg-danger/20 text-danger rounded text-xs font-bold uppercase">Đang dọn</span>;
      default: return null;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      'Single Room': 'bg-blue-500/20 text-blue-400',
      'Twin Room': 'bg-purple-500/20 text-purple-400',
      'Double Room': 'bg-accent-gold/20 text-accent-gold',
      'VIP Room': 'bg-accent-primary/20 text-accent-primary',
    };
    return <span className={`px-2 py-1 rounded text-xs font-bold ${colors[type] || 'bg-gray-500/20 text-gray-400'}`}>{type}</span>;
  };

  return (
    <DashboardLayout allowedRoles={['manager']}>
      <div className="h-full flex flex-col min-h-0">
        <div className="shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl text-text-primary mb-1">QUẢN LÝ PHÒNG</h1>
            <p className="text-text-secondary">Thêm, sửa, xóa và theo dõi trạng thái phòng</p>
          </div>
          <Link href="/admin/rooms/add" className="btn-primary flex items-center gap-2 py-2">
            <Plus size={18} /> THÊM PHÒNG
          </Link>
        </div>

        {/* Toolbar */}
        <div className="shrink-0 bg-bg-secondary p-4 rounded-xl border border-border-subtle mb-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 flex-1">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input 
                type="text" 
                placeholder="Tìm mã phòng, tên..." 
                className="input-field pl-10 py-2 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <select 
                className="input-field pl-10 py-2 text-sm appearance-none pr-8"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">Tất cả loại phòng</option>
                <option value="SGL">Single (SGL)</option>
                <option value="TWN">Twin (TWN)</option>
                <option value="DBL">Double (DBL)</option>
                <option value="TRPL">Triple (TRPL)</option>
              </select>
            </div>
            <select 
              className="input-field py-2 text-sm w-auto"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="0">Trống</option>
              <option value="1">Đã đặt</option>
              <option value="-1">Đang dọn</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 card-cinema flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-bg-card z-10">
                <tr className="border-b border-border-subtle text-text-muted text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Ảnh</th>
                  <th className="p-4 font-medium">Mã phòng</th>
                  <th className="p-4 font-medium">Loại</th>
                  <th className="p-4 font-medium">Giá / Đêm</th>
                  <th className="p-4 font-medium">Trạng thái</th>
                  <th className="p-4 font-medium text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredRooms.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-text-muted">Không tìm thấy phòng nào phù hợp.</td>
                  </tr>
                ) : (
                  filteredRooms.map((room) => (
                    <tr key={room.id} className="border-b border-border-subtle/50 hover:bg-bg-secondary/50 transition-colors group">
                      <td className="p-4">
                        <img src={room.image} alt={room.name} className="w-12 h-12 rounded object-cover border border-border-subtle" />
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-text-secondary bg-bg-primary px-2 py-1 rounded border border-border-subtle group-hover:border-accent-neon transition-colors">{room.id}</span>
                      </td>
                      <td className="p-4">{getTypeBadge(room.type)}</td>
                      <td className="p-4 text-accent-gold font-mono">{room.price.toLocaleString('vi-VN')}đ</td>
                      <td className="p-4">{getStatusBadge(room.status)}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/rooms/edit/${room.id}`} className="p-2 text-text-muted hover:text-accent-neon hover:bg-accent-neon/10 rounded transition-colors" title="Sửa">
                            <Edit2 size={16} />
                          </Link>
                          <button onClick={() => handleDelete(room.id)} className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-colors" title="Xóa">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="shrink-0 p-4 border-t border-border-subtle flex justify-between items-center text-sm text-text-muted bg-bg-secondary/30">
            <span>Hiển thị {filteredRooms.length} phòng</span>
            <div className="flex gap-1">
              <button className="px-3 py-1 border border-border-subtle rounded hover:bg-bg-secondary disabled:opacity-50" disabled>Trước</button>
              <button className="px-3 py-1 border border-border-subtle rounded bg-accent-primary text-white border-accent-primary">1</button>
              <button className="px-3 py-1 border border-border-subtle rounded hover:bg-bg-secondary disabled:opacity-50" disabled>Sau</button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

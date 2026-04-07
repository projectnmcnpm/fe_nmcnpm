'use client';

import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Search, Filter, CheckCircle, AlertTriangle, Brush } from 'lucide-react';

const INITIAL_ROOMS = [
  { id: 'RM-101', type: 'SGL', name: 'Single Standard', capacity: 1, price: 450000, status: 0, image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=100&h=100&fit=crop' },
  { id: 'RM-102', type: 'TWN', name: 'Twin Indie Vibe', capacity: 2, price: 550000, status: 1, image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=100&h=100&fit=crop' },
  { id: 'RM-205', type: 'DBL', name: 'Director Cut VIP', capacity: 2, price: 950000, status: 0, image: 'https://images.unsplash.com/photo-1598928636135-d146006ff4be?w=100&h=100&fit=crop' },
  { id: 'RM-301', type: 'TRPL', name: 'Family Blockbuster', capacity: 4, price: 1200000, status: -1, image: 'https://images.unsplash.com/photo-1522771731470-ea43836b6fa0?w=100&h=100&fit=crop' },
];

export default function StaffRooms() {
  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const matchesSearch = room.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            room.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || room.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || room.status.toString() === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [rooms, searchTerm, typeFilter, statusFilter]);

  const handleStatusChange = (id: string, newStatus: number) => {
    setRooms(rooms.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0: return <span className="px-2 py-1 bg-success/20 text-success rounded text-xs font-bold uppercase flex items-center gap-1"><CheckCircle size={12}/> Trống</span>;
      case 1: return <span className="px-2 py-1 bg-warning/20 text-warning rounded text-xs font-bold uppercase flex items-center gap-1"><AlertTriangle size={12}/> Đang ở</span>;
      case -1: return <span className="px-2 py-1 bg-danger/20 text-danger rounded text-xs font-bold uppercase flex items-center gap-1"><Brush size={12}/> Đang dọn</span>;
      default: return null;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      'SGL': 'bg-blue-500/20 text-blue-400',
      'TWN': 'bg-purple-500/20 text-purple-400',
      'DBL': 'bg-accent-gold/20 text-accent-gold',
      'TRPL': 'bg-accent-primary/20 text-accent-primary',
    };
    return <span className={`px-2 py-1 rounded text-xs font-bold ${colors[type] || 'bg-gray-500/20 text-gray-400'}`}>{type}</span>;
  };

  return (
    <DashboardLayout allowedRoles={['receptionist', 'manager']}>
      <div className="h-full flex flex-col min-h-0">
        <div className="shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl text-text-primary mb-1">TRẠNG THÁI PHÒNG</h1>
            <p className="text-text-secondary">Theo dõi và cập nhật trạng thái các phòng hiện tại</p>
          </div>
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
              <option value="1">Đang ở</option>
              <option value="-1">Đang dọn</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
            {filteredRooms.length === 0 ? (
              <div className="col-span-full p-8 text-center text-text-muted card-cinema">Không tìm thấy phòng nào phù hợp.</div>
            ) : (
              filteredRooms.map((room) => (
                <div key={room.id} className="card-cinema p-4 flex flex-col gap-4">
                  <div className="flex gap-4">
                    <img src={room.image} alt={room.name} className="w-20 h-20 rounded-lg object-cover border border-border-subtle" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-mono text-accent-neon font-bold">{room.id}</span>
                        {getTypeBadge(room.type)}
                      </div>
                      <h3 className="text-text-primary font-bold text-sm line-clamp-1">{room.name}</h3>
                      <p className="text-text-muted text-xs mt-1">{room.capacity} người</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                    <div>{getStatusBadge(room.status)}</div>
                    <select 
                      className="bg-bg-primary border border-border-subtle text-text-primary text-xs rounded px-2 py-1 outline-none focus:border-accent-neon"
                      value={room.status}
                      onChange={(e) => handleStatusChange(room.id, parseInt(e.target.value))}
                    >
                      <option value="0">Đổi thành: Trống</option>
                      <option value="1">Đổi thành: Đang ở</option>
                      <option value="-1">Đổi thành: Đang dọn</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

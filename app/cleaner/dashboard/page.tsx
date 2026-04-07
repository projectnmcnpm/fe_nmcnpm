'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Brush, CheckCircle, LogOut, User, Bell, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { mockService, Room } from '@/lib/mock-data';

export default function CleanerDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    setRooms(mockService.getRooms().filter(r => r.status === 'cleaning'));
  }, []);

  const markAsClean = (id: string) => {
    mockService.updateRoomStatus(id, 'available');
    setRooms(mockService.getRooms().filter(r => r.status === 'cleaning'));
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-text-primary">Đang tải...</div>;
  }

  if (user.role !== 'cleaner' && user.role !== 'manager') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary text-text-primary">
        <div className="text-center">
          <h1 className="text-4xl mb-4 text-accent-primary">Truy cập bị từ chối</h1>
          <p className="text-text-secondary mb-6">Bạn không có quyền truy cập trang này.</p>
          <button onClick={() => router.push('/')} className="btn-primary">Về trang chủ</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black sm:bg-bg-primary flex items-center justify-center p-0 sm:p-4">
      {/* Mobile App Container */}
      <div className="w-full h-screen sm:h-[800px] sm:max-w-[390px] bg-black sm:rounded-[3rem] sm:border-[12px] border-gray-900 overflow-hidden flex flex-col relative shadow-2xl">
        
        {/* iOS Notch Simulation (Desktop only) */}
        <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-50"></div>

        {/* App Header */}
        <div className="bg-bg-secondary px-6 pt-12 sm:pt-10 pb-6 rounded-b-3xl shadow-lg z-10">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent-primary/20 flex items-center justify-center text-accent-primary border border-accent-primary/30">
                <User size={24} />
              </div>
              <div>
                <p className="text-text-muted text-xs uppercase tracking-wider font-bold">Xin chào,</p>
                <h2 className="text-text-primary font-bold text-lg">{user.name}</h2>
              </div>
            </div>
            <button onClick={handleLogout} className="w-10 h-10 rounded-full bg-bg-primary flex items-center justify-center text-text-muted hover:text-danger transition-colors">
              <LogOut size={20} />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display text-text-primary">Dọn dẹp</h1>
              <p className="text-text-secondary text-sm mt-1">Hôm nay có <span className="text-accent-neon font-bold">{rooms.length}</span> phòng cần dọn</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-danger/10 flex items-center justify-center text-danger">
              <Brush size={24} />
            </div>
          </div>
        </div>

        {/* Main Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 pb-28">
          {rooms.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-24 h-24 bg-success/10 text-success rounded-full flex items-center justify-center mb-2">
                <CheckCircle size={48} />
              </div>
              <h2 className="text-2xl text-text-primary font-bold">Hoàn thành!</h2>
              <p className="text-text-secondary text-sm px-4">Bạn đã dọn dẹp xong tất cả các phòng. Hãy nghỉ ngơi nhé!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rooms.map((room) => (
                <div key={room.id} className="bg-bg-secondary rounded-2xl p-5 border border-border-subtle relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-danger"></div>
                  
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <h3 className="text-3xl font-display text-text-primary mb-1">{room.id}</h3>
                      <span className="px-2 py-1 bg-bg-primary text-text-secondary text-xs rounded font-medium">
                        {room.type} Room
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-text-muted text-sm bg-bg-primary px-2 py-1.5 rounded-lg">
                      <Clock size={14} />
                      <span className="font-mono">10:30 AM</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => markAsClean(room.id)}
                    className="w-full bg-bg-primary border border-border-subtle hover:bg-success/10 hover:border-success hover:text-success text-text-primary font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <CheckCircle size={20} />
                    ĐÃ DỌN XONG
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="absolute bottom-0 left-0 w-full bg-bg-secondary/90 backdrop-blur-md border-t border-border-subtle px-6 py-4 flex justify-around items-center z-20 pb-6 sm:pb-4">
          <button className="flex flex-col items-center gap-1.5 text-accent-primary">
            <Brush size={24} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Phòng</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 text-text-muted hover:text-text-primary transition-colors">
            <Bell size={24} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Thông báo</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 text-text-muted hover:text-text-primary transition-colors">
            <User size={24} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Cá nhân</span>
          </button>
        </div>
      </div>
    </div>
  );
}

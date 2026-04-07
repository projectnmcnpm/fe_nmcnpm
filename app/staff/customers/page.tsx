'use client';

import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Search, Plus, Edit2, X } from 'lucide-react';

const INITIAL_CUSTOMERS = [
  { id: 'KH-001', name: 'Nguyễn Văn A', phone: '0901234567', email: 'nguyenvana@email.com', cccd: '012345678912', bookings: 3, lastVisit: '20/10/2023' },
  { id: 'KH-002', name: 'Trần Thị B', phone: '0912345678', email: 'tranthib@email.com', cccd: '098765432109', bookings: 1, lastVisit: '19/10/2023' },
  { id: 'KH-003', name: 'Lê Hoàng C', phone: '0923456789', email: 'lehoangc@email.com', cccd: '011223344556', bookings: 5, lastVisit: '18/10/2023' },
];

export default function StaffCustomers() {
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentCustomer, setCurrentCustomer] = useState<any>(null);

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      return customer.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
             customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             customer.phone.includes(searchTerm) ||
             customer.cccd.includes(searchTerm);
    });
  }, [customers, searchTerm]);

  const openAddModal = () => {
    setModalMode('add');
    setCurrentCustomer({ name: '', phone: '', email: '', cccd: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (customer: any) => {
    setModalMode('edit');
    setCurrentCustomer({ ...customer });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'add') {
      const newId = `KH-00${customers.length + 1}`;
      setCustomers([{ ...currentCustomer, id: newId, bookings: 0, lastVisit: '-' }, ...customers]);
    } else {
      setCustomers(customers.map(c => c.id === currentCustomer.id ? currentCustomer : c));
    }
    setIsModalOpen(false);
  };

  return (
    <DashboardLayout allowedRoles={['receptionist', 'manager']}>
      <div className="h-full flex flex-col min-h-0">
        <div className="shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl text-text-primary mb-1">QUẢN LÝ KHÁCH HÀNG</h1>
            <p className="text-text-secondary">Lưu trữ và tra cứu thông tin khách hàng</p>
          </div>
          <button onClick={openAddModal} className="btn-primary flex items-center gap-2 py-2">
            <Plus size={18} /> THÊM KHÁCH HÀNG
          </button>
        </div>

        {/* Toolbar */}
        <div className="shrink-0 bg-bg-secondary p-4 rounded-xl border border-border-subtle mb-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Tìm tên, SĐT, CCCD, Mã KH..." 
              className="input-field pl-10 py-2 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 min-h-0 card-cinema flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="sticky top-0 bg-bg-card z-10">
                <tr className="border-b border-border-subtle text-text-muted text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Mã KH</th>
                  <th className="p-4 font-medium">Khách hàng</th>
                  <th className="p-4 font-medium">Liên hệ</th>
                  <th className="p-4 font-medium">CCCD/Passport</th>
                  <th className="p-4 font-medium text-center">Số lần đặt</th>
                  <th className="p-4 font-medium">Lần cuối</th>
                  <th className="p-4 font-medium text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-text-muted">Không tìm thấy khách hàng nào phù hợp.</td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b border-border-subtle/50 hover:bg-bg-secondary/50 transition-colors group">
                      <td className="p-4">
                        <span className="font-mono text-accent-neon bg-accent-neon/10 px-2 py-1 rounded">{customer.id}</span>
                      </td>
                      <td className="p-4 font-bold text-text-primary">{customer.name}</td>
                      <td className="p-4">
                        <div className="text-text-primary">{customer.phone}</div>
                        <div className="text-xs text-text-muted">{customer.email}</div>
                      </td>
                      <td className="p-4 font-mono text-text-secondary">{customer.cccd}</td>
                      <td className="p-4 text-center font-mono text-accent-gold">{customer.bookings}</td>
                      <td className="p-4 text-text-secondary">{customer.lastVisit}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEditModal(customer)} className="p-2 text-text-muted hover:text-accent-neon hover:bg-accent-neon/10 rounded transition-colors" title="Sửa">
                            <Edit2 size={16} />
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
            <span>Hiển thị {filteredCustomers.length} khách hàng</span>
          </div>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-bg-secondary border border-border-subtle rounded-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-border-subtle">
              <h2 className="text-xl text-text-primary font-bold">
                {modalMode === 'add' ? 'THÊM KHÁCH HÀNG MỚI' : 'CẬP NHẬT KHÁCH HÀNG'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text-primary transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="customerForm" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">Họ và tên *</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    required 
                    value={currentCustomer?.name || ''}
                    onChange={(e) => setCurrentCustomer({...currentCustomer, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">Số điện thoại *</label>
                  <input 
                    type="tel" 
                    className="input-field" 
                    required 
                    value={currentCustomer?.phone || ''}
                    onChange={(e) => setCurrentCustomer({...currentCustomer, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">CCCD / Passport *</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    required 
                    value={currentCustomer?.cccd || ''}
                    onChange={(e) => setCurrentCustomer({...currentCustomer, cccd: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">Email</label>
                  <input 
                    type="email" 
                    className="input-field" 
                    value={currentCustomer?.email || ''}
                    onChange={(e) => setCurrentCustomer({...currentCustomer, email: e.target.value})}
                  />
                </div>
              </form>
            </div>
            <div className="p-4 border-t border-border-subtle flex justify-end gap-3 bg-bg-primary">
              <button onClick={() => setIsModalOpen(false)} className="btn-outline py-2">Hủy</button>
              <button type="submit" form="customerForm" className="btn-primary py-2">
                {modalMode === 'add' ? 'Thêm mới' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Search, Plus, Eye, Edit2, Trash2, X } from "lucide-react";
import { useToast } from "@/components/layout/ToastProvider";
import { dataService } from "@/lib/data-service";

const INITIAL_CUSTOMERS: any[] = [];

export default function AdminCustomers() {
  const ITEMS_PER_PAGE = 10;
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [searchTerm, setSearchTerm] = useState("");
  const { confirm, success } = useToast();
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    cccd: "",
    email: "",
  });

  React.useEffect(() => {
    const loadCustomers = async () => {
      try {
        const result = await dataService.getCustomers();
        setCustomers(
          result.map((customer) => ({
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            cccd: customer.cccd,
            email: customer.email,
            bookings: customer.bookings,
            created: customer.created || "-",
            color: customer.color || "bg-accent-neon",
          })),
        );
      } catch {
        setCustomers([]);
      }
    };

    void loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm) ||
        c.cccd.includes(searchTerm) ||
        (c.email || "").toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [customers, searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE),
  );

  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCustomers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredCustomers, currentPage]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleDelete = async (id: string) => {
    const customer = customers.find((item) => item.id === id);
    const displayName = customer
      ? `${customer.name}${customer.email ? ` (${customer.email})` : ""}`
      : id;
    const shouldDelete = await confirm(
      `Bạn có chắc chắn muốn xóa khách hàng ${displayName}?`,
      { confirmLabel: "Xóa", cancelLabel: "Hủy" },
    );
    if (shouldDelete) {
      await dataService.deleteCustomer(id);
      setCustomers(customers.filter((c) => c.id !== id));
      success(`Đã xóa khách hàng ${displayName}.`);
    }
  };

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({ name: "", phone: "", cccd: "", email: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (customer: any) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      cccd: customer.cccd,
      email: customer.email,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      const updated = await dataService.updateCustomer(editingCustomer.id, {
        name: formData.name,
        phone: formData.phone,
        cccd: formData.cccd,
        email: formData.email,
      });
      setCustomers(
        customers.map((c) =>
          c.id === editingCustomer.id
            ? {
                ...c,
                id: updated.id,
                name: updated.name,
                phone: updated.phone,
                cccd: updated.cccd,
                email: updated.email,
                bookings: updated.bookings,
                created: updated.created || c.created,
                color: updated.color || c.color,
              }
            : c,
        ),
      );
      success("Cập nhật khách hàng thành công!");
    } else {
      const created = await dataService.createCustomer({
        name: formData.name,
        phone: formData.phone,
        cccd: formData.cccd,
        email: formData.email,
        created: new Date().toLocaleDateString("vi-VN"),
        color: "bg-accent-neon",
      });
      const newCustomer = {
        id: created.id,
        name: created.name,
        phone: created.phone,
        cccd: created.cccd,
        email: created.email,
        bookings: created.bookings,
        created: created.created || new Date().toLocaleDateString("vi-VN"),
        color: created.color || "bg-accent-neon",
      };
      setCustomers([newCustomer, ...customers]);
      success("Thêm khách hàng thành công!");
    }
    setIsModalOpen(false);
  };

  return (
    <DashboardLayout allowedRoles={["manager"]}>
      <div className="h-full flex flex-col min-h-0">
        <div className="shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl text-text-primary mb-1">
              QUẢN LÝ KHÁCH HÀNG
            </h1>
            <p className="text-text-secondary">
              Thông tin và lịch sử lưu trú của khách hàng
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="btn-primary flex items-center gap-2 py-2"
          >
            <Plus size={18} /> THÊM KHÁCH HÀNG
          </button>
        </div>

        {/* Search Bar */}
        <div className="shrink-0 bg-bg-secondary p-4 rounded-xl border border-border-subtle mb-4">
          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm theo tên, SĐT, CCCD, email..."
              className="input-field pl-10 py-2"
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
                <tr className="bg-bg-secondary border-b border-border-subtle text-text-muted text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium w-16">Khách</th>
                  <th className="p-4 font-medium">Email KH</th>
                  <th className="p-4 font-medium">Họ tên</th>
                  <th className="p-4 font-medium">Liên hệ</th>
                  <th className="p-4 font-medium">CCCD</th>
                  <th className="p-4 font-medium text-center">Số lần đặt</th>
                  <th className="p-4 font-medium">Ngày tham gia</th>
                  <th className="p-4 font-medium text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-text-muted">
                      Không tìm thấy khách hàng nào.
                    </td>
                  </tr>
                ) : (
                  paginatedCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b border-border-subtle/50 hover:bg-bg-secondary/50 transition-colors group"
                    >
                      <td className="p-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-text-primary font-bold text-lg ${customer.color}`}
                        >
                          {customer.name.charAt(0)}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-text-secondary">
                          {customer.email || "-"}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-text-primary">
                        {customer.name}
                      </td>
                      <td className="p-4">
                        <div className="text-text-primary">
                          {customer.phone}
                        </div>
                        <div className="text-xs text-text-muted">
                          {customer.email}
                        </div>
                      </td>
                      <td className="p-4 text-text-secondary font-mono">
                        {customer.cccd}
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-bg-secondary border border-border-subtle text-accent-neon font-bold">
                          {customer.bookings}
                        </span>
                      </td>
                      <td className="p-4 text-text-muted">
                        {customer.created}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(customer)}
                            className="p-2 text-text-muted hover:text-accent-neon hover:bg-accent-neon/10 rounded transition-colors"
                            title="Sửa"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(customer.id)}
                            className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-colors"
                            title="Xóa"
                          >
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
            <span>
              Hiển thị{" "}
              {filteredCustomers.length === 0
                ? 0
                : (currentPage - 1) * ITEMS_PER_PAGE + 1}
              -
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredCustomers.length)}{" "}
              / {filteredCustomers.length} khách hàng
            </span>
            <div className="flex gap-1">
              <button
                className="px-3 py-1 border border-border-subtle rounded hover:bg-bg-secondary disabled:opacity-50"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              >
                Trước
              </button>
              <button className="px-3 py-1 border border-border-subtle rounded bg-accent-primary text-white border-accent-primary">
                {currentPage}
              </button>
              <button
                className="px-3 py-1 border border-border-subtle rounded hover:bg-bg-secondary disabled:opacity-50"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Thêm/Sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-bg-card border border-border-subtle rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-border-subtle bg-bg-secondary/50">
              <h2 className="text-lg font-bold text-text-primary">
                {editingCustomer
                  ? "CẬP NHẬT KHÁCH HÀNG"
                  : "THÊM KHÁCH HÀNG MỚI"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-text-muted font-bold mb-1 uppercase tracking-wider">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  className="input-field"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted font-bold mb-1 uppercase tracking-wider">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  className="input-field"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted font-bold mb-1 uppercase tracking-wider">
                  CCCD / Passport *
                </label>
                <input
                  type="text"
                  className="input-field"
                  required
                  value={formData.cccd}
                  onChange={(e) =>
                    setFormData({ ...formData, cccd: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted font-bold mb-1 uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  className="input-field"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-outline py-2"
                >
                  Hủy
                </button>
                <button type="submit" className="btn-primary py-2">
                  Lưu thông tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Search, ShieldAlert, UserCog, Ban, Trash2, X } from "lucide-react";
import { useToast } from "@/components/layout/ToastProvider";
import { dataService } from "@/lib/data-service";

const INITIAL_ACCOUNTS = [
  {
    id: "USR-001",
    email: "quanly@genz.com",
    name: "Quản Lý",
    role: "manager",
    created: "01/01/2023",
    status: "active",
  },
  {
    id: "USR-002",
    email: "letan@genz.com",
    name: "Lễ Tân",
    role: "receptionist",
    created: "15/01/2023",
    status: "active",
  },
  {
    id: "USR-003",
    email: "dondep@genz.com",
    name: "Nhân Viên Dọn Dẹp",
    role: "cleaner",
    created: "20/01/2023",
    status: "active",
  },
  {
    id: "USR-004",
    email: "khachhang@genz.com",
    name: "Khách Hàng",
    role: "customer",
    created: "10/02/2023",
    status: "active",
  },
  {
    id: "USR-005",
    email: "nghiviec@genz.com",
    name: "Nhân Viên Cũ",
    role: "receptionist",
    created: "05/03/2023",
    status: "disabled",
  },
  {
    id: "USR-006",
    email: "truc.le@genz.com",
    name: "Truc Le",
    role: "receptionist",
    created: "11/03/2023",
    status: "active",
  },
  {
    id: "USR-007",
    email: "thao.nguyen@genz.com",
    name: "Thao Nguyen",
    role: "customer",
    created: "21/03/2023",
    status: "active",
  },
  {
    id: "USR-008",
    email: "vu.minh@genz.com",
    name: "Vu Minh",
    role: "customer",
    created: "02/04/2023",
    status: "active",
  },
  {
    id: "USR-009",
    email: "my.linh@genz.com",
    name: "My Linh",
    role: "customer",
    created: "18/04/2023",
    status: "disabled",
  },
  {
    id: "USR-010",
    email: "bao.tran@genz.com",
    name: "Bao Tran",
    role: "cleaner",
    created: "30/04/2023",
    status: "active",
  },
  {
    id: "USR-011",
    email: "khanh.ngo@genz.com",
    name: "Khanh Ngo",
    role: "receptionist",
    created: "08/05/2023",
    status: "active",
  },
  {
    id: "USR-012",
    email: "lan.anh@genz.com",
    name: "Lan Anh",
    role: "customer",
    created: "25/05/2023",
    status: "active",
  },
];

export default function AdminAccounts() {
  const ITEMS_PER_PAGE = 10;
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const { confirm, success } = useToast();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "customer",
    password: "",
  });

  React.useEffect(() => {
    if (dataService.usingMockData) return;

    const loadAccounts = async () => {
      const result = await dataService.getAccounts();
      setAccounts(result);
    };

    void loadAccounts();
  }, []);

  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const matchesSearch =
        acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || acc.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" || acc.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [accounts, searchTerm, roleFilter, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAccounts.length / ITEMS_PER_PAGE),
  );
  const paginatedAccounts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAccounts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAccounts, currentPage]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleDelete = async (id: string) => {
    const shouldDelete = await confirm(
      `Bạn có chắc chắn muốn xóa tài khoản ${id}?`,
      { confirmLabel: "Xóa", cancelLabel: "Hủy" },
    );
    if (shouldDelete) {
      await dataService.deleteAccount(id);
      setAccounts(accounts.filter((a) => a.id !== id));
      success(`Đã xóa tài khoản ${id}.`);
    }
  };

  const handleToggleStatus = async (id: string) => {
    const current = accounts.find((a) => a.id === id);
    if (!current) return;

    const nextStatus = current.status === "active" ? "disabled" : "active";
    await dataService.updateAccount(id, { status: nextStatus });
    setAccounts(
      accounts.map((a) =>
        a.id === id
          ? { ...a, status: a.status === "active" ? "disabled" : "active" }
          : a,
      ),
    );
  };

  const openAddModal = () => {
    setEditingAccount(null);
    setFormData({ name: "", email: "", role: "customer", password: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (account: any) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      email: account.email,
      role: account.role,
      password: "", // Don't show existing password
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAccount) {
      await dataService.updateAccount(editingAccount.id, {
        name: formData.name,
        email: formData.email,
        role: formData.role as any,
      });
      // Update
      setAccounts(
        accounts.map((a) =>
          a.id === editingAccount.id
            ? {
                ...a,
                name: formData.name,
                email: formData.email,
                role: formData.role,
              }
            : a,
        ),
      );
      success("Cập nhật tài khoản thành công!");
    } else {
      await dataService.createAccount({
        name: formData.name,
        email: formData.email,
        role: formData.role as any,
        status: "active",
      });
      // Add
      const newAccount = {
        id: `USR-00${accounts.length + 1}`,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        created: new Date().toLocaleDateString("vi-VN"),
        status: "active",
      };
      setAccounts([newAccount, ...accounts]);
      success("Cấp tài khoản mới thành công!");
    }
    setIsModalOpen(false);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "manager":
        return (
          <span className="px-2 py-1 bg-danger/20 border border-danger/50 text-danger rounded text-xs font-bold uppercase">
            Quản lý
          </span>
        );
      case "receptionist":
        return (
          <span className="px-2 py-1 bg-warning/20 text-warning rounded text-xs font-bold uppercase">
            Lễ tân
          </span>
        );
      case "cleaner":
        return (
          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-bold uppercase">
            Dọn dẹp
          </span>
        );
      case "customer":
        return (
          <span className="px-2 py-1 bg-success/20 text-success rounded text-xs font-bold uppercase">
            Khách hàng
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout allowedRoles={["manager"]}>
      <div className="h-full flex flex-col min-h-0">
        <div className="shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl text-text-primary mb-1">
              TÀI KHOẢN & PHÂN QUYỀN
            </h1>
            <p className="text-text-secondary">
              Quản lý quyền truy cập hệ thống của nhân viên và khách hàng
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="btn-primary flex items-center gap-2 py-2"
          >
            <ShieldAlert size={18} /> CẤP TÀI KHOẢN MỚI
          </button>
        </div>

        {/* Toolbar */}
        <div className="shrink-0 bg-bg-secondary p-4 rounded-xl border border-border-subtle mb-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 flex-1">
            <div className="relative w-full md:w-80">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                size={18}
              />
              <input
                type="text"
                placeholder="Tìm theo email, tên, mã user..."
                className="input-field pl-10 py-2 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="input-field py-2 text-sm w-auto"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Tất cả vai trò</option>
              <option value="manager">Quản lý</option>
              <option value="receptionist">Lễ tân</option>
              <option value="cleaner">Dọn dẹp</option>
              <option value="customer">Khách hàng</option>
            </select>
            <select
              className="input-field py-2 text-sm w-auto"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="disabled">Bị khóa</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 min-h-0 card-cinema flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="sticky top-0 bg-bg-card z-10">
                <tr className="border-b border-border-subtle text-text-muted text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Mã User</th>
                  <th className="p-4 font-medium">Người dùng</th>
                  <th className="p-4 font-medium">Vai trò</th>
                  <th className="p-4 font-medium">Ngày tạo</th>
                  <th className="p-4 font-medium">Trạng thái</th>
                  <th className="p-4 font-medium text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-text-muted">
                      Không tìm thấy tài khoản nào.
                    </td>
                  </tr>
                ) : (
                  paginatedAccounts.map((acc) => (
                    <tr
                      key={acc.id}
                      className={`border-b border-border-subtle/50 hover:bg-bg-secondary/50 transition-colors group ${acc.status === "disabled" ? "opacity-60" : ""}`}
                    >
                      <td className="p-4">
                        <span className="font-mono text-text-secondary">
                          {acc.id}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-text-primary">
                          {acc.name}
                        </div>
                        <div className="text-xs text-text-muted">
                          {acc.email}
                        </div>
                      </td>
                      <td className="p-4">{getRoleBadge(acc.role)}</td>
                      <td className="p-4 text-text-muted">{acc.created}</td>
                      <td className="p-4">
                        {acc.status === "active" ? (
                          <span className="flex items-center gap-1 text-success text-xs">
                            <div className="w-2 h-2 rounded-full bg-success"></div>{" "}
                            Hoạt động
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-danger text-xs">
                            <div className="w-2 h-2 rounded-full bg-danger"></div>{" "}
                            Đã khóa
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(acc)}
                            className="p-2 text-text-muted hover:text-accent-neon hover:bg-accent-neon/10 rounded transition-colors"
                            title="Sửa / Đổi vai trò"
                          >
                            <UserCog size={16} />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(acc.id)}
                            className="p-2 text-text-muted hover:text-warning hover:bg-warning/10 rounded transition-colors"
                            title={
                              acc.status === "active"
                                ? "Khóa tài khoản"
                                : "Mở khóa"
                            }
                          >
                            <Ban size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(acc.id)}
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
              {filteredAccounts.length === 0
                ? 0
                : (currentPage - 1) * ITEMS_PER_PAGE + 1}
              -{Math.min(currentPage * ITEMS_PER_PAGE, filteredAccounts.length)}{" "}
              / {filteredAccounts.length} tài khoản
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
                {editingAccount ? "CẬP NHẬT TÀI KHOẢN" : "CẤP TÀI KHOẢN MỚI"}
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
                  Email *
                </label>
                <input
                  type="email"
                  className="input-field"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              {!editingAccount && (
                <div>
                  <label className="block text-xs text-text-muted font-bold mb-1 uppercase tracking-wider">
                    Mật khẩu *
                  </label>
                  <input
                    type="password"
                    className="input-field"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>
              )}
              <div>
                <label className="block text-xs text-text-muted font-bold mb-1 uppercase tracking-wider">
                  Phân quyền (Vai trò) *
                </label>
                <select
                  className="input-field"
                  required
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value="customer">Khách hàng</option>
                  <option value="cleaner">Nhân viên Dọn dẹp</option>
                  <option value="receptionist">Lễ tân</option>
                  <option value="manager">Quản lý</option>
                </select>
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

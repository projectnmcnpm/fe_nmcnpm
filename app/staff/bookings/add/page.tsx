"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import BookingCreateForm from "@/components/booking/BookingCreateForm";

export default function StaffAddBookingPage() {
  return (
    <DashboardLayout allowedRoles={["receptionist", "manager"]}>
      <BookingCreateForm
        backHref="/staff/bookings"
        successRedirectHref="/staff/bookings"
        successMessage="Tạo đặt phòng thành công!"
        pageTitle="TẠO ĐẶT PHÒNG MỚI"
        pageSubtitle="Nhập thông tin khách hàng, chọn loại đặt phòng và hệ thống sẽ tự tính giá"
        submitLabel="TẠO ĐẶT PHÒNG"
      />
    </DashboardLayout>
  );
}

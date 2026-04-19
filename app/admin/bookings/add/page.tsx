"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import BookingCreateForm from "@/components/booking/BookingCreateForm";

export default function AddBookingPage() {
  return (
    <DashboardLayout allowedRoles={["manager"]}>
      <BookingCreateForm
        backHref="/admin/bookings"
        successRedirectHref="/admin/bookings"
        successMessage="Thêm đặt phòng thành công!"
        pageTitle="THÊM ĐẶT PHÒNG MỚI"
        pageSubtitle="Tạo đặt phòng theo giờ hoặc theo đêm, giá và cọc được tính tự động"
        submitLabel="TẠO ĐẶT PHÒNG"
      />
    </DashboardLayout>
  );
}

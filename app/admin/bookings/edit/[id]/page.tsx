"use client";

import React from "react";
import { useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import BookingEditForm from "@/components/booking/BookingEditForm";

export default function EditBookingPage() {
  const params = useParams();
  const bookingId = params.id as string;

  return (
    <DashboardLayout allowedRoles={["manager"]}>
      <BookingEditForm
        bookingId={bookingId}
        backHref="/admin/bookings"
        successRedirectHref="/admin/bookings"
        successMessage="Cập nhật đặt phòng thành công!"
        pageTitle="CẬP NHẬT ĐẶT PHÒNG"
        pageSubtitle="Chỉnh sửa theo cùng giao diện tạo đặt phòng"
        submitLabel="LƯU THAY ĐỔI"
      />
    </DashboardLayout>
  );
}

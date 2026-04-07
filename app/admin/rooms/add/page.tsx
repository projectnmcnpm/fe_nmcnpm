"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  ArrowLeft,
  Upload,
  X,
  Image as ImageIcon,
  Wifi,
  MonitorPlay,
  Bath,
  Wind,
  Coffee,
  Sun,
  Bell,
  Check,
  Plus,
  Trash2,
} from "lucide-react";
import { useToast } from "@/components/layout/ToastProvider";
import {
  ADMIN_ROOM_STATUS_CREATE_OPTIONS,
  ADMIN_ROOM_TYPE_FORM_OPTIONS,
} from "@/lib/status-config";

type AmenityItem = {
  id: string;
  label: string;
  icon: React.ElementType;
};

const AMENITIES_LIST: AmenityItem[] = [
  { id: "wifi", label: "Wifi tốc độ cao", icon: Wifi },
  { id: "tv", label: "TV Smart HD", icon: MonitorPlay },
  { id: "projector", label: "Máy chiếu 4K", icon: MonitorPlay },
  { id: "bathtub", label: "Bồn tắm", icon: Bath },
  { id: "ac", label: "Điều hòa", icon: Wind },
  { id: "minibar", label: "Tủ lạnh mini", icon: Coffee },
  { id: "balcony", label: "Ban công", icon: Sun },
  { id: "service", label: "Dịch vụ 24/7", icon: Bell },
];

export default function AddRoomPage() {
  const router = useRouter();
  const { success } = useToast();

  const [mainImage, setMainImage] = useState<string | null>(null);
  const [subImages, setSubImages] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const [amenities, setAmenities] = useState<AmenityItem[]>(AMENITIES_LIST);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState("");

  const mainInputRef = useRef<HTMLInputElement>(null);
  const subInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "main" | "sub",
    index?: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (type === "main") {
        setMainImage(result);
      } else if (type === "sub" && index !== undefined) {
        const nextImages = [...subImages];
        nextImages[index] = result;
        setSubImages(nextImages);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (type: "main" | "sub", index?: number) => {
    if (type === "main") {
      setMainImage(null);
      if (mainInputRef.current) mainInputRef.current.value = "";
      return;
    }

    if (index !== undefined) {
      const nextImages = [...subImages];
      nextImages[index] = null;
      setSubImages(nextImages);
      if (subInputRefs[index].current) subInputRefs[index].current.value = "";
    }
  };

  const toggleAmenity = (id: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(id)
        ? prev.filter((amenityId) => amenityId !== id)
        : [...prev, id],
    );
  };

  const addAmenity = () => {
    const trimmedAmenity = newAmenity.trim();
    if (!trimmedAmenity) return;

    const alreadyExists = amenities.some(
      (item) => item.label.toLowerCase() === trimmedAmenity.toLowerCase(),
    );

    if (!alreadyExists) {
      const newId = `custom-${Date.now()}`;
      const nextAmenity: AmenityItem = {
        id: newId,
        label: trimmedAmenity,
        icon: Check,
      };
      setAmenities((prev) => [...prev, nextAmenity]);
      setSelectedAmenities((prev) => [...prev, newId]);
    }

    setNewAmenity("");
  };

  const updateAmenityLabel = (id: string, label: string) => {
    setAmenities((prev) =>
      prev.map((item) => (item.id === id ? { ...item, label } : item)),
    );
  };

  const removeAmenity = (id: string) => {
    setAmenities((prev) => prev.filter((item) => item.id !== id));
    setSelectedAmenities((prev) =>
      prev.filter((amenityId) => amenityId !== id),
    );
  };

  const selectedAmenityLabels = amenities
    .filter((item) => selectedAmenities.includes(item.id))
    .map((item) => item.label);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    success("Thêm phòng thành công!");
    router.push("/admin/rooms");
  };

  return (
    <DashboardLayout allowedRoles={["manager"]}>
      <div className="h-full flex flex-col min-h-0 max-w-5xl mx-auto w-full">
        <div className="shrink-0 flex items-center gap-4 mb-6">
          <Link
            href="/admin/rooms"
            className="p-2 bg-bg-secondary rounded hover:bg-border-subtle transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl text-text-primary">THÊM PHÒNG MỚI</h1>
            <p className="text-sm text-text-secondary">
              Nhập thông tin chi tiết và hình ảnh cho phòng mới
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-auto pr-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="card-cinema p-6">
              <h2 className="text-lg text-text-primary font-bold mb-4 flex items-center gap-2">
                <ImageIcon size={20} className="text-accent-neon" /> Hình ảnh
                phòng (Tối đa 5 ảnh)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <p className="text-xs text-text-muted mb-2 uppercase tracking-wider font-bold">
                    Ảnh chính (Cover)
                  </p>
                  <div
                    className={`relative w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-colors ${mainImage ? "border-accent-neon" : "border-border-subtle hover:border-text-muted bg-bg-secondary/50"}`}
                  >
                    {mainImage ? (
                      <>
                        <img
                          src={mainImage}
                          alt="Main"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage("main")}
                          className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-danger text-white rounded-full backdrop-blur-sm transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <div
                        className="text-center cursor-pointer w-full h-full flex flex-col items-center justify-center"
                        onClick={() => mainInputRef.current?.click()}
                      >
                        <Upload size={32} className="text-text-muted mb-2" />
                        <span className="text-sm text-text-secondary">
                          Click để tải ảnh lên
                        </span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={mainInputRef}
                      onChange={(e) => handleImageUpload(e, "main")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {subImages.map((img, idx) => (
                    <div key={idx} className="flex flex-col">
                      <p className="text-xs text-text-muted mb-2 uppercase tracking-wider font-bold">
                        Ảnh phụ {idx + 1}
                      </p>
                      <div
                        className={`relative w-full aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-colors ${img ? "border-accent-neon" : "border-border-subtle hover:border-text-muted bg-bg-secondary/50"}`}
                      >
                        {img ? (
                          <>
                            <img
                              src={img}
                              alt={`Sub ${idx}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage("sub", idx)}
                              className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-danger text-white rounded-full backdrop-blur-sm transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <div
                            className="text-center cursor-pointer w-full h-full flex flex-col items-center justify-center"
                            onClick={() => subInputRefs[idx].current?.click()}
                          >
                            <Upload
                              size={20}
                              className="text-text-muted mb-1"
                            />
                            <span className="text-xs text-text-muted">
                              Tải ảnh
                            </span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={subInputRefs[idx]}
                          onChange={(e) => handleImageUpload(e, "sub", idx)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card-cinema p-6">
              <h2 className="text-lg text-text-primary font-bold mb-4">
                Thông tin cơ bản
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                    Mã phòng *
                  </label>
                  <input
                    type="text"
                    className="input-field font-mono"
                    placeholder="VD: RM-101"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                    Tên phòng *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="VD: Netflix & Chill Suite"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                    Loại phòng *
                  </label>
                  <select className="input-field" required>
                    <option value="">Chọn loại phòng</option>
                    {ADMIN_ROOM_TYPE_FORM_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                    Sức chứa (Người) *
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    min="1"
                    max="10"
                    placeholder="VD: 2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                    Giá mỗi đêm (VNĐ) *
                  </label>
                  <input
                    type="number"
                    className="input-field font-mono text-accent-gold"
                    placeholder="VD: 650000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                    Trạng thái ban đầu
                  </label>
                  <select className="input-field">
                    {ADMIN_ROOM_STATUS_CREATE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                    Mô tả chi tiết
                  </label>
                  <textarea
                    className="input-field min-h-[120px] resize-y"
                    placeholder="Nhập mô tả về không gian, phong cách thiết kế..."
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="card-cinema p-6">
              <h2 className="text-lg text-text-primary font-bold mb-4">
                Tiện ích phòng
              </h2>
              <div className="mb-5 flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Thêm tiện ích mới (VD: Máy sấy tóc, Bàn ủi...)"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addAmenity();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addAmenity}
                  className="btn-outline py-2 flex items-center gap-2 whitespace-nowrap"
                >
                  <Plus size={16} /> THÊM TIỆN ÍCH
                </button>
              </div>

              {selectedAmenityLabels.length > 0 && (
                <div className="mb-5 flex flex-wrap gap-2">
                  {selectedAmenityLabels.map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-neon/10 border border-accent-neon/30 text-sm text-accent-neon"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                {amenities.map((amenity) => {
                  const isSelected = selectedAmenities.includes(amenity.id);
                  const Icon = amenity.icon;
                  return (
                    <div
                      key={amenity.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isSelected ? "bg-accent-neon/10 border-accent-neon" : "bg-bg-primary border-border-subtle"}`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleAmenity(amenity.id)}
                        className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${isSelected ? "bg-accent-neon border-accent-neon text-black" : "border-text-muted"}`}
                      >
                        {isSelected && <Check size={14} strokeWidth={3} />}
                      </button>
                      <Icon
                        size={18}
                        className={
                          isSelected ? "text-accent-neon" : "text-text-muted"
                        }
                      />
                      <input
                        type="text"
                        value={amenity.label}
                        onChange={(e) =>
                          updateAmenityLabel(amenity.id, e.target.value)
                        }
                        className="input-field py-2"
                      />
                      <button
                        type="button"
                        onClick={() => removeAmenity(amenity.id)}
                        className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-colors"
                        title="Xóa tiện ích"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-4 pb-8">
              <Link href="/admin/rooms" className="btn-outline">
                HỦY BỎ
              </Link>
              <button type="submit" className="btn-primary">
                LƯU PHÒNG MỚI
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

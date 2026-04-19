"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
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
  ADMIN_ROOM_STATUS_EDIT_OPTIONS,
  ADMIN_ROOM_TYPE_FORM_OPTIONS,
} from "../../../../../lib/status-config";
import { dataService } from "@/lib/data-service";
import type { Room, RoomStatus } from "@/lib/mock-data";

const ROOM_TYPE_API_MAP: Record<string, string> = {
  "Single Room": "SGL",
  "Twin Room": "TWN",
  "Double Room": "DBL",
  "VIP Room": "TRPL",
};

const ROOM_TYPE_FORM_TO_API_MAP: Record<string, string> = {
  SGL: "Single Room",
  TWN: "Twin Room",
  DBL: "Double Room",
  TRPL: "VIP Room",
};

const ROOM_TYPE_MAX_CAPACITY: Record<string, number> = {
  SGL: 1,
  TWN: 2,
  DBL: 2,
  TRPL: 3,
};

const ROOM_STATUS_API_MAP: Record<string, string> = {
  available: "0",
  in_use: "1",
  pending_cleaning: "2",
  cleaning_in_progress: "-1",
  cleaned: "3",
  maintenance: "-2",
};

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

export default function EditRoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;
  const { success, error } = useToast();

  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const [selectedTypeCode, setSelectedTypeCode] = useState<string>("");
  const [capacityInput, setCapacityInput] = useState<string>("");

  const mainInputRef = useRef<HTMLInputElement>(null);
  const subInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Load room data from API
  useEffect(() => {
    const loadRoom = async () => {
      try {
        setIsLoading(true);
        const fetchedRoom = await dataService.getRoomById(roomId);
        if (!fetchedRoom) {
          setRoom(null);
          return;
        }
        setRoom(fetchedRoom);

        const coverImage = fetchedRoom?.image || null;
        const galleryImages = (fetchedRoom?.gallery || []).slice(0, 4);
        const nextSubImages = [null, null, null, null] as (string | null)[];
        galleryImages.forEach((url, index) => {
          nextSubImages[index] = url;
        });

        const roomAmenities = (fetchedRoom?.amenities || [])
          .map((item) => item.trim())
          .filter(Boolean);
        const amenityMap = new Map(
          AMENITIES_LIST.map((item) => [item.label.trim().toLowerCase(), item]),
        );

        roomAmenities.forEach((label) => {
          const key = label.toLowerCase();
          if (!amenityMap.has(key)) {
            amenityMap.set(key, {
              id: `db-${key.replace(/\s+/g, "-")}`,
              label,
              icon: Check,
            });
          }
        });

        const mergedAmenities = Array.from(amenityMap.values());
        const selectedAmenityIds = mergedAmenities
          .filter((item) =>
            roomAmenities.some(
              (label) => label.toLowerCase() === item.label.toLowerCase(),
            ),
          )
          .map((item) => item.id);

        setMainImage(coverImage);
        setSubImages(nextSubImages);
        setAmenities(mergedAmenities);
        setSelectedAmenities(selectedAmenityIds);
        setSelectedTypeCode(ROOM_TYPE_API_MAP[fetchedRoom.type] || "");
        setCapacityInput(
          fetchedRoom.capacity !== undefined && fetchedRoom.capacity !== null
            ? String(fetchedRoom.capacity)
            : "",
        );
      } catch (err) {
        error("Không thể tải thông tin phòng");
      } finally {
        setIsLoading(false);
      }
    };

    if (roomId) {
      void loadRoom();
    }
  }, [roomId, error]);

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

  const currentMaxCapacity = ROOM_TYPE_MAX_CAPACITY[selectedTypeCode] || 10;

  const handleTypeChange = (typeCode: string) => {
    setSelectedTypeCode(typeCode);
    const nextMax = ROOM_TYPE_MAX_CAPACITY[typeCode] || 10;
    if (!capacityInput) return;

    const currentCapacity = Number(capacityInput);
    if (Number.isFinite(currentCapacity) && currentCapacity > nextMax) {
      setCapacityInput(String(nextMax));
    }
  };

  const handleCapacityChange = (value: string) => {
    if (value === "") {
      setCapacityInput("");
      return;
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;
    const normalized = Math.max(1, Math.min(parsed, currentMaxCapacity));
    setCapacityInput(String(normalized));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const name = String(formData.get("name") || "").trim();
      const typeCode =
        selectedTypeCode || String(formData.get("type") || "").trim();
      const capacityRaw = capacityInput.trim();
      const pricePerNightRaw = String(
        formData.get("pricePerNight") || "",
      ).trim();
      const pricePerHourRaw = String(formData.get("pricePerHour") || "").trim();
      const statusCode = String(formData.get("statusCode") || "0").trim();
      const description = String(formData.get("description") || "").trim();

      const roomType = ROOM_TYPE_FORM_TO_API_MAP[typeCode];
      if (!roomType) {
        throw new Error("Loại phòng không hợp lệ");
      }

      const pricePerNight = Number(pricePerNightRaw);
      if (!Number.isFinite(pricePerNight) || pricePerNight < 0) {
        throw new Error("Giá mỗi đêm không hợp lệ");
      }

      const capacity = capacityRaw ? Number(capacityRaw) : undefined;
      if (
        capacity !== undefined &&
        (!Number.isFinite(capacity) ||
          capacity < 1 ||
          capacity > currentMaxCapacity)
      ) {
        throw new Error(
          `Sức chứa không hợp lệ. Tối đa cho loại phòng này là ${currentMaxCapacity}`,
        );
      }

      const pricePerHour = pricePerHourRaw
        ? Number(pricePerHourRaw)
        : undefined;
      if (
        pricePerHour !== undefined &&
        (!Number.isFinite(pricePerHour) || pricePerHour < 0)
      ) {
        throw new Error("Giá theo giờ không hợp lệ");
      }

      // Map status code to API status
      const statusMap: Record<string, RoomStatus> = {
        "0": "available",
        "1": "in_use",
        "2": "pending_cleaning",
        "-1": "cleaning_in_progress",
        "3": "cleaned",
        "-2": "maintenance",
      };
      const status = statusMap[statusCode] || "available";

      await dataService.updateRoom(roomId, {
        name,
        type: roomType,
        capacity,
        pricePerNight,
        pricePerHour,
        status,
        amenities: selectedAmenityLabels
          .map((item) => item.trim())
          .filter(Boolean),
        description: description || undefined,
      });

      success("Cập nhật phòng thành công!");
      router.push("/admin/rooms");
    } catch (submitError) {
      const message =
        submitError instanceof Error && submitError.message
          ? submitError.message
          : "Cập nhật phòng thất bại";
      error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout allowedRoles={["manager"]}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-text-primary">Đang tải thông tin phòng...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!room) {
    return (
      <DashboardLayout allowedRoles={["manager"]}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-danger">Không tìm thấy phòng</p>
            <Link href="/admin/rooms" className="mt-4 btn-primary inline-block">
              Quay về danh sách
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
            <h1 className="text-2xl text-text-primary">
              CẬP NHẬT PHÒNG:{" "}
              <span className="text-accent-neon font-mono">{room.name}</span>
            </h1>
            <p className="text-sm text-text-secondary">
              Chỉnh sửa thông tin chi tiết của phòng
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-auto pr-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Images */}
            <div className="card-cinema p-6">
              <h2 className="text-lg text-text-primary font-bold mb-4 flex items-center gap-2">
                <ImageIcon size={20} className="text-accent-neon" /> Hình ảnh
                phòng (Tối đa 5 ảnh)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Main Image */}
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

                {/* Sub Images */}
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

            {/* Section 2: Info */}
            <div className="card-cinema p-6">
              <h2 className="text-lg text-text-primary font-bold mb-4">
                Thông tin cơ bản
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                    Tên phòng *
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="input-field"
                    defaultValue={room?.name}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                    Loại phòng *
                  </label>
                  <select
                    name="type"
                    className="input-field"
                    value={selectedTypeCode}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    required
                  >
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
                    Sức chứa (Người) - Tối đa {currentMaxCapacity}
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    className="input-field"
                    min="1"
                    max={currentMaxCapacity}
                    value={capacityInput}
                    onChange={(e) => handleCapacityChange(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                    Giá mỗi đêm (VNĐ) *
                  </label>
                  <input
                    type="number"
                    name="pricePerNight"
                    className="input-field font-mono text-accent-gold"
                    defaultValue={room?.price}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                    Giá theo giờ (VNĐ)
                  </label>
                  <input
                    type="number"
                    name="pricePerHour"
                    className="input-field font-mono text-accent-gold"
                    defaultValue={room?.pricePerHour || 0}
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted font-bold mb-2 uppercase tracking-wider">
                    Trạng thái
                  </label>
                  <select
                    name="statusCode"
                    className="input-field"
                    defaultValue={ROOM_STATUS_API_MAP[room?.status] || "0"}
                  >
                    {ADMIN_ROOM_STATUS_EDIT_OPTIONS.map((option) => (
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
                    name="description"
                    className="input-field min-h-[120px] resize-y"
                    defaultValue={room?.description}
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Section 3: Amenities */}
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
                  {selectedAmenityLabels.map((label) => {
                    return (
                      <span
                        key={label}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-neon/10 border border-accent-neon/30 text-sm text-accent-neon"
                      >
                        {label}
                      </span>
                    );
                  })}
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

            {/* Actions */}
            <div className="flex justify-end gap-4 pb-8">
              <Link href="/admin/rooms" className="btn-outline">
                HỦY BỎ
              </Link>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "ĐANG LƯU..." : "LƯU THAY ĐỔI"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

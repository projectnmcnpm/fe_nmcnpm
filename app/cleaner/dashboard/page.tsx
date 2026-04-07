"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Brush,
  CheckCircle2,
  Clock3,
  LogOut,
  Bell,
  TriangleAlert,
  UserRound,
  Play,
  RefreshCw,
  MapPin,
  X,
  ClipboardList,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { dataService } from "@/lib/data-service";
import type { Room } from "@/lib/mock-data";
import { useToast } from "@/components/layout/ToastProvider";

type TaskState = "pending" | "in_progress" | "issue";
type TabKey = "tasks" | "alerts" | "profile";

type CleanerTask = {
  room: Room;
  state: TaskState;
  startedAt?: string;
  issueReason?: string;
  issueNote?: string;
  updatedAt: string;
};

type FeedItem = {
  id: number;
  label: string;
  message: string;
  time: string;
  tone: "success" | "warning" | "info";
};

const ISSUE_PRESETS = [
  "Thiếu đồ",
  "Cần kiểm tra thiết bị",
  "Có mùi lạ",
  "Phòng bừa bộn hơn dự kiến",
];

const formatClock = (date = new Date()) =>
  new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

const statusMeta: Record<
  TaskState,
  { label: string; className: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Chờ xử lý",
    className: "bg-warning/15 text-warning border-warning/25",
    icon: <Clock3 size={14} />,
  },
  in_progress: {
    label: "Đang dọn",
    className:
      "bg-accent-primary/15 text-accent-primary border-accent-primary/25",
    icon: <Play size={14} />,
  },
  issue: {
    label: "Báo sự cố",
    className: "bg-danger/15 text-danger border-danger/25",
    icon: <TriangleAlert size={14} />,
  },
};

function makeTask(room: Room): CleanerTask {
  return {
    room,
    state: "pending",
    updatedAt: formatClock(),
  };
}

export default function CleanerDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [tasks, setTasks] = useState<CleanerTask[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [activeTab, setActiveTab] = useState<TabKey>("tasks");
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [issueTaskId, setIssueTaskId] = useState<string | null>(null);
  const [issueReason, setIssueReason] = useState(ISSUE_PRESETS[0]);
  const [issueNote, setIssueNote] = useState("");

  useEffect(() => {
    const loadTasks = async () => {
      const cleaningRooms = (await dataService.getRooms()).filter(
        (room) => room.status === "cleaning",
      );
      const initialTasks = cleaningRooms.map((room) => makeTask(room));
      setTasks(initialTasks);
      setFeed([
        {
          id: 1,
          label: "Ca làm việc",
          message: `Bạn đang phụ trách ${cleaningRooms.length} phòng cần dọn.`,
          time: formatClock(),
          tone: "info",
        },
      ]);
    };

    void loadTasks();
  }, []);

  const totalTasks = tasks.length + completedCount;
  const progress =
    totalTasks === 0 ? 100 : Math.round((completedCount / totalTasks) * 100);
  const nextTask = useMemo(() => tasks[0] ?? null, [tasks]);
  const activeTasks = tasks.filter(
    (task) => task.state === "in_progress",
  ).length;
  const issueTasks = tasks.filter((task) => task.state === "issue").length;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary text-text-primary">
        Đang tải...
      </div>
    );
  }

  if (user.role !== "cleaner" && user.role !== "manager") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary text-text-primary px-4">
        <div className="text-center max-w-sm">
          <h1 className="text-3xl mb-4 text-accent-primary">
            Truy cập bị từ chối
          </h1>
          <p className="text-text-secondary mb-6">
            Bạn không có quyền truy cập trang này.
          </p>
          <button
            onClick={() => router.push("/")}
            className="btn-primary w-full"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const pushFeed = (item: Omit<FeedItem, "id" | "time">) => {
    setFeed((current) =>
      [
        {
          id: Date.now(),
          time: formatClock(),
          ...item,
        },
        ...current,
      ].slice(0, 8),
    );
  };

  const startTask = (roomId: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.room.id === roomId
          ? {
              ...task,
              state: "in_progress",
              startedAt: task.startedAt ?? formatClock(),
              updatedAt: formatClock(),
            }
          : task,
      ),
    );

    const task = tasks.find((item) => item.room.id === roomId);
    pushFeed({
      label: "Bắt đầu dọn",
      message: `Đã bắt đầu xử lý ${task?.room.id ?? roomId}.`,
      tone: "success",
    });
    toast.success(`Đã bắt đầu dọn ${task?.room.id ?? roomId}.`);
  };

  const resolveIssue = (roomId: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.room.id === roomId
          ? {
              ...task,
              state: "in_progress",
              issueReason: undefined,
              issueNote: undefined,
              updatedAt: formatClock(),
            }
          : task,
      ),
    );

    const task = tasks.find((item) => item.room.id === roomId);
    pushFeed({
      label: "Xử lý sự cố",
      message: `Đã chuyển ${task?.room.id ?? roomId} về trạng thái tiếp tục dọn.`,
      tone: "info",
    });
    toast.info(`Đã ghi nhận xử lý lại ${task?.room.id ?? roomId}.`);
  };

  const completeTask = async (roomId: string) => {
    const task = tasks.find((item) => item.room.id === roomId);
    if (!task) {
      return;
    }

    if (task.state === "issue") {
      toast.warning("Hãy xử lý xong sự cố trước khi hoàn tất phòng này.");
      return;
    }

    await dataService.updateRoomStatus(roomId, "available");
    setTasks((current) => current.filter((item) => item.room.id !== roomId));
    setCompletedCount((count) => count + 1);

    pushFeed({
      label: "Hoàn tất",
      message: `Phòng ${task.room.id} đã được đánh dấu sạch và sẵn sàng.`,
      tone: "success",
    });
    toast.success(`Đã hoàn tất ${task.room.id}.`);
  };

  const submitIssue = () => {
    if (!issueTaskId) return;

    const task = tasks.find((item) => item.room.id === issueTaskId);
    if (!task) return;

    setTasks((current) =>
      current.map((item) =>
        item.room.id === issueTaskId
          ? {
              ...item,
              state: "issue",
              issueReason,
              issueNote: issueNote.trim(),
              updatedAt: formatClock(),
            }
          : item,
      ),
    );

    pushFeed({
      label: "Báo sự cố",
      message: `${task.room.id}: ${issueReason}${issueNote.trim() ? ` - ${issueNote.trim()}` : ""}`,
      tone: "warning",
    });
    toast.warning(`Đã báo sự cố cho ${task.room.id}.`);
    setIssueTaskId(null);
    setIssueReason(ISSUE_PRESETS[0]);
    setIssueNote("");
  };

  const openIssueSheet = (roomId: string) => {
    const task = tasks.find((item) => item.room.id === roomId);
    if (!task) return;

    setIssueTaskId(roomId);
    setIssueReason(task.issueReason ?? ISSUE_PRESETS[0]);
    setIssueNote(task.issueNote ?? "");
  };

  const currentIssueTask = issueTaskId
    ? (tasks.find((task) => task.room.id === issueTaskId) ?? null)
    : null;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(230,57,70,0.08),_transparent_34%),linear-gradient(to_bottom,_#fff,_#f8fafc)] sm:bg-[#0b0b0b] flex justify-center">
      <div className="w-full sm:max-w-[430px] sm:min-h-screen bg-bg-primary sm:bg-[#111111] sm:border-x sm:border-border-subtle flex flex-col overflow-hidden relative">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-accent-primary/12 to-transparent pointer-events-none" />

        <header className="shrink-0 px-5 pt-5 pb-4 z-20 sticky top-0 bg-bg-primary/90 backdrop-blur-xl border-b border-border-subtle/70">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.28em] text-text-muted font-bold mb-2">
                Cleaner App
              </p>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-accent-primary/12 flex items-center justify-center text-accent-primary border border-accent-primary/20 shrink-0">
                  <Brush size={22} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-text-primary font-bold text-lg truncate">
                    {user.name}
                  </h2>
                  <p className="text-sm text-text-secondary truncate">
                    Ca làm hôm nay • tối ưu cho điện thoại
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="w-11 h-11 rounded-2xl bg-bg-secondary flex items-center justify-center text-text-muted hover:text-accent-primary transition-colors border border-border-subtle shrink-0"
            >
              <LogOut size={18} />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border-subtle bg-bg-secondary/80 p-3">
              <p className="text-[11px] uppercase tracking-wider text-text-muted font-bold mb-2">
                Đang xử lý
              </p>
              <div className="flex items-end justify-between gap-3">
                <span className="text-3xl font-display text-accent-primary leading-none">
                  {activeTasks}
                </span>
                <ClipboardList size={18} className="text-accent-primary" />
              </div>
            </div>
            <div className="rounded-2xl border border-border-subtle bg-bg-secondary/80 p-3">
              <p className="text-[11px] uppercase tracking-wider text-text-muted font-bold mb-2">
                Hoàn thành
              </p>
              <div className="flex items-end justify-between gap-3">
                <span className="text-3xl font-display text-success leading-none">
                  {completedCount}
                </span>
                <CheckCircle2 size={18} className="text-success" />
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-border-subtle bg-bg-secondary/70 p-3">
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="text-[11px] uppercase tracking-wider text-text-muted font-bold">
                Tiến độ ca
              </p>
              <span className="text-xs font-mono text-text-secondary">
                {progress}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-bg-primary overflow-hidden border border-border-subtle">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-primary to-warning"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-5 pb-28 pt-4">
          {nextTask ? (
            <section className="rounded-[1.75rem] border border-border-subtle bg-gradient-to-br from-accent-primary/10 via-bg-secondary to-success/8 p-4 mb-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-text-muted font-bold mb-2">
                    Nhiệm vụ tiếp theo
                  </p>
                  <h3 className="text-2xl text-text-primary font-bold leading-tight truncate">
                    {nextTask.room.id}
                  </h3>
                  <p className="text-sm text-text-secondary mt-1 truncate">
                    {nextTask.room.name}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-bg-primary/80 border border-border-subtle flex items-center justify-center text-accent-primary shrink-0">
                  <Sparkles size={20} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-text-secondary">
                <MapPin size={14} />
                <span>{nextTask.room.type}</span>
                <span className="text-text-muted">•</span>
                <span>{nextTask.updatedAt}</span>
              </div>
            </section>
          ) : (
            <section className="rounded-[1.75rem] border border-success/20 bg-success/8 p-5 mb-4 text-center">
              <div className="w-16 h-16 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-4 border border-success/20">
                <CheckCircle2 size={34} />
              </div>
              <h3 className="text-2xl text-text-primary font-bold mb-2">
                Hoàn thành ca
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Bạn đã xử lý xong tất cả phòng được giao. Có thể chuyển sang tab
                thông báo hoặc nghỉ ngơi.
              </p>
            </section>
          )}

          {activeTab === "tasks" && (
            <div className="space-y-4">
              {tasks.length === 0 ? (
                <div className="rounded-3xl border border-border-subtle bg-bg-secondary/70 p-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-4 border border-success/20">
                    <CheckCircle2 size={28} />
                  </div>
                  <h3 className="text-xl text-text-primary font-bold mb-2">
                    Danh sách trống
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Không còn phòng cần dọn trong ca hiện tại.
                  </p>
                </div>
              ) : (
                tasks.map((task, index) => {
                  const meta = statusMeta[task.state];

                  return (
                    <article
                      key={task.room.id}
                      className="rounded-[1.75rem] border border-border-subtle bg-bg-secondary/85 overflow-hidden shadow-sm"
                    >
                      <div className="p-4 border-b border-border-subtle/70">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider ${meta.className}`}
                              >
                                {meta.icon}
                                {meta.label}
                              </span>
                              <span className="text-[11px] text-text-muted font-mono">
                                #{index + 1}
                              </span>
                            </div>
                            <h3 className="text-3xl font-display text-text-primary leading-none mb-2">
                              {task.room.id}
                            </h3>
                            <p className="text-sm text-text-secondary truncate">
                              {task.room.name}
                            </p>
                          </div>
                          <div className="w-11 h-11 rounded-2xl bg-bg-primary flex items-center justify-center text-text-muted border border-border-subtle shrink-0">
                            <Clock3 size={18} />
                          </div>
                        </div>
                      </div>

                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-2xl bg-bg-primary border border-border-subtle p-3">
                            <p className="text-[11px] uppercase tracking-wider text-text-muted font-bold mb-1">
                              Trạng thái
                            </p>
                            <p
                              className={`text-sm font-bold ${task.state === "issue" ? "text-danger" : task.state === "in_progress" ? "text-accent-primary" : "text-warning"}`}
                            >
                              {meta.label}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-bg-primary border border-border-subtle p-3">
                            <p className="text-[11px] uppercase tracking-wider text-text-muted font-bold mb-1">
                              Cập nhật
                            </p>
                            <p className="text-sm text-text-primary font-mono">
                              {task.updatedAt}
                            </p>
                          </div>
                        </div>

                        {task.startedAt ? (
                          <div className="rounded-2xl bg-bg-primary border border-border-subtle p-3">
                            <p className="text-[11px] uppercase tracking-wider text-text-muted font-bold mb-1">
                              Bắt đầu lúc
                            </p>
                            <p className="text-sm text-text-primary font-mono">
                              {task.startedAt}
                            </p>
                          </div>
                        ) : null}

                        {task.state === "issue" &&
                        (task.issueReason || task.issueNote) ? (
                          <div className="rounded-2xl bg-danger/8 border border-danger/15 p-3">
                            <p className="text-[11px] uppercase tracking-wider text-danger font-bold mb-1">
                              Ghi chú sự cố
                            </p>
                            <p className="text-sm text-text-primary leading-relaxed">
                              {task.issueReason}
                              {task.issueNote ? ` • ${task.issueNote}` : ""}
                            </p>
                          </div>
                        ) : null}

                        <div className="grid grid-cols-2 gap-3">
                          {task.state === "pending" && (
                            <button
                              onClick={() => startTask(task.room.id)}
                              className="min-h-14 rounded-2xl bg-accent-primary text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-accent-primary/15 active:scale-[0.99] transition-transform"
                            >
                              <Play size={18} />
                              BẮT ĐẦU
                            </button>
                          )}

                          {task.state === "in_progress" && (
                            <button
                              onClick={() => openIssueSheet(task.room.id)}
                              className="min-h-14 rounded-2xl border border-border-subtle bg-bg-primary text-text-primary font-bold flex items-center justify-center gap-2 active:scale-[0.99] transition-transform"
                            >
                              <TriangleAlert
                                size={18}
                                className="text-warning"
                              />
                              BÁO SỰ CỐ
                            </button>
                          )}

                          {task.state === "issue" && (
                            <button
                              onClick={() => resolveIssue(task.room.id)}
                              className="min-h-14 rounded-2xl border border-border-subtle bg-bg-primary text-text-primary font-bold flex items-center justify-center gap-2 active:scale-[0.99] transition-transform"
                            >
                              <RefreshCw
                                size={18}
                                className="text-accent-primary"
                              />
                              XỬ LÝ XONG
                            </button>
                          )}

                          <button
                            onClick={() => completeTask(task.room.id)}
                            className="min-h-14 rounded-2xl bg-success text-black font-bold flex items-center justify-center gap-2 shadow-lg shadow-success/10 active:scale-[0.99] transition-transform"
                          >
                            <CheckCircle2 size={18} />
                            HOÀN TẤT
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          )}

          {activeTab === "alerts" && (
            <div className="space-y-4">
              <section className="rounded-[1.75rem] border border-border-subtle bg-bg-secondary/80 p-4">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-text-muted font-bold mb-1">
                      Thông báo
                    </p>
                    <h3 className="text-xl text-text-primary font-bold">
                      Nhật ký gần đây
                    </h3>
                  </div>
                  <Bell size={18} className="text-accent-primary" />
                </div>

                <div className="space-y-3">
                  {feed.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-2xl border p-3 ${item.tone === "success" ? "bg-success/8 border-success/15" : item.tone === "warning" ? "bg-warning/8 border-warning/15" : "bg-accent-primary/8 border-accent-primary/15"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[11px] uppercase tracking-wider font-bold mb-1 text-text-muted">
                            {item.label}
                          </p>
                          <p className="text-sm text-text-primary leading-relaxed">
                            {item.message}
                          </p>
                        </div>
                        <span className="text-[11px] font-mono text-text-muted shrink-0">
                          {item.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[1.75rem] border border-border-subtle bg-bg-secondary/70 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <TriangleAlert size={18} className="text-warning" />
                  <h3 className="text-lg text-text-primary font-bold">
                    Gợi ý thao tác
                  </h3>
                </div>
                <ul className="space-y-2 text-sm text-text-secondary leading-relaxed">
                  <li>
                    Bắt đầu dọn trước khi báo sự cố để có nhật ký rõ ràng.
                  </li>
                  <li>
                    Hoàn tất chỉ khi phòng đã sạch và không còn lỗi cần xử lý.
                  </li>
                  <li>
                    Dùng tab này để kiểm tra lại những phòng vừa làm xong hoặc
                    đang bị treo.
                  </li>
                </ul>
              </section>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="space-y-4">
              <section className="rounded-[1.75rem] border border-border-subtle bg-bg-secondary/80 p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-accent-primary/12 text-accent-primary border border-accent-primary/20 flex items-center justify-center shrink-0">
                    <UserRound size={22} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-wider text-text-muted font-bold mb-1">
                      Nhân viên
                    </p>
                    <h3 className="text-xl text-text-primary font-bold truncate">
                      {user.name}
                    </h3>
                    <p className="text-sm text-text-secondary truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-bg-primary border border-border-subtle p-3">
                    <p className="text-[11px] uppercase tracking-wider text-text-muted font-bold mb-1">
                      Vai trò
                    </p>
                    <p className="text-sm text-text-primary font-bold capitalize">
                      {user.role}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-bg-primary border border-border-subtle p-3">
                    <p className="text-[11px] uppercase tracking-wider text-text-muted font-bold mb-1">
                      Phòng còn lại
                    </p>
                    <p className="text-sm text-text-primary font-bold">
                      {tasks.length}
                    </p>
                  </div>
                </div>
              </section>

              <button
                onClick={() => logout()}
                className="w-full min-h-14 rounded-2xl bg-accent-primary text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-accent-primary/15"
              >
                <LogOut size={18} />
                ĐĂNG XUẤT
              </button>
            </div>
          )}
        </main>

        <nav className="shrink-0 absolute bottom-0 left-0 right-0 bg-bg-secondary/96 backdrop-blur-xl border-t border-border-subtle px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] z-30">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setActiveTab("tasks")}
              className={`min-h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === "tasks" ? "bg-accent-primary text-white" : "bg-bg-primary text-text-muted border border-border-subtle"}`}
            >
              <Brush size={20} />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Phòng
              </span>
            </button>
            <button
              onClick={() => setActiveTab("alerts")}
              className={`min-h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === "alerts" ? "bg-accent-primary text-white" : "bg-bg-primary text-text-muted border border-border-subtle"}`}
            >
              <Bell size={20} />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Thông báo
              </span>
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`min-h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === "profile" ? "bg-accent-primary text-white" : "bg-bg-primary text-text-muted border border-border-subtle"}`}
            >
              <UserRound size={20} />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Cá nhân
              </span>
            </button>
          </div>
        </nav>
      </div>

      {currentIssueTask && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 backdrop-blur-sm px-0 sm:px-4">
          <div className="w-full sm:max-w-md rounded-t-[2rem] sm:rounded-3xl border border-border-subtle bg-bg-card shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-border-subtle bg-gradient-to-r from-danger/12 to-accent-primary/8">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-text-muted font-bold mb-1">
                    Báo sự cố
                  </p>
                  <h3 className="text-xl text-text-primary font-bold truncate">
                    {currentIssueTask.room.id}
                  </h3>
                  <p className="text-sm text-text-secondary truncate">
                    {currentIssueTask.room.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIssueTaskId(null)}
                  className="w-10 h-10 rounded-2xl bg-bg-primary border border-border-subtle flex items-center justify-center text-text-muted"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-text-muted font-bold mb-2">
                  Chọn lý do
                </p>
                <div className="flex flex-wrap gap-2">
                  {ISSUE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setIssueReason(preset)}
                      className={`px-3 py-2 rounded-full text-sm border transition-colors ${issueReason === preset ? "bg-danger text-white border-danger" : "bg-bg-secondary text-text-secondary border-border-subtle"}`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wider text-text-muted font-bold mb-2">
                  Ghi chú thêm
                </p>
                <textarea
                  value={issueNote}
                  onChange={(event) => setIssueNote(event.target.value)}
                  rows={4}
                  className="input-field min-h-28 resize-none"
                  placeholder="Ví dụ: cần thay khăn, đèn phòng không sáng, kiểm tra điều hòa..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIssueTaskId(null)}
                  className="min-h-14 rounded-2xl border border-border-subtle bg-bg-secondary text-text-primary font-bold"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={submitIssue}
                  className="min-h-14 rounded-2xl bg-danger text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-danger/15"
                >
                  <TriangleAlert size={18} />
                  GỬI BÁO CÁO
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

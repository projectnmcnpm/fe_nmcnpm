"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Film, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const isRegisterParam = searchParams.get("register") === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [isRegistering, setIsRegistering] = useState(isRegisterParam);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsRegistering(searchParams.get("register") === "true");
  }, [searchParams]);

  const { login, register } = useAuth();
  const router = useRouter();
  const roleRouteMap = {
    customer: "/",
    receptionist: "/staff/dashboard",
    cleaner: "/cleaner/dashboard",
    manager: "/admin/dashboard",
  } as const;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (
        !email ||
        !password ||
        (isRegistering && (!name || !confirmPassword))
      ) {
        triggerError("Vui lòng nhập đầy đủ thông tin");
        return;
      }

      if (isRegistering && password !== confirmPassword) {
        triggerError("Mật khẩu xác nhận không khớp");
        return;
      }

      const user = isRegistering
        ? await register(name, email, password)
        : await login(email, password);

      router.push(roleRouteMap[user.role]);
    } catch (submissionError) {
      const message =
        submissionError instanceof Error && submissionError.message
          ? submissionError.message
          : "Đăng nhập thất bại, vui lòng thử lại";
      triggerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerError = (msg: string) => {
    setError(msg);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-bg-primary">
      {/* Left Side - Visual */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden items-center justify-center">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=2070&auto=format&fit=crop")',
          }}
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-bg-primary via-bg-primary/80 to-transparent" />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-transparent to-bg-primary" />

        <div className="relative z-20 text-center p-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent-primary/20 text-accent-primary mb-6 backdrop-blur-sm border border-accent-primary/30">
            <Film size={40} />
          </div>
          <h1 className="text-6xl md:text-7xl text-text-primary mb-4 drop-shadow-lg">
            GENZ CINEMA
          </h1>
          <p className="text-xl text-text-secondary font-light tracking-wide">
            Trải nghiệm lưu trú theo phong cách điện ảnh
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-bg-secondary">
        <div
          className={`w-full max-w-md transition-transform ${isShaking ? "animate-[shake_0.5s_ease-in-out]" : ""}`}
        >
          <div className="md:hidden flex items-center gap-3 mb-8">
            <Film className="text-accent-primary" size={32} />
            <h1 className="text-4xl text-text-primary">GENZ CINEMA</h1>
          </div>

          <h2 className="text-4xl text-text-primary mb-8 text-center">
            {isRegistering ? "ĐĂNG KÝ TÀI KHOẢN" : "ĐĂNG NHẬP"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isRegistering && (
              <div className="space-y-2">
                <label className="text-sm text-text-secondary font-medium">
                  Họ và tên
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted">
                    <Film size={20} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field pl-12"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm text-text-secondary font-medium">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-12"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-text-secondary font-medium">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-12 pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {isRegistering && (
              <div className="space-y-2">
                <label className="text-sm text-text-secondary font-medium">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field pl-12 pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-muted hover:text-text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-accent-primary text-sm bg-accent-primary/10 p-3 rounded-md border border-accent-primary/20">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {!isRegistering && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-border-subtle bg-bg-primary text-accent-primary focus:ring-accent-primary focus:ring-offset-bg-secondary"
                  />
                  <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                    Ghi nhớ đăng nhập
                  </span>
                </label>
                <a
                  href="#"
                  className="text-sm text-accent-primary hover:text-red-400 transition-colors"
                >
                  Quên mật khẩu?
                </a>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "ĐANG XỬ LÝ..."
                : isRegistering
                  ? "ĐĂNG KÝ"
                  : "ĐĂNG NHẬP"}
            </button>

            <p className="text-text-secondary text-center">
              {isRegistering ? "Đã có tài khoản? " : "Chưa có tài khoản? "}
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError("");
                }}
                className="text-accent-primary hover:underline font-bold"
              >
                {isRegistering ? "Đăng nhập ngay" : "Đăng ký ngay"}
              </button>
            </p>
          </form>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
        }
      `,
        }}
      />
      <style jsx global>{`
        footer {
          display: none !important;
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg-primary flex items-center justify-center text-text-primary">
          Đang tải...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

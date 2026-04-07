'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Film, Facebook, Instagram, Youtube, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/staff') || pathname?.startsWith('/cleaner')) {
    return null;
  }

  return (
    <footer className="bg-bg-secondary border-t border-border-subtle mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 group mb-4">
              <div className="text-accent-primary group-hover:scale-110 transition-transform">
                <Film size={28} />
              </div>
              <span className="font-display text-2xl tracking-wider text-text-primary">GENZ CINEMA</span>
            </Link>
            <p className="text-text-secondary text-sm mb-6">
              Trải nghiệm lưu trú theo phong cách điện ảnh. Không gian riêng tư, tiện nghi hiện đại, mang đến cho bạn những phút giây thư giãn tuyệt vời.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-text-muted hover:text-accent-primary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-text-muted hover:text-accent-neon transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-text-muted hover:text-accent-primary transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-text-primary font-bold mb-4 uppercase tracking-wider text-sm">Liên kết nhanh</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-text-secondary hover:text-accent-neon transition-colors text-sm">Trang chủ</Link></li>
              <li><Link href="/rooms" className="text-text-secondary hover:text-accent-neon transition-colors text-sm">Danh sách phòng</Link></li>
              <li><Link href="/history" className="text-text-secondary hover:text-accent-neon transition-colors text-sm">Lịch sử đặt phòng</Link></li>
              <li><Link href="/login" className="text-text-secondary hover:text-accent-neon transition-colors text-sm">Đăng nhập</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-text-primary font-bold mb-4 uppercase tracking-wider text-sm">Chính sách</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-text-secondary hover:text-accent-neon transition-colors text-sm">Điều khoản sử dụng</a></li>
              <li><a href="#" className="text-text-secondary hover:text-accent-neon transition-colors text-sm">Chính sách bảo mật</a></li>
              <li><a href="#" className="text-text-secondary hover:text-accent-neon transition-colors text-sm">Chính sách hủy phòng</a></li>
              <li><a href="#" className="text-text-secondary hover:text-accent-neon transition-colors text-sm">Hướng dẫn thanh toán</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-text-primary font-bold mb-4 uppercase tracking-wider text-sm">Liên hệ</h3>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-accent-primary shrink-0 mt-0.5" />
                <span className="text-text-secondary text-sm">Kim Mã, Ba Đình<br/>Mỹ Đình, Nam Từ Liêm<br/>Ngọc Lâm, Long Biên</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-accent-primary shrink-0" />
                <span className="text-text-secondary text-sm">090 123 4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-accent-primary shrink-0" />
                <span className="text-text-secondary text-sm">hello@genzcinema.com</span>
              </li>
            </ul>

            <h3 className="text-text-primary font-bold mb-4 uppercase tracking-wider text-sm">Đăng ký nhận tin</h3>
            <form 
              className="flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                alert('Cảm ơn bạn đã đăng ký nhận bản tin!');
              }}
            >
              <input 
                type="email" 
                required
                placeholder="Email của bạn" 
                className="w-full bg-bg-primary border border-border-subtle rounded-md py-2 px-3 text-text-primary focus:outline-none focus:border-accent-neon text-sm"
              />
              <button type="submit" className="bg-accent-primary text-white font-bold py-2 px-4 rounded-md hover:bg-red-600 transition-all text-sm uppercase">Đăng ký</button>
            </form>
          </div>
        </div>

        <div className="border-t border-border-subtle mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-text-muted text-sm">
            &copy; {new Date().getFullYear()} GenZ Cinema Homestay. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-text-muted">
            <span>Thiết kế với ❤️ dành cho GenZ</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

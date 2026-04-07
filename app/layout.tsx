import type { Metadata } from 'next';
import { Oswald, Inter, Fira_Code } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import Footer from '@/components/layout/Footer';

const oswald = Oswald({ 
  subsets: ['latin'],
  variable: '--font-display'
});

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-body'
});

const firaCode = Fira_Code({ 
  subsets: ['latin'],
  variable: '--font-mono'
});

export const metadata: Metadata = {
  title: 'GenZ Cinema Homestay',
  description: 'Trải nghiệm lưu trú theo phong cách điện ảnh',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="vi" className={`${oswald.variable} ${inter.variable} ${firaCode.variable}`}>
      <body className="bg-bg-primary text-text-primary min-h-screen flex flex-col" suppressHydrationWarning>
        <AuthProvider>
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

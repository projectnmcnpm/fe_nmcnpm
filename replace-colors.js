const fs = require('fs');

const files = [
  'app/rooms/[id]/page.tsx',
  'app/history/page.tsx',
  'app/rooms/page.tsx',
  'app/page.tsx',
  'app/admin/bookings/edit/[id]/page.tsx',
  'app/admin/bookings/page.tsx',
  'app/admin/bookings/add/page.tsx',
  'app/admin/dashboard/page.tsx',
  'app/admin/accounts/page.tsx',
  'app/admin/rooms/page.tsx',
  'app/admin/rooms/edit/[id]/page.tsx',
  'app/admin/rooms/add/page.tsx',
  'app/admin/customers/page.tsx',
  'app/staff/dashboard/page.tsx',
  'app/staff/customers/page.tsx',
  'app/staff/rooms/page.tsx',
  'app/staff/bookings/add/page.tsx',
  'app/staff/bookings/page.tsx',
  'app/staff/bookings/edit/[id]/page.tsx',
  'app/login/page.tsx',
  'app/cleaner/dashboard/page.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    // Replace text-white with text-text-primary, except where it makes sense to keep white (like on buttons or badges)
    // Actually, let's just replace text-white with text-text-primary for headings and main text.
    // A simpler regex: replace `text-white` with `text-text-primary` globally, then we can fix buttons if needed.
    // Wait, the user said "sửa lại color chữ để phù hợp với backgroud , chứ h khó nhìn quá"
    // So replacing text-white with text-text-primary is exactly what we need.
    content = content.replace(/text-white/g, 'text-text-primary');
    // For buttons that have bg-accent-primary, we might want text-white back.
    // Let's just do a global replace first.
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});

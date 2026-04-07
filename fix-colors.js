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
    content = content.replace(/bg-accent-primary text-text-primary/g, 'bg-accent-primary text-white');
    content = content.replace(/bg-danger text-text-primary/g, 'bg-danger text-white');
    content = content.replace(/bg-success text-text-primary/g, 'bg-success text-white');
    content = content.replace(/bg-black\/70 backdrop-blur-sm text-text-primary/g, 'bg-black/70 backdrop-blur-sm text-white');
    content = content.replace(/bg-black\/50 hover:bg-danger text-text-primary/g, 'bg-black/50 hover:bg-danger text-white');
    fs.writeFileSync(file, content);
    console.log(`Fixed ${file}`);
  }
});

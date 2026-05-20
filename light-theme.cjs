const fs = require('fs');
const path = require('path');

function replaceTokens(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/bg-dark-900/g, 'bg-brand-light');
  content = content.replace(/bg-dark-800/g, 'bg-brand-white');
  content = content.replace(/text-white\/60/g, 'text-brand-muted');
  content = content.replace(/text-white\/40/g, 'text-brand-muted');
  content = content.replace(/text-white\/80/g, 'text-brand-dark');
  content = content.replace(/text-white/g, 'text-brand-dark');
  content = content.replace(/border-white\/10/g, 'border-brand-border');
  content = content.replace(/border-white\/5/g, 'border-brand-border');
  content = content.replace(/border-white/g, 'border-brand-dark');
  content = content.replace(/bg-white\/10/g, 'bg-brand-gray');
  content = content.replace(/bg-white\/5/g, 'bg-brand-gray');
  content = content.replace(/text-dark-900/g, 'text-brand-white');

  // Specific button styling replacement
  content = content.replace(/bg-white text-dark-900/g, 'bg-brand-dark text-brand-white');
  content = content.replace(/hover:text-dark-900/g, 'hover:text-brand-white');
  content = content.replace(/hover:bg-white/g, 'hover:bg-brand-dark');
  
  fs.writeFileSync(filePath, content, 'utf8');
}

['ProductDetails.tsx', 'Checkout.tsx', 'UserDashboard.tsx', 'AdminDashboard.tsx'].forEach(file => {
  replaceTokens(path.join(__dirname, 'src/pages', file));
});

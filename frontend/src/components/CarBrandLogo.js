import React, { useState } from 'react';

// Simple Icons CDN slugs (verified working)
const SI_SLUGS = {
  'bmw': 'bmw',
  'audi': 'audi',
  'volkswagen': 'volkswagen',
  'vw': 'volkswagen',
  'porsche': 'porsche',
  'tesla': 'tesla',
  'toyota': 'toyota',
  'volvo': 'volvo',
  'bentley': 'bentley',
  'rolls-royce': 'rollsroyce',
  'rolls royce': 'rollsroyce',
  'honda': 'honda',
  'ford': 'ford',
  'peugeot': 'peugeot',
  'renault': 'renault',
  'citroen': 'citroen',
  'citroën': 'citroen',
  'fiat': 'fiat',
  'hyundai': 'hyundai',
  'kia': 'kia',
  'mazda': 'mazda',
  'nissan': 'nissan',
  'opel': 'opel',
  'skoda': 'skoda',
  'seat': 'seat',
  'mini': 'mini',
  'maserati': 'maserati',
  'ferrari': 'ferrari',
  'lamborghini': 'lamborghini',
  'aston martin': 'astonmartin',
  'subaru': 'subaru',
  'suzuki': 'suzuki',
  'dacia': 'dacia',
  'polestar': 'polestar',
};

// Custom SVG data URIs for brands NOT on Simple Icons (transparent, mono)
const CUSTOM_LOGOS = {
  'mercedes': `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="%23D9F99D" stroke-width="5"/><circle cx="50" cy="50" r="38" fill="none" stroke="%23D9F99D" stroke-width="2"/><path d="M50 12 L50 50 L16 74" fill="none" stroke="%23D9F99D" stroke-width="5" stroke-linecap="round"/><path d="M50 50 L84 74" fill="none" stroke="%23D9F99D" stroke-width="5" stroke-linecap="round"/><path d="M16 74 L84 74" fill="none" stroke="%23D9F99D" stroke-width="5" stroke-linecap="round"/></svg>')}`,
  'jaguar': `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><path d="M10 30 C10 15 25 8 40 12 C48 14 52 18 58 18 C65 18 72 14 80 12 C90 9 98 18 95 28 C92 38 82 45 70 42 C62 40 58 35 50 35 C42 35 38 40 30 42 C18 45 8 38 10 30Z" fill="%23D9F99D"/></svg>')}`,
  'lexus': `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><ellipse cx="50" cy="50" rx="45" ry="30" fill="none" stroke="%23D9F99D" stroke-width="4"/><path d="M30 25 L50 75 L70 25" fill="none" stroke="%23D9F99D" stroke-width="5" stroke-linejoin="round"/></svg>')}`,
  'alfa romeo': `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="%23D9F99D" stroke-width="4"/><line x1="50" y1="4" x2="50" y2="96" stroke="%23D9F99D" stroke-width="3"/><path d="M50 20 C35 30 25 42 25 55 C25 65 35 72 50 72" fill="none" stroke="%23D9F99D" stroke-width="3"/><path d="M50 25 L55 35 L65 35 L57 42 L60 52 L50 46 L40 52 L43 42 L35 35 L45 35Z" fill="%23D9F99D"/></svg>')}`,
  'genesis': `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 5 C25 5 5 25 5 50 L50 50 L95 50 C95 25 75 5 50 5Z" fill="none" stroke="%23D9F99D" stroke-width="4"/><path d="M5 50 C5 75 25 95 50 95 C75 95 95 75 95 50" fill="none" stroke="%23D9F99D" stroke-width="4"/><circle cx="50" cy="50" r="8" fill="%23D9F99D"/></svg>')}`,
  'land rover': `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60"><ellipse cx="60" cy="30" rx="56" ry="26" fill="none" stroke="%23D9F99D" stroke-width="4"/><text x="60" y="36" text-anchor="middle" fill="%23D9F99D" font-size="16" font-family="sans-serif" font-weight="bold">LAND ROVER</text></svg>')}`,
  'range rover': `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60"><ellipse cx="60" cy="30" rx="56" ry="26" fill="none" stroke="%23D9F99D" stroke-width="4"/><text x="60" y="36" text-anchor="middle" fill="%23D9F99D" font-size="14" font-family="sans-serif" font-weight="bold">RANGE ROVER</text></svg>')}`,
  'ds': `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50" y="62" text-anchor="middle" fill="%23D9F99D" font-size="45" font-family="serif" font-weight="bold">DS</text></svg>')}`,
  'cupra': `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80"><path d="M10 40 L30 10 L70 10 L90 40 L70 70 L30 70Z" fill="none" stroke="%23D9F99D" stroke-width="5"/><path d="M25 40 L40 20 L60 20 L75 40 L60 60 L40 60Z" fill="none" stroke="%23D9F99D" stroke-width="3"/></svg>')}`,
  'smart': `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="%23D9F99D" stroke-width="4"/><path d="M30 55 Q40 35 50 40 Q60 35 70 55" fill="none" stroke="%23D9F99D" stroke-width="5" stroke-linecap="round"/></svg>')}`,
  'chevrolet': `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><rect x="5" y="20" width="90" height="20" fill="none" stroke="%23D9F99D" stroke-width="4"/><rect x="25" y="10" width="50" height="40" fill="none" stroke="%23D9F99D" stroke-width="3"/></svg>')}`,
};

// Alias mapping
const ALIASES = {
  'mercedes-benz': 'mercedes',
  'vw': 'volkswagen',
  'rolls royce': 'rolls-royce',
  'citroën': 'citroen',
  'range rover': 'range rover',
};

const ACCENT_HEX = 'D9F99D';

function getLogoUrl(brand) {
  const key = brand.toLowerCase().trim();
  const aliased = ALIASES[key] || key;

  // Check Simple Icons first
  const slug = SI_SLUGS[aliased] || SI_SLUGS[key];
  if (slug) return `https://cdn.simpleicons.org/${slug}/${ACCENT_HEX}`;

  // Check custom logos
  const custom = CUSTOM_LOGOS[aliased] || CUSTOM_LOGOS[key];
  if (custom) return custom;

  return null;
}

function getInitials(brand) {
  const words = brand.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return brand.substring(0, 2).toUpperCase();
}

export default function CarBrandLogo({ brand, size = 'md', className = '' }) {
  const [imgFailed, setImgFailed] = useState(false);
  const logoUrl = getLogoUrl(brand);

  const sizes = {
    sm: { box: 'w-8 h-8', img: 'w-5 h-5', text: 'text-[10px]' },
    md: { box: 'w-10 h-10', img: 'w-6 h-6', text: 'text-xs' },
    lg: { box: 'w-14 h-14', img: 'w-9 h-9', text: 'text-base' },
  };
  const s = sizes[size] || sizes.md;

  if (logoUrl && !imgFailed) {
    return (
      <div className={`${s.box} flex items-center justify-center flex-shrink-0 ${className}`}>
        <img
          src={logoUrl}
          alt={brand}
          className={`${s.img} object-contain`}
          loading="lazy"
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }

  return (
    <div className={`${s.box} flex items-center justify-center flex-shrink-0 ${className}`}>
      <span className={`font-bold ${s.text} text-[#D9F99D]`} style={{ fontFamily: 'Chivo, sans-serif' }}>
        {getInitials(brand)}
      </span>
    </div>
  );
}

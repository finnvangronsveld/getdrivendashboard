import React from 'react';

// Inline SVG paths for common car brands - clean, scalable, no background
const BRAND_SVGS = {
  'mercedes': (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 1.5c4.69 0 8.5 3.81 8.5 8.5 0 4.69-3.81 8.5-8.5 8.5S3.5 16.69 3.5 12 7.31 3.5 12 3.5zM12 5l-5.5 9.5H12V5zm0 0v9.5h5.5L12 5zm-5.5 9.5L12 19l5.5-4.5H6.5z"/>
    </svg>
  ),
  'bmw': (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 1.5c4.69 0 8.5 3.81 8.5 8.5 0 4.69-3.81 8.5-8.5 8.5S3.5 16.69 3.5 12 7.31 3.5 12 3.5zM12 4.5v7.5h7.5c0-4.14-3.36-7.5-7.5-7.5zm0 15c4.14 0 7.5-3.36 7.5-7.5H12v7.5zM4.5 12c0 4.14 3.36 7.5 7.5 7.5V12H4.5zm0 0h7.5V4.5C7.86 4.5 4.5 7.86 4.5 12z"/>
    </svg>
  ),
  'audi': (
    <svg viewBox="0 0 48 16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="8" cy="8" r="6.5"/>
      <circle cx="18" cy="8" r="6.5"/>
      <circle cx="28" cy="8" r="6.5"/>
      <circle cx="38" cy="8" r="6.5"/>
    </svg>
  ),
  'volkswagen': (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 1.5c4.69 0 8.5 3.81 8.5 8.5 0 4.69-3.81 8.5-8.5 8.5S3.5 16.69 3.5 12 7.31 3.5 12 3.5zM8.5 7l1.5 4.5L12 7l2 4.5L15.5 7l-1 3-2.5 7.5L9.5 10 8.5 7z"/>
    </svg>
  ),
  'porsche': (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 1.5c4.69 0 8.5 3.81 8.5 8.5 0 4.69-3.81 8.5-8.5 8.5S3.5 16.69 3.5 12 7.31 3.5 12 3.5zM9 8v8h6V8H9zm1.5 1.5h3v2h-3v-2zm0 3h3v2h-3v-2z"/>
    </svg>
  ),
  'tesla': (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L3 6.5l1.2 1.8L12 5l7.8 3.3L21 6.5 12 2zm0 4.5L5.5 9.5 12 22l6.5-12.5L12 6.5z"/>
    </svg>
  ),
  'toyota': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="12" cy="12" rx="10" ry="6"/>
      <ellipse cx="12" cy="12" rx="5.5" ry="9.5"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
    </svg>
  ),
  'volvo': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9.5"/>
      <line x1="12" y1="2.5" x2="18" y2="2.5"/>
      <line x1="21.5" y1="12" x2="15" y2="6"/>
    </svg>
  ),
  'ford': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="12" cy="12" rx="10" ry="6"/>
      <text x="12" y="14.5" textAnchor="middle" fill="currentColor" fontSize="7" fontFamily="serif" fontStyle="italic" stroke="none">Ford</text>
    </svg>
  ),
  'peugeot': (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2c-.5 0-1 .2-1.3.6L8 6.5C7 8 7.5 10 9 11l-1 4.5c-.3 1 .2 2 1 2.5l3 2 3-2c.8-.5 1.3-1.5 1-2.5L15 11c1.5-1 2-3 1-4.5L13.3 2.6C13 2.2 12.5 2 12 2z"/>
    </svg>
  ),
  'renault': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M12 3L6 12l6 9 6-9-6-9z"/>
    </svg>
  ),
  'hyundai': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="12" cy="12" rx="10" ry="7"/>
      <path d="M7 9c2 3 3 4 5 5m5-5c-2 3-3 4-5 5" fill="none"/>
    </svg>
  ),
  'kia': (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M2 8l4 8h2l2-4 2 4h2l2-4 2 4h2l4-8h-3l-2 4-2-4h-2l-2 4-2-4H9L7 12 5 8H2z"/>
    </svg>
  ),
  'lexus': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="12" cy="12" rx="10" ry="7"/>
      <path d="M8 7l4 10 4-10" fill="none"/>
    </svg>
  ),
  'jaguar': (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 10c0-1 .5-2 1.5-2.5C7 7 9 7 10 7.5c1 .5 2 1.5 3 1.5s2-1 3-1.5c1-.5 3-.5 4.5 0C21.5 8 22 9 22 10c0 2-1.5 4-4 5-1 .5-2 1-3 1.5-.5.3-1 .5-1.5 1L12 19l-1.5-1.5c-.5-.5-1-.7-1.5-1-1-.5-2-1-3-1.5-2.5-1-4-3-4-5z"/>
    </svg>
  ),
  'land rover': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="12" cy="12" rx="10" ry="5"/>
      <ellipse cx="12" cy="12" rx="7" ry="3.5"/>
    </svg>
  ),
  'nissan': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9.5"/>
      <line x1="2.5" y1="12" x2="21.5" y2="12"/>
    </svg>
  ),
  'opel': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9.5"/>
      <path d="M2.5 12h6l3.5-5 3.5 5h6"/>
    </svg>
  ),
  'fiat': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9.5"/>
      <path d="M7 8h10M7 12h10M7 16h10"/>
    </svg>
  ),
  'mazda': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="12" cy="12" rx="10" ry="6"/>
      <path d="M5 12c3-3.5 4.5-4 7-4s4 .5 7 4" fill="none"/>
    </svg>
  ),
  'honda': (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 7v10h2V7h3v10h2V7h2v10h2V7h3v10h2V7c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2z"/>
    </svg>
  ),
  'skoda': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9.5"/>
      <path d="M7 10l5-4 5 4M7 14l5 4 5-4"/>
    </svg>
  ),
  'seat': (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M2 12c0-1 .5-2 1.5-2.5l7-3c1-.5 2-.5 3 0l7 3c1 .5 1.5 1.5 1.5 2.5s-.5 2-1.5 2.5l-7 3c-1 .5-2 .5-3 0l-7-3C2.5 14 2 13 2 12z"/>
    </svg>
  ),
  'mini': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9.5"/>
      <circle cx="12" cy="12" r="4"/>
    </svg>
  ),
  'bentley': (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 6c-1 0-1.5.5-1.5 1.5V12l-6-3v2l6 3v1l-6 3v2l7.5-4 7.5 4v-2l-6-3v-1l6-3v-2l-6 3V7.5C13.5 6.5 13 6 12 6z"/>
    </svg>
  ),
  'rolls-royce': (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 4v16h2V13h2v7h2v-7h2v7h2V4h-2v7h-2V4h-2v7H9V4H7z"/>
    </svg>
  ),
  'ferrari': (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3c-2 0-3.5 1-4 2.5L6 9l-2 1.5c-.5.5-.5 1 0 1.5l3 3c.5.5 1 .7 1.5.5l2-1 1.5 4c.3.8 1.2.8 1.5 0l1.5-4 2 1c.5.2 1 0 1.5-.5l3-3c.5-.5.5-1 0-1.5L20 9l-2-3.5C17.5 4 16 3 14 3h-2z"/>
    </svg>
  ),
  'lamborghini': (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M2 12l3-5h3l1 2h6l1-2h3l3 5-3 5h-3l-1-2H9l-1 2H5l-3-5zm4.5 0l1.5 2.5h8l1.5-2.5-1.5-2.5h-8L6.5 12z"/>
    </svg>
  ),
  'dacia': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 17V7h8l8 5-8 5H4z"/>
    </svg>
  ),
  'citroen': (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3L4 9l8 3-8 3 8 6 8-6-8-3 8-3-8-6z"/>
    </svg>
  ),
  'alfa romeo': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9.5"/>
      <line x1="12" y1="2.5" x2="12" y2="21.5"/>
      <path d="M12 6c-3 2-5 4-5 6s2 4 5 6"/>
      <path d="M12 6c3 2 5 4 5 6s-2 4-5 6"/>
    </svg>
  ),
  'maserati': (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3l-1 5-2-3-1 5-2-3v8c0 2 1.5 3 3 4l3 1 3-1c1.5-1 3-2 3-4V7l-2 3-1-5-2 3-1-5z"/>
    </svg>
  ),
  'subaru': (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <ellipse cx="12" cy="12" rx="10" ry="6.5" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="9" cy="10" r="1.2"/><circle cx="15" cy="10" r="1.2"/>
      <circle cx="7" cy="13" r="1"/><circle cx="12" cy="14" r="1"/><circle cx="17" cy="13" r="1"/>
    </svg>
  ),
  'suzuki': (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 5l7 6.5L19 5l-3 7.5L23 19l-7-6.5L9 19l3-7.5L5 5z"/>
    </svg>
  ),
  'genesis': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 3C8 3 4 7 4 12h16c0-5-4-9-8-9z"/>
      <path d="M4 12c0 5 4 9 8 9s8-4 8-9"/>
      <circle cx="12" cy="12" r="2" fill="currentColor"/>
    </svg>
  ),
  'cupra': (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 12l4-7h10l4 7-4 7H7l-4-7zm3 0l3-5h6l3 5-3 5H9l-3-5z"/>
    </svg>
  ),
};

// Alias mappings
const ALIASES = {
  'mercedes-benz': 'mercedes',
  'vw': 'volkswagen',
  'range rover': 'land rover',
  'rolls royce': 'rolls-royce',
  'citroën': 'citroen',
};

function getSvg(brand) {
  const key = brand.toLowerCase().trim();
  return BRAND_SVGS[key] || BRAND_SVGS[ALIASES[key]] || null;
}

function getInitials(brand) {
  const words = brand.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return brand.substring(0, 2).toUpperCase();
}

export default function CarBrandLogo({ brand, size = 'md', className = '' }) {
  const svg = getSvg(brand);

  const sizes = {
    sm: { box: 'w-8 h-8', icon: 'w-5 h-5', text: 'text-[10px]' },
    md: { box: 'w-10 h-10', icon: 'w-6 h-6', text: 'text-xs' },
    lg: { box: 'w-14 h-14', icon: 'w-9 h-9', text: 'text-base' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className={`${s.box} flex items-center justify-center flex-shrink-0 text-[#D9F99D] ${className}`}>
      {svg ? (
        <div className={`${s.icon}`}>{svg}</div>
      ) : (
        <span className={`font-bold ${s.text}`} style={{ fontFamily: 'Chivo, sans-serif' }}>
          {getInitials(brand)}
        </span>
      )}
    </div>
  );
}

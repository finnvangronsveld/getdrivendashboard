import React, { useState } from 'react';

// Simple Icons CDN slugs (verified working via curl)
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

// React SVG components for brands NOT on Simple Icons
const MercedesLogo = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="2" x2="12" y2="12" />
    <line x1="12" y1="12" x2="3.5" y2="17.5" />
    <line x1="12" y1="12" x2="20.5" y2="17.5" />
  </svg>
);

const JaguarLogo = () => (
  <svg viewBox="0 0 100 70" className="w-full h-full">
    <path d="M5 35 C5 15 20 5 40 10 C50 13 55 20 60 20 C70 20 78 13 88 10 C95 8 100 18 97 30 C94 42 82 50 68 47 C58 44 55 38 48 35 C42 38 35 44 28 47 C15 50 5 45 5 35Z" 
      fill="none" stroke="currentColor" strokeWidth="4"/>
  </svg>
);

const LexusLogo = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <ellipse cx="50" cy="50" rx="44" ry="28" fill="none" stroke="currentColor" strokeWidth="4"/>
    <path d="M32 28 L50 72 L68 28" fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round"/>
  </svg>
);

const AlfaRomeoLogo = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4"/>
    <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="3"/>
    <path d="M50 20 C30 32 22 45 22 55 C22 68 35 78 50 78" fill="none" stroke="currentColor" strokeWidth="3"/>
    <path d="M58 30 L62 38 L55 42 L58 48 L50 44 L42 48 L45 42 L38 38 L42 30 L50 34Z" fill="currentColor"/>
  </svg>
);

const GenesisLogo = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <path d="M50 8 C28 8 8 28 8 50" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
    <path d="M92 50 C92 28 72 8 50 8" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
    <path d="M8 50 C8 72 28 92 50 92 C72 92 92 72 92 50" fill="none" stroke="currentColor" strokeWidth="4"/>
    <line x1="8" y1="50" x2="92" y2="50" stroke="currentColor" strokeWidth="3"/>
    <circle cx="50" cy="50" r="6" fill="currentColor"/>
  </svg>
);

const LandRoverLogo = () => (
  <svg viewBox="0 0 120 60" className="w-full h-full">
    <ellipse cx="60" cy="30" rx="55" ry="25" fill="none" stroke="currentColor" strokeWidth="4"/>
    <ellipse cx="60" cy="30" rx="42" ry="18" fill="none" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const CUSTOM_COMPONENTS = {
  'mercedes': MercedesLogo,
  'mercedes-benz': MercedesLogo,
  'jaguar': JaguarLogo,
  'lexus': LexusLogo,
  'alfa romeo': AlfaRomeoLogo,
  'genesis': GenesisLogo,
  'land rover': LandRoverLogo,
  'range rover': LandRoverLogo,
};

const ACCENT_HEX = 'D9F99D';

function getInitials(brand) {
  const words = brand.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return brand.substring(0, 2).toUpperCase();
}

export default function CarBrandLogo({ brand, size = 'md', className = '' }) {
  const [imgFailed, setImgFailed] = useState(false);
  const key = brand.toLowerCase().trim();

  const sizes = {
    sm: { box: 'w-8 h-8', img: 'w-5 h-5', text: 'text-[10px]' },
    md: { box: 'w-10 h-10', img: 'w-6 h-6', text: 'text-xs' },
    lg: { box: 'w-14 h-14', img: 'w-9 h-9', text: 'text-base' },
  };
  const s = sizes[size] || sizes.md;

  // Check for custom SVG component first
  const CustomSvg = CUSTOM_COMPONENTS[key];
  if (CustomSvg) {
    return (
      <div className={`${s.box} flex items-center justify-center flex-shrink-0 text-[#D9F99D] ${className}`}>
        <div className={s.img}><CustomSvg /></div>
      </div>
    );
  }

  // Check Simple Icons CDN
  const slug = SI_SLUGS[key];
  if (slug && !imgFailed) {
    return (
      <div className={`${s.box} flex items-center justify-center flex-shrink-0 ${className}`}>
        <img
          src={`https://cdn.simpleicons.org/${slug}/${ACCENT_HEX}`}
          alt={brand}
          className={`${s.img} object-contain`}
          loading="lazy"
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }

  // Fallback: styled initials
  return (
    <div className={`${s.box} flex items-center justify-center flex-shrink-0 ${className}`}>
      <span className={`font-bold ${s.text} text-[#D9F99D]`} style={{ fontFamily: 'Chivo, sans-serif' }}>
        {getInitials(brand)}
      </span>
    </div>
  );
}

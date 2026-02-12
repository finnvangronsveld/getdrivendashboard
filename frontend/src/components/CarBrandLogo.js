import React, { useState } from 'react';

// Simple Icons CDN - transparent SVG logos in custom color
// Format: https://cdn.simpleicons.org/{slug}/{hexcolor}
const BRAND_SLUGS = {
  'mercedes': 'mercedes',
  'mercedes-benz': 'mercedes',
  'bmw': 'bmw',
  'audi': 'audi',
  'volkswagen': 'volkswagen',
  'vw': 'volkswagen',
  'porsche': 'porsche',
  'tesla': 'tesla',
  'toyota': 'toyota',
  'volvo': 'volvo',
  'jaguar': 'jaguar',
  'bentley': 'bentley',
  'rolls-royce': 'rollsroyce',
  'rolls royce': 'rollsroyce',
  'lexus': 'lexus',
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
  'alfa romeo': 'alfaromeo',
  'maserati': 'maserati',
  'ferrari': 'ferrari',
  'lamborghini': 'lamborghini',
  'aston martin': 'astonmartin',
  'genesis': 'genesis',
  'cadillac': 'cadillac',
  'infiniti': 'infiniti',
  'subaru': 'subaru',
  'suzuki': 'suzuki',
  'chevrolet': 'chevrolet',
  'dodge': 'dodge',
  'jeep': 'jeep',
  'buick': 'buick',
  'dacia': 'dacia',
  'smart': 'smart',
  'rivian': 'rivian',
  'polestar': 'polestar',
  'cupra': 'cupra',
  'land rover': 'landrover',
  'range rover': 'landrover',
  'ds': 'dsautomobiles',
  'lincoln': 'lincoln',
  'chrysler': 'chrysler',
  'lucid': 'lucidmotors',
  'mg': 'mg',
  'ram': 'ram',
  'acura': 'acura',
  'bugatti': 'bugatti',
  'alpine': 'alpine',
  'lancia': 'lancia',
  'saab': 'saab',
  'lotus': 'lotus',
  'mclaren': 'mclaren',
  'pagani': 'pagani',
  'koenigsegg': 'koenigsegg',
};

const ACCENT_HEX = 'D9F99D';

function getSlug(brand) {
  return BRAND_SLUGS[brand.toLowerCase().trim()] || null;
}

function getInitials(brand) {
  const words = brand.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return brand.substring(0, 2).toUpperCase();
}

export default function CarBrandLogo({ brand, size = 'md', className = '' }) {
  const [imgFailed, setImgFailed] = useState(false);
  const slug = getSlug(brand);

  const sizes = {
    sm: { box: 'w-8 h-8', img: 'w-5 h-5', text: 'text-[10px]' },
    md: { box: 'w-10 h-10', img: 'w-6 h-6', text: 'text-xs' },
    lg: { box: 'w-14 h-14', img: 'w-9 h-9', text: 'text-base' },
  };
  const s = sizes[size] || sizes.md;

  const logoUrl = slug ? `https://cdn.simpleicons.org/${slug}/${ACCENT_HEX}` : null;

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

import React, { useState } from 'react';

const BRAND_DOMAINS = {
  'mercedes': 'mercedes-benz.com',
  'mercedes-benz': 'mercedes-benz.com',
  'bmw': 'bmw.com',
  'audi': 'audi.com',
  'volkswagen': 'volkswagen.com',
  'vw': 'volkswagen.com',
  'porsche': 'porsche.com',
  'tesla': 'tesla.com',
  'toyota': 'toyota.com',
  'volvo': 'volvocars.com',
  'jaguar': 'jaguar.com',
  'land rover': 'landrover.com',
  'range rover': 'landrover.com',
  'bentley': 'bentleymotors.com',
  'rolls-royce': 'rolls-roycemotorcars.com',
  'rolls royce': 'rolls-roycemotorcars.com',
  'lexus': 'lexus.com',
  'honda': 'honda.com',
  'ford': 'ford.com',
  'peugeot': 'peugeot.com',
  'renault': 'renault.com',
  'citroen': 'citroen.com',
  'citroën': 'citroen.com',
  'fiat': 'fiat.com',
  'hyundai': 'hyundai.com',
  'kia': 'kia.com',
  'mazda': 'mazda.com',
  'nissan': 'nissan.com',
  'opel': 'opel.com',
  'skoda': 'skoda.com',
  'seat': 'seat.com',
  'mini': 'mini.com',
  'alfa romeo': 'alfaromeo.com',
  'maserati': 'maserati.com',
  'ferrari': 'ferrari.com',
  'lamborghini': 'lamborghini.com',
  'aston martin': 'astonmartin.com',
  'genesis': 'genesis.com',
  'cadillac': 'cadillac.com',
  'lincoln': 'lincoln.com',
  'infiniti': 'infiniti.com',
  'subaru': 'subaru.com',
  'suzuki': 'suzuki.com',
  'ds': 'dsautomobiles.com',
  'cupra': 'cupraofficial.com',
  'chevrolet': 'chevrolet.com',
  'dodge': 'dodge.com',
  'jeep': 'jeep.com',
  'chrysler': 'chrysler.com',
  'buick': 'buick.com',
  'dacia': 'dacia.com',
  'mg': 'mgmotor.eu',
  'smart': 'smart.com',
  'lucid': 'lucidmotors.com',
  'rivian': 'rivian.com',
  'polestar': 'polestar.com',
};

function getLogoDomain(brand) {
  return BRAND_DOMAINS[brand.toLowerCase().trim()] || null;
}

function getInitials(brand) {
  const words = brand.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return brand.substring(0, 2).toUpperCase();
}

// CSS filter chain to convert any color to #D9F99D (lime accent)
// brightness(0) → black, invert(1) → white, then sepia + hue-rotate + saturate to lime
const ACCENT_FILTER = 'brightness(0) invert(93%) sepia(28%) saturate(491%) hue-rotate(37deg) brightness(104%) contrast(97%)';

export default function CarBrandLogo({ brand, size = 'md', className = '' }) {
  const [imgFailed, setImgFailed] = useState(false);
  const domain = getLogoDomain(brand);

  const sizes = {
    sm: { box: 'w-8 h-8', img: 'w-5 h-5', text: 'text-[10px]' },
    md: { box: 'w-10 h-10', img: 'w-6 h-6', text: 'text-xs' },
    lg: { box: 'w-14 h-14', img: 'w-9 h-9', text: 'text-base' },
  };
  const s = sizes[size] || sizes.md;

  const logoUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : null;

  if (logoUrl && !imgFailed) {
    return (
      <div className={`${s.box} flex items-center justify-center flex-shrink-0 ${className}`}>
        <img
          src={logoUrl}
          alt={brand}
          className={`${s.img} object-contain`}
          loading="lazy"
          style={{ filter: ACCENT_FILTER }}
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

import React, { useState } from 'react';

// Using logo.dev API which supports CORS and has reliable car brand logos
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
  const key = brand.toLowerCase().trim();
  return BRAND_DOMAINS[key] || null;
}

function getInitials(brand) {
  const words = brand.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return brand.substring(0, 2).toUpperCase();
}

export default function CarBrandLogo({ brand, size = 'md', className = '' }) {
  const [imgFailed, setImgFailed] = useState(false);
  const domain = getLogoDomain(brand);

  const sizeClasses = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-14 h-14' };
  const textSizes = { sm: 'text-[10px]', md: 'text-xs', lg: 'text-base' };
  const imgSizes = { sm: 20, md: 24, lg: 36 };
  const sz = sizeClasses[size] || sizeClasses.md;
  const tsz = textSizes[size] || textSizes.md;
  const imgSz = imgSizes[size] || imgSizes.md;

  const logoUrl = domain ? `https://img.logo.dev/${domain}?token=pk_a8V0NDDqTkKXw3VLhB1jBA&size=${imgSz * 2}&format=png` : null;

  if (logoUrl && !imgFailed) {
    return (
      <div className={`${sz} rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden p-1.5 border border-white/5 ${className}`}>
        <img
          src={logoUrl}
          alt={brand}
          className="w-full h-full object-contain"
          loading="lazy"
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }

  return (
    <div className={`${sz} rounded-lg bg-[#D9F99D]/10 flex items-center justify-center border border-[#D9F99D]/20 ${className}`}>
      <span className={`font-bold ${tsz} text-[#D9F99D]`} style={{ fontFamily: 'Chivo, sans-serif' }}>
        {getInitials(brand)}
      </span>
    </div>
  );
}

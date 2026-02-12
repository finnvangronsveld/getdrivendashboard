import React from 'react';

const BRAND_LOGOS = {
  'mercedes': 'https://www.carlogos.org/car-logos/mercedes-benz-logo-2011-100x100.png',
  'mercedes-benz': 'https://www.carlogos.org/car-logos/mercedes-benz-logo-2011-100x100.png',
  'bmw': 'https://www.carlogos.org/car-logos/bmw-logo-2020-grey-100x100.png',
  'audi': 'https://www.carlogos.org/car-logos/audi-logo-2016-100x100.png',
  'volkswagen': 'https://www.carlogos.org/car-logos/volkswagen-logo-2019-100x100.png',
  'vw': 'https://www.carlogos.org/car-logos/volkswagen-logo-2019-100x100.png',
  'porsche': 'https://www.carlogos.org/car-logos/porsche-logo-2014-100x100.png',
  'tesla': 'https://www.carlogos.org/car-logos/tesla-logo-2007-100x100.png',
  'toyota': 'https://www.carlogos.org/car-logos/toyota-logo-2020-europe-100x100.png',
  'volvo': 'https://www.carlogos.org/car-logos/volvo-logo-2014-100x100.png',
  'jaguar': 'https://www.carlogos.org/car-logos/jaguar-logo-2012-100x100.png',
  'land rover': 'https://www.carlogos.org/car-logos/land-rover-logo-2020-100x100.png',
  'range rover': 'https://www.carlogos.org/car-logos/land-rover-logo-2020-100x100.png',
  'bentley': 'https://www.carlogos.org/car-logos/bentley-logo-2002-100x100.png',
  'rolls-royce': 'https://www.carlogos.org/car-logos/rolls-royce-logo-2020-100x100.png',
  'rolls royce': 'https://www.carlogos.org/car-logos/rolls-royce-logo-2020-100x100.png',
  'lexus': 'https://www.carlogos.org/car-logos/lexus-logo-2013-100x100.png',
  'honda': 'https://www.carlogos.org/car-logos/honda-logo-2000-100x100.png',
  'ford': 'https://www.carlogos.org/car-logos/ford-logo-2017-100x100.png',
  'peugeot': 'https://www.carlogos.org/car-logos/peugeot-logo-2010-100x100.png',
  'renault': 'https://www.carlogos.org/car-logos/renault-logo-2021-100x100.png',
  'citroen': 'https://www.carlogos.org/car-logos/citroen-logo-2022-100x100.png',
  'citroën': 'https://www.carlogos.org/car-logos/citroen-logo-2022-100x100.png',
  'fiat': 'https://www.carlogos.org/car-logos/fiat-logo-2020-100x100.png',
  'hyundai': 'https://www.carlogos.org/car-logos/hyundai-logo-2011-100x100.png',
  'kia': 'https://www.carlogos.org/car-logos/kia-logo-2021-100x100.png',
  'mazda': 'https://www.carlogos.org/car-logos/mazda-logo-2018-100x100.png',
  'nissan': 'https://www.carlogos.org/car-logos/nissan-logo-2020-100x100.png',
  'opel': 'https://www.carlogos.org/car-logos/opel-logo-2020-100x100.png',
  'skoda': 'https://www.carlogos.org/car-logos/skoda-logo-2016-100x100.png',
  'seat': 'https://www.carlogos.org/car-logos/seat-logo-2012-100x100.png',
  'mini': 'https://www.carlogos.org/car-logos/mini-logo-2018-100x100.png',
  'alfa romeo': 'https://www.carlogos.org/car-logos/alfa-romeo-logo-2015-100x100.png',
  'maserati': 'https://www.carlogos.org/car-logos/maserati-logo-2020-100x100.png',
  'ferrari': 'https://www.carlogos.org/car-logos/ferrari-logo-2002-100x100.png',
  'lamborghini': 'https://www.carlogos.org/car-logos/lamborghini-logo-1998-100x100.png',
  'aston martin': 'https://www.carlogos.org/car-logos/aston-martin-logo-2022-100x100.png',
  'genesis': 'https://www.carlogos.org/car-logos/genesis-logo-2020-100x100.png',
  'cadillac': 'https://www.carlogos.org/car-logos/cadillac-logo-2021-100x100.png',
  'lincoln': 'https://www.carlogos.org/car-logos/lincoln-logo-2019-100x100.png',
  'infiniti': 'https://www.carlogos.org/car-logos/infiniti-logo-2013-100x100.png',
  'subaru': 'https://www.carlogos.org/car-logos/subaru-logo-2019-100x100.png',
  'suzuki': 'https://www.carlogos.org/car-logos/suzuki-logo-2021-100x100.png',
  'ds': 'https://www.carlogos.org/car-logos/ds-automobiles-logo-2019-100x100.png',
  'cupra': 'https://www.carlogos.org/car-logos/cupra-logo-2018-100x100.png',
};

function getLogoUrl(brand) {
  const key = brand.toLowerCase().trim();
  return BRAND_LOGOS[key] || null;
}

function getInitials(brand) {
  return brand.charAt(0).toUpperCase();
}

export default function CarBrandLogo({ brand, size = 'md', className = '' }) {
  const logoUrl = getLogoUrl(brand);
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };
  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
  };
  const sz = sizeClasses[size] || sizeClasses.md;
  const tsz = textSizes[size] || textSizes.md;

  if (logoUrl) {
    return (
      <div className={`${sz} rounded-lg bg-white/10 flex items-center justify-center overflow-hidden p-1.5 ${className}`}>
        <img
          src={logoUrl}
          alt={brand}
          className="w-full h-full object-contain"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentNode.innerHTML = `<span class="font-bold ${tsz} text-[#D9F99D]">${getInitials(brand)}</span>`;
          }}
        />
      </div>
    );
  }

  return (
    <div className={`${sz} rounded-lg bg-[#D9F99D]/10 flex items-center justify-center ${className}`}>
      <span className={`font-bold ${tsz} text-[#D9F99D]`} style={{ fontFamily: 'Chivo, sans-serif' }}>
        {getInitials(brand)}
      </span>
    </div>
  );
}

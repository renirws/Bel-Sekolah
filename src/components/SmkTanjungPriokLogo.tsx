import React, { useState } from 'react';

interface SmkTanjungPriokLogoProps {
  className?: string;
  size?: number;
}

export default function SmkTanjungPriokLogo({ className = '', size = 52 }: SmkTanjungPriokLogoProps) {
  const [hasError, setHasError] = useState(false);
  const imageUrl = "https://docs.google.com/uc?export=view&id=1UByoLYzSNHMsoZzy8wKcMGKj3DnVpvjN";

  if (!hasError) {
    return (
      <img
        src={imageUrl}
        alt="SMK Tanjung Priok 1 Logo"
        width={size}
        height={size}
        className={`object-contain transition-transform hover:scale-105 duration-300 ${className}`}
        onError={() => setHasError(true)}
        referrerPolicy="no-referrer"
        id="school-logo-image"
      />
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={`select-none drop-shadow-sm ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      id="smk-logo-svg"
    >
      <defs>
        {/* Curved path for the top arched text */}
        <path
          id="smkTextPath"
          d="M 18,48 C 30,22 90,22 102,48"
          fill="none"
        />
      </defs>

      {/* 1. Outer Yellow Pentagonal Shield */}
      <path
        d="M 60,3 L 117,44 L 97,113 L 23,113 L 3,44 Z"
        fill="#FFE600"
        stroke="#0A1CBB"
        strokeWidth="2"
        strokeLinejoin="round"
        id="shield-outer"
      />

      {/* 2. Inner Light Blue/Cyan Pentagonal Shield */}
      <path
        d="M 60,8 L 111,44 L 93,107 L 27,107 L 9,44 Z"
        fill="#33E6FF"
        stroke="#0A1CBB"
        strokeWidth="1.5"
        strokeLinejoin="round"
        id="shield-inner"
      />

      {/* 3. Curved Text: SMK "TANJUNG PRIOK 1" */}
      <text
        fill="#000000"
        fontSize="7.2"
        fontWeight="bold"
        fontFamily="sans-serif"
        letterSpacing="0.2"
        id="curved-text-group"
      >
        <textPath href="#smkTextPath" startOffset="50%" textAnchor="middle">
          SMK "TANJUNG PRIOK 1"
        </textPath>
      </text>

      {/* 4. Center Black Gear (Roda Gigi) */}
      <g transform="translate(60, 68)" stroke="#000000" strokeWidth="1.2" fill="#000000" id="gear-group">
        <circle cx="0" cy="0" r="16" fill="none" strokeWidth="2.5" />
        
        {/* Teeth of the gear */}
        <rect x="-2.5" y="-21" width="5" height="6" rx="1" />
        <rect x="-2.5" y="15" width="5" height="6" rx="1" />
        <rect x="-21" y="-2.5" width="6" height="5" rx="1" />
        <rect x="15" y="-2.5" width="6" height="5" rx="1" />
        
        <g transform="rotate(30)">
          <rect x="-2.5" y="-21" width="5" height="6" rx="1" />
          <rect x="-2.5" y="15" width="5" height="6" rx="1" />
          <rect x="-21" y="-2.5" width="6" height="5" rx="1" />
          <rect x="15" y="-2.5" width="6" height="5" rx="1" />
        </g>
        
        <g transform="rotate(60)">
          <rect x="-2.5" y="-21" width="5" height="6" rx="1" />
          <rect x="-2.5" y="15" width="5" height="6" rx="1" />
          <rect x="-21" y="-2.5" width="6" height="5" rx="1" />
          <rect x="15" y="-2.5" width="6" height="5" rx="1" />
        </g>
      </g>

      {/* 5. Center Maritime Vessel Silhouette inside Gear */}
      {/* Dark blue vessel shape */}
      <path
        d="M 48,68 L 72,68 L 70,76 C 65,83 55,83 50,76 Z"
        fill="#0B1CBB"
        stroke="#0A1CBB"
        strokeWidth="0.5"
        id="ship-hull"
      />
      {/* Ship bridge / superstructure */}
      <rect x="54" y="58" width="12" height="10" rx="1" fill="#000088" id="ship-bridge" />
      <rect x="57" y="52" width="6" height="6" rx="0.5" fill="#0000D6" id="ship-tower" />
      <circle cx="60" cy="55" r="1.5" fill="#FFE600" id="ship-light" />

      {/* 6. Yellow Banner Ribbon at the bottom */}
      <g id="banner-group">
        {/* Ribbon back folds */}
        <path d="M 23,96 L 15,101 L 20,107 L 29,103 Z" fill="#B5A300" stroke="#0A1CBB" strokeWidth="1" />
        <path d="M 97,96 L 105,101 L 100,107 L 91,103 Z" fill="#B5A300" stroke="#0A1CBB" strokeWidth="1" />
        
        {/* Ribbon main body */}
        <path
          d="M 20,97 C 40,90 80,90 100,97 L 95,107 C 75,100 45,100 25,107 Z"
          fill="#FFE600"
          stroke="#0A1CBB"
          strokeWidth="1.2"
          strokeLinejoin="round"
          id="banner-ribbon"
        />
        
        {/* Banner Text: DIKANTARA */}
        <text
          x="60"
          y="102"
          fill="#000000"
          fontSize="6.2"
          fontWeight="bold"
          fontFamily="sans-serif"
          textAnchor="middle"
          letterSpacing="0.4"
          id="banner-text"
        >
          DIKANTARA
        </text>
      </g>
    </svg>
  );
}

import React from 'react';
import { Award } from 'lucide-react';
import SmkTanjungPriokLogo from './SmkTanjungPriokLogo';

export default function Logo() {
  return (
    <div className="flex items-center gap-3.5" id="app-logo-container">
      <div className="relative flex items-center justify-center transition-transform hover:scale-105" id="logo-icon-bg">
        <SmkTanjungPriokLogo size={48} />
      </div>
      <div>
        <h1 className="text-lg font-black tracking-tight text-slate-800 leading-tight" id="logo-title">
          Sistem Bel KBM <span className="text-indigo-600 block sm:inline font-bold text-lg">SMK Tanjung Priok 1</span>
        </h1>
        <p className="text-xxs text-indigo-600 font-extrabold tracking-wider uppercase flex items-center gap-1 mt-0.5" id="logo-subtitle">
          <Award className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
          SMK Tanjung Priok 1 Hebat!
        </p>
      </div>
    </div>
  );
}


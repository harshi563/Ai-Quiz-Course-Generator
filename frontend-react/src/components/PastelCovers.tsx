interface PastelCoverProps {
  index: number;
}

export function PastelCover({ index }: PastelCoverProps) {
  const variant = index % 3;

  if (variant === 0) {
    return (
      <div className="h-44 w-full overflow-hidden border-b border-slate-100 bg-gradient-to-br from-sky-50 via-blue-50/70 to-indigo-50">
        <svg viewBox="0 0 400 180" className="h-full w-full">
          <defs>
            <pattern id="grid0" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#dbeafe" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="400" height="180" fill="url(#grid0)" />
          <g stroke="#64748b" strokeWidth="1.2" fill="#ffffff" fillOpacity="0.85">
            <polygon points="110,60 155,38 200,60 155,82" />
            <polygon points="110,60 155,82 155,112 110,90" fill="#e0f2fe" />
            <polygon points="200,60 155,82 155,112 200,90" fill="#f1f5f9" />
            <polygon points="215,80 265,55 315,80 265,105" />
            <polygon points="215,80 265,105 265,138 215,113" fill="#dbeafe" />
            <polygon points="315,80 265,105 265,138 315,113" fill="#e2e8f0" />
            <path d="M180,70 L235,70" stroke="#3b82f6" strokeDasharray="4 3" />
            <circle cx="155" cy="60" r="4" fill="#3b82f6" />
            <circle cx="265" cy="80" r="4" fill="#6366f1" />
          </g>
        </svg>
      </div>
    );
  }

  if (variant === 1) {
    return (
      <div className="h-44 w-full overflow-hidden border-b border-slate-100 bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50">
        <svg viewBox="0 0 400 180" className="h-full w-full">
          <defs>
            <pattern id="grid1" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e0e7ff" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="400" height="180" fill="url(#grid1)" />
          <path
            d="M40,140 C120,140 130,35 200,35 C270,35 280,140 360,140"
            fill="none"
            stroke="#6366f1"
            strokeWidth="2.5"
          />
          <path
            d="M60,145 C130,145 145,65 200,65 C255,65 270,145 340,145"
            fill="#c7d2fe"
            fillOpacity="0.45"
            stroke="#818cf8"
            strokeWidth="1.5"
          />
          <circle cx="200" cy="35" r="5" fill="#4f46e5" />
          <circle cx="150" cy="78" r="4" fill="#a855f7" />
          <circle cx="250" cy="78" r="4" fill="#a855f7" />
        </svg>
      </div>
    );
  }

  return (
    <div className="h-44 w-full overflow-hidden border-b border-slate-100 bg-gradient-to-br from-amber-50/70 via-emerald-50/50 to-teal-50">
      <svg viewBox="0 0 400 180" className="h-full w-full">
        <defs>
          <pattern id="grid2" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#e2e8f0" strokeWidth="0.9" />
          </pattern>
        </defs>
        <rect width="400" height="180" fill="url(#grid2)" />
        <g stroke="#475569" strokeWidth="1.3" fill="#ffffff">
          <rect x="48" y="44" width="68" height="36" rx="8" fill="#fef3c7" />
          <rect x="166" y="34" width="76" height="40" rx="8" fill="#dcfce7" />
          <rect x="166" y="106" width="76" height="40" rx="8" fill="#e0f2fe" />
          <rect x="290" y="70" width="64" height="40" rx="8" fill="#ede9fe" />
          <path d="M116,62 L166,54 M116,62 L166,126 M242,54 L290,90 M242,126 L290,90" fill="none" stroke="#64748b" />
        </g>
      </svg>
    </div>
  );
}
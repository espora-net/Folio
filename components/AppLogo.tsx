'use client';

import { BookOpen } from "lucide-react";

const DEFAULT_GLOW_OFFSET = "-left-10 -top-10";
const DEFAULT_GLOW_SIZE = "h-24 w-24";
const DEFAULT_GLOW_CLASS = `${DEFAULT_GLOW_OFFSET} ${DEFAULT_GLOW_SIZE}`;
const DEFAULT_ROTATION = "rotate-12";

interface AppLogoProps {
  className?: string;
  size?: string;
  roundedClass?: string;
  glowClass?: string;
  rotationClass?: string;
  shadowClass?: string;
  ariaLabel?: string;
}

export default function AppLogo({
  className = "",
  size = "w-14 h-14",
  roundedClass = "rounded-[28%]",
  glowClass = DEFAULT_GLOW_CLASS,
  rotationClass = DEFAULT_ROTATION,
  shadowClass = "shadow-[0_18px_50px_rgba(59,130,246,0.35)]",
  ariaLabel = "Logotipo de Folio",
}: AppLogoProps) {
  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={`relative ${size} ${roundedClass} overflow-hidden ${shadowClass} ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-700" />
      <div className="absolute inset-[3px] rounded-[26%] bg-gradient-to-br from-white/25 via-white/10 to-white/0" />
      <div className={`absolute inset-0 ${roundedClass} border border-white/10`} />
      <div className={`absolute ${glowClass} ${rotationClass} bg-white/15 blur-3xl`} />
      <div className="relative z-10 flex h-full items-center justify-center">
        <div className="relative rounded-2xl border border-white/30 bg-white/15 p-3 backdrop-blur-md shadow-inner">
          <BookOpen className="h-7 w-7 text-white drop-shadow" />
          <span className="absolute -top-1 -right-1 block h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_0_6px_rgba(52,211,153,0.35)]" />
        </div>
      </div>
    </div>
  );
}

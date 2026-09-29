import React from "react";
import { useLanguage } from "../../context/LanguageContext";

export type PortalCardType = "explore" | "student" | "teacher" | "admin";

interface RoleCardProps {
  portalType: PortalCardType;
  titleVi: string;
  titleEn: string;
  descriptionVi: string;
  descriptionEn: string;
  buttonVi: string;
  buttonEn: string;
  backgroundImage: string;
  isSelected?: boolean;
  onAction: () => void;
}

export const RoleCard: React.FC<RoleCardProps> = ({
  portalType,
  titleVi,
  titleEn,
  descriptionVi,
  descriptionEn,
  buttonVi,
  buttonEn,
  backgroundImage,
  isSelected = false,
  onAction
}) => {
  const { language } = useLanguage();
  const displayTitle = language === "vi" ? titleVi : titleEn;
  const displayDesc = language === "vi" ? descriptionVi : descriptionEn;
  const displayBtn = language === "vi" ? buttonVi : buttonEn;

  const renderCustomHeritageIcon = () => {
    switch (portalType) {
      case "explore":
        // Map & Compass Heritage Icon (Matching Card 1 in reference image)
        return (
          <svg
            viewBox="0 0 96 96"
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto drop-shadow-md"
            fill="none"
          >
            {/* Folded Golden Map */}
            <path
              d="M14 26L36 18L60 26L82 18V70L60 78L36 70L14 78V26Z"
              fill="#F3B340"
              stroke="#7A1215"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <path
              d="M36 18V70M60 26V78"
              stroke="#7A1215"
              strokeWidth="2.5"
              strokeDasharray="4 4"
            />
            {/* Compass Circle */}
            <circle
              cx="48"
              cy="48"
              r="20"
              fill="#FFFDF9"
              stroke="#7A1215"
              strokeWidth="3.5"
            />
            <circle
              cx="48"
              cy="48"
              r="15"
              stroke="#D4AF37"
              strokeWidth="2"
            />
            {/* Compass Needle */}
            <polygon points="48,33 54,48 48,44 42,48" fill="#8B1E1E" />
            <polygon points="48,63 54,48 48,52 42,48" fill="#D4AF37" />
            <circle cx="48" cy="48" r="3" fill="#7A1215" />
          </svg>
        );

      case "student":
        // School Building & Open Book Icon (Matching Card 2 in reference image)
        return (
          <svg
            viewBox="0 0 96 96"
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto drop-shadow-md"
            fill="none"
          >
            {/* School Roof & Flag */}
            <path
              d="M48 12V22M48 12L58 16L48 20"
              stroke="#8B1E1E"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polygon
              points="20,38 48,20 76,38"
              fill="#8B1E1E"
              stroke="#5E1111"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* School Facade */}
            <rect
              x="24"
              y="38"
              width="48"
              height="30"
              fill="#F3B340"
              stroke="#7A1215"
              strokeWidth="3"
            />
            <circle cx="48" cy="31" r="4.5" fill="#FFFDF9" stroke="#7A1215" strokeWidth="2" />
            {/* Open Book in Front */}
            <path
              d="M26 62C34 59 42 61 48 65C54 61 62 59 70 62V78C62 75 54 77 48 81C42 77 34 75 26 78V62Z"
              fill="#FFFDF9"
              stroke="#7A1215"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <path d="M48 65V81" stroke="#7A1215" strokeWidth="3" />
          </svg>
        );

      case "teacher":
        // Teacher & Chalkboard Icon (Matching Card 3 in reference image)
        return (
          <svg
            viewBox="0 0 96 96"
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto drop-shadow-md"
            fill="none"
          >
            {/* Chalkboard */}
            <rect
              x="30"
              y="18"
              width="52"
              height="36"
              rx="4"
              fill="#2E6F5E"
              stroke="#8B5A2B"
              strokeWidth="4"
            />
            <line x1="40" y1="29" x2="70" y2="29" stroke="#FFFDF9" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="40" y1="37" x2="62" y2="37" stroke="#F3B340" strokeWidth="2.5" strokeLinecap="round" />
            {/* Teacher Avatar */}
            <circle
              cx="32"
              cy="46"
              r="9"
              fill="#FBD3A7"
              stroke="#7A1215"
              strokeWidth="3"
            />
            <path
              d="M18 76C18 64 24 58 32 58C40 58 46 64 46 76"
              fill="#8B1E1E"
              stroke="#5E1111"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Pointer Stick */}
            <line
              x1="44"
              y1="60"
              x2="62"
              y2="42"
              stroke="#D4AF37"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </svg>
        );

      case "admin":
        // Golden Gear & Security Shield Icon (Matching Card 4 in reference image)
        return (
          <svg
            viewBox="0 0 96 96"
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto drop-shadow-md"
            fill="none"
          >
            {/* Gear Outer */}
            <circle
              cx="44"
              cy="44"
              r="22"
              fill="#F3B340"
              stroke="#7A1215"
              strokeWidth="3.5"
            />
            <circle
              cx="44"
              cy="44"
              r="10"
              fill="#FFFDF9"
              stroke="#7A1215"
              strokeWidth="3"
            />
            {/* Shield Overlay */}
            <path
              d="M62 42L78 48V60C78 70 71 77 62 81C53 77 46 70 46 60V48L62 42Z"
              fill="#D97724"
              stroke="#7A1215"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <path
              d="M56 61L60 65L69 56"
              stroke="#FFFDF9"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
    }
  };

  return (
    <article
      onClick={onAction}
      className={`group relative rounded-[28px] overflow-hidden transition-all duration-300 cursor-pointer flex flex-col justify-between p-5 sm:p-7 text-center select-none ${
        isSelected
          ? "bg-white/90 backdrop-blur-md border-[3px] border-[#8B1E1E] ring-4 ring-[#D4AF37]/50 shadow-[0_18px_40px_rgba(139,30,30,0.32)] -translate-y-1"
          : "bg-white/78 hover:bg-white/88 backdrop-blur-md border-2 border-white/90 shadow-[0_12px_32px_rgba(20,10,11,0.22)] hover:shadow-[0_18px_38px_rgba(139,30,30,0.28)] hover:-translate-y-1"
      }`}
    >
      {/* Subtle Contextual Background Image inside Glass Card */}
      <img
        src={backgroundImage}
        alt={titleVi}
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover opacity-18 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/65 via-white/80 to-white/92 pointer-events-none" />

      {/* Top Section: Large Icon + Titles + 1-Line Description */}
      <div className="relative z-10 space-y-2.5">
        <div className="transform group-hover:scale-105 transition-transform duration-300">
          {renderCustomHeritageIcon()}
        </div>

        <div className="space-y-0.5">
          <h2 className="text-lg sm:text-2xl font-extrabold text-stone-900 leading-tight">
            {displayTitle}
          </h2>
        </div>

        <p className="text-xs sm:text-sm font-medium text-stone-700 max-w-xs mx-auto line-clamp-2 leading-relaxed">
          {displayDesc}
        </p>
      </div>

      {/* Bottom Action Pill Button */}
      <div className="relative z-10 pt-4 sm:pt-5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAction();
          }}
          className="w-full py-3 sm:py-3.5 px-5 rounded-full bg-gradient-to-b from-[#8B1E1E] to-[#631012] hover:from-[#9E2222] hover:to-[#7A1215] active:scale-[0.99] text-white shadow-[0_6px_18px_rgba(122,18,21,0.45)] border border-[#D4AF37]/60 transition-all cursor-pointer flex flex-col items-center justify-center leading-tight"
        >
          <span className="text-sm sm:text-base font-extrabold tracking-wide">
            {displayBtn}
          </span>
        </button>
      </div>
    </article>
  );
};

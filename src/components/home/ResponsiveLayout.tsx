import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import templeBgImage from "../../assets/images/den_hai_ba_trung_real.jpg";
import { Volume2 } from "lucide-react";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  onQuickExplore?: () => void;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children
}) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between overflow-x-hidden selection:bg-[#8B1E1E] selection:text-white bg-[#F5F2EB]">
      {/* Full-Screen Temple Heritage Background with Soft Top Sky Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={templeBgImage}
          alt={t("hai_ba_trung_temple")}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(250,248,245,0.94) 0%, rgba(248,245,238,0.82) 22%, rgba(35,20,18,0.38) 58%, rgba(20,10,11,0.86) 100%)"
          }}
        />
      </div>

      {/* Top Application Portal Header */}
      <header className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="flex items-center justify-between gap-2 sm:gap-3 bg-white/85 backdrop-blur-md border border-[#D4AF37]/50 rounded-2xl px-3 py-2.5 sm:px-5 sm:py-3 shadow-md">
          {/* Brand Logo + Name */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#8B1E1E] to-[#5E1111] border-2 border-[#D4AF37] flex items-center justify-center text-white shadow-md shrink-0">
              <span className="text-base sm:text-xl">🏛️</span>
            </div>
            <div className="min-w-0">
              <div className="font-cinzel font-extrabold text-xs sm:text-lg lg:text-xl text-[#7A1215] tracking-tight truncate leading-tight">
                MÊ LINH HERITAGE
              </div>
              <div className="text-[10px] sm:text-xs font-bold text-stone-600 truncate">
                {t("app_subtitle")}
              </div>
            </div>
          </div>

          {/* Right Controls: Bilingual Flag Switcher (🇻🇳 Tiếng Việt / 🇬🇧 English) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="flex items-center gap-1 bg-white/95 p-1 rounded-xl border border-stone-300 shadow-xs">
              <button
                type="button"
                onClick={() => setLanguage("vi")}
                className={`px-2 sm:px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-extrabold flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  language === "vi"
                    ? "bg-[#8B1E1E] text-white shadow-xs"
                    : "text-stone-700 hover:bg-stone-100"
                }`}
                aria-label="Tiếng Việt"
              >
                <span className="text-xs sm:text-sm leading-none">🇻🇳</span>
                <span>Tiếng Việt</span>
              </button>

              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-2 sm:px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-extrabold flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  language === "en"
                    ? "bg-[#8B1E1E] text-white shadow-xs"
                    : "text-stone-700 hover:bg-stone-100"
                }`}
                aria-label="English"
              >
                <span className="text-xs sm:text-sm leading-none">🇬🇧</span>
                <span>English</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Responsive Content Container */}
      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col justify-center">
        {children}
      </main>
    </div>
  );
};

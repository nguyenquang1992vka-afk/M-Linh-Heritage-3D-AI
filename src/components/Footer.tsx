import React from "react";
import { MapPin } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import templeBgImage from "../assets/images/den_hai_ba_trung_real.jpg";

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="mt-16 bg-[#1A0D0E] border-t-2 border-[#D4AF37]/50 text-stone-300 py-10 px-4 sm:px-8 relative overflow-hidden">
      <img
        src={templeBgImage}
        alt={t("hai_ba_trung_temple")}
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-15 pointer-events-none"
      />
      <div className="absolute inset-0 bg-[#1A0D0E]/85 pointer-events-none"></div>
      <div className="absolute inset-0 bronze-drum-pattern opacity-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {/* Col 1: Brand & Description */}
        <div className="space-y-2.5 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2.5 text-[#D4AF37] font-cinzel font-bold text-xl">
            <div className="w-8 h-8 rounded-xl bg-[#8B1E1E] border border-[#D4AF37] flex items-center justify-center text-white text-xs">
              🏛️
            </div>
            <span>MÊ LINH HERITAGE 3D AI</span>
          </div>
          <p className="text-xs font-semibold text-stone-200">
            {t("footer_ecosystem_desc")}
          </p>
          <p className="text-[11px] text-stone-400 italic">
            {t("app_subtitle")}
          </p>
        </div>

        {/* Col 2: School & Unit Details */}
        <div className="space-y-2 text-center border-y md:border-y-0 md:border-x border-stone-800 py-4 md:py-0 md:px-8">
          <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider font-cinzel">
            {t("footer_unit")}
          </h4>
          <div className="text-xs text-stone-200 space-y-1 font-medium">
            <p className="font-bold text-white text-base font-cinzel">
              {t("footer_school")}
            </p>
            <p className="flex items-center justify-center gap-1.5 text-amber-200/90 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span>{t("footer_address")}</span>
            </p>
            <p className="text-[11px] text-stone-400">{t("footer_subject")}</p>
          </div>
        </div>

        {/* Col 3: Copyright & Technology */}
        <div className="space-y-2 text-center md:text-right flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider font-cinzel">
              {t("footer_ai_museum")}
            </h4>
            <p className="text-xs text-stone-300 mt-1">
              {t("footer_ai_desc")}
            </p>
          </div>
          <div className="pt-4 border-t border-stone-800 text-xs text-stone-400">
            <p className="font-bold text-[#D4AF37]">© 2026</p>
            <p className="text-[11px] text-stone-400 mt-0.5">
              {t("footer_copyright")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

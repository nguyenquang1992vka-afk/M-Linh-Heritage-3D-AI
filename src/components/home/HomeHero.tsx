import React from "react";
import { useLanguage } from "../../context/LanguageContext";

export const HomeHero: React.FC = () => {
  const { language, t } = useLanguage();

  return (
    <section className="text-center max-w-4xl mx-auto px-2 pt-2 pb-5 sm:pb-7 space-y-2 sm:space-y-2.5">
      <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-[#7A1215] drop-shadow-[0_2px_10px_rgba(255,255,255,0.9)] leading-tight">
        {t("app_title")}
      </h1>

      <p className="text-base sm:text-2xl md:text-[26px] font-semibold text-stone-700 drop-shadow-[0_1px_6px_rgba(255,255,255,0.85)] leading-snug">
        {language === "vi"
          ? "Quần thể Di tích Quốc gia Đặc biệt Đền Hai Bà Trưng"
          : "Hai Ba Trung Temple Special National Relic Complex"}
      </p>

      <div className="pt-1 space-y-0.5">
        <p className="text-sm sm:text-lg md:text-xl font-bold text-stone-900 drop-shadow-[0_1px_6px_rgba(255,255,255,0.9)]">
          {t("app_tagline")}
        </p>
      </div>
    </section>
  );
};

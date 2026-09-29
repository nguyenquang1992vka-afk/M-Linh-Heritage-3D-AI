import React from "react";
import { RoleCard, PortalCardType } from "./RoleCard";
import { useLanguage } from "../../context/LanguageContext";
import nghiMonNgoaiImg from "../../assets/images/nghi_mon_ngoai_real.jpg";
import tamToaChinhDienImg from "../../assets/images/tam_toa_chinh_dien_real.jpg";
import khuThoThanPhuImg from "../../assets/images/khu_tho_than_phu_real.jpg";
import khuThoTuongLinhImg from "../../assets/images/khu_tho_tuong_linh_real.jpg";

interface FeatureSectionProps {
  selectedPortal: PortalCardType;
  onSelectPortal: (portal: PortalCardType) => void;
  onQuickExploreHeritage?: () => void;
}

export const FeatureSection: React.FC<FeatureSectionProps> = ({
  selectedPortal,
  onSelectPortal
}) => {
  const { t } = useLanguage();

  const portalCards: {
    portalType: PortalCardType;
    titleVi: string;
    titleEn: string;
    descriptionVi: string;
    descriptionEn: string;
    buttonVi: string;
    buttonEn: string;
    backgroundImage: string;
  }[] = [
    {
      portalType: "explore",
      titleVi: "🏛 Khám phá di sản",
      titleEn: "🏛 Explore Heritage",
      descriptionVi: "Tham quan di tích, bản đồ số, video, tham quan 3D.",
      descriptionEn: "Explore heritage site, digital map, video & 3D experience.",
      buttonVi: "Bắt đầu khám phá",
      buttonEn: "Start Exploring",
      backgroundImage: nghiMonNgoaiImg
    },
    {
      portalType: "student",
      titleVi: "🎓 Cổng học sinh",
      titleEn: "🎓 Student Portal",
      descriptionVi: "Nhiệm vụ học tập, bài học số, quiz, điểm XP, huy hiệu.",
      descriptionEn: "Learning missions, digital lessons, quizzes, XP points & badges.",
      buttonVi: "Đăng nhập Cổng học sinh",
      buttonEn: "Sign In to Student Portal",
      backgroundImage: tamToaChinhDienImg
    },
    {
      portalType: "teacher",
      titleVi: "👩‍🏫 Cổng giáo viên",
      titleEn: "👩‍🏫 Teacher Portal",
      descriptionVi: "Quản lý lớp, giao nhiệm vụ học tập, đánh giá.",
      descriptionEn: "Manage classes, assign learning missions & evaluate.",
      buttonVi: "Đăng nhập Cổng giáo viên",
      buttonEn: "Sign In to Teacher Portal",
      backgroundImage: khuThoThanPhuImg
    },
    {
      portalType: "admin",
      titleVi: "⚙ Quản trị viên",
      titleEn: "⚙ Administrator",
      descriptionVi: "Quản lý hệ thống, dữ liệu di sản, báo cáo thống kê.",
      descriptionEn: "System administration, heritage data & analytics reports.",
      buttonVi: "Đăng nhập Quản trị viên",
      buttonEn: "Sign In as Administrator",
      backgroundImage: khuThoTuongLinhImg
    }
  ];

  return (
    <section className="w-full max-w-4xl mx-auto space-y-6 sm:space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-7">
        {portalCards.map((card) => (
          <RoleCard
            key={card.portalType}
            portalType={card.portalType}
            titleVi={card.titleVi}
            titleEn={card.titleEn}
            descriptionVi={card.descriptionVi}
            descriptionEn={card.descriptionEn}
            buttonVi={card.buttonVi}
            buttonEn={card.buttonEn}
            backgroundImage={card.backgroundImage}
            isSelected={selectedPortal === card.portalType}
            onAction={() => onSelectPortal(card.portalType)}
          />
        ))}
      </div>

      {/* Mission Statement Footer */}
      <div className="text-center space-y-1.5 px-3 pt-1">
        <p className="text-xs sm:text-base font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] leading-relaxed max-w-2xl mx-auto">
          {t("mission_statement")}
        </p>
        <div className="pt-2">
          <a
            href="#portal-gateway"
            className="inline-block text-[11px] sm:text-xs font-semibold text-amber-200/90 hover:text-white underline underline-offset-4 transition-colors"
          >
            {t("contact_support")}
          </a>
        </div>
      </div>
    </section>
  );
};

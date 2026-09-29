import React, { useRef, useState } from "react";
import { HeritageBadge, StudentProfile } from "../types";
import { INITIAL_POIS } from "../data/heritageData";
import { soundManager } from "../utils/audioUtils";
import templeBgImage from "../assets/images/den_hai_ba_trung_real.jpg";
import nghiMonNgoaiImg from "../assets/images/nghi_mon_ngoai_real.jpg";
import tamToaChinhDienImg from "../assets/images/tam_toa_chinh_dien_real.jpg";
import khuThoThanPhuImg from "../assets/images/khu_tho_than_phu_real.jpg";
import khuThoTuongLinhImg from "../assets/images/khu_tho_tuong_linh_real.jpg";
import hoBanNguyetImg from "../assets/images/ho_ban_nguyet_canh_quan_real.jpg";
import festivalBannerImg from "../assets/images/le_hoi_real.jpg";
import { 
  Award, 
  Crown, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  Printer, 
  GraduationCap,
  Medal,
  MapPin,
  Flame,
  Target,
  Gamepad2,
  Bot,
  Box,
  Compass,
  Zap
} from "lucide-react";

interface BadgePassportProps {
  badges: HeritageBadge[];
  studentProfile: StudentProfile;
  onAddXp?: (amount: number) => void;
  onUnlockBadge?: (badgeId: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const BadgePassport: React.FC<BadgePassportProps> = ({
  badges,
  studentProfile,
  onAddXp,
  onUnlockBadge,
  onNavigateTab
}) => {
  const certificateRef = useRef<HTMLDivElement | null>(null);
  const [completedMissionIds, setCompletedMissionIds] = useState<string[]>(["pm-1"]);

  const stationImages = [
    nghiMonNgoaiImg,
    templeBgImage,
    tamToaChinhDienImg,
    khuThoThanPhuImg,
    khuThoTuongLinhImg,
    hoBanNguyetImg
  ];

  const handlePrintCertificate = () => {
    window.print();
  };

  const progressPct = Math.min(
    100,
    Math.round(
      ((studentProfile.completedPOIs.length / 6) * 50) +
        ((studentProfile.unlockedBadgeIds.length / Math.max(1, badges.length)) * 30) +
        (Math.min(100, studentProfile.quizScore) * 0.2)
    )
  );

  const nextLevelXp = (studentProfile.level || 1) * 200;
  const xpBarPct = Math.min(100, Math.round(((studentProfile.xp % 200) / 200) * 100)) || 65;

  const passportMissions = [
    {
      id: "pm-1",
      title: "Khởi động Hộ chiếu Số",
      xp: 30,
      badgeId: "badge-pioneer",
      icon: Zap,
      image: templeBgImage,
      tab: "map-stations"
    },
    {
      id: "pm-2",
      title: "Xoay Hiện vật Bảo tàng 3D",
      xp: 50,
      badgeId: "badge-artist",
      icon: Box,
      image: tamToaChinhDienImg,
      tab: "artifacts"
    },
    {
      id: "pm-3",
      title: "Hỏi AI Hướng dẫn viên",
      xp: 40,
      badgeId: "badge-ai-friend",
      icon: Bot,
      image: nghiMonNgoaiImg,
      tab: "ai-chat"
    },
    {
      id: "pm-4",
      title: "Vượt Thử thách Quiz Di sản",
      xp: 80,
      badgeId: "badge-historian",
      icon: Gamepad2,
      image: festivalBannerImg,
      tab: "quiz"
    }
  ];

  const handleClaimPassportMission = (missionId: string, xp: number, badgeId?: string, tab?: string) => {
    if (!completedMissionIds.includes(missionId)) {
      setCompletedMissionIds((prev) => [...prev, missionId]);
      soundManager.playSuccessFanfare();
      if (onAddXp) onAddXp(xp);
      if (badgeId && onUnlockBadge) onUnlockBadge(badgeId);
    } else if (tab && onNavigateTab) {
      onNavigateTab(tab);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* 1. STUDENT DIGITAL PASSPORT ID CARD (HỒ SƠ HỌC SINH • XP • TIẾN TRÌNH HỌC TẬP) */}
      <div className="relative rounded-[32px] overflow-hidden border-2 border-[#D4AF37] shadow-2xl bg-[#1A0D0E] text-white">
        <img
          src={templeBgImage}
          alt="Student Digital Passport"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A0D0E]/95 via-[#2C1416]/85 to-[#1A0D0E]/90" />

        <div className="relative z-10 p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Student Avatar & Core Identity (5 cols) */}
          <div className="lg:col-span-5 flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-[#8B1E1E] to-[#5E1111] border-2 border-[#D4AF37] shadow-2xl flex flex-col items-center justify-center font-cinzel font-extrabold">
                <span className="text-2xl sm:text-3xl text-[#D4AF37]">
                  {studentProfile.name
                    .split(/\s+/)
                    .slice(-2)
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()}
                </span>
                <span className="text-[10px] text-amber-200">LV.{studentProfile.level}</span>
              </div>
              <span className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl bg-[#D4AF37] text-[#1A0D0E] flex items-center justify-center shadow">
                <Crown className="w-4 h-4" />
              </span>
            </div>

            <div className="min-w-0 space-y-1">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#D4AF37]">
                <Award className="w-3.5 h-3.5" />
                <span>STUDENT DIGITAL PASSPORT</span>
              </div>
              <h2 className="font-cinzel font-extrabold text-2xl sm:text-3xl text-white truncate">
                {studentProfile.name}
              </h2>
              <p className="text-xs font-bold text-amber-200/90 truncate">
                {studentProfile.grade} · {studentProfile.school}
              </p>
              <p className="text-xs text-emerald-400 font-extrabold">
                🏅 {studentProfile.levelTitle}
              </p>
            </div>
          </div>

          {/* 4 Visual KPI Tiles + XP & Learning Progress Bars (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-black/50 backdrop-blur-md p-3.5 rounded-2xl border border-[#D4AF37]/50 text-center">
                <Flame className="w-5 h-5 text-[#D4AF37] mx-auto mb-1" />
                <div className="text-lg sm:text-xl font-extrabold font-cinzel text-[#D4AF37]">
                  {studentProfile.xp} XP
                </div>
                <div className="text-[10px] text-stone-300 uppercase font-bold">Điểm XP</div>
              </div>

              <div className="bg-black/50 backdrop-blur-md p-3.5 rounded-2xl border border-[#D4AF37]/50 text-center">
                <Medal className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <div className="text-lg sm:text-xl font-extrabold font-cinzel text-white">
                  {studentProfile.unlockedBadgeIds.length}/{badges.length}
                </div>
                <div className="text-[10px] text-stone-300 uppercase font-bold">Huy hiệu</div>
              </div>

              <div className="bg-black/50 backdrop-blur-md p-3.5 rounded-2xl border border-[#D4AF37]/50 text-center">
                <MapPin className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <div className="text-lg sm:text-xl font-extrabold font-cinzel text-emerald-400">
                  {studentProfile.completedPOIs.length}/6
                </div>
                <div className="text-[10px] text-stone-300 uppercase font-bold">Trạm Di sản</div>
              </div>

              <div className="bg-black/50 backdrop-blur-md p-3.5 rounded-2xl border border-[#D4AF37]/50 text-center">
                <Target className="w-5 h-5 text-rose-400 mx-auto mb-1" />
                <div className="text-lg sm:text-xl font-extrabold font-cinzel text-amber-200">
                  {progressPct}%
                </div>
                <div className="text-[10px] text-stone-300 uppercase font-bold">Tiến trình</div>
              </div>
            </div>

            {/* Visual XP & Learning Progress Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black/45 p-3.5 rounded-2xl border border-white/10">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-extrabold">
                  <span className="text-[#D4AF37]">⚡ Cấp {studentProfile.level} → Cấp {studentProfile.level + 1}</span>
                  <span className="text-amber-100">{studentProfile.xp}/{nextLevelXp} XP</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-white/15 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] rounded-full transition-all duration-500"
                    style={{ width: `${xpBarPct}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-extrabold">
                  <span className="text-emerald-300">📈 Tiến trình Học tập Di sản</span>
                  <span className="text-emerald-300">{progressPct}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-white/15 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-300 rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. GAMIFICATION MISSIONS IN PASSPORT (HOÀN THÀNH NHIỆM VỤ NHẬN XP & MỞ KHÓA HUY HIỆU) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-cinzel font-extrabold text-[#8B1E1E] flex items-center gap-2">
            <Target className="w-5 h-5 text-[#D4AF37]" />
            <span>Nhiệm Vụ Hộ Chiếu Số (Nhận XP & Mở Khóa Huy Hiệu)</span>
          </h3>
          <span className="text-xs font-extrabold text-stone-600">
            {completedMissionIds.length}/{passportMissions.length} Hoàn thành
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {passportMissions.map((m) => {
            const IconComp = m.icon;
            const isDone = completedMissionIds.includes(m.id);
            return (
              <div
                key={m.id}
                onClick={() => handleClaimPassportMission(m.id, m.xp, m.badgeId, m.tab)}
                className="group relative h-52 rounded-3xl overflow-hidden border-2 border-[#D4AF37] shadow-lg cursor-pointer hover:-translate-y-1 transition-all"
              >
                <img
                  src={m.image}
                  alt={m.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A0D0E] via-[#1A0D0E]/45 to-transparent" />

                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-[#8B1E1E]/90 border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] shadow">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-[#D4AF37] text-[#1A0D0E] text-xs font-extrabold shadow">
                    +{m.xp} XP
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 space-y-2">
                  <h4 className="font-cinzel font-extrabold text-sm text-white leading-snug">
                    {m.title}
                  </h4>
                  <button
                    type="button"
                    className={`w-full py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isDone
                        ? "bg-emerald-600 text-white"
                        : "bg-[#8B1E1E] hover:bg-[#A32222] text-amber-200 border border-[#D4AF37]"
                    }`}
                  >
                    {isDone ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Đã nhận +{m.xp} XP</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Nhận thưởng +{m.xp} XP</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. VISUAL 6-STATION STAMP BOOK (TIẾN TRÌNH 6 TRẠM DI SẢN) */}
      <div className="bg-white p-6 rounded-3xl border-2 border-[#D4AF37] shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-cinzel font-extrabold text-[#8B1E1E] flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#D4AF37]" />
            <span>Tiến Trình 6 Trạm Di Sản Đền Hai Bà Trưng</span>
          </h3>
          <span className="text-xs font-extrabold text-[#8B1E1E]">
            {studentProfile.completedPOIs.length}/6 Ấn Tín Đỏ Son
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {INITIAL_POIS.map((poi, idx) => {
            const isStamped = studentProfile.completedPOIs.includes(poi.id);
            const img = stationImages[idx % stationImages.length];
            return (
              <div
                key={poi.id}
                onClick={() => onNavigateTab && onNavigateTab("map-stations")}
                className={`group relative h-44 rounded-2xl overflow-hidden border-2 cursor-pointer transition-all ${
                  isStamped
                    ? "border-[#8B1E1E] shadow-md"
                    : "border-stone-300 opacity-80 hover:opacity-100"
                }`}
              >
                <img
                  src={img}
                  alt={poi.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                <div className="absolute top-2.5 right-2.5">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-cinzel font-extrabold text-[10px] border-2 shadow ${
                      isStamped
                        ? "bg-[#8B1E1E] text-[#D4AF37] border-[#D4AF37]"
                        : "bg-black/60 text-stone-300 border-white/30"
                    }`}
                  >
                    {isStamped ? "ẤN" : `#${poi.order}`}
                  </div>
                </div>

                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                  <div className="text-[10px] font-extrabold text-[#D4AF37]">
                    +{poi.quest.xpReward} XP
                  </div>
                  <h4 className="font-cinzel font-bold text-xs line-clamp-2 leading-tight">
                    {poi.title}
                  </h4>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. VISUAL BADGES COLLECTION (MỞ KHÓA HUY HIỆU) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-cinzel font-extrabold text-[#3E2723] flex items-center gap-2">
            <Medal className="w-5 h-5 text-[#C81D25]" />
            <span>Bộ Sưu Tập Huy Hiệu Di Sản Số</span>
          </h3>
          <span className="text-xs font-extrabold text-[#8B1E1E]">
            Đã mở khóa {studentProfile.unlockedBadgeIds.length}/{badges.length}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {badges.map((badge, idx) => {
            const isUnlocked = studentProfile.unlockedBadgeIds.includes(badge.id);
            const bgImg = stationImages[idx % stationImages.length];

            return (
              <div
                key={badge.id}
                onClick={() => {
                  if (!isUnlocked && onUnlockBadge && onAddXp) {
                    onUnlockBadge(badge.id);
                    onAddXp(25);
                    soundManager.playSuccessFanfare();
                  }
                }}
                className={`relative rounded-3xl overflow-hidden border-2 p-4 flex flex-col items-center text-center justify-between min-h-[190px] transition-all cursor-pointer ${
                  isUnlocked
                    ? "bg-gradient-to-b from-[#FFFDF9] to-[#FFF3D1] border-[#D4AF37] shadow-lg"
                    : "bg-stone-100 border-stone-300 opacity-75 hover:opacity-100"
                }`}
              >
                <img
                  src={bgImg}
                  alt={badge.title}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover opacity-12 pointer-events-none"
                />

                <div
                  className={`relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center border-2 shadow-md ${
                    isUnlocked
                      ? "bg-gradient-to-br from-[#8B1E1E] to-[#5E1111] border-[#D4AF37] text-[#D4AF37]"
                      : "bg-stone-300 border-stone-400 text-stone-600"
                  }`}
                >
                  {isUnlocked ? <Crown className="w-7 h-7" /> : <Lock className="w-6 h-6" />}
                </div>

                <div className="relative z-10 space-y-1 mt-2">
                  <h4 className="font-cinzel font-extrabold text-xs sm:text-sm text-[#2C1A1D]">
                    {badge.title}
                  </h4>
                  <p className="text-[11px] text-stone-600 line-clamp-2">{badge.conditionText}</p>
                </div>

                <div className="relative z-10 mt-2">
                  {isUnlocked ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Đã mở khóa
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#8B1E1E]">
                      <Sparkles className="w-3.5 h-3.5" /> Chạm mở khóa (+25 XP)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. OFFICIAL PRINTABLE CERTIFICATE */}
      <div className="space-y-4 pt-4 border-t-2 border-amber-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-cinzel font-bold text-[#3E2723] flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#C81D25]" />
            <span>Chứng Nhận Sứ Giả Di Sản 3D AI</span>
          </h3>

          <button
            onClick={handlePrintCertificate}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C81D25] to-[#B22222] text-white text-xs font-bold hover:brightness-110 shadow flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>In Chứng Nhận</span>
          </button>
        </div>

        <div 
          id="printable-certificate"
          ref={certificateRef}
          className="bg-[#FFFDF9] p-6 sm:p-10 rounded-3xl border-8 border-[#D4AF37] shadow-2xl relative overflow-hidden text-center space-y-5"
          style={{
            backgroundImage: `radial-gradient(#D4AF37 0.75px, transparent 0.75px)`,
            backgroundSize: "20px 20px"
          }}
        >
          <div className="border-2 border-[#C81D25] p-6 rounded-2xl relative">
            <div className="absolute top-4 right-4 seal-stamp hidden sm:block">
              MÊ LINH 3D AI
            </div>

            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#C81D25] to-[#800000] text-[#D4AF37] font-cinzel font-bold text-xl flex items-center justify-center mx-auto shadow-lg border-2 border-[#D4AF37] mb-2">
              3D
            </div>

            <h2 className="text-2xl sm:text-3xl font-cinzel font-black text-[#8B1E1E] tracking-wide">
              CHỨNG NHẬN HỘ CHIẾU DI SẢN SỐ
            </h2>
            <p className="text-xs font-cinzel font-bold text-[#D4AF37] uppercase tracking-widest mt-1">
              MÊ LINH HERITAGE 3D AI
            </p>

            <p className="text-xl sm:text-2xl font-cinzel font-bold text-[#2C1A1D] underline decoration-[#D4AF37] decoration-2 underline-offset-4 py-3">
              {studentProfile.name}
            </p>
            <p className="text-xs text-stone-600 font-bold">
              {studentProfile.grade} · {studentProfile.school} · ⚡ {studentProfile.xp} XP · 🏅 {studentProfile.unlockedBadgeIds.length} Huy hiệu
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


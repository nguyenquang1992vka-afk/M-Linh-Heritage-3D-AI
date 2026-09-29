import React, { useState } from "react";
import { StudentProfile, UserRole, ClassStudentProgress, StudentPost } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { INITIAL_BADGES, INITIAL_POIS, MOCK_CLASS_PROGRESS, INITIAL_STUDENT_POSTS } from "../data/heritageData";
import { soundManager } from "../utils/audioUtils";
import { recordProgressEventInDb } from "../services/heritageDatabase";
import { MeLinhVideoShowcase } from "./MeLinhVideoShowcase";
import { HeritageSocialFeed } from "./HeritageSocialFeed";
import { DigitalHeritageAcademy } from "./DigitalHeritageAcademy";
import { HomeHero } from "./home/HomeHero";
import { FeatureSection } from "./home/FeatureSection";
import { PortalCardType } from "./home/RoleCard";
import templeBgImage from "../assets/images/den_hai_ba_trung_real.jpg";
import nghiMonNgoaiImg from "../assets/images/nghi_mon_ngoai_real.jpg";
import tamToaChinhDienImg from "../assets/images/tam_toa_chinh_dien_real.jpg";
import khuThoThanPhuImg from "../assets/images/khu_tho_than_phu_real.jpg";
import festivalBannerImg from "../assets/images/le_hoi_real.jpg";
import coMeLinhAvatar from "../assets/images/co_me_linh_ai_avatar_1790426772614.jpg";
import {
  Sparkles,
  Award,
  Compass,
  Landmark,
  ArrowRight,
  MapPin,
  Trophy,
  Play,
  Gamepad2,
  Box,
  ChevronRight,
  Flame,
  CheckCircle2,
  Crown,
  Lock,
  Target,
  Medal,
  Bot,
  Calendar,
  Video,
  User,
  Clock,
  GraduationCap,
  Building2
} from "lucide-react";

interface StudentDashboardProps {
  studentProfile: StudentProfile;
  studentsList?: ClassStudentProgress[];
  studentPosts?: StudentPost[];
  onUpdatePosts?: React.Dispatch<React.SetStateAction<StudentPost[]>>;
  onUnlockBadge?: (badgeId: string) => void;
  onCompletePoiQuest?: (poiId: string, xpReward: number) => void;
  onNavigateTab: (tab: string) => void;
  onOpenAIChat?: (prompt?: string) => void;
  onAddXp?: (amount: number) => void;
  onSwitchRole?: (role: UserRole, tab?: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  studentProfile,
  studentsList = MOCK_CLASS_PROGRESS,
  studentPosts = INITIAL_STUDENT_POSTS,
  onUpdatePosts,
  onUnlockBadge,
  onCompletePoiQuest,
  onNavigateTab,
  onOpenAIChat,
  onAddXp,
  onSwitchRole
}) => {
  const [localPosts, setLocalPosts] = useState<StudentPost[]>(studentPosts);
  const resolvedPosts = onUpdatePosts ? studentPosts : localPosts;
  const resolvedSetPosts = onUpdatePosts || setLocalPosts;
  const { language } = useLanguage();
  const completedMissionsCount = studentProfile.completedPOIs.length;
  const totalMissionsCount = 6;
  const completionPercentage = Math.round((completedMissionsCount / totalMissionsCount) * 100);

  const [claimedDailyIds, setClaimedDailyIds] = useState<string[]>(["m-checkin"]);
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);
  const [journalNote, setJournalNote] = useState<string>("");
  const [journalEntries, setJournalEntries] = useState<{ id: string; station: string; note: string; date: string }[]>([
    {
      id: "j-1",
      station: "Trạm 1: Nghi môn ngoại & Đá Thề",
      note: "Em ấn tượng nhất với 4 câu Lời thề Sông Hát năm 40 SCN khắc trên khối Đá Thề trước sân Ngũ Phúc.",
      date: "Hôm nay"
    },
    {
      id: "j-2",
      station: "Trạm 3: Tam tòa Chính diện Đền Hai Bà Trưng",
      note: "Kiến trúc Thượng gia hạ môn và hai cỗ kiệu Bát Cống sơn son thếp vàng rất trang nghiêm.",
      date: "Hôm qua"
    }
  ]);

  const handleClaimMission = (missionId: string, xp: number) => {
    if (claimedDailyIds.includes(missionId)) return;
    setClaimedDailyIds((prev) => [...prev, missionId]);
    soundManager.playSuccessFanfare();
    if (onAddXp) onAddXp(xp);
    recordProgressEventInDb({
      eventType: "complete_mission",
      studentId: studentProfile.id,
      poiTitle: `Nhiệm vụ: ${missionId}`,
      xpEarned: xp,
      role: "student"
    });
  };

  const heritageMissions = [
    {
      id: "m-checkin",
      title: "Điểm danh Sứ giả Di sản",
      desc: "Khởi động hành trình khám phá Đền Hai Bà Trưng",
      xp: 20,
      actionTab: "student-home",
      canClaimDirect: true
    },
    {
      id: "m-map",
      title: "Khám phá 6 Trạm Di tích",
      desc: `Đã hoàn thành ${completedMissionsCount}/6 trạm`,
      xp: 50,
      actionTab: "map-stations",
      isCompleted: completedMissionsCount >= 3
    },
    {
      id: "m-ai",
      title: "Trò chuyện cùng Trợ lý Di sản AI",
      desc: "Tìm hiểu Lời thề Sông Hát năm 40 SCN",
      xp: 30,
      actionTab: "ai-chat",
      isCompleted: studentProfile.unlockedBadgeIds.includes("badge-ai-friend")
    },
    {
      id: "m-quiz",
      title: "Thử thách Đấu trường Quiz",
      desc: "Chinh phục bộ câu hỏi Khởi nghĩa Hai Bà Trưng",
      xp: 80,
      actionTab: "quiz",
      isCompleted: studentProfile.quizScore >= 80
    }
  ];

  const experienceCards = [
    {
      title: "Đền Hai Bà Trưng 360°",
      desc: "6 trạm di tích • AI thuyết minh",
      tab: "map-stations",
      badge: "360° • AI",
      xp: "+50 XP",
      image: nghiMonNgoaiImg
    },
    {
      title: "Bảo Tàng Số 3D AI",
      desc: "Ảnh • Video • 3D • AI • Quiz",
      tab: "artifacts",
      badge: "3D Museum",
      xp: "+35 XP",
      image: tamToaChinhDienImg
    },
    {
      title: "Student Digital Passport",
      desc: "Hồ sơ • XP • Huy hiệu • Tiến trình",
      tab: "passport",
      badge: "Passport",
      xp: "+40 XP",
      image: templeBgImage
    },
    {
      title: "AI Hướng Dẫn Viên 3D",
      desc: "Avatar • Kể chuyện • Hỗ trợ học tập",
      tab: "ai-chat",
      badge: "AI Guide",
      xp: "+25 XP",
      image: coMeLinhAvatar
    },
    {
      title: "Đấu Trường Quiz & Huy Hiệu",
      desc: "Trả lời câu hỏi • Mở khóa huy hiệu",
      tab: "quiz",
      badge: "Gamification",
      xp: "+80 XP",
      image: khuThoThanPhuImg
    },
    {
      title: "Lễ Hội Rước Kiệu Voi",
      desc: "Di sản phi vật thể • Trải nghiệm lễ hội",
      tab: "festivals",
      badge: "Festival",
      xp: "+45 XP",
      image: festivalBannerImg
    }
  ];

  const handleSelectHomePortal = (portal: PortalCardType) => {
    if (portal === "explore") {
      onNavigateTab("map-stations");
    } else if (portal === "student") {
      onNavigateTab("classroom");
    } else if (portal === "teacher") {
      if (onSwitchRole) onSwitchRole("teacher", "teacher-overview");
      else onNavigateTab("classroom");
    } else if (portal === "admin") {
      if (onSwitchRole) onSwitchRole("admin", "admin-dashboard");
      else onNavigateTab("passport");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 px-2 sm:px-4 overflow-x-hidden">
      {/* ===================================================================== */}
      {/* 1. REDESIGNED HOME PORTAL HERO & 4 MAIN PORTAL CARDS                  */}
      {/* ===================================================================== */}
      <section className="relative rounded-[28px] sm:rounded-[36px] overflow-hidden border-2 border-[#D4AF37] shadow-2xl p-4 sm:p-8 lg:p-10">
        {/* Full-bleed Đền Hai Bà Trưng Background with Soft Light Sky & Bottom Vignette Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src={templeBgImage}
            alt="Đền Hai Bà Trưng – Không gian di sản Mê Linh"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(250,248,245,0.94) 0%, rgba(248,245,238,0.82) 22%, rgba(35,20,18,0.38) 58%, rgba(20,10,11,0.88) 100%)"
            }}
          />
        </div>

        <div className="relative z-10 space-y-4 sm:space-y-6">
          <HomeHero />
          <FeatureSection
            selectedPortal="student"
            onSelectPortal={handleSelectHomePortal}
            onQuickExploreHeritage={() => onNavigateTab("map-stations")}
          />
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3. STUDENT HERITAGE PASSPORT & KPI STRIP (COMPACT & VISUAL)           */}
      {/* ===================================================================== */}
      <section className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-[#8B1E1E] to-[#5E1111] text-white p-5 rounded-3xl border-2 border-[#D4AF37] shadow-lg">
            <div className="flex items-center justify-between text-xs text-amber-200 font-bold">
              <span>ĐIỂM LINH KHÍ</span>
              <Flame className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div className="text-3xl font-extrabold font-cinzel text-[#D4AF37] mt-1">
              {studentProfile.xp} XP
            </div>
            <div className="text-xs text-amber-100/90 mt-1">
              Cấp {studentProfile.level}: {studentProfile.levelTitle}
            </div>
          </div>

          <div
            onClick={() => onNavigateTab("passport")}
            className="bg-white p-5 rounded-3xl border-2 border-[#D4AF37]/60 shadow-md cursor-pointer hover:border-[#8B1E1E] transition-all"
          >
            <div className="flex items-center justify-between text-xs text-[#2F6F68] font-bold">
              <span>HỘ CHIẾU DI SẢN</span>
              <MapPin className="w-5 h-5 text-[#2F6F68]" />
            </div>
            <div className="text-3xl font-extrabold font-cinzel text-[#2F6F68] mt-1">
              {completedMissionsCount}/{totalMissionsCount} Trạm
            </div>
            <div className="text-xs text-stone-500 mt-1">Hoàn thành {completionPercentage}%</div>
          </div>

          <div
            onClick={() => onNavigateTab("passport")}
            className="bg-white p-5 rounded-3xl border-2 border-[#D4AF37]/60 shadow-md cursor-pointer hover:border-[#8B1E1E] transition-all"
          >
            <div className="flex items-center justify-between text-xs text-[#8B1E1E] font-bold">
              <span>HUY HIỆU ĐẠT ĐƯỢC</span>
              <Trophy className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div className="text-3xl font-extrabold font-cinzel text-[#8B1E1E] mt-1">
              {studentProfile.unlockedBadgeIds.length}/{INITIAL_BADGES.length}
            </div>
            <div className="text-xs text-stone-500 mt-1">Bấm để xem Hộ chiếu</div>
          </div>

          <div
            onClick={() => onNavigateTab("quiz")}
            className="bg-white p-5 rounded-3xl border-2 border-[#D4AF37]/60 shadow-md cursor-pointer hover:border-[#8B1E1E] transition-all"
          >
            <div className="flex items-center justify-between text-xs text-amber-800 font-bold">
              <span>ĐIỂM THỬ THÁCH QUIZ</span>
              <Gamepad2 className="w-5 h-5 text-[#8B1E1E]" />
            </div>
            <div className="text-3xl font-extrabold font-cinzel text-amber-800 mt-1">
              {studentProfile.quizScore}/100
            </div>
            <div className="text-xs text-stone-500 mt-1">Tham gia thử thách ngay</div>
          </div>
        </div>

        {/* Passport Stamps + Daily Missions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white rounded-3xl border-2 border-[#D4AF37]/60 p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-[#8B1E1E] font-cinzel flex items-center gap-2">
                <Award className="w-5 h-5 text-[#D4AF37]" />
                <span>Hộ Chiếu Di Sản (6 Ấn Tín Đền Hai Bà Trưng)</span>
              </h3>
              <button
                onClick={() => onNavigateTab("passport")}
                className="text-xs font-extrabold text-[#8B1E1E] hover:underline flex items-center gap-1"
              >
                <span>Mở Hộ chiếu</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {INITIAL_POIS.map((poi) => {
                const isStamped = studentProfile.completedPOIs.includes(poi.id);
                return (
                  <div
                    key={poi.id}
                    onClick={() => onNavigateTab("map-stations")}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all text-center space-y-1.5 ${
                      isStamped
                        ? "bg-gradient-to-b from-[#FFFDF9] to-[#FFF3D1] border-[#8B1E1E] shadow-xs"
                        : "bg-stone-50 border-dashed border-stone-300 opacity-75 hover:border-[#D4AF37]"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center font-bold text-xs border-2 ${
                        isStamped
                          ? "bg-[#8B1E1E] text-[#D4AF37] border-[#D4AF37]"
                          : "bg-stone-200 text-stone-500 border-stone-300"
                      }`}
                    >
                      {isStamped ? "ẤN TÍN" : `Trạm ${poi.order}`}
                    </div>
                    <div className="font-bold text-xs text-[#2C1A1D] line-clamp-1">
                      {poi.title}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white rounded-3xl border-2 border-[#D4AF37]/60 p-6 shadow-md space-y-3">
            <h3 className="text-lg font-extrabold text-[#8B1E1E] font-cinzel flex items-center gap-2">
              <Target className="w-5 h-5 text-[#D4AF37]" />
              <span>Nhiệm Vụ Di Sản Nhanh</span>
            </h3>

            <div className="space-y-2.5">
              {heritageMissions.map((m) => {
                const isDone = m.isCompleted || claimedDailyIds.includes(m.id);
                return (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-stone-900">
                        {m.title}{" "}
                        <span className="text-[#8B1E1E] font-extrabold">+{m.xp} XP</span>
                      </div>
                      <div className="text-xs text-stone-500">{m.desc}</div>
                    </div>

                    {isDone ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Xong</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          if (m.canClaimDirect) handleClaimMission(m.id, m.xp);
                          onNavigateTab(m.actionTab);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-[#8B1E1E] hover:bg-[#6E1616] text-white text-xs font-bold shrink-0 cursor-pointer"
                      >
                        Thực hiện
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3A. HỌC VIỆN DI SẢN SỐ (3 TRÒ CHƠI GIÁO DỤC LIÊN KẾT)                 */}
      {/* ===================================================================== */}
      <DigitalHeritageAcademy
        studentProfile={studentProfile}
        onAddXp={onAddXp || (() => {})}
        onUnlockBadge={onUnlockBadge || (() => {})}
        onCompleteStationPoi={
          onCompletePoiQuest ||
          ((_poiId, xp) => {
            if (onAddXp) onAddXp(xp);
          })
        }
      />

      {/* ===================================================================== */}
      {/* 3B. GÓC HỌC SINH ĐĂNG BÀI, ẢNH, VIDEO & BÌNH LUẬN CÔNG KHAI           */}
      {/* ===================================================================== */}
      <section id="student-public-feed" className="space-y-4">
        <HeritageSocialFeed
          posts={resolvedPosts}
          onUpdatePosts={resolvedSetPosts}
          userRole="student"
          studentName={studentProfile.name}
          studentGrade={studentProfile.grade}
          studentSchool={studentProfile.school}
          onAddXp={onAddXp || (() => {})}
          onUnlockBadge={onUnlockBadge || (() => {})}
        />
      </section>

      {/* ===================================================================== */}
      {/* 4. DIGITAL MUSEUM EXPERIENCE CARDS (LARGE IMAGES • 1-LINE DESC)       */}
      {/* ===================================================================== */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#8B1E1E]">
              TRẢI NGHIỆM BẢO TÀNG SỐ
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2C1A1D] font-cinzel mt-0.5">
              Khám Phá Di Sản Đền Hai Bà Trưng
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {experienceCards.map((card, i) => (
            <div
              key={i}
              onClick={() => onNavigateTab(card.tab)}
              className="bg-white rounded-3xl border-2 border-[#D4AF37]/60 overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between"
            >
              {/* 70% Visual Image Header */}
              <div className="relative h-60 overflow-hidden bg-stone-900">
                <img
                  src={card.image}
                  alt={card.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl bg-[#8B1E1E] text-[#D4AF37] text-[11px] font-extrabold border border-[#D4AF37]">
                    {card.badge}
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-[#D4AF37] text-[#1A0D0E] text-[11px] font-extrabold shadow">
                    {card.xp}
                  </span>
                </div>
                <div className="absolute bottom-3.5 left-4 right-4 text-white">
                  <h3 className="font-cinzel font-extrabold text-lg leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-xs text-amber-200/90 font-semibold mt-0.5">{card.desc}</p>
                </div>
              </div>

              <div className="px-5 py-3.5 bg-[#FAF8F5] flex items-center justify-between text-xs font-extrabold text-[#8B1E1E]">
                <span>Khám phá & Nhận thưởng</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 5. VIDEO BÀI HỌC DI SẢN MÊ LINH (INTERACTIVE VIDEO LESSONS)           */}
      {/* ===================================================================== */}
      <section id="student-video-lessons" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#8B1E1E]">
              HỌC LIỆU ĐA PHƯƠNG TIỆN • VIDEO BÀI HỌC
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2C1A1D] font-cinzel mt-0.5 flex items-center gap-2.5">
              <Video className="w-7 h-7 text-[#8B1E1E]" />
              <span>Video Bài Giảng Lịch Sử & Di Sản Mê Linh</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={() => handleClaimMission("m-video-lesson", 40)}
            disabled={claimedDailyIds.includes("m-video-lesson")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold border-2 transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto ${
              claimedDailyIds.includes("m-video-lesson")
                ? "bg-emerald-700 text-white border-emerald-400"
                : "bg-[#8B1E1E] hover:bg-[#6E1414] text-white border-[#D4AF37] shadow-md"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
            <span>
              {claimedDailyIds.includes("m-video-lesson")
                ? "Đã nhận +40 XP Video Bài học"
                : "Hoàn thành xem Video Bài học (+40 XP)"}
            </span>
          </button>
        </div>

        <MeLinhVideoShowcase onAddXp={onAddXp} />
      </section>

      {/* ===================================================================== */}
      {/* 6. BẢNG XẾP HẠNG HỌC SINH (LEADERBOARD) & TRANG CÁ NHÂN              */}
      {/* ===================================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Bảng Xếp Hạng Sứ Giả Di Sản (Leaderboard) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border-2 border-[#D4AF37] p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#8B1E1E]">
                THI ĐUA HỌC TẬP DI SẢN SỐ
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold font-cinzel text-[#2C1A1D] flex items-center gap-2 mt-0.5">
                <Trophy className="w-6 h-6 text-[#D4AF37]" />
                <span>Bảng Xếp Hạng Sứ Giả Mê Linh</span>
              </h3>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-bold text-stone-500">Điểm của em</div>
              <div className="text-lg font-extrabold font-cinzel text-[#8B1E1E]">
                ⚡ {studentProfile.xp} XP
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            {(() => {
              const mergedList: ClassStudentProgress[] = [
                {
                  id: studentProfile.id,
                  name: `${studentProfile.name} (Em)`,
                  class: studentProfile.grade || "Lớp 4A",
                  poisCompleted: studentProfile.completedPOIs.length,
                  totalPois: 6,
                  score: studentProfile.xp,
                  badgesCount: studentProfile.unlockedBadgeIds.length,
                  lastActive: "Đang trực tuyến",
                  status:
                    studentProfile.completedPOIs.length >= 6
                      ? ("Hoàn thành" as const)
                      : ("Đang học" as const)
                },
                ...studentsList.filter(
                  (s) =>
                    s.name.toLowerCase() !== studentProfile.name.toLowerCase() &&
                    s.id !== studentProfile.id
                )
              ]
                .sort((a, b) => b.score - a.score)
                .slice(0, 8);

              return mergedList.map((stu, idx) => {
                const isMe = stu.id === studentProfile.id;
                const rankNumber = idx + 1;
                return (
                  <div
                    key={stu.id}
                    className={`p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 transition-all ${
                      isMe
                        ? "bg-gradient-to-r from-[#FFF9E6] to-[#FFF2CC] border-[#8B1E1E] shadow-md"
                        : "bg-[#FAF8F5] border-stone-200/80"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl font-cinzel font-extrabold text-sm flex items-center justify-center shrink-0 border ${
                          rankNumber === 1
                            ? "bg-gradient-to-br from-[#D4AF37] to-[#B38728] text-[#1A0D0E] border-amber-200 shadow"
                            : rankNumber === 2
                            ? "bg-stone-300 text-stone-900 border-stone-400"
                            : rankNumber === 3
                            ? "bg-amber-700 text-white border-amber-500"
                            : "bg-stone-200 text-stone-700 border-stone-300"
                        }`}
                      >
                        #{rankNumber}
                      </div>
                      <div className="min-w-0">
                        <div className="font-extrabold text-sm text-stone-900 truncate flex items-center gap-1.5">
                          <span>{stu.name}</span>
                          {rankNumber === 1 && <Crown className="w-4 h-4 text-[#D4AF37] shrink-0" />}
                        </div>
                        <div className="text-[11px] text-stone-600 font-semibold">
                          {stu.class} · {stu.poisCompleted}/6 Trạm · 🏅 {stu.badgesCount} Huy hiệu
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-extrabold text-sm text-[#8B1E1E]">
                        ⚡ {stu.score} XP
                      </div>
                      <div className="text-[10px] text-stone-500 font-semibold">
                        {stu.lastActive}
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Right 5 Cols: Trang Cá Nhân Học Sinh, Kết Quả Làm Bài & Lịch Sử Truy Cập */}
        <div className="lg:col-span-5 bg-white rounded-3xl border-2 border-[#8B1E1E] p-6 shadow-xl space-y-5">
          <div className="border-b border-stone-200 pb-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#8B1E1E] text-[#F3D27A] font-cinzel font-extrabold text-lg flex items-center justify-center border-2 border-[#D4AF37] shrink-0">
              {studentProfile.name
                .split(/\s+/)
                .slice(-2)
                .map((w) => w[0])
                .join("")
                .toUpperCase()}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8B1E1E]">
                TRANG CÁ NHÂN & HỒ SƠ HỌC TẬP
              </span>
              <h3 className="text-lg font-extrabold font-cinzel text-stone-900 truncate">
                {studentProfile.name}
              </h3>
              <p className="text-xs font-semibold text-stone-600 truncate">
                {studentProfile.grade} · {studentProfile.school}
              </p>
            </div>
          </div>

          {/* Kết quả làm bài & Chỉ số cá nhân */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200">
              <div className="text-[10px] font-extrabold uppercase text-stone-500">
                Kết quả làm bài Quiz
              </div>
              <div className="text-xl font-extrabold text-[#8B1E1E] mt-0.5">
                {studentProfile.quizScore}/100 điểm
              </div>
              <div className="text-[11px] text-emerald-700 font-bold mt-0.5">
                Đạt chuẩn Sứ giả Di sản
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200">
              <div className="text-[10px] font-extrabold uppercase text-stone-500">
                Chuỗi ngày học tập
              </div>
              <div className="text-xl font-extrabold text-[#2F6F68] mt-0.5">
                🔥 {studentProfile.streakDays || 3} ngày
              </div>
              <div className="text-[11px] text-stone-600 font-semibold mt-0.5">
                Đồng bộ Cloud Firestore
              </div>
            </div>
          </div>

          {/* Lịch sử truy cập & Hoạt động gần đây */}
          <div className="space-y-2.5">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#8B1E1E] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#8B1E1E]" />
              <span>Lịch sử truy cập & Kết quả học tập</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-stone-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-stone-900">
                    Đăng nhập Cổng Học sinh ({studentProfile.grade})
                  </div>
                  <div className="text-[11px] text-stone-500">{studentProfile.school}</div>
                </div>
                <span className="text-[11px] font-bold text-emerald-700">Đang hoạt động</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-stone-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-stone-900">
                    Hoàn thành {studentProfile.completedPOIs.length}/6 Trạm Di sản
                  </div>
                  <div className="text-[11px] text-stone-500">
                    Nghi môn ngoại, Nhà khách, Tam tòa Chính diện...
                  </div>
                </div>
                <span className="text-[11px] font-extrabold text-[#8B1E1E]">
                  +{studentProfile.completedPOIs.length * 50} XP
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-stone-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-stone-900">
                    Bài kiểm tra Đấu trường Lịch sử Hai Bà Trưng
                  </div>
                  <div className="text-[11px] text-stone-500">
                    Điểm cao nhất: {studentProfile.quizScore}/100 điểm
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateTab("quiz")}
                  className="text-[11px] font-extrabold text-[#2F6F68] hover:underline cursor-pointer"
                >
                  Làm lại →
                </button>
              </div>
            </div>
          </div>

            <button
              type="button"
              onClick={() => onNavigateTab("passport")}
              className="w-full py-3.5 rounded-2xl bg-[#8B1E1E] hover:bg-[#6E1414] text-white font-extrabold text-xs border border-[#D4AF37] shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Award className="w-4 h-4 text-[#D4AF37]" />
              <span>Xem Toàn Bộ Hộ Chiếu & Bộ Sưu Tập Huy Hiệu</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCertificateModal(true)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:brightness-105 text-[#1A0D0E] font-extrabold text-xs border border-[#8B1E1E]/30 shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Medal className="w-4 h-4 text-[#8B1E1E]" />
              <span>Xuất Chứng Nhận Hoàn Thành Di Sản (PDF)</span>
            </button>

            {/* Nhật ký khám phá cá nhân */}
            <div className="pt-3 border-t border-stone-200 space-y-2.5">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#1F544E]">
                📓 Nhật Ký Khám Phá Di Sản Của Em
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={journalNote}
                  onChange={(e) => setJournalNote(e.target.value)}
                  placeholder="Ghi chép điều em học được hôm nay..."
                  className="flex-1 px-3 py-2 rounded-xl bg-[#FAF8F5] border border-stone-300 text-xs font-medium focus:outline-none focus:border-[#8B1E1E]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!journalNote.trim()) return;
                    setJournalEntries((prev) => [
                      {
                        id: `j-${Date.now()}`,
                        station: "Ghi chép trải nghiệm Đền Hai Bà Trưng",
                        note: journalNote.trim(),
                        date: "Vừa xong"
                      },
                      ...prev
                    ]);
                    setJournalNote("");
                    if (onAddXp) onAddXp(15);
                  }}
                  className="px-3 py-2 rounded-xl bg-[#1F544E] text-white text-xs font-extrabold cursor-pointer shrink-0"
                >
                  Lưu (+15 XP)
                </button>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {journalEntries.map((entry) => (
                  <div key={entry.id} className="p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200 text-xs">
                    <div className="flex items-center justify-between font-bold text-[#8B1E1E] text-[11px]">
                      <span>{entry.station}</span>
                      <span className="text-stone-400">{entry.date}</span>
                    </div>
                    <p className="text-stone-700 mt-0.5">{entry.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      {/* PDF CERTIFICATE MODAL */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-3xl border-4 border-[#D4AF37] max-w-2xl w-full p-6 sm:p-10 shadow-2xl space-y-6 text-center relative">
            <div className="border-2 border-[#8B1E1E]/30 rounded-2xl p-6 sm:p-8 space-y-4">
              <div className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#8B1E1E]">
                HỆ SINH THÁI SỐ MÊ LINH HERITAGE
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-cinzel text-[#8B1E1E]">
                GIẤY CHỨNG NHẬN ĐẠI SỨ DI SẢN SỐ
              </h3>
              <p className="text-xs text-stone-600">
                Ban Quản lý & Hệ thống Giáo dục Di sản Số Đền Hai Bà Trưng – Mê Linh chứng nhận học sinh:
              </p>
              <div className="text-2xl sm:text-3xl font-extrabold font-cinzel text-[#2C1A1D] py-1">
                {studentProfile.name}
              </div>
              <div className="text-xs sm:text-sm font-bold text-stone-700">
                {studentProfile.grade} · {studentProfile.school}
              </div>
              <p className="text-xs text-stone-600 max-w-lg mx-auto leading-relaxed">
                Đã hoàn thành xuất sắc chương trình khám phá{" "}
                <strong>{studentProfile.completedPOIs.length}/6 Trạm Di tích Quốc gia Đặc biệt Đền Hai Bà Trưng</strong>, đạt{" "}
                <strong>{studentProfile.xp} XP</strong> (Cấp độ:{" "}
                <strong>
                  {studentProfile.xp >= 300
                    ? "Cấp 3: Đại sứ di sản"
                    : studentProfile.xp >= 150
                    ? "Cấp 2: Nhà khám phá lịch sử"
                    : "Cấp 1: Tập sự di sản"}
                </strong>
                ) và mở khóa <strong>{studentProfile.unlockedBadgeIds.length} Huy hiệu Di sản</strong>.
              </p>
              <div className="pt-4 flex items-center justify-between text-xs text-stone-500 border-t border-stone-200">
                <span>Mã chứng nhận: ML-CERT-{studentProfile.id.toUpperCase()}</span>
                <span>Xã Mê Linh, TP. Hà Nội</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-6 py-3 rounded-2xl bg-[#8B1E1E] hover:bg-[#6E1414] text-white font-extrabold text-xs sm:text-sm border border-[#D4AF37] shadow-lg cursor-pointer"
              >
                🖨️ In / Tải Chứng Nhận PDF
              </button>
              <button
                type="button"
                onClick={() => setShowCertificateModal(false)}
                className="px-5 py-3 rounded-2xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs sm:text-sm cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 7. BẢN ĐỒ ĐỊNH VỊ VỆ TINH GOOGLE MAPS QUẦN THỂ DI TÍCH MÊ LINH       */}
      {/* ===================================================================== */}
      <section className="bg-white rounded-3xl border-2 border-[#D4AF37] p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#8B1E1E]">
              GOOGLE MAPS SATELLITE & ĐỊNH VỊ DI SẢN
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold font-cinzel text-[#2C1A1D] mt-0.5">
              Bản Đồ Thực Tế Khu Di Tích Quốc Gia Đặc Biệt Đền Hai Bà Trưng – Mê Linh
            </h3>
            <p className="text-xs text-stone-600">
              Địa chỉ: Thôn Hạ Lôi, Xã Mê Linh, Thành phố Hà Nội (Tọa độ GPS: 21.1865° N, 105.7235° E)
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab("map")}
            className="px-4 py-2.5 rounded-2xl bg-[#8B1E1E] hover:bg-[#6E1414] text-white font-extrabold text-xs border border-[#D4AF37] flex items-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <Compass className="w-4 h-4 text-[#D4AF37]" />
            <span>Mở Bản Đồ Tương Tác 12 Điểm & VR 360°</span>
          </button>
        </div>

        <div className="w-full h-72 sm:h-80 rounded-2xl overflow-hidden border-2 border-[#D4AF37]/60 shadow-inner">
          <iframe
            title="Bản đồ Google Maps Đền Hai Bà Trưng Mê Linh"
            src="https://www.google.com/maps?q=Den+Hai+Ba+Trung+Me+Linh+Ha+Noi&hl=vi&z=16&output=embed"
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </div>
  );
};

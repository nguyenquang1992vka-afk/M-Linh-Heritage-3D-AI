import React, { useState } from "react";
import { UserRole, StudentProfile, UserAccount } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { updateUserProfileInDb } from "../services/heritageDatabase";
import coMeLinhAvatar from "../assets/images/co_me_linh_ai_avatar_1790426772614.jpg";
import {
  Compass,
  Bot,
  Award,
  Bell,
  Home,
  MapPin,
  X,
  LogOut,
  ShieldCheck,
  ChevronDown,
  BookOpen,
  Gamepad2,
  Flame,
  GraduationCap,
  Users,
  Box,
  Music,
  Calendar,
  Lock,
  UserCheck,
  LogIn,
  User,
  CheckCircle2,
  Loader2,
  MessageSquareHeart
} from "lucide-react";

interface HeaderProps {
  currentUser?: UserAccount | null;
  onUpdateCurrentUser?: (
    updatedUser: UserAccount,
    updatedStudentProfile?: StudentProfile | null
  ) => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onRequestAuthForRole?: (
    role: "student" | "teacher" | "admin" | "visitor",
    visitorSubMode?: "guest" | "registered"
  ) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  studentProfile: StudentProfile;
  isMuted: boolean;
  onToggleMute: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onUpdateCurrentUser,
  currentRole,
  onRoleChange,
  onRequestAuthForRole,
  activeTab,
  onTabChange,
  studentProfile,
  onLogout
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState(currentUser?.name || "");
  const [profileSchool, setProfileSchool] = useState(
    currentUser?.school || "Trường Tiểu học Văn Khê – Xã Mê Linh, TP. Hà Nội"
  );
  const [profileGrade, setProfileGrade] = useState(
    currentUser?.grade || studentProfile.grade || "Lớp 4A"
  );
  const [profilePhone, setProfilePhone] = useState(currentUser?.phoneNumber || "");
  const [profileNewPassword, setProfileNewPassword] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveMsg, setProfileSaveMsg] = useState<string | null>(null);

  const handleOpenProfileModal = () => {
    setProfileName(currentUser?.name || displayName);
    setProfileSchool(
      currentUser?.school ||
        studentProfile.school ||
        "Trường Tiểu học Văn Khê – Xã Mê Linh, TP. Hà Nội"
    );
    setProfileGrade(currentUser?.grade || studentProfile.grade || "Lớp 4A");
    setProfilePhone(currentUser?.phoneNumber || "");
    setProfileNewPassword("");
    setProfileSaveMsg(null);
    setShowUserDropdown(false);
    setShowProfileModal(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !profileName.trim()) return;
    if (currentUser.email?.toLowerCase() !== "nguyenquang1992vka@gmail.com") {
      setProfileSaveMsg(
        "⚠️ Chỉ tài khoản Quản trị viên mặc định (nguyenquang1992vka@gmail.com) mới có quyền chỉnh sửa."
      );
      return;
    }
    setIsSavingProfile(true);
    setProfileSaveMsg(null);
    const res = await updateUserProfileInDb({
      userId: currentUser.id,
      email: currentUser.email,
      name: profileName.trim(),
      school: profileSchool.trim(),
      grade: profileGrade.trim(),
      phoneNumber: profilePhone.trim(),
      newPassword: profileNewPassword.trim() || undefined
    });
    setIsSavingProfile(false);
    if (res.error) {
      setProfileSaveMsg(`⚠️ ${res.error}`);
      return;
    }
    if (res.user && onUpdateCurrentUser) {
      onUpdateCurrentUser(
        {
          ...currentUser,
          ...res.user
        },
        res.studentProfile
      );
    }
    setProfileNewPassword("");
    setProfileSaveMsg(
      language === "vi"
        ? "✓ Đã lưu Hồ sơ Tài khoản vào Cơ sở Dữ liệu!"
        : "✓ Account Profile saved to Database!"
    );
  };

  const isGuestVisitor = currentRole === "visitor" && Boolean(currentUser?.isGuest);
  const isMasterAdmin = Boolean(
    currentUser &&
      currentUser.role === "admin" &&
      currentUser.email?.toLowerCase() === "nguyenquang1992vka@gmail.com"
  );

  const notifications =
    language === "vi"
      ? [
          {
            id: 1,
            title: "Chào mừng đến với Mê Linh Smart Heritage!",
            desc: "Hệ sinh thái học tập di sản số AI đã xác thực phiên truy cập.",
            time: "Vừa xong"
          },
          {
            id: 2,
            title: "Nhiệm vụ học tập mới: Khám phá Lễ hội Rước Kiệu",
            desc: "Hoàn thành câu đố Lễ hội Đền Hai Bà Trưng nhận +40 Điểm XP!",
            time: "5 phút trước"
          },
          {
            id: 3,
            title: "Trợ lý AI di sản đang trực tuyến",
            desc: "Trò chuyện cùng Trợ lý AI di sản để nhận +15 Điểm XP mỗi câu hỏi.",
            time: "10 phút trước"
          }
        ]
      : [
          {
            id: 1,
            title: "Welcome to Me Linh Smart Heritage!",
            desc: "Authenticated AI digital heritage learning ecosystem is ready.",
            time: "Just now"
          },
          {
            id: 2,
            title: "New Learning Mission: Explore the Palanquin Festival",
            desc: "Complete the festival challenge to earn +40 XP Points!",
            time: "5 mins ago"
          },
          {
            id: 3,
            title: "AI Heritage Assistant is online",
            desc: "Chat with AI Heritage Assistant to earn +15 XP Points per question.",
            time: "10 mins ago"
          }
        ];

  const displayName =
    currentUser?.name ||
    (currentRole === "teacher"
      ? language === "vi"
        ? "Cổng giáo viên"
        : "Teacher Portal"
      : currentRole === "visitor"
      ? language === "vi"
        ? "Khách tham quan"
        : "Visitor"
      : studentProfile.name);

  // Strict Role-Based Access Control (RBAC) Navigation Items
  const navItems = [
    ...(currentRole === "admin"
      ? [
          {
            id: "admin-dashboard",
            labelVi: "📊 Quản trị viên",
            labelEn: "📊 Administrator",
            icon: ShieldCheck,
            onClick: () => onTabChange("admin-dashboard")
          },
          {
            id: "teacher-content-center",
            labelVi: "Biên tập Nội dung",
            labelEn: "Content Center",
            icon: BookOpen,
            onClick: () => onTabChange("teacher-content-center")
          },
          {
            id: "visitor-registration",
            labelVi: "📅 Quản lý Đoàn Tham quan",
            labelEn: "📅 Visitor Bookings",
            icon: Calendar,
            onClick: () => onTabChange("visitor-registration")
          }
        ]
      : []),
    ...(currentRole === "teacher"
      ? [
          {
            id: "teacher-overview",
            labelVi: "👩‍🏫 Cổng giáo viên",
            labelEn: "👩‍🏫 Teacher Portal",
            icon: Users,
            onClick: () => onTabChange("teacher-overview")
          }
        ]
      : []),
    ...(currentRole === "student"
      ? [
          {
            id: "student-home",
            labelVi: "🧑‍🎓 Cổng học sinh",
            labelEn: "🧑‍🎓 Student Portal",
            icon: Home,
            onClick: () => onTabChange("student-home")
          },
          {
            id: "heritage-academy",
            labelVi: "🎮 Học viện Di sản số",
            labelEn: "🎮 Heritage Academy",
            icon: Gamepad2,
            onClick: () => onTabChange("heritage-academy")
          },
          {
            id: "community",
            labelVi: "📝 Đăng bài & Bình luận",
            labelEn: "📝 Student Feed",
            icon: MessageSquareHeart,
            onClick: () => onTabChange("community")
          },
          {
            id: "passport",
            labelVi: "🏅 Huy hiệu",
            labelEn: "🏅 Badges",
            icon: Award,
            onClick: () => onTabChange("passport")
          },
          {
            id: "quiz",
            labelVi: "🎯 Nhiệm vụ học tập",
            labelEn: "🎯 Learning Missions",
            icon: Gamepad2,
            onClick: () => onTabChange("quiz")
          }
        ]
      : []),
    ...(currentRole === "visitor"
      ? [
          {
            id: "visitor-registration",
            labelVi: "📅 Đăng ký Đặt Tour Tham quan",
            labelEn: "📅 Book Tour Online",
            icon: Calendar,
            onClick: () => onTabChange("visitor-registration")
          }
        ]
      : []),
    {
      id: "map-stations",
      labelVi: "🏛 Khám phá di sản",
      labelEn: "🏛 Explore Heritage",
      icon: MapPin,
      onClick: () => onTabChange("map-stations")
    },
    {
      id: "map",
      labelVi: "Bản đồ số",
      labelEn: "Digital Map",
      icon: Compass,
      onClick: () => onTabChange("map")
    },
    {
      id: "artifacts",
      labelVi: "Bảo tàng số",
      labelEn: "Digital Museum",
      icon: Box,
      onClick: () => onTabChange("artifacts")
    },
    {
      id: "festivals",
      labelVi: "Lễ hội",
      labelEn: "Festivals",
      icon: Flame,
      onClick: () => onTabChange("festivals")
    },
    {
      id: "ai-chat",
      labelVi: "🤖 Trợ lý AI di sản",
      labelEn: "🤖 AI Heritage Assistant",
      icon: Bot,
      onClick: () => onTabChange("ai-chat"),
      isSpecialAI: true
    }
  ];

  const handleGoHomeForRole = () => {
    if (currentRole === "admin") onTabChange("admin-dashboard");
    else if (currentRole === "teacher") onTabChange("teacher-overview");
    else if (currentRole === "visitor") onTabChange("map-stations");
    else onTabChange("student-home");
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#1A0D0E] via-[#2C1416] to-[#1A0D0E] border-b-2 border-[#D4AF37]/60 shadow-xl text-white transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-col gap-2">
        {/* Top Row: Brand Identity + Authenticated Portal Badge + Profile */}
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* 1. Brand Logo */}
          <div
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0 min-w-0"
            onClick={handleGoHomeForRole}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-[#9E2A2B] to-[#6A1515] p-0.5 border-2 border-[#D4AF37] shadow-md flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <span className="text-base sm:text-lg">🏛️</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-xl font-extrabold text-[#F8F5EF] tracking-tight font-cinzel leading-none truncate">
                MÊ LINH HERITAGE
              </h1>
              <p className="text-[10px] sm:text-xs text-[#D4AF37] font-semibold tracking-wide mt-0.5 truncate">
                {t("app_subtitle")}
              </p>
            </div>
          </div>

          {/* Right Controls: Active Authenticated Portal Status + Student XP + Language + User Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Authenticated Role Security Badge (RBAC Enforced) */}
            <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-black/45 border border-[#D4AF37]/60 text-xs font-extrabold">
              {currentRole === "visitor" ? (
                <>
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-200">{t("visitor")}</span>
                  <button
                    type="button"
                    onClick={() => onTabChange("visitor-registration")}
                    className="ml-1.5 px-2.5 py-0.5 rounded-lg bg-[#D4AF37] text-[#1A0D0E] text-[11px] font-extrabold hover:brightness-110 cursor-pointer"
                  >
                    {t("book_tour")}
                  </button>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">
                    {currentRole === "admin"
                      ? t("admin")
                      : currentRole === "teacher"
                      ? t("teacher")
                      : t("student")}
                  </span>
                </>
              )}
            </div>

            {/* Live Student XP & Level Indicator (Only shown for Student role) */}
            {currentRole === "student" && (
              <button
                onClick={() => onTabChange("passport")}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-[#D4AF37]/50 text-xs font-bold transition-all cursor-pointer"
                title={t("xp_points")}
              >
                <span className="text-[#D4AF37]">
                  ⚡ {studentProfile.xp} {language === "vi" ? "Điểm XP" : "XP Points"}
                </span>
                <span className="text-white/30">·</span>
                <span className="text-amber-100">
                  {language === "vi" ? studentProfile.levelTitle : "Heritage Ambassador"}
                </span>
              </button>
            )}

            {/* Language Switcher Toggle - Always Visible on Desktop, Tablet, Mobile */}
            <div className="flex items-center bg-black/40 p-1 rounded-2xl border border-[#D4AF37]/50">
              <button
                onClick={() => setLanguage("vi")}
                className={`px-2 sm:px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                  language === "vi"
                    ? "bg-[#9E2A2B] text-white border border-[#D4AF37]/60 shadow-xs"
                    : "text-stone-300 hover:text-white"
                }`}
              >
                <span>🇻🇳</span>
                <span>Tiếng Việt</span>
              </button>
              <span className="text-white/20 font-light px-0.5">|</span>
              <button
                onClick={() => setLanguage("en")}
                className={`px-2 sm:px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                  language === "en"
                    ? "bg-[#9E2A2B] text-white border border-[#D4AF37]/60 shadow-xs"
                    : "text-stone-300 hover:text-white"
                }`}
              >
                <span>🇬🇧</span>
                <span>English</span>
              </button>
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-[#D4AF37]/40 text-[#D4AF37] transition-colors relative cursor-pointer"
                title={t("nav_notifications")}
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-1 ring-white"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white text-[#242424] rounded-2xl border-2 border-[#D4AF37] shadow-2xl p-4 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100 mb-3">
                    <h4 className="font-bold text-xs text-[#8B1E1E] flex items-center gap-1.5 uppercase font-cinzel">
                      <Bell className="w-3.5 h-3.5 text-[#D4AF37]" /> {t("nav_notifications")}
                    </h4>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-stone-400 hover:text-stone-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className="bg-[#F8F5EF] p-2.5 rounded-xl border border-[#D4AF37]/30 text-xs"
                      >
                        <div className="font-bold text-[#242424]">{n.title}</div>
                        <div className="text-[11px] text-stone-600 mt-0.5 leading-snug">{n.desc}</div>
                        <div className="text-[10px] text-stone-400 text-right mt-1">{n.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1.5 pl-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-[#D4AF37]/50 transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#9E2A2B] to-[#D4AF37] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {currentRole === "admin"
                    ? "👑"
                    : currentRole === "teacher"
                    ? "👩‍🏫"
                    : currentRole === "visitor"
                    ? "🧭"
                    : "👨‍🎓"}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">
                    {displayName}
                  </div>
                  <div className="text-[10px] text-[#D4AF37] font-semibold tracking-wide uppercase">
                    {currentRole === "admin"
                      ? t("role_admin")
                      : currentRole === "teacher"
                      ? t("role_teacher")
                      : currentRole === "visitor"
                      ? t("role_visitor")
                      : t("role_student")}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-amber-200" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-3 w-72 bg-white text-[#242424] rounded-2xl border-2 border-[#D4AF37] shadow-2xl p-2.5 z-50 text-xs">
                  <div className="p-2.5 border-b border-stone-100 mb-1.5 bg-[#FAF8F5] rounded-xl">
                    <div className="flex items-center justify-between">
                      <p className="font-extrabold text-stone-900">{displayName}</p>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {isGuestVisitor
                          ? language === "vi"
                            ? "Khách tham quan"
                            : "Guest"
                          : language === "vi"
                          ? "Đã xác thực"
                          : "Verified"}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 font-mono mt-0.5 truncate">
                      {currentUser?.email || "guest@melinh-heritage.vn"}
                    </p>
                    {isMasterAdmin && (
                      <button
                        type="button"
                        onClick={handleOpenProfileModal}
                        className="mt-2 w-full py-1.5 px-2.5 rounded-lg bg-[#8B1E1E] hover:bg-[#6E1414] text-white text-[11px] font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>
                          {language === "vi" ? "Hồ sơ Quản trị viên" : "Administrator Profile"}
                        </span>
                      </button>
                    )}
                  </div>

                  <div className="px-2.5 py-1 text-[10px] font-extrabold text-stone-400 uppercase">
                    {language === "vi"
                      ? "Chuyển Cổng Đăng nhập"
                      : "Switch Portal"}
                  </div>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      if (currentRole === "student") {
                        onTabChange("student-home");
                      } else if (onRequestAuthForRole) {
                        onRequestAuthForRole("student");
                      }
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#F8F5EF] text-stone-700 font-bold flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-[#8B1E1E]" />
                      <span>{t("student")}</span>
                    </span>
                    {currentRole !== "student" && <Lock className="w-3.5 h-3.5 text-stone-400" />}
                  </button>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      if (currentRole === "teacher") {
                        onTabChange("teacher-overview");
                      } else if (onRequestAuthForRole) {
                        onRequestAuthForRole("teacher");
                      }
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#F8F5EF] text-stone-700 font-bold flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#2F6F68]" />
                      <span>{t("teacher")}</span>
                    </span>
                    {currentRole !== "teacher" && <Lock className="w-3.5 h-3.5 text-stone-400" />}
                  </button>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      if (currentRole === "admin") {
                        onTabChange("admin-dashboard");
                      } else if (onRequestAuthForRole) {
                        onRequestAuthForRole("admin");
                      }
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-amber-50 text-[#8B1E1E] font-bold flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                      <span>{t("admin")}</span>
                    </span>
                    {currentRole !== "admin" && <Lock className="w-3.5 h-3.5 text-stone-400" />}
                  </button>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      if (currentRole === "visitor") {
                        onTabChange("visitor-registration");
                      } else {
                        onRoleChange("visitor");
                      }
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FFFBEB] text-[#9A3412] font-bold flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#9A3412]" />
                      <span>{t("visitor")}</span>
                    </span>
                  </button>

                  {onLogout && (
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold flex items-center gap-2 border-t border-stone-100 mt-1.5 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t("nav_logout")}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Direct Logout Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-3 py-1.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#E5BE38] hover:brightness-105 text-[#1A0D0E] font-extrabold text-xs shadow-md flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                title={t("nav_logout")}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t("nav_logout")}</span>
              </button>
            )}
          </div>
        </div>

        {/* Second Row: Role-Authorized Navigation Bar */}
        <nav className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none border-t border-white/10">
          {navItems.map((item) => {
            const IconComp = item.icon;
            const isActive =
              activeTab === item.id ||
              (item.id === "quiz" && activeTab === "paint") ||
              (item.id === "teacher-overview" && activeTab.startsWith("teacher-"));

            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-[#D4AF37] to-[#E5BE38] text-[#1A0D0E] shadow-md"
                    : item.isSpecialAI
                    ? "bg-[#9E2A2B]/80 hover:bg-[#9E2A2B] text-amber-100 border border-[#D4AF37]/50"
                    : "text-amber-100/85 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.isSpecialAI ? (
                  <img
                    src={coMeLinhAvatar}
                    alt="Trợ lý Di sản AI"
                    referrerPolicy="no-referrer"
                    className="w-4 h-4 rounded-full object-cover border border-[#D4AF37]"
                  />
                ) : (
                  <IconComp className="w-3.5 h-3.5" />
                )}
                <span>{language === "vi" ? item.labelVi : item.labelEn}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* REAL USER PROFILE MODAL (Students, Teachers, Admins, Registered Visitors) */}
      {showProfileModal && currentUser && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] text-stone-900 rounded-3xl border-2 border-[#D4AF37] shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-gradient-to-r from-[#1A0D0E] via-[#2C1416] to-[#1A0D0E] p-5 text-white flex items-center justify-between border-b border-[#D4AF37]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#8B1E1E] border border-[#D4AF37] flex items-center justify-center text-xl">
                  {currentRole === "admin"
                    ? "👑"
                    : currentRole === "teacher"
                    ? "👩‍🏫"
                    : currentRole === "visitor"
                    ? "🌏"
                    : "🧑‍🎓"}
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#D4AF37]">
                    {language === "vi"
                      ? "HỒ SƠ TÀI KHOẢN XÁC THỰC"
                      : "VERIFIED USER PROFILE"}
                  </span>
                  <h3 className="font-cinzel font-extrabold text-lg text-white">
                    {currentUser.name}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-rose-600 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-4 text-xs">
              {profileSaveMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{profileSaveMsg}</span>
                </div>
              )}

              {/* Role-Specific Database Summary */}
              {currentRole === "student" && (
                <div className="grid grid-cols-3 gap-2.5 bg-white p-3.5 rounded-2xl border border-[#D4AF37]/60 text-center">
                  <div>
                    <div className="text-[10px] font-bold text-stone-500 uppercase">
                      {t("xp_points")}
                    </div>
                    <div className="text-base font-extrabold text-[#8B1E1E]">
                      ⚡ {studentProfile.xp} XP
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-stone-500 uppercase">
                      {language === "vi" ? "TRẠM HOÀN THÀNH" : "COMPLETED STATIONS"}
                    </div>
                    <div className="text-base font-extrabold text-[#2F6F68]">
                      {studentProfile.completedPOIs.length}/6
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-stone-500 uppercase">
                      {t("badges")}
                    </div>
                    <div className="text-base font-extrabold text-amber-700">
                      🏅 {studentProfile.unlockedBadgeIds.length}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-extrabold text-stone-700 uppercase mb-1">
                    {language === "vi" ? "Họ và tên *" : "Full Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 font-bold text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-stone-700 uppercase mb-1">
                    {language === "vi" ? "Email tài khoản" : "Account Email"}
                  </label>
                  <input
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 border border-stone-200 font-mono text-stone-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-stone-700 uppercase mb-1">
                    {language === "vi" ? "Trường học / Đơn vị" : "School / Organization"}
                  </label>
                  <input
                    type="text"
                    value={profileSchool}
                    onChange={(e) => setProfileSchool(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 font-semibold text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-stone-700 uppercase mb-1">
                    {language === "vi" ? "Lớp học / Chuyên môn" : "Class / Department"}
                  </label>
                  <input
                    type="text"
                    value={profileGrade}
                    onChange={(e) => setProfileGrade(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 font-semibold text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-stone-700 uppercase mb-1">
                    {language === "vi" ? "Số điện thoại liên hệ" : "Phone Number"}
                  </label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="0912 345 678"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 font-semibold text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-stone-700 uppercase mb-1">
                    {language === "vi"
                      ? "Đổi mật khẩu mới (Tùy chọn)"
                      : "New Password (Optional)"}
                  </label>
                  <input
                    type="password"
                    value={profileNewPassword}
                    onChange={(e) => setProfileNewPassword(e.target.value)}
                    placeholder={
                      language === "vi" ? "Để trống nếu giữ nguyên" : "Leave blank to keep current"
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 font-semibold text-stone-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold cursor-pointer"
                >
                  {t("btn_close")}
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8B1E1E] to-[#B22222] text-white font-extrabold border border-[#D4AF37] shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  {isSavingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>
                    {language === "vi" ? "Lưu Hồ Sơ" : "Save Profile"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

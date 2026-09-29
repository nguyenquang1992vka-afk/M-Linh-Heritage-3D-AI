import React, { useState, useEffect } from "react";
import { 
  UserRole, 
  StudentProfile, 
  HeritagePOI, 
  UserAccount, 
  StudentPost, 
  MediaItem, 
  HomepageContentConfig,
  SchoolClass,
  PlatformAnalyticsState,
  VisitorRegistration
} from "./types";
import { 
  INITIAL_POIS, 
  INITIAL_BADGES, 
  INITIAL_ARTIFACTS, 
  DEFAULT_QUIZZES, 
  MOCK_CLASS_PROGRESS,
  INITIAL_HOMEPAGE_CONFIG,
  INITIAL_STUDENT_POSTS,
  INITIAL_MEDIA_LIBRARY,
  INITIAL_USER_ACCOUNTS,
  INITIAL_CLASSES
} from "./data/heritageData";
import {
  INITIAL_PLATFORM_ANALYTICS,
  detectClientDeviceType,
  generateAnonymousSessionId,
  normalizePlatformAnalytics
} from "./data/analyticsData";
import {
  fetchDatabaseState,
  recordVisitorSession,
  trackVisitorJourneyUpdate,
  syncStudentProgressToDb,
  recordQuizAttemptInDb,
  recordTeacherActionInDb,
  verifySessionToken,
  saveRegisteredVisitorHistory,
  logoutEverywhere,
  manageAdminAccountInDb,
  manageTeacherClassInDb,
  recordProgressEventInDb,
  trackUserActivityEvent
} from "./services/heritageDatabase";
import { Header } from "./components/Header";
import { LoginScreen } from "./components/LoginScreen";
import { AdminDashboard } from "./components/AdminDashboard";
import { StudentDashboard } from "./components/StudentDashboard";
import { InteractiveMap } from "./components/InteractiveMap";
import { POIDetailModal } from "./components/POIDetailModal";
import { AIChatBot } from "./components/AIChatBot";
import { HeritageQuizModal } from "./components/HeritageQuizModal";
import { ArtifactsGallery } from "./components/ArtifactsGallery";
import { HeritageCanvasGame } from "./components/HeritageCanvasGame";
import { BadgePassport } from "./components/BadgePassport";
import { TeacherDashboard } from "./components/TeacherDashboard";
import { TeacherContentCenter } from "./components/TeacherContentCenter";
import { HeritageSocialFeed } from "./components/HeritageSocialFeed";
import { FestivalsModule } from "./components/FestivalsModule";
import { DenHaiBaTrungDetailPage } from "./components/DenHaiBaTrungDetailPage";
import { VisitorRegistrationPortal } from "./components/VisitorRegistrationPortal";
import { HeritageMusicPlayer } from "./components/HeritageMusicPlayer";
import { DigitalHeritageAcademy } from "./components/DigitalHeritageAcademy";
import { Footer } from "./components/Footer";
import { useLanguage } from "./context/LanguageContext";
import { soundManager } from "./utils/audioUtils";
import templeBgImage from "./assets/images/den_hai_ba_trung_real.jpg";

export default function App() {
  const { language, t } = useLanguage();
  // Accounts and Classes Collections (Persisted in state & localStorage)
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem("me_linh_user_accounts");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse user accounts", e);
      }
    }
    return INITIAL_USER_ACCOUNTS;
  });

  const [classes, setClasses] = useState<SchoolClass[]>(() => {
    const saved = localStorage.getItem("me_linh_classes");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse classes", e);
      }
    }
    return INITIAL_CLASSES;
  });

  // Current Logged In User (Starts at null so the user immediately sees the 3 Clear Login Portals: Học sinh, Giáo viên, Du khách)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const savedSession = sessionStorage.getItem("me_linh_portal_session_v3");
    if (savedSession) {
      try {
        return JSON.parse(savedSession);
      } catch (e) {
        console.error("Failed to parse logged in user", e);
      }
    }
    return null;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(currentUser?.role || "student");
  const isMasterAdmin = Boolean(
    currentUser &&
      currentUser.role === "admin" &&
      currentUser.email?.toLowerCase() === "nguyenquang1992vka@gmail.com"
  );
  const [loginInitialRole, setLoginInitialRole] = useState<
    "student" | "teacher" | "admin" | "visitor"
  >("student");
  const [loginVisitorSubMode, setLoginVisitorSubMode] = useState<"guest" | "registered">("guest");
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (currentUser?.role === "admin") return "admin-dashboard";
    if (currentUser?.role === "teacher") return "teacher-overview";
    if (currentUser?.role === "visitor") return "map-stations";
    return "student-home";
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // App Dynamic State editable via Teacher / Admin Content Center
  const [homepageConfig, setHomepageConfig] = useState<HomepageContentConfig>(INITIAL_HOMEPAGE_CONFIG);
  const [studentPosts, setStudentPosts] = useState<StudentPost[]>(() => {
    const saved = localStorage.getItem("me_linh_student_posts_v2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse student posts", e);
      }
    }
    return INITIAL_STUDENT_POSTS;
  });
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>(INITIAL_MEDIA_LIBRARY);
  const [visitorRegistrations, setVisitorRegistrations] = useState<VisitorRegistration[]>([]);
  const [pois, setPois] = useState<HeritagePOI[]>(INITIAL_POIS);
  const [artifacts, setArtifacts] = useState(INITIAL_ARTIFACTS);
  const [quizzes, setQuizzes] = useState(DEFAULT_QUIZZES);
  const [badges, setBadges] = useState(INITIAL_BADGES);
  const [studentsList, setStudentsList] = useState(MOCK_CLASS_PROGRESS);

  // Platform-wide Smart Heritage AI Analytics State (Persisted in localStorage)
  const [platformAnalytics, setPlatformAnalytics] = useState<PlatformAnalyticsState>(() => {
    const saved = localStorage.getItem("me_linh_platform_analytics_v3");
    if (saved) {
      try {
        return normalizePlatformAnalytics(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse platform analytics", e);
      }
    }
    return INITIAL_PLATFORM_ANALYTICS;
  });

  // Live Anonymous Visitor Session Telemetry (Zero PII: sessionId, visitTime, viewedLocations, tourDuration, deviceType)
  const [anonSessionId] = useState<string>(() => generateAnonymousSessionId());
  const [clientDeviceType] = useState(() => detectClientDeviceType());
  const [visitorTourSeconds, setVisitorTourSeconds] = useState<number>(0);
  const [viewedVisitorLocations, setViewedVisitorLocations] = useState<string[]>([
    "Trạm 1: Nghi môn Đền",
    "Trạm 3: Tam tòa chính diện"
  ]);
  const [latestVisitorBooking, setLatestVisitorBooking] = useState<VisitorRegistration | null>(
    null
  );

  // Student Progress State
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem("me_linh_student_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.completedPOIs)) {
          parsed.completedPOIs = parsed.completedPOIs.map((id: string) =>
            id === "nhan-baiduong" ? "nha-khach" : id === "noi-den" ? "chinh-dien" : id
          );
        }
        return parsed;
      } catch (e) {
        console.error("Failed to restore profile", e);
      }
    }
    return {
      id: "std-001",
      name: "Nguyễn Minh Anh",
      grade: "Lớp 4A",
      school: "Trường Tiểu học Văn Khê – Xã Mê Linh, TP. Hà Nội",
      xp: 220,
      level: 2,
      levelTitle: "Sứ Giả Mê Linh",
      streakDays: 3,
      completedPOIs: ["tam-quan", "nha-khach"],
      unlockedBadgeIds: ["badge-first-step"],
      quizScore: 80,
      createdArtworksCount: 0
    };
  });

  // Hydrate state from Real Production Database on mount
  useEffect(() => {
    let mounted = true;
    fetchDatabaseState().then((dbState) => {
      if (!mounted || !dbState) return;
      if (Array.isArray(dbState.userAccounts) && dbState.userAccounts.length > 0) {
        setUserAccounts(dbState.userAccounts);
      }
      if (Array.isArray(dbState.classes) && dbState.classes.length > 0) {
        setClasses(dbState.classes);
      }
      if (dbState.platformAnalytics) {
        setPlatformAnalytics(normalizePlatformAnalytics(dbState.platformAnalytics));
      }
      if (Array.isArray(dbState.classStudentProgress) && dbState.classStudentProgress.length > 0) {
        setStudentsList(dbState.classStudentProgress);
      }
      if (Array.isArray(dbState.mediaLibrary) && dbState.mediaLibrary.length > 0) {
        setMediaLibrary(dbState.mediaLibrary);
      }
      if (Array.isArray(dbState.studentPosts) && dbState.studentPosts.length > 0) {
        setStudentPosts(dbState.studentPosts);
      }
      if (Array.isArray(dbState.visitorRegistrations)) {
        setVisitorRegistrations(dbState.visitorRegistrations);
      }
      if (dbState.studentProfiles && currentUser?.role === "student") {
        const matchedProfile =
          dbState.studentProfiles[currentUser.id] || dbState.studentProfiles["std-001"];
        if (matchedProfile) {
          setStudentProfile(matchedProfile);
        }
      }
    });

    // Verify stored session token if user is logged in with a non-guest account
    if (currentUser?.sessionToken && !currentUser.isGuest) {
      verifySessionToken(currentUser.sessionToken).then((verified) => {
        if (!mounted) return;
        if (!verified) {
          setCurrentUser(null);
        } else if (verified.user) {
          setCurrentUser(verified.user);
          setCurrentRole(verified.user.role);
          if (verified.studentProfile) {
            setStudentProfile(verified.studentProfile);
          }
        }
      });
    }

    return () => {
      mounted = false;
    };
  }, []);

  // Save state back to localStorage
  useEffect(() => {
    localStorage.setItem("me_linh_user_accounts", JSON.stringify(userAccounts));
  }, [userAccounts]);

  useEffect(() => {
    localStorage.setItem("me_linh_classes", JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    try {
      localStorage.setItem("me_linh_student_posts_v2", JSON.stringify(studentPosts));
      fetch("/api/db/student-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentPosts })
      }).catch(() => {});
    } catch (_e) {
      // Ignore storage quota errors
    }
  }, [studentPosts]);

  useEffect(() => {
    localStorage.setItem("me_linh_platform_analytics_v3", JSON.stringify(platformAnalytics));
  }, [platformAnalytics]);

  // Automatic 1-second tour duration tracker when in Visitor Portal + periodic DB sync
  useEffect(() => {
    if (currentRole !== "visitor") return;
    const interval = setInterval(() => {
      setVisitorTourSeconds((prev) => {
        const next = prev + 1;
        if (next % 15 === 0) {
          trackVisitorJourneyUpdate({
            sessionId: anonSessionId,
            tourDurationSeconds: next,
            role: "visitor"
          });
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentRole, anonSessionId]);

  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem("me_linh_portal_session_v3", JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem("me_linh_portal_session_v3");
    }
  }, [currentUser]);

  // Sync Student Profile to Real Database & Firestore whenever progress changes
  useEffect(() => {
    try {
      localStorage.setItem("me_linh_student_profile", JSON.stringify(studentProfile));
      if (currentUser && currentUser.role === "student") {
        syncStudentProgressToDb(studentProfile, currentUser.email).then((updatedAnalytics) => {
          if (updatedAnalytics) {
            setPlatformAnalytics(updatedAnalytics);
          }
        });
      }
    } catch (e) {
      console.error("Failed to save profile", e);
    }
  }, [
    studentProfile.xp,
    studentProfile.level,
    studentProfile.completedPOIs.length,
    studentProfile.unlockedBadgeIds.length,
    studentProfile.quizScore,
    studentProfile.createdArtworksCount
  ]);

  // Handle Login / Select Role from LoginScreen (3 Portals: Student, Teacher, Visitor + Admin)
  const handleLogin = (
    user: UserAccount,
    initialTab?: string,
    serverData?: {
      studentProfile?: StudentProfile | null;
      platformAnalytics?: PlatformAnalyticsState;
    }
  ) => {
    setCurrentUser(user);
    setCurrentRole(user.role);

    if (serverData?.platformAnalytics) {
      setPlatformAnalytics(serverData.platformAnalytics);
    }

    if (user.role === "student") {
      if (serverData?.studentProfile) {
        setStudentProfile(serverData.studentProfile);
      } else {
        setStudentProfile((prev) => ({
          ...prev,
          id: user.id || prev.id,
          name: user.name,
          grade: user.classId ? `Lớp ${user.classId.toUpperCase()}` : (user.grade || prev.grade),
          school: user.school || prev.school || "Trường Tiểu học Văn Khê – Xã Mê Linh, TP. Hà Nội"
        }));
      }
      setActiveTab(initialTab || "student-home");
    } else if (user.role === "teacher") {
      setActiveTab(initialTab || "teacher-overview");
    } else if (user.role === "visitor") {
      setVisitorTourSeconds(12);
      recordVisitorSession({
        sessionId: anonSessionId,
        viewedLocations: viewedVisitorLocations,
        tourDurationSeconds: 180,
        deviceType: clientDeviceType,
        completedTour: false
      }).then((updatedAnalytics) => {
        if (updatedAnalytics) {
          setPlatformAnalytics(updatedAnalytics);
        }
      });
      setActiveTab(initialTab || "map-stations");
    } else if (user.role === "admin") {
      setActiveTab(initialTab || "admin-dashboard");
    }
  };

  // Automatically track feature access whenever an authenticated user or guest visitor navigates tabs
  useEffect(() => {
    if (!currentUser) return;
    const tabLabels: Record<string, string> = {
      "student-home": "Cổng Học sinh – Hành trình Di sản",
      "map-stations": "Khám phá 6 Trạm Di tích Đền Hai Bà Trưng",
      "map": "Bản đồ Số 360° Quần thể Đền Hai Bà Trưng",
      "ai-chat": "Trợ lý Di sản Cô Mê Linh AI",
      "quiz": "Đấu trường Trắc nghiệm Lịch sử",
      "artifacts": "Bảo tàng Số 3D Hiện vật",
      "paint": "Xưởng Vẽ Sắc Màu Di Sản",
      "passport": "Hộ chiếu & Huy hiệu Di sản",
      "festivals": "Lễ hội Đền Hai Bà Trưng (Mùng 6 Tháng Giêng)",
      "visitor-registration": "Cổng Đăng ký Đoàn Tham quan Trực tuyến",
      "teacher-overview": "Cổng Giáo viên – Quản lý Lớp học & Bài giảng",
      "teacher-content-center": "Trung tâm Biên tập Học liệu Số",
      "admin-dashboard": "ADMIN ANALYTICS DASHBOARD – Trung tâm Điều hành"
    };
    const label = tabLabels[activeTab] || `Truy cập chức năng: ${activeTab}`;
    trackUserActivityEvent({
      eventType: activeTab === "ai-chat" ? "use_ai" : activeTab === "map" ? "tour_360" : "access_feature",
      userRole: currentUser.role,
      userName: currentUser.name,
      userEmail: currentUser.email,
      contentUsed: label,
      durationSeconds: Math.max(25, visitorTourSeconds || 45),
      triggerRealtimeEmail: false
    });
  }, [activeTab, currentUser?.id]);

  // Handle Logout
  const handleLogout = async () => {
    await logoutEverywhere(currentUser?.sessionToken, {
      userName: currentUser?.name,
      userEmail: currentUser?.email,
      userRole: currentUser?.role,
      durationSeconds: Math.max(60, visitorTourSeconds || 180)
    });
    setCurrentUser(null);
    setCurrentRole("student");
    setActiveTab("login");
  };

  // Request authentication for a specific target role (Enforces login before accessing private portals)
  const handleRequestAuthForRole = async (
    targetRole: "student" | "teacher" | "admin" | "visitor",
    visitorSubMode: "guest" | "registered" = "registered"
  ) => {
    await logoutEverywhere(currentUser?.sessionToken);
    setLoginInitialRole(targetRole);
    setLoginVisitorSubMode(visitorSubMode);
    setCurrentUser(null);
  };

  // Account Registration handler from LoginScreen
  const handleRegisterTeacher = (newAccount: UserAccount) => {
    setUserAccounts((prev) => {
      if (prev.some((a) => a.email.toLowerCase() === newAccount.email.toLowerCase())) {
        return prev;
      }
      return [newAccount, ...prev];
    });
  };

  // Admin Account Approval Workflows (Persisted in Real Database)
  const handleApproveTeacher = async (id: string) => {
    setUserAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "active" as const } : a))
    );
    const res = await manageAdminAccountInDb({ action: "approve", accountId: id });
    if (res?.userAccounts) setUserAccounts(res.userAccounts);
    if (res?.platformAnalytics) setPlatformAnalytics(res.platformAnalytics);
  };

  const handleRejectTeacher = async (id: string) => {
    setUserAccounts((prev) => prev.filter((a) => a.id !== id));
    const res = await manageAdminAccountInDb({ action: "delete", accountId: id });
    if (res?.userAccounts) setUserAccounts(res.userAccounts);
  };

  const handleSuspendAccount = async (id: string) => {
    setUserAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "suspended" as const } : a))
    );
    const res = await manageAdminAccountInDb({ action: "suspend", accountId: id });
    if (res?.userAccounts) setUserAccounts(res.userAccounts);
  };

  const handleReactivateAccount = async (id: string) => {
    setUserAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "active" as const } : a))
    );
    const res = await manageAdminAccountInDb({ action: "reactivate", accountId: id });
    if (res?.userAccounts) setUserAccounts(res.userAccounts);
  };

  const handleDeleteAccount = async (id: string) => {
    setUserAccounts((prev) => prev.filter((a) => a.id !== id));
    const res = await manageAdminAccountInDb({ action: "delete", accountId: id });
    if (res?.userAccounts) setUserAccounts(res.userAccounts);
  };

  const handleRoleChangeUser = async (id: string, newRole: UserRole) => {
    setUserAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, role: newRole } : a))
    );
    const res = await manageAdminAccountInDb({
      action: "role",
      accountId: id,
      newRole
    });
    if (res?.userAccounts) setUserAccounts(res.userAccounts);
  };

  const handleAddAccount = async (acc: UserAccount) => {
    setUserAccounts((prev) => [acc, ...prev]);
    const res = await manageAdminAccountInDb({
      action: "create",
      accountData: acc
    });
    if (res?.userAccounts) setUserAccounts(res.userAccounts);
    if (res?.platformAnalytics) setPlatformAnalytics(res.platformAnalytics);
  };

  const handleAddClass = async (cls: SchoolClass) => {
    setClasses((prev) => [...prev, cls]);
    const updated = await manageTeacherClassInDb({ action: "create", classData: cls });
    if (updated) setClasses(updated);
  };

  const handleDeleteClass = async (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
    const updated = await manageTeacherClassInDb({ action: "delete", classId: id });
    if (updated) setClasses(updated);
  };

  // Switch role handler in Header (Strictly gated by RBAC for Student/Teacher/Admin; Visitors enter directly to book tours without account/password)
  const handleRoleChange = (role: UserRole) => {
    if (role === "visitor") {
      if (!currentUser || currentUser.role !== "visitor") {
        setCurrentUser({
          id: `vis-${Date.now()}`,
          name: "Khách tham quan Di sản",
          email: "dukhach@melinh-heritage.vn",
          role: "visitor",
          status: "active",
          isGuest: false,
          school: "Khách tham quan Đền Hai Bà Trưng",
          createdAt: new Date().toISOString().slice(0, 10)
        });
      }
      setCurrentRole("visitor");
      setActiveTab("visitor-registration");
      return;
    }
    if (currentUser?.role !== "admin" && role !== currentUser?.role) {
      handleRequestAuthForRole(role, "registered");
      return;
    }
    setCurrentRole(role);
    if (role === "admin") {
      setActiveTab("admin-dashboard");
    } else if (role === "teacher") {
      setActiveTab("teacher-overview");
    } else {
      setActiveTab("student-home");
    }
  };

  // Selected POI for Modal
  const [selectedPoiModal, setSelectedPoiModal] = useState<HeritagePOI | null>(null);

  // Initial prompt for AI Chat when triggered from other components
  const [aiChatInitialPrompt, setAiChatInitialPrompt] = useState<string | undefined>(undefined);

  // Sound toggle handler
  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      soundManager.stopSpeech();
    }
  };

  // Add XP and handle Level Up & automatic badge unlocking
  const handleAddXp = (amount: number) => {
    setStudentProfile((prev) => {
      const newXp = prev.xp + amount;
      let newLevel = prev.level;
      let newTitle = prev.levelTitle;
      const updatedBadges = [...prev.unlockedBadgeIds];

      if (newXp >= 400) {
        newLevel = 4;
        newTitle = "Đại Sứ Di Sản Mê Linh";
        if (!updatedBadges.includes("badge-grand-heritage")) {
          updatedBadges.push("badge-grand-heritage");
        }
      } else if (newXp >= 300) {
        newLevel = 3;
        newTitle = "Hiệp Sĩ Trưng Vương";
      } else if (newXp >= 150) {
        newLevel = 2;
        newTitle = "Sứ Giả Mê Linh";
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        levelTitle: newTitle,
        unlockedBadgeIds: updatedBadges
      };
    });
  };

  // Unlock Badge handler
  const handleUnlockBadge = (badgeId: string) => {
    setStudentProfile((prev) => {
      if (prev.unlockedBadgeIds.includes(badgeId)) return prev;
      return {
        ...prev,
        unlockedBadgeIds: [...prev.unlockedBadgeIds, badgeId]
      };
    });
  };

  // Complete POI Quest
  const handleCompletePoiQuest = (poiId: string, xpReward: number) => {
    setStudentProfile((prev) => {
      const isAlreadyCompleted = prev.completedPOIs.includes(poiId);
      const updatedPOIs = isAlreadyCompleted ? prev.completedPOIs : [...prev.completedPOIs, poiId];
      const updatedBadges = [...prev.unlockedBadgeIds];

      if (!updatedBadges.includes("badge-first-step")) {
        updatedBadges.push("badge-first-step");
      }

      if (updatedPOIs.length >= 6 && !updatedBadges.includes("badge-map-master")) {
        updatedBadges.push("badge-map-master");
      }

      return {
        ...prev,
        completedPOIs: updatedPOIs,
        unlockedBadgeIds: updatedBadges
      };
    });

    handleAddXp(xpReward);
  };

  // Open AI Chat tab with pre-filled question
  const handleOpenAIChatWithQuery = (query?: string) => {
    if (query) {
      setAiChatInitialPrompt(query);
    }
    setActiveTab("ai-chat");
  };

  // If user has not authenticated yet, show Login Screen
  if (!currentUser) {
    return (
      <>
        <LoginScreen
          userAccounts={userAccounts}
          initialRole={loginInitialRole}
          initialVisitorSubMode={loginVisitorSubMode}
          onLogin={handleLogin}
          onRegisterAccount={handleRegisterTeacher}
          onRegisterTeacher={handleRegisterTeacher}
          studentPosts={studentPosts}
          onUpdatePosts={setStudentPosts}
          onVisitorBookingCreated={(registration, updatedList, analytics) => {
            setLatestVisitorBooking(registration);
            if (updatedList) {
              setVisitorRegistrations(updatedList);
            } else {
              setVisitorRegistrations((prev) => [registration, ...prev]);
            }
            if (analytics) {
              setPlatformAnalytics(analytics);
            }
          }}
        />
        <HeritageMusicPlayer onAddXp={handleAddXp} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5EE] text-stone-800 font-serif antialiased flex flex-col justify-between relative overflow-x-hidden selection:bg-[#9E2A2B] selection:text-white">
      {/* Fixed Submerged Heritage Background Frame (Khung nền chìm Đền Hai Bà Trưng) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={templeBgImage}
          alt="Khung nền chìm Đền Hai Bà Trưng Mê Linh"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105 opacity-25 filter contrast-105 saturate-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F8F5EE]/85 via-[#F8F5EE]/78 to-[#F8F5EE]/88 backdrop-blur-[1px]"></div>
        <div className="absolute inset-0 bronze-drum-pattern opacity-25"></div>
      </div>

      {/* Ornate Golden Heritage Outer Frame */}
      <div className="fixed inset-2 sm:inset-3 z-40 pointer-events-none rounded-[26px] border-2 border-[#C9A227]/50 shadow-[inset_0_0_30px_rgba(201,162,39,0.14)]">
        <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-[#9E2A2B]/60 rounded-tl-md"></div>
        <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-[#9E2A2B]/60 rounded-tr-md"></div>
        <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-[#9E2A2B]/60 rounded-bl-md"></div>
        <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-[#9E2A2B]/60 rounded-br-md"></div>
      </div>

      <div className="relative z-10">
        {/* Header Navigation */}
        <Header
          currentUser={currentUser}
          onUpdateCurrentUser={(updatedUser, updatedStudentProfile) => {
            setCurrentUser(updatedUser);
            setUserAccounts((prev) =>
              prev.map((a) => (a.id === updatedUser.id ? updatedUser : a))
            );
            if (updatedStudentProfile) {
              setStudentProfile(updatedStudentProfile);
            }
          }}
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
          onRequestAuthForRole={handleRequestAuthForRole}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          studentProfile={studentProfile}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onLogout={handleLogout}
        />

        {/* Main Content View Container */}
        <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* VISITOR SPACE BANNER (KHÔNG GIAN DU KHÁCH) */}
          {currentRole === "visitor" && (
            <div className="bg-gradient-to-r from-[#78350F] via-[#9A3412] to-[#78350F] text-white rounded-3xl p-4 sm:p-6 border-2 border-[#D4AF37] shadow-xl">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex flex-wrap items-center gap-2 px-3 py-0.5 rounded-full bg-[#D4AF37] text-[#1A0D0E] text-xs font-extrabold uppercase">
                    <span>🌏 {t("visitor")}</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold font-cinzel text-amber-100">
                    {language === "vi"
                      ? "Tham quan và khám phá di sản số Đền Hai Bà Trưng"
                      : "Explore the Hai Ba Trung Temple Digital Heritage"}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveTab("map-stations")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      activeTab === "map-stations"
                        ? "bg-[#D4AF37] text-[#1A0D0E] border-white shadow"
                        : "bg-white/15 hover:bg-white/25 text-white border-[#D4AF37]/60"
                    }`}
                  >
                    🏛 {t("explore")}
                  </button>
                  <button
                    onClick={() => setActiveTab("visitor-registration")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      activeTab === "visitor-registration"
                        ? "bg-[#D4AF37] text-[#1A0D0E] border-white shadow"
                        : "bg-white/15 hover:bg-white/25 text-white border-[#D4AF37]/60"
                    }`}
                  >
                    📅 {t("book_tour")}
                  </button>
                  <button
                    onClick={() => setActiveTab("map")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      activeTab === "map"
                        ? "bg-[#D4AF37] text-[#1A0D0E] border-white shadow"
                        : "bg-white/15 hover:bg-white/25 text-white border-[#D4AF37]/60"
                    }`}
                  >
                    🗺️ {t("digital_map")}
                  </button>
                  <button
                    onClick={() => setActiveTab("artifacts")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      activeTab === "artifacts"
                        ? "bg-[#D4AF37] text-[#1A0D0E] border-white shadow"
                        : "bg-white/15 hover:bg-white/25 text-white border-[#D4AF37]/60"
                    }`}
                  >
                    🏺 {t("digital_museum")}
                  </button>
                  <button
                    onClick={() => setActiveTab("ai-chat")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      activeTab === "ai-chat"
                        ? "bg-[#D4AF37] text-[#1A0D0E] border-white shadow"
                        : "bg-white/15 hover:bg-white/25 text-white border-[#D4AF37]/60"
                    }`}
                  >
                    🤖 {t("ai_heritage_assistant")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 1. TRUNG TÂM ĐIỀU HÀNH DI SẢN SỐ (ADMIN DASHBOARD - ONLY MASTER ADMIN) */}
          {isMasterAdmin && activeTab === "admin-dashboard" && (
            <AdminDashboard
              userAccounts={userAccounts}
              classes={classes}
              platformAnalytics={platformAnalytics}
              onUpdatePlatformAnalytics={setPlatformAnalytics}
              visitorRegistrations={visitorRegistrations}
              onVisitorRegistrationsChange={setVisitorRegistrations}
              onApproveTeacher={handleApproveTeacher}
              onRejectTeacher={handleRejectTeacher}
              onSuspendAccount={handleSuspendAccount}
              onReactivateAccount={handleReactivateAccount}
              onDeleteAccount={handleDeleteAccount}
              onRoleChangeUser={handleRoleChangeUser}
              onAddAccount={handleAddAccount}
              onAddClass={handleAddClass}
              onDeleteClass={handleDeleteClass}
              homepageConfig={homepageConfig}
              onSaveHomepageConfig={setHomepageConfig}
              studentPosts={studentPosts}
              onApprovePost={(id) =>
                setStudentPosts((prev) =>
                  prev.map((p) => (p.id === id ? { ...p, status: "approved" as const } : p))
                )
              }
              onHidePost={(id) =>
                setStudentPosts((prev) =>
                  prev.map((p) => (p.id === id ? { ...p, status: "hidden" as const } : p))
                )
              }
              onDeletePost={(id) => setStudentPosts((prev) => prev.filter((p) => p.id !== id))}
              onAddPost={(post) => setStudentPosts((prev) => [post, ...prev])}
              mediaLibrary={mediaLibrary}
              onAddMedia={(item) => setMediaLibrary((prev) => [item, ...prev])}
              onDeleteMedia={(id) => setMediaLibrary((prev) => prev.filter((m) => m.id !== id))}
              pois={pois}
              onSavePois={setPois}
              artifacts={artifacts}
              onSaveArtifacts={setArtifacts}
              quizzes={quizzes}
              onSaveQuizzes={setQuizzes}
              badges={badges}
              onSaveBadges={setBadges}
              studentsList={studentsList}
              onSaveStudentsList={setStudentsList}
            />
          )}

          {/* TAB: ONLINE VISITOR REGISTRATION MANAGEMENT MODULE */}
          {activeTab === "visitor-registration" && (
            <VisitorRegistrationPortal
              currentUser={currentUser}
              viewedLocations={viewedVisitorLocations}
              initialLatestBooking={latestVisitorBooking}
              onRequestRegisteredVisitorAuth={() =>
                handleRequestAuthForRole("visitor", "registered")
              }
              registrations={visitorRegistrations}
              onRegistrationsChange={setVisitorRegistrations}
              onAnalyticsUpdate={setPlatformAnalytics}
              onOpenAIChat={handleOpenAIChatWithQuery}
            />
          )}

          {/* 2. TEACHER CONTENT EDITORIAL CENTER (# TRUNG TÂM BIÊN TẬP - ONLY MASTER ADMIN) */}
          {isMasterAdmin && activeTab === "teacher-content-center" && (
            <TeacherContentCenter
              homepageConfig={homepageConfig}
              onUpdateHomepageConfig={setHomepageConfig}
              pois={pois}
              onUpdatePois={setPois}
              artifacts={artifacts}
              onUpdateArtifacts={setArtifacts}
              quizzes={quizzes}
              onUpdateQuizzes={setQuizzes}
              badges={badges}
              onUpdateBadges={setBadges}
              mediaLibrary={mediaLibrary}
              onUpdateMediaLibrary={setMediaLibrary}
              studentPosts={studentPosts}
              onUpdateStudentPosts={setStudentPosts}
              studentsList={studentsList}
              onUpdateStudentsList={setStudentsList}
            />
          )}

          {/* 3. HERITAGE SOCIAL LEARNING NETWORK FEED (BẢN TIN DI SẢN) */}
          {activeTab === "social-feed" && (
            <HeritageSocialFeed
              posts={studentPosts}
              currentRole={currentRole}
              studentProfile={{
                ...studentProfile,
                name: currentUser?.name || studentProfile.name
              }}
              onAddPost={(newPost) => setStudentPosts([newPost, ...studentPosts])}
              onLikePost={(postId) => {
                setStudentPosts(studentPosts.map(p => {
                  if (p.id === postId) {
                    const isLiked = !p.isLiked;
                    return {
                      ...p,
                      isLiked,
                      likesCount: isLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1)
                    };
                  }
                  return p;
                }));
              }}
              onAddComment={(postId, commentText, authorName, authorRole) => {
                setStudentPosts(studentPosts.map(p => {
                  if (p.id === postId) {
                    const newComment = {
                      id: `c-${Date.now()}`,
                      authorName: currentUser?.name || authorName,
                      authorRole: currentRole === "admin" ? "ADMIN" : currentRole === "teacher" ? "GIÁO VIÊN" : "HỌC SINH",
                      content: commentText,
                      createdAt: "Vừa xong"
                    };
                    return {
                      ...p,
                      comments: [...p.comments, newComment]
                    };
                  }
                  return p;
                }));
              }}
              onToggleHighlightPost={(postId) => {
                setStudentPosts(studentPosts.map(p => {
                  if (p.id === postId) {
                    return { ...p, isHighlighted: !p.isHighlighted };
                  }
                  return p;
                }));
              }}
              onDeletePost={(postId) => {
                setStudentPosts(studentPosts.filter(p => p.id !== postId));
              }}
              onAddXp={handleAddXp}
            />
          )}

          {/* 4. TEACHER DASHBOARDS (Section II & III) */}
          {currentRole === "teacher" && (activeTab === "teacher-overview" || activeTab === "teacher-dashboard" || activeTab === "teacher-students" || activeTab.startsWith("teacher-") && activeTab !== "teacher-content-center") && (
            <TeacherDashboard 
              mockStudents={studentsList}
              classes={classes}
              onClassesChange={setClasses}
              onStudentsListChange={setStudentsList}
              onNavigateTab={setActiveTab}
              currentTeacher={{
                name: currentUser?.name || "Cô Nguyễn Thị Lan",
                email: currentUser?.email || "lan.teacher@melinh.edu.vn",
                school: currentUser?.school || "Trường Tiểu học Văn Khê – Xã Mê Linh, TP. Hà Nội"
              }}
              onLessonCreated={async () => {
                const updatedAnalytics = await recordTeacherActionInDb({
                  teacherName: currentUser?.name || "Cô Nguyễn Thị Lan",
                  actionType: "create_lesson"
                });
                if (updatedAnalytics) {
                  setPlatformAnalytics(updatedAnalytics);
                }
              }}
            />
          )}

          {/* 5. STUDENT DASHBOARD HOME & LEARNING DASHBOARD (Section IV) */}
          {currentRole === "student" && (activeTab === "student-home" || activeTab === "student-dashboard" || activeTab === "student-profile") && (
            <StudentDashboard
              studentProfile={{
                ...studentProfile,
                name: currentUser?.name || studentProfile.name,
                grade: currentUser?.grade || studentProfile.grade,
                school: currentUser?.school || studentProfile.school
              }}
              studentsList={studentsList}
              studentPosts={studentPosts}
              onUpdatePosts={setStudentPosts}
              onUnlockBadge={handleUnlockBadge}
              onCompletePoiQuest={handleCompletePoiQuest}
              onNavigateTab={setActiveTab}
              onOpenAIChat={handleOpenAIChatWithQuery}
              onAddXp={handleAddXp}
              onSwitchRole={(role, tab) => {
                handleRoleChange(role);
                if (tab) setActiveTab(tab);
              }}
            />
          )}

          {/* TAB: DIGITAL HERITAGE ACADEMY (HỌC VIỆN DI SẢN SỐ - 3 TRÒ CHƠI GIÁO DỤC LIÊN KẾT) */}
          {activeTab === "heritage-academy" && (
            <DigitalHeritageAcademy
              studentProfile={{
                ...studentProfile,
                name: currentUser?.name || studentProfile.name,
                grade: currentUser?.grade || studentProfile.grade,
                school: currentUser?.school || studentProfile.school
              }}
              studentEmail={currentUser?.email}
              onAddXp={handleAddXp}
              onUnlockBadge={handleUnlockBadge}
              onCompleteStationPoi={handleCompletePoiQuest}
            />
          )}

          {/* TAB: FESTIVALS MODULE (LỄ HỘI ĐỀN HAI BÀ TRƯNG MÊ LINH) */}
          {activeTab === "festivals" && (
            <FestivalsModule
              onAddXp={handleAddXp}
              onOpenAIChat={handleOpenAIChatWithQuery}
              onNavigateTab={setActiveTab}
            />
          )}

          {/* 6. SHARED LEARNING CONTENT (Section VI) */}
          
          {/* TAB: COMPLETE HERITAGE DETAIL PAGE (ĐỀN HAI BÀ TRƯNG - MÊ LINH) */}
          {(activeTab === "map-stations" || activeTab === "heritage-detail") && (
            <DenHaiBaTrungDetailPage
              pois={pois}
              completedPOIIds={studentProfile.completedPOIs}
              onSelectPOI={(poi) => {
                setSelectedPoiModal(poi);
                setViewedVisitorLocations((prev) =>
                  prev.includes(poi.title) ? prev : [...prev, poi.title]
                );
                if (currentUser && currentUser.role === "visitor" && !currentUser.isGuest) {
                  saveRegisteredVisitorHistory({
                    userId: currentUser.id,
                    email: currentUser.email,
                    locationTitle: poi.title
                  }).then((savedHistory) => {
                    if (savedHistory) {
                      setCurrentUser((prev) => (prev ? { ...prev, savedHistory } : prev));
                    }
                  });
                }
                trackVisitorJourneyUpdate({
                  sessionId: anonSessionId,
                  viewedLocation: poi.title,
                  poiId: poi.id,
                  tourDurationSeconds: visitorTourSeconds || 180,
                  role: currentRole === "visitor" ? "visitor" : "student"
                }).then((updatedAnalytics) => {
                  if (updatedAnalytics) {
                    setPlatformAnalytics(updatedAnalytics);
                  }
                });
              }}
              onOpenAIChat={handleOpenAIChatWithQuery}
              onNavigateTab={setActiveTab}
              onAddXp={handleAddXp}
              mediaLibrary={mediaLibrary}
            />
          )}

          {/* TAB: INTERACTIVE DIGITAL MAP */}
          {activeTab === "map" && (
            <InteractiveMap
              pois={pois}
              completedPoiIds={studentProfile.completedPOIs}
              onSelectPOI={(poi) => {
                setSelectedPoiModal(poi);
                setViewedVisitorLocations((prev) =>
                  prev.includes(poi.title) ? prev : [...prev, poi.title]
                );
                recordProgressEventInDb({
                  eventType: "explore_360",
                  studentId: studentProfile.id,
                  userId: currentUser?.id,
                  email: currentUser?.email,
                  poiId: poi.id,
                  poiTitle: poi.title,
                  xpEarned: 20,
                  role: currentRole,
                  sessionId: anonSessionId
                }).then((res) => {
                  if (res?.platformAnalytics) {
                    setPlatformAnalytics(res.platformAnalytics);
                  }
                });
                trackVisitorJourneyUpdate({
                  sessionId: anonSessionId,
                  viewedLocation: poi.title,
                  poiId: poi.id,
                  tourDurationSeconds: visitorTourSeconds || 180,
                  role: currentRole === "visitor" ? "visitor" : "student"
                }).then((updatedAnalytics) => {
                  if (updatedAnalytics) {
                    setPlatformAnalytics(updatedAnalytics);
                  }
                });
              }}
              onOpenAIChat={handleOpenAIChatWithQuery}
            />
          )}

          {/* TAB: AI CHAT COMPANION TRỢ LÝ DI SẢN AI */}
          {activeTab === "ai-chat" && (
            <AIChatBot
              studentName={currentUser?.name || studentProfile.name}
              onUnlockAIBadge={() => handleUnlockBadge("badge-ai-friend")}
              onAddXp={handleAddXp}
              initialPrompt={aiChatInitialPrompt}
              onClearInitialPrompt={() => setAiChatInitialPrompt(undefined)}
              isMuted={isMuted}
            />
          )}

          {/* TAB: GAMIFIED QUIZ QUEST */}
          {activeTab === "quiz" && (
            <HeritageQuizModal
              defaultQuizzes={quizzes}
              onAddXp={handleAddXp}
              onUnlockBadge={handleUnlockBadge}
              onCompleteQuizAttempt={async (summary) => {
                setStudentProfile((prev) => ({
                  ...prev,
                  quizScore: summary.score
                }));
                const result = await recordQuizAttemptInDb({
                  studentId: studentProfile.id,
                  studentName: currentUser?.name || studentProfile.name,
                  score: summary.score,
                  xpEarned: summary.xpEarned,
                  totalQuestions: summary.totalQuestions,
                  correctCount: summary.correctCount
                });
                if (result?.platformAnalytics) {
                  setPlatformAnalytics(result.platformAnalytics);
                }
              }}
            />
          )}

          {/* TAB: ARTIFACTS GALLERY / BẢO TÀNG SỐ 3D */}
          {activeTab === "artifacts" && (
            <ArtifactsGallery
              artifacts={artifacts}
              onOpenAIChat={handleOpenAIChatWithQuery}
              onAddXp={handleAddXp}
              onUnlockBadge={handleUnlockBadge}
            />
          )}

          {/* TAB: HERITAGE COLORING CANVAS */}
          {activeTab === "paint" && (
            <HeritageCanvasGame
              onUnlockBadge={handleUnlockBadge}
              onAddXp={handleAddXp}
              studentName={currentUser?.name || studentProfile.name}
              onArtworkUploaded={(mediaItem) => {
                setMediaLibrary((prev) => [mediaItem, ...prev]);
                setStudentProfile((prev) => ({
                  ...prev,
                  createdArtworksCount: (prev.createdArtworksCount || 0) + 1
                }));
              }}
            />
          )}

          {/* TAB: PASSPORT, CERTIFICATE & BADGES */}
          {activeTab === "passport" && (
            <BadgePassport
              badges={badges}
              studentProfile={{
                ...studentProfile,
                name: currentUser?.name || studentProfile.name
              }}
              onAddXp={handleAddXp}
              onUnlockBadge={handleUnlockBadge}
              onNavigateTab={setActiveTab}
            />
          )}
        </main>
      </div>

      {/* POI Detail Modal Popup */}
      {selectedPoiModal && (
        <POIDetailModal
          poi={selectedPoiModal}
          isCompleted={studentProfile.completedPOIs.includes(selectedPoiModal.id)}
          onClose={() => setSelectedPoiModal(null)}
          onCompletePoiQuest={handleCompletePoiQuest}
          onOpenAIChat={(topic) => {
            setSelectedPoiModal(null);
            handleOpenAIChatWithQuery(topic);
          }}
        />
      )}

      {/* Footer */}
      <div className="relative z-10">
        <Footer />
      </div>

      {/* Persistent Floating Music Player: Bài hát "Mê Linh Tôi Yêu" */}
      <HeritageMusicPlayer onAddXp={handleAddXp} />
    </div>
  );
}

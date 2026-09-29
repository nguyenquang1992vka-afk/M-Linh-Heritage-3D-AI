import React, { useState, useEffect, useMemo } from "react";
import {
  UserAccount,
  PlatformAnalyticsState,
  StudentProfile,
  VisitorRegistration,
  TransportationType,
  SpecialRequirementType,
  StudentPost
} from "../types";
import { INITIAL_STUDENT_POSTS } from "../data/heritageData";
import { HeritageSocialFeed } from "./HeritageSocialFeed";
import {
  loginWithCredentials,
  registerRealAccount,
  signInWithGoogleAndSync,
  requestPasswordReset,
  sendAndConfirmEmailVerification,
  createVisitorRegistrationInDb
} from "../services/heritageDatabase";
import templeBgImage from "../assets/images/den_hai_ba_trung_real.jpg";
import nghiMonNgoaiImg from "../assets/images/nghi_mon_ngoai_real.jpg";
import tamToaChinhDienImg from "../assets/images/tam_toa_chinh_dien_real.jpg";
import leHoiImg from "../assets/images/le_hoi_real.jpg";
import { ResponsiveLayout } from "./home/ResponsiveLayout";
import { HomeHero } from "./home/HomeHero";
import { FeatureSection } from "./home/FeatureSection";
import { PortalCardType } from "./home/RoleCard";
import {
  ShieldCheck,
  Sparkles,
  LogIn,
  KeyRound,
  Compass,
  CheckCircle2,
  Lock,
  ArrowRight,
  UserPlus,
  Landmark,
  Eye,
  EyeOff,
  Volume2,
  Calendar,
  Bot,
  GraduationCap,
  Award,
  MapPin,
  Mail,
  User,
  Building2,
  Phone,
  History,
  Users,
  Bus,
  Car,
  Bike,
  Footprints,
  Send
} from "lucide-react";

interface LoginScreenProps {
  userAccounts: UserAccount[];
  initialRole?: "student" | "teacher" | "admin" | "visitor";
  initialVisitorSubMode?: "guest" | "registered";
  onLogin: (
    user: UserAccount,
    initialTab?: string,
    serverData?: {
      studentProfile?: StudentProfile | null;
      platformAnalytics?: PlatformAnalyticsState;
    }
  ) => void;
  onRegisterAccount?: (newAccount: UserAccount) => void;
  onRegisterTeacher?: (newTeacher: UserAccount) => void;
  studentPosts?: StudentPost[];
  onUpdatePosts?: React.Dispatch<React.SetStateAction<StudentPost[]>>;
  onVisitorBookingCreated?: (
    registration: VisitorRegistration,
    updatedList?: VisitorRegistration[],
    analytics?: PlatformAnalyticsState
  ) => void;
}

type RoleTab = "student" | "teacher" | "admin" | "visitor";
type AuthMode = "login" | "register" | "forgot-password" | "verify-email";
type VisitorOptionMode = "guest" | "registered";

const SCHOOL_PRESETS = [
  "Trường Tiểu học Văn Khê",
  "Trường Tiểu học Mê Linh",
  "Trường Tiểu học Tiền Phong",
  "Trường Tiểu học Hạ Lôi",
  "Trường Trung học cơ sở Mê Linh",
  "Trường Trung học cơ sở Tiền Phong",
  "Trường Trung học cơ sở Văn Khê",
  "Trường Trung học cơ sở Trưng Vương",
  "Trường THPT Mê Linh",
  "Trường THPT Tiền Phong"
];

const GRADE_PRESETS = [
  "Khối 1",
  "Khối 2",
  "Khối 3",
  "Khối 4",
  "Khối 5",
  "Khối 6",
  "Khối 7",
  "Khối 8",
  "Khối 9",
  "Khối THPT",
  "Lớp 4A",
  "Lớp 5A",
  "Lớp 6A",
  "Lớp 7A",
  "Lớp 8A",
  "Lớp 9A"
];

export const LoginScreen: React.FC<LoginScreenProps> = ({
  userAccounts = [],
  initialRole = "student",
  initialVisitorSubMode = "registered",
  onLogin,
  onRegisterAccount,
  onRegisterTeacher,
  studentPosts = INITIAL_STUDENT_POSTS,
  onUpdatePosts,
  onVisitorBookingCreated
}) => {
  const [localPosts, setLocalPosts] = useState<StudentPost[]>(studentPosts);
  const resolvedPosts = onUpdatePosts ? studentPosts : localPosts;
  const resolvedSetPosts = onUpdatePosts || setLocalPosts;
  const [selectedRole, setSelectedRole] = useState<RoleTab>(initialRole);
  const [authMode, setAuthMode] = useState<AuthMode>(
    initialRole === "student" ? "register" : "login"
  );
  const [, setVisitorOption] = useState<VisitorOptionMode>(initialVisitorSubMode);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Real Login credentials state (Default Admin account is nguyenquang1992vka@gmail.com)
  const [emailInput, setEmailInput] = useState<string>(
    initialRole === "admin" ? "nguyenquang1992vka@gmail.com" : ""
  );
  const [passwordInput, setPasswordInput] = useState<string>("");

  // Registration state (Student: Name, School, Grade only; Teacher: full credentials)
  const [regName, setRegName] = useState<string>("");
  const [regEmail, setRegEmail] = useState<string>("");
  const [regPassword, setRegPassword] = useState<string>("");
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>("");
  const [regSchool, setRegSchool] = useState<string>(
    "Trường Tiểu học Văn Khê"
  );
  const [regGrade, setRegGrade] = useState<string>("Khối 6");
  const [regSubject, setRegSubject] = useState<string>("Lịch sử & Địa lý");
  const [regPhone, setRegPhone] = useState<string>("");

  // Direct Visitor Tour Booking state (Khách tham quan không cần tài khoản & mật khẩu, chỉ cần đăng ký đặt tour)
  const defaultTourDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split("T")[0];
  }, []);
  const [tourOrganization, setTourOrganization] = useState<string>(
    "Đoàn Tham quan Đền Hai Bà Trưng – Mê Linh"
  );
  const [tourFullName, setTourFullName] = useState<string>("");
  const [tourPhone, setTourPhone] = useState<string>("");
  const [tourDate, setTourDate] = useState<string>(defaultTourDate);
  const [tourTimeSlot, setTourTimeSlot] = useState<string>("08:30 - 10:30");
  const [tourGroupSize, setTourGroupSize] = useState<number>(35);
  const [tourTransport, setTourTransport] = useState<TransportationType>("bus");
  const [tourRequirements, setTourRequirements] = useState<SpecialRequirementType[]>([
    "tour_guide",
    "ai_tour"
  ]);
  const [tourNotes, setTourNotes] = useState<string>("");

  // Forgot Password & Email Verification state
  const [resetEmail, setResetEmail] = useState<string>("");
  const [resetNewPassword, setResetNewPassword] = useState<string>("");
  const [verifyEmailAddr, setVerifyEmailAddr] = useState<string>("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    setSelectedRole(initialRole);
    setAuthMode(initialRole === "student" ? "register" : "login");
    if (initialRole === "admin") {
      setEmailInput("nguyenquang1992vka@gmail.com");
      setPasswordInput("");
    }
    if (initialRole === "visitor") {
      setVisitorOption(initialVisitorSubMode);
    }
  }, [initialRole, initialVisitorSubMode]);

  const handleSelectRole = (role: RoleTab, vMode?: VisitorOptionMode) => {
    setSelectedRole(role);
    setAuthMode(role === "student" ? "register" : "login");
    setErrorMsg(null);
    setSuccessMsg(null);
    if (role === "admin") {
      setEmailInput("nguyenquang1992vka@gmail.com");
      setPasswordInput("");
    } else if (emailInput.toLowerCase() === "nguyenquang1992vka@gmail.com") {
      setEmailInput("");
      setPasswordInput("");
    }
    if (role === "visitor") {
      setVisitorOption(vMode || "registered");
    }
  };

  // Option 4A: Direct Visitor Enter without account/password
  const handleGuestVisitorEnter = (targetTab: string = "visitor-registration") => {
    const guestAccount: UserAccount = {
      id: `vis-${Date.now()}`,
      name: tourFullName.trim() || "Khách tham quan Di sản",
      email: "dukhach@melinh-heritage.vn",
      role: "visitor",
      status: "active",
      isGuest: false,
      phoneNumber: tourPhone.trim() || undefined,
      school: tourOrganization.trim() || "Khách tham quan Đền Hai Bà Trưng",
      createdAt: new Date().toISOString().slice(0, 10)
    };
    onLogin(guestAccount, targetTab);
  };

  const toggleTourRequirement = (reqId: SpecialRequirementType) => {
    setTourRequirements((prev) =>
      prev.includes(reqId) ? prev.filter((item) => item !== reqId) : [...prev, reqId]
    );
  };

  // Option 4B: Direct Tour Booking Registration (Không cần đăng nhập tài khoản & mật khẩu)
  const handleVisitorTourBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!tourOrganization.trim() || !tourFullName.trim() || !tourPhone.trim() || !tourDate) {
      setErrorMsg(
        "Vui lòng nhập đầy đủ Tên đoàn/Đơn vị, Họ tên người đăng ký, Số điện thoại và Ngày tham quan."
      );
      return;
    }

    const totalVisitors = Math.max(1, Number(tourGroupSize) || 1);
    setIsSubmitting(true);
    try {
      const result = await createVisitorRegistrationInDb({
        fullName: tourFullName.trim(),
        phoneNumber: tourPhone.trim(),
        email: "dukhach@melinh-heritage.vn",
        organization: tourOrganization.trim(),
        visitDate: tourDate,
        preferredTime: tourTimeSlot,
        adultsCount: totalVisitors,
        studentsCount: 0,
        teachersCount: 0,
        transportationType: tourTransport,
        specialRequirements: tourRequirements,
        notes: tourNotes.trim()
      });
      setIsSubmitting(false);

      if (result.error || !result.registration) {
        setErrorMsg(result.error || "Đăng ký đặt tour không thành công. Vui lòng thử lại.");
        return;
      }

      if (onVisitorBookingCreated) {
        onVisitorBookingCreated(
          result.registration,
          result.visitorRegistrations,
          result.platformAnalytics
        );
      }

      const visitorAccount: UserAccount = {
        id: `vis-${Date.now()}`,
        name: tourFullName.trim(),
        email: "dukhach@melinh-heritage.vn",
        role: "visitor",
        status: "active",
        isGuest: false,
        phoneNumber: tourPhone.trim(),
        school: tourOrganization.trim(),
        createdAt: new Date().toISOString().slice(0, 10)
      };

      onLogin(visitorAccount, "visitor-registration", {
        platformAnalytics: result.platformAnalytics
      });
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err?.message || "Không thể gửi đăng ký đặt tour. Vui lòng thử lại.");
    }
  };

  // Quick login for an already-registered student account by clicking their profile or entering Name/School/Grade
  const handleExistingStudentEnter = async (studentAcc: UserAccount) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    try {
      const dbRes = await loginWithCredentials({
        role: "student",
        name: studentAcc.name,
        email: studentAcc.email,
        grade: studentAcc.grade || "Lớp 4A",
        school:
          studentAcc.school || "Trường Tiểu học Văn Khê – Xã Mê Linh, TP. Hà Nội"
      });
      setIsSubmitting(false);
      if (dbRes.user) {
        onLogin(
          {
            ...dbRes.user,
            isGuest: false,
            sessionToken: dbRes.sessionToken || dbRes.user.sessionToken
          },
          "student-home",
          {
            studentProfile: dbRes.studentProfile,
            platformAnalytics: dbRes.platformAnalytics
          }
        );
      }
    } catch (_err) {
      setIsSubmitting(false);
      onLogin(
        {
          ...studentAcc,
          isGuest: false
        },
        "student-home"
      );
    }
  };

  // Simple login for Teacher (only requires Họ và tên + Trường)
  const handleExistingTeacherEnter = async (teacherAcc: UserAccount) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    try {
      const dbRes = await loginWithCredentials({
        role: "teacher",
        name: teacherAcc.name,
        email: teacherAcc.email,
        school:
          teacherAcc.school || "Trường Tiểu học Văn Khê – Xã Mê Linh, TP. Hà Nội"
      });
      setIsSubmitting(false);
      if (dbRes.user) {
        onLogin(
          {
            ...dbRes.user,
            isGuest: false,
            sessionToken: dbRes.sessionToken || dbRes.user.sessionToken
          },
          "teacher-overview",
          {
            studentProfile: dbRes.studentProfile,
            platformAnalytics: dbRes.platformAnalytics
          }
        );
      }
    } catch (_err) {
      setIsSubmitting(false);
      onLogin(
        {
          ...teacherAcc,
          role: "teacher",
          status: "active",
          isGuest: false
        },
        "teacher-overview"
      );
    }
  };

  // Real Email/Password Login for Teacher, Admin, Registered Visitor, or Student
  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (
      (selectedRole === "student" || selectedRole === "teacher") &&
      !emailInput.trim() &&
      regName.trim()
    ) {
      await handleRegisterSubmit(e);
      return;
    }

    const cleanEmail =
      selectedRole === "admin" ? "nguyenquang1992vka@gmail.com" : emailInput.trim();
    const cleanPass = passwordInput.trim();

    if (!cleanEmail || !cleanPass) {
      setErrorMsg("Vui lòng nhập đầy đủ Email và Mật khẩu để đăng nhập.");
      return;
    }

    if (selectedRole === "admin") {
      if (cleanEmail.toLowerCase() !== "nguyenquang1992vka@gmail.com") {
        setErrorMsg(
          "Chỉ tài khoản Quản trị viên mặc định (nguyenquang1992vka@gmail.com) mới có quyền đăng nhập và chỉnh sửa."
        );
        return;
      }
      if (cleanPass !== "Quang1992@") {
        setErrorMsg(
          "Mật khẩu Quản trị viên không chính xác. Vui lòng nhập đúng mật khẩu của tài khoản nguyenquang1992vka@gmail.com."
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const dbRes = await loginWithCredentials({
        role: selectedRole,
        email: cleanEmail,
        password: cleanPass
      });
      setIsSubmitting(false);

      if (dbRes.pendingAccount) {
        setErrorMsg(
          `⏳ Tài khoản Giáo viên (${dbRes.pendingAccount.email}) đang chờ Quản trị viên phê duyệt.`
        );
        return;
      }

      if (dbRes.user) {
        const targetTab =
          dbRes.user.role === "admin"
            ? "admin-dashboard"
            : dbRes.user.role === "teacher"
            ? "teacher-overview"
            : dbRes.user.role === "visitor"
            ? "visitor-registration"
            : "student-home";

        onLogin(
          {
            ...dbRes.user,
            isGuest: false,
            sessionToken: dbRes.sessionToken || dbRes.user.sessionToken
          },
          targetTab,
          {
            studentProfile: dbRes.studentProfile,
            platformAnalytics: dbRes.platformAnalytics
          }
        );
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(
        err?.message || "Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại."
      );
    }
  };

  // Real Account Registration:
  // - For Student: ONLY requires Họ và tên (regName), Trường (regSchool), Lớp (regGrade)
  // - For Teacher: ONLY requires Họ và tên (regName), Trường (regSchool)
  // - For Visitor / Admin: requires full Email & Password
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const targetRegRole: "student" | "teacher" | "visitor" | "admin" =
      selectedRole === "admin"
        ? "admin"
        : selectedRole === "teacher"
        ? "teacher"
        : selectedRole === "visitor"
        ? "visitor"
        : "student";

    if (targetRegRole === "admin") {
      setErrorMsg(
        "Tài khoản Quản trị viên mặc định là nguyenquang1992vka@gmail.com. Không ai có quyền đăng ký mới hoặc chỉnh sửa ngoài tài khoản này."
      );
      return;
    }

    if (targetRegRole === "student") {
      if (!regName.trim()) {
        setErrorMsg("Vui lòng nhập Họ và tên học sinh.");
        return;
      }
      if (!regSchool.trim()) {
        setErrorMsg("Vui lòng chọn hoặc nhập tên Trường học.");
        return;
      }
      if (!regGrade.trim()) {
        setErrorMsg("Vui lòng chọn hoặc nhập Lớp học.");
        return;
      }
    } else if (targetRegRole === "teacher") {
      if (!regName.trim()) {
        setErrorMsg("Vui lòng nhập Họ và tên giáo viên.");
        return;
      }
      if (!regSchool.trim()) {
        setErrorMsg("Vui lòng chọn hoặc nhập tên Trường học.");
        return;
      }
    } else {
      if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
        setErrorMsg("Vui lòng điền đầy đủ Họ tên, Email và Mật khẩu.");
        return;
      }

      if (regPassword.trim().length < 6) {
        setErrorMsg("Mật khẩu phải có tối thiểu 6 ký tự.");
        return;
      }

      if (regConfirmPassword && regPassword.trim() !== regConfirmPassword.trim()) {
        setErrorMsg("Mật khẩu xác nhận không khớp.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const dbReg = await registerRealAccount({
        name: regName.trim(),
        email:
          targetRegRole === "student" || targetRegRole === "teacher"
            ? undefined
            : regEmail.trim(),
        password:
          targetRegRole === "student" || targetRegRole === "teacher"
            ? undefined
            : regPassword.trim(),
        role: targetRegRole,
        grade:
          targetRegRole === "student"
            ? regGrade.trim() || "Lớp 4A"
            : undefined,
        school:
          regSchool.trim() ||
          (targetRegRole === "visitor"
            ? "Du khách Đăng ký Trực tuyến"
            : "Trường Tiểu học Văn Khê – Xã Mê Linh, TP. Hà Nội"),
        subject: targetRegRole === "teacher" ? regSubject.trim() || "Lịch sử & Địa lý" : undefined,
        phoneNumber: targetRegRole === "visitor" ? regPhone.trim() : undefined
      });
      setIsSubmitting(false);

      if (dbReg.error) {
        setErrorMsg(dbReg.error);
        return;
      }

      if (dbReg.user) {
        if (onRegisterAccount) onRegisterAccount(dbReg.user);
        if (targetRegRole === "teacher" && onRegisterTeacher) {
          onRegisterTeacher(dbReg.user);
        }

        const targetTab =
          dbReg.user.role === "admin"
            ? "admin-dashboard"
            : dbReg.user.role === "teacher"
            ? "teacher-overview"
            : dbReg.user.role === "visitor"
            ? "visitor-registration"
            : "student-home";

        onLogin(
          {
            ...dbReg.user,
            isGuest: false,
            sessionToken: dbReg.sessionToken || dbReg.user.sessionToken
          },
          targetTab,
          {
            studentProfile: dbReg.studentProfile,
            platformAnalytics: dbReg.platformAnalytics
          }
        );
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err?.message || "Không thể đăng ký tài khoản.");
    }
  };

  // Firebase Google OAuth Sign-In
  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    try {
      const res = await signInWithGoogleAndSync(
        selectedRole,
        regSchool || "Trường Tiểu học Văn Khê – Xã Mê Linh, TP. Hà Nội",
        regGrade || "Lớp 4A"
      );
      setIsSubmitting(false);

      if (res.pendingAccount) {
        setErrorMsg(
          `⏳ Tài khoản Giáo viên (${res.pendingAccount.email}) đang chờ Quản trị viên phê duyệt.`
        );
        return;
      }

      const targetTab =
        res.user.role === "admin"
          ? "admin-dashboard"
          : res.user.role === "teacher"
          ? "teacher-overview"
          : res.user.role === "visitor"
          ? "visitor-registration"
          : "student-home";

      onLogin(
        {
          ...res.user,
          isGuest: false
        },
        targetTab,
        {
          studentProfile: res.studentProfile,
          platformAnalytics: res.platformAnalytics
        }
      );
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(
        err?.message ||
          "Đăng nhập Google không thành công hoặc đã đóng cửa sổ xác thực. Bạn có thể đăng nhập bằng Email & Mật khẩu bên dưới."
      );
    }
  };

  // Firebase Password Reset (Quên mật khẩu)
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const targetEmail = (resetEmail || emailInput).trim();
    if (!targetEmail) {
      setErrorMsg("Vui lòng nhập địa chỉ Email đã đăng ký để khôi phục mật khẩu.");
      return;
    }

    setIsSubmitting(true);
    const res = await requestPasswordReset({
      email: targetEmail,
      newPassword: resetNewPassword.trim() || undefined
    });
    setIsSubmitting(false);

    if (!res.ok) {
      setErrorMsg(res.error || "Không thể gửi yêu cầu khôi phục mật khẩu.");
      return;
    }

    setSuccessMsg(
      res.message ||
        `Đã gửi email đặt lại mật khẩu qua Firebase Authentication tới ${targetEmail}.`
    );
    if (resetNewPassword.trim()) {
      setEmailInput(targetEmail);
      setPasswordInput(resetNewPassword.trim());
    }
  };

  // Firebase Email Verification (Xác minh email)
  const handleVerifyEmailAction = async (confirmVerified: boolean) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const targetEmail = (verifyEmailAddr || emailInput || regEmail).trim();
    if (!targetEmail) {
      setErrorMsg("Vui lòng nhập địa chỉ Email tài khoản cần xác minh.");
      return;
    }

    setIsSubmitting(true);
    const res = await sendAndConfirmEmailVerification({
      email: targetEmail,
      confirmVerified
    });
    setIsSubmitting(false);

    if (!res.ok) {
      setErrorMsg(res.error || "Không thể thực hiện xác minh email.");
      return;
    }

    setSuccessMsg(
      res.message ||
        (confirmVerified
          ? `Đã xác minh địa chỉ Email ${targetEmail} thành công!`
          : `Đã gửi liên kết xác minh Email qua Firebase Authentication tới ${targetEmail}.`)
    );
  };

  const selectedPortalCard: PortalCardType =
    selectedRole === "visitor"
      ? "explore"
      : selectedRole === "student"
      ? "student"
      : selectedRole === "teacher"
      ? "teacher"
      : "admin";

  const handleSelectPortalCard = (portal: PortalCardType) => {
    if (portal === "explore") {
      handleSelectRole("visitor", "registered");
    } else if (portal === "student") {
      handleSelectRole("student");
    } else if (portal === "teacher") {
      handleSelectRole("teacher");
    } else {
      handleSelectRole("admin");
    }
    setTimeout(() => {
      const gatewayEl = document.getElementById("portal-gateway");
      if (gatewayEl) {
        gatewayEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 60);
  };

  return (
    <ResponsiveLayout onQuickExplore={() => handleGuestVisitorEnter("map-stations")}>
      <div className="w-full space-y-8 sm:space-y-10 pb-8">
        {/* 1. HERO SECTION: HỆ SINH THÁI SỐ DI SẢN MÊ LINH */}
        <HomeHero />

        {/* 2. 4 MAIN PORTAL CARDS (KHÁM PHÁ DI SẢN, CỔNG HỌC SINH, CỔNG GIÁO VIÊN, CỔNG QUẢN TRỊ) */}
        <FeatureSection
          selectedPortal={selectedPortalCard}
          onSelectPortal={handleSelectPortalCard}
          onQuickExploreHeritage={() => handleGuestVisitorEnter("map-stations")}
        />

        {/* ================================================================= */}
        {/* 3. AUTHENTICATION & ROLE PORTAL GATEWAY                           */}
        {/* ================================================================= */}
        <section
          id="portal-gateway"
          className="bg-white/95 backdrop-blur-md text-stone-900 rounded-[28px] sm:rounded-[32px] border-2 border-[#D4AF37] shadow-2xl p-4 sm:p-8 lg:p-10 scroll-mt-6"
        >
          {/* Quick Portal Switcher Bar inside Gateway */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 mb-6 border-b border-stone-200">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#8B1E1E] text-[#F3D27A] flex items-center justify-center font-extrabold shadow-xs">
                {selectedRole === "visitor"
                  ? "🏛"
                  : selectedRole === "student"
                  ? "🎓"
                  : selectedRole === "teacher"
                  ? "👩‍🏫"
                  : "⚙"}
              </div>
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#8B1E1E]">
                  CỔNG TRUY CẬP TRỰC TIẾP • DIGITAL HERITAGE GATEWAY
                </div>
                <h3 className="text-base sm:text-xl font-extrabold text-stone-900">
                  {selectedRole === "visitor"
                    ? "🏛 Khám phá Di sản & Đăng ký Tham quan"
                    : selectedRole === "student"
                    ? "🎓 Cổng Học sinh (Học tập, Bài học số, Quiz, XP, Huy hiệu)"
                    : selectedRole === "teacher"
                    ? "👩‍🏫 Cổng Giáo viên (Quản lý lớp, Giao nhiệm vụ, Đánh giá)"
                    : "⚙ Cổng Quản trị (Quản lý hệ thống, Dữ liệu, Báo cáo)"}
                </h3>
              </div>
            </div>

            {selectedRole === "visitor" && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleGuestVisitorEnter("map-stations")}
                  className="px-4 py-2.5 rounded-full bg-gradient-to-r from-[#8B1E1E] to-[#631012] hover:brightness-110 text-white text-xs sm:text-sm font-extrabold border border-[#D4AF37] shadow-md flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Compass className="w-4 h-4 text-[#F3D27A]" />
                  <span>Vào Bản đồ 360° & Bảo tàng 3D ngay</span>
                  <ArrowRight className="w-4 h-4 text-[#F3D27A]" />
                </button>
              </div>
            )}
          </div>
          {/* CASE A: VISITOR PORTAL (KHÔNG CẦN ĐĂNG NHẬP TÀI KHOẢN & MẬT KHẨU - CHỈ CẦN ĐĂNG KÝ ĐẶT TOUR) */}
          {selectedRole === "visitor" ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left 5 Cols: Live Tour Booking Preview & Instant Exploration */}
              <div className="lg:col-span-5 space-y-5">
                <div className="rounded-3xl overflow-hidden border-2 border-[#D4AF37] bg-gradient-to-br from-[#1F0D0F] via-[#2C1416] to-[#140A0B] text-white shadow-2xl">
                  {/* Card Header */}
                  <div className="px-6 py-4 bg-gradient-to-r from-[#9A3412] to-[#7C2D12] border-b border-[#D4AF37]/40 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-[#F3D27A]" />
                      </div>
                      <div>
                        <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#F3D27A]">
                          PHIẾU ĐẶT TOUR THAM QUAN DI SẢN SỐ
                        </div>
                        <div className="text-xs font-bold text-white/90">
                          Đền Hai Bà Trưng – Xã Mê Linh, TP. Hà Nội
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-[#F3D27A] tracking-wider uppercase">
                      MÃ TỰ ĐỘNG
                    </span>
                  </div>

                  {/* Live Preview Body */}
                  <div className="p-6 space-y-5">
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-200/75">
                        Đoàn / Đơn vị đăng ký tham quan
                      </div>
                      <div className="text-lg font-extrabold text-white leading-snug">
                        {tourOrganization.trim() || "Đoàn Tham quan Đền Hai Bà Trưng – Mê Linh"}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/10">
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-200/70">
                          Người đăng ký / Trưởng đoàn
                        </div>
                        <div className="text-xs font-extrabold text-white mt-1 truncate">
                          {tourFullName.trim() || "Chưa nhập họ tên..."}
                        </div>
                      </div>
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-200/70">
                          Số điện thoại liên hệ
                        </div>
                        <div className="text-xs font-extrabold text-[#F3D27A] mt-1 truncate">
                          {tourPhone.trim() || "Chưa nhập SĐT..."}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="p-3 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/40">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#F3D27A]">
                          Ngày đón đoàn
                        </div>
                        <div className="text-xs font-extrabold text-white mt-1">
                          {tourDate}
                        </div>
                      </div>
                      <div className="p-3 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/40">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#F3D27A]">
                          Khung giờ
                        </div>
                        <div className="text-xs font-extrabold text-white mt-1 truncate">
                          {tourTimeSlot}
                        </div>
                      </div>
                      <div className="p-3 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/40">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#F3D27A]">
                          Số lượng
                        </div>
                        <div className="text-xs font-extrabold text-white mt-1">
                          {Math.max(1, Number(tourGroupSize) || 1)} khách
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-white/10 text-xs text-stone-200">
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#F3D27A]">
                        Chính sách đón tiếp Khách tham quan:
                      </div>
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>
                          <strong>Không cần đăng nhập tài khoản và mật khẩu</strong> — chỉ cần điền phiếu đăng ký đặt tour.
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>
                          Cấp ngay <strong>Mã đoàn tham quan (ML-2026-...)</strong> và đồng bộ tới Ban Quản lý Di tích.
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>
                          Khám phá trọn vẹn Bản đồ số 360°, Bảo tàng 3D, Lễ hội & Trợ lý Di sản AI.
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleGuestVisitorEnter("map-stations")}
                        className="flex-1 py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-[#D4AF37]/60 text-amber-100 text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Landmark className="w-4 h-4 text-[#F3D27A]" />
                        <span>Vào Tham quan Tự do Ngay</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleGuestVisitorEnter("visitor-registration")}
                        className="flex-1 py-3 px-4 rounded-2xl bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 border border-[#D4AF37] text-[#F3D27A] text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Tra cứu Danh sách Đoàn</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right 7 Cols: Direct Tour Booking Registration Form (No Login/Password) */}
              <div className="lg:col-span-7">
                <form
                  onSubmit={handleVisitorTourBookingSubmit}
                  className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 border-2 border-[#D4AF37]/70 shadow-xl space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
                    <div className="space-y-1">
                      <div className="text-xs font-extrabold uppercase tracking-wider text-[#9A3412]">
                        ĐĂNG KÝ ĐẶT TOUR TRỰC TUYẾN • KHÔNG CẦN TÀI KHOẢN & MẬT KHẨU
                      </div>
                      <h3 className="text-xl sm:text-2xl font-extrabold font-cinzel text-stone-900">
                        Phiếu Đăng Ký Đặt Tour Tham Quan
                      </h3>
                      <p className="text-xs text-stone-600">
                        Khách tham quan chỉ cần điền thông tin đặt tour dưới đây để nhận <strong>Mã đoàn tham quan</strong> và bắt đầu hành trình.
                      </p>
                    </div>
                  </div>

                  {/* 1. Tên đoàn / Đơn vị */}
                  <div className="space-y-2">
                    <label className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-stone-800">
                      <span>1. Tên đoàn / Đơn vị / Nhóm khách tham quan *</span>
                      <span className="text-[11px] font-medium text-stone-500 normal-case">
                        Chọn nhanh hoặc tự nhập
                      </span>
                    </label>
                    <div className="relative">
                      <Building2 className="w-5 h-5 text-[#9A3412] absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={tourOrganization}
                        onChange={(e) => setTourOrganization(e.target.value)}
                        placeholder="Ví dụ: Đoàn Du khách Hà Nội / Gia đình anh Nguyễn Văn Hùng..."
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border-2 border-stone-200 focus:border-[#9A3412] focus:outline-none text-sm font-bold text-stone-900 shadow-xs"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {[
                        "Đoàn Tham quan Gia đình / Cá nhân",
                        "Đoàn Trường Tiểu học Văn Khê",
                        "Đoàn Trường Tiểu học Mê Linh",
                        "Đoàn Trường Tiểu học Tiền Phong",
                        "Đoàn Trường THCS Mê Linh",
                        "Đoàn Trường THCS Tiền Phong"
                      ].map((orgPreset) => (
                        <button
                          key={orgPreset}
                          type="button"
                          onClick={() => setTourOrganization(orgPreset)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            tourOrganization.trim() === orgPreset
                              ? "bg-[#9A3412] text-white border-[#9A3412]"
                              : "bg-white hover:bg-stone-100 text-stone-700 border-stone-200"
                          }`}
                        >
                          {orgPreset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Họ tên người đăng ký & Số điện thoại */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-800">
                        2. Họ và tên người đăng ký (Trưởng đoàn) *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-[#9A3412] absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={tourFullName}
                          onChange={(e) => setTourFullName(e.target.value)}
                          placeholder="VD: Nguyễn Văn Hùng"
                          className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border-2 border-stone-200 focus:border-[#9A3412] focus:outline-none text-sm font-bold text-stone-900"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-800">
                        3. Số điện thoại liên hệ đón đoàn *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-[#9A3412] absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          value={tourPhone}
                          onChange={(e) => setTourPhone(e.target.value)}
                          placeholder="VD: 0912 345 678"
                          className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border-2 border-stone-200 focus:border-[#9A3412] focus:outline-none text-sm font-bold text-stone-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. Ngày tham quan, Khung giờ & Số lượng khách */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-800">
                        4. Ngày tham quan *
                      </label>
                      <input
                        type="date"
                        required
                        value={tourDate}
                        onChange={(e) => setTourDate(e.target.value)}
                        className="w-full px-3.5 py-3 rounded-2xl bg-white border-2 border-stone-200 focus:border-[#9A3412] focus:outline-none text-sm font-bold text-stone-900"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-800">
                        5. Khung giờ đón đoàn *
                      </label>
                      <select
                        value={tourTimeSlot}
                        onChange={(e) => setTourTimeSlot(e.target.value)}
                        className="w-full px-3.5 py-3 rounded-2xl bg-white border-2 border-stone-200 focus:border-[#9A3412] focus:outline-none text-sm font-bold text-stone-900"
                      >
                        <option value="07:30 - 09:30">07:30 - 09:30 (Sáng sớm)</option>
                        <option value="08:30 - 10:30">08:30 - 10:30 (Giờ chính sáng)</option>
                        <option value="09:30 - 11:30">09:30 - 11:30 (Cuối buổi sáng)</option>
                        <option value="14:00 - 16:00">14:00 - 16:00 (Đầu giờ chiều)</option>
                        <option value="15:00 - 17:00">15:00 - 17:00 (Cuối buổi chiều)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-800">
                        6. Số lượng khách *
                      </label>
                      <div className="relative">
                        <Users className="w-4 h-4 text-[#9A3412] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="number"
                          required
                          min={1}
                          max={5000}
                          value={tourGroupSize}
                          onChange={(e) =>
                            setTourGroupSize(Math.max(1, parseInt(e.target.value) || 1))
                          }
                          className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-white border-2 border-stone-200 focus:border-[#9A3412] focus:outline-none text-sm font-extrabold text-[#9A3412]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. Phương tiện di chuyển */}
                  <div className="space-y-2">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-800">
                      7. Phương tiện di chuyển *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {(
                        [
                          { id: "bus", label: "Xe khách", icon: Bus },
                          { id: "car", label: "Ô tô", icon: Car },
                          { id: "motorcycle", label: "Xe máy", icon: Bike },
                          { id: "walking", label: "Khác", icon: Footprints }
                        ] as const
                      ).map((item) => {
                        const IconComp = item.icon;
                        const active = tourTransport === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setTourTransport(item.id)}
                            className={`p-3 rounded-2xl border-2 text-left flex items-center justify-between transition-all cursor-pointer ${
                              active
                                ? "bg-[#9A3412] text-white border-[#D4AF37] shadow-sm"
                                : "bg-white text-stone-800 border-stone-200 hover:border-[#9A3412]"
                            }`}
                          >
                            <span className="text-xs font-extrabold">
                              {active ? "☑" : "□"} {item.label}
                            </span>
                            <IconComp
                              className={`w-4 h-4 ${
                                active ? "text-[#F3D27A]" : "text-[#9A3412]"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 5. Dịch vụ hỗ trợ tại di tích */}
                  <div className="space-y-2">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-800">
                      8. Yêu cầu hỗ trợ thuyết minh & trải nghiệm tại Đền
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {(
                        [
                          {
                            id: "tour_guide",
                            label: "Thuyết minh viên tại điểm",
                            desc: "Đón đoàn tại Nghi môn & dẫn lễ"
                          },
                          {
                            id: "ai_tour",
                            label: "Thuyết minh AI & 360°",
                            desc: "Trải nghiệm Audio AI & QR trạm"
                          },
                          {
                            id: "student_group_support",
                            label: "Hỗ trợ Đoàn Học sinh",
                            desc: "Tổ chức Hộ chiếu & Đấu trường Quiz"
                          }
                        ] as const
                      ).map((req) => {
                        const checked = tourRequirements.includes(req.id);
                        return (
                          <button
                            key={req.id}
                            type="button"
                            onClick={() => toggleTourRequirement(req.id)}
                            className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                              checked
                                ? "bg-amber-50 border-[#9A3412]"
                                : "bg-white border-stone-200 hover:border-stone-300"
                            }`}
                          >
                            <div className="text-xs font-extrabold text-stone-900">
                              {checked ? "✓ " : "+ "}
                              {req.label}
                            </div>
                            <div className="text-[10px] text-stone-500 mt-0.5">{req.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 6. Ghi chú */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-700">
                      Ghi chú thêm cho Ban Quản lý Di tích (Tùy chọn)
                    </label>
                    <input
                      type="text"
                      value={tourNotes}
                      onChange={(e) => setTourNotes(e.target.value)}
                      placeholder="VD: Đoàn dâng hương tại Chính điện lúc 08:45, cần chuẩn bị lễ vật..."
                      className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-stone-200 focus:border-[#9A3412] focus:outline-none text-xs font-semibold text-stone-800"
                    />
                  </div>

                  {errorMsg && (
                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-xs font-bold text-rose-800">
                      ⚠️ {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#9A3412] via-[#B43B12] to-[#7C2D12] hover:brightness-110 text-white font-extrabold text-sm sm:text-base border-2 border-[#D4AF37] shadow-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                  >
                    <Send className="w-5 h-5 text-[#F3D27A]" />
                    <span>
                      {isSubmitting
                        ? "Đang khởi tạo Mã Đoàn Tham Quan..."
                        : "Hoàn Tất Đăng Ký Đặt Tour & Nhận Mã Đoàn Ngay"}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#F3D27A]" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* CASE B: STUDENT, TEACHER, ADMIN AUTHENTICATION PORTALS */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Role Info & Live Student Heritage ID Card */}
              <div className="lg:col-span-5 space-y-5">
                {selectedRole === "student" ? (
                  /* PROFESSIONAL LIVE STUDENT HERITAGE ID CARD PREVIEW */
                  <div className="rounded-3xl overflow-hidden border-2 border-[#D4AF37] bg-gradient-to-br from-[#1F0D0F] via-[#2A1215] to-[#140A0B] text-white shadow-2xl">
                    {/* Card Header */}
                    <div className="px-6 py-4 bg-gradient-to-r from-[#8B1E1E] to-[#631212] border-b border-[#D4AF37]/40 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center">
                          <GraduationCap className="w-5 h-5 text-[#F3D27A]" />
                        </div>
                        <div>
                          <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#F3D27A]">
                            THẺ HỌC SINH DI SẢN SỐ
                          </div>
                          <div className="text-xs font-bold text-white/90">
                            Đền Hai Bà Trưng – Xã Mê Linh, TP. Hà Nội
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-[#F3D27A] tracking-wider uppercase">
                        +100 XP
                      </span>
                    </div>

                    {/* Live Preview Body */}
                    <div className="p-6 space-y-5">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B38728] text-[#1A0D0E] font-cinzel font-extrabold text-2xl flex items-center justify-center shadow-lg border-2 border-white/80 shrink-0">
                          {regName.trim()
                            ? regName
                                .trim()
                                .split(/\s+/)
                                .slice(-2)
                                .map((w) => w[0])
                                .join("")
                                .toUpperCase()
                            : "HS"}
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-200/75">
                            Họ và tên học sinh
                          </div>
                          <div className="text-lg sm:text-xl font-extrabold text-white truncate">
                            {regName.trim() || "Chưa nhập họ và tên..."}
                          </div>
                          <div className="text-xs font-semibold text-[#F3D27A] flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 shrink-0" />
                            <span>Danh hiệu khởi đầu: Tập Sự Di Sản</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10">
                        <div className="sm:col-span-2 p-3 rounded-2xl bg-white/5 border border-white/10">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-200/70">
                            Trường học đăng ký
                          </div>
                          <div className="text-xs font-bold text-white mt-1 line-clamp-2">
                            {regSchool.trim() || "Trường Tiểu học Văn Khê – Xã Mê Linh, TP. Hà Nội"}
                          </div>
                        </div>
                        <div className="p-3 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/40">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-[#F3D27A]">
                            Lớp học
                          </div>
                          <div className="text-sm font-extrabold text-white mt-1">
                            {regGrade.trim() || "Lớp 4A"}
                          </div>
                        </div>
                      </div>

                      {/* 3 Steps Summary */}
                      <div className="space-y-2 pt-2 border-t border-white/10 text-xs text-stone-200">
                        <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#F3D27A]">
                          Quy trình tham gia học tập đơn giản (3 thông tin):
                        </div>
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>
                            Chỉ cần đăng ký <strong>Họ và tên</strong>, <strong>Trường</strong> và <strong>Lớp</strong> (Không cần Email/Mật khẩu)
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>
                            Tự động khởi tạo Hồ sơ Học sinh & lưu tiến độ 6 Trạm Di tích
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>
                            Làm bài trắc nghiệm lịch sử, tích lũy điểm XP và mở khóa Huy hiệu
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : selectedRole === "teacher" ? (
                  /* PROFESSIONAL LIVE TEACHER HERITAGE CARD PREVIEW */
                  <div className="rounded-3xl overflow-hidden border-2 border-[#D4AF37] bg-gradient-to-br from-[#102A27] via-[#173D38] to-[#0B1F1C] text-white shadow-2xl">
                    <div className="px-6 py-4 bg-gradient-to-r from-[#1F544E] to-[#143B36] border-b border-[#D4AF37]/40 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-[#F3D27A]" />
                        </div>
                        <div>
                          <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#F3D27A]">
                            THẺ GIÁO VIÊN DI SẢN SỐ
                          </div>
                          <div className="text-xs font-bold text-white/90">
                            Đền Hai Bà Trưng – Xã Mê Linh, TP. Hà Nội
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-[#F3D27A] tracking-wider uppercase">
                        GIÁO VIÊN
                      </span>
                    </div>

                    <div className="p-6 space-y-5">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B38728] text-[#1A0D0E] font-cinzel font-extrabold text-2xl flex items-center justify-center shadow-lg border-2 border-white/80 shrink-0">
                          {regName.trim()
                            ? regName
                                .trim()
                                .split(/\s+/)
                                .slice(-2)
                                .map((w) => w[0])
                                .join("")
                                .toUpperCase()
                            : "GV"}
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-200/75">
                            Họ và tên giáo viên
                          </div>
                          <div className="text-lg sm:text-xl font-extrabold text-white truncate">
                            {regName.trim() || "Chưa nhập họ và tên..."}
                          </div>
                          <div className="text-xs font-semibold text-[#F3D27A] flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 shrink-0" />
                            <span>Cổng Giáo viên & Học liệu Di sản</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-200/70">
                          Trường công tác
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-white mt-1 line-clamp-2">
                          {regSchool.trim() || "Trường Tiểu học Văn Khê – Xã Mê Linh, TP. Hà Nội"}
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-white/10 text-xs text-stone-200">
                        <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#F3D27A]">
                          Thao tác đăng nhập đơn giản (2 thông tin):
                        </div>
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>
                            Chỉ cần nhập <strong>Họ và tên</strong> và <strong>Trường</strong> (Không cần Email/Mật khẩu)
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>
                            Vào thẳng <strong>Cổng Giáo viên (Teacher Dashboard)</strong> ngay lập tức
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>
                            Quản lý lớp học, soạn bài giảng AI & theo dõi tiến độ học sinh
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative h-44 rounded-3xl overflow-hidden border-2 border-[#D4AF37]">
                      <img
                        src={leHoiImg}
                        alt={selectedRole}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1A0D0E] via-black/40 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-[#F3D27A] block">
                          CỔNG QUẢN TRỊ VIÊN (ADMIN PORTAL)
                        </span>
                        <h3 className="text-xl font-extrabold font-cinzel mt-1">
                          Đăng nhập Quản trị viên
                        </h3>
                      </div>
                    </div>

                    {/* Role Capabilities List */}
                    <div className="p-5 rounded-3xl bg-[#FAF8F5] border border-stone-200 space-y-3">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#8B1E1E]">
                        Quyền hạn & Chuyển hướng sau khi xác thực:
                      </h4>

                      {selectedRole === "admin" && (
                        <ul className="space-y-2 text-xs text-stone-700 font-medium">
                          <li className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-[#8B1E1E] shrink-0" />
                            <span>
                              Tài khoản mặc định duy nhất:{" "}
                              <strong className="text-[#8B1E1E]">nguyenquang1992vka@gmail.com</strong>
                            </span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                            <span>
                              <strong>Không ai có quyền đăng ký hoặc chỉnh sửa</strong> ngoài tài khoản Quản trị viên này
                            </span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>
                              Toàn quyền điều hành 4 bảng dữ liệu & Kho Nội dung Số
                            </span>
                          </li>
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Login & Registration Form */}
              <div className="lg:col-span-7">{renderAuthForm(selectedRole)}</div>
            </div>
          )}

          {/* MỤC HỌC SINH ĐĂNG BÀI, ĐĂNG ẢNH, ĐĂNG VIDEO & BÌNH LUẬN CÔNG KHAI TRONG CỔNG HỌC SINH */}
          {selectedRole === "student" && (
            <div id="student-portal-public-feed" className="mt-8 pt-6 border-t-2 border-[#D4AF37]/40">
              <HeritageSocialFeed
                posts={resolvedPosts}
                onUpdatePosts={resolvedSetPosts}
                userRole="student"
                studentName={regName.trim() || "Học sinh Mê Linh"}
                studentGrade={regGrade.trim() || "Khối 6"}
                studentSchool={regSchool.trim() || "Trường Tiểu học Văn Khê"}
                onAddXp={() => {}}
                onUnlockBadge={() => {}}
                compactHeader
              />
            </div>
          )}
        </section>
      </div>
    </ResponsiveLayout>
  );

  function renderAuthForm(role: RoleTab) {
    const existingStudents = userAccounts
      .filter((u) => u.role === "student")
      .slice(0, 6);
    const existingTeachers = userAccounts
      .filter((u) => u.role === "teacher")
      .slice(0, 6);

    // =========================================================================
    // DEDICATED STREAMLINED TEACHER PORTAL (CHỈ CẦN HỌ VÀ TÊN + TRƯỜNG)
    // =========================================================================
    if (role === "teacher") {
      return (
        <div className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 border-2 border-[#D4AF37]/70 shadow-xl space-y-6">
          <div className="space-y-1 border-b border-stone-200 pb-4">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#1F544E]">
              CỔNG GIÁO VIÊN TRỰC TUYẾN • THAO TÁC ĐĂNG NHẬP ĐƠN GIẢN
            </div>
            <h4 className="text-xl sm:text-2xl font-extrabold font-cinzel text-stone-900">
              Đăng Nhập Cổng Giáo Viên
            </h4>
            <p className="text-xs text-stone-600">
              Thầy/Cô chỉ cần nhập <strong>Họ và tên</strong> và <strong>Trường</strong> để truy cập ngay vào Cổng Giáo viên (Không cần Email & Mật khẩu).
            </p>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-5">
            {/* Field 1: Họ và tên giáo viên */}
            <div className="space-y-2">
              <label className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-stone-800">
                <span>1. Họ và tên giáo viên *</span>
                <span className="text-[11px] font-semibold text-[#1F544E] normal-case">
                  Bắt buộc
                </span>
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-[#1F544E] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Ví dụ: Cô Nguyễn Thu Hà / Thầy Trần Văn Minh"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border-2 border-stone-200 focus:border-[#1F544E] focus:outline-none text-base font-bold text-stone-900 shadow-xs transition-colors"
                />
              </div>
            </div>

              {/* Field 2: Trường học */}
              <div className="space-y-2.5">
                <label className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-stone-800">
                  <span>2. Trường công tác *</span>
                  <span className="text-[11px] font-medium text-stone-500 normal-case">
                    Gợi ý chọn nhanh Tiểu học / THCS / THPT hoặc tự nhập
                  </span>
                </label>
                <div className="relative">
                  <Building2 className="w-5 h-5 text-[#1F544E] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    list="school-presets-datalist"
                    required
                    value={regSchool}
                    onChange={(e) => setRegSchool(e.target.value)}
                    placeholder="VD: Tiểu học Văn Khê, Tiểu học Mê Linh, Tiểu học Tiền Phong, THCS Mê Linh, THCS Tiền Phong..."
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border-2 border-stone-200 focus:border-[#1F544E] focus:outline-none text-sm font-bold text-stone-900 shadow-xs transition-colors"
                  />
                  <datalist id="school-presets-datalist">
                    {SCHOOL_PRESETS.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>
                {/* Quick School Selector Buttons */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {SCHOOL_PRESETS.map((schoolName) => {
                    const isSelected = regSchool.trim() === schoolName;
                    return (
                      <button
                        key={schoolName}
                        type="button"
                        onClick={() => setRegSchool(schoolName)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#1F544E] text-white border-[#1F544E] shadow-xs"
                            : "bg-white hover:bg-stone-100 text-stone-700 border-stone-200"
                        }`}
                      >
                        {schoolName}
                      </button>
                    );
                  })}
                </div>
              </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-xs font-bold text-rose-800">
                ⚠️ {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-800">
                ✓ {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#1F544E] via-[#176B62] to-[#13423C] hover:brightness-110 text-white font-extrabold text-sm sm:text-base border-2 border-[#D4AF37] shadow-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              <LogIn className="w-5 h-5 text-[#F3D27A]" />
              <span>
                {isSubmitting
                  ? "Đang truy cập Cổng Giáo viên..."
                  : "Đăng Nhập Vào Cổng Giáo Viên Ngay"}
              </span>
              <ArrowRight className="w-4 h-4 text-[#F3D27A]" />
            </button>
          </form>

          {/* Quick 1-Click Teacher Profile Selection if available */}
          {existingTeachers.length > 0 && (
            <div className="space-y-2.5 pt-4 border-t border-stone-200">
              <div className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
                Hoặc chọn nhanh Hồ sơ Giáo viên đã lưu:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {existingTeachers.map((tch) => (
                  <button
                    key={tch.id}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleExistingTeacherEnter(tch)}
                    className="p-3 rounded-2xl bg-white hover:bg-emerald-50/70 border-2 border-stone-200 hover:border-[#1F544E] text-left flex items-center justify-between gap-3 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[#1F544E] text-[#F3D27A] font-extrabold text-xs flex items-center justify-center shrink-0">
                        {tch.name
                          .split(/\s+/)
                          .slice(-2)
                          .map((w) => w[0])
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-extrabold text-stone-900 truncate">
                          {tch.name}
                        </div>
                        <div className="text-[11px] text-stone-500 truncate">
                          {(tch.school || "").split("–")[0].trim()}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#1F544E] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // =========================================================================
    // DEDICATED PROFESSIONAL STUDENT REGISTRATION & LOGIN PORTAL
    // (CHỈ CẦN ĐĂNG KÝ TÊN, TRƯỜNG, LỚP)
    // =========================================================================
    if (role === "student") {
      return (
        <div className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 border-2 border-[#D4AF37]/70 shadow-xl space-y-6">
          {/* Header & Segmented Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
            <div className="space-y-1">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#8B1E1E]">
                CỔNG ĐĂNG KÝ HỌC SINH TRỰC TUYẾN
              </div>
              <h4 className="text-xl sm:text-2xl font-extrabold font-cinzel text-stone-900">
                {authMode === "register"
                  ? "Đăng ký Hồ sơ Học sinh"
                  : "Tiếp tục Học tập (Học sinh Đã đăng ký)"}
              </h4>
              <p className="text-xs text-stone-600">
                Chỉ cần điền <strong>Họ và tên</strong>, <strong>Trường học</strong> và <strong>Lớp học</strong> để bắt đầu hành trình khám phá di sản.
              </p>
            </div>

            <div className="flex bg-stone-200/80 p-1 rounded-xl gap-1 shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("register");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  authMode === "register"
                    ? "bg-[#8B1E1E] text-white shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Đăng ký Học sinh</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  authMode === "login"
                    ? "bg-[#8B1E1E] text-white shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Học sinh đã có hồ sơ</span>
              </button>
            </div>
          </div>

          {authMode === "register" ? (
            /* STREAMLINED 3-FIELD STUDENT REGISTRATION FORM: TÊN, TRƯỜNG, LỚP */
            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              {/* Field 1: Họ và tên học sinh */}
              <div className="space-y-2">
                <label className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-stone-800">
                  <span>1. Họ và tên học sinh *</span>
                  <span className="text-[11px] font-semibold text-[#8B1E1E] normal-case">
                    Bắt buộc
                  </span>
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-[#8B1E1E] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Minh Anh"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border-2 border-stone-200 focus:border-[#8B1E1E] focus:outline-none text-base font-bold text-stone-900 shadow-xs transition-colors"
                  />
                </div>
              </div>

              {/* Field 2: Trường học */}
              <div className="space-y-2.5">
                <label className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-stone-800">
                  <span>2. Trường học *</span>
                  <span className="text-[11px] font-medium text-stone-500 normal-case">
                    Gợi ý chọn nhanh Tiểu học / THCS / THPT hoặc tự nhập
                  </span>
                </label>
                <div className="relative">
                  <Building2 className="w-5 h-5 text-[#8B1E1E] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    list="student-school-presets-datalist"
                    required
                    value={regSchool}
                    onChange={(e) => setRegSchool(e.target.value)}
                    placeholder="VD: Tiểu học Văn Khê, Tiểu học Mê Linh, Tiểu học Tiền Phong, THCS Mê Linh, THCS Tiền Phong..."
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border-2 border-stone-200 focus:border-[#8B1E1E] focus:outline-none text-sm font-bold text-stone-900 shadow-xs transition-colors"
                  />
                  <datalist id="student-school-presets-datalist">
                    {SCHOOL_PRESETS.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>
                {/* Quick School Selector Buttons */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {SCHOOL_PRESETS.map((schoolName) => {
                    const isSelected = regSchool.trim() === schoolName;
                    return (
                      <button
                        key={schoolName}
                        type="button"
                        onClick={() => setRegSchool(schoolName)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#8B1E1E] text-white border-[#8B1E1E] shadow-xs"
                            : "bg-white hover:bg-stone-100 text-stone-700 border-stone-200"
                        }`}
                      >
                        {schoolName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field 3: Lớp / Khối lớp */}
              <div className="space-y-2.5">
                <label className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-stone-800">
                  <span>3. Lớp / Khối lớp (Tiểu học, THCS, THPT) *</span>
                  <span className="text-[11px] font-medium text-stone-500 normal-case">
                    Dành cho mọi khối lớp (Khối 1–5, Khối 6–9, THPT)
                  </span>
                </label>
                <div className="relative">
                  <GraduationCap className="w-5 h-5 text-[#8B1E1E] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regGrade}
                    onChange={(e) => setRegGrade(e.target.value)}
                    placeholder="Ví dụ: Lớp 3A, Lớp 5B, Lớp 6A1, Lớp 8B, Lớp 9A, Lớp 10A1..."
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border-2 border-stone-200 focus:border-[#8B1E1E] focus:outline-none text-sm font-bold text-stone-900 shadow-xs transition-colors"
                  />
                </div>
                {/* Quick Grade Selector Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 pt-0.5">
                  {GRADE_PRESETS.map((gradeItem) => {
                    const isSelected = regGrade.trim() === gradeItem;
                    return (
                      <button
                        key={gradeItem}
                        type="button"
                        onClick={() => setRegGrade(gradeItem)}
                        className={`py-2 px-2 rounded-xl text-xs font-extrabold border text-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#1F544E] text-white border-[#1F544E] shadow-xs"
                            : "bg-white hover:bg-stone-100 text-stone-700 border-stone-200"
                        }`}
                      >
                        {gradeItem}
                      </button>
                    );
                  })}
                </div>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-xs font-bold text-rose-800">
                  ⚠️ {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-800">
                  ✓ {successMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#8B1E1E] via-[#A32222] to-[#8B1E1E] hover:brightness-110 text-white font-extrabold text-sm sm:text-base border-2 border-[#D4AF37] shadow-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <GraduationCap className="w-5 h-5 text-[#F3D27A]" />
                <span>
                  {isSubmitting
                    ? "Đang khởi tạo Hồ sơ Học sinh..."
                    : "Hoàn tất Đăng ký & Vào Không gian Học tập"}
                </span>
                <ArrowRight className="w-4 h-4 text-[#F3D27A]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("student-portal-public-feed");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full py-3 px-5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-[#8B1E1E] font-extrabold text-xs sm:text-sm border-2 border-[#D4AF37] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#8B1E1E]" />
                <span>📝 Mở Mục Học Sinh Đăng Bài, Đăng Ảnh, Đăng Video & Bình Luận Công Khai ↓</span>
              </button>
            </form>
          ) : (
            /* RETURNING STUDENT QUICK ACCESS (CHỌN HỒ SƠ HOẶC NHẬP TÊN, TRƯỜNG, LỚP) */
            <div className="space-y-5">
              {existingStudents.length > 0 && (
                <div className="space-y-2.5">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
                    Chọn nhanh Hồ sơ Học sinh đã đăng ký gần đây:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {existingStudents.map((stu) => (
                      <button
                        key={stu.id}
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleExistingStudentEnter(stu)}
                        className="p-3.5 rounded-2xl bg-white hover:bg-amber-50/70 border-2 border-stone-200 hover:border-[#8B1E1E] text-left flex items-center justify-between gap-3 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-[#8B1E1E] text-[#F3D27A] font-extrabold text-xs flex items-center justify-center shrink-0">
                            {stu.name
                              .split(/\s+/)
                              .slice(-2)
                              .map((w) => w[0])
                              .join("")
                              .toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-extrabold text-stone-900 truncate">
                              {stu.name}
                            </div>
                            <div className="text-[11px] text-stone-500 truncate">
                              {stu.grade || "Lớp 4A"} · {(stu.school || "").split("–")[0].trim()}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#8B1E1E] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!regName.trim()) {
                    setErrorMsg("Vui lòng nhập Họ và tên học sinh.");
                    return;
                  }
                  handleExistingStudentEnter({
                    id: `std-${Date.now()}`,
                    name: regName.trim(),
                    email: "",
                    role: "student",
                    status: "active",
                    grade: regGrade.trim() || "Lớp 4A",
                    school:
                      regSchool.trim() ||
                      "Trường Tiểu học Văn Khê – Xã Mê Linh, TP. Hà Nội"
                  });
                }}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 space-y-4"
              >
                <div className="text-xs font-extrabold uppercase tracking-wider text-[#8B1E1E]">
                  Hoặc nhập Tên, Trường, Lớp để vào học ngay:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      Họ và tên học sinh
                    </label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Nhập họ và tên..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-stone-300 text-sm font-bold text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      Trường học
                    </label>
                    <input
                      type="text"
                      required
                      value={regSchool}
                      onChange={(e) => setRegSchool(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-stone-300 text-sm font-bold text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      Lớp học
                    </label>
                    <input
                      type="text"
                      required
                      value={regGrade}
                      onChange={(e) => setRegGrade(e.target.value)}
                      placeholder="VD: Lớp 4A"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-stone-300 text-sm font-bold text-stone-900"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-xs font-bold text-rose-800">
                    ⚠️ {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-[#8B1E1E] hover:bg-[#721717] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <LogIn className="w-4 h-4 text-[#F3D27A]" />
                  <span>Vào Không gian Học tập Học sinh</span>
                </button>
              </form>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 border-2 border-stone-200 space-y-5">
        {/* Mode Switcher: Đăng nhập | Đăng ký | Quên mật khẩu | Xác minh email */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[#8B1E1E]" />
            <h4 className="text-lg font-extrabold text-stone-900">
              {authMode === "login"
                ? role === "teacher"
                  ? "Đăng nhập Tài khoản Giáo viên"
                  : role === "admin"
                  ? "Đăng nhập Bảo mật Quản trị viên"
                  : "Đăng nhập Tài khoản Du khách"
                : authMode === "register"
                ? role === "teacher"
                  ? "Đăng ký Tài khoản Giáo viên Mới"
                  : role === "admin"
                  ? "Đăng ký Quản trị viên (Super Admin)"
                  : "Đăng ký Tài khoản Du khách Mới"
                : authMode === "forgot-password"
                ? "Khôi phục / Quên Mật khẩu (Firebase Auth)"
                : "Xác minh Địa chỉ Email (Email Verification)"}
            </h4>
          </div>

          {role === "admin" ? (
            <div className="px-3.5 py-1.5 rounded-xl bg-amber-100 border border-[#D4AF37] text-[#8B1E1E] text-xs font-extrabold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Tài khoản Quản trị Mặc định Duy nhất (Khóa Đăng ký)</span>
            </div>
          ) : (
            <div className="flex flex-wrap bg-stone-200/80 p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  authMode === "login"
                    ? "bg-[#8B1E1E] text-white shadow"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng nhập</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("register");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  authMode === "register"
                    ? "bg-[#8B1E1E] text-white shadow"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Đăng ký</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("forgot-password");
                  setResetEmail(emailInput);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  authMode === "forgot-password"
                    ? "bg-[#8B1E1E] text-white shadow"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Quên mật khẩu</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("verify-email");
                  setVerifyEmailAddr(emailInput || regEmail);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  authMode === "verify-email"
                    ? "bg-[#8B1E1E] text-white shadow"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Xác minh Email</span>
              </button>
            </div>
          )}
        </div>

        {/* 1. LOGIN FORM */}
        {(authMode === "login" || role === "admin") && (
          <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
            {role === "admin" && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-[#D4AF37] text-xs text-stone-800 space-y-1">
                <div className="font-extrabold text-[#8B1E1E] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#8B1E1E] shrink-0" />
                  <span>Bảo mật Quản trị viên Độc quyền</span>
                </div>
                <p className="text-[11px] text-stone-700 leading-relaxed">
                  Hệ thống chỉ chấp nhận duy nhất tài khoản Quản trị viên mặc định{" "}
                  <strong>nguyenquang1992vka@gmail.com</strong>. Không ai khác có quyền đăng ký hoặc chỉnh sửa dữ liệu hệ thống.
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-extrabold uppercase text-stone-700 mb-1.5">
                {role === "admin"
                  ? "Tài khoản Quản trị viên Mặc định (Cố định)"
                  : "Địa chỉ Email đăng nhập"}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  readOnly={role === "admin"}
                  value={role === "admin" ? "nguyenquang1992vka@gmail.com" : emailInput}
                  onChange={(e) => {
                    if (role !== "admin") setEmailInput(e.target.value);
                  }}
                  placeholder="Nhập email tài khoản thực của bạn..."
                  className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 text-sm font-bold ${
                    role === "admin"
                      ? "bg-amber-50/70 border-[#D4AF37] text-[#8B1E1E] cursor-not-allowed"
                      : "bg-white border-stone-200 focus:border-[#8B1E1E] focus:outline-none text-stone-900"
                  }`}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-extrabold uppercase text-stone-700">
                  Mật khẩu bảo vệ
                </label>
                {role !== "admin" && (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(emailInput);
                        setAuthMode("forgot-password");
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-xs font-extrabold text-[#8B1E1E] hover:underline cursor-pointer"
                    >
                      Quên mật khẩu?
                    </button>
                    <span className="text-stone-300">•</span>
                    <button
                      type="button"
                      onClick={() => {
                        setVerifyEmailAddr(emailInput);
                        setAuthMode("verify-email");
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-xs font-extrabold text-emerald-700 hover:underline cursor-pointer"
                    >
                      Xác minh Email
                    </button>
                  </div>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-white border-2 border-stone-200 focus:border-[#8B1E1E] focus:outline-none text-sm font-bold text-stone-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-xs font-bold text-rose-800">
                ⚠️ {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-800">
                ✓ {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#8B1E1E] to-[#B22222] hover:brightness-110 text-white font-extrabold text-sm border-2 border-[#D4AF37] shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-[#D4AF37]" />
              <span>
                {isSubmitting
                  ? "Đang xác thực phiên đăng nhập..."
                  : role === "teacher"
                  ? "Đăng nhập Giáo viên → Teacher Dashboard"
                  : role === "admin"
                  ? "Đăng nhập Quản trị viên → Admin Dashboard"
                  : "Đăng nhập Du khách"}
              </span>
            </button>

            {/* Firebase Google Authentication Button */}
            <div className="relative flex py-1 items-center">
              <div className="grow border-t border-stone-200"></div>
              <span className="shrink mx-3 text-[11px] font-bold text-stone-400 uppercase">
                Hoặc xác thực qua Firebase
              </span>
              <div className="grow border-t border-stone-200"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs border-2 border-stone-200 shadow-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              <span className="w-5 h-5 rounded-full bg-[#8B1E1E] text-white flex items-center justify-center font-extrabold text-[11px]">
                G
              </span>
              <span>Tiếp tục với Google (Firebase Authentication)</span>
            </button>
          </form>
        )}

        {/* 2. REGISTRATION FORM (TEACHER & VISITOR ONLY - NO ADMIN REGISTRATION) */}
        {authMode === "register" && role !== "admin" && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-extrabold uppercase text-stone-700 mb-1">
                  Họ và tên (Lưu vào bảng USERS)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder={
                      role === "teacher"
                        ? "Nhập họ và tên giáo viên..."
                        : "Nhập họ và tên..."
                    }
                    className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-white border-2 border-stone-200 text-sm font-bold text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-stone-700 mb-1">
                  Email đăng ký (Firebase Auth)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="Nhập địa chỉ email thật..."
                    className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-white border-2 border-stone-200 text-sm font-bold text-stone-900"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-extrabold uppercase text-stone-700 mb-1">
                  Mật khẩu (tối thiểu 6 ký tự)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-stone-200 text-sm font-bold text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-stone-700 mb-1">
                  Nhập lại mật khẩu
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Xác nhận mật khẩu..."
                  className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-stone-200 text-sm font-bold text-stone-900"
                />
              </div>
            </div>

            {role === "teacher" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-stone-700 mb-1">
                    Chuyên môn / Lớp phụ trách
                  </label>
                  <input
                    type="text"
                    required
                    value={regSubject}
                    onChange={(e) => setRegSubject(e.target.value)}
                    placeholder="VD: Lịch sử & Địa lý - Khối 4"
                    className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-stone-200 text-sm font-bold text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase text-stone-700 mb-1">
                    Đơn vị trường học
                  </label>
                  <input
                    type="text"
                    required
                    value={regSchool}
                    onChange={(e) => setRegSchool(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-stone-200 text-sm font-bold text-stone-900"
                  />
                </div>
              </div>
            )}

            {role === "visitor" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-stone-700 mb-1">
                    Số điện thoại liên hệ
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="VD: 0912345678"
                      className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-white border-2 border-stone-200 text-sm font-bold text-stone-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase text-stone-700 mb-1">
                    Đoàn / Đơn vị / Trường
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={regSchool}
                      onChange={(e) => setRegSchool(e.target.value)}
                      placeholder="VD: Đoàn Du khách Hà Nội"
                      className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-white border-2 border-stone-200 text-sm font-bold text-stone-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-xs font-bold text-rose-800">
                ⚠️ {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-800">
                ✓ {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#2F6F68] to-[#1F544E] hover:brightness-110 text-white font-extrabold text-sm border-2 border-[#D4AF37] shadow-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-[#D4AF37]" />
              <span>
                {isSubmitting
                  ? "Đang khởi tạo tài khoản Firebase & Firestore..."
                  : role === "teacher"
                  ? "Hoàn tất Đăng ký Giáo viên & Lưu Firestore"
                  : "Hoàn tất Đăng ký Du khách & Đặt lịch"}
              </span>
            </button>
          </form>
        )}

        {/* 3. FORGOT PASSWORD FORM */}
        {authMode === "forgot-password" && (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-stone-700">
              Nhập địa chỉ Email tài khoản của bạn. Hệ thống sẽ gửi email khôi phục mật khẩu qua <strong>Firebase Authentication (sendPasswordResetEmail)</strong> và cho phép cập nhật mật khẩu mới.
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase text-stone-700 mb-1.5">
                Email tài khoản cần khôi phục
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Nhập địa chỉ email đã đăng ký..."
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border-2 border-stone-200 focus:border-[#8B1E1E] focus:outline-none text-sm font-bold text-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase text-stone-700 mb-1.5">
                Đặt mật khẩu mới (Tùy chọn khôi phục nhanh - tối thiểu 6 ký tự)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  minLength={6}
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới nếu muốn đổi ngay..."
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border-2 border-stone-200 focus:border-[#8B1E1E] focus:outline-none text-sm font-bold text-stone-900"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-xs font-bold text-rose-800">
                ⚠️ {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-800">
                ✓ {successMsg}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#8B1E1E] to-[#B22222] text-white font-extrabold text-xs border-2 border-[#D4AF37] shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-[#D4AF37]" />
                <span>
                  {isSubmitting
                    ? "Đang xử lý khôi phục mật khẩu..."
                    : "Gửi Email Đặt lại Mật khẩu & Cập nhật"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="px-5 py-3.5 rounded-2xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-extrabold text-xs cursor-pointer"
              >
                Quay lại Đăng nhập
              </button>
            </div>
          </form>
        )}

        {/* 4. EMAIL VERIFICATION FORM */}
        {authMode === "verify-email" && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-stone-700">
              Xác minh địa chỉ Email chính chủ qua <strong>Firebase Authentication (sendEmailVerification)</strong> để kích hoạt đầy đủ quyền đồng bộ dữ liệu thời gian thực lên Cloud Firestore.
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase text-stone-700 mb-1.5">
                Địa chỉ Email cần xác minh
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={verifyEmailAddr}
                  onChange={(e) => setVerifyEmailAddr(e.target.value)}
                  placeholder="Nhập địa chỉ email tài khoản..."
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border-2 border-stone-200 focus:border-[#8B1E1E] focus:outline-none text-sm font-bold text-stone-900"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-xs font-bold text-rose-800">
                ⚠️ {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-800">
                ✓ {successMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleVerifyEmailAction(false)}
                className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#8B1E1E] to-[#B22222] text-white font-extrabold text-xs border-2 border-[#D4AF37] shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail className="w-4 h-4 text-[#D4AF37]" />
                <span>Gửi Email Xác minh (Firebase)</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleVerifyEmailAction(true)}
                className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#2F6F68] to-[#1F544E] text-white font-extrabold text-xs border-2 border-[#D4AF37] shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                <span>Xác nhận Đã Xác minh Email</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
};

function BookOpenIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

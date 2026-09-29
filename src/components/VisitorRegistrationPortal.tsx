import React, { useState, useMemo } from "react";
import {
  VisitorRegistration,
  TransportationType,
  SpecialRequirementType,
  VisitorRegistrationStatus,
  PlatformAnalyticsState,
  UserAccount
} from "../types";
import { createVisitorRegistrationInDb } from "../services/heritageDatabase";
import templeBgImage from "../assets/images/den_hai_ba_trung_real.jpg";
import {
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  Building2,
  Bus,
  Car,
  Bike,
  Footprints,
  Sparkles,
  CheckCircle2,
  XCircle,
  Search,
  Send,
  FileText,
  UserCheck,
  Bot,
  GraduationCap,
  MapPin,
  ShieldCheck,
  RefreshCw,
  Compass,
  Lock,
  History,
  LogIn
} from "lucide-react";

interface VisitorRegistrationPortalProps {
  currentUser?: UserAccount | null;
  viewedLocations?: string[];
  initialLatestBooking?: VisitorRegistration | null;
  onRequestRegisteredVisitorAuth?: () => void;
  registrations: VisitorRegistration[];
  onRegistrationsChange: (updated: VisitorRegistration[]) => void;
  onAnalyticsUpdate?: (analytics: PlatformAnalyticsState) => void;
  onOpenAIChat?: (prompt: string) => void;
}

export const TIME_SLOTS = [
  "07:30 - 09:30 (Sáng sớm)",
  "08:30 - 10:30 (Giờ chính sáng)",
  "09:30 - 11:30 (Cuối buổi sáng)",
  "14:00 - 16:00 (Đầu giờ chiều)",
  "15:00 - 17:00 (Cuối buổi chiều)"
];

const TRANSPORT_OPTIONS: {
  id: TransportationType;
  labelVi: string;
  desc: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  {
    id: "bus",
    labelVi: "Xe khách",
    desc: "Đoàn trường / Tour (Bãi xe P1)",
    icon: Bus
  },
  {
    id: "car",
    labelVi: "Ô tô",
    desc: "Xe gia đình / Cơ quan (Bãi xe P2)",
    icon: Car
  },
  {
    id: "motorcycle",
    labelVi: "Xe máy",
    desc: "Cá nhân / Nhóm nhỏ (Khu M1)",
    icon: Bike
  },
  {
    id: "walking",
    labelVi: "Khác",
    desc: "Đi bộ / Xe đạp / Phương tiện khác",
    icon: Footprints
  }
];

const SPECIAL_REQ_OPTIONS: {
  id: SpecialRequirementType;
  labelVi: string;
  desc: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  {
    id: "tour_guide",
    labelVi: "Thuyết minh viên tại điểm",
    desc: "Đón đoàn tại Nghi môn & dẫn lễ dâng hương",
    icon: UserCheck
  },
  {
    id: "ai_tour",
    labelVi: "Thuyết minh Trợ lý Di sản AI & 360°",
    desc: "Trải nghiệm Audio AI & QR 6 trạm di tích",
    icon: Bot
  },
  {
    id: "student_group_support",
    labelVi: "Hỗ trợ Đoàn Học sinh Học tập Di sản",
    desc: "Tổ chức Hộ chiếu Di sản & Đấu trường Quiz",
    icon: GraduationCap
  }
];

export const VisitorRegistrationPortal: React.FC<VisitorRegistrationPortalProps> = ({
  currentUser,
  viewedLocations = [],
  initialLatestBooking = null,
  registrations,
  onRegistrationsChange,
  onAnalyticsUpdate
}) => {
  const savedStations = useMemo(() => {
    const combined = [
      ...(currentUser?.savedHistory || []),
      ...viewedLocations
    ];
    return Array.from(new Set(combined));
  }, [currentUser?.savedHistory, viewedLocations]);

  const defaultVisitDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split("T")[0];
  }, []);

  const [fullName, setFullName] = useState(
    currentUser?.name && currentUser.name !== "Khách tham quan Di sản" ? currentUser.name : ""
  );
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phoneNumber || "");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState(
    currentUser?.school && !currentUser.school.includes("Guest") ? currentUser.school : ""
  );
  const [visitDate, setVisitDate] = useState(defaultVisitDate);
  const [preferredTime, setPreferredTime] = useState("08:30 - 10:30");
  const [totalVisitorsInput, setTotalVisitorsInput] = useState<number>(43);
  const [adultsCount, setAdultsCount] = useState<number>(5);
  const [studentsCount, setStudentsCount] = useState<number>(35);
  const [teachersCount, setTeachersCount] = useState<number>(3);
  const [transportationType, setTransportationType] =
    useState<TransportationType>("bus");
  const [specialRequirements, setSpecialRequirements] = useState<
    SpecialRequirementType[]
  >(["tour_guide", "ai_tour"]);
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [latestCreatedBooking, setLatestCreatedBooking] =
    useState<VisitorRegistration | null>(initialLatestBooking);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | VisitorRegistrationStatus>("ALL");

  const totalGroupSize = Math.max(
    1,
    Number(totalVisitorsInput) ||
      Math.max(0, Number(adultsCount) || 0) +
        Math.max(0, Number(studentsCount) || 0) +
        Math.max(0, Number(teachersCount) || 0)
  );

  const toggleRequirement = (reqId: SpecialRequirementType) => {
    setSpecialRequirements((prev) =>
      prev.includes(reqId) ? prev.filter((item) => item !== reqId) : [...prev, reqId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!organization.trim() || !fullName.trim() || !phoneNumber.trim() || !visitDate) {
      setErrorMsg(
        "Vui lòng điền đầy đủ Tên đoàn, Người phụ trách, Số điện thoại và Ngày tham quan."
      );
      return;
    }

    if (totalGroupSize <= 0) {
      setErrorMsg("Số lượng khách tham quan phải lớn hơn 0.");
      return;
    }

    setIsSubmitting(true);
    try {
      const breakdownSum =
        Math.max(0, Number(adultsCount) || 0) +
        Math.max(0, Number(studentsCount) || 0) +
        Math.max(0, Number(teachersCount) || 0);
      const effectiveAdults =
        breakdownSum === totalGroupSize
          ? Math.max(0, Number(adultsCount) || 0)
          : totalGroupSize;
      const effectiveStudents =
        breakdownSum === totalGroupSize ? Math.max(0, Number(studentsCount) || 0) : 0;
      const effectiveTeachers =
        breakdownSum === totalGroupSize ? Math.max(0, Number(teachersCount) || 0) : 0;

      const result = await createVisitorRegistrationInDb({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim() || "dukhach@melinh-heritage.vn",
        organization: organization.trim(),
        visitDate,
        preferredTime,
        adultsCount: effectiveAdults,
        studentsCount: effectiveStudents,
        teachersCount: effectiveTeachers,
        transportationType,
        specialRequirements,
        notes: notes.trim()
      });
      setIsSubmitting(false);

      if (result.error || !result.registration) {
        setErrorMsg(result.error || "Đăng ký không thành công.");
        return;
      }

      setLatestCreatedBooking(result.registration);
      if (result.visitorRegistrations) {
        onRegistrationsChange(result.visitorRegistrations);
      } else {
        onRegistrationsChange([result.registration, ...registrations]);
      }
      if (result.platformAnalytics && onAnalyticsUpdate) {
        onAnalyticsUpdate(result.platformAnalytics);
      }

      setFullName("");
      setPhoneNumber("");
      setEmail("");
      setOrganization("");
      setNotes("");
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err?.message || "Không thể gửi đăng ký. Vui lòng thử lại.");
    }
  };

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      const matchesStatus = statusFilter === "ALL" || reg.status === statusFilter;
      if (!matchesStatus) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        reg.bookingId.toLowerCase().includes(q) ||
        reg.fullName.toLowerCase().includes(q) ||
        reg.organization.toLowerCase().includes(q) ||
        reg.phoneNumber.toLowerCase().includes(q)
      );
    });
  }, [registrations, searchQuery, statusFilter]);

  const renderStatusBadge = (status: VisitorRegistrationStatus) => {
    if (status === "Approved") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Đã duyệt
        </span>
      );
    }
    if (status === "Completed") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800 border border-blue-400">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          Hoàn thành
        </span>
      );
    }
    if (status === "Rejected") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-400">
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          Từ chối
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-400">
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        Chờ duyệt
      </span>
    );
  };

  const getTransportLabel = (type: TransportationType) => {
    switch (type) {
      case "bus":
        return "🚌 Xe khách";
      case "car":
        return "🚗 Ô tô";
      case "motorcycle":
        return "🛵 Xe máy";
      case "walking":
        return "🚶 Khác";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* SMART TOURISM HERO HEADER */}
      <section className="relative rounded-[32px] overflow-hidden bg-[#1A0D0E] text-white border-2 border-[#D4AF37] shadow-2xl">
        <img
          src={templeBgImage}
          alt="Không gian du khách Đền Hai Bà Trưng"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A0D0E]/95 via-[#2C1416]/85 to-[#1A0D0E]/90 pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#9A3412] border border-[#D4AF37] text-[#D4AF37] text-xs font-extrabold uppercase">
              <span>🌏 KHÔNG GIAN DU KHÁCH • THAM QUAN VÀ KHÁM PHÁ DI SẢN SỐ</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-cinzel text-white">
              ĐĂNG KÝ THAM QUAN TRỰC TUYẾN
            </h1>
            <p className="text-sm text-amber-100/90">
              Cấp mã đoàn tham quan tự động • Lưu trữ cơ sở dữ liệu thời gian thực • Theo dõi trạng thái Chờ duyệt / Đã duyệt / Hoàn thành
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-[#D4AF37]/40 text-center">
              <div className="text-[10px] font-bold uppercase text-amber-200">Chờ duyệt</div>
              <div className="text-2xl font-extrabold text-amber-300 font-cinzel mt-0.5">
                {registrations.filter((r) => r.status === "Pending").length}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-emerald-400/40 text-center">
              <div className="text-[10px] font-bold uppercase text-emerald-200">Đã duyệt</div>
              <div className="text-2xl font-extrabold text-emerald-300 font-cinzel mt-0.5">
                {registrations.filter((r) => r.status === "Approved").length}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-blue-400/40 text-center">
              <div className="text-[10px] font-bold uppercase text-blue-200">Hoàn thành</div>
              <div className="text-2xl font-extrabold text-blue-300 font-cinzel mt-0.5">
                {registrations.filter((r) => r.status === "Completed").length}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GENERATED BOOKING ID CONFIRMATION CARD */}
      {latestCreatedBooking && (
        <section className="bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-950 text-white rounded-3xl p-6 border-2 border-[#D4AF37] shadow-2xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-300/40 text-emerald-200 text-xs font-extrabold">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>ĐĂNG KÝ THÀNH CÔNG • ĐÃ LƯU DỮ LIỆU</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold font-cinzel text-[#D4AF37]">
                Mã Đoàn Tham Quan: {latestCreatedBooking.bookingId}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100">
                Người đăng ký: <strong>{latestCreatedBooking.fullName}</strong> • Đơn vị:{" "}
                <strong>{latestCreatedBooking.organization}</strong> • Ngày:{" "}
                <strong>{latestCreatedBooking.visitDate}</strong> • Tổng số khách:{" "}
                <strong>{latestCreatedBooking.totalVisitors} người</strong> (Học sinh:{" "}
                {latestCreatedBooking.studentsCount}, Giáo viên: {latestCreatedBooking.teachersCount})
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {renderStatusBadge(latestCreatedBooking.status)}
              <button
                type="button"
                onClick={() => setLatestCreatedBooking(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold border border-white/20 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </section>
      )}

      {/* VISITOR DIRECT BOOKING STATUS & EXPLORED STATIONS */}
      <section className="bg-white rounded-3xl p-6 border-2 border-[#D4AF37] shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-emerald-800 text-xs font-extrabold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>KHÁCH THAM QUAN • ĐĂNG KÝ ĐẶT TOUR TRỰC TIẾP (KHÔNG CẦN TÀI KHOẢN & MẬT KHẨU)</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold font-cinzel text-[#8B1E1E]">
              {currentUser?.name || "Khách tham quan Di sản"}
              {currentUser?.school ? ` · ${currentUser.school}` : ""}
            </h2>
          </div>
          {savedStations.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {savedStations.map((st, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#D4AF37]/60 text-xs font-bold text-stone-800 flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#8B1E1E]" />
                  <span>{st}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* MAIN GRID: FORM (7 COLS) + LIVE STATUS TRACKER (5 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT 7 COLS: ĐĂNG KÝ THAM QUAN TRỰC TUYẾN */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 bg-white rounded-3xl border-2 border-[#D4AF37] shadow-xl p-6 sm:p-8 space-y-6 relative"
        >
          <div className="border-b border-stone-200 pb-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#8B1E1E]">
                BIỂU MẪU TRỰC TUYẾN
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold font-cinzel text-stone-900">
                Thông Tin Đoàn Tham Quan
              </h2>
            </div>
            <div className="px-3.5 py-2 rounded-2xl bg-amber-50 border border-[#D4AF37] text-right">
              <div className="text-[10px] font-bold uppercase text-stone-500">Tổng số khách</div>
              <div className="text-lg font-extrabold text-[#8B1E1E] font-cinzel">
                {totalGroupSize} khách
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-800 text-xs font-bold">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* 1. Tên đoàn, Người phụ trách, Số điện thoại, Ngày tham quan, Số lượng khách */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-extrabold text-stone-800 uppercase mb-1.5">
                Tên đoàn: *
              </label>
              <input
                type="text"
                required
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="VD: Đoàn Trường THCS Trưng Vương – Mê Linh"
                className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F5] border-2 border-stone-200 focus:border-[#8B1E1E] focus:outline-none text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-stone-800 uppercase mb-1.5">
                Người phụ trách: *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="VD: Nguyễn Văn Hùng"
                className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F5] border-2 border-stone-200 focus:border-[#8B1E1E] focus:outline-none text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-stone-800 uppercase mb-1.5">
                Số điện thoại: *
              </label>
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="VD: 0912 345 678"
                className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F5] border-2 border-stone-200 focus:border-[#8B1E1E] focus:outline-none text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-stone-800 uppercase mb-1.5">
                Ngày tham quan: *
              </label>
              <input
                type="date"
                required
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F5] border-2 border-stone-200 focus:border-[#8B1E1E] focus:outline-none text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-stone-800 uppercase mb-1.5">
                Số lượng khách: *
              </label>
              <input
                type="number"
                required
                min={1}
                max={5000}
                value={totalVisitorsInput}
                onChange={(e) => {
                  const val = Math.max(1, parseInt(e.target.value) || 1);
                  setTotalVisitorsInput(val);
                  setAdultsCount(val);
                  setStudentsCount(0);
                  setTeachersCount(0);
                }}
                placeholder="VD: 45"
                className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F5] border-2 border-stone-200 focus:border-[#8B1E1E] focus:outline-none text-sm font-extrabold text-[#8B1E1E]"
              />
            </div>
          </div>

          {/* 2. Phương tiện: □ Xe khách □ Ô tô □ Xe máy □ Khác */}
          <div className="space-y-2.5 bg-[#FAF8F5] p-5 rounded-2xl border-2 border-[#D4AF37]/60">
            <label className="block text-xs font-extrabold uppercase text-stone-800">
              Phương tiện: *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TRANSPORT_OPTIONS.map((opt) => {
                const IconComp = opt.icon;
                const isSelected = transportationType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTransportationType(opt.id)}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-gradient-to-br from-[#8B1E1E] to-[#6E1414] text-white border-[#D4AF37] shadow-md"
                        : "bg-white text-stone-800 border-stone-200 hover:border-[#D4AF37]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-extrabold">
                        {isSelected ? "☑" : "□"} {opt.labelVi}
                      </span>
                      <IconComp
                        className={`w-4 h-4 ${
                          isSelected ? "text-[#D4AF37]" : "text-[#8B1E1E]"
                        }`}
                      />
                    </div>
                    <div
                      className={`text-[10px] mt-0.5 line-clamp-1 ${
                        isSelected ? "text-amber-100/90" : "text-stone-500"
                      }`}
                    >
                      {opt.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Khung giờ & Phân bổ chi tiết (Tùy chọn) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-stone-700 uppercase mb-1.5">
                Khung giờ đón đoàn
              </label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F5] border-2 border-stone-200 focus:border-[#8B1E1E] focus:outline-none text-sm font-bold"
              >
                <option value="07:30 - 09:30">07:30 - 09:30 (Sáng sớm)</option>
                <option value="08:30 - 10:30">08:30 - 10:30 (Giờ chính sáng)</option>
                <option value="09:30 - 11:30">09:30 - 11:30 (Cuối buổi sáng)</option>
                <option value="14:00 - 16:00">14:00 - 16:00 (Đầu giờ chiều)</option>
                <option value="15:00 - 17:00">15:00 - 17:00 (Cuối buổi chiều)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-stone-700 uppercase mb-1.5">
                Email nhận xác nhận (Tùy chọn)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="VD: doanthamquan@edu.vn"
                className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F5] border-2 border-stone-200 focus:border-[#8B1E1E] focus:outline-none text-sm font-semibold"
              />
            </div>
          </div>

          {/* 5. Hỗ trợ trải nghiệm */}
          <div className="space-y-2.5">
            <label className="block text-xs font-extrabold uppercase text-stone-700">
              Dịch vụ hỗ trợ tại di tích
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {SPECIAL_REQ_OPTIONS.map((req) => {
                const IconComp = req.icon;
                const checked = specialRequirements.includes(req.id);
                return (
                  <div
                    key={req.id}
                    onClick={() => toggleRequirement(req.id)}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-2.5 ${
                      checked
                        ? "bg-amber-50/90 border-[#8B1E1E]"
                        : "bg-[#FAF8F5] border-stone-200"
                    }`}
                  >
                    <IconComp className="w-4 h-4 text-[#8B1E1E] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-extrabold text-stone-900">{req.labelVi}</div>
                      <div className="text-[10px] text-stone-500 mt-0.5">{req.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#8B1E1E] via-[#A52424] to-[#7A1818] hover:brightness-110 text-white font-extrabold text-sm sm:text-base border-2 border-[#D4AF37] shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-[#D4AF37]" />
                <span>Đang tạo mã đoàn tham quan...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5 text-[#D4AF37]" />
                <span>Đăng Ký & Nhận Mã Đoàn Tham Quan Ngay</span>
              </>
            )}
          </button>
        </form>

        {/* RIGHT 5 COLS: TRA CỨU TRẠNG THÁI ĐOÀN (CHỜ DUYỆT / ĐÃ DUYỆT / HOÀN THÀNH) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border-2 border-[#D4AF37] shadow-xl p-6 space-y-5">
          <div className="space-y-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#8B1E1E]">
              TRẠNG THÁI ĐOÀN ĐĂNG KÝ
            </span>
            <h3 className="text-xl font-extrabold font-cinzel text-stone-900">
              Tra Cứu Mã Đoàn Tham Quan
            </h3>
          </div>

          {/* Search & Status Pills */}
          <div className="space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm mã đoàn (ML-2026-...), tên, đơn vị..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-stone-300 text-xs font-semibold focus:border-[#8B1E1E] focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: "ALL", label: `Tất cả (${registrations.length})` },
                  {
                    id: "Pending",
                    label: `Chờ duyệt (${registrations.filter((r) => r.status === "Pending").length})`
                  },
                  {
                    id: "Approved",
                    label: `Đã duyệt (${registrations.filter((r) => r.status === "Approved").length})`
                  },
                  {
                    id: "Completed",
                    label: `Hoàn thành (${registrations.filter((r) => r.status === "Completed").length})`
                  }
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold border transition-all cursor-pointer ${
                    statusFilter === tab.id
                      ? "bg-[#8B1E1E] text-white border-[#D4AF37]"
                      : "bg-stone-100 text-stone-600 border-stone-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Booking Cards List */}
          <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
            {filteredRegistrations.map((reg) => (
              <div
                key={reg.bookingId}
                className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200/90 hover:border-[#D4AF37] transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-[#8B1E1E] text-[#D4AF37] font-mono text-xs font-extrabold">
                    {reg.bookingId}
                  </span>
                  {renderStatusBadge(reg.status)}
                </div>

                <div>
                  <div className="font-extrabold text-sm text-stone-900">{reg.organization}</div>
                  <div className="text-xs text-stone-600 mt-0.5">
                    Trưởng đoàn: <strong>{reg.fullName}</strong> • 📅 {reg.visitDate} (
                    {reg.preferredTime})
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-200/70 text-[11px]">
                  <div className="font-bold text-stone-700">
                    👥 <strong>{reg.totalVisitors} khách</strong> (HS: {reg.studentsCount}, GV:{" "}
                    {reg.teachersCount})
                  </div>
                  <div className="font-bold text-stone-700 text-right">
                    {getTransportLabel(reg.transportationType)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

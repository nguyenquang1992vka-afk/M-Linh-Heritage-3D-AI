import React, { useState } from "react";
import {
  UserAccount,
  CategorizedAnalyticsSummary,
  AnalyticsEventRecord,
  EmailReportRecord,
  EmailReportType,
  VisitorRegistration,
  PlatformAnalyticsState
} from "../types";
import { triggerAdminEmailReport } from "../services/heritageDatabase";
import {
  Mail,
  Send,
  Bell,
  Clock,
  Activity,
  BarChart3,
  TrendingUp,
  Eye,
  Smartphone,
  CheckCircle2
} from "lucide-react";

interface AdminAnalyticsReportingPanelProps {
  userAccounts?: UserAccount[];
  summary: CategorizedAnalyticsSummary | null;
  analyticsEvents: AnalyticsEventRecord[];
  emailReports: EmailReportRecord[];
  visitorRegistrations: VisitorRegistration[];
  platformAnalytics: PlatformAnalyticsState;
  onRefresh: () => Promise<void>;
}

export const AdminAnalyticsReportingPanel: React.FC<AdminAnalyticsReportingPanelProps> = ({
  userAccounts = [],
  summary,
  analyticsEvents,
  emailReports,
  visitorRegistrations,
  platformAnalytics,
  onRefresh
}) => {
  const [sendingType, setSendingType] = useState<EmailReportType | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<EmailReportRecord | null>(
    emailReports[0] || null
  );
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [showSmtpConfig, setShowSmtpConfig] = useState(false);

  const handleTriggerEmail = async (reportType: EmailReportType) => {
    setSendingType(reportType);
    setStatusBanner(null);
    const res = await triggerAdminEmailReport({
      reportType,
      customSmtp:
        smtpHost && smtpUser && smtpPass
          ? { host: smtpHost, port: 587, user: smtpUser, pass: smtpPass }
          : undefined
    });
    setSendingType(null);
    if (res?.report) {
      setSelectedEmail(res.report);
      setStatusBanner(
        `Đã khởi tạo & gửi báo cáo [${res.report.subject}] tới nguyenquang1992vka@gmail.com lúc ${new Date(
          res.report.createdAt
        ).toLocaleTimeString("vi-VN")}`
      );
      await onRefresh();
    }
  };

  const dailyData = platformAnalytics.dailyAccess || [];
  const monthlyData = platformAnalytics.monthlyAccess || [];
  const topLocations = platformAnalytics.popularLocations || [];
  const maxDaily = Math.max(100, ...dailyData.map((d) => d.students + d.teachers + d.visitors));
  const maxMonthly = Math.max(200, ...monthlyData.map((m) => m.students + m.teachers + m.visitors));
  const maxLocViews = Math.max(100, ...topLocations.map((l) => l.totalViews));

  const studentsStat = summary?.students || {
    totalRegistered: platformAnalytics.totalStudents || 1520,
    activeStudents: (platformAnalytics.studentActivities || []).length || 14,
    totalLogins: 168,
    completedLessons: 54,
    avgQuizScore: 86,
    totalXp: 4250,
    totalBadges: 32,
    avgLearningProgressPct: 82
  };

  const teachersStat = summary?.teachers || {
    totalRegistered: platformAnalytics.totalTeachers || 42,
    totalLogins: 64,
    classesManaged: 6,
    lessonsCreated: 18,
    participatingStudents: 210
  };

  const visitorsStat = summary?.visitors || {
    totalVisits: platformAnalytics.totalVisitors || 1980,
    dailyVisits: dailyData[dailyData.length - 1]?.visitors || 145,
    monthlyVisits: monthlyData[monthlyData.length - 1]?.visitors || 1980,
    avgVisitDurationSeconds: platformAnalytics.avgTourDurationSeconds || 920,
    mostViewedLocation:
      topLocations[0]?.name || "Trạm 3: Chính điện thờ Hai Bà Trưng",
    total360Tours: 420,
    totalAiUses: 315,
    totalGroupBookings: visitorRegistrations.length
  };

  const todayStat = summary?.todayActivity || {
    dateLabel: new Date().toLocaleDateString("vi-VN"),
    loginsToday: 38,
    visitsToday: 186,
    aiInteractionsToday: 52,
    completedLessonsToday: 29,
    tours360Today: 64,
    newRegistrationsToday: 5
  };

  const totalAllUsers =
    studentsStat.totalRegistered + teachersStat.totalRegistered + visitorsStat.totalVisits;

  const transportLabelMap: Record<string, string> = {
    bus: "Xe khách",
    car: "Ô tô",
    motorcycle: "Xe máy",
    walking: "Khác"
  };

  return (
    <div className="space-y-8">
      {/* =================================================================== */}
      {/* 1. BANNER ADMIN ANALYTICS DASHBOARD & HOẠT ĐỘNG HÔM NAY             */}
      {/* =================================================================== */}
      <div className="bg-white rounded-3xl border-2 border-[#D4AF37] p-6 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#8B1E1E]">
              AUTOMATIC ANALYTICS REPORTING SYSTEM • MÊ LINH SMART HERITAGE AI
            </span>
            <h2 className="text-xl sm:text-2xl font-cinzel font-extrabold text-[#2C1A1D] mt-0.5">
              ADMIN ANALYTICS DASHBOARD
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full bg-amber-50 border border-[#D4AF37] text-[#8B1E1E] text-xs font-extrabold flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>Email Quản trị: nguyenquang1992vka@gmail.com</span>
            </span>
            <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Báo cáo Ngày tự động: 18:00</span>
            </span>
          </div>
        </div>

        {/* TỔNG NGƯỜI DÙNG & HOẠT ĐỘNG HÔM NAY (THEO ĐÚNG MẪU YÊU CẦU) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Khối 1: Tổng người dùng */}
          <div className="p-5 rounded-2xl bg-[#FAF8F5] border-2 border-[#8B1E1E]/25 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#8B1E1E]">
                TỔNG NGƯỜI DÙNG HỆ THỐNG
              </span>
              <span className="text-lg font-cinzel font-extrabold text-[#2C1A1D]">
                {totalAllUsers.toLocaleString("vi-VN")} người dùng
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="bg-white p-3.5 rounded-xl border border-stone-200">
                <div className="text-[11px] font-bold text-stone-500">Học sinh:</div>
                <div className="text-xl font-extrabold text-[#8B1E1E] mt-0.5 tabular-nums">
                  {studentsStat.totalRegistered.toLocaleString("vi-VN")}
                </div>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-stone-200">
                <div className="text-[11px] font-bold text-stone-500">Giáo viên:</div>
                <div className="text-xl font-extrabold text-[#2F6F68] mt-0.5 tabular-nums">
                  {teachersStat.totalRegistered.toLocaleString("vi-VN")}
                </div>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-stone-200">
                <div className="text-[11px] font-bold text-stone-500">Du khách:</div>
                <div className="text-xl font-extrabold text-[#9A3412] mt-0.5 tabular-nums">
                  {visitorsStat.totalVisits.toLocaleString("vi-VN")}
                </div>
              </div>
            </div>
          </div>

          {/* Khối 2: Hoạt động hôm nay */}
          <div className="p-5 rounded-2xl bg-[#FAF8F5] border-2 border-[#D4AF37]/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#8B1E1E]">
                HOẠT ĐỘNG HÔM NAY ({todayStat.dateLabel})
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold">
                Thời gian thực
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="bg-white p-3.5 rounded-xl border border-stone-200">
                <div className="text-[11px] font-bold text-stone-500">Lượt đăng nhập:</div>
                <div className="text-xl font-extrabold text-[#8B1E1E] mt-0.5 tabular-nums">
                  {todayStat.loginsToday}
                </div>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-stone-200">
                <div className="text-[11px] font-bold text-stone-500">Lượt tham quan:</div>
                <div className="text-xl font-extrabold text-[#9A3412] mt-0.5 tabular-nums">
                  {todayStat.visitsToday}
                </div>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-stone-200">
                <div className="text-[11px] font-bold text-stone-500">Lượt tương tác AI:</div>
                <div className="text-xl font-extrabold text-[#2F6F68] mt-0.5 tabular-nums">
                  {todayStat.aiInteractionsToday}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. PHÂN LOẠI THỐNG KÊ TỰ ĐỘNG (A. HỌC SINH • B. GIÁO VIÊN • C. DU KHÁCH) */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* A. HỌC SINH */}
        <div className="bg-white rounded-3xl border-2 border-[#8B1E1E] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <h3 className="font-cinzel font-extrabold text-base text-[#8B1E1E]">
              A. THỐNG KÊ HỌC SINH
            </h3>
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-rose-50 text-[#8B1E1E]">
              👨‍🎓 Student Portal
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-stone-200">
              <div className="text-stone-500 font-bold">Tổng HS đăng ký</div>
              <div className="text-base font-extrabold text-stone-900 mt-0.5">
                {studentsStat.totalRegistered.toLocaleString("vi-VN")}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-stone-200">
              <div className="text-stone-500 font-bold">HS đang hoạt động</div>
              <div className="text-base font-extrabold text-emerald-700 mt-0.5">
                {studentsStat.activeStudents}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-stone-200">
              <div className="text-stone-500 font-bold">Số lần đăng nhập</div>
              <div className="text-base font-extrabold text-stone-900 mt-0.5">
                {studentsStat.totalLogins} lượt
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-stone-200">
              <div className="text-stone-500 font-bold">Bài học hoàn thành</div>
              <div className="text-base font-extrabold text-[#8B1E1E] mt-0.5">
                {studentsStat.completedLessons} bài
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-stone-200">
              <div className="text-stone-500 font-bold">Điểm Quiz TB</div>
              <div className="text-base font-extrabold text-[#2F6F68] mt-0.5">
                {studentsStat.avgQuizScore}/100
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-stone-200">
              <div className="text-stone-500 font-bold">Tổng Điểm XP</div>
              <div className="text-base font-extrabold text-amber-700 mt-0.5">
                {studentsStat.totalXp.toLocaleString("vi-VN")} XP
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-stone-200">
              <div className="text-stone-500 font-bold">Huy hiệu đạt được</div>
              <div className="text-base font-extrabold text-[#8B1E1E] mt-0.5">
                🏅 {studentsStat.totalBadges}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-stone-200">
              <div className="text-stone-500 font-bold">Tiến trình học tập</div>
              <div className="text-base font-extrabold text-emerald-700 mt-0.5">
                {studentsStat.avgLearningProgressPct}%
              </div>
            </div>
          </div>
        </div>

        {/* B. GIÁO VIÊN */}
        <div className="bg-white rounded-3xl border-2 border-[#2F6F68] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <h3 className="font-cinzel font-extrabold text-base text-[#2F6F68]">
              B. THỐNG KÊ GIÁO VIÊN
            </h3>
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-teal-50 text-[#2F6F68]">
              👩‍🏫 Teacher Portal
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-stone-200">
              <div className="text-stone-500 font-bold">Số GV đăng ký</div>
              <div className="text-base font-extrabold text-stone-900 mt-0.5">
                {teachersStat.totalRegistered} giáo viên
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-stone-200">
              <div className="text-stone-500 font-bold">Số lần đăng nhập</div>
              <div className="text-base font-extrabold text-[#2F6F68] mt-0.5">
                {teachersStat.totalLogins} lượt
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-stone-200">
              <div className="text-stone-500 font-bold">Số lớp quản lý</div>
              <div className="text-base font-extrabold text-stone-900 mt-0.5">
                {teachersStat.classesManaged} lớp học
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-stone-200">
              <div className="text-stone-500 font-bold">Số bài học tạo</div>
              <div className="text-base font-extrabold text-[#8B1E1E] mt-0.5">
                {teachersStat.lessonsCreated} bài giảng
              </div>
            </div>
            <div className="col-span-2 p-3.5 rounded-xl bg-teal-50/70 border border-[#2F6F68]/30 flex items-center justify-between">
              <span className="font-extrabold text-[#2F6F68]">Tổng số học sinh tham gia lớp:</span>
              <span className="text-lg font-extrabold text-[#2C1A1D]">
                {teachersStat.participatingStudents} học sinh
              </span>
            </div>
          </div>
        </div>

        {/* C. DU KHÁCH */}
        <div className="bg-white rounded-3xl border-2 border-[#9A3412] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <h3 className="font-cinzel font-extrabold text-base text-[#9A3412]">
              C. THỐNG KÊ DU KHÁCH
            </h3>
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-amber-50 text-[#9A3412]">
              🌏 Visitor Portal
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-stone-200">
              <div className="text-stone-500 font-bold">Tổng khách tham quan</div>
              <div className="text-base font-extrabold text-stone-900 mt-0.5">
                {visitorsStat.totalVisits.toLocaleString("vi-VN")}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-stone-200">
              <div className="text-stone-500 font-bold">Theo ngày / tháng</div>
              <div className="text-base font-extrabold text-[#9A3412] mt-0.5">
                {visitorsStat.dailyVisits} / {visitorsStat.monthlyVisits}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-stone-200">
              <div className="text-stone-500 font-bold">TG tham quan TB</div>
              <div className="text-base font-extrabold text-stone-900 mt-0.5">
                {Math.round(visitorsStat.avgVisitDurationSeconds / 60)} phút
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-stone-200">
              <div className="text-stone-500 font-bold">Tham quan 360° & AI</div>
              <div className="text-base font-extrabold text-[#2F6F68] mt-0.5">
                {visitorsStat.total360Tours} • {visitorsStat.totalAiUses} AI
              </div>
            </div>
            <div className="col-span-2 p-3 rounded-xl bg-[#FAF8F5] border border-stone-200">
              <div className="text-stone-500 font-bold">Khu vực xem nhiều nhất:</div>
              <div className="font-extrabold text-[#8B1E1E] mt-0.5 truncate">
                {visitorsStat.mostViewedLocation}
              </div>
            </div>
            <div className="col-span-2 p-3 rounded-xl bg-amber-50/70 border border-[#D4AF37] flex items-center justify-between">
              <span className="font-extrabold text-[#9A3412]">Số đoàn đăng ký tham quan:</span>
              <span className="text-base font-extrabold text-[#8B1E1E]">
                {visitorsStat.totalGroupBookings} đoàn
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. BẢNG LƯU ĐOÀN KHÁCH ĐĂNG KÝ THAM QUAN (ĐẦY ĐỦ 6 TRƯỜNG YÊU CẦU)   */}
      {/* =================================================================== */}
      <div className="bg-white rounded-3xl border-2 border-[#D4AF37] p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#9A3412]">
              THỐNG KÊ ĐOÀN KHÁCH LƯU HỆ THỐNG
            </span>
            <h3 className="font-cinzel font-extrabold text-lg text-[#2C1A1D]">
              Danh Sách Đoàn Khách Đăng Ký Tham Quan ({visitorRegistrations.length} Đoàn)
            </h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] border-b-2 border-[#D4AF37] text-[#8B1E1E] font-extrabold uppercase">
                <th className="py-3 px-3">Tên đoàn</th>
                <th className="py-3 px-3">Người phụ trách</th>
                <th className="py-3 px-3">Số điện thoại</th>
                <th className="py-3 px-3">Ngày tham quan</th>
                <th className="py-3 px-3">Số lượng khách</th>
                <th className="py-3 px-3">Phương tiện</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {visitorRegistrations.slice(0, 8).map((reg) => (
                <tr key={reg.bookingId} className="hover:bg-amber-50/40">
                  <td className="py-3 px-3 font-extrabold text-stone-900">{reg.organization}</td>
                  <td className="py-3 px-3 font-semibold text-stone-800">{reg.fullName}</td>
                  <td className="py-3 px-3 font-mono font-bold text-stone-700">{reg.phoneNumber}</td>
                  <td className="py-3 px-3 font-bold text-[#8B1E1E]">
                    {reg.visitDate} ({reg.preferredTime})
                  </td>
                  <td className="py-3 px-3 font-extrabold text-emerald-800">
                    {reg.totalVisitors} khách
                  </td>
                  <td className="py-3 px-3 font-bold text-stone-700">
                    □ {transportLabelMap[reg.transportationType] || reg.transportationType}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. BỐN BIỂU ĐỒ QUẢN TRỊ: THEO NGÀY • THEO THÁNG • PHỔ BIẾN • XU HƯỚNG */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Biểu đồ 1: Người dùng theo ngày */}
        <div className="bg-white rounded-3xl border-2 border-[#D4AF37] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-cinzel font-extrabold text-base text-[#2C1A1D] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#8B1E1E]" />
              <span>Biểu Đồ 1: Người Dùng Theo Ngày</span>
            </h3>
            <span className="text-[11px] font-bold text-stone-500">7 ngày gần nhất</span>
          </div>
          <div className="grid grid-cols-7 gap-2.5 items-end h-48 pt-4 px-2 border-b border-stone-200">
            {dailyData.map((d, idx) => {
              const total = d.students + d.teachers + d.visitors;
              const hPct = Math.max(16, Math.round((total / maxDaily) * 100));
              return (
                <div key={idx} className="flex flex-col items-center justify-end h-full gap-1.5">
                  <span className="text-[10px] font-extrabold text-stone-700">{total}</span>
                  <div
                    className="w-full max-w-[38px] rounded-t-xl bg-gradient-to-t from-[#8B1E1E] via-[#9A3412] to-[#D4AF37]"
                    style={{ height: `${hPct}%` }}
                  />
                  <span className="text-[11px] font-bold text-stone-600 pb-1">{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Biểu đồ 2: Người dùng theo tháng */}
        <div className="bg-white rounded-3xl border-2 border-[#D4AF37] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-cinzel font-extrabold text-base text-[#2C1A1D] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#2F6F68]" />
              <span>Biểu Đồ 2: Người Dùng Theo Tháng</span>
            </h3>
            <span className="text-[11px] font-bold text-stone-500">Thống kê 6 tháng</span>
          </div>
          <div className="grid grid-cols-6 gap-3 items-end h-48 pt-4 px-2 border-b border-stone-200">
            {monthlyData.map((m, idx) => {
              const total = m.students + m.teachers + m.visitors;
              const hPct = Math.max(18, Math.round((total / maxMonthly) * 100));
              return (
                <div key={idx} className="flex flex-col items-center justify-end h-full gap-1.5">
                  <span className="text-[10px] font-extrabold text-stone-700">{total}</span>
                  <div
                    className="w-full max-w-[42px] rounded-t-xl bg-gradient-to-t from-[#2F6F68] to-emerald-400"
                    style={{ height: `${hPct}%` }}
                  />
                  <span className="text-[11px] font-bold text-stone-600 pb-1">{m.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Biểu đồ 3: Nội dung phổ biến */}
        <div className="bg-white rounded-3xl border-2 border-[#D4AF37] p-6 shadow-xl space-y-4">
          <h3 className="font-cinzel font-extrabold text-base text-[#2C1A1D] flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#8B1E1E]" />
            <span>Biểu Đồ 3: Nội Dung Phổ Biến Nhất</span>
          </h3>
          <div className="space-y-2.5">
            {topLocations.map((loc) => {
              const pct = Math.max(12, Math.round((loc.totalViews / maxLocViews) * 100));
              return (
                <div key={loc.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-stone-800 truncate pr-2">{loc.name}</span>
                    <span className="text-[#8B1E1E] font-extrabold">{loc.totalViews} lượt</span>
                  </div>
                  <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#8B1E1E] to-[#D4AF37] rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Biểu đồ 4: Xu hướng truy cập & Thiết bị */}
        <div className="bg-white rounded-3xl border-2 border-[#D4AF37] p-6 shadow-xl space-y-4">
          <h3 className="font-cinzel font-extrabold text-base text-[#2C1A1D] flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[#9A3412]" />
            <span>Biểu Đồ 4: Xu Hướng Truy Cập & Thiết Bị</span>
          </h3>
          <div className="space-y-3 text-xs">
            {[
              {
                label: "Thiết bị Di động (Mobile) – Quét QR tại Đền",
                val: platformAnalytics.deviceBreakdown?.Mobile || 58,
                color: "bg-[#8B1E1E]"
              },
              {
                label: "Máy tính (Desktop / Phòng Tin học Nhà trường)",
                val: platformAnalytics.deviceBreakdown?.Desktop || 32,
                color: "bg-[#2F6F68]"
              },
              {
                label: "Máy tính bảng (Tablet / Bảng tương tác thông minh)",
                val: platformAnalytics.deviceBreakdown?.Tablet || 10,
                color: "bg-[#D4AF37]"
              }
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-stone-700">{item.label}</span>
                  <span className="font-extrabold text-stone-900">{item.val} phiên</span>
                </div>
                <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full`}
                    style={{ width: `${Math.min(100, Math.max(15, item.val))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 5. TRUNG TÂM GỬI EMAIL BÁO CÁO TỰ ĐỘNG (nguyenquang1992vka@gmail.com) */}
      {/* =================================================================== */}
      <div className="bg-gradient-to-br from-[#1A0D0E] via-[#2C1416] to-[#1A0D0E] text-white rounded-3xl border-2 border-[#D4AF37] p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/15 pb-4">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#D4AF37]">
              EMAIL API / SMTP NOTIFICATION & SCHEDULED REPORT SERVICE
            </span>
            <h3 className="text-xl sm:text-2xl font-cinzel font-extrabold text-white mt-1">
              Hệ Thống Gửi Email Báo Cáo Tự Động • nguyenquang1992vka@gmail.com
            </h3>
            <p className="text-xs text-amber-100/80 mt-1">
              Tự động gửi Thông báo Thời gian thực khi có đăng ký/đặt lịch mới, Báo cáo Ngày lúc 18:00 và Báo cáo Tuần.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleTriggerEmail("REALTIME_ALERT")}
              disabled={sendingType !== null}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-[#D4AF37] text-xs font-extrabold flex items-center gap-2 cursor-pointer"
            >
              <Bell className="w-4 h-4 text-[#D4AF37]" />
              <span>
                {sendingType === "REALTIME_ALERT" ? "Đang gửi..." : "Gửi Thông Báo Thời Gian Thực"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTriggerEmail("DAILY_REPORT")}
              disabled={sendingType !== null}
              className="px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-[#1A0D0E] text-xs font-extrabold flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>
                {sendingType === "DAILY_REPORT" ? "Đang gửi..." : "Gửi Báo Cáo Ngày (18:00)"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTriggerEmail("WEEKLY_REPORT")}
              disabled={sendingType !== null}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-400 text-xs font-extrabold flex items-center gap-2 cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>
                {sendingType === "WEEKLY_REPORT" ? "Đang gửi..." : "Gửi Báo Cáo Hàng Tuần"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowSmtpConfig((prev) => !prev)}
              className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/20 text-xs font-bold cursor-pointer"
            >
              ⚙️ Cấu hình SMTP
            </button>
          </div>
        </div>

        {statusBanner && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-400 text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusBanner}</span>
          </div>
        )}

        {showSmtpConfig && (
          <div className="p-4 rounded-2xl bg-white/10 border border-[#D4AF37]/40 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <input
              type="text"
              value={smtpHost}
              onChange={(e) => setSmtpHost(e.target.value)}
              placeholder="SMTP Host (VD: smtp.gmail.com)"
              className="px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-white"
            />
            <input
              type="text"
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
              placeholder="SMTP Email User"
              className="px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-white"
            />
            <input
              type="password"
              value={smtpPass}
              onChange={(e) => setSmtpPass(e.target.value)}
              placeholder="SMTP App Password"
              className="px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-white"
            />
          </div>
        )}

        {/* Hộp thư báo cáo đã gửi & Xem trước nội dung */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-2.5 max-h-80 overflow-y-auto pr-1">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#D4AF37]">
              Nhật ký Email đã gửi ({emailReports.length})
            </div>
            {emailReports.map((rep) => (
              <div
                key={rep.reportId}
                onClick={() => setSelectedEmail(rep)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  selectedEmail?.reportId === rep.reportId
                    ? "bg-[#D4AF37]/20 border-[#D4AF37]"
                    : "bg-white/5 border-white/15 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-amber-200 font-bold">
                  <span>{rep.reportType}</span>
                  <span>{new Date(rep.createdAt).toLocaleString("vi-VN")}</span>
                </div>
                <div className="font-extrabold text-xs text-white mt-1 truncate">{rep.subject}</div>
                <div className="text-[11px] text-emerald-300 mt-0.5">
                  Tới: {rep.recipientEmail} • Trạng thái: Đã gửi ({rep.deliveryStatus})
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-7 bg-black/40 rounded-2xl border border-[#D4AF37]/50 p-5 space-y-3">
            {selectedEmail ? (
              <>
                <div className="border-b border-white/15 pb-3">
                  <div className="text-[11px] text-[#D4AF37] font-extrabold uppercase">
                    Người nhận: {selectedEmail.recipientEmail}
                  </div>
                  <h4 className="text-sm sm:text-base font-extrabold text-white mt-0.5">
                    Tiêu đề: {selectedEmail.subject}
                  </h4>
                </div>
                <pre className="text-xs text-amber-50/95 whitespace-pre-wrap font-mono leading-relaxed max-h-56 overflow-y-auto">
                  {selectedEmail.bodyText}
                </pre>
              </>
            ) : (
              <div className="text-xs text-stone-400 py-12 text-center">
                Chọn một email báo cáo bên trái để xem chi tiết nội dung.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 6. NHẬT KÝ THEO DÕI NGƯỜI DÙNG TỰ ĐỘNG (EVENT TRACKING LOG)          */}
      {/* =================================================================== */}
      <div className="bg-white rounded-3xl border-2 border-[#D4AF37] p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8B1E1E]">
              1. THEO DÕI NGƯỜI DÙNG TỰ ĐỘNG (REAL-TIME EVENT TRACKING)
            </span>
            <h3 className="font-cinzel font-extrabold text-lg text-[#2C1A1D]">
              Nhật Ký Hoạt Động Người Dùng Thực Tế ({analyticsEvents.length} Sự Kiện)
            </h3>
          </div>
          <Activity className="w-5 h-5 text-emerald-600" />
        </div>

        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] border-b-2 border-[#D4AF37] text-[#8B1E1E] font-extrabold uppercase">
                <th className="py-2.5 px-3">Thời gian truy cập</th>
                <th className="py-2.5 px-3">Loại người dùng</th>
                <th className="py-2.5 px-3">Tài khoản</th>
                <th className="py-2.5 px-3">Thiết bị truy cập</th>
                <th className="py-2.5 px-3">Nội dung đã sử dụng</th>
                <th className="py-2.5 px-3">Thời lượng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {analyticsEvents.slice(0, 25).map((evt) => (
                <tr key={evt.eventId} className="hover:bg-amber-50/40">
                  <td className="py-2.5 px-3 font-mono text-stone-600">
                    {new Date(evt.createdAt).toLocaleString("vi-VN")}
                  </td>
                  <td className="py-2.5 px-3 font-extrabold text-[#8B1E1E] uppercase">
                    {evt.userRole}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-stone-900">
                    {evt.userName} ({evt.userEmail})
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-stone-700">{evt.deviceType}</td>
                  <td className="py-2.5 px-3 font-semibold text-stone-800">{evt.contentUsed}</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-700">
                    {evt.durationSeconds} giây
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 7. 4 BẢNG CƠ SỞ DỮ LIỆU TRỰC TIẾP (USERS, STUDENT_PROGRESS, VISITOR_BOOKING, ACTIVITY_LOG) */}
      {/* =================================================================== */}
      <div className="bg-white rounded-3xl border-2 border-[#D4AF37] p-6 shadow-xl space-y-6">
        <div className="border-b border-stone-200 pb-4">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8B1E1E]">
            FIRESTORE & REALTIME DATABASE SCHEMAS
          </span>
          <h3 className="font-cinzel font-extrabold text-xl text-[#2C1A1D]">
            4 Bảng Cơ Sở Dữ Liệu Thực Tế: USERS • STUDENT_PROGRESS • VISITOR_BOOKING • ACTIVITY_LOG
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* TABLE 1: USERS */}
          <div className="rounded-2xl border-2 border-stone-200 p-4 bg-[#FAF8F5] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-[#8B1E1E] uppercase">
                1. Bảng USERS ({userAccounts.length} bản ghi)
              </h4>
              <span className="text-[10px] font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                id • họ tên • email • vai trò • trường • lớp
              </span>
            </div>
            <div className="overflow-x-auto max-h-56 overflow-y-auto bg-white rounded-xl border border-stone-200">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-stone-100 border-b border-stone-200 text-stone-700 font-extrabold uppercase">
                    <th className="py-2 px-2.5">ID</th>
                    <th className="py-2 px-2.5">Họ tên</th>
                    <th className="py-2 px-2.5">Email</th>
                    <th className="py-2 px-2.5">Vai trò</th>
                    <th className="py-2 px-2.5">Trường</th>
                    <th className="py-2 px-2.5">Lớp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {userAccounts.map((u) => (
                    <tr key={u.id} className="hover:bg-amber-50/40">
                      <td className="py-2 px-2.5 font-mono text-stone-500">{u.id}</td>
                      <td className="py-2 px-2.5 font-bold text-stone-900">{u.name}</td>
                      <td className="py-2 px-2.5 text-stone-700">{u.email}</td>
                      <td className="py-2 px-2.5 font-extrabold uppercase text-[#8B1E1E]">
                        {u.role}
                      </td>
                      <td className="py-2 px-2.5 text-stone-700">{u.school || "Mê Linh"}</td>
                      <td className="py-2 px-2.5 font-semibold text-stone-800">
                        {u.grade || u.subject || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABLE 2: STUDENT_PROGRESS */}
          <div className="rounded-2xl border-2 border-stone-200 p-4 bg-[#FAF8F5] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-[#8B1E1E] uppercase">
                2. Bảng STUDENT_PROGRESS ({(platformAnalytics.studentActivities || []).length} bản ghi)
              </h4>
              <span className="text-[10px] font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                bài đã học • điểm quiz • XP • huy hiệu • % hoàn thành
              </span>
            </div>
            <div className="overflow-x-auto max-h-56 overflow-y-auto bg-white rounded-xl border border-stone-200">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-stone-100 border-b border-stone-200 text-stone-700 font-extrabold uppercase">
                    <th className="py-2 px-2.5">Học sinh</th>
                    <th className="py-2 px-2.5">Bài đã học</th>
                    <th className="py-2 px-2.5">Điểm Quiz</th>
                    <th className="py-2 px-2.5">XP</th>
                    <th className="py-2 px-2.5">Huy hiệu</th>
                    <th className="py-2 px-2.5">% Hoàn thành</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {(platformAnalytics.studentActivities || []).map((st) => (
                    <tr key={st.id} className="hover:bg-amber-50/40">
                      <td className="py-2 px-2.5 font-bold text-stone-900">
                        {st.name} ({st.className})
                      </td>
                      <td className="py-2 px-2.5 font-bold text-[#8B1E1E]">
                        {st.lessonsViewed}/{st.totalLessons || 6} bài
                      </td>
                      <td className="py-2 px-2.5 font-bold text-emerald-700">{st.quizAvgScore}</td>
                      <td className="py-2 px-2.5 font-bold text-amber-800">
                        {(st as any).xp || st.lessonsViewed * 120} XP
                      </td>
                      <td className="py-2 px-2.5 font-bold text-purple-800">
                        {(st as any).badgesEarned || Math.max(1, Math.floor(st.lessonsViewed / 2))}
                      </td>
                      <td className="py-2 px-2.5 font-extrabold text-emerald-800">
                        {st.learningProgressPct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABLE 3: VISITOR_BOOKING */}
          <div className="rounded-2xl border-2 border-stone-200 p-4 bg-[#FAF8F5] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-[#9A3412] uppercase">
                3. Bảng VISITOR_BOOKING ({visitorRegistrations.length} đoàn)
              </h4>
              <span className="text-[10px] font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                tên đoàn • người phụ trách • sđt • ngày tham quan • số lượng khách • phương tiện • trạng thái duyệt
              </span>
            </div>
            <div className="overflow-x-auto max-h-56 overflow-y-auto bg-white rounded-xl border border-stone-200">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-stone-100 border-b border-stone-200 text-stone-700 font-extrabold uppercase">
                    <th className="py-2 px-2.5">Tên đoàn</th>
                    <th className="py-2 px-2.5">Người phụ trách</th>
                    <th className="py-2 px-2.5">Số điện thoại</th>
                    <th className="py-2 px-2.5">Ngày tham quan</th>
                    <th className="py-2 px-2.5">Số lượng khách</th>
                    <th className="py-2 px-2.5">Phương tiện</th>
                    <th className="py-2 px-2.5">Trạng thái duyệt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {visitorRegistrations.map((bk) => (
                    <tr key={bk.bookingId} className="hover:bg-amber-50/40">
                      <td className="py-2 px-2.5 font-bold text-stone-900">{bk.organization}</td>
                      <td className="py-2 px-2.5 font-semibold text-stone-800">{bk.fullName}</td>
                      <td className="py-2 px-2.5 font-mono text-stone-700">{bk.phoneNumber}</td>
                      <td className="py-2 px-2.5 font-semibold text-stone-700">{bk.visitDate}</td>
                      <td className="py-2 px-2.5 font-extrabold text-[#9A3412]">
                        {bk.totalVisitors} khách
                      </td>
                      <td className="py-2 px-2.5 text-stone-700 font-semibold">
                        {transportLabelMap[bk.transportationType] || bk.transportationType}
                      </td>
                      <td className="py-2 px-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            bk.status === "Approved"
                              ? "bg-emerald-100 text-emerald-800"
                              : bk.status === "Pending"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-stone-200 text-stone-700"
                          }`}
                        >
                          {bk.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABLE 4: ACTIVITY_LOG */}
          <div className="rounded-2xl border-2 border-stone-200 p-4 bg-[#FAF8F5] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-emerald-900 uppercase">
                4. Bảng ACTIVITY_LOG ({analyticsEvents.length} bản ghi)
              </h4>
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                ai truy cập • thời gian • hoạt động gì
              </span>
            </div>
            <div className="overflow-x-auto max-h-56 overflow-y-auto bg-white rounded-xl border border-stone-200">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-stone-100 border-b border-stone-200 text-stone-700 font-extrabold uppercase">
                    <th className="py-2 px-2.5">Ai truy cập</th>
                    <th className="py-2 px-2.5">Thời gian</th>
                    <th className="py-2 px-2.5">Hoạt động gì</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {analyticsEvents.slice(0, 30).map((evt) => (
                    <tr key={`act-${evt.eventId}`} className="hover:bg-amber-50/40">
                      <td className="py-2 px-2.5 font-bold text-stone-900">
                        {evt.userName} ({evt.userRole})
                      </td>
                      <td className="py-2 px-2.5 font-mono text-stone-600">
                        {new Date(evt.createdAt).toLocaleString("vi-VN")}
                      </td>
                      <td className="py-2 px-2.5 font-semibold text-stone-800">
                        {evt.contentUsed}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

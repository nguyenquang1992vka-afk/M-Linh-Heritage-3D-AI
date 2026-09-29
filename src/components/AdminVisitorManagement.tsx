import React, { useState } from "react";
import {
  VisitorRegistration,
  VisitorRegistrationStatus,
  TransportationType
} from "../types";
import {
  updateVisitorRegistrationInDb,
  deleteVisitorRegistrationInDb,
  fetchVisitorRegistrationsFromDb,
  generateVisitorRegistrationAiReport
} from "../services/heritageDatabase";
import { TIME_SLOTS } from "./VisitorRegistrationPortal";
import {
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Bus,
  Car,
  Bike,
  Footprints,
  Sparkles,
  RefreshCw,
  Search,
  Download,
  Trash2,
  Edit3,
  Save,
  Bot,
  Mic2,
  GraduationCap,
  Ticket
} from "lucide-react";

interface AdminVisitorManagementProps {
  registrations: VisitorRegistration[];
  onUpdateRegistrations: React.Dispatch<React.SetStateAction<VisitorRegistration[]>>;
}

export const AdminVisitorManagement: React.FC<AdminVisitorManagementProps> = ({
  registrations,
  onUpdateRegistrations
}) => {
  const [statusFilter, setStatusFilter] = useState<"ALL" | VisitorRegistrationStatus>("ALL");
  const [transportFilter, setTransportFilter] = useState<"ALL" | TransportationType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Schedule Editing State
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editGuide, setEditGuide] = useState("");
  const [editAdminNote, setEditAdminNote] = useState("");

  // AI Report State
  const [aiReport, setAiReport] = useState<string>(
    `1. Tổng quan lưu lượng khách & Cơ cấu đoàn đăng ký
• Hệ thống Cổng Du khách ghi nhận các đoàn trường học và du khách đăng ký tham quan trực tuyến tại Di tích Quốc gia đặc biệt Đền Hai Bà Trưng (thôn Hạ Lôi, xã Mê Linh, TP. Hà Nội).
• Cơ cấu khách tham quan chủ yếu là các đoàn Học sinh và Giáo viên học tập lịch sử địa phương kết hợp dâng hương tưởng niệm tại Tam tòa chính điện.

2. Phân tích phương tiện giao thông & Điều phối đón tiếp
• Phương tiện Xe buýt / Xe hợp đồng (Bus) chiếm tỷ trọng lớn nhất về lưu lượng khách, cần bố trí bãi đỗ xe tập trung phía ngoài trục đê sông Hồng trước Nghi môn ngoại.
• Các đoàn Ô tô con (Car), Xe máy (Motorcycle) và Đi bộ (Walking) từ thôn Hạ Lôi được phân luồng trực tiếp vào khu vực đón tiếp.

3. Đánh giá nhu cầu Thuyết minh viên, AI Tour & Hỗ trợ đoàn trường học
• Đa số các đoàn đăng ký kết hợp cả 3 dịch vụ: Thuyết minh viên tại điểm (Tour Guide), Trải nghiệm Cô Mê Linh AI (AI Tour) và Hỗ trợ đoàn học sinh (Student Group Support).

4. Khuyến nghị điều phối lịch trình tham quan 6 trạm di tích
• Phân ca đón đoàn cách nhau tối thiểu 30 phút tại Trạm 1 (Nghi môn ngoại - Sân Ngũ Phúc) và Trạm 2 (Nhà khách đón tiếp) để đảm bảo không gian trang nghiêm.`
  );
  const [aiReportTime, setAiReportTime] = useState<string>("Báo cáo mặc định");
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Real-time Statistics Calculation from Database Records
  const totalBookings = registrations.length;
  const approvedCount = registrations.filter((r) => r.status === "Approved").length;
  const pendingCount = registrations.filter((r) => r.status === "Pending").length;
  const rejectedCount = registrations.filter((r) => r.status === "Rejected").length;

  const totalVisitors = registrations.reduce((sum, r) => sum + (r.totalVisitors || 0), 0);
  const totalAdults = registrations.reduce((sum, r) => sum + (r.adultsCount || 0), 0);
  const totalStudents = registrations.reduce((sum, r) => sum + (r.studentsCount || 0), 0);
  const totalTeachers = registrations.reduce((sum, r) => sum + (r.teachersCount || 0), 0);

  // Transportation Analysis
  const transportStats = (["bus", "car", "motorcycle", "walking"] as TransportationType[]).map(
    (type) => {
      const matching = registrations.filter((r) => r.transportationType === type);
      const bookingsCount = matching.length;
      const passengersCount = matching.reduce((sum, r) => sum + (r.totalVisitors || 0), 0);
      const pctOfVisitors =
        totalVisitors > 0 ? Math.round((passengersCount / totalVisitors) * 100) : 0;
      return {
        type,
        bookingsCount,
        passengersCount,
        pctOfVisitors
      };
    }
  );

  // Special Requirements Analysis
  const tourGuideReqCount = registrations.filter((r) =>
    r.specialRequirements?.includes("tour_guide")
  ).length;
  const aiTourReqCount = registrations.filter((r) =>
    r.specialRequirements?.includes("ai_tour")
  ).length;
  const studentSupportReqCount = registrations.filter((r) =>
    r.specialRequirements?.includes("student_group_support")
  ).length;

  const handleSyncDb = async () => {
    setIsSyncing(true);
    const list = await fetchVisitorRegistrationsFromDb();
    if (list.length > 0) {
      onUpdateRegistrations(list);
      showToast("Đã đồng bộ dữ liệu Đăng ký Tham quan mới nhất từ Cơ sở dữ liệu!");
    }
    setIsSyncing(false);
  };

  const handleStatusChange = async (
    bookingId: string,
    newStatus: VisitorRegistrationStatus
  ) => {
    const res = await updateVisitorRegistrationInDb(bookingId, { status: newStatus });
    if (res.visitorRegistrations) {
      onUpdateRegistrations(res.visitorRegistrations);
      showToast(
        `Đã cập nhật trạng thái đoàn ${bookingId} sang ${
          newStatus === "Approved"
            ? "Approved (Đã phê duyệt)"
            : newStatus === "Rejected"
            ? "Rejected (Từ chối)"
            : "Pending (Chờ duyệt)"
        }!`
      );
    }
  };

  const startEditSchedule = (reg: VisitorRegistration) => {
    setEditingBookingId(reg.bookingId);
    setEditDate(reg.visitDate);
    setEditTime(reg.preferredTime);
    setEditGuide(reg.assignedGuide || "TMV. Nguyễn Thu Hà (Nhà khách đón tiếp)");
    setEditAdminNote(reg.adminNote || "");
  };

  const handleSaveSchedule = async (bookingId: string) => {
    const res = await updateVisitorRegistrationInDb(bookingId, {
      visitDate: editDate,
      preferredTime: editTime,
      assignedGuide: editGuide,
      adminNote: editAdminNote
    });
    if (res.visitorRegistrations) {
      onUpdateRegistrations(res.visitorRegistrations);
      setEditingBookingId(null);
      showToast(`Đã lưu lịch trình và phân công đón tiếp cho mã ${bookingId}!`);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    const updated = await deleteVisitorRegistrationInDb(bookingId);
    if (updated) {
      onUpdateRegistrations(updated);
      showToast(`Đã xóa bản ghi đăng ký ${bookingId} khỏi Cơ sở dữ liệu.`);
    }
  };

  const handleGenerateAiReport = async () => {
    setIsGeneratingAi(true);
    const res = await generateVisitorRegistrationAiReport();
    setIsGeneratingAi(false);
    if (res?.report) {
      setAiReport(res.report);
      setAiReportTime(`Cập nhật lúc ${res.generatedAt}`);
      showToast("Đã phân tích dữ liệu thực tế và khởi tạo Báo cáo AI thành công!");
    }
  };

  const handleDownloadReport = () => {
    const content = `BÁO CÁO QUẢN LÝ ĐĂNG KÝ THAM QUAN TRỰC TUYẾN - ĐỀN HAI BÀ TRƯNG MÊ LINH\nThời gian xuất: ${new Date().toLocaleString("vi-VN")}\nTổng số đoàn: ${totalBookings} (Approved: ${approvedCount}, Pending: ${pendingCount}, Rejected: ${rejectedCount})\nTổng số khách: ${totalVisitors} người (Học sinh: ${totalStudents}, Giáo viên: ${totalTeachers}, Người lớn: ${totalAdults})\n\n${aiReport}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Bao_Cao_Khach_Tham_Quan_Den_Hai_Ba_Trung_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredList = registrations.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (transportFilter !== "ALL" && r.transportationType !== transportFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.bookingId.toLowerCase().includes(q) ||
        r.fullName.toLowerCase().includes(q) ||
        r.phoneNumber.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.organization.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getTransportMeta = (type: TransportationType) => {
    switch (type) {
      case "bus":
        return { label: "Xe khách", icon: Bus, color: "text-[#8B1E1E]" };
      case "car":
        return { label: "Ô tô", icon: Car, color: "text-[#2F6F68]" };
      case "motorcycle":
        return { label: "Xe máy", icon: Bike, color: "text-amber-700" };
      case "walking":
        return { label: "Khác", icon: Footprints, color: "text-emerald-700" };
    }
  };

  return (
    <div className="space-y-8">
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950 border-2 border-[#D4AF37] text-amber-100 text-xs sm:text-sm font-bold flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <span className="text-[11px] text-[#D4AF37] font-mono">REAL DB SYNCED</span>
        </div>
      )}

      {/* 1. EXECUTIVE VISITOR REGISTRATION KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#8B1E1E] to-[#5E1111] text-white p-5 rounded-3xl border-2 border-[#D4AF37] shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-200">
              TỔNG KHÁCH ĐĂNG KÝ (TOTAL VISITORS)
            </span>
            <Users className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div className="text-3xl font-extrabold font-cinzel text-[#F8F4E8]">
            {totalVisitors.toLocaleString("vi-VN")} <span className="text-sm font-sans">khách</span>
          </div>
          <div className="text-xs text-amber-100/90 flex flex-wrap gap-2 pt-1 border-t border-white/15">
            <span>🎓 HS: <strong>{totalStudents}</strong></span>
            <span>•</span>
            <span>👩‍🏫 GV: <strong>{totalTeachers}</strong></span>
            <span>•</span>
            <span>🧑 NL: <strong>{totalAdults}</strong></span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border-2 border-[#D4AF37] shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8B1E1E]">
              TỔNG ĐOÀN ĐẶT LỊCH (BOOKINGS)
            </span>
            <Ticket className="w-5 h-5 text-[#8B1E1E]" />
          </div>
          <div className="text-3xl font-extrabold font-cinzel text-[#2C1A1D]">
            {totalBookings} <span className="text-sm font-sans text-stone-500">đoàn</span>
          </div>
          <div className="text-xs font-bold flex flex-wrap gap-2 pt-1 border-t border-stone-100">
            <span className="text-emerald-700">✓ Duyệt: {approvedCount}</span>
            <span>•</span>
            <span className="text-amber-700">⏳ Chờ: {pendingCount}</span>
            <span>•</span>
            <span className="text-rose-700">✕ Từ chối: {rejectedCount}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border-2 border-[#D4AF37] shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2F6F68]">
              YÊU CẦU THUYẾT MINH & AI TOUR
            </span>
            <Bot className="w-5 h-5 text-[#2F6F68]" />
          </div>
          <div className="text-3xl font-extrabold font-cinzel text-[#2C1A1D]">
            {tourGuideReqCount + aiTourReqCount}{" "}
            <span className="text-sm font-sans text-stone-500">lượt yêu cầu</span>
          </div>
          <div className="text-xs text-stone-600 font-semibold flex flex-wrap gap-2 pt-1 border-t border-stone-100">
            <span>🎙️ TMV: <strong>{tourGuideReqCount}</strong></span>
            <span>•</span>
            <span>🤖 AI Tour: <strong>{aiTourReqCount}</strong></span>
            <span>•</span>
            <span>🎓 Hỗ trợ HS: <strong>{studentSupportReqCount}</strong></span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#122624] to-[#1D3B38] text-white p-5 rounded-3xl border-2 border-[#D4AF37] shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-200">
              ĐỒNG BỘ CƠ SỞ DỮ LIỆU THỰC
            </span>
            <RefreshCw className={`w-5 h-5 text-[#D4AF37] ${isSyncing ? "animate-spin" : ""}`} />
          </div>
          <div className="text-lg font-extrabold font-cinzel text-[#D4AF37]">
            Real Database Active
          </div>
          <button
            type="button"
            onClick={handleSyncDb}
            className="w-full py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E5BE38] text-[#1A0D0E] font-extrabold text-xs shadow transition-all cursor-pointer"
          >
            Làm mới dữ liệu từ Server DB
          </button>
        </div>
      </div>

      {/* 2. TRANSPORTATION ANALYSIS & SPECIAL REQUIREMENTS BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Transportation Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border-2 border-[#D4AF37] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#8B1E1E] font-cinzel">
                PHÂN TÍCH PHƯƠNG TIỆN GIAO THÔNG (TRANSPORTATION ANALYTICS)
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#2C1A1D] font-cinzel mt-0.5">
                Cơ Cấu Phương Tiện Di Chuyển Của Các Đoàn Tham Quan
              </h3>
            </div>
            <Bus className="w-6 h-6 text-[#8B1E1E]" />
          </div>

          <div className="space-y-3.5">
            {transportStats.map((item) => {
              const meta = getTransportMeta(item.type);
              const Icon = meta.icon;
              return (
                <div
                  key={item.type}
                  className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#D4AF37]/40 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-extrabold text-[#2C1A1D]">
                      <Icon className={`w-4 h-4 ${meta.color}`} />
                      <span>{meta.label}</span>
                    </div>
                    <div className="font-bold text-stone-700">
                      <span className="text-[#8B1E1E] font-extrabold">{item.bookingsCount} đoàn</span>{" "}
                      ({item.passengersCount} khách • {item.pctOfVisitors}%)
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#8B1E1E] to-[#D4AF37] rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(item.bookingsCount > 0 ? 8 : 0, item.pctOfVisitors)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Special Requirements & Group Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border-2 border-[#D4AF37] p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-stone-100 pb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#2F6F68] font-cinzel">
                CƠ CẤU ĐỐI TƯỢNG & DỊCH VỤ HỖ TRỢ
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#2C1A1D] font-cinzel mt-0.5">
                Thống Kê Chi Tiết Thành Viên & Yêu Cầu
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="bg-[#FAF6EE] p-3 rounded-2xl border border-[#D4AF37]/50">
                <div className="text-xl font-extrabold text-[#8B1E1E] font-cinzel">
                  {totalStudents}
                </div>
                <div className="text-[11px] font-bold text-stone-600 mt-0.5">Học sinh</div>
              </div>
              <div className="bg-[#FAF6EE] p-3 rounded-2xl border border-[#D4AF37]/50">
                <div className="text-xl font-extrabold text-[#2F6F68] font-cinzel">
                  {totalTeachers}
                </div>
                <div className="text-[11px] font-bold text-stone-600 mt-0.5">Giáo viên</div>
              </div>
              <div className="bg-[#FAF6EE] p-3 rounded-2xl border border-[#D4AF37]/50">
                <div className="text-xl font-extrabold text-[#2C1A1D] font-cinzel">
                  {totalAdults}
                </div>
                <div className="text-[11px] font-bold text-stone-600 mt-0.5">Người lớn</div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="font-bold text-[#2C1A1D] flex items-center gap-2">
                  <Mic2 className="w-4 h-4 text-[#8B1E1E]" />
                  Thuyết minh viên tại điểm (Tour Guide)
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#8B1E1E] text-white font-extrabold">
                  {tourGuideReqCount} đoàn
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="font-bold text-[#2C1A1D] flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#2F6F68]" />
                  Thuyết minh số Cô Mê Linh AI (AI Tour)
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#2F6F68] text-white font-extrabold">
                  {aiTourReqCount} đoàn
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="font-bold text-[#2C1A1D] flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-amber-700" />
                  Hỗ trợ đoàn Học sinh (Student Group Support)
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-700 text-white font-extrabold">
                  {studentSupportReqCount} đoàn
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. VISITOR REGISTRATIONS MANAGEMENT TABLE & SCHEDULE MANAGER */}
      <section className="bg-white rounded-3xl border-2 border-[#D4AF37] p-6 sm:p-8 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#8B1E1E] font-cinzel">
              QUẢN LÝ HỒ SƠ ĐĂNG KÝ & ĐIỀU PHỐI LỊCH TRÌNH ĐÓN ĐOÀN
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#2C1A1D] font-cinzel mt-0.5">
              Phê Duyệt Đăng Ký (Approve / Reject) & Quản Lý Lịch Tham Quan
            </h3>
          </div>

          {/* Filter & Search Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {(["ALL", "Pending", "Approved", "Completed", "Rejected"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                  statusFilter === st
                    ? "bg-[#8B1E1E] text-white border-[#D4AF37]"
                    : "bg-stone-100 text-stone-700 border-stone-200 hover:bg-amber-50"
                }`}
              >
                {st === "ALL"
                  ? `Tất cả (${totalBookings})`
                  : st === "Pending"
                  ? `Chờ duyệt (${pendingCount})`
                  : st === "Approved"
                  ? `Đã duyệt (${approvedCount})`
                  : st === "Completed"
                  ? `Hoàn thành (${registrations.filter((r) => r.status === "Completed").length})`
                  : `Từ chối (${rejectedCount})`}
              </button>
            ))}

            <select
              value={transportFilter}
              onChange={(e) => setTransportFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-bold text-[#2C1A1D] bg-white"
            >
              <option value="ALL">Mọi phương tiện</option>
              <option value="bus">🚌 Xe khách</option>
              <option value="car">🚗 Ô tô</option>
              <option value="motorcycle">🛵 Xe máy</option>
              <option value="walking">🚶 Khác</option>
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm mã đoàn, tên..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-stone-300 text-xs font-medium"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredList.map((reg) => {
            const isEditing = editingBookingId === reg.bookingId;
            const transportMeta = getTransportMeta(reg.transportationType);
            const TransportIcon = transportMeta.icon;

            return (
              <div
                key={reg.bookingId}
                className="rounded-2xl border-2 border-[#D4AF37]/50 bg-[#FAF8F5] p-5 space-y-4 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-xl bg-[#2C1A1D] text-[#D4AF37] font-mono font-extrabold text-xs border border-[#D4AF37]">
                        {reg.bookingId}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-extrabold border flex items-center gap-1 ${
                          reg.status === "Approved"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-400"
                            : reg.status === "Completed"
                            ? "bg-blue-100 text-blue-800 border-blue-400"
                            : reg.status === "Rejected"
                            ? "bg-rose-100 text-rose-800 border-rose-400"
                            : "bg-amber-100 text-amber-900 border-amber-400"
                        }`}
                      >
                        {reg.status === "Approved" && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {reg.status === "Completed" && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {reg.status === "Rejected" && <XCircle className="w-3.5 h-3.5" />}
                        {reg.status === "Pending" && <AlertCircle className="w-3.5 h-3.5" />}
                        <span>
                          {reg.status === "Approved"
                            ? "Đã duyệt"
                            : reg.status === "Completed"
                            ? "Hoàn thành"
                            : reg.status === "Rejected"
                            ? "Từ chối"
                            : "Chờ duyệt"}
                        </span>
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-white border border-stone-200 text-xs font-bold text-[#2C1A1D] flex items-center gap-1">
                        <TransportIcon className={`w-3.5 h-3.5 ${transportMeta.color}`} />
                        <span>{transportMeta.label}</span>
                      </span>
                    </div>

                    <h4 className="font-cinzel font-extrabold text-base sm:text-lg text-[#2C1A1D] pt-1">
                      Tên đoàn: {reg.organization}
                    </h4>
                    <div className="text-xs text-stone-600 flex flex-wrap items-center gap-3">
                      <span>
                        👤 Người phụ trách: <strong className="text-[#2C1A1D]">{reg.fullName}</strong>
                      </span>
                      <span>📞 Số điện thoại: <strong>{reg.phoneNumber}</strong></span>
                      <span>✉️ {reg.email}</span>
                    </div>
                  </div>

                  {/* Admin Action Buttons: Approve, Complete, Reject, Edit Schedule, Delete */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(reg.bookingId, "Approved")}
                      disabled={reg.status === "Approved"}
                      className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-45 text-white font-extrabold text-xs flex items-center gap-1.5 shadow cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Đã duyệt</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusChange(reg.bookingId, "Completed")}
                      disabled={reg.status === "Completed"}
                      className="px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:opacity-45 text-white font-extrabold text-xs flex items-center gap-1.5 shadow cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Hoàn thành</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusChange(reg.bookingId, "Rejected")}
                      disabled={reg.status === "Rejected"}
                      className="px-3.5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 disabled:opacity-45 text-white font-extrabold text-xs flex items-center gap-1.5 shadow cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Từ chối</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        isEditing ? setEditingBookingId(null) : startEditSchedule(reg)
                      }
                      className="px-3.5 py-2 rounded-xl bg-[#2C1A1D] hover:bg-[#3E2723] text-[#D4AF37] border border-[#D4AF37] font-extrabold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isEditing ? "Đóng lịch" : "Điều phối lịch"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteBooking(reg.bookingId)}
                      className="p-2 rounded-xl bg-stone-200 hover:bg-rose-100 text-stone-600 hover:text-rose-700 transition-colors cursor-pointer"
                      title="Xóa đăng ký"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details Strip */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-stone-200 text-xs">
                  <div>
                    <span className="text-stone-400 font-bold uppercase text-[10px] block">
                      Lịch trình đăng ký
                    </span>
                    <span className="font-extrabold text-[#8B1E1E]">
                      📅 {reg.visitDate} • ⏰ {reg.preferredTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 font-bold uppercase text-[10px] block">
                      Số lượng thành viên ({reg.totalVisitors} người)
                    </span>
                    <span className="font-bold text-[#2C1A1D]">
                      Học sinh: {reg.studentsCount} | Giáo viên: {reg.teachersCount} | Người lớn:{" "}
                      {reg.adultsCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 font-bold uppercase text-[10px] block">
                      Yêu cầu hỗ trợ đặc biệt
                    </span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {reg.specialRequirements.length > 0 ? (
                        reg.specialRequirements.map((req) => (
                          <span
                            key={req}
                            className="px-2 py-0.5 rounded bg-amber-100 text-[#8B1E1E] font-bold text-[10px]"
                          >
                            {req === "tour_guide"
                              ? "Tour Guide"
                              : req === "ai_tour"
                              ? "AI Tour"
                              : "Student Group Support"}
                          </span>
                        ))
                      ) : (
                        <span className="text-stone-400">Không có</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-stone-400 font-bold uppercase text-[10px] block">
                      Cán bộ / Thuyết minh phụ trách
                    </span>
                    <span className="font-bold text-[#2F6F68]">
                      {reg.assignedGuide || "Chờ phân công"}
                    </span>
                  </div>
                </div>

                {reg.notes && (
                  <div className="text-xs text-stone-600 italic bg-amber-50/60 px-3.5 py-2 rounded-xl border border-amber-200/70">
                    📝 <strong>Ghi chú của đoàn:</strong> “{reg.notes}”
                  </div>
                )}

                {/* Schedule Management Editor Drawer */}
                {isEditing && (
                  <div className="bg-gradient-to-r from-[#1A0D0E] to-[#2C1416] text-white p-4 rounded-2xl border-2 border-[#D4AF37] space-y-3">
                    <div className="text-xs font-extrabold uppercase text-[#D4AF37]">
                      ⚙️ Điều Phối Lịch Tham Quan & Phân Công Đón Tiếp ({reg.bookingId})
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="space-y-1">
                        <label className="text-amber-200 font-bold">Ngày tham quan:</label>
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white text-[#1A0D0E] font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-amber-200 font-bold">Khung giờ đón đoàn:</label>
                        <select
                          value={editTime}
                          onChange={(e) => setEditTime(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white text-[#1A0D0E] font-bold"
                        >
                          {TIME_SLOTS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-amber-200 font-bold">Phân công Thuyết minh viên:</label>
                        <input
                          type="text"
                          value={editGuide}
                          onChange={(e) => setEditGuide(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white text-[#1A0D0E] font-bold"
                        />
                      </div>
                    </div>
                    <div className="space-y-1 text-xs">
                      <label className="text-amber-200 font-bold">
                        Phản hồi / Hướng dẫn của Ban Quản lý Di tích:
                      </label>
                      <input
                        type="text"
                        value={editAdminNote}
                        onChange={(e) => setEditAdminNote(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white text-[#1A0D0E] font-medium"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingBookingId(null)}
                        className="px-3.5 py-2 rounded-xl bg-white/10 text-white text-xs font-bold cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveSchedule(reg.bookingId)}
                        className="px-4 py-2 rounded-xl bg-[#D4AF37] text-[#1A0D0E] font-extrabold text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Lưu Lịch Trình Vào Database</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. AI VISITOR LOGISTICS & RECEPTION REPORT GENERATOR */}
      <section className="bg-gradient-to-br from-[#1A0D0E] via-[#2C1416] to-[#122624] rounded-3xl border-2 border-[#D4AF37] p-6 sm:p-8 text-white shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#D4AF37]/30 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B1E1E] border border-[#D4AF37] text-amber-200 text-xs font-extrabold uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>AI VISITOR MANAGEMENT REPORT • GEMINI 3.8 FLASH</span>
            </div>
            <h3 className="font-cinzel font-extrabold text-xl sm:text-2xl text-amber-100">
              Báo Cáo AI Phân Tích Đoàn Tham Quan & Điều Phối Đón Tiếp
            </h3>
            <p className="text-xs text-stone-300">
              Tổng hợp tự động từ dữ liệu đặt lịch thực tế ({totalBookings} đoàn • {totalVisitors}{" "}
              khách) và đề xuất phương án phân luồng phương tiện, thuyết minh viên tại 6 trạm di tích.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleGenerateAiReport}
              disabled={isGeneratingAi}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#E5BE38] hover:brightness-105 text-[#1A0D0E] font-extrabold text-xs shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Sparkles className={`w-4 h-4 text-[#8B1E1E] ${isGeneratingAi ? "animate-spin" : ""}`} />
              <span>
                {isGeneratingAi ? "AI đang phân tích dữ liệu..." : "Khởi tạo Báo cáo AI Mới"}
              </span>
            </button>

            <button
              type="button"
              onClick={handleDownloadReport}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-amber-100 border border-[#D4AF37]/50 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#D4AF37]" />
              <span>Tải Báo cáo (.TXT)</span>
            </button>
          </div>
        </div>

        <div className="bg-black/40 rounded-2xl border border-[#D4AF37]/40 p-5 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-[#D4AF37] font-bold border-b border-white/10 pb-2">
            <span>📊 PHÂN TÍCH ĐIỀU HÀNH ĐÓN TIẾP TỪ CÔ MÊ LINH AI</span>
            <span className="font-mono">{aiReportTime}</span>
          </div>
          <div className="text-xs sm:text-sm text-amber-50/95 whitespace-pre-line leading-relaxed pt-1">
            {aiReport}
          </div>
        </div>
      </section>
    </div>
  );
};

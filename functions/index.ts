/**
 * FIREBASE CLOUD FUNCTIONS - MÊ LINH SMART HERITAGE AI
 * Automatic Analytics Reporting & Scheduled Email Notification Engine
 * Admin Recipient Email: nguyenquang1992vka@gmail.com
 */

export const ADMIN_REPORT_EMAIL = "nguyenquang1992vka@gmail.com";

export interface RealtimeAlertPayload {
  userName: string;
  userRole: string;
  timestamp: string;
  activity: string;
  details?: string;
}

export interface DailyReportPayload {
  dateLabel: string;
  totalAccess: number;
  studentCount: number;
  teacherCount: number;
  visitorCount: number;
  completedLessonsCount: number;
  totalVisitsToday: number;
  totalAiInteractionsToday: number;
}

export interface WeeklyReportPayload {
  weekRangeLabel: string;
  userGrowthSummary: string;
  topPopularContent: string;
  studentActivitySummary: string;
  teacherActivitySummary: string;
  visitorTrendsSummary: string;
}

/**
 * Format A. THÔNG BÁO THỜI GIAN THỰC (Real-time Alert Email Template)
 */
export function buildRealtimeAlertEmailTemplate(payload: RealtimeAlertPayload): {
  subject: string;
  bodyText: string;
  bodyHtml: string;
} {
  const subject = `[THÔNG BÁO THỜI GIAN THỰC] ${payload.activity} - MÊ LINH SMART HERITAGE AI`;
  const bodyText = [
    "THÔNG BÁO HOẠT ĐỘNG THỜI GIAN THỰC - MÊ LINH SMART HERITAGE AI",
    "================================================================",
    `Tên người dùng: ${payload.userName}`,
    `Vai trò: ${payload.userRole}`,
    `Thời gian: ${payload.timestamp}`,
    `Hoạt động: ${payload.activity}`,
    payload.details ? `Chi tiết: ${payload.details}` : "",
    "================================================================",
    `Email quản trị nhận báo cáo: ${ADMIN_REPORT_EMAIL}`
  ]
    .filter(Boolean)
    .join("\n");

  const bodyHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; border: 2px solid #C9A227; border-radius: 14px; overflow: hidden; background: #FAF8F5;">
      <div style="background: #8B1E1E; color: #FFFFFF; padding: 18px 24px; border-bottom: 2px solid #C9A227;">
        <div style="font-size: 11px; color: #FDE68A; font-weight: bold; text-transform: uppercase;">MÊ LINH SMART HERITAGE AI • REAL-TIME ALERT</div>
        <h2 style="margin: 6px 0 0; font-size: 18px;">Thông Báo Hoạt Động Thời Gian Thực</h2>
      </div>
      <div style="padding: 22px 24px; color: #1C1917; font-size: 14px; line-height: 1.7;">
        <p style="margin: 6px 0;"><strong>Tên người dùng:</strong> ${payload.userName}</p>
        <p style="margin: 6px 0;"><strong>Vai trò:</strong> ${payload.userRole}</p>
        <p style="margin: 6px 0;"><strong>Thời gian:</strong> ${payload.timestamp}</p>
        <p style="margin: 6px 0;"><strong>Hoạt động:</strong> ${payload.activity}</p>
        ${payload.details ? `<p style="margin: 10px 0 0; padding: 10px 14px; background: #FFFBEB; border-left: 4px solid #C9A227;">${payload.details}</p>` : ""}
      </div>
      <div style="background: #F5F5F4; padding: 12px 24px; font-size: 12px; color: #57534E; border-top: 1px solid #E7E5E4;">
        Hệ thống Báo cáo Thống kê Tự động • Gửi tới: <strong>${ADMIN_REPORT_EMAIL}</strong>
      </div>
    </div>
  `;

  return { subject, bodyText, bodyHtml };
}

/**
 * Format B. BÁO CÁO HÀNG NGÀY (18:00 Daily Report Email Template)
 */
export function buildDailyReportEmailTemplate(payload: DailyReportPayload): {
  subject: string;
  bodyText: string;
  bodyHtml: string;
} {
  const subject = "BÁO CÁO NGÀY - MÊ LINH SMART HERITAGE AI";
  const bodyText = [
    "BÁO CÁO NGÀY - MÊ LINH SMART HERITAGE AI",
    `Ngày báo cáo: ${payload.dateLabel} (Lập lịch tự động 18:00)`,
    "================================================================",
    `Tổng lượt truy cập: ${payload.totalAccess}`,
    `Học sinh: ${payload.studentCount}`,
    `Giáo viên: ${payload.teacherCount}`,
    `Du khách: ${payload.visitorCount}`,
    `Số bài học hoàn thành: ${payload.completedLessonsCount}`,
    `Số lượt tham quan: ${payload.totalVisitsToday}`,
    `Số lượt tương tác AI: ${payload.totalAiInteractionsToday}`,
    "================================================================",
    `Email quản trị nhận báo cáo: ${ADMIN_REPORT_EMAIL}`
  ].join("\n");

  const bodyHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; border: 2px solid #C9A227; border-radius: 14px; overflow: hidden; background: #FAF8F5;">
      <div style="background: #1A0D0E; color: #FFFFFF; padding: 18px 24px; border-bottom: 2px solid #C9A227;">
        <div style="font-size: 11px; color: #D4AF37; font-weight: bold; text-transform: uppercase;">SCHEDULED DAILY REPORT • 18:00 HẰNG NGÀY</div>
        <h2 style="margin: 6px 0 0; font-size: 18px;">BÁO CÁO NGÀY - MÊ LINH SMART HERITAGE AI</h2>
      </div>
      <div style="padding: 22px 24px; color: #1C1917; font-size: 14px; line-height: 1.8;">
        <p style="margin: 4px 0;"><strong>Tổng lượt truy cập:</strong> ${payload.totalAccess}</p>
        <p style="margin: 4px 0;"><strong>Học sinh:</strong> ${payload.studentCount}</p>
        <p style="margin: 4px 0;"><strong>Giáo viên:</strong> ${payload.teacherCount}</p>
        <p style="margin: 4px 0;"><strong>Du khách:</strong> ${payload.visitorCount}</p>
        <p style="margin: 4px 0;"><strong>Số bài học hoàn thành:</strong> ${payload.completedLessonsCount}</p>
        <p style="margin: 4px 0;"><strong>Số lượt tham quan:</strong> ${payload.totalVisitsToday}</p>
        <p style="margin: 4px 0;"><strong>Số lượt tương tác AI:</strong> ${payload.totalAiInteractionsToday}</p>
      </div>
      <div style="background: #F5F5F4; padding: 12px 24px; font-size: 12px; color: #57534E; border-top: 1px solid #E7E5E4;">
        Báo cáo định kỳ 18:00 • Gửi tới: <strong>${ADMIN_REPORT_EMAIL}</strong>
      </div>
    </div>
  `;

  return { subject, bodyText, bodyHtml };
}

/**
 * Format C. BÁO CÁO HÀNG TUẦN (Weekly Analytics Report Email Template)
 */
export function buildWeeklyReportEmailTemplate(payload: WeeklyReportPayload): {
  subject: string;
  bodyText: string;
  bodyHtml: string;
} {
  const subject = `BÁO CÁO HÀNG TUẦN (${payload.weekRangeLabel}) - MÊ LINH SMART HERITAGE AI`;
  const bodyText = [
    `BÁO CÁO HÀNG TUẦN - MÊ LINH SMART HERITAGE AI (${payload.weekRangeLabel})`,
    "================================================================",
    `- Tăng trưởng người dùng: ${payload.userGrowthSummary}`,
    `- Nội dung được quan tâm nhất: ${payload.topPopularContent}`,
    `- Hoạt động học sinh: ${payload.studentActivitySummary}`,
    `- Hoạt động giáo viên: ${payload.teacherActivitySummary}`,
    `- Xu hướng khách tham quan: ${payload.visitorTrendsSummary}`,
    "================================================================",
    `Email quản trị nhận báo cáo: ${ADMIN_REPORT_EMAIL}`
  ].join("\n");

  const bodyHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; border: 2px solid #C9A227; border-radius: 14px; overflow: hidden; background: #FAF8F5;">
      <div style="background: #2F6F68; color: #FFFFFF; padding: 18px 24px; border-bottom: 2px solid #C9A227;">
        <div style="font-size: 11px; color: #FDE68A; font-weight: bold; text-transform: uppercase;">WEEKLY ANALYTICS REPORT • MÊ LINH SMART HERITAGE AI</div>
        <h2 style="margin: 6px 0 0; font-size: 18px;">BÁO CÁO THỐNG KÊ HÀNG TUẦN (${payload.weekRangeLabel})</h2>
      </div>
      <div style="padding: 22px 24px; color: #1C1917; font-size: 14px; line-height: 1.8;">
        <p style="margin: 8px 0;"><strong>• Tăng trưởng người dùng:</strong> ${payload.userGrowthSummary}</p>
        <p style="margin: 8px 0;"><strong>• Nội dung được quan tâm nhất:</strong> ${payload.topPopularContent}</p>
        <p style="margin: 8px 0;"><strong>• Hoạt động học sinh:</strong> ${payload.studentActivitySummary}</p>
        <p style="margin: 8px 0;"><strong>• Hoạt động giáo viên:</strong> ${payload.teacherActivitySummary}</p>
        <p style="margin: 8px 0;"><strong>• Xu hướng khách tham quan:</strong> ${payload.visitorTrendsSummary}</p>
      </div>
      <div style="background: #F5F5F4; padding: 12px 24px; font-size: 12px; color: #57534E; border-top: 1px solid #E7E5E4;">
        Báo cáo tổng hợp hàng tuần • Gửi tới: <strong>${ADMIN_REPORT_EMAIL}</strong>
      </div>
    </div>
  `;

  return { subject, bodyText, bodyHtml };
}

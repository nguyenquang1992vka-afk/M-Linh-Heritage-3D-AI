import { DeviceType, PlatformAnalyticsState } from "../types";

export function detectClientDeviceType(): DeviceType {
  if (typeof window === "undefined") return "Desktop";
  const ua = navigator.userAgent.toLowerCase();
  const width = window.innerWidth;
  if (
    /ipad|tablet|playbook|silk/i.test(ua) ||
    (width >= 768 && width <= 1024 && /mobi|android/i.test(ua))
  ) {
    return "Tablet";
  }
  if (/mobile|iphone|ipod|android.*mobile|windows phone/i.test(ua) || width < 768) {
    return "Mobile";
  }
  return "Desktop";
}

export function generateAnonymousSessionId(): string {
  const randomHex = Math.random().toString(16).substring(2, 6).toUpperCase();
  return `ANON-ML-${randomHex}`;
}

const DAILY_SERIES = [
  { label: "21/09", visitors: 430, students: 215, teachers: 28 },
  { label: "22/09", visitors: 465, students: 228, teachers: 31 },
  { label: "23/09", visitors: 490, students: 240, teachers: 29 },
  { label: "24/09", visitors: 535, students: 252, teachers: 33 },
  { label: "25/09", visitors: 590, students: 268, teachers: 35 },
  { label: "26/09", visitors: 720, students: 245, teachers: 32 },
  { label: "Hôm nay", visitors: 785, students: 284, teachers: 38 }
];

const MONTHLY_SERIES = [
  { label: "Tháng 02", visitors: 3180, students: 960, teachers: 36 },
  { label: "Tháng 03", visitors: 1890, students: 1020, teachers: 35 },
  { label: "Tháng 04", visitors: 1420, students: 1050, teachers: 37 },
  { label: "Tháng 05", visitors: 1280, students: 1100, teachers: 38 },
  { label: "Tháng 06", visitors: 1150, students: 840, teachers: 29 },
  { label: "Tháng 07", visitors: 1210, students: 790, teachers: 31 },
  { label: "Tháng 08", visitors: 1490, students: 980, teachers: 39 },
  { label: "Tháng 09", visitors: 1960, students: 1265, teachers: 42 }
];

export const INITIAL_PLATFORM_ANALYTICS: PlatformAnalyticsState = {
  totalVisitors: 14820,
  totalStudents: 1265,
  totalTeachers: 42,
  avgTourDurationSeconds: 1125,
  deviceBreakdown: {
    Mobile: 8640,
    Desktop: 4410,
    Tablet: 1770
  },
  visitTimeDistribution: [
    { slot: "07:00 - 09:00", visitors: 2180, students: 340 },
    { slot: "09:00 - 11:00", visitors: 3890, students: 480 },
    { slot: "11:00 - 13:00", visitors: 1420, students: 110 },
    { slot: "13:00 - 15:00", visitors: 2640, students: 390 },
    { slot: "15:00 - 17:00", visitors: 3120, students: 420 },
    { slot: "17:00 - 21:00", visitors: 1570, students: 525 }
  ],
  dailyAccess: DAILY_SERIES,
  monthlyAccess: MONTHLY_SERIES,
  dailyAccessStats: DAILY_SERIES,
  monthlyAccessStats: MONTHLY_SERIES,
  popularLocations: [
    {
      id: "chinh-dien",
      poiId: "chinh-dien",
      stationOrder: 3,
      stationCode: "TRẠM 03 • TRUNG TÂM THỜ TỰ",
      name: "Tam tòa chính diện (Đền chính thờ Hai Bà Trưng)",
      title: "Trạm 3: Chính điện thờ Hai Bà Trưng (Tam tòa chính diện)",
      category: "Di vật & Thờ phụng",
      totalViews: 14880,
      visitorViews: 13640,
      studentViews: 1240,
      avgDurationSeconds: 384,
      avgDwellMinutes: 6.4,
      completionRate: 96
    },
    {
      id: "tam-quan",
      poiId: "tam-quan",
      stationOrder: 1,
      stationCode: "TRẠM 01 • KIẾN TRÚC NGHI MÔN",
      name: "Nghi môn ngoại – Cổng Tam Quan & Sân Ngũ Phúc",
      title: "Trạm 1: Nghi môn ngoại – Cổng Tam Quan & Sân Ngũ Phúc",
      category: "Kiến trúc",
      totalViews: 14375,
      visitorViews: 13120,
      studentViews: 1255,
      avgDurationSeconds: 312,
      avgDwellMinutes: 5.2,
      completionRate: 98
    },
    {
      id: "ho-ban-nguyet",
      poiId: "ho-ban-nguyet",
      stationOrder: 6,
      stationCode: "TRẠM 06 • CẢNH QUAN PHONG THỦY",
      name: "6. Hồ Bán Nguyệt - Không gian cảnh quan di tích",
      title: "6. Hồ Bán Nguyệt - Không gian cảnh quan di tích",
      category: "Cảnh quan & Lễ hội",
      totalViews: 12600,
      visitorViews: 11480,
      studentViews: 1120,
      avgDurationSeconds: 288,
      avgDwellMinutes: 4.8,
      completionRate: 89
    },
    {
      id: "den-than-phu",
      poiId: "den-than-phu",
      stationOrder: 4,
      stationCode: "TRẠM 04 • ĐẠO LÝ UỐNG NƯỚC NHỚ NGUỒN",
      name: "Khu thờ Thân phụ, Thân mẫu Hai Bà Trưng & Thi Sách",
      title: "Trạm 4: Khu thờ thân phụ, thân mẫu Hai Bà Trưng & Thi Sách",
      category: "Di vật & Thờ phụng",
      totalViews: 12055,
      visitorViews: 10890,
      studentViews: 1165,
      avgDurationSeconds: 306,
      avgDwellMinutes: 5.1,
      completionRate: 92
    },
    {
      id: "quan-the-le-hoi",
      poiId: "quan-the-le-hoi",
      stationOrder: 5,
      stationCode: "TRẠM 05 • KHU THỜ CÁC TƯỚNG LĨNH",
      name: "5. Khu thờ các tướng lĩnh Hai Bà Trưng",
      title: "5. Khu thờ các tướng lĩnh Hai Bà Trưng",
      category: "Danh nhân",
      totalViews: 11380,
      visitorViews: 10240,
      studentViews: 1140,
      avgDurationSeconds: 330,
      avgDwellMinutes: 5.5,
      completionRate: 90
    },
    {
      id: "nha-khach",
      poiId: "nha-khach",
      stationOrder: 2,
      stationCode: "TRẠM 02 • KHÔNG GIAN ĐÓN TIẾP",
      name: "Nhà khách và không gian đón tiếp – Nghi môn nội",
      title: "Trạm 2: Nhà khách và không gian đón tiếp – Nghi môn nội",
      category: "Kiến trúc",
      totalViews: 10840,
      visitorViews: 9650,
      studentViews: 1190,
      avgDurationSeconds: 234,
      avgDwellMinutes: 3.9,
      completionRate: 94
    }
  ],
  visitorSessions: [
    {
      sessionId: "ANON-ML-9A4F",
      visitTime: "Hôm nay, 09:42",
      visitHour: 9,
      tourDurationSeconds: 1280,
      deviceType: "Mobile",
      viewedLocations: [
        "Trạm 1: Nghi môn ngoại",
        "Trạm 3: Tam tòa chính diện",
        "Trạm 4: Khu thờ thân phụ, thân mẫu",
        "Trạm 6: Hồ Bán Nguyệt"
      ],
      completedTour: true
    },
    {
      sessionId: "ANON-ML-3C82",
      visitTime: "Hôm nay, 09:18",
      visitHour: 9,
      tourDurationSeconds: 1540,
      deviceType: "Desktop",
      viewedLocations: [
        "Trạm 1: Nghi môn ngoại",
        "Trạm 2: Nhà khách",
        "Trạm 3: Tam tòa chính diện",
        "Trạm 4: Khu thờ thân phụ, thân mẫu",
        "Trạm 5: Khu thờ các tướng lĩnh",
        "Trạm 6: Hồ Bán Nguyệt"
      ],
      completedTour: true
    },
    {
      sessionId: "ANON-ML-7E19",
      visitTime: "Hôm nay, 08:55",
      visitHour: 8,
      tourDurationSeconds: 940,
      deviceType: "Tablet",
      viewedLocations: [
        "Trạm 1: Nghi môn ngoại",
        "Trạm 3: Tam tòa chính diện",
        "Trạm 5: Khu thờ các tướng lĩnh"
      ],
      completedTour: false
    },
    {
      sessionId: "ANON-ML-5B04",
      visitTime: "Hôm nay, 08:30",
      visitHour: 8,
      tourDurationSeconds: 1110,
      deviceType: "Mobile",
      viewedLocations: [
        "Trạm 1: Nghi môn ngoại",
        "Trạm 2: Nhà khách",
        "Trạm 3: Tam tòa chính diện",
        "Trạm 6: Hồ Bán Nguyệt"
      ],
      completedTour: true
    }
  ],
  studentActivities: [
    {
      id: "std-001",
      name: "Nguyễn Minh Anh",
      className: "Lớp 4A",
      school: "Trường Tiểu học Văn Khê – Xã Mê Linh, TP. Hà Nội",
      lessonsViewed: 6,
      totalLessons: 6,
      viewedStationNames: ["Trạm 1", "Trạm 2", "Trạm 3", "Trạm 4", "Trạm 5", "Trạm 6"],
      quizzesCompleted: 8,
      quizzesTaken: 8,
      quizAvgScore: 98,
      learningProgressPct: 100,
      learningProgress: 100,
      lastActive: "10 phút trước"
    },
    {
      id: "std-002",
      name: "Trần Quốc Bảo",
      className: "Lớp 4A",
      school: "Trường Tiểu học Văn Khê – Xã Mê Linh, TP. Hà Nội",
      lessonsViewed: 5,
      totalLessons: 6,
      viewedStationNames: ["Trạm 1", "Trạm 2", "Trạm 3", "Trạm 4", "Trạm 5"],
      quizzesCompleted: 6,
      quizzesTaken: 6,
      quizAvgScore: 90,
      learningProgressPct: 85,
      learningProgress: 85,
      lastActive: "25 phút trước"
    },
    {
      id: "std-003",
      name: "Lê Hà Phương",
      className: "Lớp 5A",
      school: "Trường Tiểu học Văn Khê – Xã Mê Linh, TP. Hà Nội",
      lessonsViewed: 6,
      totalLessons: 6,
      viewedStationNames: ["Trạm 1", "Trạm 2", "Trạm 3", "Trạm 4", "Trạm 5", "Trạm 6"],
      quizzesCompleted: 9,
      quizzesTaken: 9,
      quizAvgScore: 96,
      learningProgressPct: 100,
      learningProgress: 100,
      lastActive: "Hôm nay"
    },
    {
      id: "std-004",
      name: "Phạm Tuấn Kiệt",
      className: "Lớp 4B",
      school: "Trường Tiểu học Hạ Lôi – Xã Mê Linh, TP. Hà Nội",
      lessonsViewed: 4,
      totalLessons: 6,
      viewedStationNames: ["Trạm 1", "Trạm 2", "Trạm 3", "Trạm 6"],
      quizzesCompleted: 5,
      quizzesTaken: 5,
      quizAvgScore: 84,
      learningProgressPct: 72,
      learningProgress: 72,
      lastActive: "Hôm nay"
    },
    {
      id: "std-005",
      name: "Đỗ Ngọc Diệp",
      className: "Lớp 5B",
      school: "Trường Tiểu học Văn Khê – Xã Mê Linh, TP. Hà Nội",
      lessonsViewed: 6,
      totalLessons: 6,
      viewedStationNames: ["Trạm 1", "Trạm 2", "Trạm 3", "Trạm 4", "Trạm 5", "Trạm 6"],
      quizzesCompleted: 7,
      quizzesTaken: 7,
      quizAvgScore: 94,
      learningProgressPct: 96,
      learningProgress: 96,
      lastActive: "Hôm qua"
    },
    {
      id: "std-006",
      name: "Vũ Hoàng Nam",
      className: "Lớp 6A",
      school: "Trường THCS Trưng Vương – Xã Mê Linh, TP. Hà Nội",
      lessonsViewed: 5,
      totalLessons: 6,
      viewedStationNames: ["Trạm 1", "Trạm 3", "Trạm 4", "Trạm 5", "Trạm 6"],
      quizzesCompleted: 6,
      quizzesTaken: 6,
      quizAvgScore: 88,
      learningProgressPct: 84,
      learningProgress: 84,
      lastActive: "Hôm qua"
    }
  ],
  teacherActivities: [
    {
      id: "tch-001",
      name: "Cô Nguyễn Thị Lan",
      email: "lan.teacher@melinh.edu.vn",
      school: "Trường Tiểu học Văn Khê – Xã Mê Linh, TP. Hà Nội",
      subject: "Lịch sử & Địa lý (Khối 4)",
      createdLessons: 14,
      aiLessonPlansGenerated: 46,
      lessonTitles: [
        "Chuyên đề 6 Trạm Di tích Quốc gia đặc biệt Đền Hai Bà Trưng",
        "Lịch sử Khởi nghĩa Hai Bà Trưng năm 40 SCN & 4 câu thề",
        "Địa giới hành chính xã Mê Linh mới theo Nghị quyết 1656"
      ],
      studentParticipation: 342,
      participationRate: 98,
      status: "active"
    },
    {
      id: "tch-002",
      name: "Thầy Trần Văn Hùng",
      email: "hung.teacher@melinh.edu.vn",
      school: "Trường Tiểu học Văn Khê – Xã Mê Linh, TP. Hà Nội",
      subject: "Lịch sử & Địa lý (Khối 5)",
      createdLessons: 11,
      aiLessonPlansGenerated: 38,
      lessonTitles: [
        "Nghi thức Rước kiệu Giao quân tại Lễ hội Đền Hai Bà Trưng",
        "Tìm hiểu bảo vật kiệu Bát Cống thế kỷ XVII & 23 đạo sắc phong"
      ],
      studentParticipation: 318,
      participationRate: 95,
      status: "active"
    },
    {
      id: "tch-003",
      name: "Cô Phạm Thu Hương",
      email: "huong.teacher@haloi.edu.vn",
      school: "Trường Tiểu học Hạ Lôi – Xã Mê Linh, TP. Hà Nội",
      subject: "Giáo dục Địa phương & Trải nghiệm",
      createdLessons: 9,
      aiLessonPlansGenerated: 34,
      lessonTitles: [
        "Hành trình di sản thôn Hạ Lôi – Kinh đô Mê Linh cổ",
        "Công đức thân mẫu Man Thiện và Tướng quân Thi Sách"
      ],
      studentParticipation: 295,
      participationRate: 92,
      status: "active"
    },
    {
      id: "tch-004",
      name: "Thầy Lê Minh Đức",
      email: "duc.teacher@trungvuong.edu.vn",
      school: "Trường THCS Trưng Vương – Xã Mê Linh, TP. Hà Nội",
      subject: "Lịch sử & Địa lý THCS",
      createdLessons: 8,
      aiLessonPlansGenerated: 30,
      lessonTitles: [
        "65 thành trì Lĩnh Nam và các Nữ tướng triều Trưng Nữ Vương",
        "Di tích cách mạng Hộp thư bí mật đồng chí Trường Chinh tại Đền"
      ],
      studentParticipation: 290,
      participationRate: 94,
      status: "active"
    }
  ]
};

export function normalizePlatformAnalytics(raw: unknown): PlatformAnalyticsState {
  if (!raw || typeof raw !== "object") {
    return INITIAL_PLATFORM_ANALYTICS;
  }
  const obj = raw as Partial<PlatformAnalyticsState>;
  return {
    ...INITIAL_PLATFORM_ANALYTICS,
    ...obj,
    totalVisitors:
      typeof obj.totalVisitors === "number"
        ? obj.totalVisitors
        : INITIAL_PLATFORM_ANALYTICS.totalVisitors,
    totalStudents:
      typeof obj.totalStudents === "number"
        ? obj.totalStudents
        : INITIAL_PLATFORM_ANALYTICS.totalStudents,
    totalTeachers:
      typeof obj.totalTeachers === "number"
        ? obj.totalTeachers
        : INITIAL_PLATFORM_ANALYTICS.totalTeachers,
    dailyAccess:
      Array.isArray(obj.dailyAccess) && obj.dailyAccess.length > 0
        ? obj.dailyAccess
        : Array.isArray(obj.dailyAccessStats) && obj.dailyAccessStats.length > 0
        ? obj.dailyAccessStats
        : INITIAL_PLATFORM_ANALYTICS.dailyAccess,
    monthlyAccess:
      Array.isArray(obj.monthlyAccess) && obj.monthlyAccess.length > 0
        ? obj.monthlyAccess
        : Array.isArray(obj.monthlyAccessStats) && obj.monthlyAccessStats.length > 0
        ? obj.monthlyAccessStats
        : INITIAL_PLATFORM_ANALYTICS.monthlyAccess,
    popularLocations:
      Array.isArray(obj.popularLocations) &&
      obj.popularLocations.length > 0 &&
      typeof obj.popularLocations[0]?.totalViews === "number"
        ? obj.popularLocations
        : INITIAL_PLATFORM_ANALYTICS.popularLocations,
    visitorSessions:
      Array.isArray(obj.visitorSessions) &&
      obj.visitorSessions.length > 0 &&
      Array.isArray(obj.visitorSessions[0]?.viewedLocations)
        ? obj.visitorSessions
        : INITIAL_PLATFORM_ANALYTICS.visitorSessions,
    studentActivities:
      Array.isArray(obj.studentActivities) &&
      obj.studentActivities.length > 0 &&
      typeof obj.studentActivities[0]?.learningProgressPct === "number"
        ? obj.studentActivities
        : INITIAL_PLATFORM_ANALYTICS.studentActivities,
    teacherActivities:
      Array.isArray(obj.teacherActivities) &&
      obj.teacherActivities.length > 0 &&
      typeof obj.teacherActivities[0]?.aiLessonPlansGenerated === "number"
        ? obj.teacherActivities
        : INITIAL_PLATFORM_ANALYTICS.teacherActivities
  };
}

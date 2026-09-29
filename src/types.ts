export type UserRole = "admin" | "teacher" | "student" | "visitor";
export type UserStatus = "active" | "pending" | "suspended";

export interface UserAccount {
  id: string;
  uid?: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  emailVerified?: boolean;
  isGuest?: boolean;
  sessionToken?: string;
  phoneNumber?: string;
  savedHistory?: string[];
  grade?: string; // e.g. "Lớp 4A", "Lớp 5B" (For students)
  classId?: string;
  school?: string; // e.g. "Trường Tiểu học Văn Khê – Xã Mê Linh, TP. Hà Nội"
  subject?: string; // e.g. "Lịch sử & Địa lý" (For teachers)
  createdLessonsCount?: number;
  studentParticipationCount?: number;
  avatar?: string;
  createdAt?: string;
}

export type DeviceType = "Desktop" | "Mobile" | "Tablet";

export interface AnonymousVisitorSession {
  sessionId: string;
  visitTime: string;
  visitHour?: number;
  tourDurationSeconds: number;
  deviceType: DeviceType;
  viewedLocations: string[];
  viewedLocationIds?: string[];
  viewedLocationTitles?: string[];
  completedTour?: boolean;
}

export interface HeritageLocationPopularity {
  id: string;
  poiId?: string;
  stationOrder?: number;
  stationCode: string;
  name: string;
  title?: string;
  category?: string;
  totalViews: number;
  visitorViews: number;
  studentViews: number;
  avgDurationSeconds: number;
  avgDwellMinutes?: number;
  completionRate: number;
}

export interface AccessStatPoint {
  label: string;
  visitors: number;
  students: number;
  teachers: number;
}

export interface StudentActivityRecord {
  id: string;
  name: string;
  className: string;
  school: string;
  lessonsViewed: number;
  totalLessons: number;
  viewedStationNames?: string[];
  quizzesCompleted: number;
  quizzesTaken?: number;
  quizAvgScore: number;
  learningProgressPct: number;
  learningProgress?: number; // 0 - 100%
  lastActive: string;
}

export interface TeacherActivityRecord {
  id: string;
  name: string;
  email: string;
  school: string;
  subject?: string;
  createdLessons: number;
  aiLessonPlansGenerated: number;
  lessonTitles?: string[];
  studentParticipation: number;
  participationRate?: number; // 0 - 100%
  status?: UserStatus;
}

export interface PlatformAnalyticsState {
  totalVisitors: number;
  totalStudents: number;
  totalTeachers: number;
  avgTourDurationSeconds?: number;
  deviceBreakdown?: {
    Desktop: number;
    Mobile: number;
    Tablet: number;
  };
  visitTimeDistribution?: {
    slot: string;
    visitors: number;
    students: number;
  }[];
  dailyAccess: AccessStatPoint[];
  monthlyAccess: AccessStatPoint[];
  dailyAccessStats?: AccessStatPoint[];
  monthlyAccessStats?: AccessStatPoint[];
  popularLocations: HeritageLocationPopularity[];
  visitorSessions: AnonymousVisitorSession[];
  recentAnonymousSessions?: AnonymousVisitorSession[];
  studentActivities: StudentActivityRecord[];
  teacherActivities: TeacherActivityRecord[];
}

export interface SchoolClass {
  id: string;
  name: string;
  grade?: string;
  school?: string;
  teacherName?: string;
  gradeLevel: number;
  headTeacherName?: string;
  studentCount: number;
  avgXp?: number;
  completionRate?: number;
}

export interface StudentProfile {
  id: string;
  name: string;
  grade: string; // e.g. "Lớp 4A", "Lớp 5B"
  school: string; // e.g. "Trường Tiểu học Văn Khê"
  xp: number;
  level: number;
  levelTitle: string; // e.g. "Tập sự Di sản", "Sứ giả Mê Linh", "Hiệp sĩ Trưng Vương"
  streakDays: number;
  completedPOIs: string[]; // POI IDs
  unlockedBadgeIds: string[];
  quizScore: number;
  createdArtworksCount: number;
  sharedPostsCount?: number;
  sharedPhotosCount?: number;
  sharedVideosCount?: number;
  sharedAudiosCount?: number;
}

export type POIStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface OfficialSourceCitation {
  sourceType:
    | "Cơ quan quản lý văn hóa"
    | "Cổng thông tin chính quyền"
    | "Hồ sơ di tích"
    | "Tài liệu giáo dục địa phương"
    | "Sách giáo khoa GDPT 2018";
  agencyName: string;
  documentTitle: string;
  referenceCode: string;
  publishedYear?: string;
}

export interface GradeCurriculumLesson {
  id: string;
  gradeLevel: 1 | 2 | 3 | 4 | 5;
  gradeLabel: string;
  subjectName: string;
  lessonNumber: string;
  title: string;
  visualHeadline: string;
  keyFacts: string[];
  imageUrl: string;
  videoEmbedUrl: string;
  videoCaption: string;
  model3DArtifactId: string;
  model3DTitle: string;
  aiMentorPrompt: string;
  aiMentorGreeting: string;
  missionTitle: string;
  xpReward: number;
  badgeRewardId: string;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  officialSource: OfficialSourceCitation;
}

export interface HeritagePOI {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  category:
    | "Kiến trúc"
    | "Di vật & Thờ phụng"
    | "Danh nhân"
    | "Cảnh quan & Lễ hội"
    | "Historical Heritage Photo";
  mapCoords: { x: number; y: number }; // Percentage on map canvas
  shortDesc: string;
  fullDesc: string;
  historicalSignificance: string;
  funFact: string; // "Góc Sử Học Nhí"
  imageUrl: string;
  galleryUrls: string[];
  audioScriptDefault: string;
  audioUrl?: string;
  videoUrl?: string;
  knowledgeContent?: string;
  qrCodeData?: string;
  status?: POIStatus;
  requiredPrevPoiId?: string;
  quest: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    xpReward: number;
  };
  officialSource?: OfficialSourceCitation;
}

export interface HeritageBadge {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name or emoji
  category: "Khám phá" | "Thông thái" | "Sáng tạo" | "Tranh tài";
  requiredXp: number;
  conditionText: string;
}

export type Badge = HeritageBadge;

export interface HeritageArtifact {
  id: string;
  name: string;
  period: string; // e.g. "Thời Hùng Vương - An Dương Vương", "Năm 40 SCN"
  material: string; // e.g. "Đồng thau", "Gỗ lim & Vàng son", "Đá cẩm thạch"
  description: string;
  historicalValue: string;
  imageUrl: string;
  locationInTemple: string;
  officialSource?: OfficialSourceCitation;
}

export type QuestionType = "multiple_choice" | "true_false" | "drag_drop" | "matching" | "open_ended";

export interface QuizQuestion {
  id: string;
  question: string;
  questionType?: QuestionType;
  options: string[];
  correctAnswerIndex: number;
  correctBoolAnswer?: boolean;
  matchingPairs?: { left: string; right: string }[];
  explanation: string;
  hint?: string;
  xpPoints: number;
  stationId?: string;
  stationTitle?: string;
  sampleAnswer?: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  isAudioSpeaking?: boolean;
}

export interface ClassStudentProgress {
  id: string;
  name: string;
  class: string;
  poisCompleted: number;
  totalPois: number;
  score: number;
  badgesCount: number;
  lastActive: string;
  status: "Đang học" | "Hoàn thành" | "Cần cố gắng";
}

export interface PostComment {
  id: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  createdAt: string;
}

export type PostStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface StudentPost {
  id: string;
  studentId: string;
  studentName: string;
  studentGrade: string;
  studentAvatar?: string;
  title: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  videoThumbnailUrl?: string;
  audioUrl?: string;
  stationId?: string;
  stationTitle?: string;
  hashtags?: string[];
  submissionType?: "visit_photo" | "artwork" | "experience_diary" | "student_narration_video";
  officialSource?: OfficialSourceCitation;
  category:
    | "Cảm nhận di sản"
    | "Góc vẽ sáng tạo"
    | "Tìm hiểu di vật"
    | "Học tập & Quiz"
    | "Câu hỏi thảo luận"
    | "Ảnh tham quan thực tế"
    | "Tranh vẽ di sản"
    | "Nhật ký trải nghiệm"
    | "Video thuyết minh học sinh";
  likesCount: number;
  isLiked?: boolean;
  comments: PostComment[];
  createdAt: string;
  status: PostStatus;
  rejectionReason?: string;
  approvedAt?: string;
  approvedBy?: string;
  isHighlighted?: boolean;
  featuredInExhibition?: boolean;
  exhibitionCategory?: "Ảnh đẹp" | "Video hay" | "Thuyết minh hay" | "Bài viết nổi bật" | "Sản phẩm xuất sắc";
}

export interface MediaItem {
  id: string;
  title?: string;
  type: "image" | "audio" | "video";
  url: string;
  thumbnailUrl?: string;
  fileName?: string;
  duration?: string;
  fileSize?: string;
  caption?: string;
  category: string;
  uploadedBy?: string;
  uploadedAt?: string;
  uploaderRole?: UserRole;
  createdAt?: string;
  status?: "Đã xuất bản" | "Lưu nháp";
  attachedLocation?: string;
  attachedPoiId?: string;
  gradeLevel?: string;
  officialSource?: OfficialSourceCitation;
}

export interface HomepageContentConfig {
  title: string;
  subtitle: string;
  description: string;
  heroImageUrl: string;
  introVideoUrl: string;
  ctaButtonText: string;
  announcementText: string;
}

export type TransportationType = "bus" | "car" | "motorcycle" | "walking";

export type SpecialRequirementType =
  | "tour_guide"
  | "ai_tour"
  | "student_group_support";

export type VisitorRegistrationStatus = "Pending" | "Approved" | "Completed" | "Rejected";

export interface VisitorRegistration {
  bookingId: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  organization: string;
  visitDate: string; // YYYY-MM-DD
  preferredTime: string; // e.g. "08:00 - 09:30"
  adultsCount: number;
  studentsCount: number;
  teachersCount: number;
  totalVisitors: number;
  transportationType: TransportationType;
  specialRequirements: SpecialRequirementType[];
  notes?: string;
  status: VisitorRegistrationStatus;
  adminNote?: string;
  assignedGuide?: string;
  createdAt: string;
  updatedAt: string;
}

export type AnalyticsEventType =
  | "register_account"
  | "login"
  | "logout"
  | "access_feature"
  | "view_content"
  | "tour_360"
  | "use_ai"
  | "complete_quiz"
  | "book_visit";

export interface AnalyticsEventRecord {
  eventId: string;
  eventType: AnalyticsEventType;
  userRole: UserRole;
  userName: string;
  userEmail: string;
  deviceType: DeviceType;
  contentUsed: string;
  durationSeconds: number;
  createdAt: string;
}

export type EmailReportType = "REALTIME_ALERT" | "DAILY_REPORT" | "WEEKLY_REPORT";

export interface EmailReportRecord {
  reportId: string;
  reportType: EmailReportType;
  recipientEmail: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  deliveryStatus: "sent" | "queued" | "delivered";
  deliveryMethod?: string;
  createdAt: string;
}

export interface CategorizedAnalyticsSummary {
  adminRecipientEmail: string;
  todayActivity: {
    dateLabel: string;
    loginsToday: number;
    visitsToday: number;
    aiInteractionsToday: number;
    completedLessonsToday: number;
    tours360Today: number;
    newRegistrationsToday: number;
  };
  students: {
    totalRegistered: number;
    activeStudents: number;
    totalLogins: number;
    completedLessons: number;
    avgQuizScore: number;
    totalXp: number;
    totalBadges: number;
    avgLearningProgressPct: number;
  };
  teachers: {
    totalRegistered: number;
    totalLogins: number;
    classesManaged: number;
    lessonsCreated: number;
    participatingStudents: number;
  };
  visitors: {
    totalVisits: number;
    dailyVisits: number;
    monthlyVisits: number;
    avgVisitDurationSeconds: number;
    mostViewedLocation: string;
    total360Tours: number;
    totalAiUses: number;
    totalGroupBookings: number;
  };
  scheduleConfig: {
    dailyReportTime: string;
    weeklyReportDay: string;
    lastDailyReportSentAt?: string;
    lastWeeklyReportSentAt?: string;
    autoRealtimeAlertsEnabled: boolean;
  };
}





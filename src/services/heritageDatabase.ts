import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  auth,
  db,
  storage,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  reload,
  updateProfile,
  signOut,
  ref,
  uploadString,
  getDownloadURL,
  logFirebaseAnalyticsEvent,
  handleFirestoreError,
  OperationType,
} from "../firebase";
import {
  UserAccount,
  UserRole,
  StudentProfile,
  PlatformAnalyticsState,
  DeviceType,
  SchoolClass,
  ClassStudentProgress,
  MediaItem,
  StudentPost,
  VisitorRegistration,
  TransportationType,
  SpecialRequirementType,
  VisitorRegistrationStatus,
  AnalyticsEventType,
  AnalyticsEventRecord,
  EmailReportType,
  EmailReportRecord,
  CategorizedAnalyticsSummary,
} from "../types";

// Sanitize strings to strictly adhere to firebase-blueprint.json maxLength & pattern constraints
function clampStr(val: string | undefined, maxLen: number, fallback: string): string {
  const clean = (val || fallback).trim();
  return clean.length > 0 ? clean.slice(0, maxLen) : fallback.slice(0, maxLen);
}

function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_\-]/g, "-").slice(0, 128) || "id-default";
}

export function detectClientDeviceType(): DeviceType {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return "Desktop";
  }
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("ipad") || ua.includes("tablet")) {
    return "Tablet";
  }
  if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
    return "Mobile";
  }
  return "Desktop";
}

// Sync authenticated user profile to Firebase Firestore (/users/{uid})
export async function syncUserToFirestore(account: UserAccount): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.emailVerified) return;

  const uid = sanitizeId(currentUser.uid);
  const path = `users/${uid}`;
  const docRef = doc(db, "users", uid);

  try {
    const existingSnap = await getDoc(docRef);
    const safeRole: "student" | "teacher" | "visitor" | "admin" =
      currentUser.email === "nguyenquang1992vka@gmail.com"
        ? "admin"
        : account.role === "teacher"
        ? "teacher"
        : account.role === "visitor"
        ? "visitor"
        : "student";

    const safeStatus: "active" | "pending" | "suspended" =
      safeRole === "teacher" && !existingSnap.exists()
        ? account.status || "active"
        : account.status || "active";

    if (!existingSnap.exists()) {
      await setDoc(docRef, {
        uid,
        name: clampStr(account.name || currentUser.displayName || "Người dùng Mê Linh", 120, "Người dùng Mê Linh"),
        email: clampStr(currentUser.email || account.email, 150, "user@melinh.edu.vn"),
        role: safeRole,
        status: safeStatus,
        school: clampStr(
          account.school,
          200,
          "Trường Tiểu học Văn Khê – Xã Mê Linh, TP. Hà Nội"
        ),
        grade: clampStr(account.grade || account.subject, 100, "Lớp 4A"),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(docRef, {
        name: clampStr(account.name || currentUser.displayName || "Người dùng Mê Linh", 120, "Người dùng Mê Linh"),
        school: clampStr(
          account.school,
          200,
          "Trường Tiểu học Văn Khê – Xã Mê Linh, TP. Hà Nội"
        ),
        grade: clampStr(account.grade || account.subject, 100, "Lớp 4A"),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Sync student learning progress to Firebase Firestore (/studentProgress/{uid})
export async function syncStudentProgressToFirestore(profile: StudentProfile): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.emailVerified) return;

  const uid = sanitizeId(currentUser.uid);
  const path = `studentProgress/${uid}`;
  const docRef = doc(db, "studentProgress", uid);

  try {
    const existingSnap = await getDoc(docRef);
    const safeCompletedPOIs = (profile.completedPOIs || [])
      .slice(0, 10)
      .map((s) => String(s).slice(0, 64));
    const safeUnlockedBadges = (profile.unlockedBadgeIds || [])
      .slice(0, 20)
      .map((s) => String(s).slice(0, 64));

    const payload = {
      studentId: uid,
      name: clampStr(profile.name, 120, "Học sinh Mê Linh"),
      grade: clampStr(profile.grade, 50, "Lớp 4A"),
      school: clampStr(
        profile.school,
        200,
        "Trường Tiểu học Văn Khê – Xã Mê Linh, TP. Hà Nội"
      ),
      xp: Math.max(0, Math.min(1000000, Math.round(profile.xp || 0))),
      level: Math.max(1, Math.min(100, Math.round(profile.level || 1))),
      levelTitle: clampStr(profile.levelTitle, 100, "Sứ Giả Mê Linh"),
      completedPOIs: safeCompletedPOIs,
      unlockedBadgeIds: safeUnlockedBadges,
      quizzesCompleted: Math.max(0, Math.min(10000, Math.round((profile as any).quizzesCompleted || 1))),
      quizAvgScore: Math.max(0, Math.min(100, Math.round(profile.quizScore || 80))),
      createdArtworksCount: Math.max(
        0,
        Math.min(10000, Math.round(profile.createdArtworksCount || 0))
      ),
      updatedAt: serverTimestamp(),
    };

    if (!existingSnap.exists()) {
      await setDoc(docRef, payload);
    } else {
      await updateDoc(docRef, payload);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Record Quiz Attempt to both Firestore (when signed in with Google) and Server DB
export async function recordQuizAttemptInDatabase(params: {
  studentId: string;
  studentName: string;
  grade: string;
  school: string;
  score: number;
  xpEarned: number;
  totalQuestions: number;
  correctAnswers: number;
}): Promise<{
  studentProfile?: StudentProfile;
  platformAnalytics?: PlatformAnalyticsState;
}> {
  const currentUser = auth.currentUser;
  if (currentUser && currentUser.emailVerified) {
    const attemptId = sanitizeId(`qa-${currentUser.uid.slice(0, 12)}-${Date.now()}`);
    const path = `quizAttempts/${attemptId}`;
    try {
      await setDoc(doc(db, "quizAttempts", attemptId), {
        studentId: sanitizeId(currentUser.uid),
        studentName: clampStr(params.studentName, 120, "Học sinh Mê Linh"),
        grade: clampStr(params.grade, 50, "Lớp 4A"),
        score: Math.max(0, Math.min(100, Math.round(params.score))),
        xpEarned: Math.max(0, Math.min(1000, Math.round(params.xpEarned))),
        totalQuestions: Math.max(1, Math.min(100, Math.round(params.totalQuestions))),
        correctAnswers: Math.max(
          0,
          Math.min(Math.round(params.totalQuestions), Math.round(params.correctAnswers))
        ),
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  }

  const res = await fetch("/api/db/quiz-attempt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return res.json();
}

// Fetch complete live database state from backend
export async function fetchDatabaseState(): Promise<{
  userAccounts: UserAccount[];
  studentProfiles: Record<string, StudentProfile>;
  platformAnalytics: PlatformAnalyticsState;
  visitorRegistrations?: VisitorRegistration[];
  classes?: SchoolClass[];
  teacherLessons?: {
    id: string;
    title: string;
    grade: string;
    school: string;
    participants: number;
    createdAt: string;
  }[];
  activeUsersCount?: number;
  classStudentProgress?: ClassStudentProgress[];
  mediaLibrary?: MediaItem[];
  studentPosts?: StudentPost[];
  aiMetrics?: {
    totalAiChats: number;
    recentQuestions: { question: string; intent: string; timestamp: string }[];
    latestAiReport: string;
    latestAiReportTime: string;
  };
  categorizedAnalytics?: CategorizedAnalyticsSummary;
  analyticsEvents?: AnalyticsEventRecord[];
  emailReports?: EmailReportRecord[];
} | null> {
  try {
    const res = await fetch("/api/db/state");
    if (!res.ok) {
      return null;
    }
    return await res.json();
  } catch (e) {
    console.error("Failed to fetch database state", e);
    return null;
  }
}

// Authenticate with Google Popup (Firebase Auth) + Sync with Backend Database
export async function signInWithGoogleAndSync(
  preferredRole: UserRole,
  school: string,
  grade: string
): Promise<{
  user: UserAccount;
  studentProfile?: StudentProfile;
  platformAnalytics?: PlatformAnalyticsState;
  pendingAccount?: { name: string; email: string };
}> {
  const cred = await signInWithPopup(auth, googleProvider);
  const fbUser = cred.user;

  const isSuperAdmin = fbUser.email?.toLowerCase() === "nguyenquang1992vka@gmail.com";
  const effectiveRole: UserRole = isSuperAdmin ? "admin" : preferredRole;

  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      uid: fbUser.uid,
      email: fbUser.email || "",
      name: fbUser.displayName || "Người dùng Mê Linh",
      role: effectiveRole,
      grade,
      school,
      isGoogleAuth: true,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    if (data.pendingAccount) {
      return {
        user: {
          id: fbUser.uid,
          name: data.pendingAccount.name,
          email: data.pendingAccount.email,
          role: "teacher",
          status: "pending",
        },
        pendingAccount: data.pendingAccount,
      };
    }
    throw new Error(data.error || "Đăng nhập không thành công");
  }

  // Sync user and student progress to Firestore
  await syncUserToFirestore(data.user);
  if (data.studentProfile) {
    await syncStudentProgressToFirestore(data.studentProfile);
  }

  return data;
}

// Authenticate with Email & Password against Firebase Auth + Real Database
export async function loginWithCredentials(params: {
  email?: string;
  password?: string;
  name?: string;
  role: UserRole;
  grade?: string;
  school?: string;
}): Promise<{
  user: UserAccount;
  sessionToken?: string;
  studentProfile?: StudentProfile;
  platformAnalytics?: PlatformAnalyticsState;
  pendingAccount?: { name: string; email: string };
}> {
  let firebaseUid: string | undefined;
  let firebaseEmailVerified = false;
  if (params.email && params.password) {
    try {
      const fbCred = await signInWithEmailAndPassword(
        auth,
        params.email.trim(),
        params.password.trim()
      );
      firebaseUid = fbCred.user.uid;
      firebaseEmailVerified = Boolean(fbCred.user.emailVerified);
    } catch (_fbErr) {
      // Proceed to backend database verification if user is stored in backend DB
    }
  }

  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...params,
      uid: firebaseUid,
      emailVerified: firebaseEmailVerified,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    if (data.pendingAccount) {
      return {
        user: {
          id: "pending",
          name: data.pendingAccount.name,
          email: data.pendingAccount.email,
          role: "teacher",
          status: "pending",
        },
        pendingAccount: data.pendingAccount,
      };
    }
    throw new Error(data.error || "Đăng nhập thất bại");
  }

  if (auth.currentUser && auth.currentUser.emailVerified && data.user) {
    await syncUserToFirestore(data.user);
    if (data.studentProfile) {
      await syncStudentProgressToFirestore(data.studentProfile);
    }
  }

  return data;
}

// Register a new Student, Teacher, Visitor, or Super Admin account in Firebase Auth + Real Database
export async function registerRealAccount(params: {
  name: string;
  email?: string;
  password?: string;
  role: "student" | "teacher" | "visitor" | "admin";
  grade?: string;
  school?: string;
  subject?: string;
  phoneNumber?: string;
}): Promise<{
  user?: UserAccount;
  sessionToken?: string;
  studentProfile?: StudentProfile;
  platformAnalytics?: PlatformAnalyticsState;
  userAccounts?: UserAccount[];
  verificationEmailSent?: boolean;
  error?: string;
}> {
  try {
    if (
      params.role === "admin" ||
      (params.email && params.email.trim().toLowerCase() === "nguyenquang1992vka@gmail.com")
    ) {
      return {
        error:
          "Tài khoản Quản trị viên mặc định là nguyenquang1992vka@gmail.com. Không ai có quyền đăng ký mới hoặc chỉnh sửa ngoài tài khoản này."
      };
    }

    let firebaseUid: string | undefined;
    let firebaseEmailVerified = false;
    let verificationEmailSent = false;

    if (params.email && params.password && params.password.length >= 6) {
      try {
        const fbCred = await createUserWithEmailAndPassword(
          auth,
          params.email.trim(),
          params.password.trim()
        );
        if (fbCred.user) {
          firebaseUid = fbCred.user.uid;
          firebaseEmailVerified = Boolean(fbCred.user.emailVerified);
          if (params.name) {
            await updateProfile(fbCred.user, { displayName: params.name.trim() });
          }
          try {
            await sendEmailVerification(fbCred.user);
            verificationEmailSent = true;
          } catch (_verifyErr) {
            // Non-blocking if Firebase email verification rate-limited
          }
        }
      } catch (_fbErr) {
        // Proceed with backend database registration
      }
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...params,
        uid: firebaseUid,
        emailVerified: firebaseEmailVerified,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || "Đăng ký tài khoản thất bại" };
    }

    if (auth.currentUser && auth.currentUser.emailVerified && data.user) {
      await syncUserToFirestore(data.user);
      if (data.studentProfile) {
        await syncStudentProgressToFirestore(data.studentProfile);
      }
    }

    return {
      ...data,
      verificationEmailSent,
    };
  } catch (err: any) {
    return { error: err?.message || "Lỗi kết nối máy chủ" };
  }
}

// Request Password Reset via Firebase Authentication + Backend DB
export async function requestPasswordReset(params: {
  email: string;
  newPassword?: string;
}): Promise<{ ok: boolean; message?: string; error?: string }> {
  try {
    const cleanEmail = params.email.trim();
    if (!cleanEmail) {
      return { ok: false, error: "Vui lòng nhập địa chỉ Email đã đăng ký." };
    }

    // 1. Trigger Firebase Auth password reset email
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
    } catch (_fbErr) {
      // Continue to backend password reset handler
    }

    // 2. Sync with backend database
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: cleanEmail,
        newPassword: params.newPassword ? params.newPassword.trim() : undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.error || "Không thể khôi phục mật khẩu." };
    }
    return { ok: true, message: data.message };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Lỗi kết nối hệ thống." };
  }
}

// Send or Confirm Email Verification via Firebase Authentication + Firestore sync
export async function sendAndConfirmEmailVerification(params: {
  email: string;
  userId?: string;
  confirmVerified?: boolean;
}): Promise<{
  ok: boolean;
  emailVerified?: boolean;
  user?: UserAccount;
  message?: string;
  error?: string;
}> {
  try {
    if (auth.currentUser) {
      if (!params.confirmVerified && !auth.currentUser.emailVerified) {
        try {
          await sendEmailVerification(auth.currentUser);
        } catch (_e) {
          // Ignore rate limit errors
        }
      } else if (params.confirmVerified) {
        try {
          await reload(auth.currentUser);
        } catch (_e) {
          // Ignore reload error
        }
      }
    }

    const res = await fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: params.email.trim(),
        userId: params.userId,
        confirmVerified: Boolean(params.confirmVerified || auth.currentUser?.emailVerified),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.error || "Không thể xác minh email." };
    }

    if (auth.currentUser && auth.currentUser.emailVerified && data.user) {
      await syncUserToFirestore(data.user);
    }

    return {
      ok: true,
      emailVerified: Boolean(data.emailVerified),
      user: data.user,
      message: data.message,
    };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Lỗi kết nối hệ thống." };
  }
}

// Verify active session token against backend
export async function verifySessionToken(sessionToken: string): Promise<{
  user: UserAccount;
  studentProfile?: StudentProfile | null;
} | null> {
  try {
    const res = await fetch("/api/auth/session", {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (_e) {
    return null;
  }
}

// Save explored heritage station to Registered Visitor history
export async function saveRegisteredVisitorHistory(params: {
  userId?: string;
  email?: string;
  locationTitle: string;
}): Promise<string[] | null> {
  try {
    const res = await fetch("/api/db/visitor-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data.savedHistory) ? data.savedHistory : null;
  } catch (_e) {
    return null;
  }
}

// Automatically track anonymous Visitor Session in Real Database (No Login required)
export async function recordVisitorSessionInDatabase(params: {
  sessionId: string;
  tourDurationSeconds: number;
  deviceType: DeviceType;
  viewedLocations: string[];
  completedTour?: boolean;
}): Promise<{ platformAnalytics?: PlatformAnalyticsState }> {
  const res = await fetch("/api/db/visitor-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return res.json();
}

export async function recordVisitorSession(params: {
  sessionId: string;
  viewedLocations: string[];
  tourDurationSeconds: number;
  deviceType: DeviceType;
  completedTour?: boolean;
}): Promise<PlatformAnalyticsState | null> {
  try {
    const data = await recordVisitorSessionInDatabase(params);
    return data.platformAnalytics || null;
  } catch (e) {
    console.error("Failed to record visitor session", e);
    return null;
  }
}

// Record real station visit & POI completion in Database
export async function recordStationViewInDatabase(params: {
  poiId: string;
  poiTitle: string;
  role: UserRole;
  studentId?: string;
  sessionId?: string;
  xpReward?: number;
}): Promise<{
  studentProfile?: StudentProfile;
  platformAnalytics?: PlatformAnalyticsState;
}> {
  const res = await fetch("/api/db/station-view", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (data.studentProfile) {
    await syncStudentProgressToFirestore(data.studentProfile);
  }
  return data;
}

export async function trackVisitorJourneyUpdate(params: {
  sessionId: string;
  viewedLocation?: string;
  poiId?: string;
  tourDurationSeconds?: number;
  role?: UserRole;
}): Promise<PlatformAnalyticsState | null> {
  try {
    if (params.poiId && params.viewedLocation) {
      const data = await recordStationViewInDatabase({
        poiId: params.poiId,
        poiTitle: params.viewedLocation,
        role: params.role || "visitor",
        sessionId: params.sessionId,
      });
      return data.platformAnalytics || null;
    }
    const res = await fetch("/api/db/visitor-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: params.sessionId,
        tourDurationSeconds: params.tourDurationSeconds || 180,
        deviceType: "Desktop",
        viewedLocations: params.viewedLocation ? [params.viewedLocation] : [],
      }),
    });
    const data = await res.json();
    return data.platformAnalytics || null;
  } catch (e) {
    console.error("Failed to track visitor journey update", e);
    return null;
  }
}

// Save Student Profile & Progress to Real Database + Firestore
export async function saveStudentProgressInDatabase(
  studentProfile: StudentProfile
): Promise<{
  studentProfile?: StudentProfile;
  platformAnalytics?: PlatformAnalyticsState;
}> {
  await syncStudentProgressToFirestore(studentProfile);
  const res = await fetch("/api/db/student-progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentProfile }),
  });
  return res.json();
}

export async function syncStudentProgressToDb(
  studentProfile: StudentProfile,
  _email?: string
): Promise<PlatformAnalyticsState | null> {
  try {
    const data = await saveStudentProgressInDatabase(studentProfile);
    return data.platformAnalytics || null;
  } catch (e) {
    console.error("Failed to sync student progress", e);
    return null;
  }
}

export async function recordQuizAttemptInDb(params: {
  studentId: string;
  studentName: string;
  score: number;
  xpEarned: number;
  totalQuestions: number;
  correctCount: number;
  grade?: string;
  school?: string;
}): Promise<{
  studentProfile?: StudentProfile;
  platformAnalytics?: PlatformAnalyticsState;
} | null> {
  try {
    return await recordQuizAttemptInDatabase({
      studentId: params.studentId,
      studentName: params.studentName,
      grade: params.grade || "Lớp 4A",
      school: params.school || "Trường Tiểu học Văn Khê – Xã Mê Linh, TP. Hà Nội",
      score: params.score,
      xpEarned: params.xpEarned,
      totalQuestions: params.totalQuestions,
      correctAnswers: params.correctCount,
    });
  } catch (e) {
    console.error("Failed to record quiz attempt", e);
    return null;
  }
}

export async function recordTeacherActionInDb(params: {
  teacherName: string;
  actionType: "create_lesson" | "update_curriculum";
  school?: string;
}): Promise<PlatformAnalyticsState | null> {
  try {
    const res = await fetch("/api/db/teacher-action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    return data.platformAnalytics || null;
  } catch (e) {
    console.error("Failed to record teacher action", e);
    return null;
  }
}

export async function updateAccountsInDb(userAccounts: UserAccount[]): Promise<void> {
  try {
    await fetch("/api/db/accounts/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userAccounts }),
    });
  } catch (e) {
    console.error("Failed to update accounts in database", e);
  }
}

// Upload Artwork or Media to Firebase Storage + Real Backend Storage
export async function uploadFileToStorage(params: {
  dataUrl?: string;
  base64Data?: string;
  fileName?: string;
  title?: string;
  type?: "image" | "video" | "audio";
  category?: string;
  uploadedBy: string;
}): Promise<MediaItem | null> {
  try {
    const dataUrl = params.dataUrl || params.base64Data || "";
    const fileName = params.fileName || params.title || `heritage-${Date.now()}.png`;
    let firebaseDownloadUrl: string | null = null;

    if (auth.currentUser && dataUrl.startsWith("data:")) {
      try {
        const storagePath = `heritage_uploads/${auth.currentUser.uid}/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9_.-]/g, "_")}`;
        const storageRef = ref(storage, storagePath);
        await uploadString(storageRef, dataUrl, "data_url");
        firebaseDownloadUrl = await getDownloadURL(storageRef);
      } catch (_storageErr) {
        // Fallback to server storage if Firebase Storage rules or bucket not yet provisioned
      }
    }

    const res = await fetch("/api/storage/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dataUrl,
        fileName,
        uploadedBy: params.uploadedBy,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.file) {
      if (firebaseDownloadUrl) {
        return {
          id: `fb-${Date.now()}`,
          title: params.title || fileName,
          type: params.type || "image",
          url: firebaseDownloadUrl,
          category: params.category || "Tác phẩm Học sinh",
          uploadedAt: new Date().toLocaleDateString("vi-VN"),
        };
      }
      return null;
    }
    return {
      id: data.file.id,
      title: params.title || data.file.fileName,
      type: params.type || "image",
      url: firebaseDownloadUrl || data.file.url,
      category: params.category || "Tác phẩm Học sinh",
      uploadedAt: new Date(data.file.createdAt || Date.now()).toLocaleDateString("vi-VN"),
    };
  } catch (e) {
    console.error("Upload file error", e);
    return null;
  }
}

// Automatic Progress Tracking in Real Database + Firestore (watch_video, explore_360, complete_mission, complete_quiz)
export async function recordProgressEventInDb(params: {
  eventType: "watch_video" | "explore_360" | "complete_mission" | "complete_quiz";
  studentId?: string;
  userId?: string;
  email?: string;
  poiId?: string;
  poiTitle?: string;
  xpEarned?: number;
  role?: UserRole;
  sessionId?: string;
}): Promise<{
  studentProfile?: StudentProfile;
  platformAnalytics?: PlatformAnalyticsState;
} | null> {
  try {
    const res = await fetch("/api/db/progress-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.studentProfile) {
      await syncStudentProgressToFirestore(data.studentProfile);
    }
    return data;
  } catch (e) {
    console.error("Failed to record progress event in database", e);
    return null;
  }
}

// Update User Profile in Real Database + Firestore
export async function updateUserProfileInDb(params: {
  userId?: string;
  email?: string;
  name: string;
  school?: string;
  grade?: string;
  phoneNumber?: string;
  newPassword?: string;
}): Promise<{
  user?: UserAccount;
  studentProfile?: StudentProfile | null;
  userAccounts?: UserAccount[];
  error?: string;
}> {
  try {
    const res = await fetch("/api/auth/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || "Cập nhật hồ sơ thất bại." };
    }
    if (data.user && auth.currentUser && auth.currentUser.emailVerified) {
      await syncUserToFirestore(data.user);
    }
    return data;
  } catch (err: any) {
    return { error: err?.message || "Lỗi kết nối máy chủ." };
  }
}

// Create digital heritage lesson in Real Database (Teacher Portal)
export async function createTeacherLessonInDb(params: {
  title: string;
  grade: string;
  school: string;
  teacherName: string;
  teacherEmail?: string;
}): Promise<{
  lesson?: {
    id: string;
    title: string;
    grade: string;
    school: string;
    participants: number;
    createdAt: string;
  };
  teacherLessons?: {
    id: string;
    title: string;
    grade: string;
    school: string;
    participants: number;
    createdAt: string;
  }[];
  platformAnalytics?: PlatformAnalyticsState;
} | null> {
  try {
    const res = await fetch("/api/db/teacher/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error("Failed to create teacher lesson in database", e);
    return null;
  }
}

// Add or update student tracking record in Real Database (Teacher Portal)
export async function upsertTeacherStudentInDb(
  student: ClassStudentProgress & { school?: string }
): Promise<{
  studentProfile?: StudentProfile;
  platformAnalytics?: PlatformAnalyticsState;
} | null> {
  try {
    const res = await fetch("/api/db/teacher/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error("Failed to upsert student in database", e);
    return null;
  }
}

// Manage Teacher / Admin School Classes in Real Database
export async function manageTeacherClassInDb(params: {
  action: "create" | "delete";
  classData?: Partial<SchoolClass>;
  classId?: string;
}): Promise<SchoolClass[] | null> {
  try {
    const res = await fetch("/api/db/teacher/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data.classes) ? data.classes : null;
  } catch (e) {
    console.error("Failed to manage class in database", e);
    return null;
  }
}

// Admin Account Management in Real Database
export async function manageAdminAccountInDb(params: {
  action: "approve" | "suspend" | "reactivate" | "delete" | "role" | "create";
  accountId?: string;
  accountData?: UserAccount;
  newRole?: UserRole;
}): Promise<{
  userAccounts?: UserAccount[];
  platformAnalytics?: PlatformAnalyticsState;
} | null> {
  try {
    const res = await fetch("/api/db/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error("Failed to manage account in database", e);
    return null;
  }
}

export async function signOutFromFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (e) {
    console.error("Firebase signOut error", e);
  }
}

export async function logoutEverywhere(
  sessionToken?: string,
  userInfo?: { userName?: string; userEmail?: string; userRole?: UserRole; durationSeconds?: number }
): Promise<void> {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionToken,
        userName: userInfo?.userName,
        userEmail: userInfo?.userEmail,
        userRole: userInfo?.userRole,
        durationSeconds: userInfo?.durationSeconds || 120,
      }),
    });
  } catch (_e) {
    // Ignore logout network error
  }
  await signOutFromFirebase();
}

// ============================================================================
// REAL DATABASE OPERATIONS FOR ONLINE VISITOR REGISTRATION MANAGEMENT
// ============================================================================

export async function fetchVisitorRegistrationsFromDb(query?: string): Promise<VisitorRegistration[]> {
  try {
    const url = query
      ? `/api/db/visitor-registrations?query=${encodeURIComponent(query)}`
      : "/api/db/visitor-registrations";
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.visitorRegistrations) ? data.visitorRegistrations : [];
  } catch (e) {
    console.error("Failed to fetch visitor registrations:", e);
    return [];
  }
}

export async function syncVisitorBookingToFirestore(
  registration: VisitorRegistration
): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.emailVerified) return;

  const bookingId = sanitizeId(registration.bookingId || `bk-${Date.now()}`);
  const path = `visitorBookings/${bookingId}`;
  const docRef = doc(db, "visitorBookings", bookingId);

  try {
    const existingSnap = await getDoc(docRef);
    const validTransport: "bus" | "car" | "motorcycle" | "walking" =
      registration.transportationType === "bus" ||
      registration.transportationType === "car" ||
      registration.transportationType === "motorcycle" ||
      registration.transportationType === "walking"
        ? registration.transportationType
        : "bus";
    const validStatus: "Pending" | "Approved" | "Rejected" | "Completed" =
      registration.status === "Approved" ||
      registration.status === "Rejected" ||
      registration.status === "Completed"
        ? registration.status
        : "Pending";

    if (!existingSnap.exists()) {
      await setDoc(docRef, {
        bookingId,
        organization: clampStr(registration.organization, 200, "Đoàn khách tham quan Đền Hai Bà Trưng"),
        registrantName: clampStr(registration.fullName, 120, "Người phụ trách đoàn"),
        phoneNumber: clampStr(registration.phoneNumber, 30, "0900000000"),
        visitDate: clampStr(registration.visitDate, 40, new Date().toISOString().slice(0, 10)),
        totalVisitors: Math.max(1, Math.min(5000, Math.round(Number(registration.totalVisitors) || 1))),
        transportation: validTransport,
        status: validStatus,
        createdAt: serverTimestamp(),
      });
    } else {
      await updateDoc(docRef, {
        organization: clampStr(registration.organization, 200, "Đoàn khách tham quan Đền Hai Bà Trưng"),
        registrantName: clampStr(registration.fullName, 120, "Người phụ trách đoàn"),
        phoneNumber: clampStr(registration.phoneNumber, 30, "0900000000"),
        visitDate: clampStr(registration.visitDate, 40, new Date().toISOString().slice(0, 10)),
        totalVisitors: Math.max(1, Math.min(5000, Math.round(Number(registration.totalVisitors) || 1))),
        transportation: validTransport,
        status: validStatus,
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function createVisitorRegistrationInDb(params: {
  fullName: string;
  phoneNumber: string;
  email: string;
  organization: string;
  visitDate: string;
  preferredTime: string;
  adultsCount: number;
  studentsCount: number;
  teachersCount: number;
  transportationType: TransportationType;
  specialRequirements: SpecialRequirementType[];
  notes?: string;
}): Promise<{
  registration?: VisitorRegistration;
  visitorRegistrations?: VisitorRegistration[];
  platformAnalytics?: PlatformAnalyticsState;
  error?: string;
}> {
  try {
    const res = await fetch("/api/db/visitor-registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || "Đăng ký tham quan không thành công." };
    }
    if (data.registration) {
      await syncVisitorBookingToFirestore(data.registration);
    }
    return data;
  } catch (err: any) {
    return { error: err?.message || "Lỗi kết nối cơ sở dữ liệu." };
  }
}

export async function updateVisitorRegistrationInDb(
  bookingId: string,
  updates: {
    status?: VisitorRegistrationStatus;
    visitDate?: string;
    preferredTime?: string;
    adminNote?: string;
    assignedGuide?: string;
  }
): Promise<{
  registration?: VisitorRegistration;
  visitorRegistrations?: VisitorRegistration[];
  error?: string;
}> {
  try {
    const res = await fetch(`/api/db/visitor-registrations/${encodeURIComponent(bookingId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || "Cập nhật trạng thái không thành công." };
    }
    if (data.registration) {
      await syncVisitorBookingToFirestore(data.registration);
    }
    return data;
  } catch (err: any) {
    return { error: err?.message || "Lỗi kết nối cơ sở dữ liệu." };
  }
}

export async function deleteVisitorRegistrationInDb(
  bookingId: string
): Promise<VisitorRegistration[] | null> {
  try {
    const res = await fetch(`/api/db/visitor-registrations/${encodeURIComponent(bookingId)}`, {
      method: "DELETE",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data.visitorRegistrations) ? data.visitorRegistrations : null;
  } catch (e) {
    console.error("Failed to delete visitor registration:", e);
    return null;
  }
}

export async function generateVisitorRegistrationAiReport(): Promise<{
  report: string;
  generatedAt: string;
} | null> {
  try {
    const res = await fetch("/api/gemini/visitor-registrations-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error("Failed to generate AI visitor report:", e);
    return null;
  }
}

// ============================================================================
// AUTOMATIC ANALYTICS EVENT TRACKING & EMAIL REPORTING SERVICE
// Recipient Admin Email: nguyenquang1992vka@gmail.com
// ============================================================================

export async function syncAnalyticsEventToFirestore(
  eventRecord: AnalyticsEventRecord
): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.emailVerified) return;

  const eventId = sanitizeId(eventRecord.eventId || `evt-${Date.now()}`);
  const path = `analyticsEvents/${eventId}`;
  const docRef = doc(db, "analyticsEvents", eventId);

  try {
    await setDoc(docRef, {
      eventId,
      eventType: eventRecord.eventType,
      userRole: eventRecord.userRole,
      userName: clampStr(eventRecord.userName, 120, "Người dùng Di sản"),
      userEmail: clampStr(eventRecord.userEmail, 150, "guest@melinh-heritage.vn"),
      deviceType:
        eventRecord.deviceType === "Mobile" || eventRecord.deviceType === "Tablet"
          ? eventRecord.deviceType
          : "Desktop",
      contentUsed: clampStr(eventRecord.contentUsed, 300, "Hoạt động hệ thống"),
      durationSeconds: Math.max(0, Math.min(86400, Math.round(eventRecord.durationSeconds || 0))),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function syncEmailReportToFirestore(
  reportRecord: EmailReportRecord
): Promise<void> {
  const currentUser = auth.currentUser;
  if (
    !currentUser ||
    !currentUser.emailVerified ||
    currentUser.email !== "nguyenquang1992vka@gmail.com"
  ) {
    return;
  }

  const reportId = sanitizeId(reportRecord.reportId || `rep-${Date.now()}`);
  const path = `emailReports/${reportId}`;
  const docRef = doc(db, "emailReports", reportId);

  try {
    await setDoc(docRef, {
      reportId,
      reportType: reportRecord.reportType,
      recipientEmail: "nguyenquang1992vka@gmail.com",
      subject: clampStr(reportRecord.subject, 200, "BÁO CÁO NGÀY - MÊ LINH SMART HERITAGE AI"),
      bodyText: clampStr(reportRecord.bodyText, 5000, "Báo cáo thống kê tự động"),
      deliveryStatus: reportRecord.deliveryStatus || "delivered",
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function trackUserActivityEvent(params: {
  eventType: AnalyticsEventType;
  userRole: UserRole;
  userName?: string;
  userEmail?: string;
  contentUsed: string;
  durationSeconds?: number;
  triggerRealtimeEmail?: boolean;
  emailDetails?: string;
}): Promise<{
  event?: AnalyticsEventRecord;
  sentEmail?: EmailReportRecord;
  summary?: CategorizedAnalyticsSummary;
  analyticsEvents?: AnalyticsEventRecord[];
  emailReports?: EmailReportRecord[];
} | null> {
  try {
    const deviceType = detectClientDeviceType();
    logFirebaseAnalyticsEvent(params.eventType, {
      user_role: params.userRole,
      user_name: params.userName || "Khách tham quan",
      device_type: deviceType,
      content_used: params.contentUsed,
      duration_seconds: params.durationSeconds || 15,
    });

    const res = await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...params,
        deviceType,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.event) {
      await syncAnalyticsEventToFirestore(data.event);
    }
    if (data.sentEmail) {
      await syncEmailReportToFirestore(data.sentEmail);
    }
    return data;
  } catch (e) {
    console.error("Failed to track user activity event:", e);
    return null;
  }
}

export async function fetchAnalyticsReportSummary(): Promise<{
  summary: CategorizedAnalyticsSummary;
  analyticsEvents: AnalyticsEventRecord[];
  emailReports: EmailReportRecord[];
  visitorRegistrations: VisitorRegistration[];
  platformAnalytics: PlatformAnalyticsState;
} | null> {
  try {
    const res = await fetch("/api/analytics/summary");
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error("Failed to fetch analytics report summary:", e);
    return null;
  }
}

export async function triggerAdminEmailReport(params: {
  reportType: EmailReportType;
  customActivity?: string;
  customUserName?: string;
  customUserRole?: string;
  customSmtp?: {
    host?: string;
    port?: number;
    user?: string;
    pass?: string;
  };
}): Promise<{
  report?: EmailReportRecord;
  emailReports?: EmailReportRecord[];
  summary?: CategorizedAnalyticsSummary;
} | null> {
  try {
    const res = await fetch("/api/analytics/send-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.report) {
      await syncEmailReportToFirestore(data.report);
    }
    return data;
  } catch (e) {
    console.error("Failed to trigger admin email report:", e);
    return null;
  }
}


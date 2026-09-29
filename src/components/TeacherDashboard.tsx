import React, { useState, useEffect } from "react";
import { ClassStudentProgress, SchoolClass } from "../types";
import {
  fetchDatabaseState,
  createTeacherLessonInDb,
  upsertTeacherStudentInDb,
  manageTeacherClassInDb
} from "../services/heritageDatabase";
import { 
  Users, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Download, 
  Brain,
  Search,
  BookOpen,
  Loader2,
  Plus,
  Edit2,
  Eye,
  Filter,
  ArrowUpDown,
  X,
  Award,
  QrCode,
  CheckSquare,
  BarChart2,
  Settings,
  ShieldCheck,
  Calendar,
  Compass,
  Trophy,
  Trash2
} from "lucide-react";

interface TeacherDashboardProps {
  mockStudents: ClassStudentProgress[];
  classes?: SchoolClass[];
  onClassesChange?: (classes: SchoolClass[]) => void;
  onStudentsListChange?: (students: ClassStudentProgress[]) => void;
  onNavigateTab?: (tab: string) => void;
  currentTeacher?: { name: string; email: string; school?: string };
  onLessonCreated?: (lessonTitle: string, grade: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  mockStudents,
  classes = [],
  onClassesChange,
  onStudentsListChange,
  onNavigateTab,
  currentTeacher,
  onLessonCreated
}) => {
  const [selectedClass, setSelectedClass] = useState<string>("Tất cả");
  const [statusFilter, setStatusFilter] = useState<string>("Tất cả");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortField, setSortField] = useState<"id" | "name" | "score" | "poisCompleted">("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Real Classes list persisted in Database
  const [teacherClasses, setTeacherClasses] = useState<SchoolClass[]>(() =>
    Array.isArray(classes) && classes.length > 0
      ? classes
      : [
          {
            id: "cls-4a",
            name: "Lớp 4A",
            grade: "Khối 4",
            school: "Trường Tiểu học Văn Khê – Xã Mê Linh, TP. Hà Nội",
            teacherId: "usr-tch-001",
            teacherName: currentTeacher?.name || "Cô Nguyễn Thị Lan",
            studentCount: 35,
            avgXp: 245,
            completionRate: 78
          },
          {
            id: "cls-4b",
            name: "Lớp 4B",
            grade: "Khối 4",
            school: "Trường Tiểu học Văn Khê – Xã Mê Linh, TP. Hà Nội",
            teacherId: "usr-tch-001",
            teacherName: currentTeacher?.name || "Cô Nguyễn Thị Lan",
            studentCount: 33,
            avgXp: 210,
            completionRate: 65
          }
        ]
  );
  const [newClassName, setNewClassName] = useState("");
  const [newClassGrade, setNewClassGrade] = useState("Khối 4");

  // Created Lessons List tracked in Real Database
  const [createdLessonsList, setCreatedLessonsList] = useState([
    {
      id: "ls-01",
      title: "Bài 1: Khởi nghĩa Hai Bà Trưng mùa xuân năm 40 SCN & Lời thề Sông Hát",
      grade: "Lớp 4A • Lớp 4B",
      school: "Trường Tiểu học Văn Khê – Xã Mê Linh, TP. Hà Nội",
      participants: 68,
      createdAt: "20/09/2026"
    },
    {
      id: "ls-02",
      title: "Bài 2: Kiến trúc Nghi môn & Tam tòa chính diện Đền Hai Bà Trưng",
      grade: "Lớp 5A • Lớp 5B",
      school: "Trường Tiểu học Văn Khê – Xã Mê Linh, TP. Hà Nội",
      participants: 64,
      createdAt: "23/09/2026"
    },
    {
      id: "ls-03",
      title: "Bài 3: Nghi thức Giao kiệu Độc đáo tại Lễ hội Đền Hai Bà Trưng (Mùng 6 Tháng Giêng)",
      grade: "Khối 4 & Khối 5",
      school: "Trường Tiểu học Hạ Lôi – Xã Mê Linh, TP. Hà Nội",
      participants: 82,
      createdAt: "25/09/2026"
    }
  ]);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonGrade, setNewLessonGrade] = useState("Lớp 4A");

  // Real database state for managing students (Add, Edit)
  const [studentsList, setStudentsList] = useState<ClassStudentProgress[]>(() =>
    Array.isArray(mockStudents) ? mockStudents : []
  );

  // Sync lessons, classes, and students from Real Database on mount
  useEffect(() => {
    let mounted = true;
    fetchDatabaseState().then((dbState) => {
      if (!mounted || !dbState) return;
      if (Array.isArray(dbState.teacherLessons) && dbState.teacherLessons.length > 0) {
        setCreatedLessonsList(dbState.teacherLessons);
      }
      if (Array.isArray(dbState.classes) && dbState.classes.length > 0) {
        setTeacherClasses(dbState.classes);
        if (onClassesChange) onClassesChange(dbState.classes);
      }
      if (Array.isArray(dbState.classStudentProgress) && dbState.classStudentProgress.length > 0) {
        setStudentsList(dbState.classStudentProgress);
        if (onStudentsListChange) onStudentsListChange(dbState.classStudentProgress);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<ClassStudentProgress | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<ClassStudentProgress | null>(null);

  // Form states
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentClass, setNewStudentClass] = useState("Lớp 4A");

  // Teacher Assigned Missions / Tasks State (Giao nhiệm vụ cho lớp)
  const [assignedTasks, setAssignedTasks] = useState<
    {
      id: string;
      title: string;
      targetClass: string;
      xpReward: number;
      dueDate: string;
      completedCount: number;
      totalCount: number;
    }[]
  >(() => {
    try {
      const saved = localStorage.getItem("me_linh_teacher_assignments");
      if (saved) return JSON.parse(saved);
    } catch (_e) {
      // ignore
    }
    return [
      {
        id: "task-01",
        title: "Khám phá 6 Trạm Di tích Đền Hai Bà Trưng & ghi chép Sổ tay Di sản",
        targetClass: "Lớp 4A",
        xpReward: 50,
        dueDate: "30/09/2026",
        completedCount: 28,
        totalCount: 35
      },
      {
        id: "task-02",
        title: "Hoàn thành bài Quiz Lời thề Sông Hát đạt từ 80/100 điểm trở lên",
        targetClass: "Tất cả các Lớp",
        xpReward: 80,
        dueDate: "02/10/2026",
        completedCount: 54,
        totalCount: 68
      }
    ];
  });
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskClass, setNewTaskClass] = useState("Lớp 4A");
  const [newTaskXp, setNewTaskXp] = useState<number>(50);
  const [newTaskDue, setNewTaskDue] = useState("05/10/2026");

  const handleAssignTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const created = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      targetClass: newTaskClass,
      xpReward: Math.max(10, Number(newTaskXp) || 50),
      dueDate: newTaskDue.trim() || "05/10/2026",
      completedCount: 0,
      totalCount: newTaskClass === "Tất cả các Lớp" ? studentsList.length || 68 : 35
    };
    const next = [created, ...assignedTasks];
    setAssignedTasks(next);
    try {
      localStorage.setItem("me_linh_teacher_assignments", JSON.stringify(next));
    } catch (_e) {
      // ignore
    }
    setNewTaskTitle("");
  };

  // Export Student Grades & Progress Report to CSV (Excel compatible with UTF-8 BOM)
  const handleExportReportCSV = () => {
    const headers = [
      "STT",
      "Mã Học Sinh",
      "Họ và Tên",
      "Lớp Học",
      "Điểm XP",
      "Trạm Hoàn Thành",
      "Số Huy Hiệu",
      "Trạng Thái",
      "Truy Cập Gần Nhất"
    ];
    const rows = filteredStudents.map((s, index) => [
      index + 1,
      s.id,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.class}"`,
      s.score,
      `${s.poisCompleted}/${s.totalPois || 6}`,
      s.badgesCount,
      `"${s.status}"`,
      `"${s.lastActive}"`
    ]);
    const csvContent =
      "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Bao_Cao_Ket_Qua_Hoc_Tap_Di_San_Me_Linh_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Lesson Plan Generator State
  const [lessonTopic, setLessonTopic] = useState<string>("Khởi nghĩa Hai Bà Trưng (Năm 40 SCN) & Đền Mê Linh");
  const [lessonGrade, setLessonGrade] = useState<string>("Lớp 4");
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);

  // Filter & Sort Logic
  const filteredStudents = studentsList.filter((s) => {
    const matchClass = selectedClass === "Tất cả" || s.class === selectedClass;
    const matchStatus = statusFilter === "Tất cả" || s.status === statusFilter;
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchClass && matchStatus && matchSearch;
  }).sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    if (typeof aVal === "string") {
      return sortOrder === "asc" ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
    }
    return sortOrder === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  // Section II Dashboard Statistics
  const totalStudents = studentsList.length;
  const activeStudents = studentsList.filter((s) => s.status === "Đang học" || s.status === "Hoàn thành").length;
  const completedStudents = studentsList.filter((s) => s.status === "Hoàn thành").length;
  const totalScore = studentsList.reduce((acc, s) => acc + s.score, 0);
  const avgProgressPct = Math.round(
    (studentsList.reduce((acc, s) => acc + s.poisCompleted, 0) / (totalStudents * 6 || 1)) * 100
  );
  const totalCompletedMissions = studentsList.reduce((acc, s) => acc + s.poisCompleted, 0);
  const totalBadgesEarned = studentsList.reduce((acc, s) => acc + s.badgesCount, 0);

  // Add Student Handler (Persisted in Real Database)
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    const newStudent: ClassStudentProgress = {
      id: `std-${Date.now()}`,
      name: newStudentName.trim(),
      class: newStudentClass,
      poisCompleted: 1,
      totalPois: 6,
      score: 100,
      badgesCount: 1,
      lastActive: "Vừa xong",
      status: "Đang học"
    };
    const updatedList = [newStudent, ...studentsList];
    setStudentsList(updatedList);
    if (onStudentsListChange) onStudentsListChange(updatedList);
    setNewStudentName("");
    setShowAddModal(false);
    await upsertTeacherStudentInDb({
      ...newStudent,
      school: currentTeacher?.school || "Trường Tiểu học Văn Khê – Xã Mê Linh, TP. Hà Nội"
    });
  };

  // Edit Student Handler (Persisted in Real Database)
  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal) return;
    const target = showEditModal;
    const updatedList = studentsList.map((s) => (s.id === target.id ? target : s));
    setStudentsList(updatedList);
    if (onStudentsListChange) onStudentsListChange(updatedList);
    setShowEditModal(null);
    await upsertTeacherStudentInDb({
      ...target,
      school: currentTeacher?.school || "Trường Tiểu học Văn Khê – Xã Mê Linh, TP. Hà Nội"
    });
  };

  // Create Class Handler (Persisted in Real Database)
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    const createdCls: Partial<SchoolClass> = {
      id: `cls-${Date.now()}`,
      name: newClassName.trim(),
      grade: newClassGrade,
      school: currentTeacher?.school || "Trường Tiểu học Văn Khê – Xã Mê Linh, TP. Hà Nội",
      teacherName: currentTeacher?.name || "Cô Nguyễn Thị Lan",
      studentCount: 30,
      avgXp: 150,
      completionRate: 60
    };
    const updatedClasses = await manageTeacherClassInDb({
      action: "create",
      classData: createdCls
    });
    if (updatedClasses) {
      setTeacherClasses(updatedClasses);
      if (onClassesChange) onClassesChange(updatedClasses);
    }
    setNewClassName("");
  };

  const handleDeleteClassItem = async (classId: string) => {
    const updatedClasses = await manageTeacherClassInDb({
      action: "delete",
      classId
    });
    if (updatedClasses) {
      setTeacherClasses(updatedClasses);
      if (onClassesChange) onClassesChange(updatedClasses);
    }
  };

  const handleGenerateLessonPlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const res = await fetch("/api/gemini/lesson-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: lessonGrade,
          topic: lessonTopic,
          duration: "35 phút"
        })
      });
      const data = await res.json();
      const rawPlan = data.lessonPlan || "Không thể tạo giáo án AI lúc này.";
      const cleanPlan = rawPlan
        .replace(/^(\s*)\*\s+/gm, "$1• ")
        .replace(/\*+/g, "")
        .replace(/^(\s*)#{1,6}\s*/gm, "$1")
        .trim();
      setGeneratedPlan(cleanPlan);
    } catch (e) {
      console.error("Lesson plan error", e);
      setGeneratedPlan("Lỗi kết nối máy chủ tạo giáo án.");
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Top Title Banner (Section II: # TRUNG TÂM GIÁO VIÊN) */}
      <div className="bg-[#F8F4E8] p-6 sm:p-8 rounded-3xl border-2 border-[#C9A227] shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2F6F68]/15 border border-[#2F6F68]/30 text-[#2F6F68] text-xs font-bold mb-2">
            <Users className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>PORTAL 02 • CỔNG GIÁO VIÊN (TEACHER PORTAL & PEDAGOGICAL TRACKER)</span>
          </div>
          <h1 className="font-bold text-3xl sm:text-4xl text-[#9E2A2B]">
            # TRUNG TÂM GIÁO VIÊN
          </h1>
          <p className="text-xs sm:text-sm text-[#5A4032] font-semibold mt-1 max-w-2xl">
            Tài khoản: <strong className="text-[#2F6F68]">{currentTeacher?.name || "Cô Nguyễn Thị Lan"}</strong> ({currentTeacher?.email || "lan.teacher@melinh.edu.vn"}) • Đơn vị: <strong className="text-[#8B1E1E]">{currentTeacher?.school || "Trường Tiểu học Văn Khê – Xã Mê Linh, TP. Hà Nội"}</strong>
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-3 rounded-2xl bg-[#2F6F68] hover:bg-[#255752] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 shrink-0 border border-[#C9A227]"
        >
          <Plus className="w-4 h-4 text-[#C9A227]" />
          <span>Thêm Học Sinh Mới</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* TEACHER PORTAL TRACKING CONSOLE                                     */}
      {/* (Tracks: Teacher Accounts, Schools, Created Lessons, Participation) */}
      {/* =================================================================== */}
      <div className="bg-white p-6 rounded-3xl border-2 border-[#2F6F68] shadow-lg space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#F3FAF8] border border-[#2F6F68]/30">
            <div className="text-[10px] font-extrabold uppercase text-[#2F6F68]">
              1. Tài khoản Giáo viên (Teacher Accounts)
            </div>
            <div className="text-xl font-extrabold text-stone-900 mt-1">
              42 Giáo viên Chuyên trách
            </div>
            <div className="text-[11px] text-stone-600 mt-0.5">
              Đang đăng nhập: {currentTeacher?.name || "Cô Nguyễn Thị Lan"}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F3FAF8] border border-[#2F6F68]/30">
            <div className="text-[10px] font-extrabold uppercase text-[#2F6F68]">
              2. Trường học Liên kết (Schools)
            </div>
            <div className="text-xl font-extrabold text-stone-900 mt-1">
              Hệ thống Tiểu học, THCS & THPT
            </div>
            <div className="text-[11px] text-stone-600 mt-0.5 truncate" title="Tiểu học Văn Khê, Tiểu học Mê Linh, Tiểu học Tiền Phong, THCS Mê Linh, THCS Tiền Phong...">
              TH Văn Khê · TH Mê Linh · TH Tiền Phong · THCS Mê Linh · THCS Tiền Phong
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300">
            <div className="text-[10px] font-extrabold uppercase text-[#9A3412]">
              3. Bài giảng Đã tạo (Created Lessons)
            </div>
            <div className="text-xl font-extrabold text-[#9A3412] mt-1">
              {createdLessonsList.length + 11} Bài giảng Di sản Số
            </div>
            <div className="text-[11px] text-stone-600 mt-0.5">
              Tích hợp Bản đồ 6 Trạm & Hỏi đáp AI
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200">
            <div className="text-[10px] font-extrabold uppercase text-[#8B1E1E]">
              4. Học sinh Tham gia (Student Participation)
            </div>
            <div className="text-xl font-extrabold text-[#8B1E1E] mt-1">
              {activeStudents}/{totalStudents} HS lớp ({avgProgressPct}% tiến độ)
            </div>
            <div className="text-[11px] text-stone-600 mt-0.5">
              Tổng cộng 1,245 lượt HS tham gia toàn trường
            </div>
          </div>
        </div>

        {/* Interactive Created Lessons Manager */}
        <div className="border-t border-stone-200 pt-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-sm font-extrabold text-[#2F6F68] uppercase flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#C9A227]" />
              <span>Danh mục Bài giảng Di sản Số Giáo viên Đã Tạo ({createdLessonsList.length})</span>
            </h3>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!newLessonTitle.trim()) return;
              const titleText = newLessonTitle.trim();
              setNewLessonTitle("");
              const dbRes = await createTeacherLessonInDb({
                title: titleText,
                grade: newLessonGrade,
                school:
                  currentTeacher?.school ||
                  "Trường Tiểu học Văn Khê – Xã Mê Linh, TP. Hà Nội",
                teacherName: currentTeacher?.name || "Cô Nguyễn Thị Lan",
                teacherEmail: currentTeacher?.email
              });
              if (dbRes?.teacherLessons) {
                setCreatedLessonsList(dbRes.teacherLessons);
              } else {
                const created = {
                  id: `ls-${Date.now()}`,
                  title: titleText,
                  grade: newLessonGrade,
                  school:
                    currentTeacher?.school ||
                    "Trường Tiểu học Văn Khê – Xã Mê Linh, TP. Hà Nội",
                  participants: 35,
                  createdAt: new Date().toLocaleDateString("vi-VN")
                };
                setCreatedLessonsList([created, ...createdLessonsList]);
              }
              if (onLessonCreated) onLessonCreated(titleText, newLessonGrade);
            }}
            className="flex flex-col sm:flex-row gap-2.5"
          >
            <input
              type="text"
              value={newLessonTitle}
              onChange={(e) => setNewLessonTitle(e.target.value)}
              placeholder="Nhập tên Bài giảng Di sản mới (VD: Chuyên đề Lời thề Hai Bà Trưng năm 40 SCN)..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-semibold outline-none focus:border-[#2F6F68]"
            />
            <select
              value={newLessonGrade}
              onChange={(e) => setNewLessonGrade(e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 bg-white"
            >
              <option value="Khối 1 - 3 (Tiểu học)">Khối 1 - 3 (Tiểu học)</option>
              <option value="Khối 4 - 5 (Tiểu học)">Khối 4 - 5 (Tiểu học)</option>
              <option value="Khối 6 (THCS)">Khối 6 (THCS)</option>
              <option value="Khối 7 (THCS)">Khối 7 (THCS)</option>
              <option value="Khối 8 (THCS)">Khối 8 (THCS)</option>
              <option value="Khối 9 (THCS)">Khối 9 (THCS)</option>
              <option value="Khối THPT">Khối THPT</option>
              <option value="Tất cả các Khối lớp">Tất cả các Khối lớp</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#2F6F68] hover:bg-[#1F524C] text-white font-extrabold text-xs border border-[#C9A227] flex items-center justify-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4 text-[#C9A227]" />
              <span>Tạo Bài Giảng Mới</span>
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {createdLessonsList.map((ls) => (
              <div
                key={ls.id}
                className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200 flex flex-col justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#2F6F68]">
                    <span>{ls.grade}</span>
                    <span>{ls.createdAt}</span>
                  </div>
                  <div className="font-extrabold text-stone-900 mt-1 leading-snug">
                    {ls.title}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-stone-200/70 text-[11px]">
                  <span className="text-stone-600 truncate max-w-[160px]">{ls.school}</span>
                  <span className="font-extrabold text-emerald-700">
                    👥 {ls.participants} HS tham gia
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Real Database School Classes Manager */}
          <div className="border-t border-stone-200 pt-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-extrabold text-[#8B1E1E] uppercase flex items-center gap-2">
                <Users className="w-4 h-4 text-[#C9A227]" />
                <span>Quản lý Lớp học Di sản trên Cơ sở Dữ liệu ({teacherClasses.length} lớp)</span>
              </h3>
            </div>

            <form onSubmit={handleCreateClass} className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="Nhập tên lớp mới (VD: Lớp 5C - Chuyên đề Lịch sử Mê Linh)..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-semibold outline-none focus:border-[#8B1E1E]"
              />
              <select
                value={newClassGrade}
                onChange={(e) => setNewClassGrade(e.target.value)}
                className="px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 bg-white"
              >
                <option value="Khối 1">Khối 1 (Tiểu học)</option>
                <option value="Khối 2">Khối 2 (Tiểu học)</option>
                <option value="Khối 3">Khối 3 (Tiểu học)</option>
                <option value="Khối 4">Khối 4 (Tiểu học)</option>
                <option value="Khối 5">Khối 5 (Tiểu học)</option>
                <option value="Khối 6 THCS">Khối 6 (THCS)</option>
                <option value="Khối 7 THCS">Khối 7 (THCS)</option>
                <option value="Khối 8 THCS">Khối 8 (THCS)</option>
                <option value="Khối 9 THCS">Khối 9 (THCS)</option>
                <option value="Khối THPT">Khối THPT</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#8B1E1E] hover:bg-[#701616] text-white font-extrabold text-xs border border-[#C9A227] flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#C9A227]" />
                <span>Tạo Lớp Học Mới</span>
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {teacherClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#C9A227]/50 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-extrabold text-[#8B1E1E] text-sm">
                      {cls.name} <span className="text-[11px] text-stone-500">({cls.grade})</span>
                    </div>
                    <div className="text-[11px] text-stone-600 font-semibold mt-0.5">
                      GV: {cls.teacherName || currentTeacher?.name || "Cô Nguyễn Thị Lan"} • {cls.studentCount} HS
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteClassItem(cls.id)}
                    className="p-1.5 rounded-lg bg-stone-200/70 hover:bg-rose-100 text-stone-600 hover:text-rose-700 cursor-pointer"
                    title="Xóa lớp học"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Giao Nhiệm Vụ Học Tập Di Sản Cho Lớp (Task Assignment Module) */}
          <div className="border-t border-stone-200 pt-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-extrabold text-[#2F6F68] uppercase flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#C9A227]" />
                <span>Giao Nhiệm Vụ Học Tập & Trải Nghiệm Cho Lớp ({assignedTasks.length} nhiệm vụ)</span>
              </h3>
            </div>

            <form onSubmit={handleAssignTask} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Nhập nội dung nhiệm vụ giao cho học sinh (VD: Xem video bài học & hoàn thành 6 trạm)..."
                className="sm:col-span-5 px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-semibold outline-none focus:border-[#2F6F68]"
              />
              <select
                value={newTaskClass}
                onChange={(e) => setNewTaskClass(e.target.value)}
                className="sm:col-span-2 px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 bg-white"
              >
                <option value="Tất cả các Lớp">Tất cả các Lớp</option>
                {teacherClasses.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={10}
                max={500}
                step={10}
                value={newTaskXp}
                onChange={(e) => setNewTaskXp(Number(e.target.value) || 50)}
                placeholder="Điểm XP"
                className="sm:col-span-2 px-3 py-2 rounded-xl border border-stone-300 text-xs font-extrabold text-[#8B1E1E] bg-white"
              />
              <input
                type="text"
                value={newTaskDue}
                onChange={(e) => setNewTaskDue(e.target.value)}
                placeholder="Hạn nộp (VD: 05/10/2026)"
                className="sm:col-span-3 px-3 py-2 rounded-xl bg-[#2F6F68] hover:bg-[#1F524C] text-white font-extrabold text-xs border border-[#C9A227] hidden"
              />
              <button
                type="submit"
                className="sm:col-span-3 px-4 py-2 rounded-xl bg-[#2F6F68] hover:bg-[#1F524C] text-white font-extrabold text-xs border border-[#C9A227] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#C9A227]" />
                <span>Giao Nhiệm Vụ (+{newTaskXp} XP)</span>
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {assignedTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-2xl bg-[#F3FAF8] border border-[#2F6F68]/30 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="font-extrabold text-stone-900">{task.title}</div>
                    <div className="text-[11px] text-stone-600 font-semibold">
                      Đối tượng: <strong className="text-[#2F6F68]">{task.targetClass}</strong> · Hạn:{" "}
                      {task.dueDate} · Thưởng:{" "}
                      <strong className="text-[#8B1E1E]">+{task.xpReward} XP</strong>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-extrabold text-[#2F6F68]">
                      {task.completedCount}/{task.totalCount} HS
                    </div>
                    <div className="text-[10px] text-stone-500">Đã hoàn thành</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 7 Section II Dashboard Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* 1. Tổng số học sinh */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#C9A227]/40 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-bold text-[#5A4032] flex items-center justify-between">
            <span>Tổng học sinh</span>
            <Users className="w-3.5 h-3.5 text-[#2F6F68]" />
          </div>
          <div className="text-xl font-bold text-[#242424] mt-1">{totalStudents}</div>
          <div className="text-[10px] text-stone-500 font-semibold">Tất cả các lớp</div>
        </div>

        {/* 2. Số học sinh đang tham gia */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#C9A227]/40 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-bold text-[#5A4032] flex items-center justify-between">
            <span>Đang tham gia</span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-amber-700 mt-1">{activeStudents}</div>
          <div className="text-[10px] text-stone-500 font-semibold">Đang hoạt động</div>
        </div>

        {/* 3. Số học sinh đã hoàn thành */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#C9A227]/40 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-bold text-[#5A4032] flex items-center justify-between">
            <span>Đã hoàn thành</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-700 mt-1">{completedStudents}</div>
          <div className="text-[10px] text-stone-500 font-semibold">Hoàn thành 6 trạm</div>
        </div>

        {/* 4. Tổng điểm */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#C9A227]/40 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-bold text-[#5A4032] flex items-center justify-between">
            <span>Tổng điểm XP</span>
            <Sparkles className="w-3.5 h-3.5 text-[#C9A227] fill-[#C9A227]" />
          </div>
          <div className="text-xl font-bold text-[#9E2A2B] mt-1">{totalScore}</div>
          <div className="text-[10px] text-stone-500 font-semibold">Toàn bộ lớp</div>
        </div>

        {/* 5. Tiến độ lớp */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#C9A227]/40 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-bold text-[#5A4032] flex items-center justify-between">
            <span>Tiến độ lớp</span>
            <BarChart2 className="w-3.5 h-3.5 text-[#2F6F68]" />
          </div>
          <div className="text-xl font-bold text-[#2F6F68] mt-1">{avgProgressPct}%</div>
          <div className="text-[10px] text-stone-500 font-semibold">Trung bình</div>
        </div>

        {/* 6. Số nhiệm vụ đã hoàn thành */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#C9A227]/40 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-bold text-[#5A4032] flex items-center justify-between">
            <span>Nhiệm vụ xong</span>
            <CheckSquare className="w-3.5 h-3.5 text-[#9E2A2B]" />
          </div>
          <div className="text-xl font-bold text-[#9E2A2B] mt-1">{totalCompletedMissions}</div>
          <div className="text-[10px] text-stone-500 font-semibold">Lượt nhiệm vụ</div>
        </div>

        {/* 7. Số huy hiệu đã đạt */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#C9A227]/40 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="text-[11px] font-bold text-[#5A4032] flex items-center justify-between">
            <span>Huy hiệu đạt</span>
            <Award className="w-3.5 h-3.5 text-[#C9A227]" />
          </div>
          <div className="text-xl font-bold text-[#C9A227] mt-1">{totalBadgesEarned}</div>
          <div className="text-[10px] text-stone-500 font-semibold">Huy hiệu cấp</div>
        </div>
      </div>

      {/* Section III: GIÁO VIÊN QUẢN LÝ HỌC SINH */}
      <div className="bg-white p-6 rounded-3xl border-2 border-[#C9A227] shadow-lg space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <h2 className="font-bold text-xl text-[#9E2A2B] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#2F6F68]" />
              <span>DANH SÁCH QUẢN LÝ HỌC SINH</span>
            </h2>
            <p className="text-xs text-[#5A4032] font-semibold">
              Xem chi tiết tiến trình, số điểm XP, huy hiệu đạt được và cập nhật thông tin học sinh
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-52">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm họ tên học sinh..."
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-[#9E2A2B]"
              />
            </div>

            {/* Class Filter */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="text-xs p-2 rounded-xl border border-stone-300 font-bold bg-[#F8F4E8] text-[#5A4032]"
            >
              <option value="Tất cả">Tất cả các Lớp</option>
              {Array.from(
                new Set([
                  "Lớp 4A",
                  "Lớp 5B",
                  "Lớp 6A",
                  "Lớp 7A",
                  "Lớp 8A",
                  "Lớp 9A",
                  ...studentsList.map((s) => s.class)
                ])
              ).map((clsName) => (
                <option key={clsName} value={clsName}>
                  {clsName}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs p-2 rounded-xl border border-stone-300 font-bold bg-[#F8F4E8] text-[#5A4032]"
            >
              <option value="Tất cả">Tất cả trạng thái</option>
              <option value="Hoàn thành">Hoàn thành</option>
              <option value="Đang học">Đang học</option>
              <option value="Cần cố gắng">Cần cố gắng</option>
            </select>

            {/* Export CSV Report Button */}
            <button
              type="button"
              onClick={handleExportReportCSV}
              className="px-3.5 py-2 rounded-xl bg-[#8B1E1E] hover:bg-[#6E1414] text-white font-extrabold text-xs border border-[#C9A227] shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>Xuất Báo Cáo CSV (Excel)</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-[#2F6F68] hover:bg-[#1F524C] text-white font-extrabold text-xs border border-[#C9A227] shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>In Báo Cáo Lớp</span>
            </button>
          </div>
        </div>

        {/* Section III Table: STT | HỌ VÀ TÊN | XP | TIẾN ĐỘ | NHIỆM VỤ | HUY HIỆU | TRẠNG THÁI */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8F4E8] text-[#5A4032] font-bold border-b border-[#C9A227]/40">
                <th className="p-3 w-12 text-center">STT</th>
                <th 
                  className="p-3 cursor-pointer hover:text-[#9E2A2B]"
                  onClick={() => {
                    setSortField("name");
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>HỌ VÀ TÊN</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3">LỚP</th>
                <th 
                  className="p-3 cursor-pointer hover:text-[#9E2A2B]"
                  onClick={() => {
                    setSortField("score");
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>XP (ĐIỂM)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="p-3 cursor-pointer hover:text-[#9E2A2B]"
                  onClick={() => {
                    setSortField("poisCompleted");
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>TIẾN ĐỘ</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3">NHIỆM VỤ</th>
                <th className="p-3">HUY HIỆU</th>
                <th className="p-3">TRẠNG THÁI</th>
                <th className="p-3 text-center">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 font-semibold">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-stone-500 font-normal">
                    Không tìm thấy học sinh nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-[#F8F4E8]/60 transition-colors">
                    <td className="p-3 text-center text-stone-500">{idx + 1}</td>
                    <td className="p-3 font-bold text-[#242424]">{student.name}</td>
                    <td className="p-3 text-[#5A4032]">{student.class}</td>
                    <td className="p-3 font-mono font-bold text-[#2F6F68]">⭐ {student.score} XP</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-stone-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-[#2F6F68] h-full rounded-full"
                            style={{ width: `${(student.poisCompleted / 6) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-[11px] font-bold">{student.poisCompleted}/6 Trạm</span>
                      </div>
                    </td>
                    <td className="p-3 text-[#9E2A2B] font-bold">{student.poisCompleted} Đã làm</td>
                    <td className="p-3 text-[#C9A227] font-bold">🏆 {student.badgesCount} Cấp</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                        student.status === "Hoàn thành"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : student.status === "Đang học"
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : "bg-rose-100 text-rose-800 border border-rose-300"
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setShowDetailModal(student)}
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setShowEditModal(student)}
                          className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                          title="Sửa thông tin"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Lesson Plan Generator for Teachers */}
      <div className="bg-[#F8F4E8] p-6 sm:p-8 rounded-3xl border-2 border-[#2F6F68] shadow-md space-y-4">
        <div className="flex items-center gap-3 border-b border-[#2F6F68]/30 pb-3">
          <div className="w-10 h-10 rounded-2xl bg-[#2F6F68] text-white flex items-center justify-center font-bold shadow">
            <Brain className="w-5 h-5 text-[#C9A227]" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-[#2F6F68]">
              SOẠN GIÁO ÁN TÍCH HỢP DI SẢN BẰNG AI (GEMINI)
            </h3>
            <p className="text-xs text-[#5A4032] font-semibold">
              Tự động thiết kế Kế hoạch bài dạy Lịch sử & Giáo dục địa phương cho Tiểu học, THCS & THPT chuẩn Bộ GD&ĐT
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-[#5A4032] block mb-1">Tên bài học di sản:</label>
            <input
              type="text"
              value={lessonTopic}
              onChange={(e) => setLessonTopic(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-[#C9A227]/60 focus:outline-none bg-white font-semibold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#5A4032] block mb-1">Khối lớp (Tiểu học / THCS / THPT):</label>
            <select
              value={lessonGrade}
              onChange={(e) => setLessonGrade(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-[#C9A227]/60 focus:outline-none bg-white font-bold"
            >
              <option value="Khối 1 - 3 (Tiểu học)">Khối 1 - 3 (Tiểu học)</option>
              <option value="Lớp 4 (Tiểu học)">Lớp 4 (Tiểu học)</option>
              <option value="Lớp 5 (Tiểu học)">Lớp 5 (Tiểu học)</option>
              <option value="Lớp 6 (THCS)">Lớp 6 (THCS)</option>
              <option value="Lớp 7 (THCS)">Lớp 7 (THCS)</option>
              <option value="Lớp 8 (THCS)">Lớp 8 (THCS)</option>
              <option value="Lớp 9 (THCS)">Lớp 9 (THCS)</option>
              <option value="Cấp THPT (Lớp 10 - 12)">Cấp THPT (Lớp 10 - 12)</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerateLessonPlan}
          disabled={isGeneratingPlan}
          className="w-full py-3 bg-[#2F6F68] hover:bg-[#23534e] text-white rounded-2xl font-bold text-xs shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2 border border-[#C9A227]"
        >
          {isGeneratingPlan ? <Loader2 className="w-4 h-4 animate-spin text-[#C9A227]" /> : <Sparkles className="w-4 h-4 text-[#C9A227]" />}
          <span>{isGeneratingPlan ? "Đang soạn giáo án AI..." : "Tạo Kế Hoạch Bài Dạy Ngay"}</span>
        </button>

        {generatedPlan && (
          <div className="mt-4 p-5 bg-white rounded-2xl border border-[#2F6F68] text-xs text-stone-800 space-y-3 leading-relaxed shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <span className="font-bold text-[#2F6F68]">KẾ HOẠCH BÀI DẠY TÍCH HỢP DI SẢN MÊ LINH (SOẠN BẰNG GEMINI AI)</span>
              <button 
                onClick={() => window.print()}
                className="text-[11px] font-bold text-[#2F6F68] flex items-center gap-1 hover:underline"
              >
                <Download className="w-3.5 h-3.5" /> In giáo án
              </button>
            </div>
            <div className="whitespace-pre-line font-serif text-sm leading-relaxed">{generatedPlan}</div>
          </div>
        )}
      </div>

      {/* MODAL 1: THÊM HỌC SINH MỚI */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#F8F4E8] rounded-3xl border-2 border-[#C9A227] shadow-2xl p-6 max-w-md w-full space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#C9A227]/30 pb-3">
              <h3 className="font-bold text-lg text-[#9E2A2B] flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#2F6F68]" /> Thêm Học Sinh Mới
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-stone-500 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#5A4032] block mb-1">Họ và Tên Học Sinh:</label>
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Ví dụ: Trần Hoàng Anh"
                  className="w-full text-xs p-3 rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-[#9E2A2B] font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#5A4032] block mb-1">Lớp / Khối Học:</label>
                <input
                  type="text"
                  list="teacher-student-class-list"
                  value={newStudentClass}
                  onChange={(e) => setNewStudentClass(e.target.value)}
                  placeholder="VD: Lớp 4A, Lớp 6A, Lớp 8B, Lớp 9A..."
                  className="w-full text-xs p-3 rounded-xl border border-stone-300 bg-white font-bold"
                />
                <datalist id="teacher-student-class-list">
                  <option value="Lớp 1A" />
                  <option value="Lớp 2A" />
                  <option value="Lớp 3A" />
                  <option value="Lớp 4A" />
                  <option value="Lớp 5A" />
                  <option value="Lớp 6A" />
                  <option value="Lớp 7A" />
                  <option value="Lớp 8A" />
                  <option value="Lớp 9A" />
                </datalist>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2F6F68] text-white font-bold text-xs shadow-xs hover:bg-[#23534e]"
                >
                  Lưu Học Sinh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SỬA THÔNG TIN HỌC SINH */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#F8F4E8] rounded-3xl border-2 border-[#C9A227] shadow-2xl p-6 max-w-md w-full space-y-5">
            <div className="flex items-center justify-between border-b border-[#C9A227]/30 pb-3">
              <h3 className="font-bold text-lg text-[#9E2A2B] flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-600" /> Sửa Thông Tin Học Sinh
              </h3>
              <button onClick={() => setShowEditModal(null)} className="text-stone-500 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditStudent} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#5A4032] block mb-1">Họ và Tên:</label>
                <input
                  type="text"
                  value={showEditModal.name}
                  onChange={(e) => setShowEditModal({ ...showEditModal, name: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-stone-300 bg-white font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#5A4032] block mb-1">Lớp:</label>
                  <input
                    type="text"
                    list="teacher-student-class-list"
                    value={showEditModal.class}
                    onChange={(e) => setShowEditModal({ ...showEditModal, class: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#5A4032] block mb-1">Trạng thái:</label>
                  <select
                    value={showEditModal.status}
                    onChange={(e) => setShowEditModal({ ...showEditModal, status: e.target.value as any })}
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 bg-white font-bold"
                  >
                    <option value="Đang học">Đang học</option>
                    <option value="Hoàn thành">Hoàn thành</option>
                    <option value="Cần cố gắng">Cần cố gắng</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#9E2A2B] text-white font-bold text-xs shadow-xs hover:bg-[#7A1F20]"
                >
                  Cập Nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: XEM CHI TIẾT LỊCH SỬ HỌC SINH */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-[#C9A227] shadow-2xl p-6 max-w-lg w-full space-y-5">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#9E2A2B] text-white font-bold text-sm flex items-center justify-center">
                  🎓
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#9E2A2B]">{showDetailModal.name}</h3>
                  <p className="text-xs text-[#5A4032] font-semibold">{showDetailModal.class} • Trường Tiểu học Văn Khê</p>
                </div>
              </div>
              <button onClick={() => setShowDetailModal(null)} className="text-stone-500 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-[#F8F4E8] p-3 rounded-2xl border border-[#C9A227]/40">
                <div className="text-xs font-bold text-[#5A4032]">ĐIỂM XP</div>
                <div className="text-lg font-bold text-[#2F6F68]">⭐ {showDetailModal.score}</div>
              </div>
              <div className="bg-[#F8F4E8] p-3 rounded-2xl border border-[#C9A227]/40">
                <div className="text-xs font-bold text-[#5A4032]">TRẠM XONG</div>
                <div className="text-lg font-bold text-[#9E2A2B]">{showDetailModal.poisCompleted}/6</div>
              </div>
              <div className="bg-[#F8F4E8] p-3 rounded-2xl border border-[#C9A227]/40">
                <div className="text-xs font-bold text-[#5A4032]">HUY HIỆU</div>
                <div className="text-lg font-bold text-[#C9A227]">🏆 {showDetailModal.badgesCount}</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-xs text-[#242424]">LỊCH SỬ HOẠT ĐỘNG GẦN NHẤT:</h4>
              <div className="bg-[#F8F4E8] p-3 rounded-2xl text-xs space-y-2 border border-[#C9A227]/30 font-semibold">
                <div className="flex items-center justify-between border-b border-stone-200 pb-1.5">
                  <span>Khám phá Cổng Tam Quan & Thủy Đình</span>
                  <span className="text-[#2F6F68] font-bold">+30 XP</span>
                </div>
                <div className="flex items-center justify-between border-b border-stone-200 pb-1.5">
                  <span>Hoàn thành Quiz Quest Lời thề Hát Môn</span>
                  <span className="text-[#2F6F68] font-bold">+50 XP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tô màu sáng tạo Voi Chiến Mê Linh</span>
                  <span className="text-[#2F6F68] font-bold">+30 XP</span>
                </div>
              </div>
            </div>

            <div className="text-right pt-2 border-t border-stone-200">
              <button
                onClick={() => setShowDetailModal(null)}
                className="px-5 py-2 rounded-xl bg-[#2F6F68] text-white font-bold text-xs shadow-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

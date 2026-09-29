import React, { createContext, useContext, useState, useEffect } from "react";
import viLocale from "../locales/vi.json";
import enLocale from "../locales/en.json";

export type Language = "vi" | "en";

export const translations = {
  vi: {
    ...viLocale,
    // Extended keys for backward compatibility across components
    app_subtitle_en: "Me Linh Digital Heritage Ecosystem",
    app_header_tag: "HỆ SINH THÁI SỐ DI SẢN MÊ LINH • TRƯỜNG TIỂU HỌC VĂN KHÊ",
    portal_explore_title: "KHÁM PHÁ DI SẢN",
    portal_explore_subtitle: "Explore Heritage",
    portal_explore_features: "Bản đồ số • Video • 3D • QR",
    portal_student_title: "CỔNG HỌC SINH",
    portal_student_sub: "Student Portal",
    portal_teacher_title: "CỔNG GIÁO VIÊN",
    portal_teacher_sub: "Teacher Portal",
    portal_admin_title: "QUẢN TRỊ VIÊN",
    portal_admin_sub: "Administrator",
    portal_login_btn: "Đăng nhập",
    portal_quick_ai: "Trợ lý AI di sản",
    portal_quick_map: "Bản đồ số",
    portal_quick_game: "Nhiệm vụ học tập",
    portal_quick_achievement: "Huy hiệu",
    portal_quick_museum: "Bảo tàng số",
    login_portal_title: "CỔNG ĐĂNG NHẬP HỆ SINH THÁI DI SẢN",
    login_title: "MÊ LINH HERITAGE",
    login_subtitle: "Hệ sinh thái số Di sản Mê Linh • Trường Tiểu học Văn Khê",
    login_tab_login: "Đăng nhập",
    login_tab_register_teacher: "Đăng ký Giáo viên",
    login_tab_student: "Cổng học sinh",
    login_tab_teacher: "Cổng giáo viên",
    login_tab_admin: "Quản trị viên",
    login_email_label: "EMAIL / TÀI KHOẢN",
    login_email_placeholder: "Nhập email tài khoản của bạn...",
    login_password_label: "MẬT KHẨU",
    login_password_placeholder: "Nhập mật khẩu...",
    login_forgot_password: "Quên mật khẩu?",
    login_authenticating: "ĐANG XÁC THỰC...",
    login_btn_submit: "Đăng nhập",
    login_no_account_prompt: "Giáo viên chưa có tài khoản? Đăng ký tại đây",
    login_quick_demo: "Đăng nhập nhanh tài khoản mẫu",
    hero_title: "MÊ LINH HERITAGE",
    hero_slogan: "\"Khám phá di sản bằng công nghệ - Học lịch sử bằng trải nghiệm.\"",
    hero_desc: "Chào mừng em đến với Hệ sinh thái số Di sản Mê Linh - Quần thể Di tích Quốc gia Đặc biệt Đền Hai Bà Trưng.",
    btn_start_journey: "Bắt đầu khám phá",
    btn_explore_ai_map: "Bản đồ số",
    ai_assistant_card_title: "🤖 Trợ lý AI di sản",
    ai_assistant_card_greeting: "\"Xin chào! Hôm nay bạn muốn khám phá di tích nào?\"",
    btn_chat_now: "Trò chuyện",
    stats_overview_title: "TỔNG QUAN HỆ SINH THÁI DI SẢN SỐ",
    stats_map: "Bản đồ số",
    stats_map_val: "6 Trạm",
    stats_relics: "Di tích & Cổ vật",
    stats_relics_val: "100+",
    stats_games: "Nhiệm vụ học tập",
    stats_games_val: "4 Game",
    stats_ai: "Trợ lý AI di sản",
    stats_ai_val: "24/7",
    stats_badges: "Huy hiệu",
    stats_progress: "Tiến độ học tập",
    progress_title: "HỒ SƠ HỌC TẬP DÀNH CHO HỌC SINH",
    progress_subtitle: "🎓 Tiến Độ Khám Phá Của Em:",
    progress_level_title: "Danh hiệu:",
    progress_completed: "Đã hoàn thành",
    progress_badges_unlocked: "Huy hiệu đạt được:",
    btn_view_passport: "Xem Huy hiệu",
    journey_title: "HÀNH TRÌNH KHÁM PHÁ DI SẢN (5 BƯỚC)",
    journey_subtitle: "Thực hiện từng bước trải nghiệm để mở khóa Huy hiệu Sứ giả Di sản Mê Linh",
    step_1_title: "Khởi động",
    step_1_desc: "Đăng nhập & báo danh tài khoản Cổng học sinh",
    step_2_title: "Khám phá di sản",
    step_2_desc: "Trải nghiệm Bản đồ số & 6 Trạm di tích",
    step_3_title: "Tìm hiểu",
    step_3_desc: "Tìm hiểu kiến thức lịch sử & câu chuyện di sản",
    step_4_title: "Nhiệm vụ học tập",
    step_4_desc: "Chinh phục Quiz & Tô màu Trống đồng",
    step_5_title: "Chinh phục",
    step_5_desc: "Nhận Điểm XP & Huy hiệu Sứ giả",
    features_title: "TÍNH NĂNG NỔI BẬT CỦA BẢO TÀNG SỐ",
    f_heritage_explore: "Khám phá di sản",
    f_heritage_explore_desc: "Chi tiết 6 Trạm di tích tiêu biểu tại Đền Hai Bà Trưng",
    f_ai_map: "Bản đồ số",
    f_ai_map_desc: "Sơ đồ tương tác 2D/3D tích hợp tọa độ định vị",
    f_ai_video: "Video Tư Liệu Di Sản",
    f_ai_video_desc: "Phim tư liệu hoạt họa lịch sử chân thực",
    f_games: "Nhiệm vụ học tập",
    f_games_desc: "Đấu trí Quiz & Tô màu Voi Chiến Mê Linh",
    f_vr: "Tham quan 3D",
    f_vr_desc: "Tham quan Chính điện thờ Hai Bà Trưng & khuôn viên di tích trực tuyến",
    f_qr: "QR Code Di tích",
    f_qr_desc: "Quét mã QR tại điểm di tích để tra cứu thông tin tức thì",
    f_library: "Kho tư liệu Hán Nôm",
    f_library_desc: "Tra cứu Trống đồng Mê Linh & 28 Đạo sắc phong",
    f_museum: "Bảo tàng số",
    f_museum_desc: "Đối thoại thông minh cùng Trợ lý AI di sản",
    btn_experience_now: "Bắt đầu khám phá",
    map_preview_title: "🗺️ BẢO TÀNG SỐ & BẢN ĐỒ SỐ ĐỀN HAI BÀ TRƯNG",
    map_preview_location: "Thôn Hạ Lôi, xã Mê Linh, thành phố Hà Nội",
    btn_open_detailed_map: "Mở Bản đồ số Chi Tiết",
    map_stations_list: "1. Nghi môn ngoại - Cổng Tam Quan • 2. Nhà khách và không gian đón tiếp • 3. Chính điện thờ Hai Bà Trưng • 4. Khu thờ thân phụ, thân mẫu • 5. Khu thờ các tướng lĩnh • 6. Hồ Bán Nguyệt",
    btn_enter_interactive_map: "VÀO BẢN ĐỒ SỐ",
    games_title: "NHIỆM VỤ HỌC TẬP & TRÒ CHƠI DI SẢN",
    game_puzzle: "🧩 Ghép Hình Di Tích",
    game_puzzle_desc: "Ghép đúng bức ảnh Nghi môn ngoại & Chính điện thờ Hai Bà Trưng",
    game_quiz: "❓ Đố Vui Quiz",
    game_quiz_desc: "Trả lời câu hỏi trắc nghiệm nhận +100 Điểm XP",
    game_crossword: "📝 Ô Chữ Lịch Sử",
    game_crossword_desc: "Giải mã các từ khóa về Khởi nghĩa năm 40 SCN",
    game_color: "🎨 Tô Màu Voi Chiến",
    game_color_desc: "Sáng tạo sắc màu Trống đồng & Tượng Voi Chiến",
    btn_play_now: "Chơi Ngay",
    videos_title: "THƯỚC PHIM TƯ LIỆU DI SẢN MÊ LINH",
    video_1_title: "🎬 Phim Hoạt Họa Lịch Sử: Tiếng Trống Hội Mê Linh Năm 40 SCN",
    video_1_desc: "Thời lượng: 03:45 • Phim tư liệu lịch sử trực quan dành cho học sinh",
    video_2_title: "📜 Tư Liệu Lịch Sử: Giải Mã 28 Đạo Sắc Phong Cổ",
    video_2_desc: "Thời lượng: 04:20 • Lưu giữ tại Bảo tàng số Mê Linh"
  },
  en: {
    ...enLocale,
    app_subtitle_en: "Me Linh Digital Heritage Ecosystem",
    app_header_tag: "ME LINH DIGITAL HERITAGE ECOSYSTEM • VAN KHE PRIMARY SCHOOL",
    portal_explore_title: "EXPLORE HERITAGE",
    portal_explore_subtitle: "Explore Heritage",
    portal_explore_features: "Digital Map • Video • 3D Experience • QR",
    portal_student_title: "STUDENT PORTAL",
    portal_student_sub: "Student Portal",
    portal_teacher_title: "TEACHER PORTAL",
    portal_teacher_sub: "Teacher Portal",
    portal_admin_title: "ADMINISTRATOR",
    portal_admin_sub: "Administrator",
    portal_login_btn: "Sign In",
    portal_quick_ai: "AI Heritage Assistant",
    portal_quick_map: "Digital Map",
    portal_quick_game: "Learning Missions",
    portal_quick_achievement: "Badges",
    portal_quick_museum: "Digital Museum",
    login_portal_title: "HERITAGE ECOSYSTEM SIGN IN PORTAL",
    login_title: "ME LINH HERITAGE",
    login_subtitle: "Me Linh Digital Heritage Ecosystem • Van Khe Primary School",
    login_tab_login: "Sign In",
    login_tab_register_teacher: "Teacher Registration",
    login_tab_student: "Student Portal",
    login_tab_teacher: "Teacher Portal",
    login_tab_admin: "Administrator",
    login_email_label: "EMAIL / ACCOUNT",
    login_email_placeholder: "Enter your account email...",
    login_password_label: "PASSWORD",
    login_password_placeholder: "Enter password...",
    login_forgot_password: "Forgot password?",
    login_authenticating: "AUTHENTICATING...",
    login_btn_submit: "Sign In",
    login_no_account_prompt: "New teacher? Register an account here",
    login_quick_demo: "Quick sign in with demo account",
    hero_title: "ME LINH HERITAGE",
    hero_slogan: "\"Discover heritage through technology - Learn history through experience.\"",
    hero_desc: "Welcome to the Me Linh Digital Heritage Ecosystem - Hai Ba Trung Temple Special National Relic.",
    btn_start_journey: "Start Exploring",
    btn_explore_ai_map: "Digital Map",
    ai_assistant_card_title: "🤖 AI Heritage Assistant",
    ai_assistant_card_greeting: "\"Hello! Which historic relic would you like to explore today?\"",
    btn_chat_now: "Chat Now",
    stats_overview_title: "DIGITAL HERITAGE ECOSYSTEM OVERVIEW",
    stats_map: "Digital Map",
    stats_map_val: "6 Stations",
    stats_relics: "Relics & Artifacts",
    stats_relics_val: "100+",
    stats_games: "Learning Missions",
    stats_games_val: "4 Games",
    stats_ai: "AI Heritage Assistant",
    stats_ai_val: "24/7",
    stats_badges: "Badges",
    stats_progress: "Learning Progress",
    progress_title: "STUDENT LEARNING PROFILE",
    progress_subtitle: "🎓 Your Exploration Progress:",
    progress_level_title: "Title:",
    progress_completed: "Completed",
    progress_badges_unlocked: "Badges Unlocked:",
    btn_view_passport: "View Badges",
    journey_title: "HERITAGE EXPLORATION JOURNEY (5 STEPS)",
    journey_subtitle: "Complete each step to unlock the Me Linh Heritage Ambassador Badge",
    step_1_title: "Start",
    step_1_desc: "Sign in & verify Student Portal account",
    step_2_title: "Explore Heritage",
    step_2_desc: "Experience Digital Map & 6 Relic Stations",
    step_3_title: "Discover",
    step_3_desc: "Explore historical knowledge & heritage stories",
    step_4_title: "Learning Missions",
    step_4_desc: "Conquer Quiz Quest & Bronze Drum Coloring",
    step_5_title: "Complete Journey",
    step_5_desc: "Earn XP Points & Ambassador Badges",
    features_title: "DIGITAL MUSEUM HIGHLIGHTS",
    f_heritage_explore: "Explore Heritage",
    f_heritage_explore_desc: "Details of 6 featured relic stations at Hai Ba Trung Temple",
    f_ai_map: "Digital Map",
    f_ai_map_desc: "2D/3D interactive map with precise station coordinates",
    f_ai_video: "Documentary Video",
    f_ai_video_desc: "Authentic historical animated documentaries",
    f_games: "Learning Missions",
    f_games_desc: "Quiz Quest & War Elephant Coloring games",
    f_vr: "3D Experience",
    f_vr_desc: "Virtual tour of Main Shrine & Ceremonial Hall",
    f_qr: "Relic QR Code",
    f_qr_desc: "Scan QR codes at relic sites for instant heritage info",
    f_library: "Sino-Nom Archives",
    f_library_desc: "Browse Me Linh Bronze Drum & 28 Royal Edicts",
    f_museum: "Digital Museum",
    f_museum_desc: "Interactive dialogue with AI Heritage Assistant",
    btn_experience_now: "Start Exploring",
    map_preview_title: "🗺️ HAI BA TRUNG TEMPLE DIGITAL MAP & DIGITAL MUSEUM",
    map_preview_location: "Ha Loi Village, Me Linh Commune, Hanoi City",
    btn_open_detailed_map: "Open Detailed Digital Map",
    map_stations_list: "1. Outer Ceremonial Gate • 2. Reception Hall • 3. Main Shrine of Hai Ba Trung • 4. Parents & Mentors Shrine • 5. Generals Shrine • 6. Crescent Lake Landscape",
    btn_enter_interactive_map: "ENTER DIGITAL MAP",
    games_title: "LEARNING MISSIONS & HERITAGE GAMES",
    game_puzzle: "🧩 Relic Puzzle",
    game_puzzle_desc: "Assemble photo pieces of Triple Gate & Upper Shrine",
    game_quiz: "❓ Quiz Quest",
    game_quiz_desc: "Answer multiple choice questions to gain +100 XP Points",
    game_crossword: "📝 History Crossword",
    game_crossword_desc: "Decode key terms about the 40 AD Uprising",
    game_color: "🎨 Elephant Coloring",
    game_color_desc: "Paint Bronze Drums & War Elephant Statues",
    btn_play_now: "Play Now",
    videos_title: "HERITAGE DOCUMENTARY VIDEOS",
    video_1_title: "🎬 Historical Animation: Sound of Me Linh Drums (40 AD)",
    video_1_desc: "Duration: 03:45 • Visual historical documentary for students",
    video_2_title: "📜 Historical Archive: Decoding 28 Ancient Royal Edicts",
    video_2_desc: "Duration: 04:20 • Preserved at Me Linh Digital Museum"
  }
};

export type TranslationKey = keyof typeof translations["vi"];

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey | string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "vi",
  setLanguage: () => {},
  t: (key) => (translations.vi as Record<string, string>)[key] || String(key)
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved =
      localStorage.getItem("selectedLanguage") || localStorage.getItem("app_language");
    return saved === "en" || saved === "vi" ? saved : "vi";
  });

  useEffect(() => {
    localStorage.setItem("selectedLanguage", language);
    localStorage.setItem("app_language", language);
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("selectedLanguage", lang);
    localStorage.setItem("app_language", lang);
  };

  const t = (key: TranslationKey | string): string => {
    const dict = translations[language] as Record<string, string>;
    const fallback = translations.vi as Record<string, string>;
    return dict[key] || fallback[key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

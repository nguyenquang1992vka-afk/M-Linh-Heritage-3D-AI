import React, { useState, useEffect } from "react";
import { StudentProfile, HeritagePOI } from "../types";
import { INITIAL_POIS, INITIAL_BADGES } from "../data/heritageData";
import { soundManager } from "../utils/audioUtils";
import {
  syncStudentProgressToDb,
  recordProgressEventInDb
} from "../services/heritageDatabase";
import coMeLinhAvatar from "../assets/images/co_me_linh_ai_avatar_1790426772614.jpg";
import nghiMonNgoaiImg from "../assets/images/nghi_mon_ngoai_real.jpg";
import sanNguPhucImg from "../assets/images/san_ngu_phuc_da_the_real.jpg";
import tamToaChinhDienImg from "../assets/images/tam_toa_chinh_dien_real.jpg";
import hoBanNguyetImg from "../assets/images/ho_ban_nguyet_canh_quan_real.jpg";
import khuThoThanPhuImg from "../assets/images/khu_tho_than_phu_real.jpg";
import khuThoTuongLinhImg from "../assets/images/khu_tho_tuong_linh_real.jpg";
import {
  Compass,
  Puzzle,
  Sparkles,
  Trophy,
  Award,
  CheckCircle2,
  Volume2,
  RotateCcw,
  Flame,
  HelpCircle,
  MapPin,
  ShieldCheck,
  Database,
  Star,
  ArrowRight,
  Layers,
  Eye
} from "lucide-react";

interface DigitalHeritageAcademyProps {
  studentProfile: StudentProfile;
  studentEmail?: string;
  onAddXp: (amount: number) => void;
  onUnlockBadge: (badgeId: string) => void;
  onCompleteStationPoi: (poiId: string, xpReward: number) => void;
}

type AcademyGameTab = "hunt" | "puzzle" | "memory";

interface HuntStationChallenge {
  poiId: string;
  order: number;
  title: string;
  badgeName: string;
  image: string;
  aiGuideSpeech: string;
  missionTask: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  xpReward: number;
}

interface PuzzleMonument {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  xpReward: number;
  badgeId: string;
  aiHistoricalStory: string;
}

interface MemorySecretPair {
  pairId: string;
  category: "Nhân vật" | "Sự kiện" | "Địa danh";
  title: string;
  subtitle: string;
  icon: string;
  interactiveQuestion: string;
  options: string[];
  correctIndex: number;
  factNote: string;
}

const HUNT_STATIONS: HuntStationChallenge[] = [
  {
    poiId: "tam-quan",
    order: 1,
    title: "Trạm 1: Nghi Môn Ngoại & Đá Thề Sông Hát",
    badgeName: "Ấn Tín Nghi Môn",
    image: sanNguPhucImg,
    aiGuideSpeech:
      "Chào mừng các em đến Trạm 1: Nghi môn ngoại và Sân Ngũ Phúc! Tại đây có hai hàng 18 cỗ voi đá chầu và khối Đá Thề khắc bốn câu Lời thề Sông Hát bất hủ của Hai Bà Trưng mùa xuân năm 40 sau Công nguyên.",
    missionTask: "Nhiệm vụ: Quan sát khối Đá Thề đỏ tại Sân Ngũ Phúc và giải mã ý nghĩa Lời thề năm 40 SCN.",
    question:
      "Trong bốn câu Lời thề Sông Hát khắc trên Đá Thề tại Đền Hai Bà Trưng, mục tiêu đầu tiên Hai Bà Trưng thề trước thần linh là gì?",
    options: [
      "Một xin rửa sạch nước thù",
      "Xây dựng cung điện nguy nga",
      "Mở rộng giao thương buôn bán",
      "Tổ chức thi cử chọn nhân tài"
    ],
    correctIndex: 0,
    explanation:
      "Chính xác! Câu đầu tiên trong Lời thề là: 'Một xin rửa sạch nước thù / Hai xin đem lại nghiệp xưa họ Hùng', thể hiện ý chí đánh đuổi quân Đông Hán xâm lược.",
    xpReward: 50
  },
  {
    poiId: "nha-khach",
    order: 2,
    title: "Trạm 2: Nhà Khách & Không Gian Tư Liệu Di Sản",
    badgeName: "Ấn Tín Tư Liệu",
    image: nghiMonNgoaiImg,
    aiGuideSpeech:
      "Tại Trạm 2, các em sẽ tìm hiểu hồ sơ xếp hạng Di tích Quốc gia Đặc biệt Đền Hai Bà Trưng tại thôn Hạ Lôi, xã Mê Linh, thành phố Hà Nội.",
    missionTask: "Nhiệm vụ: Xác định cấp độ xếp hạng của Khu di tích Đền Hai Bà Trưng – Mê Linh.",
    question:
      "Năm 2013, Thủ tướng Chính phủ đã ký Quyết định số 2383/QĐ-TTg công nhận Đền Hai Bà Trưng – Mê Linh đạt danh hiệu nào?",
    options: [
      "Di tích Quốc gia Đặc biệt",
      "Di tích Cấp Huyện",
      "Khu bảo tồn thiên nhiên",
      "Công viên văn hóa địa phương"
    ],
    correctIndex: 0,
    explanation:
      "Tuyệt vời! Đền Hai Bà Trưng – Mê Linh được xếp hạng Di tích Quốc gia Đặc biệt theo Quyết định 2383/QĐ-TTg ngày 09/12/2013.",
    xpReward: 50
  },
  {
    poiId: "chinh-dien",
    order: 3,
    title: "Trạm 3: Tam Tòa Chính Điện Thờ Hai Bà Trưng",
    badgeName: "Ấn Tín Chính Điện",
    image: tamToaChinhDienImg,
    aiGuideSpeech:
      "Đây là Trạm 3: Tam tòa Chính điện uy nghiêm theo lối kiến trúc Tiền nhất – Hậu công và Thượng gia hạ môn, nơi tôn thờ Vua Bà Trưng Trắc và Bình Khôi Công chúa Trưng Nhị.",
    missionTask: "Nhiệm vụ: Khám phá hiện vật quý giá từ thế kỷ XVII được lưu giữ trong Tam tòa Chính diện.",
    question:
      "Hiện vật cổ quý giá nào gắn liền với nghi thức rước lễ của Hai Bà Trưng đang được lưu giữ trang trọng tại khu Chính điện?",
    options: [
      "Hai cỗ kiệu Bát Cống – Long Đình sơn son thếp vàng và Trống đồng",
      "Súng thần công thời Nguyễn",
      "Bia đá Tiến sĩ",
      "Cửu Đỉnh bằng đồng"
    ],
    correctIndex: 0,
    explanation:
      "Chính xác! Trong Chính diện lưu giữ hai cỗ kiệu Bát Cống – Long Đình cổ chạm rồng phượng sơn son thếp vàng cùng Trống đồng và 27 đạo sắc phong.",
    xpReward: 50
  },
  {
    poiId: "than-phu",
    order: 4,
    title: "Trạm 4: Khu Thờ Thân Phụ – Thân Mẫu & Danh Tướng Thi Sách",
    badgeName: "Ấn Tín Hiếu Nghĩa",
    image: khuThoThanPhuImg,
    aiGuideSpeech:
      "Chào các em tại Trạm 4! Nơi đây thờ thân phụ, thân mẫu Hai Bà Trưng (bà Man Thiện), sư phụ – sư mẫu và ông Thi Sách – người chồng anh dũng của bà Trưng Trắc.",
    missionTask: "Nhiệm vụ: Tìm hiểu về người mẹ hiền tài đã nuôi dạy Hai Bà Trưng nên người.",
    question:
      "Thân mẫu của Hai Bà Trưng – người phụ nữ đức độ thuộc dòng dõi Hùng Vương có công lớn nuôi dạy hai chị em võ nghệ và lòng yêu nước – tên là gì?",
    options: [
      "Bà Man Thiện (Trần Thị Đoan)",
      "Bà Lê Chân",
      "Bà Thánh Thiên",
      "Bà Bát Nàn"
    ],
    correctIndex: 0,
    explanation:
      "Đúng rồi! Cụ bà Man Thiện là thân mẫu của Trưng Trắc và Trưng Nhị, cháu ngoại vua Hùng, người rèn luyện ý chí quật cường cho hai con.",
    xpReward: 50
  },
  {
    poiId: "tuong-linh",
    order: 5,
    title: "Trạm 5: Khu Thờ Lục Bộ Nữ Tướng & Nam Tướng Mê Linh",
    badgeName: "Ấn Tín Danh Tướng",
    image: khuThoTuongLinhImg,
    aiGuideSpeech:
      "Tại Trạm 5, chúng ta tri ân các nữ tướng và nam tướng khắp bốn phương hội tụ về Mê Linh giúp Hai Bà Trưng thu phục 65 thành trì Lĩnh Nam.",
    missionTask: "Nhiệm vụ: Ghi nhớ chiến công thu phục các thành trì của nghĩa quân Hai Bà Trưng.",
    question:
      "Cuộc khởi nghĩa Hai Bà Trưng mùa xuân năm 40 SCN đã giành thắng lợi vang dội, giải phóng được bao nhiêu thành trì ở Lĩnh Nam?",
    options: [
      "65 thành trì",
      "12 thành trì",
      "30 thành trì",
      "100 thành trì"
    ],
    correctIndex: 0,
    explanation:
      "Chính xác! Chỉ trong thời gian ngắn, nghĩa quân Hai Bà Trưng đã giải phóng 65 thành trì, lập nên nền độc lập tự chủ và đóng đô tại Mê Linh.",
    xpReward: 50
  },
  {
    poiId: "ho-ban-nguyet",
    order: 6,
    title: "Trạm 6: Hồ Bán Nguyệt & Không Gian Lễ Hội Giao Kiệu",
    badgeName: "Ấn Tín Hồ Bán Nguyệt",
    image: hoBanNguyetImg,
    aiGuideSpeech:
      "Chúc mừng các em đã tới Trạm 6: Hồ Bán Nguyệt và không gian Lễ hội Đền Hai Bà Trưng (Di sản văn hóa phi vật thể quốc gia tổ chức từ mồng 6 tháng Giêng).",
    missionTask: "Nhiệm vụ: Khám phá nghi thức 'Giao kiệu – Kiệu quay đầu' độc đáo tại lễ hội Mê Linh.",
    question:
      "Nghi thức 'Giao kiệu' (kiệu chị Trưng Trắc đi trước khi ra khỏi đền, nhưng qua cổng làng Hạ Lôi lại nhường kiệu em Trưng Nhị đi trước) thể hiện đạo lý cao đẹp nào?",
    options: [
      "Trọn vẹn phép nước (vua đi trước) và tình nhà (chị nhường em)",
      "Để thử sức bền của quân sĩ",
      "Để tránh đường lầy lội",
      "Theo hướng gió mùa xuân"
    ],
    correctIndex: 0,
    explanation:
      "Xuất sắc! Trong đền Trưng Trắc là Vua nên đi trước (phép nước), ra ngoài đời thường chị nhường em gái đi trước (tình nhà).",
    xpReward: 50
  }
];

const PUZZLE_MONUMENTS: PuzzleMonument[] = [
  {
    id: "puz-nghi-mon",
    title: "Bức 1: Nghi Môn Ngoại & Sân Ngũ Phúc Đền Hai Bà Trưng",
    subtitle: "Kéo thả hoặc chạm vào 2 mảnh ghép để hoán đổi và phục dựng bức ảnh Nghi môn & Đá Thề",
    image: sanNguPhucImg,
    xpReward: 60,
    badgeId: "badge-creative-artist",
    aiHistoricalStory:
      "Chúc mừng em đã phục dựng thành công Nghi môn ngoại và Sân Ngũ Phúc! Nơi đây có 18 cỗ voi đá xếp thành hai hàng uy nghiêm cùng khối Đá Thề khắc Lời thề Sông Hát năm 40 sau Công nguyên. Mỗi dịp xuân về, hàng vạn học sinh và du khách đều dừng chân tại đây để tưởng nhớ khí phách anh hùng của Hai Bà Trưng."
  },
  {
    id: "puz-chinh-dien",
    title: "Bức 2: Tam Tòa Chính Điện Thờ Hai Bà Trưng – Mê Linh",
    subtitle: "Phục dựng công trình kiến trúc trung tâm tôn thờ Trưng Vương tại thôn Hạ Lôi",
    image: tamToaChinhDienImg,
    xpReward: 60,
    badgeId: "badge-history-scholar",
    aiHistoricalStory:
      "Tuyệt vời! Em vừa hoàn thành phục dựng Tam tòa Chính diện Đền Hai Bà Trưng. Công trình mang đậm nghệ thuật kiến trúc truyền thống Việt Nam với mái đao cong vút, hệ thống cửa võng chạm rồng sơn son thếp vàng rực rỡ, nơi lưu giữ thần tích của vị Nữ Vương đầu tiên trong lịch sử dân tộc."
  },
  {
    id: "puz-ho-ban-nguyet",
    title: "Bức 3: Hồ Bán Nguyệt & Cảnh Quan Di Tích Quốc Gia Đặc Biệt",
    subtitle: "Phục dựng không gian phong thủy minh đường tụ thủy phía trước Đền Hạ Lôi",
    image: hoBanNguyetImg,
    xpReward: 60,
    badgeId: "badge-map-master",
    aiHistoricalStory:
      "Xuất sắc! Hồ Bán Nguyệt hình vầng trăng khuyết nằm phía trước đền tạo thế phong thủy 'minh đường tụ thủy', soi bóng những hàng cây cổ thụ trăm năm tuổi. Đây là biểu tượng của sự thanh bình, trù phú trên mảnh đất cố đô Mê Linh ngàn năm văn hiến."
  }
];

const MEMORY_SECRET_PAIRS: MemorySecretPair[] = [
  {
    pairId: "pair-trung-trac",
    category: "Nhân vật",
    title: "Trưng Trắc (Trưng Vương)",
    subtitle: "Nữ Vương đầu tiên của dân tộc",
    icon: "👑",
    interactiveQuestion: "Sau khi đánh đuổi thái thú Tô Định năm 40 SCN, bà Trưng Trắc được suy tôn làm Vua và đóng đô ở đâu?",
    options: ["Đóng đô tại Mê Linh", "Đóng đô tại Hoa Lư", "Đóng đô tại Phú Xuân"],
    correctIndex: 0,
    factNote: "Trưng Trắc lên ngôi Vua (Trưng Vương), đóng đô ở Mê Linh và xá thuế 2 năm cho nhân dân."
  },
  {
    pairId: "pair-trung-nhi",
    category: "Nhân vật",
    title: "Trưng Nhị (Bình Khôi)",
    subtitle: "Nữ tướng song hành cùng chị gái",
    icon: "⚔️",
    interactiveQuestion: "Trong cuộc khởi nghĩa Hai Bà Trưng, bà Trưng Nhị giữ vai trò gì bên cạnh chị gái Trưng Trắc?",
    options: [
      "Cùng chị phất cờ khởi nghĩa và trực tiếp chỉ huy nhiều trận đánh lớn",
      "Chỉ phụ trách việc hậu cần lương thực",
      "Đi sứ sang phương Bắc"
    ],
    correctIndex: 0,
    factNote: "Bà Trưng Nhị được phong là Bình Khôi Công chúa, luôn sát cánh cùng chị gái trên lưng voi chiến."
  },
  {
    pairId: "pair-thi-sach",
    category: "Nhân vật",
    title: "Danh Tướng Thi Sách",
    subtitle: "Phu quân của bà Trưng Trắc",
    icon: "🛡️",
    interactiveQuestion: "Ông Thi Sách là con trai của Lạc tướng vùng nào trước khi kết duyên cùng bà Trưng Trắc?",
    options: ["Lạc tướng huyện Chu Diên", "Lạc tướng huyện Cửu Chân", "Lạc tướng huyện Nhật Nam"],
    correctIndex: 0,
    factNote: "Sự kết hợp giữa Trưng Trắc (Mê Linh) và Thi Sách (Chu Diên) đã gắn kết lực lượng nghĩa quân khắp vùng Châu thổ sông Hồng."
  },
  {
    pairId: "pair-hoi-the",
    category: "Sự kiện",
    title: "Hội Thề Sông Hát (Năm 40)",
    subtitle: "Mùa xuân năm 40 sau Công nguyên",
    icon: "📜",
    interactiveQuestion: "Cuộc khởi nghĩa Hai Bà Trưng bùng nổ vào thời điểm nào trong lịch sử?",
    options: [
      "Mùa xuân năm 40 sau Công nguyên",
      "Mùa thu năm 938 sau Công nguyên",
      "Mùa xuân năm 542 sau Công nguyên"
    ],
    correctIndex: 0,
    factNote: "Mùa xuân năm 40 SCN đánh dấu cuộc khởi nghĩa lớn đầu tiên giành lại nền độc lập sau hơn hai thế kỷ Bắc thuộc."
  },
  {
    pairId: "pair-kinh-do-me-linh",
    category: "Địa danh",
    title: "Kinh Đô Mê Linh (Hạ Lôi)",
    subtitle: "Thôn Hạ Lôi, Xã Mê Linh, Hà Nội",
    icon: "🏛️",
    interactiveQuestion: "Vì sao Hai Bà Trưng chọn vùng đất Mê Linh làm căn cứ khởi nghĩa và kinh đô?",
    options: [
      "Là quê hương bản doanh Lạc tướng, địa thế hiểm yếu ven sông Hồng, lòng dân đoàn kết",
      "Vì ở sát biên giới phía Bắc",
      "Vì là vùng đảo xa đất liền"
    ],
    correctIndex: 0,
    factNote: "Mê Linh vừa là quê hương Hai Bà, vừa có vị trí chiến lược kết nối giao thông thủy bộ vùng đồng bằng và trung du."
  },
  {
    pairId: "pair-le-hoi-giao-kieu",
    category: "Sự kiện",
    title: "Lễ Hội Rước Kiệu Voi",
    subtitle: "Mùng 6 đến Mùng 10 Tháng Giêng",
    icon: "🐘",
    interactiveQuestion: "Lễ hội Đền Hai Bà Trưng tại Mê Linh được khai hội chính thức vào ngày nào hàng năm?",
    options: [
      "Ngày mồng 6 tháng Giêng âm lịch (Ngày Hai Bà tế cờ khởi nghĩa)",
      "Ngày 15 tháng Tám âm lịch",
      "Ngày 10 tháng Ba âm lịch"
    ],
    correctIndex: 0,
    factNote: "Lễ hội Đền Hai Bà Trưng Mê Linh đã được công nhận là Di sản Văn hóa Phi vật thể Quốc gia."
  }
];

interface MemoryCardTile {
  uid: string;
  pairId: string;
  category: "Nhân vật" | "Sự kiện" | "Địa danh";
  title: string;
  subtitle: string;
  icon: string;
  cardSide: "A" | "B";
}

function createShuffledMemoryDeck(): MemoryCardTile[] {
  const cards: MemoryCardTile[] = [];
  MEMORY_SECRET_PAIRS.forEach((p) => {
    cards.push({
      uid: `${p.pairId}-A`,
      pairId: p.pairId,
      category: p.category,
      title: p.title,
      subtitle: p.category,
      icon: p.icon,
      cardSide: "A"
    });
    cards.push({
      uid: `${p.pairId}-B`,
      pairId: p.pairId,
      category: p.category,
      title: p.title,
      subtitle: p.subtitle,
      icon: p.icon,
      cardSide: "B"
    });
  });

  // Deterministic-safe Fisher-Yates shuffle
  const copy = [...cards];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

function createScrambledPuzzleOrder(): number[] {
  const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  // Ensure it's not already solved
  if (arr.every((v, idx) => v === idx)) {
    const tmp = arr[0];
    arr[0] = arr[1];
    arr[1] = tmp;
  }
  return arr;
}

export const DigitalHeritageAcademy: React.FC<DigitalHeritageAcademyProps> = ({
  studentProfile,
  studentEmail,
  onAddXp,
  onUnlockBadge,
  onCompleteStationPoi
}) => {
  const [activeGame, setActiveGame] = useState<AcademyGameTab>("hunt");
  const [firebaseSyncStatus, setFirebaseSyncStatus] = useState<string>("Đã đồng bộ Firebase Cloud");

  // =========================================================================
  // GAME 1 STATE: HÀNH TRÌNH SĂN TÌM DI SẢN (6 TRẠM ĐỀN HAI BÀ TRƯNG)
  // =========================================================================
  const [activeStationIdx, setActiveStationIdx] = useState<number>(0);
  const [selectedHuntOption, setSelectedHuntOption] = useState<number | null>(null);
  const [huntFeedback, setHuntFeedback] = useState<{
    isCorrect: boolean;
    message: string;
  } | null>(null);

  const currentStation = HUNT_STATIONS[activeStationIdx] || HUNT_STATIONS[0];
  const isCurrentStationCompleted = studentProfile.completedPOIs.includes(currentStation.poiId);

  const triggerFirebaseSyncToast = (actionLabel: string, xpEarned: number) => {
    setFirebaseSyncStatus(`Đang đồng bộ "${actionLabel}" (+${xpEarned} XP) lên Firebase...`);
    recordProgressEventInDb({
      eventType: "complete_mission",
      studentId: studentProfile.id,
      email: studentEmail,
      poiTitle: actionLabel,
      xpEarned,
      role: "student"
    }).finally(() => {
      syncStudentProgressToDb(studentProfile, studentEmail);
      setTimeout(() => {
        setFirebaseSyncStatus("Đã đồng bộ Hồ sơ, XP & Hộ chiếu lên Firebase");
      }, 900);
    });
  };

  const handleAnswerHuntStation = (optionIdx: number) => {
    soundManager.playClick();
    setSelectedHuntOption(optionIdx);

    if (optionIdx === currentStation.correctIndex) {
      soundManager.playSuccessFanfare();
      setHuntFeedback({
        isCorrect: true,
        message: `${currentStation.explanation} (+${currentStation.xpReward} XP & Mở khóa ${currentStation.badgeName}!)`
      });
      onCompleteStationPoi(currentStation.poiId, currentStation.xpReward);
      if (studentProfile.completedPOIs.length + 1 >= 6) {
        onUnlockBadge("badge-map-master");
      }
      triggerFirebaseSyncToast(
        `Hoàn thành săn tìm ${currentStation.title}`,
        currentStation.xpReward
      );
    } else {
      setHuntFeedback({
        isCorrect: false,
        message: "Chưa chính xác! Em hãy nghe Cô Mê Linh AI gợi ý và chọn lại đáp án đúng nhé!"
      });
    }
  };

  // =========================================================================
  // GAME 2 STATE: GHÉP MẢNH DI SẢN (3x3 DRAG & DROP / TAP SWAP PUZZLE)
  // =========================================================================
  const [selectedMonumentIdx, setSelectedMonumentIdx] = useState<number>(0);
  const [puzzleTiles, setPuzzleTiles] = useState<number[]>(() => createScrambledPuzzleOrder());
  const [draggedTilePos, setDraggedTilePos] = useState<number | null>(null);
  const [selectedSwapPos, setSelectedSwapPos] = useState<number | null>(null);
  const [completedPuzzleIds, setCompletedPuzzleIds] = useState<string[]>([]);
  const [justSolvedTilePos, setJustSolvedTilePos] = useState<number | null>(null);

  const currentMonument = PUZZLE_MONUMENTS[selectedMonumentIdx] || PUZZLE_MONUMENTS[0];
  const isPuzzleSolved = puzzleTiles.every((tileVal, posIdx) => tileVal === posIdx);
  const correctPiecesCount = puzzleTiles.filter((tileVal, posIdx) => tileVal === posIdx).length;

  const handleSelectMonument = (idx: number) => {
    soundManager.playClick();
    setSelectedMonumentIdx(idx);
    setPuzzleTiles(createScrambledPuzzleOrder());
    setSelectedSwapPos(null);
    setDraggedTilePos(null);
  };

  const swapPuzzlePositions = (posA: number, posB: number) => {
    if (posA === posB || isPuzzleSolved) return;
    soundManager.playClick();

    const nextTiles = [...puzzleTiles];
    const temp = nextTiles[posA];
    nextTiles[posA] = nextTiles[posB];
    nextTiles[posB] = temp;

    setPuzzleTiles(nextTiles);
    setJustSolvedTilePos(posB);
    setTimeout(() => setJustSolvedTilePos(null), 500);

    // Check if solved after swap
    const solvedNow = nextTiles.every((val, idx) => val === idx);
    if (solvedNow) {
      soundManager.playSuccessFanfare();
      if (!completedPuzzleIds.includes(currentMonument.id)) {
        setCompletedPuzzleIds((prev) => [...prev, currentMonument.id]);
      }
      onAddXp(currentMonument.xpReward);
      onUnlockBadge(currentMonument.badgeId);
      soundManager.speakVietnamese(currentMonument.aiHistoricalStory);
      triggerFirebaseSyncToast(
        `Phục dựng mảnh ghép: ${currentMonument.title}`,
        currentMonument.xpReward
      );
    }
  };

  // Auto-hint: place 1 unplaced piece in its correct spot
  const handleHintPiece = () => {
    if (isPuzzleSolved) return;
    const wrongPos = puzzleTiles.findIndex((val, idx) => val !== idx);
    if (wrongPos === -1) return;
    const targetPos = puzzleTiles.indexOf(wrongPos);
    if (targetPos !== -1) {
      swapPuzzlePositions(wrongPos, targetPos);
    }
  };

  // =========================================================================
  // GAME 3 STATE: BÍ MẬT LỊCH SỬ (LẬT THẺ GHI NHỚ + CÂU HỎI TƯƠNG TÁC)
  // =========================================================================
  const [memoryDeck, setMemoryDeck] = useState<MemoryCardTile[]>(() => createShuffledMemoryDeck());
  const [flippedCardUids, setFlippedCardUids] = useState<string[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [activeSecretQuizPair, setActiveSecretQuizPair] = useState<MemorySecretPair | null>(null);
  const [answeredSecretPairIds, setAnsweredSecretPairIds] = useState<string[]>([]);
  const [secretQuizFeedback, setSecretQuizFeedback] = useState<{
    isCorrect: boolean;
    text: string;
  } | null>(null);

  const handleFlipMemoryCard = (card: MemoryCardTile) => {
    if (
      flippedCardUids.length >= 2 ||
      flippedCardUids.includes(card.uid) ||
      matchedPairIds.includes(card.pairId) ||
      activeSecretQuizPair
    ) {
      return;
    }

    soundManager.playClick();
    const nextFlipped = [...flippedCardUids, card.uid];
    setFlippedCardUids(nextFlipped);

    if (nextFlipped.length === 2) {
      const firstCard = memoryDeck.find((c) => c.uid === nextFlipped[0]);
      const secondCard = memoryDeck.find((c) => c.uid === nextFlipped[1]);

      if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
        // Match found!
        soundManager.playSuccessFanfare();
        const nextMatched = [...matchedPairIds, firstCard.pairId];
        setMatchedPairIds(nextMatched);
        setFlippedCardUids([]);

        // Open interactive question for this historical pair
        const pairData = MEMORY_SECRET_PAIRS.find((p) => p.pairId === firstCard.pairId);
        if (pairData) {
          setSecretQuizFeedback(null);
          setActiveSecretQuizPair(pairData);
        }
      } else {
        setTimeout(() => {
          setFlippedCardUids([]);
        }, 850);
      }
    }
  };

  const handleAnswerSecretQuiz = (optionIdx: number) => {
    if (!activeSecretQuizPair) return;
    soundManager.playClick();

    if (optionIdx === activeSecretQuizPair.correctIndex) {
      soundManager.playSuccessFanfare();
      const xpBonus = 25;
      onAddXp(xpBonus);

      if (!answeredSecretPairIds.includes(activeSecretQuizPair.pairId)) {
        const nextAnswered = [...answeredSecretPairIds, activeSecretQuizPair.pairId];
        setAnsweredSecretPairIds(nextAnswered);
        if (nextAnswered.length >= MEMORY_SECRET_PAIRS.length) {
          onAddXp(80);
          onUnlockBadge("badge-grand-heritage");
        }
      }

      setSecretQuizFeedback({
        isCorrect: true,
        text: `Chính xác! ${activeSecretQuizPair.factNote} (+25 XP)`
      });
      triggerFirebaseSyncToast(
        `Giải mã Bí mật lịch sử: ${activeSecretQuizPair.title}`,
        xpBonus
      );
    } else {
      setSecretQuizFeedback({
        isCorrect: false,
        text: "Chưa đúng rồi! Em hãy đọc kỹ câu hỏi và chọn lại đáp án chính xác nhé!"
      });
    }
  };

  const handleResetMemoryGame = () => {
    soundManager.playClick();
    setMemoryDeck(createShuffledMemoryDeck());
    setFlippedCardUids([]);
    setMatchedPairIds([]);
    setActiveSecretQuizPair(null);
    setSecretQuizFeedback(null);
  };

  // Level calculation synced with studentProfile
  const standardizedLevelTitle =
    studentProfile.xp >= 300
      ? "Cấp 3: Đại sứ di sản"
      : studentProfile.xp >= 150
      ? "Cấp 2: Nhà khám phá lịch sử"
      : "Cấp 1: Tập sự di sản";

  return (
    <section
      id="digital-heritage-academy"
      className="bg-gradient-to-b from-[#FFFDF9] to-[#FAF5E8] rounded-[32px] border-2 border-[#D4AF37] p-5 sm:p-8 shadow-2xl space-y-6"
    >
      {/* =================================================================== */}
      {/* 1. ACADEMY HEADER & SHARED STUDENT PASSPORT / XP / FIREBASE BAR      */}
      {/* =================================================================== */}
      <div className="bg-gradient-to-r from-[#4A0E12] via-[#8B1E1E] to-[#3A1410] rounded-3xl p-5 sm:p-7 border-2 border-[#D4AF37] text-white shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#F3D27A]">
               DIGITAL MUSEUM + AI EDUCATION • TIỂU HỌC & THCS
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-cinzel text-[#FFFDF9]">
              HỌC VIỆN DI SẢN SỐ MÊ LINH — 3 TRÒ CHƠI GIÁO DỤC LIÊN KẾT
            </h2>
            <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
              Dùng chung Hồ sơ học sinh <strong>{studentProfile.name}</strong> ({studentProfile.grade} · {studentProfile.school}), liên thông điểm kinh nghiệm <strong>XP</strong>, <strong>Huy hiệu</strong>, <strong>Cấp độ</strong>, <strong>Hộ chiếu 6 Ấn tín</strong> và đồng bộ thời gian thực lên <strong>Firebase Database</strong>.
            </p>
          </div>

          {/* Shared Student Account & Passport Status Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            <div className="p-3 rounded-2xl bg-black/35 border border-[#D4AF37]/60 text-center">
              <div className="text-[10px] font-bold uppercase text-amber-200">Điểm Kinh Nghiệm</div>
              <div className="text-lg sm:text-xl font-extrabold font-cinzel text-[#F3D27A] mt-0.5">
                ⚡ {studentProfile.xp} XP
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-black/35 border border-[#D4AF37]/60 text-center">
              <div className="text-[10px] font-bold uppercase text-amber-200">Cấp Độ Hiện Tại</div>
              <div className="text-xs font-extrabold text-white mt-1 line-clamp-1">
                {standardizedLevelTitle}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-black/35 border border-[#D4AF37]/60 text-center">
              <div className="text-[10px] font-bold uppercase text-amber-200">Hộ Chiếu Di Sản</div>
              <div className="text-lg sm:text-xl font-extrabold font-cinzel text-emerald-300 mt-0.5">
                {studentProfile.completedPOIs.length}/6 Ấn tín
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-black/35 border border-[#D4AF37]/60 text-center">
              <div className="text-[10px] font-bold uppercase text-amber-200">Huy Hiệu Đạt Được</div>
              <div className="text-lg sm:text-xl font-extrabold font-cinzel text-amber-300 mt-0.5">
                🏅 {studentProfile.unlockedBadgeIds.length}/{INITIAL_BADGES.length}
              </div>
            </div>
          </div>
        </div>

        {/* Firebase Sync Status Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/15 text-xs text-amber-100/90">
          <div className="flex items-center gap-2 font-bold">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Trạng thái cơ sở dữ liệu: {firebaseSyncStatus}</span>
          </div>
          <div className="font-semibold text-[#F3D27A]">
            Học sinh: {studentProfile.name} · {studentProfile.grade}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. THREE LINKED EDUCATIONAL GAMES SELECTOR TABS                     */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            setActiveGame("hunt");
          }}
          className={`p-4 sm:p-5 rounded-3xl border-2 text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
            activeGame === "hunt"
              ? "bg-gradient-to-br from-[#8B1E1E] to-[#5E1111] text-white border-[#D4AF37] shadow-xl"
              : "bg-white hover:bg-amber-50/60 text-stone-800 border-stone-200"
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                activeGame === "hunt"
                  ? "bg-[#D4AF37] text-[#1A0D0E] border-white"
                  : "bg-amber-50 text-[#8B1E1E] border-amber-200"
              }`}
            >
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-wider opacity-80">
                TRÒ CHƠI 1 • 6 TRẠM DI TÍCH
              </div>
              <div className="font-cinzel font-extrabold text-base sm:text-lg">
                1. Hành Trình Săn Tìm Di Sản
              </div>
              <div className="text-xs opacity-85 mt-0.5">
                Đã săn tìm: {studentProfile.completedPOIs.length}/6 Trạm (+50 XP/trạm)
              </div>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            setActiveGame("puzzle");
          }}
          className={`p-4 sm:p-5 rounded-3xl border-2 text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
            activeGame === "puzzle"
              ? "bg-gradient-to-br from-[#1F544E] to-[#133834] text-white border-[#D4AF37] shadow-xl"
              : "bg-white hover:bg-emerald-50/60 text-stone-800 border-stone-200"
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                activeGame === "puzzle"
                  ? "bg-[#D4AF37] text-[#1A0D0E] border-white"
                  : "bg-emerald-50 text-[#1F544E] border-emerald-200"
              }`}
            >
              <Puzzle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-wider opacity-80">
                TRÒ CHƠI 2 • KÉO THẢ & AI KỂ CHUYỆN
              </div>
              <div className="font-cinzel font-extrabold text-base sm:text-lg">
                2. Ghép Mảnh Di Sản
              </div>
              <div className="text-xs opacity-85 mt-0.5">
                Phục dựng {completedPuzzleIds.length}/3 di tích (+60 XP/bức)
              </div>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            setActiveGame("memory");
          }}
          className={`p-4 sm:p-5 rounded-3xl border-2 text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
            activeGame === "memory"
              ? "bg-gradient-to-br from-[#78350F] to-[#451A03] text-white border-[#D4AF37] shadow-xl"
              : "bg-white hover:bg-amber-50/60 text-stone-800 border-stone-200"
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                activeGame === "memory"
                  ? "bg-[#D4AF37] text-[#1A0D0E] border-white"
                  : "bg-amber-50 text-amber-900 border-amber-200"
              }`}
            >
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-wider opacity-80">
                TRÒ CHƠI 3 • LẬT THẺ & GIẢI MÃ
              </div>
              <div className="font-cinzel font-extrabold text-base sm:text-lg">
                3. Bí Mật Lịch Sử
              </div>
              <div className="text-xs opacity-85 mt-0.5">
                Đã mở: {matchedPairIds.length}/6 cặp thẻ bí mật (+25 XP/thẻ)
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* =================================================================== */}
      {/* GAME 1 VIEW: HÀNH TRÌNH SĂN TÌM DI SẢN (6 TRẠM ĐỀN HAI BÀ TRƯNG)     */}
      {/* =================================================================== */}
      {activeGame === "hunt" && (
        <div className="bg-white rounded-3xl border-2 border-[#D4AF37]/80 p-5 sm:p-7 shadow-lg space-y-6">
          {/* 6 Stations Progress Stepper */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-extrabold text-[#8B1E1E]">
              <span>BẢN ĐỒ HÀNH TRÌNH 6 TRẠM SĂN TÌM ẤN TÍN ĐỀN HAI BÀ TRƯNG</span>
              <span>
                Hoàn thành: {studentProfile.completedPOIs.length}/6 Trạm
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {HUNT_STATIONS.map((st, idx) => {
                const isDone = studentProfile.completedPOIs.includes(st.poiId);
                const isSelected = activeStationIdx === idx;
                return (
                  <button
                    key={st.poiId}
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setActiveStationIdx(idx);
                      setSelectedHuntOption(null);
                      setHuntFeedback(null);
                    }}
                    className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#8B1E1E] text-white border-[#D4AF37] shadow-md"
                        : isDone
                        ? "bg-emerald-50 text-emerald-900 border-emerald-400"
                        : "bg-[#FAF8F5] text-stone-700 border-stone-200 hover:border-[#D4AF37]"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-extrabold">
                      <span>TRẠM {st.order}</span>
                      {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                    </div>
                    <div className="text-xs font-bold mt-1 line-clamp-1">{st.badgeName}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Station Detail + AI Guide + Interactive Mission Quiz */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 5 Cols: Station Visual + AI Guide Narration */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative h-56 sm:h-64 rounded-3xl overflow-hidden border-2 border-[#D4AF37] shadow-md">
                <img
                  src={currentStation.image}
                  alt={currentStation.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs font-extrabold">
                  <span className="px-3 py-1 rounded-xl bg-[#8B1E1E] text-[#F3D27A] border border-[#D4AF37]">
                    Trạm {currentStation.order} / 6
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-[#D4AF37] text-[#1A0D0E]">
                    +{currentStation.xpReward} XP
                  </span>
                </div>
                <div className="absolute bottom-3.5 left-4 right-4 text-white">
                  <h3 className="font-cinzel font-extrabold text-lg leading-snug">
                    {currentStation.title}
                  </h3>
                </div>
              </div>

              {/* AI Guide Box */}
              <div className="p-4 rounded-2xl bg-[#FAF6EE] border-2 border-[#D4AF37]/70 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={coMeLinhAvatar}
                      alt="Cô Mê Linh AI"
                      className="w-10 h-10 rounded-xl object-cover border border-[#D4AF37]"
                    />
                    <div>
                      <div className="text-[10px] font-extrabold uppercase text-[#8B1E1E]">
                        AI HƯỚNG DẪN VIÊN TẠI TRẠM
                      </div>
                      <div className="text-xs font-extrabold text-stone-900">
                        Cô Mê Linh AI thuyết minh gợi ý
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => soundManager.speakVietnamese(currentStation.aiGuideSpeech)}
                    className="px-3 py-1.5 rounded-xl bg-[#8B1E1E] hover:bg-[#6E1616] text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#F3D27A]" />
                    <span>Nghe AI</span>
                  </button>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed">
                  {currentStation.aiGuideSpeech}
                </p>
              </div>
            </div>

            {/* Right 7 Cols: Station Mission & Question */}
            <div className="lg:col-span-7 bg-[#FAF8F5] rounded-3xl border-2 border-stone-200 p-5 sm:p-6 space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-[#D4AF37] text-xs font-extrabold text-[#8B1E1E]">
                🎯 {currentStation.missionTask}
              </div>

              <div className="space-y-3">
                <h4 className="text-base sm:text-lg font-extrabold text-stone-900">
                  Câu hỏi săn tìm Ấn tín: {currentStation.question}
                </h4>

                <div className="space-y-2.5">
                  {currentStation.options.map((opt, idx) => {
                    const isSelected = selectedHuntOption === idx;
                    const isRight = idx === currentStation.correctIndex;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAnswerHuntStation(idx)}
                        className={`w-full p-4 rounded-2xl border-2 text-left text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? isRight
                              ? "bg-emerald-50 border-emerald-500 text-emerald-950"
                              : "bg-rose-50 border-rose-400 text-rose-900"
                            : "bg-white hover:bg-amber-50/50 border-stone-200 text-stone-800"
                        }`}
                      >
                        <span>
                          {String.fromCharCode(65 + idx)}. {opt}
                        </span>
                        {isSelected && isRight && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {huntFeedback && (
                <div
                  className={`p-4 rounded-2xl border-2 text-xs sm:text-sm font-bold space-y-2 ${
                    huntFeedback.isCorrect
                      ? "bg-emerald-50 border-emerald-400 text-emerald-900"
                      : "bg-rose-50 border-rose-300 text-rose-800"
                  }`}
                >
                  <div>{huntFeedback.message}</div>
                  {huntFeedback.isCorrect && activeStationIdx < HUNT_STATIONS.length - 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveStationIdx((prev) => prev + 1);
                        setSelectedHuntOption(null);
                        setHuntFeedback(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#8B1E1E] text-white text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Đi tiếp sang Trạm {activeStationIdx + 2}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {isCurrentStationCompleted && !huntFeedback && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs font-extrabold text-emerald-800 flex items-center justify-between">
                  <span>✓ Em đã đóng dấu thành công {currentStation.badgeName} trong Hộ chiếu Di sản!</span>
                  {activeStationIdx < HUNT_STATIONS.length - 1 && (
                    <button
                      type="button"
                      onClick={() => setActiveStationIdx((prev) => prev + 1)}
                      className="underline cursor-pointer"
                    >
                      Trạm tiếp theo →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* GAME 2 VIEW: GHÉP MẢNH DI SẢN (KÉO THẢ PHỤC DỰNG + AI KỂ CHUYỆN)    */}
      {/* =================================================================== */}
      {activeGame === "puzzle" && (
        <div className="bg-white rounded-3xl border-2 border-[#D4AF37]/80 p-5 sm:p-7 shadow-lg space-y-6">
          {/* Monument Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#1F544E]">
                TRÒ CHƠI 2 • KÉO THẢ HOẶC CHẠM ĐỔI VỊ TRÍ ĐỂ PHỤC DỰNG HÌNH ẢNH DI TÍCH
              </span>
              <h3 className="text-xl font-extrabold font-cinzel text-stone-900 mt-0.5">
                {currentMonument.title}
              </h3>
              <p className="text-xs text-stone-600">{currentMonument.subtitle}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {PUZZLE_MONUMENTS.map((mon, idx) => (
                <button
                  key={mon.id}
                  type="button"
                  onClick={() => handleSelectMonument(idx)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                    selectedMonumentIdx === idx
                      ? "bg-[#1F544E] text-white border-[#1F544E] shadow-xs"
                      : "bg-[#FAF8F5] text-stone-700 border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  Bức {idx + 1} {completedPuzzleIds.includes(mon.id) ? "✓" : ""}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left 7 Cols: Interactive 3x3 Drag-and-Drop / Tap-Swap Puzzle Board */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                <span>
                  Đã khớp đúng vị trí: <strong className="text-[#8B1E1E]">{correctPiecesCount}/9 mảnh ghép</strong>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleHintPiece}
                    disabled={isPuzzleSolved}
                    className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 disabled:opacity-50 text-[#8B1E1E] font-extrabold text-xs cursor-pointer"
                  >
                    💡 Gợi ý ghép 1 mảnh
                  </button>
                  <button
                    type="button"
                    onClick={() => setPuzzleTiles(createScrambledPuzzleOrder())}
                    className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Trộn lại</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-[#1A0D0E] p-3 rounded-3xl border-4 border-[#D4AF37] shadow-2xl max-w-md mx-auto aspect-square">
                {puzzleTiles.map((pieceIndex, boardPos) => {
                  const row = Math.floor(pieceIndex / 3);
                  const col = pieceIndex % 3;
                  const isCorrectSpot = pieceIndex === boardPos;
                  const isSelectedForSwap = selectedSwapPos === boardPos;
                  const isAnimatedNow = justSolvedTilePos === boardPos;

                  return (
                    <div
                      key={boardPos}
                      draggable={!isPuzzleSolved}
                      onDragStart={() => setDraggedTilePos(boardPos)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (draggedTilePos !== null && draggedTilePos !== boardPos) {
                          swapPuzzlePositions(draggedTilePos, boardPos);
                        }
                        setDraggedTilePos(null);
                      }}
                      onClick={() => {
                        if (isPuzzleSolved) return;
                        if (selectedSwapPos === null) {
                          soundManager.playClick();
                          setSelectedSwapPos(boardPos);
                        } else {
                          swapPuzzlePositions(selectedSwapPos, boardPos);
                          setSelectedSwapPos(null);
                        }
                      }}
                      style={{
                        backgroundImage: `url(${currentMonument.image})`,
                        backgroundSize: "300% 300%",
                        backgroundPosition: `${col * 50}% ${row * 50}%`
                      }}
                      className={`relative rounded-xl overflow-hidden cursor-pointer select-none transition-all duration-300 ${
                        isAnimatedNow ? "scale-95 ring-4 ring-amber-400" : "hover:scale-[1.02]"
                      } ${
                        isSelectedForSwap
                          ? "ring-4 ring-[#8B1E1E] scale-95"
                          : isCorrectSpot
                          ? "border-2 border-emerald-400/90"
                          : "border border-white/30"
                      }`}
                    >
                      <span
                        className={`absolute top-1.5 left-1.5 w-6 h-6 rounded-lg text-[11px] font-extrabold flex items-center justify-center shadow ${
                          isCorrectSpot
                            ? "bg-emerald-600 text-white"
                            : "bg-black/70 text-amber-200"
                        }`}
                      >
                        {pieceIndex + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right 5 Cols: Target Preview & AI Storytelling Upon Completion */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 rounded-3xl bg-[#FAF8F5] border border-stone-200 space-y-2.5">
                <div className="text-xs font-extrabold uppercase text-stone-700 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-[#8B1E1E]" />
                  <span>Ảnh mẫu di tích hoàn chỉnh</span>
                </div>
                <div className="h-44 rounded-2xl overflow-hidden border-2 border-[#D4AF37]">
                  <img
                    src={currentMonument.image}
                    alt={currentMonument.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* AI Historical Story Box (Unlocked when solved or previewable) */}
              <div
                className={`p-5 rounded-3xl border-2 transition-all space-y-3 ${
                  isPuzzleSolved
                    ? "bg-gradient-to-br from-[#FFF9E6] to-amber-50 border-[#D4AF37] shadow-lg"
                    : "bg-stone-50 border-stone-200"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={coMeLinhAvatar}
                      alt="Cô Mê Linh AI"
                      className="w-10 h-10 rounded-xl object-cover border border-[#D4AF37]"
                    />
                    <div>
                      <div className="text-[10px] font-extrabold uppercase text-[#8B1E1E]">
                        {isPuzzleSolved
                          ? "🎉 HOÀN THÀNH PHỤC DỰNG (+60 XP)"
                          : "AI KỂ CHUYỆN LỊCH SỬ SAU KHI HOÀN THÀNH"}
                      </div>
                      <div className="text-xs font-extrabold text-stone-900">
                        Câu chuyện di tích từ Cô Mê Linh AI
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      soundManager.speakVietnamese(currentMonument.aiHistoricalStory)
                    }
                    className="px-3 py-1.5 rounded-xl bg-[#8B1E1E] text-white text-xs font-extrabold flex items-center gap-1 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#F3D27A]" />
                    <span>Nghe kể</span>
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                  {isPuzzleSolved
                    ? currentMonument.aiHistoricalStory
                    : "Hãy kéo thả hoặc chạm vào hai ô bất kỳ để hoán đổi vị trí các mảnh ghép (từ 1 đến 9). Ngay khi phục dựng xong bức ảnh, Cô Mê Linh AI sẽ tự động kể câu chuyện lịch sử và trao thưởng +60 XP!"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* GAME 3 VIEW: BÍ MẬT LỊCH SỬ (LẬT THẺ GHI NHỚ + CÂU HỎI TƯƠNG TÁC)  */}
      {/* =================================================================== */}
      {activeGame === "memory" && (
        <div className="bg-white rounded-3xl border-2 border-[#D4AF37]/80 p-5 sm:p-7 shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800">
                TRÒ CHƠI 3 • LẬT THẺ GHI NHỚ NHÂN VẬT, SỰ KIỆN, ĐỊA DANH & CÂU HỎI TƯƠNG TÁC
              </span>
              <h3 className="text-xl font-extrabold font-cinzel text-stone-900 mt-0.5">
                Giải Mã 6 Cặp Thẻ Bí Mật Lịch Sử Hai Bà Trưng – Mê Linh
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-extrabold text-[#8B1E1E]">
                Đã mở: {matchedPairIds.length}/6 Cặp thẻ · Giải đố: {answeredSecretPairIds.length}/6
              </span>
              <button
                type="button"
                onClick={handleResetMemoryGame}
                className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Chơi ván mới</span>
              </button>
            </div>
          </div>

          {/* Interactive Question Modal / Panel when a Card Pair is Matched */}
          {activeSecretQuizPair && (
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#FFF9E6] via-[#FFF4D2] to-[#FFF9E6] border-2 border-[#8B1E1E] shadow-xl space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-[#8B1E1E]">
                  <Sparkles className="w-4 h-4" />
                  <span>
                    ĐÃ MỞ CẶP THẺ {activeSecretQuizPair.category.toUpperCase()}: {activeSecretQuizPair.title}
                  </span>
                </div>
                <span className="text-xs font-extrabold text-emerald-800">+25 XP</span>
              </div>

              <h4 className="text-base sm:text-lg font-extrabold text-stone-900">
                Câu hỏi tương tác: {activeSecretQuizPair.interactiveQuestion}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {activeSecretQuizPair.options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAnswerSecretQuiz(idx)}
                    className="p-3.5 rounded-2xl bg-white hover:bg-amber-50 border-2 border-[#D4AF37] text-left text-xs sm:text-sm font-bold text-stone-900 transition-all cursor-pointer"
                  >
                    {String.fromCharCode(65 + idx)}. {opt}
                  </button>
                ))}
              </div>

              {secretQuizFeedback && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-between gap-3 ${
                    secretQuizFeedback.isCorrect
                      ? "bg-emerald-50 border-emerald-400 text-emerald-900"
                      : "bg-rose-50 border-rose-300 text-rose-800"
                  }`}
                >
                  <span>{secretQuizFeedback.text}</span>
                  {secretQuizFeedback.isCorrect && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSecretQuizPair(null);
                        setSecretQuizFeedback(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#8B1E1E] text-white text-xs font-extrabold shrink-0 cursor-pointer"
                    >
                      Tiếp tục lật thẻ →
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 12 Memory Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {memoryDeck.map((card) => {
              const isFlipped =
                flippedCardUids.includes(card.uid) || matchedPairIds.includes(card.pairId);
              const isMatched = matchedPairIds.includes(card.pairId);

              return (
                <button
                  key={card.uid}
                  type="button"
                  onClick={() => handleFlipMemoryCard(card)}
                  className={`h-36 sm:h-40 rounded-3xl border-2 p-4 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center ${
                    isMatched
                      ? "bg-gradient-to-br from-[#FFF9E6] to-[#FDE68A] border-emerald-500 shadow-md"
                      : isFlipped
                      ? "bg-white border-[#8B1E1E] shadow-lg scale-[1.02]"
                      : "bg-gradient-to-br from-[#6E1414] via-[#8B1E1E] to-[#3A1410] text-white border-[#D4AF37] hover:brightness-110 shadow-md"
                  }`}
                >
                  {isFlipped ? (
                    <div className="space-y-1.5">
                      <div className="text-2xl sm:text-3xl">{card.icon}</div>
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#8B1E1E]">
                        {card.category}
                      </div>
                      <div className="text-xs sm:text-sm font-extrabold text-stone-900 line-clamp-2">
                        {card.title}
                      </div>
                      <div className="text-[11px] text-stone-600 font-medium line-clamp-1">
                        {card.subtitle}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37] mx-auto flex items-center justify-center text-lg">
                        🏺
                      </div>
                      <div className="font-cinzel font-extrabold text-xs text-[#F3D27A] tracking-wider">
                        BÍ MẬT LỊCH SỬ
                      </div>
                      <div className="text-[10px] text-amber-100/80">Chạm để lật mở thẻ</div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

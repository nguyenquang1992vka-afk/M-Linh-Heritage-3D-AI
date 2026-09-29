import { HeritagePOI, HeritageBadge, HeritageArtifact, QuizQuestion, ClassStudentProgress, UserAccount, SchoolClass, OfficialSourceCitation, GradeCurriculumLesson } from "../types";
import templeBgImage from "../assets/images/den_hai_ba_trung_real.jpg";
import nghiMonNgoaiImg from "../assets/images/nghi_mon_ngoai_real.jpg";
import nghiMonNgoai2Img from "../assets/images/nghi_mon_ngoai_2_real.jpg";
import sanNguPhucImg from "../assets/images/san_ngu_phuc_da_the_real.jpg";
import biaDaLoiTheImg from "../assets/images/bia_da_loi_the_real.jpg";
import nhaKhachImg from "../assets/images/nha_khach_don_tiep_real.jpg";
import tamToaChinhDienImg from "../assets/images/tam_toa_chinh_dien_real.jpg";
import tuongThoHaiBaImg from "../assets/images/tuong_tho_hai_ba_real.jpg";
import noiThatChinhDienImg from "../assets/images/noi_that_chinh_dien_real.jpg";
import khuThoThanPhuImg from "../assets/images/khu_tho_than_phu_real.jpg";
import khuThoTuongLinhImg from "../assets/images/khu_tho_tuong_linh_real.jpg";
import hoBanNguyetImg from "../assets/images/ho_ban_nguyet_canh_quan_real.jpg";
import sanNghiLeImg from "../assets/images/san_nghi_le_real.jpg";
import kieuBatCongImg from "../assets/images/kieu_bat_cong_real.jpg";
import sacPhongImg from "../assets/images/sac_phong_real.jpg";
import leHoiRealImg from "../assets/images/le_hoi_real.jpg";

export const INITIAL_USER_ACCOUNTS: UserAccount[] = [
  {
    id: "adm-001",
    name: "Nguyễn Quang (Quản trị viên Hệ thống)",
    email: "nguyenquang1992vka@gmail.com",
    role: "admin",
    status: "active",
    school: "Ban Quản lý Di tích Quốc gia Đặc biệt Đền Hai Bà Trưng – Mê Linh",
    createdAt: "2026-01-10"
  },
  {
    id: "tch-001",
    name: "Nguyễn Thị Lan",
    email: "lan.teacher@melinh.edu.vn",
    role: "teacher",
    status: "active",
    subject: "Lịch sử & Địa lý (Lớp 4A)",
    createdAt: "2026-02-01"
  },
  {
    id: "tch-002",
    name: "Nguyễn Văn Minh",
    email: "minh.teacher@melinh.edu.vn",
    role: "teacher",
    status: "active",
    subject: "Lịch sử & Địa lý (Lớp 5B)",
    createdAt: "2026-02-15"
  },
  {
    id: "tch-003",
    name: "Lê Thị Hồng",
    email: "hong.teacher@melinh.edu.vn",
    role: "teacher",
    status: "pending",
    subject: "Hoạt động trải nghiệm Mê Linh",
    createdAt: "2026-07-29"
  },
  {
    id: "std-001",
    name: "Nguyễn Minh Anh",
    email: "minhanh.student@melinh.edu.vn",
    role: "student",
    status: "active",
    grade: "Lớp 4A",
    createdAt: "2026-03-01"
  },
  {
    id: "std-002",
    name: "Trần Đức Nam",
    email: "ducnam.student@melinh.edu.vn",
    role: "student",
    status: "active",
    grade: "Lớp 5B",
    createdAt: "2026-03-05"
  },
  {
    id: "vis-001",
    name: "Du khách Thập phương",
    email: "dukhach@melinh.vn",
    role: "visitor",
    status: "active",
    createdAt: "2026-09-26"
  }
];

export const INITIAL_CLASSES: SchoolClass[] = [
  { id: "cls-4a", name: "Lớp 4A", gradeLevel: 4, headTeacherName: "Nguyễn Thị Lan", studentCount: 35 },
  { id: "cls-4b", name: "Lớp 4B", gradeLevel: 4, headTeacherName: "Trần Thị Mai", studentCount: 34 },
  { id: "cls-5a", name: "Lớp 5A", gradeLevel: 5, headTeacherName: "Lê Văn Hùng", studentCount: 36 },
  { id: "cls-5b", name: "Lớp 5B", gradeLevel: 5, headTeacherName: "Nguyễn Văn Minh", studentCount: 33 }
];

export const INITIAL_POIS: HeritagePOI[] = [
  {
    id: "tam-quan",
    order: 1,
    title: "1. Nghi môn ngoại - Cổng Tam Quan Đền Hai Bà Trưng",
    subtitle: "Thôn Hạ Lôi, xã Mê Linh, thành phố Hà Nội (Đền Hạ Lôi)",
    category: "Historical Heritage Photo",
    mapCoords: { x: 22, y: 78 },
    shortDesc: "Di tích lịch sử Quốc gia đặc biệt, nơi thờ Hai Bà Trưng - hai nữ anh hùng dân tộc.",
    fullDesc: "Không gian phía trước Đền Hai Bà Trưng với kiến trúc truyền thống, bia đá và khuôn viên tưởng niệm gắn với cuộc khởi nghĩa Hai Bà Trưng năm 40.\n\nTọa lạc tại thôn Hạ Lôi, xã Mê Linh, thành phố Hà Nội, Đền Hai Bà Trưng – Mê Linh (tên gọi khác: Đền Hạ Lôi) là Di tích lịch sử văn hóa được xếp hạng Di tích Quốc gia đặc biệt. Nghi môn ngoại – Cổng Tam Quan Đền Hai Bà Trưng được xây dựng theo kiểu cột đồng trụ (tứ trụ) uy nghiêm với đỉnh trụ trang trí tứ phượng, các ô lồng đèn trang trí tứ linh cùng bia đá di tích và khuôn viên tưởng niệm trang trọng.",
    historicalSignificance: "Là nơi tưởng niệm Hai Bà Trưng - hai nữ anh hùng dân tộc đã lãnh đạo cuộc khởi nghĩa chống ách đô hộ nhà Đông Hán năm 40 sau Công nguyên.",
    funFact: "Bạn có biết? Nghi môn ngoại - Cổng Tam Quan và bia đá nguyên khối phía trước Đền Hai Bà Trưng (Đền Hạ Lôi) tại thôn Hạ Lôi, xã Mê Linh, thành phố Hà Nội là điểm đón tiếp nhân dân cả nước về dâng hương tưởng niệm mỗi dịp đầu xuân!",
    imageUrl: nghiMonNgoaiImg,
    galleryUrls: [
      nghiMonNgoaiImg,
      sanNguPhucImg,
      nghiMonNgoai2Img,
      biaDaLoiTheImg,
      templeBgImage
    ],
    audioScriptDefault: "Chào mừng các em đến với Trạm 1: Nghi môn ngoại - Cổng Tam Quan Đền Hai Bà Trưng tại thôn Hạ Lôi, xã Mê Linh, thành phố Hà Nội. Công trình có kiến trúc tứ trụ truyền thống uy nghiêm cùng tấm bia đá khắc ghi danh hiệu Di tích Quốc gia đặc biệt, mở đầu hành trình tìm hiểu cuộc khởi nghĩa Hai Bà Trưng năm 40 sau Công nguyên!",
    quest: {
      question: "Nghi môn ngoại - Cổng Tam Quan Đền Hai Bà Trưng tọa lạc tại địa điểm nào?",
      options: [
        "Thôn Hạ Lôi, xã Mê Linh, thành phố Hà Nội",
        "Cổ Loa, Đông Anh",
        "Hoa Lư, Ninh Bình",
        "Lam Sơn, Thanh Hóa"
      ],
      correctIndex: 0,
      explanation: "Chính xác! Đền Hai Bà Trưng – Mê Linh (còn gọi là Đền Hạ Lôi) tọa lạc tại thôn Hạ Lôi, xã Mê Linh, thành phố Hà Nội.",
      xpReward: 30
    }
  },
  {
    id: "nha-khach",
    order: 2,
    title: "2. Nhà khách và không gian đón tiếp",
    subtitle: "Không gian đón tiếp đại biểu, nhân dân và học sinh về thăm di tích",
    category: "Kiến trúc",
    mapCoords: { x: 42, y: 64 },
    requiredPrevPoiId: "tam-quan",
    shortDesc: "Khu vực Nhà khách và không gian đón tiếp trang trọng phục vụ công tác hướng dẫn, trưng bày tư liệu và đón đoàn tham quan học tập.",
    fullDesc: "Bước qua Nghi môn ngoại là khu vực Nhà khách và không gian đón tiếp của Khu di tích Quốc gia đặc biệt Đền Hai Bà Trưng – Mê Linh. Công trình được xây dựng hài hòa với kiến trúc truyền thống gỗ, mái ngói mũi hài cổ kính. Đây là nơi đón tiếp các đoàn đại biểu, du khách thập phương và các trường học về tổ chức hoạt động giáo dục truyền thống lịch sử.",
    historicalSignificance: "Điểm kết nối văn hóa và giáo dục di sản, giới thiệu tổng quan hồ sơ Di tích lịch sử văn hóa Quốc gia đặc biệt Đền Hai Bà Trưng (Đền Hạ Lôi).",
    funFact: "Tại Nhà khách và không gian đón tiếp, các đoàn học sinh được nghe thuyết minh tổng quan về sơ đồ di tích và chuẩn bị trang phục chỉnh tề trước khi vào dâng hương tại Chính điện!",
    imageUrl: nhaKhachImg,
    galleryUrls: [
      nhaKhachImg,
      leHoiRealImg,
      nghiMonNgoai2Img
    ],
    audioScriptDefault: "Các em đang có mặt tại Trạm 2: Nhà khách và không gian đón tiếp. Đây là nơi chuẩn bị lễ nghi trang trọng và giới thiệu hồ sơ lịch sử về Đền Hai Bà Trưng – Mê Linh (Đền Hạ Lôi) trước khi chúng ta bước vào Chính điện dâng hương.",
    quest: {
      question: "Đền Hai Bà Trưng – Mê Linh tại thôn Hạ Lôi còn có tên gọi truyền thống nào khác?",
      options: ["Đền Cổ Loa", "Đền Hạ Lôi", "Đền Đô", "Đền Kiếp Bạc"],
      correctIndex: 1,
      explanation: "Chính xác! Đền Hai Bà Trưng – Mê Linh còn có tên gọi khác là Đền Hạ Lôi vì đền tọa lạc tại thôn Hạ Lôi, xã Mê Linh, thành phố Hà Nội.",
      xpReward: 40
    }
  },
  {
    id: "chinh-dien",
    order: 3,
    title: "3. Chính điện thờ Hai Bà Trưng",
    subtitle: "Tam tòa chính điện thờ Hai Bà Trưng (Trưng Trắc và Trưng Nhị)",
    category: "Di vật & Thờ phụng",
    mapCoords: { x: 52, y: 36 },
    requiredPrevPoiId: "nha-khach",
    shortDesc: "Tam tòa chính điện tôn nghiêm thờ Hai Bà Trưng – hai nữ anh hùng dân tộc lãnh đạo cuộc khởi nghĩa năm 40 sau Công nguyên.",
    fullDesc: "Chính điện thờ Hai Bà Trưng (Tam tòa chính điện) là công trình kiến trúc trung tâm và linh thiêng nhất của Di tích Quốc gia đặc biệt Đền Hai Bà Trưng – Mê Linh. Kiến trúc hình chữ 'Tam' gồm Tiền tế, Trung tế và Hậu cung làm bằng gỗ lim chạm trổ họa tiết Tứ linh (Long, Lân, Quy, Phượng), hoành phi câu đối sơn son thếp vàng hài hòa, lộng lẫy và trang nghiêm. Tại đây tôn trí pho tượng thờ Hai Bà Trưng (Trưng Trắc và Trưng Nhị) cùng hai cỗ kiệu Bát Cống - Long Đình và 23 đạo sắc phong cổ.",
    historicalSignificance: "Là nơi tưởng niệm Hai Bà Trưng - hai nữ anh hùng dân tộc đã lãnh đạo cuộc khởi nghĩa chống ách đô hộ nhà Đông Hán năm 40 sau Công nguyên, giành lại nền độc lập tự chủ và định đô tại Mê Linh.",
    funFact: "Trong Tam tòa chính điện thờ Hai Bà Trưng hiện còn lưu giữ nhiều cổ vật quý như hai cỗ kiệu Bát Cống - Long Đình từ thế kỷ XVII, hương án đúc năm 1803 và 23 đạo sắc phong của các triều đại phong kiến!",
    imageUrl: tamToaChinhDienImg,
    galleryUrls: [
      tamToaChinhDienImg,
      tuongThoHaiBaImg,
      noiThatChinhDienImg,
      kieuBatCongImg
    ],
    audioScriptDefault: "Bước vào Trạm 3: Chính điện thờ Hai Bà Trưng (Tam tòa chính điện), chúng ta thành kính nghiêng mình tưởng niệm Hai Bà Trưng (Trưng Trắc và Trưng Nhị) - hai nữ anh hùng dân tộc đã lãnh đạo cuộc khởi nghĩa chống ách đô hộ nhà Đông Hán năm 40 sau Công nguyên!",
    quest: {
      question: "Đối tượng thờ chính tại Chính điện Đền Hai Bà Trưng – Mê Linh là ai?",
      options: [
        "Hai Bà Trưng (Trưng Trắc và Trưng Nhị)",
        "Lý Nam Đế",
        "Ngô Quyền",
        "Đinh Tiên Hoàng"
      ],
      correctIndex: 0,
      explanation: "Chính xác! Tam tòa chính điện là nơi thờ phụng trang trọng nhất dành cho Hai Bà Trưng (Trưng Trắc và Trưng Nhị).",
      xpReward: 50
    }
  },
  {
    id: "khu-tho-than-phu-than-mau",
    order: 4,
    title: "4. Khu thờ thân phụ, thân mẫu Hai Bà Trưng",
    subtitle: "Không gian tôn vinh công đức sinh thành và dưỡng dục Hai Bà Trưng",
    category: "Di vật & Thờ phụng",
    mapCoords: { x: 32, y: 26 },
    requiredPrevPoiId: "chinh-dien",
    shortDesc: "Khu đền thờ thân phụ - thân mẫu, sư phụ - sư mẫu của Hai Bà Trưng cùng thân phụ - thân mẫu ông Thi Sách và Tướng quân Thi Sách.",
    fullDesc: "Khu thờ thân phụ, thân mẫu Hai Bà Trưng nằm trong khuôn viên di tích Đền Hai Bà Trưng – Mê Linh, là nơi nhân dân thành kính phụng thờ thân phụ (Lạc tướng Mê Linh), thân mẫu là bà Man Thiện, sư phụ - sư mẫu của Hai Bà cùng đền thờ thân phụ - thân mẫu ông Thi Sách và Tướng quân Thi Sách. Không gian kiến trúc gỗ lim, mái ngói đỏ cổ kính dưới bóng cây cổ thụ nhắc nhở thế hệ trẻ về công ơn sinh thành, dưỡng dục nên hai vị nữ anh hùng dân tộc Trưng Trắc và Trưng Nhị.",
    historicalSignificance: "Giáo dục sâu sắc đạo lý 'Uống nước nhớ nguồn', lòng hiếu thảo và truyền thống gia đình yêu nước thời kỳ dựng nước và giữ nước.",
    funFact: "Thân mẫu Man Thiện là người phụ nữ đức độ, văn võ song toàn, đã trực tiếp rèn luyện ý chí yêu nước và võ nghệ cho Trưng Trắc và Trưng Nhị từ thuở nhỏ tại quê hương Hạ Lôi, Mê Linh!",
    imageUrl: khuThoThanPhuImg,
    galleryUrls: [
      khuThoThanPhuImg,
      khuThoTuongLinhImg,
      noiThatChinhDienImg
    ],
    audioScriptDefault: "Chào mừng các em đến với Trạm 4: Khu thờ thân phụ, thân mẫu Hai Bà Trưng. Nơi đây tôn vinh công ơn sinh thành, giáo dưỡng của Lạc tướng Mê Linh và bà Man Thiện – những người đã hun đúc nên tinh thần yêu nước bất khuất của Hai Bà Trưng!",
    quest: {
      question: "Khu thờ thân phụ, thân mẫu Hai Bà Trưng giáo dục truyền thống đạo lý quý báu nào của dân tộc?",
      options: [
        "Đạo lý Uống nước nhớ nguồn, hiếu thảo và tri ân đấng sinh thành",
        "Kỹ thuật hàng hải",
        "Nghệ thuật làm gốm",
        "Thương mại đường biển"
      ],
      correctIndex: 0,
      explanation: "Đúng rồi! Khu thờ thân phụ, thân mẫu Hai Bà Trưng thể hiện lòng biết ơn sâu sắc đối với công lao sinh thành, dưỡng dục của cha mẹ Hai Bà.",
      xpReward: 40
    }
  },
  {
    id: "khu-tho-tuong-linh",
    order: 5,
    title: "5. Khu thờ các tướng lĩnh Hai Bà Trưng",
    subtitle: "Tưởng niệm các vị nữ tướng và nam tướng tham gia khởi nghĩa năm 40 sau Công nguyên",
    category: "Danh nhân",
    mapCoords: { x: 76, y: 32 },
    requiredPrevPoiId: "khu-tho-than-phu-than-mau",
    shortDesc: "Đền thờ các nữ tướng và nam tướng triều Hai Bà Trưng đã tụ nghĩa, sát cánh chiến đấu giải phóng 65 thành trì Lĩnh Nam.",
    fullDesc: "Khu thờ các tướng lĩnh Hai Bà Trưng (gồm đền thờ các nữ tướng triều Hai Bà Trưng và đền thờ các nam tướng triều Hai Bà Trưng) được bố trí trang trọng hai bên tả, hữu trong quần thể di tích nhằm tôn vinh các vị tướng lĩnh kiệt xuất khắp các địa phương đã hưởng ứng lời hiệu triệu của Hai Bà Trưng mùa xuân năm 40 sau Công nguyên. Sự hiện diện của khu thờ khẳng định sức mạnh đại đoàn kết toàn dân tộc trong cuộc khởi nghĩa chống ách đô hộ nhà Đông Hán.",
    historicalSignificance: "Tôn vinh tinh thần đoàn kết muôn người như một của các hào kiệt, tướng lĩnh Lạc Việt cùng Hai Bà Trưng giành lại giang sơn.",
    funFact: "Cuộc khởi nghĩa Hai Bà Trưng năm 40 sau Công nguyên quy tụ hàng chục vị nữ tướng và nam tướng tài ba từ khắp Giao Chỉ, Cửu Chân, Nhật Nam, Hợp Phố về hội quân tại Mê Linh!",
    imageUrl: khuThoTuongLinhImg,
    galleryUrls: [
      khuThoTuongLinhImg,
      khuThoThanPhuImg,
      sacPhongImg
    ],
    audioScriptDefault: "Tại Trạm 5: Khu thờ các tướng lĩnh Hai Bà Trưng, các em sẽ tìm hiểu về những vị nữ tướng và nam tướng tài ba đã sát cánh cùng Trưng Trắc và Trưng Nhị đánh đuổi quân Đông Hán, thu phục 65 thành trì Lĩnh Nam năm 40 sau Công nguyên.",
    quest: {
      question: "Khu thờ các tướng lĩnh Hai Bà Trưng tưởng niệm những ai?",
      options: [
        "Các vị nữ tướng và nam tướng đã sát cánh cùng Hai Bà Trưng trong cuộc khởi nghĩa năm 40 sau Công nguyên",
        "Các thương nhân nước ngoài",
        "Các quan lại nhà Đông Hán",
        "Các nhà thám hiểm phương Tây"
      ],
      correctIndex: 0,
      explanation: "Tuyệt vời! Khu thờ các tướng lĩnh Hai Bà Trưng tri ân các vị nữ tướng, nam tướng anh hùng đã cùng Hai Bà lập nên chiến công năm 40 sau Công nguyên.",
      xpReward: 45
    }
  },
  {
    id: "ho-ban-nguyet",
    order: 6,
    title: "6. Hồ Bán Nguyệt - Không gian cảnh quan di tích",
    subtitle: "Kiến trúc cảnh quan sinh thái và yếu tố phong thủy truyền thống trước đền",
    category: "Cảnh quan & Lễ hội",
    mapCoords: { x: 74, y: 72 },
    requiredPrevPoiId: "khu-tho-tuong-linh",
    shortDesc: "Hồ Bán Nguyệt và không gian cảnh quan cây xanh, bia đá tạo nên vẻ đẹp tôn nghiêm, hài hòa theo phong thủy cổ truyền cho Đền Hai Bà Trưng – Mê Linh.",
    fullDesc: "Hồ Bán Nguyệt - Không gian cảnh quan di tích nằm ở khu vực phía trước trong tổng thể quy hoạch rộng 13ha của Di tích Quốc gia đặc biệt Đền Hai Bà Trưng tại thôn Hạ Lôi, xã Mê Linh, thành phố Hà Nội. Mặt Hồ Bán Nguyệt phẳng lặng như tấm gương soi bóng kiến trúc cổ kính, kết hợp cùng hệ thống cây cổ thụ, sân ngoài kiến trúc hình 'ngũ phúc' với đá thề và 18 cỗ voi đá tạo nên không gian văn hóa, tâm linh và sinh thái thanh bình.",
    historicalSignificance: "Thể hiện triết lý kiến trúc cảnh quan truyền thống Việt Nam gắn bó hài hòa giữa công trình tâm linh với thiên nhiên và mặt nước.",
    funFact: "Vào dịp Lễ hội Đền Hai Bà Trưng đầu xuân (từ mồng 6 tháng Giêng), khu vực Hồ Bán Nguyệt và khuôn viên cảnh quan di tích là nơi diễn ra nhiều hoạt động văn hóa dân gian truyền thống sôi nổi!",
    imageUrl: hoBanNguyetImg,
    galleryUrls: [
      hoBanNguyetImg,
      sanNghiLeImg,
      sanNguPhucImg,
      biaDaLoiTheImg
    ],
    audioScriptDefault: "Chúng ta đã đến Trạm 6: Hồ Bán Nguyệt - Không gian cảnh quan di tích. Hãy ngắm nhìn mặt Hồ Bán Nguyệt trong xanh cùng khuôn viên cây xanh, bia đá trang nghiêm của Đền Hai Bà Trưng – Mê Linh tại thôn Hạ Lôi, xã Mê Linh, thành phố Hà Nội nhé!",
    quest: {
      question: "Đền Hai Bà Trưng – Mê Linh được xếp hạng là di tích cấp nào?",
      options: [
        "Di tích cấp xã",
        "Di tích Quốc gia đặc biệt",
        "Di tích cấp thành phố",
        "Chưa được xếp hạng"
      ],
      correctIndex: 1,
      explanation: "Chính xác! Đền Hai Bà Trưng – Mê Linh là Di tích lịch sử văn hóa cấp Quốc gia đặc biệt.",
      xpReward: 50
    }
  }
];

export const INITIAL_BADGES: HeritageBadge[] = [
  {
    id: "badge-first-step",
    title: "Sứ Giả Khởi Hành",
    description: "Hoàn thành khám phá di tích đầu tiên trên Bản đồ Mê Linh",
    icon: "Compass",
    category: "Khám phá",
    requiredXp: 30,
    conditionText: "Khám phá 1 Di tích"
  },
  {
    id: "badge-map-master",
    title: "Hiệp Sĩ Bản Đồ Mê Linh",
    description: "Khám phá trọn vẹn cả 6 điểm di tích linh thiêng Đền Hai Bà Trưng",
    icon: "MapPin",
    category: "Khám phá",
    requiredXp: 200,
    conditionText: "Khám phá 6/6 Di tích"
  },
  {
    id: "badge-history-scholar",
    title: "Thông Thái Lịch Sử Nữ Vương",
    description: "Đạt điểm tuyệt đối trong các thử thách trắc nghiệm di sản",
    icon: "Award",
    category: "Thông thái",
    requiredXp: 150,
    conditionText: "Đạt 100% Điểm Quiz Quest"
  },
  {
    id: "badge-art-creator",
    title: "Nghệ Nhân Đông Sơn Nhí",
    description: "Sáng tạo bài vẽ/tô màu Trống Đồng hoặc Voi Chiến Mê Linh",
    icon: "Palette",
    category: "Sáng tạo",
    requiredXp: 100,
    conditionText: "Tạo 1 Tác phẩm Di sản"
  },
  {
    id: "badge-ai-friend",
    title: "Bạn Đồng Hành Trưng Vương AI",
    description: "Hỏi và trao đổi kiến thức di sản với Trợ lý AI hơn 3 lần",
    icon: "Sparkles",
    category: "Tranh tài",
    requiredXp: 120,
    conditionText: "Trò chuyện AI 3 lần"
  },
  {
    id: "badge-grand-heritage",
    title: "Đại Sứ Di Sản Mê Linh",
    description: "Tốt nghiệp Hành trình Mê Linh Smart Heritage với thứ hạng Xuất Sắc",
    icon: "Crown",
    category: "Thông thái",
    requiredXp: 400,
    conditionText: "Đạt mốc 400 XP"
  }
];

export const INITIAL_ARTIFACTS: HeritageArtifact[] = [
  {
    id: "art-1",
    name: "Ngọn Đá Thề Khắc Lời Thề Hai Bà Trưng & Sân Ngũ Phúc 18 Voi Đá",
    period: "Historical Heritage Photo • Khởi nghĩa Hai Bà Trưng năm 40",
    material: "Đá nguyên khối chạm khắc & Kiến trúc sân ngoài hình Ngũ phúc",
    description: "Ngọn đá thề khắc Lời thề bất hủ của Hai Bà Trưng đặt trang trọng tại sân ngoài kiến trúc hình 'ngũ phúc' cùng 18 cỗ voi đá xếp thành hai hàng bên sân hướng vào giữa sân, tượng trưng cho voi của 18 đời Vua Hùng.",
    historicalValue: "Di tích lịch sử Quốc gia đặc biệt, nơi thờ Hai Bà Trưng - hai nữ anh hùng dân tộc tại thôn Hạ Lôi, xã Mê Linh, thành phố Hà Nội.",
    imageUrl: biaDaLoiTheImg,
    locationInTemple: "Sân ngoài Ngũ phúc – Đền Hai Bà Trưng (Mê Linh)"
  },
  {
    id: "art-2",
    name: "Cỗ Kiệu Bát Cống - Long Đình & Trống Đồng Mê Linh",
    period: "Thế kỷ XVII & Thời Đông Sơn",
    material: "Gỗ lim chạm khắc sơn son thếp vàng & Đồng thau cổ",
    description: "Hai cỗ kiệu Bát Cống - Long Đình từ thế kỷ XVII cùng trống đồng, gươm trường, bát bửu, cửa võng, hương án (đúc năm 1803) được bảo tồn nguyên vẹn tại Đền Hai Bà Trưng – Mê Linh.",
    historicalValue: "Bảo vật di sản khẳng định nghệ thuật chạm khắc cổ truyền và nghi lễ rước kiệu truyền thống tại thôn Hạ Lôi, xã Mê Linh.",
    imageUrl: kieuBatCongImg,
    locationInTemple: "Chính điện thờ Hai Bà Trưng"
  },
  {
    id: "art-3",
    name: "Tượng Thờ Hai Bà Trưng & Nội Thất Sơn Son Thếp Vàng",
    period: "Thời Lê Trung Hưng – Nguyễn",
    material: "Gỗ lim chạm trổ Tứ linh sơn son thếp vàng",
    description: "Tượng thờ Bà Trưng Trắc và Bà Trưng Nhị cùng nội thất, khám thờ, hoành phi, câu đối trong Tam tòa chính điện được sơn son thếp vàng hài hòa, lộng lẫy và trang nghiêm.",
    historicalValue: "Kiệt tác nghệ thuật điêu khắc và chạm khắc gỗ cổ truyền Việt Nam, ca ngợi công đức của Hai Bà Trưng.",
    imageUrl: tuongThoHaiBaImg,
    locationInTemple: "Chính điện thờ Hai Bà Trưng"
  },
  {
    id: "art-4",
    name: "23 Đạo Sắc Phong Triều Phong Kiến Lưu Giữ Tại Đền",
    period: "Thời Vua Lê Hiển Tông đến Vua Khải Định thứ 9",
    material: "Giấy sắc phong cổ truyền & Hiện vật trưng bày",
    description: "Đền lưu giữ 23 đạo sắc phong của các triều đại phong kiến Việt Nam, từ sắc phong sớm nhất đời vua Lê Hiển Tông đến sắc phong triều Nguyễn năm Khải Định thứ 9, tôn hiệu Hai Bà và giao dân làng Hạ Lôi phụng thờ.",
    historicalValue: "Tài liệu Hán Nôm gốc vô giá khẳng định vị thế Di tích Quốc gia đặc biệt Đền Hai Bà Trưng – Mê Linh.",
    imageUrl: sacPhongImg,
    locationInTemple: "Chính điện thờ Hai Bà Trưng"
  }
];

export const DEFAULT_QUIZZES: QuizQuestion[] = [
  {
    id: "q1",
    question: "Hai Bà Trưng phất cờ khởi nghĩa chống lại quân xâm lược phương Bắc vào năm nào?",
    options: ["Năm 40 Sau Công Nguyên", "Năm 248 Sau Công Nguyên", "Năm 938 Sau Công Nguyên", "Năm 1010 Sau Công Nguyên"],
    correctAnswerIndex: 0,
    explanation: "Khởi nghĩa Hai Bà Trưng bùng nổ vào mùa xuân năm 40 SCN tại Mê Linh và Hát Môn, đánh tan quân nhà Hán do Tô Định cầm đầu.",
    hint: "Hãy nhớ đến con số tròn chục nhỏ nhất thế kỷ thứ nhất!",
    xpPoints: 25
  },
  {
    id: "q2",
    question: "Địa danh nào sau đây là quê hương và cũng là kinh đô đầu tiên sau khi Trưng Trắc xưng Vương?",
    options: ["Mê Linh (Hà Nội)", "Cổ Loa (Đông Anh)", "Hoa Lư (Ninh Bình)", "Dạ Trạch (Hưng Yên)"],
    correctAnswerIndex: 0,
    explanation: "Chính xác! Mê Linh vừa là nơi sinh ra Hai Bà Trưng, vừa là kinh đô độc lập của nước Lĩnh Nam thời bấy hệ.",
    hint: "Tên ứng dụng di sản số này chính là tên vùng đất ấy!",
    xpPoints: 25
  },
  {
    id: "q3",
    question: "Tướng giặc nhà Hán nổi tiếng tàn bạo, bị Hai Bà Trưng đánh bại phải cắt tóc gạt râu bỏ chạy về nước là ai?",
    options: ["Tô Định", "Mã Viện", "Liễu Thăng", "Thoát Hoan"],
    correctAnswerIndex: 0,
    explanation: "Thái thú Tô Định vô cùng tàn bạo. Khi nghĩa quân Hai Bà Trưng tiến đánh Luy Lâu, Tô Định sợ hãi hoảng loạn tháo chạy về nước.",
    hint: "Tên hắn có chữ 'Tô'!",
    xpPoints: 30
  },
  {
    id: "q4",
    question: "Lễ hội Đền Hai Bà Trưng Mê Linh hàng năm diễn ra vào thời gian nào?",
    options: ["Từ Mồng 6 đến Mồng 10 tháng Giêng Âm lịch", "Rằm tháng Giêng", "Mồng 10 tháng 3 Âm lịch", "Tết Trung Thu"],
    correctAnswerIndex: 0,
    explanation: "Lễ hội Đền Hai Bà Trưng Mê Linh tổ chức mồng 6 tháng Giêng là Lễ hội Quốc gia lớn với lễ rước kiệu thiêng vô cùng đặc sắc.",
    hint: "Ngay sau những ngày đầu tiên của Tết Nguyên Đán!",
    xpPoints: 30
  }
];

export const MOCK_CLASS_PROGRESS: ClassStudentProgress[] = [
  { id: "s1", name: "Nguyễn Văn An", class: "Lớp 4A", poisCompleted: 6, totalPois: 6, score: 380, badgesCount: 5, lastActive: "10 phút trước", status: "Hoàn thành" },
  { id: "s2", name: "Trần Minh Anh", class: "Lớp 4A", poisCompleted: 5, totalPois: 6, score: 310, badgesCount: 4, lastActive: "1 giờ trước", status: "Đang học" },
  { id: "s3", name: "Lê Hoàng Bách", class: "Lớp 4A", poisCompleted: 6, totalPois: 6, score: 420, badgesCount: 6, lastActive: "Hôm qua", status: "Hoàn thành" },
  { id: "s4", name: "Phạm Khánh Linh", class: "Lớp 4A", poisCompleted: 4, totalPois: 6, score: 240, badgesCount: 3, lastActive: "3 giờ trước", status: "Đang học" },
  { id: "s5", name: "Đỗ Tuấn Kiệt", class: "Lớp 4A", poisCompleted: 2, totalPois: 6, score: 110, badgesCount: 1, lastActive: "2 ngày trước", status: "Cần cố gắng" },
  { id: "s6", name: "Vũ Bảo Ngọc", class: "Lớp 5B", poisCompleted: 6, totalPois: 6, score: 450, badgesCount: 6, lastActive: "Vừa xong", status: "Hoàn thành" },
  { id: "s7", name: "Hoàng Đức Nam", class: "Lớp 5B", poisCompleted: 3, totalPois: 6, score: 180, badgesCount: 2, lastActive: "5 giờ trước", status: "Đang học" }
];

export const INITIAL_HOMEPAGE_CONFIG = {
  title: "MÊ LINH SMART HERITAGE",
  subtitle: "HỆ SINH THÁI SỐ DI SẢN MÊ LINH • TRƯỜNG TIỂU HỌC VĂN KHÊ",
  description: "Trải nghiệm học tập di sản số tương tác, học qua bản đồ AI, tham gia Quiz Quest, sáng tạo tranh vẽ Voi Chiến và đăng bài chia sẻ tư liệu di sản cùng bạn bè!",
  heroImageUrl: templeBgImage,
  introVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  ctaButtonText: "Bắt đầu Khám phá ngay 🚀",
  announcementText: "📢 Lễ hội rước kiệu Đền Hai Bà Trưng Mê Linh năm nay phát động cuộc thi 'Sứ giả Di sản Nhí'! Các em hãy đăng bài tìm hiểu lịch sử và tranh vẽ lên Mạng xã hội Di sản nhé!"
};

export const INITIAL_STUDENT_POSTS = [
  {
    id: "post-1",
    studentId: "std-001",
    studentName: "Nguyễn Minh Anh",
    studentGrade: "Lớp 4A",
    title: "Tìm hiểu 18 Cỗ Voi Đá & Ngọn Đá Thề tại Sân Ngũ Phúc Đền Hai Bà Trưng 🐘✨",
    content: "Hôm nay em vừa khám phá Sân ngoài hình 'ngũ phúc' phía trước Nghi môn Đền Hai Bà Trưng – Mê Linh với 18 cỗ voi đá xếp thành hai hàng và ngọn Đá Thề khắc Lời thề Hai Bà Trưng năm 40 Sau Công Nguyên!",
    imageUrl: sanNguPhucImg,
    category: "Góc vẽ sáng tạo" as const,
    likesCount: 12,
    isLiked: true,
    comments: [
      {
        id: "c1",
        authorName: "Cô Quang (Giáo viên)",
        authorRole: "teacher" as const,
        content: "Bức tranh của Minh Anh phối màu đẹp tuyệt vời! Cô tuyên dương tinh thần học tập di sản của em! 🌟",
        createdAt: "20 phút trước"
      },
      {
        id: "c2",
        authorName: "Lê Hoàng Bách",
        authorRole: "student" as const,
        content: "Đẹp quá bạn ơi, màu vàng tượng voi rất sắc nét!",
        createdAt: "10 phút trước"
      }
    ],
    createdAt: "30 phút trước",
    status: "Đã duyệt" as const,
    isHighlighted: true
  },
  {
    id: "post-2",
    studentId: "s1",
    studentName: "Nguyễn Văn An",
    studentGrade: "Lớp 4A",
    title: "Cảm nhận của em khi tìm hiểu Chính điện thờ Hai Bà Trưng 🏛️✨",
    content: "Đọc tư liệu lịch sử về các vị tướng lĩnh tại Khu thờ các tướng lĩnh Hai Bà Trưng và Chính điện thờ Hai Bà Trưng, em mới biết phụ nữ Việt Nam từ ngàn xưa đã vô cùng kiên cường và giỏi giang. Cảm ơn cô giáo đã tạo ra ứng dụng di sản Mê Linh!",
    imageUrl: tamToaChinhDienImg,
    category: "Cảm nhận di sản" as const,
    likesCount: 8,
    comments: [
      {
        id: "c3",
        authorName: "Trần Minh Anh",
        authorRole: "student" as const,
        content: "Mình cũng vừa hoàn thành trạm Chính điện thờ Hai Bà Trưng nè An!",
        createdAt: "1 giờ trước"
      }
    ],
    createdAt: "2 giờ trước",
    status: "Đã duyệt" as const,
    isHighlighted: false
  },
  {
    id: "post-3",
    studentId: "s6",
    studentName: "Vũ Bảo Ngọc",
    studentGrade: "Lớp 5B",
    title: "Tìm hiểu về Trống Đồng & Cỗ Kiệu Bát Cống tại Đền Mê Linh 🥁✨",
    content: "Các bạn có biết không? Trong Đền Hai Bà Trưng – Mê Linh hiện lưu giữ Trống đồng và hai cỗ kiệu Bát Cống - Long Đình cổ từ thế kỷ XVII được chạm trổ rồng phượng sơn son thếp vàng vô cùng tinh xảo!",
    imageUrl: kieuBatCongImg,
    category: "Tìm hiểu di vật" as const,
    likesCount: 15,
    comments: [],
    createdAt: "Hôm qua",
    status: "Đã duyệt" as const,
    isHighlighted: true
  },
  {
    id: "post-4",
    studentId: "s1",
    studentName: "Nguyễn Minh Anh",
    studentGrade: "Lớp 4A",
    title: "🎬 Video Kể Chuyện Lịch Sử Hai Bà Trưng – Khởi Nghĩa Mùa Xuân Năm 40",
    content: "Mời các bạn cùng xem video kể chuyện lịch sử hào hùng về Hai Bà Trưng (Trưng Trắc và Trưng Nhị) phất cờ khởi nghĩa tại Mê Linh, đánh đuổi quân Đông Hán và giành lại nền độc lập cho dân tộc!",
    videoUrl: "https://www.youtube.com/embed/xfkZmPhM9Q0",
    stationTitle: "Đền Hai Bà Trưng – Mê Linh",
    category: "Kể chuyện lịch sử" as const,
    likesCount: 29,
    comments: [],
    createdAt: "Hôm nay",
    status: "Đã duyệt" as const,
    isHighlighted: true,
    featuredInExhibition: true
  }
];

export const INITIAL_MEDIA_LIBRARY = [
  {
    id: "med-vid-di-tich-den-hai-ba-trung",
    type: "video" as const,
    url: "https://www.youtube.com/embed/uS5bGu30nxU",
    fileName: "Di tích lịch sử Đền Hai Bà Trưng – Mê Linh (YouTube)",
    duration: "05:12",
    fileSize: "YouTube HD (uS5bGu30nxU)",
    caption: "Phim tư liệu giới thiệu toàn cảnh Di tích lịch sử Quốc gia đặc biệt Đền Hai Bà Trưng (Đền Hạ Lôi) tại thôn Hạ Lôi, xã Mê Linh, thành phố Hà Nội (https://www.youtube.com/watch?v=uS5bGu30nxU).",
    category: "Tư liệu Lịch sử",
    uploadedBy: "Cô Quang (Giáo viên)",
    createdAt: "2026-09-27",
    status: "Đã xuất bản" as const,
    attachedLocation: "Đền Hai Bà Trưng – Xã Mê Linh, Thành phố Hà Nội"
  },
  {
    id: "med-vid-le-hoi-ruoc-kieu",
    type: "video" as const,
    url: "https://www.youtube.com/embed/xJ2Usaa1RWQ",
    fileName: "Video Lễ hội Rước Kiệu Đền Hai Bà Trưng – Mê Linh (YouTube)",
    duration: "04:35",
    fileSize: "YouTube HD (xJ2Usaa1RWQ)",
    caption: "Video tư liệu thực tế về Lễ hội Rước Kiệu Đền Hai Bà Trưng – Mê Linh và nghi thức 'Giao kiệu – Kiệu quay đầu' (Kiệu chị nhường kiệu em) ngày mồng 6 tháng Giêng tại thôn Hạ Lôi, xã Mê Linh, TP. Hà Nội.",
    category: "Lễ hội Truyền thống",
    uploadedBy: "Cô Quang (Giáo viên)",
    createdAt: "2026-09-27",
    status: "Đã xuất bản" as const,
    attachedLocation: "Lễ hội Đền Hai Bà Trưng – Xã Mê Linh, Thành phố Hà Nội"
  },
  {
    id: "med-vid-melinh-toi-yeu",
    type: "video" as const,
    url: "https://www.youtube.com/embed/lQuZY2uPs08",
    fileName: "Mê Linh Tôi Yêu – Hào Khí Lịch Sử, Khát Vọng Vươn Xa",
    duration: "03:18",
    fileSize: "YouTube HD (lQuZY2uPs08)",
    caption: "Thước phim nghệ thuật kết nối dòng chảy lịch sử hào hùng từ cuộc khởi nghĩa Hai Bà Trưng năm 40 SCN tại Đền Hai Bà Trưng (thôn Hạ Lôi) đến diện mạo đổi mới, hiện đại và khát vọng vươn xa của quê hương Xã Mê Linh, Thành phố Hà Nội hôm nay (https://youtu.be/lQuZY2uPs08).",
    category: "Video Quê Hương & Di Sản",
    uploadedBy: "Cô Quang (Giáo viên)",
    createdAt: "2026-09-27",
    status: "Đã xuất bản" as const,
    attachedLocation: "Đền Hai Bà Trưng – Xã Mê Linh, Thành phố Hà Nội"
  },
  {
    id: "med-audio-melinh-toi-yeu",
    type: "audio" as const,
    url: "/api/audio/me-linh-toi-yeu",
    fileName: "Me_Linh_Toi_Yeu_Official_Song.wav",
    duration: "02:40",
    fileSize: "6.8 MB",
    caption: "Ca khúc 'Mê Linh Tôi Yêu' – Tự hào truyền thống ngàn năm, đổi mới từng ngày vững niềm tin.",
    category: "Âm nhạc Quê hương",
    uploadedBy: "Cô Quang (Giáo viên)",
    createdAt: "2026-09-27",
    status: "Đã xuất bản" as const,
    attachedLocation: "Đền Hai Bà Trưng – Xã Mê Linh, Thành phố Hà Nội"
  },
  {
    id: "med-vid-1",
    type: "video" as const,
    url: "https://www.youtube.com/embed/xfkZmPhM9Q0",
    fileName: "Video Kể Chuyện Lịch Sử Hai Bà Trưng",
    duration: "Video Tư Liệu",
    fileSize: "YouTube HD",
    caption: "Video kể chuyện lịch sử Hai Bà Trưng (Trưng Trắc và Trưng Nhị) và cuộc khởi nghĩa mùa xuân năm 40 sau Công nguyên tại Mê Linh.",
    category: "Video Kể Chuyện Lịch Sử",
    uploadedBy: "Cô Quang (Giáo viên)",
    createdAt: "2026-09-26",
    status: "Đã xuất bản" as const,
    attachedLocation: "Đền Hai Bà Trưng – Xã Mê Linh, Thành phố Hà Nội"
  },
  {
    id: "med-audio-1",
    type: "audio" as const,
    url: "https://actions.google.com/sounds/v1/ambiences/outdoor_rain.ogg", // standard clean audio sample
    fileName: "Thuyet_Minh_Den_Hai_Ba_Trung_Full.mp3",
    duration: "03:45",
    fileSize: "4.2 MB",
    caption: "Bài thuyết minh MP3 đầy đủ về Quần thể Di tích Đền Hai Bà Trưng Mê Linh",
    category: "Thuyết minh Di sản",
    uploadedBy: "Cô Quang (Giáo viên)",
    createdAt: "2026-07-28",
    status: "Đã xuất bản" as const,
    attachedLocation: "Nghi môn ngoại & Chính điện thờ Hai Bà Trưng"
  },
  {
    id: "med-audio-2",
    type: "audio" as const,
    url: "https://actions.google.com/sounds/v1/crowds/battle_horns.ogg",
    fileName: "Tieng_Trong_Hoi_Me_Linh.mp3",
    duration: "01:20",
    fileSize: "1.8 MB",
    caption: "Âm thanh tiếng trống hội Lễ rước kiệu mồng 6 tháng Giêng",
    category: "Âm thanh Lễ hội",
    uploadedBy: "Cô Quang (Giáo viên)",
    createdAt: "2026-07-29",
    status: "Đã xuất bản" as const,
    attachedLocation: "Chính điện thờ Hai Bà Trưng"
  },
  {
    id: "med-img-1",
    type: "image" as const,
    url: nghiMonNgoaiImg,
    fileName: "Nghi_Mon_Ngoai_Cong_Tam_Quan_Den_Hai_Ba_Trung.jpg",
    fileSize: "2.1 MB",
    caption: "Ảnh chụp Nghi môn ngoại - Cổng Tam Quan Đền Hai Bà Trưng – Mê Linh (Đền Hạ Lôi)",
    category: "Hình ảnh Kiến trúc",
    uploadedBy: "Cô Quang (Giáo viên)",
    createdAt: "2026-07-25",
    status: "Đã xuất bản" as const,
    attachedLocation: "1. Nghi môn ngoại - Cổng Tam Quan Đền Hai Bà Trưng"
  },
  {
    id: "med-img-2",
    type: "image" as const,
    url: tamToaChinhDienImg,
    fileName: "Tam_Toa_Chinh_Dien_Den_Hai_Ba_Trung.jpg",
    fileSize: "2.4 MB",
    caption: "Phía trước Tam tòa chính điện thờ Hai Bà Trưng tại thôn Hạ Lôi, xã Mê Linh, Hà Nội",
    category: "Hình ảnh Kiến trúc",
    uploadedBy: "Cô Quang (Giáo viên)",
    createdAt: "2026-07-26",
    status: "Đã xuất bản" as const,
    attachedLocation: "3. Chính điện thờ Hai Bà Trưng"
  },
  {
    id: "med-img-3",
    type: "image" as const,
    url: khuThoThanPhuImg,
    fileName: "Khu_Tho_Than_Phu_Than_Mau_Hai_Ba_Trung.jpg",
    fileSize: "2.3 MB",
    caption: "Đền thờ thân phụ - thân mẫu, sư phụ - sư mẫu của Hai Bà Trưng và ông Thi Sách",
    category: "Hình ảnh Kiến trúc",
    uploadedBy: "Cô Quang (Giáo viên)",
    createdAt: "2026-07-27",
    status: "Đã xuất bản" as const,
    attachedLocation: "4. Khu thờ thân phụ, thân mẫu Hai Bà Trưng"
  },
  {
    id: "med-img-4",
    type: "image" as const,
    url: hoBanNguyetImg,
    fileName: "Toan_Canh_Ho_Ban_Nguyet_Den_Hai_Ba_Trung.jpg",
    fileSize: "2.2 MB",
    caption: "Toàn cảnh Hồ Bán Nguyệt và không gian cảnh quan di tích Đền Hai Bà Trưng rộng 13ha",
    category: "Hình ảnh Cảnh quan",
    uploadedBy: "Cô Quang (Giáo viên)",
    createdAt: "2026-07-28",
    status: "Đã xuất bản" as const,
    attachedLocation: "6. Hồ Bán Nguyệt - Không gian cảnh quan di tích",
    officialSource: {
      sourceType: "Hồ sơ di tích" as const,
      agencyName: "Bộ Văn hóa, Thể thao và Du lịch – Cục Di sản Văn hóa",
      documentTitle: "Hồ sơ khoa học Di tích Quốc gia Đặc biệt Đền Hai Bà Trưng – Mê Linh",
      referenceCode: "Quyết định 2383/QĐ-TTg (09/12/2013)",
      publishedYear: "2013"
    }
  }
];

export const OFFICIAL_HERITAGE_SOURCES: OfficialSourceCitation[] = [
  {
    sourceType: "Cơ quan quản lý văn hóa",
    agencyName: "Bộ Văn hóa, Thể thao và Du lịch – Cục Di sản Văn hóa & Sở Văn hóa Thể thao Hà Nội",
    documentTitle: "Danh mục Di tích Quốc gia Đặc biệt Đền Hai Bà Trưng & Di sản Văn hóa Phi vật thể Quốc gia Lễ hội Đền Hai Bà Trưng",
    referenceCode: "QĐ 2383/QĐ-TTg & QĐ 446/QĐ-BVHTTDL",
    publishedYear: "2013 - 2018"
  },
  {
    sourceType: "Cổng thông tin chính quyền",
    agencyName: "Cổng Thông tin Điện tử Thành phố Hà Nội & UBND Huyện/Xã Mê Linh",
    documentTitle: "Chuyên trang Di tích Lịch sử Quốc gia Đặc biệt Đền Hai Bà Trưng (Thôn Hạ Lôi, Xã Mê Linh, TP. Hà Nội)",
    referenceCode: "melinh.hanoi.gov.vn / hanoi.gov.vn",
    publishedYear: "2025"
  },
  {
    sourceType: "Hồ sơ di tích",
    agencyName: "Ban Quản lý Di tích Quốc gia Đặc biệt Đền Hai Bà Trưng – Mê Linh",
    documentTitle: "Hồ sơ lý lịch di tích, Bản vẽ kiến trúc 6 hạng mục chính & Danh mục hiện vật sắc phong cổ Đền Hạ Lôi",
    referenceCode: "HS-DTQGĐB-ML-01/2013",
    publishedYear: "2013"
  },
  {
    sourceType: "Tài liệu giáo dục địa phương",
    agencyName: "UBND Thành phố Hà Nội – Sở Giáo dục và Đào tạo Hà Nội",
    documentTitle: "Tài liệu Giáo dục Địa phương Thành phố Hà Nội (Cấp Tiểu học Lớp 1, 2, 3, 4, 5) – Chủ đề Danh nhân & Di tích Lịch sử Mê Linh",
    referenceCode: "GDĐP-HN-TH-2020-2025",
    publishedYear: "2024"
  },
  {
    sourceType: "Sách giáo khoa GDPT 2018",
    agencyName: "Bộ Giáo dục và Đào tạo (Chương trình Giáo dục Phổ thông 2018)",
    documentTitle: "SGK Tự nhiên & Xã hội Lớp 1-3; SGK Lịch sử & Địa lý Lớp 4-5 (Chủ đề Khởi nghĩa Hai Bà Trưng năm 40 SCN & Kinh đô Mê Linh)",
    referenceCode: "Thông tư 32/2018/TT-BGDĐT",
    publishedYear: "2018 - 2024"
  }
];

export const GRADE_1_TO_5_LESSONS: GradeCurriculumLesson[] = [
  {
    id: "lesson-grade-1",
    gradeLevel: 1,
    gradeLabel: "Lớp 1",
    subjectName: "Tự nhiên & Xã hội 1 + Giáo dục Địa phương Hà Nội 1",
    lessonNumber: "Chủ đề 1",
    title: "Quê Hương Mê Linh & Ngôi Đền Thiêng Hai Bà Trưng",
    visualHeadline: "Làm quen với Cổng Tam Quan, Hồ Bán Nguyệt và hai nữ anh hùng Trưng Trắc – Trưng Nhị trên quê hương em.",
    keyFacts: [
      "Đền Hai Bà Trưng nằm tại thôn Hạ Lôi, xã Mê Linh, thành phố Hà Nội.",
      "Nghi môn ngoại (Cổng Tam Quan) và Hồ Bán Nguyệt là nơi đón các em học sinh về dâng hương.",
      "Khi tham quan đền, học sinh giữ trật tự, lễ phép và bảo vệ cảnh quan xanh sạch đẹp."
    ],
    imageUrl: nghiMonNgoaiImg,
    videoEmbedUrl: "https://www.youtube.com/embed/uS5bGu30nxU",
    videoCaption: "Phim tư liệu toàn cảnh Đền Hai Bà Trưng – Mê Linh",
    model3DArtifactId: "art-2",
    model3DTitle: "Tượng Voi Chiến Mê Linh 3D",
    aiMentorPrompt: "Cô Mê Linh AI ơi, hãy kể cho học sinh Lớp 1 nghe thật dễ hiểu về ngôi Đền Hai Bà Trưng ở quê hương Mê Linh và vì sao có tượng Voi chiến ở cổng đền ạ!",
    aiMentorGreeting: "Chào các em Lớp 1! Hôm nay Cô Mê Linh AI sẽ đưa các em đi thăm Cổng Tam Quan và tượng Voi chiến tại Đền Hai Bà Trưng nhé!",
    missionTitle: "Chụp ảnh tham quan hoặc vẽ tranh Cổng Tam Quan Đền Hai Bà Trưng",
    xpReward: 50,
    badgeRewardId: "badge-pioneer",
    quiz: {
      question: "Ngôi đền thờ hai nữ anh hùng Trưng Trắc và Trưng Nhị tại thôn Hạ Lôi có tên là gì?",
      options: [
        "Đền Hai Bà Trưng – Mê Linh (Đền Hạ Lôi)",
        "Chùa Một Cột",
        "Văn Miếu – Quốc Tử Giám",
        "Đền Ngọc Sơn"
      ],
      correctIndex: 0,
      explanation: "Chính xác! Theo Tài liệu Giáo dục Địa phương Hà Nội Lớp 1, Đền Hai Bà Trưng (Đền Hạ Lôi) tọa lạc tại thôn Hạ Lôi, xã Mê Linh, TP. Hà Nội."
    },
    officialSource: {
      sourceType: "Tài liệu giáo dục địa phương",
      agencyName: "UBND TP. Hà Nội – Sở Giáo dục và Đào tạo Hà Nội",
      documentTitle: "Tài liệu Giáo dục Địa phương TP. Hà Nội Lớp 1 – Chủ đề Quê hương & Di tích lịch sử nơi em sống",
      referenceCode: "GDĐP-HN-L1 / Thông tư 32/2018/TT-BGDĐT",
      publishedYear: "2023"
    }
  },
  {
    id: "lesson-grade-2",
    gradeLevel: 2,
    gradeLabel: "Lớp 2",
    subjectName: "Tự nhiên & Xã hội 2 + Giáo dục Địa phương Hà Nội 2",
    lessonNumber: "Chủ đề 2",
    title: "Lễ Hội Truyền Thống Mồng 6 Tháng Giêng Tại Hạ Lôi",
    visualHeadline: "Khám phá Lễ rước kiệu Voi và nét đẹp văn hóa truyền thống đầu xuân tại Đền Hai Bà Trưng.",
    keyFacts: [
      "Lễ hội Đền Hai Bà Trưng diễn ra từ ngày mồng 6 đến mồng 10 tháng Giêng hằng năm.",
      "Nghi thức độc đáo nhất là Lễ rước kiệu Hai Bà và kiệu Voi chiến.",
      "Lễ hội đã được Bộ Văn hóa, Thể thao và Du lịch công nhận là Di sản Văn hóa Phi vật thể Quốc gia."
    ],
    imageUrl: leHoiRealImg,
    videoEmbedUrl: "https://www.youtube.com/embed/xJ2Usaa1RWQ",
    videoCaption: "Video tư liệu Lễ hội Rước Kiệu Đền Hai Bà Trưng mồng 6 tháng Giêng",
    model3DArtifactId: "art-3",
    model3DTitle: "Cỗ Kiệu Bát Cống Sơn Son Thếếp Vàng 3D",
    aiMentorPrompt: "Cô Mê Linh AI ơi, hãy giải thích cho học sinh Lớp 2 về Lễ hội Rước Kiệu ngày mồng 6 tháng Giêng tại Đền Hai Bà Trưng và nghi thức Kiệu quay đầu!",
    aiMentorGreeting: "Chào các em Lớp 2! Cùng Cô Mê Linh AI hòa mình vào tiếng trống hội rước kiệu mồng 6 tháng Giêng tại thôn Hạ Lôi nhé!",
    missionTitle: "Viết 2 câu nhật ký cảm nhận về Lễ hội Rước Kiệu Đền Hai Bà Trưng",
    xpReward: 60,
    badgeRewardId: "badge-artist",
    quiz: {
      question: "Chính hội Đền Hai Bà Trưng – Mê Linh được nhân dân tổ chức vào ngày nào hằng năm?",
      options: [
        "Ngày mồng 6 tháng Giêng âm lịch",
        "Ngày 15 tháng 8 âm lịch",
        "Ngày mồng 10 tháng 3 âm lịch",
        "Ngày 23 tháng Chạp"
      ],
      correctIndex: 0,
      explanation: "Đúng rồi! Theo Hồ sơ Di sản Văn hóa Phi vật thể Quốc gia (Bộ VHTTDL), chính hội Đền Hai Bà Trưng diễn ra vào ngày mồng 6 tháng Giêng âm lịch kỷ niệm ngày Hai Bà tế cờ khởi nghĩa."
    },
    officialSource: {
      sourceType: "Cơ quan quản lý văn hóa",
      agencyName: "Bộ Văn hóa, Thể thao và Du lịch – Cục Di sản Văn hóa",
      documentTitle: "Hồ sơ Di sản Văn hóa Phi vật thể Quốc gia: Lễ hội Đền Hai Bà Trưng (Mê Linh, Hà Nội)",
      referenceCode: "QĐ số 446/QĐ-BVHTTDL",
      publishedYear: "2018"
    }
  },
  {
    id: "lesson-grade-3",
    gradeLevel: 3,
    gradeLabel: "Lớp 3",
    subjectName: "Tự nhiên & Xã hội 3 + Giáo dục Địa phương Hà Nội 3",
    lessonNumber: "Chủ đề 3",
    title: "Kiến Trúc 6 Hạng Mục Di Tích Quốc Gia Đặc Biệt",
    visualHeadline: "Tham quan 360° Tam tòa Chính điện, Đền thờ Thân phụ – Thân mẫu và Đền thờ Lục Bộ Tướng lĩnh.",
    keyFacts: [
      "Quần thể di tích rộng gần 13 ha gồm: Nghi môn, Nhà khách, Tam tòa Chính điện, Khu thờ Thân phụ - Thân mẫu, Khu thờ Tướng lĩnh và Hồ Bán Nguyệt.",
      "Tam tòa Chính điện xây dựng theo kiểu kiến trúc cổ 'Nội công ngoại quốc' chạm khắc Tứ linh.",
      "Đền thể hiện đạo lý 'Uống nước nhớ nguồn' và lòng hiếu thảo của dân tộc Việt Nam."
    ],
    imageUrl: tamToaChinhDienImg,
    videoEmbedUrl: "https://www.youtube.com/embed/uS5bGu30nxU",
    videoCaption: "Khám phá kiến trúc Tam tòa Chính điện và 6 trạm di tích Đền Hai Bà Trưng",
    model3DArtifactId: "art-4",
    model3DTitle: "Bia Đá Khắc Lời Thề Sông Hát 3D",
    aiMentorPrompt: "Cô Mê Linh AI ơi, hãy hướng dẫn học sinh Lớp 3 khám phá 6 hạng mục kiến trúc trong Khu di tích Quốc gia Đặc biệt Đền Hai Bà Trưng!",
    aiMentorGreeting: "Chào các em Lớp 3! Hôm nay chúng ta sẽ cầm bản đồ số khám phá trọn vẹn 6 trạm kiến trúc cổ kính của Đền Hai Bà Trưng!",
    missionTitle: "Đóng dấu đủ 6 Trạm Di tích trên Bản đồ số 360°",
    xpReward: 70,
    badgeRewardId: "badge-explorer",
    quiz: {
      question: "Khu thờ Thân phụ – Thân mẫu tại Đền Hai Bà Trưng giáo dục truyền thống đạo lý nào của dân tộc?",
      options: [
        "Truyền thống hiếu thảo và đạo lý 'Uống nước nhớ nguồn'",
        "Nghệ thuật làm gốm cổ truyền",
        "Kỹ thuật đúc đồng Đông Sơn",
        "Nghề trồng hoa truyền thống"
      ],
      correctIndex: 0,
      explanation: "Xuất sắc! Theo Hồ sơ Di tích Quốc gia Đặc biệt, khu thờ Thân phụ – Thân mẫu và Sư phụ – Sư mẫu tôn vinh công ơn sinh thành, dưỡng dục nên hai vị Vua Bà."
    },
    officialSource: {
      sourceType: "Hồ sơ di tích",
      agencyName: "Thủ tướng Chính phủ & Ban Quản lý Di tích Quốc gia Đặc biệt Đền Hai Bà Trưng",
      documentTitle: "Quyết định xếp hạng Di tích Quốc gia Đặc biệt Đền Hai Bà Trưng – Mê Linh và Hồ sơ khoa học di tích",
      referenceCode: "Quyết định số 2383/QĐ-TTg ngày 09/12/2013",
      publishedYear: "2013"
    }
  },
  {
    id: "lesson-grade-4",
    gradeLevel: 4,
    gradeLabel: "Lớp 4",
    subjectName: "Lịch sử & Địa lý 4 (Chương trình GDPT 2018)",
    lessonNumber: "Chủ đề Địa phương & Lịch sử Bắc Bộ",
    title: "Hào Khí Trống Đồng Mê Linh & Hội Thề Mùa Xuân Năm 40",
    visualHeadline: "Tìm hiểu bối cảnh lịch sử, bốn câu thề sông Hát và âm vang Trống đồng Đông Sơn – Mê Linh.",
    keyFacts: [
      "Đầu thế kỷ I, ách đô hộ tàn bạo của nhà Đông Hán khiến nhân dân Giao Chỉ vô cùng cực khổ.",
      "Mùa xuân năm 40 SCN, Trưng Trắc và Trưng Nhị lập đàn thề bên sông Hát, phất cờ khởi nghĩa tại Mê Linh.",
      "Trống đồng Mê Linh là bảo vật biểu trưng cho quyền lực thủ lĩnh và khí phách văn minh sông Hồng."
    ],
    imageUrl: biaDaLoiTheImg,
    videoEmbedUrl: "https://www.youtube.com/embed/xfkZmPhM9Q0",
    videoCaption: "Video bài học Lịch sử: Cuộc khởi nghĩa Hai Bà Trưng mùa xuân năm 40 SCN",
    model3DArtifactId: "art-1",
    model3DTitle: "Trống Đồng Đông Sơn – Mê Linh 3D",
    aiMentorPrompt: "Cô Mê Linh AI ơi, theo Sách giáo khoa Lịch sử & Địa lý Lớp 4 (GDPT 2018), bốn câu thề của Hai Bà Trưng năm 40 SCN có ý nghĩa lịch sử như thế nào?",
    aiMentorGreeting: "Chào các nhà sử học nhí Lớp 4! Hãy cùng Cô Mê Linh AI giải mã bốn câu thề lịch sử năm 40 SCN và xoay mô hình 3D Trống đồng Mê Linh nhé!",
    missionTitle: "Quay video thuyết minh ngắn hoặc trả lời đúng Quiz Lời thề năm 40 SCN",
    xpReward: 80,
    badgeRewardId: "badge-historian",
    quiz: {
      question: "Theo SGK Lịch sử & Địa lý (GDPT 2018), cuộc khởi nghĩa Hai Bà Trưng bùng nổ vào thời gian nào?",
      options: [
        "Mùa xuân năm 40 sau Công nguyên",
        "Năm 938 sau Công nguyên",
        "Năm 1010 sau Công nguyên",
        "Năm 1288 sau Công nguyên"
      ],
      correctIndex: 0,
      explanation: "Chính xác! Mùa xuân năm 40 sau Công nguyên, Hai Bà Trưng phất cờ khởi nghĩa tại Mê Linh, lật đổ ách đô hộ nhà Đông Hán."
    },
    officialSource: {
      sourceType: "Sách giáo khoa GDPT 2018",
      agencyName: "Bộ Giáo dục và Đào tạo – Nhà xuất bản Giáo dục Việt Nam",
      documentTitle: "Sách giáo khoa Lịch sử và Địa lý 4 & Tài liệu Giáo dục Địa phương TP. Hà Nội Lớp 4 (Chương trình GDPT 2018)",
      referenceCode: "Thông tư 32/2018/TT-BGDĐT – Bộ GD&ĐT",
      publishedYear: "2023"
    }
  },
  {
    id: "lesson-grade-5",
    gradeLevel: 5,
    gradeLabel: "Lớp 5",
    subjectName: "Lịch sử & Địa lý 5 (Chương trình GDPT 2018)",
    lessonNumber: "Chủ đề Xây dựng & Bảo vệ Đất nước",
    title: "Kinh Đô Mê Linh – Nhà Nước Tự Chủ & Bảo Tồn Di Sản Số",
    visualHeadline: "Từ chiến thắng 65 thành trì Lĩnh Nam, đóng đô tại Mê Linh đến sứ mệnh bảo tồn di sản bằng công nghệ 3D AI.",
    keyFacts: [
      "Sau khi đánh đuổi Tô Định và giải phóng 65 thành trì ở Lĩnh Nam, bà Trưng Trắc lên ngôi Vua (Trưng Vương), đóng đô tại Mê Linh.",
      "Trưng Vương xá thuế 2 năm liền cho nhân dân, khôi phục sản xuất và văn hóa truyền thống Lạc Việt.",
      "Thế hệ học sinh hôm nay bảo tồn và lan tỏa giá trị Đền Hai Bà Trưng thông qua bản đồ số, mô hình 3D và thuyết minh song ngữ."
    ],
    imageUrl: sacPhongImg,
    videoEmbedUrl: "https://www.youtube.com/embed/lQuZY2uPs08",
    videoCaption: "Mê Linh Tôi Yêu – Hào khí Kinh đô xưa và khát vọng vươn xa hôm nay",
    model3DArtifactId: "art-5",
    model3DTitle: "Hòm Sắc Phong Cổ Các Triều Đại 3D",
    aiMentorPrompt: "Cô Mê Linh AI ơi, theo chương trình Lịch sử Lớp 5 (GDPT 2018), vì sao việc Trưng Vương đóng đô tại Mê Linh và xá thuế 2 năm cho dân lại có ý nghĩa trọng đại trong lịch sử dân tộc?",
    aiMentorGreeting: "Chào các anh chị Lớp 5! Cùng Cô Mê Linh AI tìm hiểu Kinh đô Mê Linh thời Trưng Vương và thực hiện dự án thuyết minh bảo tồn di sản số nhé!",
    missionTitle: "Hoàn thành bài thuyết minh video hoặc tác phẩm triển lãm số Kinh đô Mê Linh",
    xpReward: 100,
    badgeRewardId: "badge-legend",
    quiz: {
      question: "Sau khi khởi nghĩa thắng lợi năm 40 SCN, Trưng Vương đã chọn vùng đất nào làm Kinh đô của nước ta?",
      options: [
        "Mê Linh (nay thuộc xã Mê Linh, TP. Hà Nội)",
        "Phong Châu (Phú Thọ)",
        "Cổ Loa (Đông Anh)",
        "Hoa Lư (Ninh Bình)"
      ],
      correctIndex: 0,
      explanation: "Hoàn toàn chính xác! Theo SGK Lịch sử & Địa lý 5 (GDPT 2018) và Cổng thông tin chính quyền Mê Linh, sau khi thu phục 65 thành trì, Trưng Vương đóng đô tại Mê Linh."
    },
    officialSource: {
      sourceType: "Cổng thông tin chính quyền",
      agencyName: "Cổng Thông tin Điện tử TP. Hà Nội & Bộ Giáo dục và Đào tạo (SGK Lịch sử & Địa lý 5 GDPT 2018)",
      documentTitle: "Lịch sử Khởi nghĩa Hai Bà Trưng, Kinh đô Mê Linh và Hồ sơ bảo tồn Di tích Quốc gia Đặc biệt Đền Hai Bà Trưng",
      referenceCode: "CT-GDPT-2018-L5 & Cổng TTĐT Mê Linh",
      publishedYear: "2024"
    }
  }
];



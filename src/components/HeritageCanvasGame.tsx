import React, { useState, useRef, useEffect } from "react";
import { soundManager } from "../utils/audioUtils";
import { uploadFileToStorage } from "../services/heritageDatabase";
import { MediaItem } from "../types";
import { 
  Palette, 
  Download, 
  RotateCcw, 
  Sparkles, 
  Award, 
  Check, 
  PenTool, 
  Eraser,
  Image as ImageIcon,
  Loader2,
  CloudUpload
} from "lucide-react";

interface HeritageCanvasGameProps {
  onUnlockBadge: (badgeId: string) => void;
  onAddXp: (xp: number) => void;
  studentName?: string;
  onArtworkUploaded?: (mediaItem: MediaItem) => void;
}

export const HeritageCanvasGame: React.FC<HeritageCanvasGameProps> = ({
  onUnlockBadge,
  onAddXp,
  studentName = "Học sinh Mê Linh",
  onArtworkUploaded
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("#C81D25"); // Son Red default
  const [brushSize, setBrushSize] = useState<number>(8);
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("trong-dong");
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);

  const heritageColors = [
    { name: "Đỏ Son", hex: "#C81D25" },
    { name: "Vàng Kim", hex: "#D4AF37" },
    { name: "Xanh Ngọc", hex: "#0D9488" },
    { name: "Đồng Thau", hex: "#B87333" },
    { name: "Nâu Gỗ", hex: "#3E2723" },
    { name: "Xanh Lam", hex: "#1D4ED8" },
    { name: "Đen Chàm", hex: "#1A0F11" },
    { name: "Trắng Ngà", hex: "#FFFDF9" }
  ];

  const templates = [
    { id: "trong-dong", title: "Trống Đồng Mê Linh", desc: "Mặt trống chạm khắc chim Lạc & mặt trời 12 cánh" },
    { id: "voi-chien", title: "Tượng Hai Bà Cưỡi Voi", desc: "Hai Bà Trưng cưỡi voi xung phong ra trận" },
    { id: "tam-quan", title: "Cổng Tam Quan Đền Mê Linh", desc: "Kiến trúc cổ kính ba cửa uy nghi" }
  ];

  // Draw Template Outline onto Canvas
  const drawOutlineTemplate = (type: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas with ivory background
    ctx.fillStyle = "#FAF8F5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#3E2723";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    if (type === "trong-dong") {
      // Draw Bronze Drum Concentric Circles
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Outer rings
      [180, 140, 100, 60, 20].forEach((radius) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Sun rays in center
      ctx.beginPath();
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6;
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(angle) * 40, centerY + Math.sin(angle) * 40);
      }
      ctx.stroke();
    } else if (type === "voi-chien") {
      // Draw Elephant outline simulation
      ctx.beginPath();
      ctx.arc(300, 200, 70, 0, Math.PI * 2); // Body
      ctx.arc(200, 160, 40, 0, Math.PI * 2); // Head
      ctx.stroke();
      // Trunk
      ctx.beginPath();
      ctx.moveTo(170, 170);
      ctx.quadraticCurveTo(130, 220, 150, 250);
      ctx.stroke();
    } else {
      // Draw Tam Quan Gateway arches
      ctx.strokeRect(100, 150, 400, 180);
      ctx.beginPath();
      ctx.arc(300, 230, 60, Math.PI, 0); // Center Arch
      ctx.stroke();
    }
  };

  useEffect(() => {
    drawOutlineTemplate(selectedTemplate);
  }, [selectedTemplate]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.beginPath();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.strokeStyle = isEraser ? "#FAF8F5" : selectedColor;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleSaveArtwork = async () => {
    const canvas = canvasRef.current;
    soundManager.playSuccessFanfare();
    setIsUploading(true);

    if (canvas) {
      const dataUrl = canvas.toDataURL("image/png");
      const tmplTitle = templates.find((t) => t.id === selectedTemplate)?.title || "Tranh Di Sản";
      const uploaded = await uploadFileToStorage({
        title: `Tác phẩm: ${tmplTitle} (${studentName})`,
        type: "image",
        category: "Tác phẩm Học sinh",
        base64Data: dataUrl,
        uploadedBy: studentName,
      });
      if (uploaded) {
        setUploadedFileUrl(uploaded.url);
        if (onArtworkUploaded) {
          onArtworkUploaded(uploaded);
        }
      }
    }

    setIsUploading(false);
    setIsSaved(true);
    onAddXp(80);
    onUnlockBadge("badge-art-creator");
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `tac-pham-di-san-me-linh-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-[#F8F4E8] p-5 sm:p-6 rounded-3xl border-2 border-[#C9A227] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9E2A2B]/10 border border-[#9E2A2B]/30 text-[#9E2A2B] text-xs font-bold mb-1">
            <Palette className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>GÓC SÁNG TẠO NGHỆ THUẬT DÂN TỘC</span>
          </div>
          <h2 className="font-bold text-2xl sm:text-3xl text-[#9E2A2B]">
            TÔ MÀU DI SẢN MÊ LINH
          </h2>
          <p className="text-xs text-[#5A4032] font-semibold mt-1">
            Chọn mẫu hoa văn Trống Đồng hoặc Voi Chiến, tự tay phối màu Son Red & Gold cổ truyền!
          </p>
        </div>

        {/* Template Selectors */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
          {templates.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => setSelectedTemplate(tmpl.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedTemplate === tmpl.id
                  ? "bg-[#9E2A2B] text-white shadow-xs"
                  : "bg-white text-[#5A4032] border border-[#C9A227]/40 hover:bg-[#C9A227]/10"
              }`}
            >
              {tmpl.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Canvas Workspace */}
      <div className="bg-[#FAF8F5] p-5 rounded-3xl border-2 border-[#D4AF37]/50 shadow-xl grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Tools Sidebar */}
        <div className="md:col-span-1 space-y-5 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <div>
            <span className="text-xs font-bold text-[#3E2723] block mb-2">Bảng Màu Di Sản:</span>
            <div className="grid grid-cols-4 gap-2">
              {heritageColors.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => {
                    setSelectedColor(c.hex);
                    setIsEraser(false);
                  }}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    selectedColor === c.hex && !isEraser ? "scale-125 border-black shadow-md" : "border-stone-300"
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-[#3E2723] block mb-2">Kích Thước Cọ:</span>
            <input
              type="range"
              min="2"
              max="24"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-full accent-[#C81D25]"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-stone-200">
            <button
              onClick={() => setIsEraser(!isEraser)}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 border ${
                isEraser ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              <Eraser className="w-4 h-4" />
              <span>{isEraser ? "Đang dùng Tẩy" : "Chuyển sang Tẩy"}</span>
            </button>

            <button
              onClick={() => drawOutlineTemplate(selectedTemplate)}
              className="w-full py-2 px-3 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors flex items-center justify-center gap-2 border border-rose-200"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Xóa Làm Lại</span>
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="md:col-span-3 flex flex-col items-center justify-center space-y-4">
          <div className="relative rounded-2xl overflow-hidden border-4 border-[#D4AF37] shadow-2xl bg-[#FAF8F5]">
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              onMouseDown={startDrawing}
              onMouseUp={stopDrawing}
              onMouseMove={draw}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchEnd={stopDrawing}
              onTouchMove={draw}
              className="cursor-crosshair max-w-full touch-none"
            />
          </div>

          <div className="flex items-center gap-3 w-full max-w-md">
            <button
              onClick={handleSaveArtwork}
              disabled={isUploading}
              className="flex-1 bg-gradient-to-r from-[#C81D25] to-[#B22222] text-white py-3 rounded-2xl font-bold text-xs shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 text-amber-300 animate-spin" />
              ) : (
                <CloudUpload className="w-4 h-4 text-amber-300" />
              )}
              <span>{isUploading ? "Đang lưu vào Cloud Storage..." : "Lưu Tác Phẩm lên Hệ Thống (+80 XP)"}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-5 bg-[#3E2723] text-amber-200 py-3 rounded-2xl font-bold text-xs shadow-lg hover:text-white transition-all flex items-center justify-center gap-2 border border-amber-400/40"
            >
              <Download className="w-4 h-4" />
              <span>Tải Ảnh</span>
            </button>
          </div>

          {isSaved && (
            <div className="p-3 bg-emerald-100 border border-emerald-400 text-emerald-900 rounded-2xl text-xs font-bold flex flex-col sm:flex-row items-center gap-2">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Đã lưu tác phẩm vào Kho Lưu Trữ Số (Storage) & mở khóa Huy Hiệu "Nghệ Nhân Đông Sơn Nhí"!</span>
              </div>
              {uploadedFileUrl && (
                <a
                  href={uploadedFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white text-[11px] hover:bg-emerald-800 whitespace-nowrap"
                >
                  Xem file đã lưu
                </a>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

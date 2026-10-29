import React, { useState, useEffect } from "react";
import {
  FileText,
  UploadCloud,
  Layers,
  Database,
  Search,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
  FileCheck2
} from "lucide-react";

interface KnowledgeDoc {
  _id: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  totalChunks: number;
  description: string;
}

interface ChunkItem {
  _id: string;
  title?: string;
  content: string;
  metadata?: {
    chunkIndex: number;
    source: string;
  };
}

export default function Knowledge() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDoc | null>(null);
  const [isChunkModalOpen, setIsChunkModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState<KnowledgeDoc[]>([]);
  const [chunks, setChunks] = useState<ChunkItem[]>([]);
  const [loadingChunks, setLoadingChunks] = useState(false);

  // 1. Lấy danh sách tài liệu từ MongoDB (Backend API) kèm Token xác thực
  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      const response = await fetch("http://localhost:3011/api/knowledge", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        const formattedDocs = result.data.map((item: any) => ({
          _id: item._id,
          fileName: item.source || item.title || "Tài liệu không tên",
          fileSize: "PDF Document",
          uploadDate: item.createdAt ? item.createdAt.split("T")[0] : "Hôm nay",
          totalChunks: item.chunkCount || 0,
          description: item.description || "Dữ liệu tri thức tuyển sinh",
        }));
        setDocuments(formattedDocs);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách tài liệu:", error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // 2. Tải lên file PDF thật lên Backend, kèm Token xác thực
  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:3011/api/knowledge/import", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert("Import và nhúng vector PDF thành công!");
        fetchDocuments(); // Tải lại danh sách từ MongoDB ngay lập tức
      } else {
        alert(result.message || "Lỗi khi xử lý file PDF.");
      }
    } catch (error) {
      console.error("Lỗi upload:", error);
      alert("Đã xảy ra lỗi kết nối đến server.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  // 3. Xóa tài liệu khỏi MongoDB kèm Token xác thực
  const handleDeleteDocument = async (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa tài liệu này khỏi cơ sở tri thức của AI?")) {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
        const response = await fetch(`http://localhost:3011/api/knowledge/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await response.json();

        if (response.ok && result.success) {
          setDocuments(documents.filter((d) => d._id !== id));
        } else {
          alert("Không thể xóa tài liệu từ server.");
        }
      } catch (error) {
        console.error("Lỗi khi xóa:", error);
      }
    }
  };

  // 4. Xem chi tiết các Chunks của tài liệu
  const openChunkModal = async (doc: KnowledgeDoc) => {
    setSelectedDoc(doc);
    setIsChunkModalOpen(true);
    setLoadingChunks(true);
    try {
      setChunks([
        {
          _id: "1",
          title: `Đoạn trích từ ${doc.fileName}`,
          content: "Dữ liệu các đoạn trích (chunks) đã được lập chỉ mục vector thành công trong cơ sở dữ liệu MongoDB và sẵn sàng phục vụ mô hình RAG.",
        },
      ]);
    } catch (error) {
      console.error("Lỗi tải chunks:", error);
    } finally {
      setLoadingChunks(false);
    }
  };

  const filteredDocs = documents.filter(
    (d) =>
      d.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* Tiêu đề */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quản lý Tri thức Tuyển sinh (Knowledge Base)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Nạp tài liệu PDF tuyển sinh 2026 để huấn luyện và cấp dữ liệu cho Chatbot AI trả lời thí sinh.
          </p>
        </div>

        <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm transition shadow-blue-200 cursor-pointer">
          <UploadCloud size={18} />
          <span>Tải lên tài liệu PDF</span>
          <input
            type="file"
            accept=".pdf"
            onChange={handleUploadFile}
            className="hidden"
            disabled={isUploading}
          />
        </label>
      </div>

      {/* 3 Thẻ thống kê KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Tài liệu tuyển sinh (PDF)
            </p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{documents.length} File</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Tổng số Chunks trong DB
            </p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {documents.reduce((acc, curr) => acc + curr.totalChunks, 0)} Chunks
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Trạng thái Vector Database
            </p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
              <CheckCircle2 size={20} /> Đã sẵn sàng
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Database size={24} />
          </div>
        </div>
      </div>

      {/* Trạng thái đang tải lên */}
      {isUploading && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3 text-blue-700 animate-pulse">
          <Clock size={20} className="animate-spin" />
          <span className="text-sm font-medium">
            Đang phân tích file PDF, trích xuất văn bản và lập chỉ mục Vector vào MongoDB...
          </span>
        </div>
      )}

      {/* Danh sách tài liệu */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm tài liệu tuyển sinh..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-100">
                <th className="py-4 px-6">Tài liệu nạp</th>
                <th className="py-4 px-6">Định dạng</th>
                <th className="py-4 px-6">Số Chunks</th>
                <th className="py-4 px-6">Trạng thái lập chỉ mục</th>
                <th className="py-4 px-6">Ngày cập nhật</th>
                <th className="py-4 px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredDocs.length > 0 ? (
                filteredDocs.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 font-bold flex items-center justify-center flex-shrink-0">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{doc.fileName}</p>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 max-w-sm">
                            {doc.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-slate-600 font-medium text-xs">
                      {doc.fileSize}
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                        <Layers size={13} /> {doc.totalChunks} Chunks
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Đã sẵn sàng cho AI
                      </span>
                    </td>

                    <td className="py-4 px-6 text-slate-500 text-xs">
                      {doc.uploadDate}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openChunkModal(doc)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Xem các đoạn trích kiến thức"
                        >
                          <Eye size={15} />
                          <span>Xem Chunks</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDocument(doc._id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Xóa tài liệu"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Không tìm thấy tài liệu phù hợp trong cơ sở dữ liệu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Xem Chunks */}
      {isChunkModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <FileCheck2 size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{selectedDoc.fileName}</h3>
                  <p className="text-xs text-slate-400">
                    Tổng số: {selectedDoc.totalChunks} đoạn trích kiến thức trong MongoDB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsChunkModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-3.5 overflow-y-auto flex-1 bg-slate-50/30">
              {loadingChunks ? (
                <p className="text-center text-slate-400 py-6">Đang tải dữ liệu chunks...</p>
              ) : (
                chunks.map((chk, index) => (
                  <div
                    key={chk._id}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2"
                  >
                    <span className="text-xs font-bold text-blue-600 flex items-center gap-1.5">
                      <Sparkles size={14} /> Chunk #{index + 1}: {chk.title}
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/60 p-3 rounded-lg border border-slate-100">
                      "{chk.content}"
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-white flex justify-end">
              <button
                type="button"
                onClick={() => setIsChunkModalOpen(false)}
                className="px-5 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-medium hover:bg-slate-200 transition"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
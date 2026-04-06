import React, { useState, useEffect, useRef } from "react";
import {
  CloudArrowUpIcon,
  XMarkIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const ModalBuatPengumuman = ({ isOpen, onClose }) => {
  const [shouldRender, setRender] = useState(isOpen);
  const [show, setShow] = useState(false);
  const [content, setContent] = useState("");

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ align: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  useEffect(() => {
    if (isOpen) {
      setRender(true);
      const timer = setTimeout(() => setShow(true), 10);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
      setTimeout(() => {
        setRender(false);
        setContent("");
        setSelectedFile(null);
      }, 150);
    }
  }, [isOpen]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-150 ${
        show
          ? "bg-black/30 backdrop-blur-sm opacity-100"
          : "bg-transparent opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg shadow-lg w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-150 transform ${
          show ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#4279df] text-white px-6 py-4 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-medium">Buat Pengumuman</h2>
          <button
            onClick={onClose}
            className="hover:text-gray-200 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 bg-[#f8f9fa] flex flex-col gap-4 overflow-y-auto">
          <div className="flex flex-col gap-1.5">
            <label className="text-gray-600 font-medium text-sm">Judul</label>
            <input
              type="text"
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4279df] focus:border-transparent text-gray-700 text-sm placeholder-gray-400"
              placeholder="Masukkan Judul"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-gray-600 font-medium text-sm">Konten</label>
            <div className="bg-white overflow-hidden modal-quill">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                placeholder="Type or paste your content here!"
                className="h-48 mb-10"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-gray-600 font-medium text-sm">Foto</label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center bg-white cursor-pointer transition-colors relative ${
                isDragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-[#4279df] hover:bg-blue-50/50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept="image/png, image/jpeg, image/svg+xml"
                className="hidden"
              />

              {!selectedFile ? (
                <>
                  <CloudArrowUpIcon className="w-8 h-8 text-[#4279df] mb-2" />
                  <p className="text-sm text-gray-600 mb-1">
                    Drag your file(s) or{" "}
                    <span className="text-[#4279df] font-semibold">browse</span>
                  </p>
                  <p className="text-xs text-gray-400">jpg, png, or svg</p>
                </>
              ) : (
                <div
                  className="flex flex-row justify-between items-center w-full max-w-sm bg-white border border-gray-200 rounded p-3 relative cursor-default shadow-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="bg-blue-100 p-2 rounded shrink-0">
                      <DocumentIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <p
                        className="text-sm font-medium text-gray-700 truncate cursor-text"
                        title={selectedFile.name}
                      >
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveFile}
                    title="Hapus file"
                    className="p-1.5 ml-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-md transition-colors shrink-0"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 shrink-0">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-primary text-primary font-medium rounded-full hover:bg-blue-50 transition-colors text-sm"
            >
              Batal
            </button>
            <button
              className="px-6 py-2 bg-gray-100 text-gray-400 font-medium rounded-full cursor-not-allowed text-sm"
              disabled
            >
              Kirim
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalBuatPengumuman;

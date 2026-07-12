import React, { useRef, useState, useEffect } from "react";
import { CloudArrowUpIcon, XCircleIcon } from "@heroicons/react/24/outline";

const ZipIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="8" width="36" height="26" rx="3" fill="#FDD835" />
    <path d="M2 12C2 10.3431 3.34315 9 5 9H16L20 13H35C36.6569 13 38 14.3431 38 16V34H2V12Z" fill="#FFEE58" />
    <rect x="18" y="10" width="4" height="12" fill="#FBC02D" />
    <rect x="18" y="12" width="4" height="2" fill="#F57F17" />
    <rect x="18" y="16" width="4" height="2" fill="#F57F17" />
    <rect x="18" y="20" width="4" height="2" fill="#F57F17" />
    <rect x="16" y="24" width="18" height="10" rx="2" fill="#1E88E5" />
    <text x="25" y="31" fill="white" fontSize="7" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">ZIP</text>
  </svg>
);

const PdfIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 4C8 2.89543 8.89543 2 10 2H24L32 10V36C32 37.1046 31.1046 38 30 38H10C8.89543 38 8 37.1046 8 36V4Z" fill="#EF5350" />
    <path d="M24 2L32 10H26C24.8954 10 24 9.10457 24 8V2Z" fill="#E53935" />
    <rect x="6" y="24" width="28" height="10" rx="2" fill="#D32F2F" />
    <text x="20" y="31" fill="white" fontSize="7" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">PDF</text>
  </svg>
);

const ImageIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="6" width="32" height="28" rx="3" fill="#42A5F5" />
    <circle cx="28" cy="14" r="3" fill="#FFCA28" />
    <path d="M4 34L14 20L22 28L28 22L36 34H4Z" fill="#1E88E5" />
    <rect x="10" y="26" width="20" height="10" rx="2" fill="#1565C0" />
    <text x="20" y="33" fill="white" fontSize="7" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">IMG</text>
  </svg>
);

const DefaultIcon = ({ ext }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 4C8 2.89543 8.89543 2 10 2H24L32 10V36C32 37.1046 31.1046 38 30 38H10C8.89543 38 8 37.1046 8 36V4Z" fill="#9E9E9E" />
    <path d="M24 2L32 10H26C24.8954 10 24 9.10457 24 8V2Z" fill="#757575" />
    <rect x="6" y="24" width="28" height="10" rx="2" fill="#616161" />
    <text x="20" y="31" fill="white" fontSize="6" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
      {String(ext).substring(0, 4).toUpperCase() || "FILE"}
    </text>
  </svg>
);

const getFileIcon = (fileName) => {
  if (!fileName) return <DefaultIcon ext="FILE" />;
  const ext = fileName.split(".").pop().toLowerCase();
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return <ZipIcon />;
  if (["pdf"].includes(ext)) return <PdfIcon />;
  if (["jpg", "jpeg", "png", "svg", "webp", "gif"].includes(ext)) return <ImageIcon />;
  return <DefaultIcon ext={ext} />;
};

const formatSize = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const FileUploadDropzone = ({
  selectedFile,
  onFileSelect,
  onFileRemove,
  accept = "*",
  maxSize = 0, // in bytes
  label = "Surat Permohonan",
  description = "Drag your file(s) atau browse",
  subDescription = "jpg, png, svg, atau pdf",
  disabled = false,
  error = "",
  className = "mb-8",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tempFile, setTempFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let interval;
    if (isUploading) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            if (tempFile) {
              onFileSelect(tempFile);
              setTempFile(null);
            }
            return 100;
          }
          return prev + Math.floor(Math.random() * 15) + 5;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isUploading, tempFile, onFileSelect]);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (disabled || isUploading) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateAndProcessFile = (file) => {
    if (!file) return;

    if (maxSize > 0 && file.size > maxSize) {
      onFileSelect(null, `Ukuran file terlalu besar. Maksimal ${formatSize(maxSize)}.`);
      return;
    }

    setTempFile(file);
    setProgress(0);
    setIsUploading(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (disabled || isUploading) return;

    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
      e.target.value = "";
    }
  };

  const handleBrowseFile = (e) => {
    e.stopPropagation();
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  };

  const handleCancelUpload = () => {
    setIsUploading(false);
    setProgress(0);
    setTempFile(null);
  };

  return (
    <div className={`w-full ${className}`}>
      {label && <p className="text-gray-500 mb-2 text-[15px]">{label}</p>}
      
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleFileInputChange}
        disabled={disabled || isUploading}
      />

      {isUploading ? (
        <div className="w-full border border-[#86a9e2] rounded-lg px-6 py-6 bg-[#f0f4fb] flex flex-col justify-center items-center relative transition-all duration-300">
          <p className="text-[13px] font-bold text-gray-800 mb-3">Uploading...</p>
          
          <div className="w-full bg-gray-200 rounded-full h-[6px] mb-1 overflow-hidden flex">
            <div 
              className="bg-[#2a4e9b] h-[6px] rounded-full transition-all duration-200" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="w-full flex justify-end mb-4">
            <span className="text-[11px] text-gray-500 font-medium">{progress}%</span>
          </div>

          <button 
            type="button" 
            onClick={handleCancelUpload}
            className="px-6 py-1.5 bg-white text-[#4773da] text-xs font-semibold rounded-full border border-[#dce5f5] hover:bg-gray-50 transition-colors shadow-sm"
          >
            Cancel
          </button>
        </div>
      ) : selectedFile ? (
        <div className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] flex justify-between items-center transition-all duration-300">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="shrink-0 flex items-center justify-center">
              {getFileIcon(selectedFile.name)}
            </div>
            <div className="flex flex-col overflow-hidden">
              <p className="text-[13px] font-bold text-gray-800 truncate" title={selectedFile.name}>
                {selectedFile.name}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5 font-medium tracking-wide">
                {formatSize(selectedFile.size)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onFileRemove}
            className="text-red-500 hover:text-red-600 transition-colors shrink-0 p-1 rounded-full hover:bg-red-50 mr-1"
            title="Hapus file"
          >
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
      ) : (
        <div
          className={`w-full border border-dashed rounded-xl px-4 py-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors relative ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : disabled
                ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                : "border-[#b0c4eb] bg-[#fcfdff] hover:bg-[#f6f9ff]"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseFile}
        >
          <CloudArrowUpIcon className={`h-8 w-8 mb-2 ${disabled ? "text-gray-300" : "text-[#4773da]"}`} />
          <p className="text-[13px] text-gray-500">
            {description.split("browse")[0]}
            <span
              className={`font-semibold ${
                disabled ? "text-gray-400 cursor-not-allowed" : "text-[#4773da] hover:underline"
              }`}
            >
              browse
            </span>
            {description.split("browse")[1]}
          </p>
          {subDescription && (
            <p className="text-[11px] text-gray-400 mt-1.5 font-medium">
              {subDescription}
            </p>
          )}
        </div>
      )}

      {error ? (
        <p className="mt-2 text-[13px] text-red-600 font-medium">{error}</p>
      ) : null}
    </div>
  );
};

export default FileUploadDropzone;

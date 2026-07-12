import { useEffect, useState } from "react";
import {
  XMarkIcon,
} from "@heroicons/react/24/outline";
import FileUploadDropzone from "../FileUploadDropzone";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const MAX_IMAGE_SIZE_BYTES = 900 * 1024;

const stripHtml = (htmlText = "") =>
  String(htmlText)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getImageValidationError = (file) => {
  if (!file) {
    return "";
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "File gambar harus berformat jpg, jpeg, png, atau webp.";
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "Ukuran gambar terlalu besar. Maksimal 900KB.";
  }

  return "";
};

const ModalBuatPengumuman = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  errorMessage = "",
  initialData = null,
}) => {
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevInitialData, setPrevInitialData] = useState(initialData);
  const [shouldRender, setRender] = useState(isOpen);
  const [show, setShow] = useState(false);
  const [judul, setJudul] = useState("");
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");

  if (isOpen && !shouldRender) {
    setRender(true);
  }

  if (!isOpen && show) {
    setShow(false);
  }

  if (isOpen !== prevIsOpen || initialData !== prevInitialData) {
    setPrevIsOpen(isOpen);
    setPrevInitialData(initialData);
    if (isOpen) {
      setJudul(initialData?.judul || "");
      setContent(initialData?.teks || initialData?.deskripsi || "");
      setSelectedFile(null);
      setFileError("");
    }
  }

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
    let timer;
    if (isOpen) {
      timer = setTimeout(() => setShow(true), 10);
    } else {
      timer = setTimeout(() => {
        setRender(false);
        setContent("");
        setSelectedFile(null);
      }, 150);
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleClose = () => {
    if (isSubmitting || !show) {
      return;
    }

    onClose();
  };

  const handleFileSelect = (file, dropzoneError) => {
    if (dropzoneError) {
      setSelectedFile(null);
      setFileError(dropzoneError);
      return;
    }

    const validationError = getImageValidationError(file);
    if (validationError) {
      setSelectedFile(null);
      setFileError(validationError);
      return;
    }

    setFileError("");
    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!onSubmit || isSubmitting) {
      return;
    }

    if (!initialData && !selectedFile) {
      setFileError("Gambar wajib diunggah saat membuat pengumuman.");
      return;
    }

    await onSubmit({
      judul: judul.trim(),
      teks: content,
      gambar: selectedFile,
    });
  };

  const isInvalid =
    !judul.trim() || !stripHtml(content) || (!initialData && !selectedFile);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-150 ${
        show
          ? "bg-black/30 backdrop-blur-sm opacity-100"
          : "bg-transparent opacity-0 pointer-events-none"
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-lg shadow-lg w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-150 transform ${
          show ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#4279df] text-white px-6 py-4 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-medium">
            {initialData ? "Edit Pengumuman" : "Buat Pengumuman"}
          </h2>
          <button
            onClick={handleClose}
            className="hover:text-gray-200 transition-colors"
            disabled={isSubmitting}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 bg-[#f8f9fa] flex flex-col gap-4 overflow-y-auto"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-gray-600 font-medium text-sm">Judul</label>
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4279df] focus:border-transparent text-gray-700 text-sm placeholder-gray-400"
              placeholder="Masukkan Judul"
              required
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
            <FileUploadDropzone
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
              onFileRemove={handleRemoveFile}
              accept=".jpg,.jpeg,.png,.webp,image/png,image/jpeg,image/jpg,image/webp"
              maxSize={MAX_IMAGE_SIZE_BYTES}
              label=""
              description="Drag your file(s) or browse"
              subDescription="jpg, jpeg, png, atau webp (Max 900KB)"
              disabled={isSubmitting}
              error={fileError}
              className="mb-0"
            />
          </div>

          {errorMessage ? (
            <p className="text-sm text-red-600 whitespace-pre-line">
              {errorMessage}
            </p>
          ) : null}

          <div className="flex justify-end gap-3 mt-4 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-primary text-primary font-medium rounded-full hover:bg-blue-50 transition-colors text-sm"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#4279df] text-white font-medium rounded-full hover:bg-blue-700 transition-colors text-sm disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
              disabled={isSubmitting || isInvalid}
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalBuatPengumuman;

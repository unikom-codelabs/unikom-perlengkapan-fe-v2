import React, { useState, useEffect } from "react";

const ModalKonfirmasiHapus = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Konfirmasi Hapus",
  message = "Apakah Anda yakin ingin menghapus data ini? Data yang sudah dihapus tidak dapat dikembalikan.",
  confirmLabel = "Ya, Hapus",
  cancelLabel = "Batal",
  isProcessing = false,
  confirmButtonClassName = "bg-red-500 hover:bg-red-600",
}) => {
  const [shouldRender, setRender] = useState(isOpen);
  const [show, setShow] = useState(false);

  const handleClose = () => {
    if (isProcessing) {
      return;
    }

    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      setRender(true);
      const timer = setTimeout(() => setShow(true), 10);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
      const timer = setTimeout(() => setRender(false), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-150 ${
        show
          ? "bg-black/30 backdrop-blur-sm opacity-100"
          : "bg-transparent opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-lg shadow-lg w-full max-w-sm overflow-hidden flex flex-col transition-all duration-150 transform ${
          show ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-primary text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-medium">{title}</h2>
        </div>

        <div className="p-6 bg-[#f8f9fa] flex flex-col gap-4">
          <p className="text-gray-600 text-sm leading-relaxed">{message}</p>

          <div className="flex justify-end gap-3 mt-2">
            <button
              onClick={handleClose}
              className="px-5 py-2 border border-gray-300 text-gray-600 font-medium rounded-full hover:bg-gray-100 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isProcessing}
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`px-5 py-2 text-white transition-colors font-medium rounded-full text-sm disabled:opacity-50 disabled:cursor-not-allowed ${confirmButtonClassName}`}
              disabled={isProcessing}
            >
              {isProcessing ? "Memproses..." : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalKonfirmasiHapus;

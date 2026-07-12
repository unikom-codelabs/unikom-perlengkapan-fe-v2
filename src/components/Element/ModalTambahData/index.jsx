import { useState, useEffect } from "react";

const ModalTambahData = ({
  isOpen,
  title = "Tambah Data",
  label = "Nama",
  placeholder = "Masukkan data",
  submitLabel = "Simpan",
  value = "",
  onValueChange,
  secondaryLabel = "",
  secondaryPlaceholder = "",
  secondaryValue = "",
  onSecondaryValueChange,
  secondaryRequired = false,
  secondaryInputType = "text",
  onClose,
  onSubmit,
  isSubmitting = false,
  errorMessage = "",
}) => {
  const [show, setShow] = useState(false);
  const [shouldRender, setRender] = useState(isOpen);

  // Derive state from props: if isOpen becomes true, immediately set shouldRender to true
  if (isOpen && !shouldRender) {
    setRender(true);
  }
  
  // If isOpen becomes false, immediately set show to false to trigger exit animation
  if (!isOpen && show) {
    setShow(false);
  }

  useEffect(() => {
    let timer;
    if (isOpen) {
      timer = setTimeout(() => setShow(true), 10);
    } else {
      timer = setTimeout(() => setRender(false), 150);
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!shouldRender) {
    return null;
  }

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    onClose?.();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const primaryValid = String(value).trim();
    const secondaryValid = secondaryRequired
      ? String(secondaryValue).trim()
      : true;

    if (!onSubmit || isSubmitting || !primaryValid || !secondaryValid) {
      return;
    }

    await onSubmit();
  };

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
        className={`bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden transition-all duration-150 transform ${
          show ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="bg-[#4279df] text-white px-6 py-4">
          <h2 className="text-lg font-medium">{title}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 bg-[#f8f9fa]">
          <div className="flex flex-col gap-1.5">
            <label className="text-gray-600 font-medium text-sm">{label}</label>
            <input
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={(event) => onValueChange?.(event.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4279df] focus:border-transparent text-gray-700 text-sm"
              required
            />
          </div>

          {secondaryLabel ? (
            <div className="mt-4 flex flex-col gap-1.5">
              <label className="text-gray-600 font-medium text-sm">
                {secondaryLabel}
              </label>
              <input
                type={secondaryInputType}
                placeholder={secondaryPlaceholder}
                value={secondaryValue}
                onChange={(event) =>
                  onSecondaryValueChange?.(event.target.value)
                }
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4279df] focus:border-transparent text-gray-700 text-sm"
                required={secondaryRequired}
              />
            </div>
          ) : null}

          {errorMessage ? (
            <p className="mt-3 text-sm text-red-600 whitespace-pre-line">
              {errorMessage}
            </p>
          ) : null}

          <div className="flex justify-end gap-3 mt-5">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2 border border-[#4279df] text-[#4279df] font-medium rounded-full hover:bg-blue-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#4279df] text-white hover:bg-blue-600 font-medium rounded-full text-sm disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
              disabled={
                isSubmitting ||
                !String(value).trim() ||
                (secondaryRequired && !String(secondaryValue).trim())
              }
            >
              {isSubmitting ? "Menyimpan..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalTambahData;

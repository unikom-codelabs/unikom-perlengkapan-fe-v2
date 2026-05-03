const ModalTambahData = ({
  isOpen,
  title = "Tambah Data",
  label = "Nama",
  placeholder = "Masukkan data",
  submitLabel = "Simpan",
  value = "",
  onValueChange,
  onClose,
  onSubmit,
  isSubmitting = false,
  errorMessage = "",
}) => {
  if (!isOpen) {
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

    if (!onSubmit || isSubmitting || !String(value).trim()) {
      return;
    }

    await onSubmit();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden"
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
              disabled={isSubmitting || !String(value).trim()}
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

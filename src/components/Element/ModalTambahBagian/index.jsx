import { useEffect, useState } from "react";
import Dropdown from "../Dropdown";

const ModalTambahBagian = ({
  isOpen,
  onClose,
  onSubmit,
  modalMode = "create",
  isSubmitting = false,
  errorMessage = "",
  jabatanList = [],
  selectedJabatanId = "",
  onJabatanChange,
  namaBagian = "",
  onNamaBagianChange,
}) => {
  const [shouldRender, setRender] = useState(isOpen);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRender(true);
      const timer = setTimeout(() => setShow(true), 10);
      return () => clearTimeout(timer);
    }

    setShow(false);
    const timer = setTimeout(() => setRender(false), 150);
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

    const isInvalid = !String(namaBagian || "").trim() || !selectedJabatanId;
    if (isInvalid || isSubmitting || !onSubmit) {
      return;
    }

    await onSubmit();
  };

  const isInvalid = !String(namaBagian || "").trim() || !selectedJabatanId;

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
        className={`bg-white rounded-lg shadow-lg w-full max-w-xl overflow-hidden flex flex-col transition-all duration-150 transform ${
          show ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="bg-[#4279df] text-white px-6 py-4">
          <h2 className="text-xl font-medium">
            {modalMode === "edit" ? "Edit Bagian" : "Tambah Bagian"}
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 bg-[#f8f9fa] flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-gray-600 font-medium text-sm">Jabatan</label>
            <Dropdown
              value={selectedJabatanId}
              onChange={(event) => onJabatanChange?.(event.target.value)}
              disabled={isSubmitting}
              required
            >
              <option value="">Pilih jabatan</option>
              {jabatanList.map((jabatan) => (
                <option key={jabatan.id} value={String(jabatan.id)}>
                  {jabatan.nama}
                </option>
              ))}
            </Dropdown>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-gray-600 font-medium text-sm">
              Nama Bagian
            </label>
            <input
              type="text"
              value={namaBagian}
              onChange={(event) => onNamaBagianChange?.(event.target.value)}
              placeholder="Masukkan nama bagian"
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4279df] focus:border-transparent text-gray-700 text-sm"
              disabled={isSubmitting}
              required
            />
          </div>

          {errorMessage ? (
            <p className="text-sm text-red-600 whitespace-pre-line">
              {errorMessage}
            </p>
          ) : null}

          <div className="flex justify-end gap-3 mt-2">
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

export default ModalTambahBagian;

import { useEffect, useState } from "react";
import { listVendor } from "../../../api/vendorService";

const ModalTambahBarang = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  errorMessage = "",
}) => {
  const [shouldRender, setRender] = useState(isOpen);
  const [show, setShow] = useState(false);
  const [namaBarang, setNamaBarang] = useState("");
  const [satuan, setSatuan] = useState("");
  const [kategori, setKategori] = useState("atk_tahunan");
  const [tipe, setTipe] = useState("habis_pakai");
  const [harga, setHarga] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [vendors, setVendors] = useState([]);
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);

  const resetForm = () => {
    setNamaBarang("");
    setSatuan("");
    setKategori("atk_tahunan");
    setTipe("habis_pakai");
    setHarga("");
    setVendorId("");
  };

  const fetchVendors = async () => {
    setIsLoadingVendors(true);
    try {
      const data = await listVendor();
      setVendors(data);
      // Set first vendor as default if available
      if (data.length > 0) {
        setVendorId(String(data[0].id));
      }
    } catch (error) {
      console.error("Failed to fetch vendors:", error);
    } finally {
      setIsLoadingVendors(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetForm();
      setRender(true);
      const timer = setTimeout(() => setShow(true), 10);
      return () => clearTimeout(timer);
    }

    setShow(false);
    const timer = setTimeout(() => setRender(false), 150);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    // Set first vendor as default when vendors load and vendor not set
    if (vendors.length > 0 && !vendorId) {
      setVendorId(String(vendors[0].id));
    }
  }, [vendors]);

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!onSubmit || isSubmitting) {
      return;
    }

    await onSubmit({
      nama: namaBarang.trim(),
      kategori,
      tipe,
      unit: satuan.trim(),
      harga: Number(harga),
      vendor_id: Number(vendorId),
    });
  };

  const isInvalid =
    !namaBarang.trim() ||
    !satuan.trim() ||
    !harga ||
    Number(harga) < 0 ||
    !vendorId;

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
        className={`bg-white rounded-lg shadow-lg w-full max-w-2xl overflow-hidden flex flex-col transition-all duration-150 transform ${
          show ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#4279df] text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-medium">Tambah Barang</h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 bg-[#f8f9fa] flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-gray-600 font-medium text-sm">
              Nama Barang
            </label>
            <input
              type="text"
              placeholder="Masukkan Nama Barang"
              value={namaBarang}
              onChange={(e) => setNamaBarang(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4279df] focus:border-transparent text-gray-700 text-sm placeholder-gray-400"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-gray-600 font-medium text-sm">Satuan</label>
            <input
              type="text"
              placeholder="Contoh: pcs"
              value={satuan}
              onChange={(e) => setSatuan(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4279df] focus:border-transparent text-gray-700 text-sm placeholder-gray-400"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-600 font-medium text-sm">
                Kategori
              </label>
              <div className="relative">
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="w-full px-4 pr-10 py-2 bg-white border border-gray-300 rounded-full appearance-none focus:outline-none focus:ring-2 focus:ring-[#4279df] focus:border-transparent text-gray-700 text-sm"
                >
                  <option value="atk_tahunan">ATK Tahunan</option>
                  <option value="atk_ujian">ATK Ujian</option>
                  <option value="atk_kelas">ATK Kelas</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                  <svg
                    className="h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.51a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06Z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-gray-600 font-medium text-sm">Tipe</label>
              <div className="relative">
                <select
                  value={tipe}
                  onChange={(e) => setTipe(e.target.value)}
                  className="w-full px-4 pr-10 py-2 bg-white border border-gray-300 rounded-full appearance-none focus:outline-none focus:ring-2 focus:ring-[#4279df] focus:border-transparent text-gray-700 text-sm"
                >
                  <option value="habis_pakai">Habis Pakai</option>
                  <option value="tidak_habis_pakai">Tidak Habis Pakai</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                  <svg
                    className="h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.51a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06Z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-600 font-medium text-sm">Harga</label>
              <input
                type="number"
                min="0"
                placeholder="Contoh: 3000"
                value={harga}
                onChange={(e) => setHarga(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4279df] focus:border-transparent text-gray-700 text-sm placeholder-gray-400"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-gray-600 font-medium text-sm">
                Vendor
              </label>
              <div className="relative">
                <select
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                  disabled={isLoadingVendors || vendors.length === 0}
                  className="w-full px-4 pr-10 py-2 bg-white border border-gray-300 rounded-full appearance-none focus:outline-none focus:ring-2 focus:ring-[#4279df] focus:border-transparent text-gray-700 text-sm disabled:bg-gray-100 disabled:text-gray-500"
                  required
                >
                  <option value="">
                    {isLoadingVendors ? "Memuat vendor..." : "Pilih Vendor"}
                  </option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.nama}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                  <svg
                    className="h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.51a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06Z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {errorMessage ? (
            <p className="text-sm text-red-600 whitespace-pre-line">
              {errorMessage}
            </p>
          ) : null}

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-[#4279df] text-[#4279df] font-medium rounded-full hover:bg-blue-50 transition-colors text-sm"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#4279df] text-white hover:bg-blue-600 font-medium rounded-full text-sm disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
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

export default ModalTambahBarang;

import React, { useState, useEffect } from "react";
import { listJabatan } from "../../../api/jabatanService";
import { listUnitTypeByParentId } from "../../../api/unitTypeService";

const ModalTambahAkun = ({ isOpen, onClose }) => {
  const [shouldRender, setRender] = useState(isOpen);
  const [show, setShow] = useState(false);
  const [jabatanList, setJabatanList] = useState([]);
  const [selectedJabatanId, setSelectedJabatanId] = useState("");
  const [isLoadingJabatan, setIsLoadingJabatan] = useState(false);
  const [unitTypeList, setUnitTypeList] = useState([]);
  const [selectedUnitTypeId, setSelectedUnitTypeId] = useState("");
  const [isLoadingUnitType, setIsLoadingUnitType] = useState(false);

  const fetchJabatanList = async () => {
    setIsLoadingJabatan(true);

    try {
      const data = await listJabatan();
      const validData = data.filter(
        (item) =>
          String(item?.id ?? "").trim() && String(item?.nama ?? "").trim(),
      );
      setJabatanList(validData);
    } catch {
      setJabatanList([]);
      setSelectedJabatanId("");
    } finally {
      setIsLoadingJabatan(false);
    }
  };

  const fetchUnitTypeList = async (jabatanId) => {
    if (!jabatanId) {
      setUnitTypeList([]);
      setSelectedUnitTypeId("");
      return;
    }

    setIsLoadingUnitType(true);

    try {
      const data = await listUnitTypeByParentId(jabatanId);
      const normalizedData = data
        .map((item, index) => {
          const nama = String(item?.nama ?? item?.name ?? "").trim();
          const rawId = String(
            item?.id ?? item?.id_unit_type ?? item?.unit_type_id ?? "",
          ).trim();

          const optionValue = rawId || `unit-type-fallback-${index}`;
          const optionKey = `unit-type-${rawId || nama || "row"}-${index}`;

          return {
            ...item,
            nama,
            _optionValue: optionValue,
            _optionKey: optionKey,
          };
        })
        .filter((item) => item.nama);

      setUnitTypeList(normalizedData);
      setSelectedUnitTypeId("");
    } catch {
      setUnitTypeList([]);
      setSelectedUnitTypeId("");
    } finally {
      setIsLoadingUnitType(false);
    }
  };

  useEffect(() => {
    fetchJabatanList();
  }, []);

  useEffect(() => {
    fetchUnitTypeList(selectedJabatanId);
  }, [selectedJabatanId]);

  useEffect(() => {
    if (isOpen) {
      setSelectedJabatanId("");
      setSelectedUnitTypeId("");
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
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg shadow-lg w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-150 transform ${
          show ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#4279df] text-white px-6 py-4 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-medium">Tambah Akun</h2>
        </div>

        <div className="p-6 bg-[#f8f9fa] flex flex-col gap-4 overflow-y-auto">
          <div className="flex flex-col gap-1.5">
            <label className="text-gray-600 font-medium text-sm">NIP</label>
            <input
              type="text"
              placeholder="Masukkan NIP Anda"
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4279df] focus:border-transparent text-gray-700 text-sm placeholder-gray-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-gray-600 font-medium text-sm">
              Nama Lengkap
            </label>
            <input
              type="text"
              placeholder="Masukkan Nama Lengkap Anda"
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4279df] focus:border-transparent text-gray-700 text-sm placeholder-gray-400"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-1.5 w-1/2">
              <label className="text-gray-600 font-medium text-sm">
                Gelar Depan
              </label>
              <input
                type="text"
                placeholder="Masukkan Gelar Depan"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4279df] focus:border-transparent text-gray-700 text-sm placeholder-gray-400"
              />
            </div>
            <div className="flex flex-col gap-1.5 w-1/2">
              <label className="text-gray-600 font-medium text-sm">
                Gelar Belakang
              </label>
              <input
                type="text"
                placeholder="Masukkan Gelar Belakang"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4279df] focus:border-transparent text-gray-700 text-sm placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-gray-600 font-medium text-sm">Email</label>
            <input
              type="email"
              placeholder="Masukkan Email Anda"
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4279df] focus:border-transparent text-gray-700 text-sm placeholder-gray-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-gray-600 font-medium text-sm">
              Username
            </label>
            <input
              type="text"
              placeholder="Masukkan Username Anda"
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4279df] focus:border-transparent text-gray-700 text-sm placeholder-gray-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-gray-600 font-medium text-sm">
              Password
            </label>
            <input
              type="password"
              placeholder="Masukkan Password"
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4279df] focus:border-transparent text-gray-700 text-sm placeholder-gray-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-gray-600 font-medium text-sm">
              Jenis Kelamin
            </label>
            <div className="flex items-center gap-6 px-1 py-1 text-sm text-gray-500">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="jenis_kelamin"
                  className="w-4 h-4 accent-primary text-primary focus:ring-primary border-gray-300"
                  defaultChecked
                />
                Laki-laki
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="jenis_kelamin"
                  className="w-4 h-4 accent-primary text-primary focus:ring-primary border-gray-300"
                />
                Perempuan
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-gray-600 font-medium text-sm">Jabatan</label>
            <div className="relative">
              <select
                value={selectedJabatanId}
                onChange={(e) => setSelectedJabatanId(e.target.value)}
                disabled={isLoadingJabatan || jabatanList.length === 0}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-full appearance-none focus:outline-none focus:ring-2 focus:ring-[#4279df] focus:border-transparent text-gray-700 text-sm disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="">
                  {isLoadingJabatan ? "Memuat jabatan..." : "Pilih jabatan"}
                </option>
                {jabatanList.map((jabatan, index) => (
                  <option
                    key={`jabatan-${String(jabatan.id || "").trim() || index}`}
                    value={String(jabatan.id || "").trim()}
                  >
                    {jabatan.nama}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          {selectedJabatanId && (
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-600 font-medium text-sm">
                Pilih Bagian
              </label>
              <div className="relative">
                <select
                  value={selectedUnitTypeId}
                  onChange={(e) => setSelectedUnitTypeId(e.target.value)}
                  disabled={isLoadingUnitType || unitTypeList.length === 0}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-full appearance-none focus:outline-none focus:ring-2 focus:ring-[#4279df] focus:border-transparent text-gray-700 text-sm disabled:bg-gray-100 disabled:text-gray-500"
                >
                  <option value="">
                    {isLoadingUnitType
                      ? "Memuat bagian..."
                      : unitTypeList.length === 0
                        ? "Tidak ada bagian"
                        : "Pilih bagian"}
                  </option>
                  {unitTypeList.map((unitType) => (
                    <option
                      key={unitType._optionKey}
                      value={unitType._optionValue}
                    >
                      {unitType.nama}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          )}

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
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalTambahAkun;

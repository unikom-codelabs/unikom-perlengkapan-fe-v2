import React, { useState, useEffect } from "react";

const ModalEditAkun = ({ isOpen, onClose }) => {
  const [shouldRender, setRender] = useState(isOpen);
  const [show, setShow] = useState(false);

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
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg shadow-lg w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-150 transform ${
          show ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#4279df] text-white px-6 py-4 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-medium">Edit Akun</h2>
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
              Password Baru (Opsional)
            </label>
            <input
              type="password"
              placeholder="Kosongkan jika tidak ingin mengubah password"
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
                  name="jenis_kelamin_edit"
                  className="w-4 h-4 accent-primary text-primary focus:ring-primary border-gray-300"
                  defaultChecked
                />
                Laki-laki
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="jenis_kelamin_edit"
                  className="w-4 h-4 accent-primary text-primary focus:ring-primary border-gray-300"
                />
                Perempuan
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-gray-600 font-medium text-sm">Bagian</label>
            <div className="relative">
              <select className="w-full px-4 py-2 bg-white border border-gray-300 rounded-full appearance-none focus:outline-none focus:ring-2 focus:ring-[#4279df] focus:border-transparent text-gray-700 text-sm">
                <option value="" disabled selected hidden>
                  -- Pilih --
                </option>
                <option value="1">Bagian 1</option>
                <option value="2">Bagian 2</option>
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

          <div className="flex justify-end gap-3 mt-4 shrink-0">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-[#4279df] text-[#4279df] font-medium rounded-full hover:bg-blue-50 transition-colors text-sm"
            >
              Batal
            </button>
            <button className="px-6 py-2 bg-[#4279df] text-white hover:bg-[#3461b3] transition-colors font-medium rounded-full text-sm">
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalEditAkun;

import React from "react";
import {
  XMarkIcon,
  ArrowDownTrayIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

const dummyData = [
  {
    no: 1,
    nama: "Bidang Akademik dan Kemahasiswaan",
    bagian: "Wakil Rektor",
    status: "Belum Pengajuan",
  },
  {
    no: 2,
    nama: "Bidang Sumber Daya",
    bagian: "Wakil Rektor",
    status: "Belum Pengajuan",
  },
  {
    no: 3,
    nama: "Bidang Riset, Inovasi, dan Akreditasi",
    bagian: "Wakil Rektor",
    status: "Belum Pengajuan",
  },
  {
    no: 4,
    nama: "Bidang Teknologi Digital & ICT , International Program & Center Of Excellence",
    bagian: "Wakil Rektor",
    status: "Belum Pengajuan",
  },
  {
    no: 5,
    nama: "Fakultas Pascasarjana",
    bagian: "Dekan",
    status: "Belum Pengajuan",
  },
  {
    no: 6,
    nama: "Fakultas Teknik dan Ilmu Komputer",
    bagian: "Dekan",
    status: "Sudah Pengajuan",
  },
  {
    no: 7,
    nama: "Fakultas Ekonomi dan Bisnis",
    bagian: "Dekan",
    status: "Sudah Pengajuan",
  },
];

const DashboardDetailModal = ({ isOpen, onClose, title }) => {
  const [shouldRender, setRender] = React.useState(isOpen);
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
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
        className={`bg-white rounded-lg shadow-lg w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-150 transform ${
          show ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#4a77e5] text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Informasi {title}</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="space-y-4 mb-6 relative">
            <div className="grid grid-cols-[180px_1fr] items-center">
              <span className="text-gray-500">Pengajuan Tahun</span>
              <span className="text-gray-800">: 2025</span>
            </div>
            <div className="grid grid-cols-[180px_1fr] items-center">
              <span className="text-gray-500">Tanggal Aktivasi</span>
              <span className="text-gray-800">
                : Kamis, 18 September 2025 s/d Sabtu, 20 September 2025
              </span>
            </div>
            <div className="grid grid-cols-[180px_1fr] items-center">
              <span className="text-gray-500">Pengajuan Masuk</span>
              <span className="text-gray-800">
                : <span className="text-blue-600 font-semibold">73</span> dari
                118 Pengaju
              </span>
            </div>
            <div className="grid grid-cols-[180px_1fr] items-center">
              <span className="text-gray-500">Status Pengajuan</span>
              <span className="text-red-500">
                : Berakhir Sabtu, 20 September 2025
              </span>
            </div>
            <div className="absolute bottom-0 right-0">
              <button className="bg-[#427ced] hover:bg-blue-600 text-white px-5 py-2 rounded-full flex items-center gap-2 text-sm transition-colors shadow-sm">
                Export Semua <ArrowDownTrayIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="border border-gray-200 mt-4">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f4f6fa] border-b border-gray-200">
                <tr>
                  <th className="px-4 py-4 font-semibold text-gray-700 w-16 text-center">
                    No
                  </th>
                  <th className="px-4 py-4 font-semibold text-gray-700">
                    Nama
                  </th>
                  <th className="px-4 py-4 font-semibold text-gray-700">
                    Bagian
                  </th>
                  <th className="px-4 py-4 font-semibold text-gray-700 text-center">
                    Status
                  </th>
                  <th className="px-4 py-4 font-semibold text-gray-700 text-center w-40">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dummyData.map((item) => (
                  <tr key={item.no} className="hover:bg-gray-50 bg-white">
                    <td className="px-4 py-4 text-center text-gray-500">
                      {item.no}
                    </td>
                    <td className="px-4 py-4 text-gray-500">{item.nama}</td>
                    <td className="px-4 py-4 text-gray-500">{item.bagian}</td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          item.status === "Sudah Pengajuan"
                            ? "bg-[#a3e1c6] text-[#478f70] bg-opacity-70"
                            : "bg-gray-300 text-gray-600 bg-opacity-50"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center items-center gap-3 text-[#427ced]">
                        <button className="flex items-center gap-1 hover:text-blue-800 transition-colors">
                          Export <ArrowDownTrayIcon className="w-4 h-4" />
                        </button>
                        <span className="text-gray-300">|</span>
                        <button className="flex items-center gap-1 hover:text-blue-800 transition-colors">
                          Lihat <EyeIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardDetailModal;

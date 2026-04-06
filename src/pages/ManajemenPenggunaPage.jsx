import { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  MagnifyingGlassIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import ModalTambahAkun from "../components/Element/ModalTambahAkun";
import ModalEditAkun from "../components/Element/ModalEditAkun";
import ModalKonfirmasiHapus from "../components/Element/ModalKonfirmasiHapus";

const dataPengguna = [
  {
    id: 1,
    nip: "41273530006",
    nama: "Dr. Desayu Eka Surya, S.Sos., M.Si., CICS.",
    satuan: "Ketua Program Studi Program Studi Magister Ilmu Komunikasi",
  },
  {
    id: 2,
    nip: "41277004015",
    nama: "Tri Rahajoeningroem, M.T",
    satuan: "koordinator Laboratorium Telekomunikasi",
  },
  {
    id: 3,
    nip: "41277004019",
    nama: "Budi Herdiana, ST., MT.",
    satuan: "koordinator Laboratorium Rangkaian Listrik",
  },
  {
    id: 4,
    nip: "41277004018",
    nama: "Jana Utama, M.T",
    satuan: "koordinator Laboratorium Pengukuran Listrik",
  },
  {
    id: 5,
    nip: "41277004008",
    nama: "Dr. Muhammad Aria Rajasa Pohan, M.T",
    satuan: "koordinator Laboratorium PLC dan Sistem Cerdas",
  },
];

const ManajemenPenggunaPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalTambahAkunOpen, setIsModalTambahAkunOpen] = useState(false);
  const [isModalEditAkunOpen, setIsModalEditAkunOpen] = useState(false);
  const [isModalHapusOpen, setIsModalHapusOpen] = useState(false);
  const itemsPerPage = 10;

  const filteredData = dataPengguna.filter(
    (item) =>
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nip.includes(searchQuery),
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= maxVisiblePages - 1) {
        for (let i = 1; i <= maxVisiblePages; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (currentPage > totalPages - maxVisiblePages + 2) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - maxVisiblePages + 1; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  return (
    <>
      <Helmet>
        <title>Manajemen Pengguna | UNIKOM Perlengkapan</title>
      </Helmet>
      <div className="bg-white rounded border border-gray-200 w-full shadow-sm">
        <div className="bg-[#4279df] w-full text-white px-6 py-4 rounded-t">
          <h1 className="text-xl font-semibold">Daftar Akun</h1>
        </div>

        <div className="p-6">
          <div className="flex justify-end items-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Cari"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-[#4279df] w-full md:w-64"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              <button
                onClick={() => setIsModalTambahAkunOpen(true)}
                className="flex items-center space-x-1.5 bg-[#4279df] hover:bg-blue-600 text-white px-5 py-2.5 rounded-full transition-colors text-sm shadow-sm"
              >
                <span>Tambah Akun</span>
                <PlusIcon className="h-4 w-4 stroke-2" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f4f6fa] text-gray-700">
                  <th className="py-4 px-6 font-semibold border-b border-r border-gray-200 w-16 text-center">
                    No
                  </th>
                  <th className="py-4 px-6 font-semibold border-b border-r border-gray-200">
                    NIP
                  </th>
                  <th className="py-4 px-6 font-semibold border-b border-r border-gray-200">
                    Nama
                  </th>
                  <th className="py-4 px-6 font-semibold border-b border-r border-gray-200 text-center">
                    Satuan
                  </th>
                  <th className="py-4 px-6 font-semibold border-b border-gray-200 text-center w-48">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentData.length > 0 ? (
                  currentData.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50 bg-white">
                      <td className="py-4 px-6 border-r border-gray-200 text-gray-500 text-center">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="py-4 px-6 border-r border-gray-200 text-gray-600">
                        {item.nip}
                      </td>
                      <td className="py-4 px-6 border-r border-gray-200 text-gray-600">
                        {item.nama}
                      </td>
                      <td className="py-4 px-6 border-r border-gray-200 text-gray-500 text-center">
                        {item.satuan}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center space-x-3 text-sm">
                          <button
                            onClick={() => setIsModalEditAkunOpen(true)}
                            className="text-[#4a77e5] hover:text-blue-700 flex items-center space-x-1.5 transition-colors"
                          >
                            <span>Edit</span>
                            <PencilSquareIcon className="h-4 w-4" />
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => setIsModalHapusOpen(true)}
                            className="text-red-500 hover:text-red-600 flex items-center space-x-1.5 transition-colors"
                          >
                            <span>Hapus</span>
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500">
                      Tidak ada akun yang cocok dengan pencarian "{searchQuery}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end items-center mt-6">
            <nav className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>

              {getPageNumbers().map((page, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    typeof page === "number" && setCurrentPage(page)
                  }
                  disabled={page === "..."}
                  className={`px-3 py-1 rounded ${
                    currentPage === page
                      ? "bg-[#4279df] text-white"
                      : page === "..."
                        ? "text-gray-500 cursor-default"
                        : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2 rounded border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </nav>
          </div>
        </div>
      </div>
      <ModalTambahAkun
        isOpen={isModalTambahAkunOpen}
        onClose={() => setIsModalTambahAkunOpen(false)}
      />
      <ModalEditAkun
        isOpen={isModalEditAkunOpen}
        onClose={() => setIsModalEditAkunOpen(false)}
      />
      <ModalKonfirmasiHapus
        isOpen={isModalHapusOpen}
        onClose={() => setIsModalHapusOpen(false)}
        onConfirm={() => {
          // Logika penghapusan data masukan di sini
          setIsModalHapusOpen(false);
        }}
      />
    </>
  );
};

export default ManajemenPenggunaPage;

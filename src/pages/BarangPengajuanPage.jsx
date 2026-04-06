import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import {
  MagnifyingGlassIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import ModalTambahBarang from "../components/Element/ModalTambahBarang";
import ModalKonfirmasiHapus from "../components/Element/ModalKonfirmasiHapus";

const DUMMY_DATA_ATK = {
  tahunan: [
    { id: 1, nama: "Kertas HVS A4 70gr", satuan: "Rim" },
    { id: 2, nama: "Kertas HVS F4 70gr", satuan: "Rim" },
    { id: 3, nama: "Tinta Printer Hitam", satuan: "Botol" },
    { id: 4, nama: "Tinta Printer Warna", satuan: "Botol" },
    { id: 5, nama: "Isi Staples", satuan: "Box" },
  ],
  ujian: [
    { id: 1, nama: "Amplop F4 / D", satuan: "Buah" },
    { id: 2, nama: "Amplop A3 / XL", satuan: "Buah" },
    { id: 3, nama: "Lembar Jawaban", satuan: "Lembar" },
    { id: 4, nama: "Kertas Buram", satuan: "Pack" },
  ],
  kelas: [
    { id: 1, nama: "Spidol Whiteboard Hitam", satuan: "Box" },
    { id: 2, nama: "Spidol Whiteboard Biru", satuan: "Box" },
    { id: 3, nama: "Penghapus Whiteboard", satuan: "Buah" },
    { id: 4, nama: "Tinta Spidol Hitam", satuan: "Botol" },
  ],
};

const BarangPengajuanPage = () => {
  const [activeTab, setActiveTab] = useState("tahunan");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalHapusOpen, setIsModalHapusOpen] = useState(false);
  const itemsPerPage = 10;

  const currentTabData = useMemo(
    () => DUMMY_DATA_ATK[activeTab] || [],
    [activeTab],
  );

  const filteredData = currentTabData.filter((item) =>
    item.nama.toLowerCase().includes(searchQuery.toLowerCase()),
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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery("");
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
        <title>Barang Pengajuan | UNIKOM Perlengkapan</title>
      </Helmet>
      <div className="bg-white rounded border border-gray-200 w-full shadow-sm">
        <div className="bg-[#4279df] w-full text-white px-6 py-4 rounded-t">
          <h1 className="text-xl font-semibold">Data Barang Pengajuan</h1>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex space-x-2 border-b border-gray-200">
              <button
                onClick={() => handleTabChange("tahunan")}
                className={`pb-3 font-medium px-4 transition-colors ${
                  activeTab === "tahunan"
                    ? "text-[#4279df] border-b-2 border-[#4279df]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                ATK Tahunan
              </button>
              <button
                onClick={() => handleTabChange("ujian")}
                className={`pb-3 font-medium px-4 transition-colors ${
                  activeTab === "ujian"
                    ? "text-[#4279df] border-b-2 border-[#4279df]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                ATK Ujian
              </button>
              <button
                onClick={() => handleTabChange("kelas")}
                className={`pb-3 font-medium px-4 transition-colors ${
                  activeTab === "kelas"
                    ? "text-[#4279df] border-b-2 border-[#4279df]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                ATK Kelas
              </button>
            </div>

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
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-1.5 bg-[#4279df] hover:bg-blue-600 text-white px-5 py-2.5 rounded-full transition-colors text-sm shadow-sm"
              >
                <span>Tambah Barang</span>
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
                    Nama Barang
                  </th>
                  <th className="py-4 px-6 font-semibold border-b border-r border-gray-200 text-center w-40">
                    Satuan
                  </th>
                  <th className="py-4 px-6 font-semibold border-b border-gray-200 text-center w-40">
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
                        {item.nama}
                      </td>
                      <td className="py-4 px-6 border-r border-gray-200 text-gray-500 text-center">
                        {item.satuan}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center space-x-3 text-sm">
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
                    <td colSpan="4" className="py-8 text-center text-gray-500">
                      Tidak ada barang yang cocok dengan pencarian "
                      {searchQuery}"
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
      <ModalTambahBarang
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <ModalKonfirmasiHapus
        isOpen={isModalHapusOpen}
        onClose={() => setIsModalHapusOpen(false)}
        onConfirm={() => {
          setIsModalHapusOpen(false);
        }}
      />
    </>
  );
};

export default BarangPengajuanPage;

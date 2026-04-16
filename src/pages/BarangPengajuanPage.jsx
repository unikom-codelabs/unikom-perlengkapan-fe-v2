import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  MagnifyingGlassIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import ModalTambahBarang from "../components/Element/ModalTambahBarang";
import ModalKonfirmasiHapus from "../components/Element/ModalKonfirmasiHapus";
import { createBarang, deleteBarang, listBarang } from "../api/barangService";

const getApiErrorMessage = (error, fallbackMessage) => {
  const responseData = error?.response?.data;

  if (responseData?.errors && typeof responseData.errors === "object") {
    const detailedErrors = Object.values(responseData.errors)
      .flat()
      .filter(
        (message) => typeof message === "string" && message.trim().length > 0,
      );

    if (detailedErrors.length > 0) {
      return detailedErrors.join("\n");
    }
  }

  if (responseData?.message) {
    return responseData.message;
  }

  return fallbackMessage;
};

const BarangPengajuanPage = () => {
  const [activeTab, setActiveTab] = useState("tahunan");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [barangList, setBarangList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pageError, setPageError] = useState("");
  const [createError, setCreateError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalHapusOpen, setIsModalHapusOpen] = useState(false);
  const [selectedBarang, setSelectedBarang] = useState(null);
  const itemsPerPage = 10;

  const fetchBarang = async () => {
    setIsLoading(true);
    setPageError("");

    try {
      const data = await listBarang();
      setBarangList(data);
    } catch (error) {
      setPageError(
        getApiErrorMessage(error, "Gagal mengambil data barang. Coba lagi."),
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBarang();
  }, []);

  const currentTabData = useMemo(
    () => barangList.filter((item) => item.kategori === activeTab),
    [activeTab, barangList],
  );

  const filteredData = useMemo(
    () =>
      currentTabData.filter((item) =>
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [currentTabData, searchQuery],
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
      return;
    }

    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery("");
  };

  const handleOpenTambahBarang = () => {
    setCreateError("");
    setIsModalOpen(true);
  };

  const handleCreateBarang = async (payload) => {
    setCreateError("");
    setIsSubmitting(true);

    try {
      await createBarang(payload);
      setIsModalOpen(false);
      await fetchBarang();
    } catch (error) {
      setCreateError(
        getApiErrorMessage(error, "Gagal menambahkan barang. Coba lagi."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (barang) => {
    setSelectedBarang(barang);
    setIsModalHapusOpen(true);
  };

  const handleCloseDeleteModal = () => {
    if (isDeleting) {
      return;
    }

    setIsModalHapusOpen(false);
    setSelectedBarang(null);
  };

  const handleDeleteBarang = async () => {
    if (!selectedBarang?.id) {
      return;
    }

    setIsDeleting(true);
    setPageError("");

    try {
      await deleteBarang(selectedBarang.id);
      handleCloseDeleteModal();
      await fetchBarang();
    } catch (error) {
      setPageError(
        getApiErrorMessage(error, "Gagal menghapus barang. Coba lagi."),
      );
    } finally {
      setIsDeleting(false);
    }
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
                onClick={handleOpenTambahBarang}
                className="flex items-center space-x-1.5 bg-[#4279df] hover:bg-blue-600 text-white px-5 py-2.5 rounded-full transition-colors text-sm shadow-sm"
              >
                <span>Tambah Barang</span>
                <PlusIcon className="h-4 w-4 stroke-2" />
              </button>
            </div>
          </div>

          {pageError ? (
            <p className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {pageError}
            </p>
          ) : null}

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
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-500">
                      Memuat data barang...
                    </td>
                  </tr>
                ) : currentData.length > 0 ? (
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
                            onClick={() => handleOpenDeleteModal(item)}
                            className="text-red-500 hover:text-red-600 flex items-center space-x-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isDeleting}
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
        onSubmit={handleCreateBarang}
        isSubmitting={isSubmitting}
        errorMessage={createError}
      />
      <ModalKonfirmasiHapus
        isOpen={isModalHapusOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteBarang}
      />
    </>
  );
};

export default BarangPengajuanPage;

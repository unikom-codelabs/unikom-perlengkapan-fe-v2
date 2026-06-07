import { useEffect, useMemo, useState } from "react";
import PageHelmet from "../../components/Seo/PageHelmet";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import ActionIconButton from "../../components/Element/ActionIconButton";
import Table from "../../components/Element/Table";
import {
  createJabatan,
  deleteJabatan,
  listJabatan,
  updateJabatan,
} from "../../api/jabatanService";
import ModalTambahData from "../../components/Element/ModalTambahData";
import ModalKonfirmasiHapus from "../../components/Element/ModalKonfirmasiHapus";

const getApiErrorMessage = (error, fallbackMessage) => {
  const responseData = error?.response?.data;

  if (responseData?.message) {
    return responseData.message;
  }

  if (responseData?.error) {
    return responseData.error;
  }

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  if (error?.message) {
    return error.message;
  }

  return fallbackMessage;
};

const JabatanPage = () => {
  const [jabatanList, setJabatanList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [jabatanName, setJabatanName] = useState("");
  const [pageError, setPageError] = useState("");
  const [modalError, setModalError] = useState("");
  const [activeJabatan, setActiveJabatan] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const itemsPerPage = 10;

  const fetchJabatan = async () => {
    setIsLoading(true);
    setPageError("");

    try {
      const data = await listJabatan();
      setJabatanList(data);
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Gagal mengambil data jabatan."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJabatan();
  }, []);

  const handleOpenModal = () => {
    setModalMode("create");
    setActiveJabatan(null);
    setJabatanName("");
    setModalError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (jabatan) => {
    setModalMode("edit");
    setActiveJabatan(jabatan);
    setJabatanName(jabatan.nama || "");
    setModalError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) {
      return;
    }

    setIsModalOpen(false);
    setModalMode("create");
    setActiveJabatan(null);
    setJabatanName("");
    setModalError("");
  };

  const handleSubmitJabatan = async () => {
    setIsSubmitting(true);
    setModalError("");

    try {
      if (modalMode === "edit" && activeJabatan?.id) {
        await updateJabatan(activeJabatan.id, { nama: jabatanName });
      } else {
        await createJabatan({ nama: jabatanName });
      }

      handleCloseModal();
      await fetchJabatan();
    } catch (error) {
      setModalError(
        getApiErrorMessage(
          error,
          modalMode === "edit"
            ? "Gagal memperbarui jabatan."
            : "Gagal menambahkan jabatan.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (jabatan) => {
    setDeleteTarget(jabatan);
  };

  const handleCloseDeleteModal = () => {
    if (isDeleting) {
      return;
    }

    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) {
      return;
    }

    setIsDeleting(true);
    setPageError("");

    try {
      await deleteJabatan(deleteTarget.id);
      setDeleteTarget(null);
      await fetchJabatan();
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Gagal menghapus jabatan."));
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredJabatan = useMemo(
    () =>
      jabatanList.filter((item) =>
        String(item.nama || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase().trim()),
      ),
    [jabatanList, searchQuery],
  );
  const totalPages = Math.max(
    Math.ceil(filteredJabatan.length / itemsPerPage),
    1,
  );
  const safePage = Math.min(currentPage, totalPages);
  const paginatedJabatan = useMemo(() => {
    const startIndex = (safePage - 1) * itemsPerPage;
    return filteredJabatan.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredJabatan, itemsPerPage, safePage]);
  const rowNumberStart =
    filteredJabatan.length === 0 ? 0 : (safePage - 1) * itemsPerPage + 1;
  const tableRows = isLoading ? [] : paginatedJabatan;
  const emptyMessage = isLoading
    ? "Memuat data jabatan..."
    : searchQuery.trim()
      ? `Tidak ada jabatan yang cocok dengan pencarian "${searchQuery}".`
      : "Belum ada data jabatan.";

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else if (safePage <= maxVisiblePages - 1) {
      for (let i = 1; i <= maxVisiblePages; i++) {
        pageNumbers.push(i);
      }
      pageNumbers.push("...");
      pageNumbers.push(totalPages);
    } else if (safePage > totalPages - maxVisiblePages + 2) {
      pageNumbers.push(1);
      pageNumbers.push("...");
      for (let i = totalPages - maxVisiblePages + 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      pageNumbers.push("...");
      for (let i = safePage - 1; i <= safePage + 1; i++) {
        pageNumbers.push(i);
      }
      pageNumbers.push("...");
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <>
      <PageHelmet
        title="Manajemen Jabatan"
        description="Kelola data jabatan pengguna di UNIKOM Perlengkapan."
      />

      <div className="bg-white rounded border border-gray-200 w-full shadow-sm">
        <div className="bg-[#4279df] w-full text-white px-6 py-4 rounded-t">
          <h1 className="text-xl font-semibold">Daftar Jabatan</h1>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari jabatan"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-[#4279df]"
              />
            </div>

            <button
              type="button"
              onClick={handleOpenModal}
              className="flex items-center gap-2 bg-[#4279df] hover:bg-blue-600 text-white px-5 py-2.5 rounded-full transition-colors text-sm shadow-sm"
            >
              <span>Tambah Jabatan</span>
              <PlusIcon className="h-4 w-4 stroke-2" />
            </button>
          </div>

          {pageError ? (
            <p className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 whitespace-pre-line">
              {pageError}
            </p>
          ) : null}

          <Table
            title={null}
            columns={[
              { key: "no", label: "No" },
              { key: "nama", label: "Nama Jabatan" },
              { key: "aksi", label: "Aksi" },
            ]}
            rows={tableRows}
            emptyMessage={emptyMessage}
            wrapperClass="overflow-x-auto border border-gray-200"
            renderRow={(item, index) => (
              <tr key={item.id} className="border-t border-gray-100">
                <td className="px-6 py-4 text-gray-600 text-center">
                  {rowNumberStart + index}
                </td>
                <td className="px-6 py-4 text-gray-800">{item.nama}</td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <ActionIconButton
                      label="Edit"
                      icon={PencilSquareIcon}
                      onClick={() => handleOpenEditModal(item)}
                      disabled={isSubmitting || isDeleting}
                      variant="primary"
                    />
                    <ActionIconButton
                      label="Hapus"
                      icon={TrashIcon}
                      onClick={() => handleOpenDeleteModal(item)}
                      disabled={isSubmitting || isDeleting}
                      variant="danger"
                    />
                  </div>
                </td>
              </tr>
            )}
          />

          <div className="flex justify-end items-center mt-6">
            <nav className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={safePage === 1}
                className="p-2 rounded border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>

              {getPageNumbers().map((page, index) => (
                <button
                  key={`${page}-${index}`}
                  type="button"
                  onClick={() =>
                    typeof page === "number" && setCurrentPage(page)
                  }
                  disabled={page === "..."}
                  className={`px-3 py-1 rounded ${
                    safePage === page
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
                type="button"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={safePage === totalPages || totalPages === 0}
                className="p-2 rounded border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </nav>
          </div>
        </div>
      </div>

      <ModalTambahData
        isOpen={isModalOpen}
        title={modalMode === "edit" ? "Edit Jabatan" : "Tambah Jabatan"}
        label="Nama Jabatan"
        placeholder="Masukkan nama jabatan"
        submitLabel="Simpan"
        value={jabatanName}
        onValueChange={setJabatanName}
        onClose={handleCloseModal}
        onSubmit={handleSubmitJabatan}
        isSubmitting={isSubmitting}
        errorMessage={modalError}
      />

      <ModalKonfirmasiHapus
        isOpen={Boolean(deleteTarget)}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Konfirmasi Hapus Jabatan"
        message={`Apakah Anda yakin ingin menghapus jabatan "${deleteTarget?.nama ?? ""}"?`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        isProcessing={isDeleting}
      />
    </>
  );
};

export default JabatanPage;

import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  createVendor,
  deleteVendor,
  listVendor,
  updateVendor,
} from "../../api/vendorService";
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

const normalizeVendor = (item = {}) => ({
  id: Number(item.id),
  nama: String(item.nama ?? item.name ?? item.vendor ?? "-").trim() || "-",
});

const VendorPage = () => {
  const [vendors, setVendors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [vendorName, setVendorName] = useState("");
  const [pageError, setPageError] = useState("");
  const [modalError, setModalError] = useState("");
  const [activeVendor, setActiveVendor] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchVendor = async () => {
    setIsLoading(true);
    setPageError("");

    try {
      const data = await listVendor();
      setVendors(data.map(normalizeVendor));
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Gagal mengambil data vendor."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendor();
  }, []);

  const handleOpenModal = () => {
    setModalMode("create");
    setActiveVendor(null);
    setVendorName("");
    setModalError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (vendor) => {
    setModalMode("edit");
    setActiveVendor(vendor);
    setVendorName(vendor.nama || "");
    setModalError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) {
      return;
    }

    setIsModalOpen(false);
    setModalMode("create");
    setActiveVendor(null);
    setVendorName("");
    setModalError("");
  };

  const handleSubmitVendor = async () => {
    setIsSubmitting(true);
    setModalError("");

    try {
      if (modalMode === "edit" && activeVendor?.id) {
        await updateVendor(activeVendor.id, { name: vendorName });
      } else {
        await createVendor({ name: vendorName });
      }

      handleCloseModal();
      await fetchVendor();
    } catch (error) {
      setModalError(
        getApiErrorMessage(
          error,
          modalMode === "edit"
            ? "Gagal memperbarui vendor."
            : "Gagal menambahkan vendor.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (vendor) => {
    setDeleteTarget(vendor);
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
      await deleteVendor(deleteTarget.id);
      setDeleteTarget(null);
      await fetchVendor();
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Gagal menghapus vendor."));
    } finally {
      setIsDeleting(false);
    }
  };

  const rows = useMemo(
    () =>
      vendors
        .filter((item) => Number.isFinite(item.id) || item.nama !== "-")
        .filter((item) =>
          item.nama.toLowerCase().includes(searchQuery.toLowerCase().trim()),
        ),
    [searchQuery, vendors],
  );

  return (
    <>
      <Helmet>
        <title>Manajemen Vendor | UNIKOM Perlengkapan</title>
      </Helmet>

      <div className="bg-white rounded border border-gray-200 w-full shadow-sm">
        <div className="bg-[#4279df] w-full text-white px-6 py-4 rounded-t">
          <h1 className="text-xl font-semibold">Daftar Vendor</h1>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari vendor"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-[#4279df]"
              />
            </div>

            <button
              type="button"
              onClick={handleOpenModal}
              className="flex items-center gap-2 bg-[#4279df] hover:bg-blue-600 text-white px-5 py-2.5 rounded-full transition-colors text-sm shadow-sm"
            >
              <span>Tambah Vendor</span>
              <PlusIcon className="h-4 w-4 stroke-2" />
            </button>
          </div>

          {pageError ? (
            <p className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 whitespace-pre-line">
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
                    Nama Vendor
                  </th>
                  <th className="py-4 px-6 font-semibold border-b border-gray-200 text-center w-48">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-gray-500">
                      Memuat data vendor...
                    </td>
                  </tr>
                ) : rows.length > 0 ? (
                  rows.map((item, index) => (
                    <tr
                      key={`${item.id}-${index}`}
                      className="hover:bg-gray-50 bg-white"
                    >
                      <td className="py-4 px-6 border-r border-gray-200 text-gray-500 text-center">
                        {index + 1}
                      </td>
                      <td className="py-4 px-6 border-r border-gray-200 text-gray-600">
                        {item.nama}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center space-x-3 text-sm">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(item)}
                            className="text-[#4a77e5] hover:text-blue-700 flex items-center space-x-1.5 transition-colors"
                            disabled={isSubmitting || isDeleting}
                          >
                            <span>Edit</span>
                            <PencilSquareIcon className="h-4 w-4" />
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteModal(item)}
                            className="text-red-500 hover:text-red-600 flex items-center space-x-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting || isDeleting}
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
                    <td colSpan="3" className="py-8 text-center text-gray-500">
                      {searchQuery.trim()
                        ? `Tidak ada vendor yang cocok dengan pencarian "${searchQuery}".`
                        : "Belum ada data vendor."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ModalTambahData
        isOpen={isModalOpen}
        title={modalMode === "edit" ? "Edit Vendor" : "Tambah Vendor"}
        label="Nama Vendor"
        placeholder="Masukkan nama vendor"
        submitLabel={modalMode === "edit" ? "Perbarui" : "Simpan"}
        value={vendorName}
        onValueChange={setVendorName}
        onClose={handleCloseModal}
        onSubmit={handleSubmitVendor}
        isSubmitting={isSubmitting}
        errorMessage={modalError}
      />

      <ModalKonfirmasiHapus
        isOpen={Boolean(deleteTarget)}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Konfirmasi Hapus Vendor"
        message={`Apakah Anda yakin ingin menghapus vendor "${deleteTarget?.nama ?? ""}"?`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        isProcessing={isDeleting}
      />
    </>
  );
};

export default VendorPage;

import { useEffect, useMemo, useState } from "react";
import PageHelmet from "../../components/SEO/PageHelmet";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import ActionIconButton from "../../components/Element/ActionIconButton";
import Table from "../../components/Element/Table";
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
  kontak: String(item.kontak ?? item.contact ?? "").trim(),
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
  const [vendorKontak, setVendorKontak] = useState("");
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
    setVendorKontak("");
    setModalError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (vendor) => {
    setModalMode("edit");
    setActiveVendor(vendor);
    setVendorName(vendor.nama || "");
    setVendorKontak(vendor.kontak || "");
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
    setVendorKontak("");
    setModalError("");
  };

  const handleSubmitVendor = async () => {
    setIsSubmitting(true);
    setModalError("");

    try {
      if (modalMode === "edit" && activeVendor?.id) {
        await updateVendor(activeVendor.id, {
          name: vendorName,
          kontak: vendorKontak,
        });
      } else {
        await createVendor({ name: vendorName, kontak: vendorKontak });
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
  const tableRows = isLoading ? [] : rows;
  const emptyMessage = isLoading
    ? "Memuat data vendor..."
    : searchQuery.trim()
      ? `Tidak ada vendor yang cocok dengan pencarian "${searchQuery}".`
      : "Belum ada data vendor.";

  return (
    <>
      <PageHelmet
        title="Manajemen Vendor"
        description="Kelola data vendor penyedia barang perlengkapan UNIKOM."
      />

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

          <Table
            title={null}
            columns={[
              { key: "no", label: "No" },
              { key: "nama", label: "Nama Vendor" },
              { key: "kontak", label: "Kontak Personal" },
              { key: "aksi", label: "Aksi" },
            ]}
            rows={tableRows}
            emptyMessage={emptyMessage}
            wrapperClass="overflow-x-auto border border-gray-200"
            renderRow={(item, index) => (
              <tr
                key={`${item.id}-${index}`}
                className="border-t border-gray-100"
              >
                <td className="px-6 py-4 text-gray-600 text-center">
                  {index + 1}
                </td>
                <td className="px-6 py-4 text-gray-800 text-center">
                  {item.nama}
                </td>
                <td className="px-6 py-4 text-gray-600 text-center">
                  {item.kontak || "-"}
                </td>
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
        </div>
      </div>

      <ModalTambahData
        isOpen={isModalOpen}
        title={modalMode === "edit" ? "Edit Vendor" : "Tambah Vendor"}
        label="Nama Vendor"
        placeholder="Masukkan nama vendor"
        submitLabel="Simpan"
        value={vendorName}
        onValueChange={setVendorName}
        secondaryLabel="Kontak Personal"
        secondaryPlaceholder="Masukkan kontak personal"
        secondaryValue={vendorKontak}
        onSecondaryValueChange={setVendorKontak}
        secondaryRequired
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

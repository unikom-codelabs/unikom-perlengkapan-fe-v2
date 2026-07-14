import { useEffect, useMemo, useState } from "react";
import PageHelmet from "../../components/Seo/PageHelmet";
import { 
  MagnifyingGlassIcon, 
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  QueueListIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";
import { 
  listUnitTypeTree, 
  createUnitType, 
  updateUnitType, 
  deleteUnitType 
} from "../../api/unitTypeService";
import Table from "../../components/Element/Table";
import ActionIconButton from "../../components/Element/ActionIconButton";
import ModalTambahData from "../../components/Element/ModalTambahData";
import ModalKonfirmasiHapus from "../../components/Element/ModalKonfirmasiHapus";
import ModalKelolaUnit from "../../components/Element/ModalKelolaUnit";

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

const normalizeRows = (unitTypes = []) =>
  unitTypes
    .map((item, index) => {
      const jabatan = String(item?.nama ?? item?.name ?? "").trim();
      const rawId = String(
        item?.id ??
          item?.unit_id ??
          item?.id_unit_type ??
          item?.unit_type_id ??
          "",
      ).trim();
      const children = Array.isArray(item?.children) ? item.children : [];
      const units = children
        .map((unit) => String(unit?.nama ?? unit?.name ?? "").trim())
        .filter(Boolean);

      return {
        id: rawId ? rawId : `unit-type-${index + 1}`, // We use rawId so we can pass it directly to API
        jabatan,
        units,
        rawChildren: children,
      };
    })
    .filter((item) => item.jabatan);

const BagianPage = () => {
  const [rows, setRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isLoading, setIsLoading] = useState(false);
  const [pageError, setPageError] = useState("");

  const [isModalJabatanOpen, setIsModalJabatanOpen] = useState(false);
  const [modalJabatanMode, setModalJabatanMode] = useState("create");
  const [activeJabatan, setActiveJabatan] = useState(null);
  const [jabatanName, setJabatanName] = useState("");
  const [isSubmittingJabatan, setIsSubmittingJabatan] = useState(false);
  const [modalError, setModalError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isModalUnitOpen, setIsModalUnitOpen] = useState(false);
  const [activeParentJabatanId, setActiveParentJabatanId] = useState(null);

  const fetchDropdownBagian = async () => {
    setIsLoading(true);
    setPageError("");

    try {
      const unitTypes = await listUnitTypeTree();
      setRows(normalizeRows(unitTypes));
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Gagal mengambil data bagian."));
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdownBagian();
  }, []);

  const handleOpenModalJabatan = () => {
    setModalJabatanMode("create");
    setActiveJabatan(null);
    setJabatanName("");
    setModalError("");
    setIsModalJabatanOpen(true);
  };

  const handleOpenEditJabatan = (jabatan) => {
    setModalJabatanMode("edit");
    setActiveJabatan(jabatan);
    setJabatanName(jabatan.jabatan);
    setModalError("");
    setIsModalJabatanOpen(true);
  };

  const handleCloseModalJabatan = () => {
    if (isSubmittingJabatan) return;
    setIsModalJabatanOpen(false);
  };

  const handleSubmitJabatan = async () => {
    setIsSubmittingJabatan(true);
    setModalError("");

    try {
      if (modalJabatanMode === "edit" && activeJabatan?.id) {
        await updateUnitType(activeJabatan.id, { nama: jabatanName, parent_id: null });
      } else {
        await createUnitType({ nama: jabatanName, parent_id: null });
      }

      handleCloseModalJabatan();
      await fetchDropdownBagian();
    } catch (error) {
      setModalError(
        getApiErrorMessage(
          error,
          modalJabatanMode === "edit"
            ? "Gagal memperbarui jabatan."
            : "Gagal menambahkan jabatan."
        )
      );
    } finally {
      setIsSubmittingJabatan(false);
    }
  };

  const handleOpenDeleteModal = (jabatan) => {
    setDeleteTarget(jabatan);
  };

  const handleCloseDeleteModal = () => {
    if (isDeleting) return;
    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return;

    setIsDeleting(true);
    setPageError("");

    try {
      await deleteUnitType(deleteTarget.id);
      setDeleteTarget(null);
      await fetchDropdownBagian();
      if (activeParentJabatanId === deleteTarget.id) {
        setIsModalUnitOpen(false);
      }
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Gagal menghapus jabatan."));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenModalUnit = (jabatan) => {
    setActiveParentJabatanId(jabatan.id);
    setIsModalUnitOpen(true);
  };

  const handleCloseModalUnit = () => {
    setIsModalUnitOpen(false);
  };


  const filteredRows = useMemo(
    () =>
      rows.filter((item) => {
        const query = searchQuery.toLowerCase().trim();

        if (!query) {
          return true;
        }

        const unitsLabel = item.units.join(", ");

        return [item.jabatan, unitsLabel].some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(query),
        );
      }),
    [rows, searchQuery],
  );
  
  const totalPages = Math.max(
    Math.ceil(filteredRows.length / itemsPerPage),
    1,
  );
  const safePage = Math.min(currentPage, totalPages);
  
  const paginatedRows = useMemo(() => {
    const startIndex = (safePage - 1) * itemsPerPage;
    return filteredRows.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRows, itemsPerPage, safePage]);

  const rowNumberStart =
    filteredRows.length === 0 ? 0 : (safePage - 1) * itemsPerPage + 1;

  const tableRows = isLoading ? [] : paginatedRows;
  
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

  const emptyMessage = isLoading
    ? "Memuat data bagian..."
    : searchQuery.trim()
      ? `Tidak ada jabatan yang cocok dengan pencarian "${searchQuery}".`
      : "Tidak ada data bagian.";

  const currentActiveJabatan = useMemo(() => {
    if (!activeParentJabatanId) return null;
    return rows.find((r) => r.id === activeParentJabatanId) || null;
  }, [rows, activeParentJabatanId]);

  return (
    <>
      <PageHelmet
        title="Manajemen Bagian"
        description="Kelola data bagian dan struktur unit di UNIKOM Perlengkapan."
      />

      <div className="bg-white rounded border border-gray-200 w-full shadow-sm">
        <div className="bg-[#4279df] w-full text-white px-6 py-4 rounded-t">
          <h1 className="text-xl font-semibold">Daftar Bagian</h1>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari jabatan atau unit"
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
              onClick={handleOpenModalJabatan}
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
              { key: "no", label: "No", align: "center" },
              { key: "jabatan", label: "Nama Jabatan", align: "left" },
              { key: "unit", label: "Unit", align: "left" },
              { key: "aksi", label: "Aksi", align: "center" },
            ]}
            rows={tableRows}
            emptyMessage={emptyMessage}
            wrapperClass="overflow-x-auto border border-gray-200"
            renderRow={(item, index) => (
              <tr key={item.id} className="border-t border-gray-100">
                <td className="px-6 py-4 text-gray-600 text-center">
                  {rowNumberStart + index}
                </td>
                <td className="px-6 py-4 text-gray-800 text-left">{item.jabatan}</td>
                <td className="px-6 py-4 text-left">
                  {item.units.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {item.units.map((unit) => (
                        <span
                          key={`${item.id}-${unit}`}
                          className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm text-[#4279df]"
                        >
                          {unit}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center min-w-[150px]">
                  <div className="flex items-center justify-center gap-1">
                    <ActionIconButton
                      label="Kelola Unit"
                      icon={QueueListIcon}
                      onClick={() => handleOpenModalUnit(item)}
                      disabled={isSubmittingJabatan || isDeleting}
                      variant="primary"
                    />
                    <ActionIconButton
                      label="Edit"
                      icon={PencilSquareIcon}
                      onClick={() => handleOpenEditJabatan(item)}
                      disabled={isSubmittingJabatan || isDeleting}
                      variant="primary"
                    />
                    <ActionIconButton
                      label="Hapus"
                      icon={TrashIcon}
                      onClick={() => handleOpenDeleteModal(item)}
                      disabled={isSubmittingJabatan || isDeleting}
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
        isOpen={isModalJabatanOpen}
        title={modalJabatanMode === "edit" ? "Edit Jabatan" : "Tambah Jabatan"}
        label="Nama Jabatan"
        placeholder="Masukkan nama jabatan"
        submitLabel="Simpan"
        value={jabatanName}
        onValueChange={setJabatanName}
        onClose={handleCloseModalJabatan}
        onSubmit={handleSubmitJabatan}
        isSubmitting={isSubmittingJabatan}
        errorMessage={modalError}
      />

      <ModalKonfirmasiHapus
        isOpen={Boolean(deleteTarget)}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Konfirmasi Hapus Jabatan"
        message={`Apakah Anda yakin ingin menghapus jabatan "${deleteTarget?.jabatan ?? ""}" beserta unit di bawahnya?`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        isProcessing={isDeleting}
      />

      <ModalKelolaUnit
        isOpen={isModalUnitOpen}
        onClose={handleCloseModalUnit}
        jabatan={currentActiveJabatan}
        onRefresh={fetchDropdownBagian}
      />
    </>
  );
};

export default BagianPage;

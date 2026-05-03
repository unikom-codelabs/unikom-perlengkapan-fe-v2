import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { listJabatan } from "../../api/jabatanService";
import {
  createUnitType,
  deleteUnitType,
  listUnitType,
  listUnitTypeByParentId,
  updateUnitType,
} from "../../api/unitTypeService";
import ModalTambahBagian from "../../components/Element/ModalTambahBagian";
import ModalKonfirmasiHapus from "../../components/Element/ModalKonfirmasiHapus";

const getApiErrorMessage = (error, fallbackMessage) => {
  const responseData = error?.response?.data;

  if (responseData?.errors && typeof responseData.errors === "object") {
    const validationErrors = Object.values(responseData.errors)
      .flat()
      .filter((message) => typeof message === "string" && message.trim());

    if (validationErrors.length > 0) {
      return validationErrors.join("\n");
    }
  }

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

const normalizeBagian = (item = {}, jabatanMap = new Map()) => {
  const rawJabatanId =
    item.parentId ??
    item.parent_id ??
    item.unit_parent_id ??
    item.jabatanId ??
    item.jabatan_id;
  const jabatanId =
    rawJabatanId === undefined || rawJabatanId === null || rawJabatanId === ""
      ? null
      : String(rawJabatanId).trim();
  const bagianId = String(
    item.id ?? item.unit_id ?? item.id_unit_type ?? item.unit_type_id ?? "",
  ).trim();

  return {
    id: bagianId,
    nama: String(item.nama ?? item.name ?? "-").trim() || "-",
    jabatanId,
    jabatanNama:
      String(item.parentNama ?? "").trim() ||
      (jabatanId == null ? "-" : jabatanMap.get(jabatanId) || "-"),
  };
};

const BagianPage = () => {
  const [jabatanList, setJabatanList] = useState([]);
  const [bagianList, setBagianList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingJabatan, setIsLoadingJabatan] = useState(false);
  const [isLoadingBagian, setIsLoadingBagian] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [activeJabatanId, setActiveJabatanId] = useState("");
  const [selectedJabatanId, setSelectedJabatanId] = useState("");
  const [bagianName, setBagianName] = useState("");
  const [activeBagian, setActiveBagian] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [pageError, setPageError] = useState("");
  const [modalError, setModalError] = useState("");

  const isLoading = isLoadingJabatan || isLoadingBagian;

  const jabatanMap = useMemo(
    () =>
      new Map(
        jabatanList.map((jabatan) => [String(jabatan.id).trim(), jabatan.nama]),
      ),
    [jabatanList],
  );

  const activeJabatanName = useMemo(
    () => jabatanMap.get(String(activeJabatanId).trim()) || "",
    [activeJabatanId, jabatanMap],
  );

  const normalizeBagianRows = (
    unitTypeData = [],
    targetJabatanId = "",
    { strictParentMatch = true } = {},
  ) => {
    const targetId = String(targetJabatanId).trim();
    const uniqueBagianMap = new Map();

    unitTypeData
      .map((item) => {
        const hasParentInfo =
          item?.parentId !== undefined ||
          item?.parent_id !== undefined ||
          item?.unit_parent_id !== undefined ||
          item?.jabatan_id !== undefined ||
          item?.id_jabatan !== undefined;

        const itemWithParentFallback = hasParentInfo
          ? item
          : { ...item, parent_id: targetId };

        return normalizeBagian(itemWithParentFallback, jabatanMap);
      })
      .filter((item) => {
        if (!item.id || item.jabatanId === null) {
          return false;
        }

        if (!strictParentMatch) {
          return true;
        }

        return String(item.jabatanId).trim() === targetId;
      })
      .forEach((item) => {
        uniqueBagianMap.set(item.id, item);
      });

    return Array.from(uniqueBagianMap.values()).sort((a, b) =>
      a.nama.localeCompare(b.nama),
    );
  };

  const fetchBagianByJabatan = async (jabatanId) => {
    const targetId = String(jabatanId || "").trim();

    if (!targetId) {
      setBagianList([]);
      return;
    }

    setIsLoadingBagian(true);
    setPageError("");

    try {
      let unitTypeData = await listUnitTypeByParentId(targetId);
      let normalizedBagian = normalizeBagianRows(unitTypeData, targetId, {
        strictParentMatch: true,
      });

      if (normalizedBagian.length === 0) {
        normalizedBagian = normalizeBagianRows(unitTypeData, targetId, {
          strictParentMatch: false,
        });
      }

      if (normalizedBagian.length === 0) {
        unitTypeData = await listUnitType();
        normalizedBagian = normalizeBagianRows(unitTypeData, targetId, {
          strictParentMatch: true,
        });
      }

      setBagianList(normalizedBagian);
    } catch (error) {
      setPageError(
        getApiErrorMessage(error, "Gagal mengambil data bagian unit type."),
      );
      setBagianList([]);
    } finally {
      setIsLoadingBagian(false);
    }
  };

  const fetchJabatan = async () => {
    setIsLoadingJabatan(true);
    setPageError("");

    try {
      const jabatanData = await listJabatan();
      const filteredJabatan = jabatanData.filter(
        (item) =>
          String(item.id || "").trim() && String(item.nama || "").trim(),
      );

      setJabatanList(filteredJabatan);

      const hasActiveJabatan = filteredJabatan.some(
        (item) => String(item.id).trim() === String(activeJabatanId).trim(),
      );

      if (!hasActiveJabatan) {
        setActiveJabatanId(
          filteredJabatan[0] ? String(filteredJabatan[0].id) : "",
        );
      }
    } catch (error) {
      setPageError(
        getApiErrorMessage(error, "Gagal mengambil data jabatan kategori."),
      );
      setJabatanList([]);
      setBagianList([]);
    } finally {
      setIsLoadingJabatan(false);
    }
  };

  useEffect(() => {
    fetchJabatan();
  }, []);

  useEffect(() => {
    if (!activeJabatanId || jabatanList.length === 0) {
      setBagianList([]);
      return;
    }

    fetchBagianByJabatan(activeJabatanId);
  }, [activeJabatanId, jabatanList]);

  const handleOpenCreateModal = () => {
    setModalMode("create");
    setActiveBagian(null);
    setBagianName("");
    setSelectedJabatanId(
      activeJabatanId || (jabatanList[0] ? String(jabatanList[0].id) : ""),
    );
    setModalError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (bagian) => {
    setModalMode("edit");
    setActiveBagian(bagian);
    setBagianName(bagian.nama || "");
    setSelectedJabatanId(
      bagian.jabatanId == null ? "" : String(bagian.jabatanId),
    );
    setModalError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) {
      return;
    }

    setIsModalOpen(false);
    setModalMode("create");
    setActiveBagian(null);
    setBagianName("");
    setSelectedJabatanId("");
    setModalError("");
  };

  const handleSubmitBagian = async () => {
    const targetJabatanId = String(selectedJabatanId || "").trim();
    const payload = {
      name: bagianName,
      parent_id: targetJabatanId,
    };

    if (!payload.name.trim() || !targetJabatanId) {
      return;
    }

    setIsSubmitting(true);
    setModalError("");

    try {
      if (modalMode === "edit" && activeBagian?.id) {
        await updateUnitType(activeBagian.id, payload);
      } else {
        await createUnitType(payload);
      }

      handleCloseModal();
      if (targetJabatanId !== String(activeJabatanId || "").trim()) {
        setActiveJabatanId(targetJabatanId);
      } else {
        await fetchBagianByJabatan(targetJabatanId);
      }
    } catch (error) {
      setModalError(
        getApiErrorMessage(
          error,
          modalMode === "edit"
            ? "Gagal memperbarui bagian."
            : "Gagal menambahkan bagian.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (bagian) => {
    setDeleteTarget(bagian);
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
      await deleteUnitType(deleteTarget.id);
      setDeleteTarget(null);
      await fetchBagianByJabatan(activeJabatanId);
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Gagal menghapus bagian."));
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredRows = useMemo(
    () =>
      bagianList.filter((item) => {
        const query = searchQuery.toLowerCase().trim();

        if (!query) {
          return true;
        }

        return item.nama.toLowerCase().includes(query);
      }),
    [bagianList, searchQuery],
  );

  return (
    <>
      <Helmet>
        <title>Manajemen Bagian | UNIKOM Perlengkapan</title>
      </Helmet>

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
                placeholder="Cari bagian atau jabatan"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-[#4279df]"
              />
            </div>

            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 bg-[#4279df] hover:bg-blue-600 text-white px-5 py-2.5 rounded-full transition-colors text-sm shadow-sm"
              disabled={jabatanList.length === 0}
            >
              <span>Tambah Bagian</span>
              <PlusIcon className="h-4 w-4 stroke-2" />
            </button>
          </div>

          {jabatanList.length === 0 && !isLoading ? (
            <p className="mb-4 rounded border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm text-yellow-700">
              Data jabatan belum tersedia. Tambahkan jabatan terlebih dahulu
              sebelum membuat bagian.
            </p>
          ) : null}

          {pageError ? (
            <p className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 whitespace-pre-line">
              {pageError}
            </p>
          ) : null}

          {jabatanList.length > 0 ? (
            <div className="mb-4">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {jabatanList.map((jabatan) => {
                  const jabatanId = String(jabatan.id).trim();
                  const isActive = jabatanId === String(activeJabatanId).trim();

                  return (
                    <button
                      key={jabatan.id}
                      type="button"
                      onClick={() => setActiveJabatanId(jabatanId)}
                      className={`whitespace-nowrap px-4 py-2 rounded-full text-sm border transition-colors ${
                        isActive
                          ? "bg-[#4279df] text-white border-[#4279df]"
                          : "bg-white text-gray-600 border-gray-300 hover:border-[#4279df] hover:text-[#4279df]"
                      }`}
                    >
                      {jabatan.nama}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="overflow-x-auto border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f4f6fa] text-gray-700">
                  <th className="py-4 px-6 font-semibold border-b border-r border-gray-200 w-16 text-center">
                    No
                  </th>
                  <th className="py-4 px-6 font-semibold border-b border-r border-gray-200">
                    Nama Bagian
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
                      Memuat data bagian...
                    </td>
                  </tr>
                ) : filteredRows.length > 0 ? (
                  filteredRows.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50 bg-white">
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
                        ? `Tidak ada bagian pada tab ${activeJabatanName || "jabatan aktif"} yang cocok dengan pencarian "${searchQuery}".`
                        : `Belum ada data bagian untuk ${activeJabatanName || "jabatan aktif"}.`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ModalTambahBagian
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitBagian}
        modalMode={modalMode}
        isSubmitting={isSubmitting}
        errorMessage={modalError}
        jabatanList={jabatanList}
        selectedJabatanId={selectedJabatanId}
        onJabatanChange={setSelectedJabatanId}
        namaBagian={bagianName}
        onNamaBagianChange={setBagianName}
      />

      <ModalKonfirmasiHapus
        isOpen={Boolean(deleteTarget)}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Konfirmasi Hapus Bagian"
        message={`Apakah Anda yakin ingin menghapus bagian "${deleteTarget?.nama ?? ""}"?`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        isProcessing={isDeleting}
      />
    </>
  );
};

export default BagianPage;

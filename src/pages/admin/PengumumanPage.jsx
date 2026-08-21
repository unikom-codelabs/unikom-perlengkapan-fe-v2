import { useEffect, useMemo, useState } from "react";
import PageHelmet from "../../components/Seo/PageHelmet";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import ActionIconButton from "../../components/Element/ActionIconButton";
import ModalBuatPengumuman from "../../components/Element/ModalBuatPengumuman";
import ModalKonfirmasiHapus from "../../components/Element/ModalKonfirmasiHapus";
import ModalDetailPengumuman from "../../components/Element/ModalDetailPengumuman";
import Pagination from "../../components/Element/Pagination";
import {
  createPengumuman,
  deletePengumuman,
  listPengumuman,
  updatePengumuman,
} from "../../api/pengumumanService";

import { sanitizeRichText, stripHtml } from "../../utils/sanitizeHtml";

const formatDateTime = (dateText) => {
  if (!dateText) {
    return "-";
  }

  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) {
    return dateText;
  }

  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

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

const PengumumanPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pageError, setPageError] = useState("");
  const [modalError, setModalError] = useState("");
  const [pengumumanData, setPengumumanData] = useState([]);
  const [activePengumuman, setActivePengumuman] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailPengumuman, setDetailPengumuman] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const fetchPengumuman = async () => {
    setIsLoading(true);
    setPageError("");

    try {
      const data = await listPengumuman();
      setPengumumanData(data);
    } catch (error) {
      setPageError(
        getApiErrorMessage(
          error,
          "Gagal mengambil data pengumuman. Coba lagi.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPengumuman();
  }, []);

  const filteredPengumuman = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) {
      return pengumumanData;
    }

    return pengumumanData.filter((item) => {
      const judul = item.judul.toLowerCase();
      const deskripsi = stripHtml(item.teks || item.deskripsi).toLowerCase();
      const author = String(item.author || "").toLowerCase();

      return (
        judul.includes(query) ||
        deskripsi.includes(query) ||
        author.includes(query)
      );
    });
  }, [pengumumanData, searchQuery]);

  const totalPages = Math.ceil(filteredPengumuman.length / ITEMS_PER_PAGE);

  // Daftar bisa menyusut setelah pencarian atau penghapusan, jadi halaman aktif
  // dijepit ke rentang yang masih ada supaya tidak menampilkan halaman kosong.
  const actualPage =
    totalPages === 0 ? 1 : Math.min(currentPage, totalPages);

  const paginatedPengumuman = useMemo(() => {
    const start = (actualPage - 1) * ITEMS_PER_PAGE;
    return filteredPengumuman.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPengumuman, actualPage]);

  const handleOpenTambah = () => {
    setActivePengumuman(null);
    setModalError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setActivePengumuman(item);
    setModalError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) {
      return;
    }

    setIsModalOpen(false);
    setActivePengumuman(null);
    setModalError("");
  };

  const handleSubmitPengumuman = async (payload) => {
    setIsSubmitting(true);
    setModalError("");

    try {
      if (activePengumuman?.id) {
        await updatePengumuman(activePengumuman.id, payload);
      } else {
        await createPengumuman(payload);
      }

      handleCloseModal();
      await fetchPengumuman();
    } catch (error) {
      setModalError(
        getApiErrorMessage(error, "Gagal menyimpan pengumuman. Coba lagi."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDelete = (item) => {
    setDeleteTarget(item);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDelete = () => {
    if (isDeleting) {
      return;
    }

    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) {
      return;
    }

    setIsDeleting(true);
    setPageError("");

    try {
      await deletePengumuman(deleteTarget.id);
      handleCloseDelete();
      await fetchPengumuman();
    } catch (error) {
      setPageError(
        getApiErrorMessage(error, "Gagal menghapus pengumuman. Coba lagi."),
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenDetail = (item, contentHtml) => {
    setDetailPengumuman({
      ...item,
      contentHtml,
    });
  };

  const handleCloseDetail = () => {
    setDetailPengumuman(null);
  };

  return (
    <>
      <PageHelmet
        title="Pengumuman"
        description="Kelola pengumuman yang tampil pada aplikasi UNIKOM Perlengkapan."
      />

      <div className="bg-white rounded shadow-sm mb-6">
        <div className="bg-[#4773da] text-white px-6 py-4 rounded-t">
          <h1 className="text-xl font-semibold">Pengumuman</h1>
        </div>

        <div className="p-6">
          {}
          <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mb-6">
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                placeholder="Cari"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <button
              onClick={handleOpenTambah}
              className="flex items-center justify-center gap-2 bg-[#4773da] hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors w-full sm:w-auto"
            >
              Tambah Pengumuman <PlusIcon className="h-4 w-4 stroke-2" />
            </button>
          </div>

          {pageError ? (
            <p className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 whitespace-pre-line">
              {pageError}
            </p>
          ) : null}

          <div className="flex flex-col gap-6">
            {isLoading ? (
              <div className="py-10 text-center text-gray-500">
                Memuat pengumuman...
              </div>
            ) : filteredPengumuman.length > 0 ? (
              paginatedPengumuman.map((item) => {
                const sanitizedHtml = sanitizeRichText(
                  item.teks || item.deskripsi || "",
                );
                const plainText = stripHtml(sanitizedHtml);
                const isLongContent = plainText.length > 280;
                const handleOpenDetailFromCard = () =>
                  handleOpenDetail(item, sanitizedHtml);
                const previewClampStyle = isLongContent
                  ? {
                      display: "-webkit-box",
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }
                  : undefined;

                return (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow duration-300">
                    <div className="p-4 md:p-6 flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-48 shrink-0">
                        <button
                          type="button"
                          className="w-full aspect-4/3 md:aspect-3/4 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden cursor-zoom-in group"
                          onClick={handleOpenDetailFromCard}
                          title="Lihat gambar"
                        >
                          {item.gambarUrl ? (
                            <img
                              src={item.gambarUrl}
                              alt={item.judul}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <span className="text-gray-400 text-sm">
                              Tidak ada gambar
                            </span>
                          )}
                        </button>
                      </div>
                      <div className="flex flex-col grow">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h2 
                              className="text-xl font-bold text-gray-800 mb-2 hover:text-[#4773da] transition-colors cursor-pointer"
                              onClick={handleOpenDetailFromCard}
                            >
                              {item.judul}
                            </h2>
                            <div className="flex flex-wrap items-center text-sm text-gray-500 mb-4 gap-2 md:gap-3">
                              <span className="font-medium text-gray-700">Oleh: {item.author}</span>
                              <span className="hidden md:inline text-gray-300">&bull;</span>
                              <span>{formatDateTime(item.createdAt)}</span>
                            </div>
                          </div>
                          
                          {}
                          <div className="flex items-center gap-2 shrink-0">
                            <ActionIconButton
                              label="Edit"
                              icon={PencilSquareIcon}
                              onClick={() => handleOpenEdit(item)}
                              disabled={isSubmitting || isDeleting}
                              variant="neutral"
                              className="bg-gray-50 text-[#4773da] hover:text-[#2f57b9] hover:bg-[#f0f5ff] shadow-sm border border-gray-200"
                            />
                            <ActionIconButton
                              label="Hapus"
                              icon={TrashIcon}
                              onClick={() => handleOpenDelete(item)}
                              disabled={isSubmitting || isDeleting}
                              variant="neutral"
                              className="bg-red-50 text-red-600 hover:text-red-700 hover:bg-red-100 border border-red-100"
                            />
                          </div>
                        </div>

                        <div className="pengumuman-richtext mb-6 text-[15px] leading-relaxed text-gray-600">
                          <div
                            style={previewClampStyle}
                            dangerouslySetInnerHTML={{
                              __html: sanitizedHtml || "<p>-</p>",
                            }}
                          />
                        </div>

                        <div className="mt-auto flex justify-start">
                          {isLongContent && (
                            <button
                              type="button"
                              className="inline-flex items-center text-[#4773da] text-sm font-semibold hover:text-[#3e64ca] transition-colors group cursor-pointer bg-transparent border-none p-0"
                              onClick={handleOpenDetailFromCard}
                            >
                              Baca Selengkapnya
                              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-10 text-center text-gray-500 border border-gray-200 rounded">
                Tidak ada pengumuman.
              </div>
            )}
          </div>

          <Pagination
            currentPage={actualPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <ModalBuatPengumuman
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitPengumuman}
        isSubmitting={isSubmitting}
        errorMessage={modalError}
        initialData={activePengumuman}
      />
      <ModalKonfirmasiHapus
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
      />
      <ModalDetailPengumuman
        isOpen={Boolean(detailPengumuman)}
        onClose={handleCloseDetail}
        judul={detailPengumuman?.judul}
        author={detailPengumuman?.author}
        createdAt={formatDateTime(detailPengumuman?.createdAt)}
        gambarUrl={detailPengumuman?.gambarUrl}
        contentHtml={detailPengumuman?.contentHtml}
      />
    </>
  );
};

export default PengumumanPage;

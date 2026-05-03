import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import ModalBuatPengumuman from "../../components/Element/ModalBuatPengumuman";
import ModalKonfirmasiHapus from "../../components/Element/ModalKonfirmasiHapus";
import ModalDetailPengumuman from "../../components/Element/ModalDetailPengumuman";
import {
  createPengumuman,
  deletePengumuman,
  listPengumuman,
  updatePengumuman,
} from "../../api/pengumumanService";

const decodeHtmlEntities = (text = "") => {
  const parser = new DOMParser();
  const document = parser.parseFromString(String(text), "text/html");
  return document.documentElement.textContent || "";
};

const stripHtml = (htmlText = "") =>
  decodeHtmlEntities(String(htmlText).replace(/<[^>]*>/g, " "))
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const sanitizeRichText = (htmlText = "") => {
  const parser = new DOMParser();
  const document = parser.parseFromString(String(htmlText || ""), "text/html");
  const allowedTags = new Set([
    "P",
    "BR",
    "STRONG",
    "B",
    "EM",
    "I",
    "U",
    "S",
    "UL",
    "OL",
    "LI",
    "A",
    "BLOCKQUOTE",
  ]);

  document
    .querySelectorAll("script,style,iframe,object,embed,link,meta,base,form")
    .forEach((node) => node.remove());

  document.body.querySelectorAll("*").forEach((element) => {
    const tagName = element.tagName.toUpperCase();

    if (!allowedTags.has(tagName)) {
      element.replaceWith(...element.childNodes);
      return;
    }

    [...element.attributes].forEach((attribute) => {
      const attributeName = attribute.name.toLowerCase();

      if (
        attributeName.startsWith("on") ||
        attributeName === "style" ||
        attributeName === "class" ||
        attributeName === "id"
      ) {
        element.removeAttribute(attribute.name);
        return;
      }

      if (tagName === "A" && attributeName === "href") {
        const value = attribute.value.trim();
        if (!/^(https?:|mailto:|tel:|#|\/)/i.test(value)) {
          element.removeAttribute("href");
        }
        return;
      }

      if (!(tagName === "A" && attributeName === "href")) {
        element.removeAttribute(attribute.name);
      }
    });

    if (tagName === "A") {
      element.setAttribute("target", "_blank");
      element.setAttribute("rel", "noopener noreferrer");
    }
  });

  return document.body.innerHTML.replace(/&nbsp;|&#160;/gi, " ").trim();
};

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
      <Helmet>
        <title>Pengumuman | UNIKOM Perlengkapan</title>
      </Helmet>

      <div className="bg-white rounded shadow-sm overflow-hidden mb-6">
        <div className="bg-[#4773da] text-white px-6 py-4">
          <h1 className="text-xl font-semibold">Pengumuman</h1>
        </div>

        <div className="p-6">
          {/* Toolbar */}
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
                onChange={(e) => setSearchQuery(e.target.value)}
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

          <div className="flex flex-col gap-8">
            {isLoading ? (
              <div className="py-10 text-center text-gray-500">
                Memuat pengumuman...
              </div>
            ) : filteredPengumuman.length > 0 ? (
              filteredPengumuman.map((item) => {
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
                  <div key={item.id} className="bg-white">
                    <div className="bg-[#3e64ca] px-6 py-4 flex justify-between items-center text-white">
                      <h2 className="font-semibold tracking-wide">
                        {item.judul}
                      </h2>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 bg-white text-[#4773da] rounded-full hover:bg-gray-100 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isSubmitting || isDeleting}
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(item)}
                          className="p-2 bg-[#d84841] text-white rounded-full hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isSubmitting || isDeleting}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col md:flex-row gap-6 border-x border-b border-gray-200">
                      <div className="w-full md:w-62.5 shrink-0">
                        <button
                          type="button"
                          className="w-full aspect-3/4 border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden cursor-zoom-in"
                          onClick={handleOpenDetailFromCard}
                          title="Lihat gambar"
                        >
                          {item.gambarUrl ? (
                            <img
                              src={item.gambarUrl}
                              alt={item.judul}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-gray-400 text-sm">
                              Tidak ada gambar
                            </span>
                          )}
                        </button>
                      </div>
                      <div className="flex flex-col grow">
                        <h3 className="font-bold text-gray-800 text-[16px] mb-1">
                          Dibuat Oleh {item.author}
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">
                          {formatDateTime(item.createdAt)}
                        </p>
                        <div className="pengumuman-richtext mb-4 text-[15px] leading-relaxed text-gray-600">
                          <div
                            style={previewClampStyle}
                            dangerouslySetInnerHTML={{
                              __html: sanitizedHtml || "<p>-</p>",
                            }}
                          />
                        </div>
                        <div className="mt-auto flex justify-end">
                          {isLongContent ? (
                            <button
                              className="text-[#4773da] text-sm hover:underline font-medium"
                              onClick={handleOpenDetailFromCard}
                            >
                              Baca Selengkapnya
                            </button>
                          ) : null}
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

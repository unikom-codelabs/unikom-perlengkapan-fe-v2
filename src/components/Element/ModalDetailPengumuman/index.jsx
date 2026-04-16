import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const ModalDetailPengumuman = ({
  isOpen,
  onClose,
  judul = "-",
  author = "-",
  createdAt = "-",
  gambarUrl = "",
  contentHtml = "",
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleOpenPreview = () => {
    if (!gambarUrl) {
      return;
    }

    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between bg-[#3e64ca] px-6 py-4 text-white">
          <h2 className="text-lg font-semibold">Detail Pengumuman</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 hover:bg-white/15"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[85vh] overflow-y-auto p-6">
          <h3 className="mb-2 text-xl font-semibold text-gray-800">{judul}</h3>
          <p className="text-sm font-semibold text-gray-700">
            Dibuat Oleh {author}
          </p>
          <p className="mb-5 text-sm text-gray-400">{createdAt}</p>

          <div className="mb-6 overflow-hidden rounded border border-gray-200 bg-gray-50">
            {gambarUrl ? (
              <button
                type="button"
                onClick={handleOpenPreview}
                className="w-full cursor-zoom-in"
                title="Lihat gambar penuh"
              >
                <img
                  src={gambarUrl}
                  alt={judul}
                  className="h-auto max-h-96 w-full object-contain"
                />
              </button>
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-gray-400">
                Tidak ada gambar
              </div>
            )}
          </div>

          <div
            className="pengumuman-richtext text-[15px] leading-relaxed text-gray-700"
            dangerouslySetInnerHTML={{ __html: contentHtml || "<p>-</p>" }}
          />
        </div>
      </div>

      {isPreviewOpen ? (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 p-4"
          onClick={handleClosePreview}
        >
          <button
            type="button"
            onClick={handleClosePreview}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            title="Tutup"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          <img
            src={gambarUrl}
            alt={judul}
            className="max-h-[90vh] max-w-[95vw] object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </div>
  );
};

export default ModalDetailPengumuman;

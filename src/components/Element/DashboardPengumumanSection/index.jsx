import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import ModalDetailPengumuman from "../ModalDetailPengumuman";

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

const buildPreviewText = (item = {}) => {
  const plainText = stripHtml(item.teks || item.deskripsi || "");
  if (plainText.length <= 280) {
    return plainText || "-";
  }

  return `${plainText.slice(0, 280).trimEnd()}...`;
};

const DashboardPengumumanSection = ({
  items = [],
  isLoading,
  errorMessage,
}) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.judul?.toLowerCase().includes(query) ||
        item.author?.toLowerCase().includes(query) ||
        item.teks?.toLowerCase().includes(query) ||
        item.deskripsi?.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

  const actualPage = totalPages === 0 
    ? 1 
    : (currentPage > totalPages ? totalPages : currentPage);

  const currentItems = useMemo(() => {
    const start = (actualPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, actualPage]);

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  return (
    <div className="bg-white rounded shadow-sm overflow-hidden mt-6">
      <div className="bg-[#4773da] text-white px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-xl font-semibold">Pengumuman</h1>
        <div className="w-full md:w-64">
          <input
            type="text"
            placeholder="Cari pengumuman..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 text-sm text-gray-800 bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-inner"
          />
        </div>
      </div>

      <div className="p-4 md:p-6">
        {errorMessage ? (
          <p className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 whitespace-pre-line">
            {errorMessage}
          </p>
        ) : null}

        {isLoading ? (
          <div className="py-10 text-center text-gray-500">
            Memuat pengumuman...
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="flex flex-col gap-6">
            {currentItems.map((item) => (
              <div key={item.id} className="bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow duration-300">
                <div className="p-4 md:p-6 flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-48 shrink-0">
                    <div className="w-full aspect-4/3 md:aspect-3/4 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden">
                      {item.gambarUrl ? (
                        <img
                          src={item.gambarUrl}
                          alt={item.judul}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <span className="text-gray-400 text-sm">
                          Tidak ada gambar
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col grow">
                    <h2 
                      className="text-xl font-bold text-gray-800 mb-2 hover:text-[#4773da] transition-colors cursor-pointer"
                      onClick={() => setSelectedItem(item)}
                    >
                      {item.judul}
                    </h2>
                    
                    <div className="flex flex-wrap items-center text-sm text-gray-500 mb-4 gap-2 md:gap-3">
                      <span className="font-medium text-gray-700">Oleh: {item.author}</span>
                      <span className="hidden md:inline text-gray-300">&bull;</span>
                      <span>{formatDateTime(item.createdAt)}</span>
                    </div>

                    <p className="mb-6 text-[15px] leading-relaxed text-gray-600">
                      {buildPreviewText(item)}
                    </p>

                    <div className="mt-auto flex justify-start">
                      <button
                        type="button"
                        onClick={() => setSelectedItem(item)}
                        className="inline-flex items-center text-[#4773da] text-sm font-semibold hover:text-[#3e64ca] transition-colors group cursor-pointer bg-transparent border-none p-0"
                      >
                        Baca Selengkapnya
                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-2 space-x-3">
                <button
                  type="button"
                  onClick={() => setCurrentPage(actualPage - 1)}
                  disabled={actualPage === 1}
                  className="px-4 py-1.5 rounded-full border border-[#4773da] text-[#4773da] text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-50 transition-colors"
                >
                  Sebelumnya
                </button>
                <span className="text-sm font-medium text-gray-600 bg-gray-100 px-4 py-1.5 rounded-full">
                  {actualPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(actualPage + 1)}
                  disabled={actualPage === totalPages}
                  className="px-4 py-1.5 rounded-full border border-[#4773da] text-[#4773da] text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-50 transition-colors"
                >
                  Selanjutnya
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-10 text-center text-gray-500 border border-gray-200 rounded">
            {searchQuery ? "Pengumuman tidak ditemukan." : "Tidak ada pengumuman."}
          </div>
        )}
      </div>

      <ModalDetailPengumuman
        isOpen={Boolean(selectedItem)}
        onClose={handleCloseModal}
        judul={selectedItem?.judul}
        author={selectedItem?.author}
        createdAt={
          selectedItem?.createdAt
            ? formatDateTime(selectedItem.createdAt)
            : "-"
        }
        gambarUrl={selectedItem?.gambarUrl}
        contentHtml={selectedItem?.teks || selectedItem?.deskripsi}
      />
    </div>
  );
};

export default DashboardPengumumanSection;

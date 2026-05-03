import { Link } from "react-router-dom";

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
  return (
    <div className="bg-white rounded shadow-sm overflow-hidden mt-6">
      <div className="bg-[#4773da] text-white px-6 py-4">
        <h1 className="text-xl font-semibold">Pengumuman</h1>
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
        ) : items.length > 0 ? (
          <div className="flex flex-col gap-8">
            {items.map((item) => (
              <div key={item.id} className="bg-white">
                <div className="bg-[#3e64ca] px-4 md:px-6 py-3 md:py-4 flex justify-between items-center text-white">
                  <h2 className="font-semibold tracking-wide text-sm md:text-base">
                    {item.judul}
                  </h2>
                </div>
                <div className="p-4 md:p-6 flex flex-col md:flex-row gap-6 border-x border-b border-gray-200">
                  <div className="w-full md:w-62.5 shrink-0">
                    <div className="w-full aspect-3/4 border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
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
                    </div>
                  </div>
                  <div className="flex flex-col grow">
                    <h3 className="font-bold text-gray-800 text-[16px] mb-1">
                      Dibuat Oleh {item.author}
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">
                      {formatDateTime(item.createdAt)}
                    </p>
                    <p className="mb-4 text-[15px] leading-relaxed text-gray-600">
                      {buildPreviewText(item)}
                    </p>
                    <div className="mt-auto flex justify-end">
                      <Link
                        to="/pengumuman"
                        className="text-[#4773da] text-sm hover:underline font-medium"
                      >
                        Baca Selengkapnya
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-gray-500 border border-gray-200 rounded">
            Tidak ada pengumuman.
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPengumumanSection;

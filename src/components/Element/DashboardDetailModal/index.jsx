import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { getAktivasiPengajuanSummary } from "../../../api/aktivasiPengajuanService";
import { listBarang } from "../../../api/barangService";
import ActionIconButton from "../ActionIconButton";
import Table from "../Table";

const ITEMS_PER_PAGE = 10;

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

const formatDateLabel = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const extractYearFromText = (value) => {
  const text = String(value ?? "").trim();
  if (!text) {
    return "";
  }

  const academicMatch = text.match(
    /\b((?:19|20)\d{2})\s*[/-]\s*((?:19|20)\d{2})\b/,
  );
  if (academicMatch) {
    return academicMatch[2];
  }

  const yearMatch = text.match(/\b(?:19|20)\d{2}\b/);
  return yearMatch ? yearMatch[0] : "";
};

const formatTahunanYear = (aktivasi = {}) => {
  const yearFromAkademik = extractYearFromText(aktivasi.tahunAkademik);
  if (yearFromAkademik) {
    return yearFromAkademik;
  }

  const yearFromNama = extractYearFromText(aktivasi.namaPeriode);
  if (yearFromNama) {
    return yearFromNama;
  }

  const dateValue = aktivasi.tanggalMulai || aktivasi.tanggalSelesai;
  const date = dateValue ? new Date(dateValue) : null;
  if (date && !Number.isNaN(date.getTime())) {
    return String(date.getFullYear());
  }

  return "-";
};

const formatAcademicYear = (aktivasi = {}) => {
  const rawText = String(aktivasi.tahunAkademik ?? "").trim();

  if (/\b\d{4}\s*[/-]\s*\d{4}\b/.test(rawText)) {
    return rawText;
  }

  const yearText = extractYearFromText(rawText);
  if (yearText) {
    const yearNumber = Number(yearText);
    if (Number.isFinite(yearNumber)) {
      return `${yearNumber}/${yearNumber + 1}`;
    }
  }

  const dateValue = aktivasi.tanggalMulai || aktivasi.tanggalSelesai;
  const date = dateValue ? new Date(dateValue) : null;
  if (date && !Number.isNaN(date.getTime())) {
    const startYear = date.getFullYear();
    return `${startYear}/${startYear + 1}`;
  }

  return "-";
};

const formatPeriodLabel = (aktivasi = {}) => {
  const kategori = String(aktivasi.kategori ?? "")
    .trim()
    .toLowerCase();
  return kategori === "tahunan"
    ? formatTahunanYear(aktivasi)
    : formatAcademicYear(aktivasi);
};

const toDateKey = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

const formatStatusAktivasi = (aktivasi = {}) => {
  if (aktivasi.statusAktif) {
    return "Periode sedang aktif";
  }

  const endDateKey = toDateKey(aktivasi.tanggalSelesai);
  const todayKey = new Date().toISOString().slice(0, 10);

  if (endDateKey && endDateKey < todayKey) {
    return `Berakhir ${formatDateLabel(aktivasi.tanggalSelesai)}`;
  }

  return `Berakhir pada ${formatDateLabel(aktivasi.tanggalSelesai)}`;
};

const getStatusBadgeClass = (status) => {
  const normalized = String(status ?? "")
    .trim()
    .toLowerCase();

  if (normalized.includes("sudah")) {
    return "bg-green-100 text-green-700";
  }

  return "bg-gray-100 text-gray-600";
};

const formatItemStatus = (status) => {
  const numericStatus = Number(status);

  if (numericStatus === 1) {
    return "Disetujui";
  }

  if (numericStatus === 2) {
    return "Ditolak";
  }

  return "Belum Disetujui";
};

const getItemStatusBadgeClass = (status) => {
  const numericStatus = Number(status);

  if (numericStatus === 1) {
    return "bg-green-100 text-green-700";
  }

  if (numericStatus === 2) {
    return "bg-red-100 text-red-700";
  }

  return "bg-yellow-100 text-yellow-700";
};

const sanitizeFilenameSegment = (value) =>
  String(value ?? "")
    .trim()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

const isSubmittedPengajuan = (row = {}) => {
  const normalizedStatus = String(row?.status ?? "")
    .trim()
    .toLowerCase();

  if (normalizedStatus.includes("belum")) {
    return false;
  }

  if (
    normalizedStatus.includes("sudah") ||
    normalizedStatus.includes("diajukan") ||
    normalizedStatus.includes("submitted")
  ) {
    return true;
  }

  return getDetailItems(row).length > 0;
};

const exportToExcel = async (
  rows = [],
  filename = "ringkasan-pengajuan.xlsx",
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Ringkasan");
  const COLUMN_COUNT = 5;
  const borderStyle = {
    top: { style: "thin", color: { argb: "FF9CA3AF" } },
    left: { style: "thin", color: { argb: "FF9CA3AF" } },
    bottom: { style: "thin", color: { argb: "FF9CA3AF" } },
    right: { style: "thin", color: { argb: "FF9CA3AF" } },
  };

  const applyBorders = (row) => {
    for (let i = 1; i <= COLUMN_COUNT; i += 1) {
      row.getCell(i).border = borderStyle;
    }
  };

  rows.forEach((row, rowIndex) => {
    const items = [...(row.barang ?? []), ...(row.barangLainnya ?? [])];

    const infoRows = [
      ["Nama", row.nama || "-"],
      ["Bagian", row.unit || "-"],
      ["Jabatan", row.jabatan || "-"],
      ["Status", row.status || "-"],
    ];

    infoRows.forEach((infoRow) => {
      const excelRow = worksheet.addRow(infoRow);
      excelRow.font = { bold: false };
      applyBorders(excelRow);
    });

    worksheet.addRow([]);

    const headerRow = worksheet.addRow([
      "No",
      "Nama Barang",
      "Vendor",
      "Jumlah Diajukan",
      "Jumlah Disetujui",
    ]);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: "center" };
    for (let i = 1; i <= COLUMN_COUNT; i += 1) {
      const cell = headerRow.getCell(i);
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF3F4F6" },
      };
    }
    applyBorders(headerRow);

    if (items.length === 0) {
      const emptyRow = worksheet.addRow(["-", "-", "-", 0, 0]);
      applyBorders(emptyRow);
    } else {
      items.forEach((item, itemIndex) => {
        const unit = String(item.satuan || item.unit || item.barang?.satuan || "").trim();
        const itemRow = worksheet.addRow([
          itemIndex + 1,
          item.namaBarang || "-",
          item.vendor || "-",
          unit ? `${item.qty ?? 0} ${unit}` : (item.qty ?? 0),
          unit ? `${item.jumlahDisetujui ?? 0} ${unit}` : (item.jumlahDisetujui ?? 0),
        ]);
        itemRow.alignment = { horizontal: "left" };
        itemRow.getCell(1).alignment = { horizontal: "center" };
        itemRow.getCell(4).alignment = { horizontal: "center" };
        itemRow.getCell(5).alignment = { horizontal: "center" };
        applyBorders(itemRow);
      });
    }

    if (rowIndex < rows.length - 1) {
      worksheet.addRow([]);
      worksheet.addRow([]);
    }
  });

  worksheet.columns = [
    { width: 6 },
    { width: 28 },
    { width: 24 },
    { width: 18 },
    { width: 20 },
  ];

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, filename);
};

const getDetailItems = (rowValue = {}) => {
  const row = rowValue ?? {};

  return [
    ...(row.barang ?? []).map((item) => ({ ...item, tipe: "Barang" })),
    ...(row.barangLainnya ?? []).map((item) => ({
      ...item,
      tipe: "Barang Lainnya",
    })),
  ];
};

const paginateRows = (rows = [], page = 1, perPage = ITEMS_PER_PAGE) => {
  const safePage = Math.max(1, page);
  const startIndex = (safePage - 1) * perPage;
  return rows.slice(startIndex, startIndex + perPage);
};

const getTotalPages = (rows = [], perPage = ITEMS_PER_PAGE) =>
  Math.max(1, Math.ceil(rows.length / perPage));

const getVisiblePages = (currentPage, totalPages) => {
  const pages = new Set([1, totalPages, currentPage]);

  if (currentPage > 1) pages.add(currentPage - 1);
  if (currentPage < totalPages) pages.add(currentPage + 1);

  return Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
};

const Pagination = ({ currentPage, totalPages, totalItems, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-500">
        Menampilkan halaman {currentPage} dari {totalPages} ({totalItems} data)
      </p>
      <nav className="flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="rounded border border-gray-300 bg-white p-1.5 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        {visiblePages.map((page, index) => {
          const previousPage = visiblePages[index - 1];
          const showGap = previousPage && page - previousPage > 1;

          return (
            <span key={page} className="flex items-center gap-1">
              {showGap ? <span className="px-1 text-gray-500">...</span> : null}
              <button
                type="button"
                onClick={() => onPageChange(page)}
                className={`rounded border px-3 py-1.5 text-sm font-medium ${currentPage === page
                    ? "border-[#4773da] bg-[#4773da] text-white"
                    : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                  }`}
              >
                {page}
              </button>
            </span>
          );
        })}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="rounded border border-gray-300 bg-white p-1.5 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
};

const DashboardDetailModal = ({ isOpen, onClose, title, summaryId }) => {
  const [shouldRender, setRender] = useState(isOpen);
  const [show, setShow] = useState(false);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailPage, setDetailPage] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setRender(true);
      const timer = setTimeout(() => setShow(true), 10);
      return () => clearTimeout(timer);
    }

    setShow(false);
    const timer = setTimeout(() => setRender(false), 150);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !summaryId) {
      return;
    }

    const fetchSummary = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [data, barangData] = await Promise.all([
          getAktivasiPengajuanSummary(summaryId),
          listBarang().catch(() => [])
        ]);

        const barangMap = new Map();
        barangData.forEach((b) => {
          if (b.nama) {
            barangMap.set(b.nama.trim().toLowerCase(), String(b.satuan || "").trim());
          }
        });

        if (Array.isArray(data?.detailPengajuan)) {
          data.detailPengajuan.forEach((pengaju) => {
            if (Array.isArray(pengaju.barang)) {
              pengaju.barang.forEach((b) => {
                if (!b.satuan || b.satuan === "-") {
                  b.satuan = barangMap.get((b.namaBarang || "").trim().toLowerCase()) || "";
                }
              });
            }
          });
        }

        setSummary(data);
      } catch (error) {
        setSummary(null);
        setErrorMessage(
          getApiErrorMessage(error, "Gagal mengambil ringkasan pengajuan."),
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [isOpen, summaryId]);

  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setDetailPage(1);
      setSelectedDetail(null);
    }
  }, [isOpen, summaryId]);

  const rows = useMemo(
    () =>
      Array.isArray(summary?.detailPengajuan) ? summary.detailPengajuan : [],
    [summary],
  );
  const submittedRows = useMemo(
    () => rows.filter((row) => isSubmittedPengajuan(row)),
    [rows],
  );
  const totalPages = getTotalPages(rows);
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedRows = paginateRows(rows, safeCurrentPage);
  const exportFilename = `${sanitizeFilenameSegment(title) || "ringkasan-pengajuan"}.xlsx`;
  const selectedDetailItems = getDetailItems(selectedDetail);
  const detailTotalPages = getTotalPages(selectedDetailItems);
  const safeDetailPage = Math.min(detailPage, detailTotalPages);
  const paginatedDetailItems = paginateRows(
    selectedDetailItems,
    safeDetailPage,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setDetailPage(1);
  }, [selectedDetail]);

  useEffect(() => {
    if (detailPage > detailTotalPages) {
      setDetailPage(detailTotalPages);
    }
  }, [detailPage, detailTotalPages]);

  if (!shouldRender) return null;

  const aktivasi = summary?.aktivasi ?? {};
  const statistik = summary?.statistik ?? {
    jumlahPengajuanMasuk: 0,
    totalPengaju: 0,
  };
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-150 ${show
          ? "bg-black/30 backdrop-blur-sm opacity-100"
          : "bg-transparent opacity-0"
        }`}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg shadow-lg w-full max-w-6xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-150 transform ${show ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="bg-[#4a77e5] text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Informasi {title}</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {errorMessage ? (
            <p className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {errorMessage}
            </p>
          ) : null}

          <div className="space-y-4 mb-6 relative">
            <div className="grid grid-cols-[180px_1fr] items-center">
              <span className="text-gray-500">Pengajuan Tahun</span>
              <span className="text-gray-800">
                : {formatPeriodLabel(aktivasi)}
              </span>
            </div>
            <div className="grid grid-cols-[180px_1fr] items-center">
              <span className="text-gray-500">Tanggal Aktivasi</span>
              <span className="text-gray-800">
                : {formatDateLabel(aktivasi.tanggalMulai)} s/d{" "}
                {formatDateLabel(aktivasi.tanggalSelesai)}
              </span>
            </div>
            <div className="grid grid-cols-[180px_1fr] items-center">
              <span className="text-gray-500">Pengajuan Masuk</span>
              <span className="text-gray-800">
                :{" "}
                <span className="text-blue-600 font-semibold">
                  {statistik.jumlahPengajuanMasuk}
                </span>{" "}
                dari {statistik.totalPengaju} Pengaju
              </span>
            </div>
            <div className="grid grid-cols-[180px_1fr] items-center">
              <span className="text-gray-500">Status Pengajuan</span>
              <span
                className={`${aktivasi.statusAktif ? "text-green-600" : "text-red-500"
                  }`}
              >
                : {formatStatusAktivasi(aktivasi)}
              </span>
            </div>
            <div className="absolute bottom-0 right-0">
              <button
                type="button"
                onClick={() => exportToExcel(submittedRows, exportFilename)}
                disabled={isLoading || submittedRows.length === 0}
                className="bg-[#427ced] hover:bg-blue-600 text-white px-5 py-2 rounded-full flex items-center gap-2 text-sm transition-colors shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Export Semua <ArrowDownTrayIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          <Table
            title={null}
            columns={[
              { key: "no", label: "No" },
              { key: "nama", label: "Nama" },
              { key: "bagian", label: "Bagian" },
              { key: "status", label: "Status" },
              { key: "aksi", label: "Aksi" },
            ]}
            rows={isLoading ? [] : paginatedRows}
            emptyMessage={
              isLoading ? "Memuat detail pengajuan..." : "Data tidak ditemukan"
            }
            wrapperClass="overflow-x-auto border border-gray-200"
            renderRow={(item, index) => {
              const hasSubmittedPengajuan = isSubmittedPengajuan(item);

              return (
                <tr key={item.id} className="border-t border-gray-100">
                  <td className="px-6 py-4 text-center text-gray-600">
                    {(safeCurrentPage - 1) * ITEMS_PER_PAGE + index + 1}
                  </td>
                  <td className="px-6 py-4 text-gray-800">{item.nama}</td>
                  <td className="px-6 py-4 text-gray-600">{item.unit}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(item.status)}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center gap-2">
                      <ActionIconButton
                        label={
                          hasSubmittedPengajuan ? "Export" : "Tidak Bisa Export"
                        }
                        icon={ArrowDownTrayIcon}
                        onClick={() =>
                          exportToExcel(
                            [item],
                            `${sanitizeFilenameSegment(item.nama) || "pengaju"}.xlsx`,
                          )
                        }
                        variant="primary"
                        disabled={!hasSubmittedPengajuan}
                      />
                      <ActionIconButton
                        label="Lihat"
                        icon={EyeIcon}
                        onClick={() => setSelectedDetail(item)}
                        variant="primary"
                      />
                    </div>
                  </td>
                </tr>
              );
            }}
          />
          <Pagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            totalItems={rows.length}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {selectedDetail ? (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/30 p-4"
          onClick={() => setSelectedDetail(null)}
        >
          <div
            className="w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between bg-[#4a77e5] px-6 py-4 text-white">
              <div>
                <h3 className="text-lg font-semibold">Barang yang Diajukan</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="text-white hover:text-gray-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 grid gap-2 text-sm text-gray-600">
                <div className="grid grid-cols-[110px_12px_1fr] items-center">
                  <span className="text-gray-400">Pengaju</span>
                  <span className="text-gray-400">:</span>
                  <span className="text-gray-700">{selectedDetail.nama}</span>
                </div>
                <div className="grid grid-cols-[110px_12px_1fr] items-center">
                  <span className="text-gray-400">Bagian</span>
                  <span className="text-gray-400">:</span>
                  <span className="text-gray-700">{selectedDetail.unit}</span>
                </div>
                <div className="grid grid-cols-[110px_12px_1fr] items-center">
                  <span className="text-gray-400">Jabatan</span>
                  <span className="text-gray-400">:</span>
                  <span className="text-gray-700">
                    {selectedDetail.jabatan}
                  </span>
                </div>
                <div className="grid grid-cols-[110px_12px_1fr] items-center">
                  <span className="text-gray-400">Status Pengajuan</span>
                  <span className="text-gray-400">:</span>
                  <span
                    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(selectedDetail.status)}`}
                  >
                    {selectedDetail.status}
                  </span>
                </div>
              </div>

              <Table
                title={null}
                columns={[
                  { key: "no", label: "No" },
                  { key: "namaBarang", label: "Nama Barang" },
                  { key: "tipe", label: "Tipe" },
                  { key: "vendor", label: "Vendor" },
                  { key: "qty", label: "Jumlah Diajukan" },
                  { key: "jumlahDisetujui", label: "Jumlah Disetujui" },
                  { key: "status", label: "Status" },
                ]}
                rows={paginatedDetailItems}
                emptyMessage="Tidak ada barang yang diajukan"
                wrapperClass="overflow-x-auto border border-gray-200"
                renderRow={(item, index) => (
                  <tr
                    key={`${item.tipe}-${item.id}-${index}`}
                    className="border-t border-gray-100"
                  >
                    <td className="px-6 py-4 text-center text-gray-600">
                      {(safeDetailPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>
                    <td className="px-6 py-4 text-gray-800">
                      {item.namaBarang}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{item.tipe}</td>
                    <td className="px-6 py-4 text-gray-600">{item.vendor}</td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      {item.qty} {String(item.satuan || item.unit || item.barang?.satuan || "").trim()}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      {item.jumlahDisetujui} {String(item.satuan || item.unit || item.barang?.satuan || "").trim()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getItemStatusBadgeClass(item.status)}`}
                      >
                        {formatItemStatus(item.status)}
                      </span>
                    </td>
                  </tr>
                )}
              />
              <Pagination
                currentPage={safeDetailPage}
                totalPages={detailTotalPages}
                totalItems={selectedDetailItems.length}
                onPageChange={setDetailPage}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default DashboardDetailModal;

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownTrayIcon,
  EyeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { getAktivasiPengajuanSummary } from "../../../api/aktivasiPengajuanService";
import ActionIconButton from "../ActionIconButton";
import Table from "../Table";

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

const formatBarangSummary = (row = {}) => {
  const items = [...(row.barang ?? []), ...(row.barangLainnya ?? [])];

  if (items.length === 0) {
    return "-";
  }

  return items
    .map((item) => {
      const vendor =
        item.vendor && item.vendor !== "-" ? ` (${item.vendor})` : "";
      return `${item.namaBarang}${vendor}: ${item.jumlahDisetujui}/${item.qty}`;
    })
    .join(", ");
};

const sanitizeFilenameSegment = (value) =>
  String(value ?? "")
    .trim()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

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
        const itemRow = worksheet.addRow([
          itemIndex + 1,
          item.namaBarang || "-",
          item.vendor || "-",
          item.qty ?? 0,
          item.jumlahDisetujui ?? 0,
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

const DashboardDetailModal = ({ isOpen, onClose, title, summaryId }) => {
  const [shouldRender, setRender] = useState(isOpen);
  const [show, setShow] = useState(false);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedDetail, setSelectedDetail] = useState(null);

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
        const data = await getAktivasiPengajuanSummary(summaryId);
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

  const rows = useMemo(
    () =>
      Array.isArray(summary?.detailPengajuan) ? summary.detailPengajuan : [],
    [summary],
  );
  const exportFilename = `${sanitizeFilenameSegment(title) || "ringkasan-pengajuan"}.xlsx`;

  if (!shouldRender) return null;

  const aktivasi = summary?.aktivasi ?? {};
  const statistik = summary?.statistik ?? {
    jumlahPengajuanMasuk: 0,
    totalPengaju: 0,
  };
  const selectedDetailItems = getDetailItems(selectedDetail);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-150 ${
        show
          ? "bg-black/30 backdrop-blur-sm opacity-100"
          : "bg-transparent opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg shadow-lg w-full max-w-6xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-150 transform ${
          show ? "scale-100 opacity-100" : "scale-95 opacity-0"
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
                : {aktivasi.tahunAkademik || "-"}
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
                className={`${
                  aktivasi.statusAktif ? "text-green-600" : "text-red-500"
                }`}
              >
                : {formatStatusAktivasi(aktivasi)}
              </span>
            </div>
            <div className="absolute bottom-0 right-0">
              <button
                type="button"
                onClick={() => exportToExcel(rows, exportFilename)}
                disabled={isLoading || rows.length === 0}
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
            rows={isLoading ? [] : rows}
            emptyMessage={
              isLoading ? "Memuat detail pengajuan..." : "Data tidak ditemukan"
            }
            wrapperClass="overflow-x-auto border border-gray-200"
            renderRow={(item, index) => (
              <tr key={item.id} className="border-t border-gray-100">
                <td className="px-6 py-4 text-center text-gray-600">
                  {index + 1}
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
                      label="Export"
                      icon={ArrowDownTrayIcon}
                      onClick={() =>
                        exportToExcel(
                          [item],
                          `${sanitizeFilenameSegment(item.nama) || "pengaju"}.xlsx`,
                        )
                      }
                      variant="primary"
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
            )}
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
                rows={selectedDetailItems}
                emptyMessage="Tidak ada barang yang diajukan"
                wrapperClass="overflow-x-auto border border-gray-200"
                renderRow={(item, index) => (
                  <tr
                    key={`${item.tipe}-${item.id}-${index}`}
                    className="border-t border-gray-100"
                  >
                    <td className="px-6 py-4 text-center text-gray-600">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-gray-800">
                      {item.namaBarang}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{item.tipe}</td>
                    <td className="px-6 py-4 text-gray-600">{item.vendor}</td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      {item.qty}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      {item.jumlahDisetujui}
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
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default DashboardDetailModal;

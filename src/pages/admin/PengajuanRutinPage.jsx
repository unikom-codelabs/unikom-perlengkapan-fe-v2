import { useEffect, useMemo, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Helmet } from "react-helmet-async";
import Table from "../../components/Element/Table";
import Dropdown from "../../components/Element/Dropdown";
import BapDocument from "../../components/Pdf/BapDocument";
import {
  approveBarangPengajuanAdmin,
  listDaftarPengajuanAdmin,
} from "../../api/pengajuanService";
import { listUnitTypeTree } from "../../api/unitTypeService";

const BASE_STORAGE_URL = "http://perlengkapan.codelabspace.or.id/storage/";

const TAB_OPTIONS = [
  { label: "ATK Tahunan", value: "tahunan" },
  { label: "ATK Ujian", value: "ujian" },
  { label: "ATK Kelas", value: "kelas" },
];

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

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  if (error?.message) {
    return error.message;
  }

  return fallbackMessage;
};

const normalizeUnitTypeName = (item = {}) =>
  String(item?.nama ?? item?.name ?? "").trim();

const getUnitTypeId = (item = {}, fallback = "") =>
  String(
    item?.id ??
      item?.unit_id ??
      item?.id_unit_type ??
      item?.unit_type_id ??
      fallback,
  ).trim();

const normalizeUnitValue = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const normalizeTipe = (value) => {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_\s-]+/g, "");

  return normalized === "nonrutin" ? "nonrutin" : "rutin";
};

const formatTipeLabel = (value) =>
  normalizeTipe(value) === "nonrutin" ? "Non Rutin" : "Rutin";

const formatKategori = (value) => {
  const map = {
    tahunan: "ATK Tahunan",
    ujian: "ATK Ujian",
    kelas: "ATK Kelas",
    habis_pakai: "Habis Pakai",
    tidak_habis_pakai: "Tidak Habis Pakai",
  };

  return map[value] ?? value ?? "-";
};

const formatStatus = (status) => {
  const map = {
    0: "Belum Disetujui",
    1: "Disetujui",
    2: "Tidak Disetujui",
  };

  return map[Number(status)] ?? "Belum Disetujui";
};

const statusBadgeClass = (status) => {
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

const normalizeJabatanOptions = (items = []) =>
  (Array.isArray(items) ? items : [])
    .map((item, index) => {
      const id = getUnitTypeId(item, `jabatan-${index + 1}`);
      const label = normalizeUnitTypeName(item);
      const children = Array.isArray(item?.children) ? item.children : [];

      return {
        id,
        value: id,
        label,
        children,
      };
    })
    .filter((item) => item.label);

const getChildOptions = (children = []) =>
  (Array.isArray(children) ? children : [])
    .map((child, index) => {
      const label = normalizeUnitTypeName(child);
      const id = getUnitTypeId(child, `${label || "bagian"}-${index + 1}`);

      return {
        id,
        value: label,
        label,
      };
    })
    .filter((item) => item.label);

const getAktivasiSortValue = (row = {}) => {
  const timestamp = new Date(row.tanggal).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const buildAktivasiOptions = (rows = []) =>
  Array.from(
    rows
      .reduce((map, row) => {
        const value = row.aktivasiKey || row.aktivasiLabel;
        const label = row.aktivasiLabel || value;

        if (!value || map.has(value)) {
          return map;
        }

        map.set(value, {
          value,
          label,
          sortValue: getAktivasiSortValue(row),
        });

        return map;
      }, new Map())
      .values(),
  ).sort((a, b) => b.sortValue - a.sortValue || a.label.localeCompare(b.label));

const shouldIncludeByUnit = (row, selectedUnit) => {
  if (!selectedUnit || !row.userUnit) {
    return true;
  }

  return normalizeUnitValue(row.userUnit) === normalizeUnitValue(selectedUnit);
};

const AdminDaftarPengajuanPage = ({ tipe = "rutin" }) => {
  const normalizedTipe = normalizeTipe(tipe);
  const tipeLabel = formatTipeLabel(normalizedTipe);
  const [activeTab, setActiveTab] = useState("tahunan");
  const [rows, setRows] = useState([]);
  const [jabatanOptions, setJabatanOptions] = useState([]);
  const [bagianOptions, setBagianOptions] = useState([]);
  const [selectedJabatan, setSelectedJabatan] = useState("");
  const [selectedBagian, setSelectedBagian] = useState("");
  const [selectedBagianType, setSelectedBagianType] = useState("");
  const [selectedProdi, setSelectedProdi] = useState("");
  const [selectedAktivasi, setSelectedAktivasi] = useState("");
  const [selectedAktivasiUjian, setSelectedAktivasiUjian] = useState("");
  const [selectedAktivasiKelas, setSelectedAktivasiKelas] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
  const [pageError, setPageError] = useState("");
  const [actionError, setActionError] = useState("");
  const [updatingRowId, setUpdatingRowId] = useState("");
  const [inputErrors, setInputErrors] = useState({});
  const [toastMessage, setToastMessage] = useState("");

  const isTahunanTab = activeTab === "tahunan";
  const isUjianTab = activeTab === "ujian";
  const isKelasTab = activeTab === "kelas";

  const filteredByTipeAndTab = useMemo(
    () =>
      rows.filter(
        (row) => row.tipe === normalizedTipe && row.kategori === activeTab,
      ),
    [activeTab, normalizedTipe, rows],
  );
  const rowsByTipe = useMemo(
    () => rows.filter((row) => row.tipe === normalizedTipe),
    [normalizedTipe, rows],
  );

  const aktivasiOptions = useMemo(
    () =>
      buildAktivasiOptions(
        rowsByTipe.filter((row) => row.kategori === "tahunan"),
      ),
    [rowsByTipe],
  );
  const aktivasiOptionsUjian = useMemo(
    () =>
      buildAktivasiOptions(
        rowsByTipe.filter((row) => row.kategori === "ujian"),
      ),
    [rowsByTipe],
  );
  const aktivasiOptionsKelas = useMemo(
    () =>
      buildAktivasiOptions(
        rowsByTipe.filter((row) => row.kategori === "kelas"),
      ),
    [rowsByTipe],
  );

  const selectedAktivasiLabel =
    aktivasiOptions.find((option) => option.value === selectedAktivasi)
      ?.label ?? "";
  const selectedAktivasiUjianLabel =
    aktivasiOptionsUjian.find(
      (option) => option.value === selectedAktivasiUjian,
    )?.label ?? "";
  const selectedAktivasiKelasLabel =
    aktivasiOptionsKelas.find(
      (option) => option.value === selectedAktivasiKelas,
    )?.label ?? "";

  const ujianJabatanOptions = useMemo(
    () =>
      jabatanOptions.filter((item) =>
        ["dekan", "kaprodi"].includes(item.label.toLowerCase()),
      ),
    [jabatanOptions],
  );

  const dekanBagianOptions = useMemo(() => {
    const dekan = jabatanOptions.find(
      (item) => item.label.toLowerCase() === "dekan",
    );
    return getChildOptions(dekan?.children);
  }, [jabatanOptions]);

  const kaprodiProdiOptions = useMemo(() => {
    const kaprodi = jabatanOptions.find(
      (item) => item.label.toLowerCase() === "kaprodi",
    );
    return getChildOptions(kaprodi?.children);
  }, [jabatanOptions]);

  const fetchRows = async () => {
    setIsLoading(true);
    setPageError("");

    try {
      const data = await listDaftarPengajuanAdmin();
      setRows(data);
    } catch (error) {
      setPageError(
        getApiErrorMessage(error, "Gagal mengambil data daftar pengajuan."),
      );
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, [normalizedTipe]);

  useEffect(() => {
    const fetchFilters = async () => {
      setIsLoadingFilters(true);

      try {
        const data = await listUnitTypeTree();
        setJabatanOptions(normalizeJabatanOptions(data));
      } catch (error) {
        setPageError(
          getApiErrorMessage(error, "Gagal mengambil data jabatan."),
        );
        setJabatanOptions([]);
      } finally {
        setIsLoadingFilters(false);
      }
    };

    fetchFilters();
  }, []);

  useEffect(() => {
    const jabatan = jabatanOptions.find(
      (item) => String(item.value) === String(selectedJabatan),
    );
    setBagianOptions(getChildOptions(jabatan?.children));
    setSelectedBagian("");
  }, [jabatanOptions, selectedJabatan]);

  useEffect(() => {
    if (!isUjianTab) {
      return;
    }

    setSelectedBagian("");
    setSelectedProdi("");
    setSelectedAktivasiUjian("");
  }, [isUjianTab, selectedBagianType]);

  useEffect(() => {
    if (!isKelasTab) {
      return;
    }

    setSelectedBagian("");
    setSelectedProdi("");
    setSelectedAktivasiKelas("");
  }, [isKelasTab, selectedBagianType]);

  const filteredRows = filteredByTipeAndTab.filter((row) => {
    const hasRequiredSelections = isUjianTab
      ? selectedBagianType &&
        (selectedBagianType.toLowerCase() === "dekan"
          ? selectedBagian
          : selectedProdi) &&
        selectedAktivasiUjian
      : isKelasTab
        ? selectedBagianType &&
          (selectedBagianType.toLowerCase() === "dekan"
            ? selectedBagian
            : selectedProdi) &&
          selectedAktivasiKelas
        : selectedJabatan && selectedBagian && selectedAktivasi;

    if (!hasRequiredSelections) {
      return false;
    }

    if (isUjianTab || isKelasTab) {
      const selectedUnit =
        selectedBagianType.toLowerCase() === "dekan"
          ? selectedBagian
          : selectedProdi;
      const selectedAktivasiValue = isUjianTab
        ? selectedAktivasiUjian
        : selectedAktivasiKelas;

      return (
        shouldIncludeByUnit(row, selectedUnit) &&
        (row.aktivasiKey || row.aktivasiLabel) === selectedAktivasiValue
      );
    }

    return (
      shouldIncludeByUnit(row, selectedBagian) &&
      (row.aktivasiKey || row.aktivasiLabel) === selectedAktivasi
    );
  });

  const mainRows = filteredRows.filter((row) => !row.isLainnya);
  const lainnyaRows = filteredRows.filter((row) => row.isLainnya);
  const suratPengajuan = filteredRows.find(
    (row) => row.suratPengajuan,
  )?.suratPengajuan;
  const suratURL = suratPengajuan
    ? `${BASE_STORAGE_URL}${suratPengajuan}`
    : null;

  const updateRowLocal = (rowId, patch) => {
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              ...patch,
            }
          : row,
      ),
    );
  };

  const setInputError = (rowId, message) => {
    setInputErrors((currentErrors) => {
      if (!message) {
        if (!currentErrors[rowId]) {
          return currentErrors;
        }

        const { [rowId]: _, ...rest } = currentErrors;
        return rest;
      }

      return {
        ...currentErrors,
        [rowId]: message,
      };
    });
  };

  const submitApproval = async (row, patch = {}) => {
    const nextRow = {
      ...row,
      ...patch,
    };

    setUpdatingRowId(row.id);
    setActionError("");

    try {
      const response = await approveBarangPengajuanAdmin({
        id: nextRow.itemId,
        isLainnya: nextRow.isLainnya,
        jumlahDisetujui: nextRow.jumlahDisetujui,
        status: nextRow.status,
      });
      updateRowLocal(row.id, {
        jumlahDisetujui:
          Number(response?.jumlah_disetujui ?? response?.jumlahDisetujui) ||
          nextRow.jumlahDisetujui,
        status:
          response?.status === true
            ? nextRow.status
            : response?.status === false
              ? 2
              : (response?.status ?? nextRow.status),
      });
    } catch (error) {
      setActionError(
        getApiErrorMessage(error, "Gagal memperbarui status pengajuan."),
      );
      updateRowLocal(row.id, {
        jumlahDisetujui: row.jumlahDisetujui,
        status: row.status,
      });
    } finally {
      setUpdatingRowId("");
    }
  };

  const handleJumlahChange = (row, value) => {
    const rawValue = Number(value);
    if (Number.isFinite(rawValue) && rawValue > row.jumlah) {
      setInputError(
        row.id,
        "Jumlah disetujui tidak boleh melebihi jumlah diajukan.",
      );
      setToastMessage("Jumlah disetujui tidak boleh melebihi jumlah diajukan.");
    } else {
      setInputError(row.id, "");
    }

    const jumlahDisetujui = Math.min(
      row.jumlah,
      Math.max(0, Number(value) || 0),
    );
    updateRowLocal(row.id, { jumlahDisetujui });
  };

  const handleStatusChange = (row, value) => {
    const status = Number(value);
    const jumlahDisetujui =
      status === 1
        ? Number(row.jumlahDisetujui) === 0
          ? row.jumlah
          : row.jumlahDisetujui
        : 0;

    updateRowLocal(row.id, { status, jumlahDisetujui });
    setInputError(row.id, "");
    submitApproval(row, { status, jumlahDisetujui });
  };

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setToastMessage("");
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const renderFilters = () => {
    if (isUjianTab || isKelasTab) {
      const isDekan = selectedBagianType.toLowerCase() === "dekan";
      const selectedUnit = isDekan ? selectedBagian : selectedProdi;
      const selectedAktivasiValue = isUjianTab
        ? selectedAktivasiUjian
        : selectedAktivasiKelas;
      const setSelectedAktivasiValue = isUjianTab
        ? setSelectedAktivasiUjian
        : setSelectedAktivasiKelas;
      const options = isUjianTab ? aktivasiOptionsUjian : aktivasiOptionsKelas;

      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm text-gray-500 mb-2">Jabatan</label>
            <Dropdown
              value={selectedBagianType}
              onChange={(event) => setSelectedBagianType(event.target.value)}
              className="w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-500"
              disabled={isLoadingFilters}
            >
              <option value="">-- Pilih Jabatan --</option>
              {ujianJabatanOptions.map((option) => (
                <option key={option.value} value={option.label}>
                  {option.label}
                </option>
              ))}
            </Dropdown>
          </div>

          {selectedBagianType && isDekan ? (
            <div>
              <label className="block text-sm text-gray-500 mb-2">Bagian</label>
              <Dropdown
                value={selectedBagian}
                onChange={(event) => setSelectedBagian(event.target.value)}
                className="w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-500"
              >
                <option value="">-- Pilih Bagian --</option>
                {dekanBagianOptions.map((option) => (
                  <option key={option.id} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Dropdown>
            </div>
          ) : null}

          {selectedBagianType && !isDekan ? (
            <div>
              <label className="block text-sm text-gray-500 mb-2">
                Program Studi
              </label>
              <Dropdown
                value={selectedProdi}
                onChange={(event) => setSelectedProdi(event.target.value)}
                className="w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-500"
              >
                <option value="">-- Pilih Program Studi --</option>
                {kaprodiProdiOptions.map((option) => (
                  <option key={option.id} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Dropdown>
            </div>
          ) : null}

          {selectedBagianType && selectedUnit ? (
            <div>
              <label className="block text-sm text-gray-500 mb-2">
                Aktivasi
              </label>
              <Dropdown
                value={selectedAktivasiValue}
                onChange={(event) =>
                  setSelectedAktivasiValue(event.target.value)
                }
                className="w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-500"
              >
                <option value="">-- Pilih Aktivasi --</option>
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Dropdown>
            </div>
          ) : null}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-sm text-gray-500 mb-2">Jabatan</label>
          <Dropdown
            value={selectedJabatan}
            onChange={(event) => setSelectedJabatan(event.target.value)}
            className="w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-500"
            disabled={isLoadingFilters}
          >
            <option value="">-- Pilih Jabatan --</option>
            {jabatanOptions.map((option) => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </Dropdown>
        </div>

        {selectedJabatan ? (
          <div>
            <label className="block text-sm text-gray-500 mb-2">Bagian</label>
            <Dropdown
              value={selectedBagian}
              onChange={(event) => setSelectedBagian(event.target.value)}
              className="w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-500"
            >
              <option value="">-- Pilih Bagian --</option>
              {bagianOptions.map((option) => (
                <option key={option.id} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Dropdown>
          </div>
        ) : null}

        {selectedJabatan && selectedBagian ? (
          <div>
            <label className="block text-sm text-gray-500 mb-2">Aktivasi</label>
            <Dropdown
              value={selectedAktivasi}
              onChange={(event) => setSelectedAktivasi(event.target.value)}
              className="w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-500"
            >
              <option value="">-- Pilih Aktivasi --</option>
              {aktivasiOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Dropdown>
          </div>
        ) : null}
      </div>
    );
  };

  const renderTable = (title, tableRows, emptyMessage, pengajuLabel) => (
    <div className="mb-8 last:mb-0">
      {pengajuLabel ? (
        <div className="mb-2 text-sm text-gray-600">
          <span className="font-bold text-gray-700">Pengaju:</span>{" "}
          {pengajuLabel}
        </div>
      ) : null}
      <Table
        title={title}
        columns={[
          { key: "no", label: "No" },
          { key: "namaBarang", label: "Nama Barang" },
          { key: "satuan", label: "Satuan" },
          { key: "kategori", label: "Kategori" },
          { key: "jumlah", label: "Jumlah" },
          { key: "jumlahDisetujui", label: "Jumlah Disetujui" },
          { key: "status", label: "Status" },
          { key: "aksi", label: "Aksi" },
        ]}
        rows={tableRows}
        emptyMessage={emptyMessage}
        wrapperClass="overflow-x-auto border border-gray-200"
        renderRow={(row, index) => {
          const isUpdating = updatingRowId === row.id;
          const inputError = inputErrors[row.id];

          return (
            <tr key={row.id} className="border-t border-gray-100">
              <td className="px-6 py-4 text-gray-600">{index + 1}</td>
              <td className="px-6 py-4 text-gray-800">{row.namaBarang}</td>
              <td className="px-6 py-4 text-gray-600">{row.satuan}</td>
              <td className="px-6 py-4 text-gray-600">
                {formatKategori(row.kategori)}
              </td>
              <td className="px-6 py-4 text-gray-600">{row.jumlah}</td>
              <td className="px-6 py-4">
                <div className="relative inline-flex">
                  <input
                    type="number"
                    min="0"
                    value={row.jumlahDisetujui}
                    onChange={(event) =>
                      handleJumlahChange(row, event.target.value)
                    }
                    onBlur={(event) =>
                      submitApproval(row, {
                        jumlahDisetujui: Math.min(
                          row.jumlah,
                          Math.max(0, Number(event.target.value) || 0),
                        ),
                      })
                    }
                    disabled={isUpdating}
                    className={`w-20 rounded border px-2 py-1 text-sm text-gray-600 focus:outline-none focus:ring-1 disabled:bg-gray-100 ${
                      inputError
                        ? "border-red-500 focus:ring-red-300 animate-[shake_260ms_ease-in-out] motion-reduce:animate-none"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                </div>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(row.status)}`}
                >
                  {formatStatus(row.status)}
                </span>
              </td>
              <td className="px-6 py-4">
                <Dropdown
                  value={row.status}
                  onChange={(event) =>
                    handleStatusChange(row, event.target.value)
                  }
                  disabled={isUpdating}
                  className="w-40 rounded border border-gray-300 px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value={0}>Belum Disetujui</option>
                  <option value={1}>Disetujui</option>
                  <option value={2}>Tidak Disetujui</option>
                </Dropdown>
              </td>
            </tr>
          );
        }}
      />
    </div>
  );

  const emptyMessage = isLoading
    ? "Memuat data pengajuan..."
    : isUjianTab
      ? selectedBagianType &&
        (selectedBagianType.toLowerCase() === "dekan"
          ? selectedBagian
          : selectedProdi) &&
        selectedAktivasiUjian
        ? "Data tidak ditemukan"
        : "Pilih jabatan, bagian atau program studi, dan aktivasi untuk melihat data"
      : isKelasTab
        ? selectedBagianType &&
          (selectedBagianType.toLowerCase() === "dekan"
            ? selectedBagian
            : selectedProdi) &&
          selectedAktivasiKelas
          ? "Data tidak ditemukan"
          : "Pilih jabatan, bagian atau program studi, dan aktivasi untuk melihat data"
        : selectedJabatan && selectedBagian && selectedAktivasi
          ? "Data tidak ditemukan"
          : "Pilih jabatan, bagian, dan aktivasi untuk melihat data";

  const title = `Daftar Pengajuan ${tipeLabel}`;
  const activeAktivasiLabel = isTahunanTab
    ? selectedAktivasiLabel
    : isUjianTab
      ? selectedAktivasiUjianLabel
      : selectedAktivasiKelasLabel;
  const selectedJabatanLabel =
    jabatanOptions.find((option) => option.value === selectedJabatan)?.label ??
    "";
  const selectedUnitLabel =
    isUjianTab || isKelasTab
      ? selectedBagianType.toLowerCase() === "dekan"
        ? selectedBagian
        : selectedProdi
      : selectedBagian;
  const firstBapRow = filteredRows[0] ?? {};
  const pengajuLabel = firstBapRow.user || "-";
  const secondPartyRole =
    firstBapRow.userJabatan ||
    (isUjianTab || isKelasTab ? selectedBagianType : selectedJabatanLabel) ||
    "-";
  const bapFileName = [
    "bap",
    tipeLabel,
    formatKategori(activeTab),
    selectedUnitLabel,
    activeAktivasiLabel,
  ]
    .map(sanitizeFilenameSegment)
    .filter(Boolean)
    .join("-");
  const hasBapRows = filteredRows.length > 0;

  return (
    <>
      <Helmet>
        <title>{title} | UNIKOM Perlengkapan</title>
      </Helmet>

      <div className="bg-white rounded shadow-sm overflow-hidden">
        <div className="bg-[#4773da] text-white px-6 py-4">
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>

        <div className="p-6">
          {toastMessage ? (
            <div className="fixed top-24 right-6 z-50 animate-[toast-in_220ms_ease-out] motion-reduce:animate-none rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 shadow">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-600">
                  !
                </span>
                <span>{toastMessage}</span>
              </div>
            </div>
          ) : null}
          <div className="flex space-x-6 border-b border-gray-100 mb-6">
            {TAB_OPTIONS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`pb-3 text-[15px] font-medium transition-colors relative ${
                  activeTab === tab.value
                    ? "text-[#4773da]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.label}
                {activeTab === tab.value ? (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#4773da]" />
                ) : null}
              </button>
            ))}
          </div>

          {renderFilters()}

          {pageError ? (
            <p className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 whitespace-pre-line">
              {pageError}
            </p>
          ) : null}

          {actionError ? (
            <p className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 whitespace-pre-line">
              {actionError}
            </p>
          ) : null}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div className="text-sm text-gray-600">
              <span className="font-bold text-gray-700">Pengaju:</span>{" "}
              {pengajuLabel}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
              {suratURL ? (
                <a
                  href={suratURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#4773da] hover:underline font-medium"
                >
                  Lihat Surat Permohonan
                </a>
              ) : (
                <span className="text-sm text-gray-400 cursor-not-allowed select-none">
                  Lihat Surat Permohonan
                </span>
              )}
              {hasBapRows ? (
                <PDFDownloadLink
                  document={
                    <BapDocument
                      mainRows={mainRows}
                      otherRows={lainnyaRows}
                      unitLabel={selectedUnitLabel || "-"}
                      secondPartyName={firstBapRow.user || "-"}
                      secondPartyRole={secondPartyRole}
                      secondPartyNip={firstBapRow.userNip || "-"}
                    />
                  }
                  fileName={`${bapFileName || "bap-pengajuan"}.pdf`}
                  className="inline-flex items-center justify-center rounded bg-[#4773da] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#365db8]"
                >
                  {({ loading }) =>
                    loading ? "Menyiapkan BAP..." : "Cetak BAP"
                  }
                </PDFDownloadLink>
              ) : (
                <span className="inline-flex items-center justify-center rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-500 cursor-not-allowed select-none">
                  Cetak BAP
                </span>
              )}
            </div>
          </div>

          {renderTable(
            `Aktivasi : ${activeAktivasiLabel || "-"}`,
            mainRows,
            emptyMessage,
          )}
          {renderTable("Pengajuan Lainnya", lainnyaRows, emptyMessage)}
        </div>
      </div>
    </>
  );
};

const PengajuanRutinPage = () => <AdminDaftarPengajuanPage tipe="rutin" />;

export { AdminDaftarPengajuanPage };
export default PengajuanRutinPage;

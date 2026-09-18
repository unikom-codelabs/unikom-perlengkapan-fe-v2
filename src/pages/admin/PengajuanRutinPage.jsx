import { useCallback, useEffect, useMemo, useState } from "react";
import PageHelmet from "../../components/Seo/PageHelmet";
import BapPrintModal from "../../components/Fragments/BapPrintModal";
import FilterSelect from "../../components/Fragments/FilterSelect";
import {
  AlertMessage,
  ToastMessage,
} from "../../components/Fragments/PageMessages";
import PengajuanApprovalTable from "../../components/Fragments/PengajuanApprovalTable";
import PengajuanTabs from "../../components/Fragments/PengajuanTabs";
import {
  approveBarangPengajuanAdmin,
  listDaftarPengajuanAdmin,
} from "../../api/pengajuanService";
import { listUnitTypeTree } from "../../api/unitTypeService";
import { listUsersPaginated } from "../../api/userService";
import { STORAGE_BASE_URL as BASE_STORAGE_URL } from "../../config/env";

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

const UJIAN_KELAS_JABATAN = ["dekan", "ketua program studi"];

const isDekanJabatanLabel = (label) =>
  normalizeUnitValue(label).startsWith("dekan");

const isKaprodiJabatanLabel = (label) => {
  const value = normalizeUnitValue(label);

  return (
    value.includes("kaprodi") ||
    value.includes("ka prodi") ||
    value.includes("ka. prodi") ||
    value.includes("ketua program studi") ||
    value.includes("program studi")
  );
};

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

const buildDefaultBapNumber = () => {
  const year = new Date().getFullYear();
  return `/BA-BP/UNIKOM/${year}`;
};

const TTD_NONE_VALUE = "tidak-diketahui";

const buildTtdLabel = (user = {}) => {
  const nama = String(user?.nama ?? "").trim();
  const satuan = String(user?.satuan ?? "").trim();

  if (nama && satuan && satuan !== "-") {
    return `${nama} - ${satuan}`;
  }

  return nama || satuan || "-";
};

const buildDefaultBapForm = (secondPartyRoleValue = "") => ({
  bapNumber: buildDefaultBapNumber(),
  ttd1Role: "Kepala Bagian Perlengkapan",
  ttd2Role: secondPartyRoleValue,
  ttd3Role: "",
  ttd3UserId: "",
  ttd4Role: "",
  ttd4UserId: "",
  tembusan: [""],
});

const normalizeLookupValue = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

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
  const [ttdUsers, setTtdUsers] = useState([]);
  const [isLoadingTtdUsers, setIsLoadingTtdUsers] = useState(false);
  const [isBapModalOpen, setIsBapModalOpen] = useState(false);
  const [shouldRenderBapModal, setShouldRenderBapModal] = useState(false);
  const [showBapModal, setShowBapModal] = useState(false);
  const [bapForm, setBapForm] = useState(() => buildDefaultBapForm(""));

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
    () => {
      const filteredByUnit = rowsByTipe.filter(row => row.kategori === "tahunan" && shouldIncludeByUnit(row, selectedBagian));
      return buildAktivasiOptions(filteredByUnit);
    },
    [rowsByTipe, selectedBagian],
  );
  const aktivasiOptionsUjian = useMemo(
    () => {
      const selectedUnit = isDekanJabatanLabel(selectedBagianType) ? selectedBagian : selectedProdi;
      const filteredByUnit = rowsByTipe.filter(row => row.kategori === "ujian" && shouldIncludeByUnit(row, selectedUnit));
      return buildAktivasiOptions(filteredByUnit);
    },
    [rowsByTipe, selectedBagianType, selectedBagian, selectedProdi],
  );
  const aktivasiOptionsKelas = useMemo(
    () => {
      const selectedUnit = isDekanJabatanLabel(selectedBagianType) ? selectedBagian : selectedProdi;
      const filteredByUnit = rowsByTipe.filter(row => row.kategori === "kelas" && shouldIncludeByUnit(row, selectedUnit));
      return buildAktivasiOptions(filteredByUnit);
    },
    [rowsByTipe, selectedBagianType, selectedBagian, selectedProdi],
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
        UJIAN_KELAS_JABATAN.includes(normalizeUnitValue(item.label)),
      ),
    [jabatanOptions],
  );

  const selectedJabatanChildOptions = useMemo(() => {
    const jabatan = jabatanOptions.find(
      (item) => normalizeUnitValue(item.label) === normalizeUnitValue(selectedBagianType),
    );

    return getChildOptions(jabatan?.children);
  }, [jabatanOptions, selectedBagianType]);

  const fetchRows = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchRows();
  }, [fetchRows, normalizedTipe]);

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
        (isDekanJabatanLabel(selectedBagianType)
          ? selectedBagian
          : selectedProdi) &&
        selectedAktivasiUjian
      : isKelasTab
        ? selectedBagianType &&
          (isDekanJabatanLabel(selectedBagianType)
            ? selectedBagian
            : selectedProdi) &&
          selectedAktivasiKelas
        : selectedJabatan && selectedBagian && selectedAktivasi;

    if (!hasRequiredSelections) {
      return false;
    }

    if (isUjianTab || isKelasTab) {
      const selectedUnit =
        isDekanJabatanLabel(selectedBagianType)
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
    if (value !== "" && Number.isFinite(rawValue) && rawValue > row.jumlah) {
      setInputError(
        row.id,
        "Jumlah disetujui tidak boleh melebihi jumlah diajukan.",
      );
      setToastMessage("Jumlah disetujui tidak boleh melebihi jumlah diajukan.");
    } else {
      setInputError(row.id, "");
    }

    let jumlahDisetujui = value === "" ? "" : Math.min(
      row.jumlah,
      Math.max(0, Number(value) || 0),
    );
    
    let status = row.status;
    if (jumlahDisetujui !== "") {
      if (jumlahDisetujui > 0) {
        status = 1; // Disetujui
      } else if (jumlahDisetujui === 0) {
        status = 2; // Ditolak
      }
    }

    updateRowLocal(row.id, { jumlahDisetujui, status });
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

  const handleJumlahBlur = (row, value) => {
    const finalJumlah = value === "" ? 0 : Math.min(row.jumlah, Math.max(0, Number(value) || 0));
    let status = row.status;
    if (finalJumlah > 0) {
      status = 1;
    } else if (finalJumlah === 0) {
      status = 2;
    }
    
    submitApproval(row, {
      jumlahDisetujui: finalJumlah,
      status
    });
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
      const isDekan = isDekanJabatanLabel(selectedBagianType);
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
          <FilterSelect
            label="Jabatan"
            value={selectedBagianType}
            onChange={setSelectedBagianType}
            placeholder="-- Pilih Jabatan --"
            options={ujianJabatanOptions.map((option) => ({
              ...option,
              value: option.label,
            }))}
            disabled={isLoadingFilters}
          />

          {selectedBagianType && isDekan ? (
            <FilterSelect
              label="Bagian"
              value={selectedBagian}
              onChange={setSelectedBagian}
              placeholder="-- Pilih Bagian --"
              options={selectedJabatanChildOptions}
            />
          ) : null}

          {selectedBagianType && !isDekan ? (
            <FilterSelect
              label={
                isKaprodiJabatanLabel(selectedBagianType)
                  ? "Program Studi"
                  : "Bagian"
              }
              value={selectedProdi}
              onChange={setSelectedProdi}
              placeholder="-- Pilih --"
              options={selectedJabatanChildOptions}
            />
          ) : null}

          {selectedBagianType && selectedUnit ? (
            <FilterSelect
              label="Aktivasi"
              value={selectedAktivasiValue}
              onChange={setSelectedAktivasiValue}
              placeholder="-- Pilih Aktivasi --"
              options={options}
            />
          ) : null}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <FilterSelect
          label="Jabatan"
          value={selectedJabatan}
          onChange={setSelectedJabatan}
          placeholder="-- Pilih Jabatan --"
          options={jabatanOptions}
          disabled={isLoadingFilters}
        />

        {selectedJabatan ? (
          <FilterSelect
            label="Bagian"
            value={selectedBagian}
            onChange={setSelectedBagian}
            placeholder="-- Pilih Bagian --"
            options={bagianOptions}
          />
        ) : null}

        {selectedJabatan && selectedBagian ? (
          <FilterSelect
            label="Aktivasi"
            value={selectedAktivasi}
            onChange={setSelectedAktivasi}
            placeholder="-- Pilih Aktivasi --"
            options={aktivasiOptions}
          />
        ) : null}
      </div>
    );
  };

  const emptyMessage = isLoading
    ? "Memuat data pengajuan..."
    : isUjianTab
      ? selectedBagianType &&
        (isDekanJabatanLabel(selectedBagianType)
          ? selectedBagian
          : selectedProdi) &&
        selectedAktivasiUjian
        ? "Data tidak ditemukan"
        : "Pilih jabatan, bagian atau program studi, dan aktivasi untuk melihat data"
      : isKelasTab
        ? selectedBagianType &&
          (isDekanJabatanLabel(selectedBagianType)
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
      ? isDekanJabatanLabel(selectedBagianType)
        ? selectedBagian
        : selectedProdi
      : selectedBagian;
  const firstBapRow = filteredRows[0] ?? {};
  const pengajuLabel = firstBapRow.user || "-";
  const secondPartyRole =
    firstBapRow.userJabatan ||
    (isUjianTab || isKelasTab ? selectedBagianType : selectedJabatanLabel) ||
    "-";

  const fetchTtdUsers = useCallback(async () => {
    setIsLoadingTtdUsers(true);

    try {
      const firstResult = await listUsersPaginated({ page: 1 });
      const totalPages = Number(firstResult.pagination?.lastPage ?? 1);
      const users = [...(firstResult.users ?? [])];

      if (totalPages > 1) {
        const pageNumbers = Array.from(
          { length: totalPages - 1 },
          (_, index) => index + 2,
        );
        const results = await Promise.all(
          pageNumbers.map((page) => listUsersPaginated({ page })),
        );

        results.forEach((result) => {
          users.push(...(result.users ?? []));
        });
      }

      setTtdUsers(users);
    } catch {
      setTtdUsers([]);
    } finally {
      setIsLoadingTtdUsers(false);
    }
  }, []);

  useEffect(() => {
    if (isBapModalOpen) {
      setBapForm(buildDefaultBapForm(secondPartyRole));
      setShouldRenderBapModal(true);
      const timer = setTimeout(() => setShowBapModal(true), 10);
      return () => clearTimeout(timer);
    }

    setShowBapModal(false);
    const timer = setTimeout(() => setShouldRenderBapModal(false), 150);
    return () => clearTimeout(timer);
  }, [isBapModalOpen, secondPartyRole]);

  useEffect(() => {
    if (!isBapModalOpen || isLoadingTtdUsers || ttdUsers.length > 0) {
      return;
    }

    fetchTtdUsers();
  }, [fetchTtdUsers, isBapModalOpen, isLoadingTtdUsers, ttdUsers.length]);

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

  const updateBapField = (name, value) => {
    setBapForm((current) => {
      if (name === "ttd3Role" || name === "ttd4Role") {
        const userField = name === "ttd3Role" ? "ttd3UserId" : "ttd4UserId";

        return { ...current, [name]: value, [userField]: "" };
      }

      return { ...current, [name]: value };
    });
  };

  const updateTembusan = (index, value) => {
    setBapForm((current) => {
      const nextTembusan = [...current.tembusan];
      nextTembusan[index] = value;
      return { ...current, tembusan: nextTembusan };
    });
  };

  const handleAddTembusan = () => {
    setBapForm((current) => ({
      ...current,
      tembusan: [...current.tembusan, ""],
    }));
  };

  const handleRemoveTembusan = (indexToRemove) => {
    setBapForm((current) => {
      if (current.tembusan.length <= 1) {
        return current;
      }

      if (Number.isInteger(indexToRemove) && indexToRemove > 0) {
        return {
          ...current,
          tembusan: current.tembusan.filter(
            (_, index) => index !== indexToRemove,
          ),
        };
      }

      return {
        ...current,
        tembusan: current.tembusan.slice(0, -1),
      };
    });
  };

  const resolveTtdUser = useCallback(
    (bagianName) => {
      const normalizedBagian = normalizeLookupValue(bagianName);
      if (!normalizedBagian) {
        return null;
      }

      return (
        ttdUsers.find((user) => {
          const unitName = normalizeLookupValue(user.satuan);
          const nestedUnitName = normalizeLookupValue(user.unit?.nama);
          const jabatanName = normalizeLookupValue(
            typeof user.jabatan === "object" ? user.jabatan?.nama : user.jabatan,
          );
          const jabatanNama = normalizeLookupValue(user.jabatan_nama);
          return (
            unitName === normalizedBagian ||
            nestedUnitName === normalizedBagian ||
            jabatanName === normalizedBagian ||
            jabatanNama === normalizedBagian
          );
        }) ?? null
      );
    },
    [ttdUsers],
  );

  const secondPartyUser = useMemo(
    () => resolveTtdUser(selectedUnitLabel) ?? resolveTtdUser(bapForm.ttd2Role),
    [bapForm.ttd2Role, resolveTtdUser, selectedUnitLabel],
  );
  const secondPartyName =
    secondPartyUser?.nama || firstBapRow.user || "-";
  const secondPartyNip = secondPartyUser?.nip || firstBapRow.userNip || "-";

  const ttdJabatanOptions = useMemo(() => {
    const seen = new Map();

    ttdUsers.forEach((user) => {
      const jabatan = String(user?.jabatan ?? "").trim();

      if (!jabatan || jabatan === "-" || seen.has(jabatan.toLowerCase())) {
        return;
      }

      seen.set(jabatan.toLowerCase(), { value: jabatan, label: jabatan });
    });

    return [
      { value: TTD_NONE_VALUE, label: "Tidak Diketahui" },
      ...Array.from(seen.values()).sort((a, b) =>
        a.label.localeCompare(b.label, "id-ID"),
      ),
    ];
  }, [ttdUsers]);

  const getTtdUserOptions = useCallback(
    (jabatan) => {
      const normalizedJabatan = normalizeLookupValue(jabatan);

      if (!normalizedJabatan || jabatan === TTD_NONE_VALUE) {
        return [];
      }

      return ttdUsers
        .filter(
          (user) =>
            normalizeLookupValue(user?.jabatan) === normalizedJabatan &&
            String(user?.nama ?? "").trim(),
        )
        .map((user) => ({ value: String(user.id), label: buildTtdLabel(user) }))
        .sort((a, b) => a.label.localeCompare(b.label, "id-ID"));
    },
    [ttdUsers],
  );

  const findTtdUserById = useCallback(
    (value) =>
      value
        ? (ttdUsers.find((user) => String(user.id) === String(value)) ?? null)
        : null,
    [ttdUsers],
  );

  const ttd3UserOptions = useMemo(
    () => getTtdUserOptions(bapForm.ttd3Role),
    [bapForm.ttd3Role, getTtdUserOptions],
  );
  const ttd4UserOptions = useMemo(
    () => getTtdUserOptions(bapForm.ttd4Role),
    [bapForm.ttd4Role, getTtdUserOptions],
  );
  const ttd3User = useMemo(
    () =>
      bapForm.ttd3Role === TTD_NONE_VALUE
        ? null
        : findTtdUserById(bapForm.ttd3UserId),
    [bapForm.ttd3Role, bapForm.ttd3UserId, findTtdUserById],
  );
  const ttd4User = useMemo(
    () =>
      bapForm.ttd4Role === TTD_NONE_VALUE
        ? null
        : findTtdUserById(bapForm.ttd4UserId),
    [bapForm.ttd4Role, bapForm.ttd4UserId, findTtdUserById],
  );

  const isTtdSelectionValid = (jabatan, userId) => {
    if (!String(jabatan ?? "").trim()) {
      return false;
    }

    return jabatan === TTD_NONE_VALUE || Boolean(String(userId ?? "").trim());
  };

  const isBapFormValid =
    bapForm.bapNumber.trim() &&
    isTtdSelectionValid(bapForm.ttd3Role, bapForm.ttd3UserId) &&
    isTtdSelectionValid(bapForm.ttd4Role, bapForm.ttd4UserId) &&
    bapForm.tembusan.every((item) => item.trim());

  const bapDocumentData = {
    mainRows,
    otherRows: lainnyaRows,
    unitLabel: selectedUnitLabel || "-",
    secondPartyName,
    secondPartyRole: bapForm.ttd2Role,
    secondPartyNip,
    bapNumber: bapForm.bapNumber,
    firstPartyRole: bapForm.ttd1Role,
    knownByPrimary: ttd3User
      ? {
          title: String(ttd3User.jabatan ?? "").trim(),
          role: "",
          name: ttd3User.nama,
          nip: ttd3User.nip,
        }
      : null,
    knownBySecondary: ttd4User
      ? {
          title: String(ttd4User.jabatan ?? "").trim(),
          role: "",
          name: ttd4User.nama,
          nip: ttd4User.nip,
        }
      : null,
    tembusan: bapForm.tembusan,
  };

  return (
    <>
      <PageHelmet
        title={title}
        description={`Kelola daftar pengajuan ${tipeLabel.toLowerCase()} dan cetak BAP pengajuan.`}
      />

      <div className="bg-white rounded shadow-sm overflow-hidden">
        <div className="bg-[#4773da] text-white px-6 py-4">
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>

        <div className="p-6">
          <ToastMessage>{toastMessage}</ToastMessage>
          <PengajuanTabs
            tabs={TAB_OPTIONS}
            activeValue={activeTab}
            onChange={setActiveTab}
          />

          {renderFilters()}

          <AlertMessage>{pageError}</AlertMessage>
          <AlertMessage>{actionError}</AlertMessage>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div className="text-sm text-gray-600">
              <span className="font-bold text-gray-700">Pengaju:</span>{" "}
              {pengajuLabel}
            </div>
          </div>

          <PengajuanApprovalTable
            title={`Aktivasi : ${activeAktivasiLabel || "-"}`}
            rows={mainRows}
            emptyMessage={emptyMessage}
            updatingRowId={updatingRowId}
            inputErrors={inputErrors}
            formatKategori={formatKategori}
            formatStatus={formatStatus}
            statusBadgeClass={statusBadgeClass}
            onJumlahChange={handleJumlahChange}
            onJumlahBlur={handleJumlahBlur}
            onStatusChange={handleStatusChange}
          />
          <PengajuanApprovalTable
            title="Pengajuan Lainnya"
            rows={lainnyaRows}
            emptyMessage={emptyMessage}
            updatingRowId={updatingRowId}
            inputErrors={inputErrors}
            formatKategori={formatKategori}
            formatStatus={formatStatus}
            statusBadgeClass={statusBadgeClass}
            onJumlahChange={handleJumlahChange}
            onJumlahBlur={handleJumlahBlur}
            onStatusChange={handleStatusChange}
          />
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {suratURL ? (
              <a
                href={suratURL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 border border-[#4279df] text-[#4279df] font-medium rounded-full hover:bg-blue-50 transition-colors text-sm"
              >
                Lihat Surat Permohonan
              </a>
            ) : (
              <span className="text-sm px-6 py-2 border border-gray-300 font-medium rounded-full text-gray-400 cursor-not-allowed select-none">
                Lihat Surat Permohonan
              </span>
            )}
            {hasBapRows ? (
              <button
                type="button"
                onClick={() => setIsBapModalOpen(true)}
                className="flex items-center gap-2 bg-[#4279df] hover:bg-blue-600 text-white px-5 py-2.5 rounded-full transition-colors text-sm shadow-sm"
              >
                BAP
              </button>
            ) : (
              <span className="flex items-center gap-2 bg-gray-200 px-4 py-2 text-sm font-medium text-gray-500 rounded-full cursor-not-allowed select-none">
                BAP
              </span>
            )}
          </div>
        </div>
      </div>

      {shouldRenderBapModal ? (
        <BapPrintModal
          isVisible={showBapModal}
          form={{ ...bapForm, secondPartyName }}
          ttdOptions={ttdJabatanOptions}
          ttd3UserOptions={ttd3UserOptions}
          ttd4UserOptions={ttd4UserOptions}
          noneValue={TTD_NONE_VALUE}
          isLoadingTtdOptions={isLoadingTtdUsers}
          isFormValid={Boolean(isBapFormValid)}
          documentData={bapDocumentData}
          fileName={bapFileName}
          onClose={() => setIsBapModalOpen(false)}
          onFieldChange={updateBapField}
          onTembusanChange={updateTembusan}
          onAddTembusan={handleAddTembusan}
          onRemoveTembusan={handleRemoveTembusan}
        />
      ) : null}
    </>
  );
};

const PengajuanRutinPage = () => <AdminDaftarPengajuanPage tipe="rutin" />;

export { AdminDaftarPengajuanPage };
export default PengajuanRutinPage;

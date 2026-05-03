import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import AktivasiCard from "../../components/Element/AktivasiCard";
import ModalAktivasiPengajuan from "../../components/Element/ModalAktivasiPengajuan";
import ModalKonfirmasiHapus from "../../components/Element/ModalKonfirmasiHapus";
import {
  createAktivasiPengajuan,
  deleteAktivasiPengajuan,
  listAktivasiPengajuan,
  listPengajuanBelumAktivasi,
  updateAktivasiPengajuan,
} from "../../api/aktivasiPengajuanService";

const CARD_CONFIGS = [
  {
    kategori: "tahunan",
    title: "Pengajuan ATK Tahunan",
  },
  {
    kategori: "ujian",
    title: "Pengajuan ATK Ujian",
  },
  {
    kategori: "kelas",
    title: "Pengajuan ATK Kelas",
  },
];

const SEMESTER_REQUIRED_KATEGORI = new Set(["ujian", "kelas"]);
const UJIAN_REQUIRED_KATEGORI = new Set(["ujian"]);

const buildInitialCardState = () =>
  CARD_CONFIGS.map((config) => ({
    ...config,
    id: null,
    idPengajuan: null,
    namaPeriode: "",
    aktifMulai: null,
    aktifSelesai: null,
    tanggalMulai: null,
    tanggalSelesai: null,
    tipe: "rutin",
    tahunAkademik: "",
    pendingPengajuanId: null,
    pendingTipe: "rutin",
    pendingTahunAkademik: "",
    pendingSemester: "",
    pendingUjian: "",
    pendingPengajuanList: [],
    statusAktif: false,
  }));

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

const toTimestamp = (value) => {
  if (!value) {
    return 0;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

const sortPeriodeList = (list = []) =>
  [...list].sort((a, b) => {
    if (a.statusAktif !== b.statusAktif) {
      return a.statusAktif ? -1 : 1;
    }

    return (
      toTimestamp(b.tanggalSelesai || b.tanggalMulai) -
      toTimestamp(a.tanggalSelesai || a.tanggalMulai)
    );
  });

const sortPendingPengajuanList = (list = []) =>
  [...list].sort(
    (a, b) => toTimestamp(b.tanggalPengajuan) - toTimestamp(a.tanggalPengajuan),
  );

const getSemesterOptions = (list = []) => {
  const uniqueSemester = new Set(
    list
      .map((item) =>
        String(item.semester ?? "")
          .trim()
          .toLowerCase(),
      )
      .filter(Boolean),
  );

  return ["ganjil", "genap"].filter((semester) => uniqueSemester.has(semester));
};

const normalizeUjianValue = (value) => {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();

  if (!normalized || normalized === "default") {
    return "";
  }

  if (["uts", "mid", "midterm", "tengah semester"].includes(normalized)) {
    return "uts";
  }

  if (["uas", "final", "akhir semester"].includes(normalized)) {
    return "uas";
  }

  return normalized;
};

const getUjianOptions = (list = []) => {
  const uniqueJenisUjian = new Set(
    list.map((item) => normalizeUjianValue(item.ujian)).filter(Boolean),
  );

  const orderedOptions = ["uts", "uas"].filter((jenisUjian) =>
    uniqueJenisUjian.has(jenisUjian),
  );

  return orderedOptions.length > 0 ? orderedOptions : ["uts", "uas"];
};

const pickPengajuanByCriteria = (
  list = [],
  { semester = "", ujian = "" } = {},
) => {
  const normalizedSemester = String(semester ?? "")
    .trim()
    .toLowerCase();
  const normalizedUjian = normalizeUjianValue(ujian);
  const hasCriteria = Boolean(normalizedSemester || normalizedUjian);
  const sortedList = sortPendingPengajuanList(list);

  const filteredList = sortedList.filter((item) => {
    const isSemesterMatch = normalizedSemester
      ? String(item.semester ?? "")
          .trim()
          .toLowerCase() === normalizedSemester
      : true;
    const isUjianMatch = normalizedUjian
      ? normalizeUjianValue(item.ujian) === normalizedUjian
      : true;

    return isSemesterMatch && isUjianMatch;
  });

  if (filteredList.length > 0) {
    return filteredList[0];
  }

  if (hasCriteria) {
    return null;
  }

  return sortedList[0] ?? null;
};

const toDateInputValue = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
};

const getCurrentAcademicYear = () => {
  const currentYear = new Date().getFullYear();
  return `${currentYear}/${currentYear + 1}`;
};

const inferAcademicYear = (dateValue) => {
  if (!dateValue) {
    return getCurrentAcademicYear();
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return getCurrentAcademicYear();
  }

  const year = date.getFullYear();
  return `${year}/${year + 1}`;
};

const AktivasiPage = () => {
  const [cards, setCards] = useState(buildInitialCardState);
  const [isLoading, setIsLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [actionError, setActionError] = useState("");
  const [modalError, setModalError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [activatingKategori, setActivatingKategori] = useState("");

  const isSubmittingActivation = Boolean(activatingKategori);

  const fetchAktivasiData = async () => {
    setIsLoading(true);
    setPageError("");

    try {
      const [aktivasiList, pendingPengajuanList] = await Promise.all([
        listAktivasiPengajuan(),
        listPengajuanBelumAktivasi(),
      ]);

      const sortedList = sortPeriodeList(aktivasiList);
      const sortedPendingPengajuan =
        sortPendingPengajuanList(pendingPengajuanList);

      const nextCards = CARD_CONFIGS.map((config) => {
        const listPeriodeByKategori = sortedList.filter(
          (item) => item.kategori === config.kategori,
        );
        const periode = listPeriodeByKategori[0] ?? null;
        const pendingByKategori = sortedPendingPengajuan.filter(
          (item) => item.kategori === config.kategori,
        );
        const semesterOptions = getSemesterOptions(pendingByKategori);
        const ujianOptions = getUjianOptions(pendingByKategori);
        const pengajuanByPeriodeId = pendingByKategori.find(
          (item) => item.id === periode?.idPengajuan,
        );
        const isSemesterRequired = SEMESTER_REQUIRED_KATEGORI.has(
          config.kategori,
        );
        const isUjianRequired = UJIAN_REQUIRED_KATEGORI.has(config.kategori);
        const pendingSemester =
          pengajuanByPeriodeId?.semester ||
          (isSemesterRequired ? semesterOptions[0] || "" : "");
        const pendingUjian =
          normalizeUjianValue(pengajuanByPeriodeId?.ujian) ||
          (isUjianRequired ? ujianOptions[0] || "" : "");
        const pendingPengajuan = pickPengajuanByCriteria(pendingByKategori, {
          semester: pendingSemester,
          ujian: pendingUjian,
        });
        const resolvedPendingSemester = isSemesterRequired
          ? String(pendingPengajuan?.semester ?? pendingSemester)
              .trim()
              .toLowerCase()
          : "";
        const resolvedPendingUjian = isUjianRequired
          ? normalizeUjianValue(pendingPengajuan?.ujian) || pendingUjian
          : "";

        if (!periode) {
          return {
            ...config,
            id: null,
            idPengajuan: pendingPengajuan?.id ?? null,
            namaPeriode: "",
            aktifMulai: null,
            aktifSelesai: null,
            tanggalMulai: null,
            tanggalSelesai: null,
            tipe: pendingPengajuan?.tipe ?? "rutin",
            tahunAkademik: pendingPengajuan?.tahunAkademik ?? "",
            pendingPengajuanId: pendingPengajuan?.id ?? null,
            pendingTipe: pendingPengajuan?.tipe ?? "rutin",
            pendingTahunAkademik: pendingPengajuan?.tahunAkademik ?? "",
            pendingSemester: resolvedPendingSemester,
            pendingUjian: resolvedPendingUjian,
            pendingPengajuanList: pendingByKategori,
            statusAktif: false,
          };
        }

        return {
          ...config,
          ...periode,
          pendingPengajuanId:
            periode.idPengajuan ?? pendingPengajuan?.id ?? null,
          pendingTipe: pendingPengajuan?.tipe ?? periode.tipe ?? "rutin",
          pendingTahunAkademik:
            pendingPengajuan?.tahunAkademik ?? periode.tahunAkademik ?? "",
          pendingSemester: resolvedPendingSemester,
          pendingUjian: resolvedPendingUjian,
          pendingPengajuanList: pendingByKategori,
        };
      });

      setCards(nextCards);
    } catch (error) {
      setPageError(
        getApiErrorMessage(
          error,
          "Gagal mengambil data periode aktivasi. Coba lagi.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAktivasiData();
  }, []);

  const handleOpenAktivasiModal = (kategori) => {
    const selectedCard = cards.find((item) => item.kategori === kategori);

    if (!selectedCard) {
      setActionError("Data kategori tidak ditemukan.");
      setSuccessMessage("");
      return;
    }

    setModalMode("create");
    setSelectedCard(selectedCard);
    setModalError("");
    setActionError("");
    setSuccessMessage("");
    setIsModalOpen(true);
  };

  const handleOpenEditAktivasiModal = (kategori) => {
    const selectedCard = cards.find((item) => item.kategori === kategori);

    if (!selectedCard?.id) {
      setActionError(
        `Data aktivasi untuk ${selectedCard?.title ?? "kategori ini"} belum tersedia.`,
      );
      setSuccessMessage("");
      return;
    }

    setModalMode("edit");
    setSelectedCard(selectedCard);
    setModalError("");
    setActionError("");
    setSuccessMessage("");
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (kategori) => {
    const selectedCard = cards.find((item) => item.kategori === kategori);

    if (!selectedCard?.id) {
      return;
    }

    setDeleteTarget(selectedCard);
    setActionError("");
    setSuccessMessage("");
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = (forceClose = false) => {
    if (isDeleting && !forceClose) {
      return;
    }

    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const handleCloseAktivasiModal = () => {
    if (isSubmittingActivation) {
      return;
    }

    setIsModalOpen(false);
    setSelectedCard(null);
    setModalError("");
  };

  const handleSubmitAktivasi = async (payload) => {
    if (!selectedCard) {
      return;
    }

    const isSemesterRequired = SEMESTER_REQUIRED_KATEGORI.has(
      selectedCard.kategori,
    );
    const isUjianRequired = UJIAN_REQUIRED_KATEGORI.has(selectedCard.kategori);
    const payloadSemester = isSemesterRequired
      ? String(payload.semester ?? "")
          .trim()
          .toLowerCase()
      : "";
    const payloadUjian = isUjianRequired
      ? normalizeUjianValue(payload.ujian)
      : "";
    const pendingPengajuanList = selectedCard.pendingPengajuanList ?? [];
    const selectedPengajuan = pickPengajuanByCriteria(pendingPengajuanList, {
      semester: payloadSemester || selectedCard.pendingSemester,
      ujian: payloadUjian || selectedCard.pendingUjian,
    });

    if (pendingPengajuanList.length > 0 && !selectedPengajuan) {
      setModalError(
        isUjianRequired
          ? "ID pengajuan belum ditemukan untuk kombinasi semester dan jenis ujian yang dipilih."
          : isSemesterRequired
            ? "ID pengajuan belum ditemukan untuk semester yang dipilih."
            : "ID pengajuan belum ditemukan untuk jenis yang dipilih.",
      );
      return;
    }

    const resolvedPengajuanId =
      payload.id_pengajuan ??
      selectedPengajuan?.id ??
      selectedCard.pendingPengajuanId ??
      selectedCard.idPengajuan ??
      null;

    if (resolvedPengajuanId === null) {
      setModalError(
        isUjianRequired
          ? "ID pengajuan belum ditemukan untuk jenis ujian/semester yang dipilih."
          : isSemesterRequired
            ? "ID pengajuan belum ditemukan untuk jenis/semester yang dipilih."
            : "ID pengajuan belum ditemukan untuk jenis yang dipilih.",
      );
      return;
    }

    setActivatingKategori(selectedCard.kategori);
    setModalError("");
    setActionError("");
    setSuccessMessage("");

    try {
      const submitPayload = {
        ...payload,
        id_pengajuan: resolvedPengajuanId,
        tipe:
          payload.tipe ||
          selectedPengajuan?.tipe ||
          selectedCard.tipe ||
          selectedCard.pendingTipe,
        semester: isSemesterRequired
          ? payloadSemester ||
            selectedPengajuan?.semester ||
            selectedCard.pendingSemester ||
            undefined
          : undefined,
        ujian: isUjianRequired
          ? payloadUjian ||
            normalizeUjianValue(selectedPengajuan?.ujian) ||
            selectedCard.pendingUjian ||
            undefined
          : undefined,
        tahun_akademik:
          payload.tahun_akademik ||
          selectedPengajuan?.tahunAkademik ||
          selectedCard.tahunAkademik ||
          selectedCard.pendingTahunAkademik,
        nama_periode: selectedCard.namaPeriode || selectedCard.title,
      };

      if (modalMode === "edit" && selectedCard.id) {
        await updateAktivasiPengajuan(selectedCard.id, submitPayload);
      } else {
        await createAktivasiPengajuan(submitPayload);
      }

      setIsModalOpen(false);
      setSelectedCard(null);
      setSuccessMessage(
        modalMode === "edit"
          ? `${selectedCard.title} berhasil diperbarui.`
          : `${selectedCard.title} berhasil diaktivasi.`,
      );
      await fetchAktivasiData();
    } catch (error) {
      setModalError(
        getApiErrorMessage(error, "Gagal menyimpan data aktivasi."),
      );
    } finally {
      setActivatingKategori("");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) {
      return;
    }

    setIsDeleting(true);
    setActionError("");

    try {
      await deleteAktivasiPengajuan(deleteTarget.id);
      setSuccessMessage(`${deleteTarget.title} berhasil dihapus.`);
      handleCloseDeleteModal(true);
      await fetchAktivasiData();
    } catch (error) {
      setActionError(
        getApiErrorMessage(error, "Gagal menghapus data aktivasi."),
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const activationFormDefaults = useMemo(() => {
    if (!selectedCard) {
      return null;
    }

    const isSemesterRequired = SEMESTER_REQUIRED_KATEGORI.has(
      selectedCard.kategori,
    );
    const isUjianRequired = UJIAN_REQUIRED_KATEGORI.has(selectedCard.kategori);
    const pendingPengajuanList = selectedCard.pendingPengajuanList ?? [];
    const semesterOptions = getSemesterOptions(pendingPengajuanList);
    const ujianOptions = getUjianOptions(pendingPengajuanList);
    const semesterById = pendingPengajuanList.find(
      (item) => item.id === selectedCard.idPengajuan,
    )?.semester;
    const ujianById = normalizeUjianValue(
      pendingPengajuanList.find((item) => item.id === selectedCard.idPengajuan)
        ?.ujian,
    );
    const defaultSemester = isSemesterRequired
      ? semesterById || selectedCard.pendingSemester || semesterOptions[0] || ""
      : "";
    const defaultUjian = isUjianRequired
      ? ujianById || selectedCard.pendingUjian || ujianOptions[0] || ""
      : "";
    const defaultPengajuan = pickPengajuanByCriteria(pendingPengajuanList, {
      semester: defaultSemester,
      ujian: defaultUjian,
    });
    const activeStartDate =
      selectedCard.aktifMulai || selectedCard.tanggalMulai;
    const activeEndDate =
      selectedCard.aktifSelesai || selectedCard.tanggalSelesai;

    return {
      id_pengajuan:
        defaultPengajuan?.id ??
        selectedCard.pendingPengajuanId ??
        selectedCard.idPengajuan ??
        selectedCard.id ??
        "",
      aktif_mulai:
        toDateInputValue(activeStartDate) || toDateInputValue(new Date()),
      aktif_selesai: toDateInputValue(activeEndDate),
      tipe:
        defaultPengajuan?.tipe ||
        selectedCard.tipe ||
        selectedCard.pendingTipe ||
        "rutin",
      semester: defaultSemester,
      ujian: defaultUjian,
      tahun_akademik:
        defaultPengajuan?.tahunAkademik ||
        selectedCard.tahunAkademik ||
        selectedCard.pendingTahunAkademik ||
        inferAcademicYear(activeStartDate || activeEndDate),
    };
  }, [selectedCard]);

  const modalSemesterOptions = useMemo(() => {
    if (!selectedCard) {
      return [];
    }

    return getSemesterOptions(selectedCard.pendingPengajuanList || []);
  }, [selectedCard]);

  const modalUjianOptions = useMemo(() => {
    if (!selectedCard) {
      return [];
    }

    return getUjianOptions(selectedCard.pendingPengajuanList || []);
  }, [selectedCard]);

  const showSemesterInModal = Boolean(
    selectedCard && SEMESTER_REQUIRED_KATEGORI.has(selectedCard.kategori),
  );

  const showUjianInModal = Boolean(
    selectedCard && UJIAN_REQUIRED_KATEGORI.has(selectedCard.kategori),
  );

  return (
    <>
      <Helmet>
        <title>Aktivasi | UNIKOM Perlengkapan</title>
      </Helmet>
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

      {successMessage ? (
        <p className="mb-4 rounded border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
          {successMessage}
        </p>
      ) : null}

      {isLoading ? (
        <div className="py-8 text-center text-gray-500">
          Memuat data aktivasi...
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
        {cards.map((card) => (
          <AktivasiCard
            key={card.kategori}
            title={card.title}
            periodName={card.namaPeriode}
            startDate={card.tanggalMulai}
            endDate={card.tanggalSelesai}
            isActive={card.statusAktif}
            isActivating={activatingKategori === card.kategori}
            isDeleting={isDeleting && deleteTarget?.kategori === card.kategori}
            showManageActions={Boolean(card.id)}
            onActivate={() => handleOpenAktivasiModal(card.kategori)}
            onEdit={() => handleOpenEditAktivasiModal(card.kategori)}
            onDelete={() => handleOpenDeleteModal(card.kategori)}
            isActivateDisabled={
              isLoading ||
              isDeleting ||
              (isSubmittingActivation && activatingKategori !== card.kategori)
            }
          />
        ))}
      </div>

      {isModalOpen ? (
        <ModalAktivasiPengajuan
          isOpen={isModalOpen}
          onClose={handleCloseAktivasiModal}
          onSubmit={handleSubmitAktivasi}
          isSubmitting={isSubmittingActivation}
          defaultValues={activationFormDefaults}
          errorMessage={modalError}
          showSemester={showSemesterInModal}
          semesterOptions={modalSemesterOptions}
          showUjianType={showUjianInModal}
          ujianOptions={modalUjianOptions}
          kategoriTitle={`${
            modalMode === "edit" ? "Edit Aktivasi" : "Aktivasi Baru"
          } - ${selectedCard?.title ?? "Periode Pengajuan"}`}
        />
      ) : null}

      <ModalKonfirmasiHapus
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Hapus Aktivasi"
        message={`Apakah Anda yakin ingin menghapus aktivasi untuk ${deleteTarget?.title ?? "kategori ini"}?`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        isProcessing={isDeleting}
      />
    </>
  );
};

export default AktivasiPage;

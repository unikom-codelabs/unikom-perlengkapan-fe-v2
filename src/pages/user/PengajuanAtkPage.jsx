import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import {
  CheckIcon,
  CloudArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import apiClient from "../../api/ApiClient";
import { listBarang } from "../../api/barangService";
import { listAktivasiPengajuan } from "../../api/aktivasiPengajuanService";

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

const CELL_PLACEHOLDER_CLASS =
  "px-3 py-2 border border-gray-200 text-center text-sm text-gray-500";

const formatKategoriLabel = (value) =>
  String(value ?? "")
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");

const PengajuanAtkPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [barangList, setBarangList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmittingPengajuan, setIsSubmittingPengajuan] = useState(false);
  const [activationStatus, setActivationStatus] = useState("unknown");
  const [activationError, setActivationError] = useState("");
  const [quantities, setQuantities] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shouldRenderModal, setShouldRenderModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [shouldRenderSuccessModal, setShouldRenderSuccessModal] =
    useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const [shouldRenderActivationModal, setShouldRenderActivationModal] =
    useState(false);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [isSubmittingLainnya, setIsSubmittingLainnya] = useState(false);
  const [modalError, setModalError] = useState("");
  const [pengajuanLainnya, setPengajuanLainnya] = useState([]);
  const [formLainnya, setFormLainnya] = useState({
    nama: "",
    jumlah: "",
    kategori: "habis_pakai",
    satuan: "",
  });
  const itemsPerPage = 10;
  const fileInputRef = useRef(null);
  const isActivationBlocked = activationStatus === "inactive";

  const toTimestamp = (value) => {
    if (!value) {
      return 0;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  };

  const isActivationActive = (aktivasi = {}) => {
    const now = Date.now();
    const startValue = aktivasi.aktifMulai || aktivasi.tanggalMulai || null;
    const endValue = aktivasi.aktifSelesai || aktivasi.tanggalSelesai || null;
    const startTime = startValue ? new Date(startValue).getTime() : null;
    const endTime = endValue ? new Date(endValue).getTime() : null;

    if (
      startTime &&
      endTime &&
      Number.isFinite(startTime) &&
      Number.isFinite(endTime)
    ) {
      return now >= startTime && now <= endTime;
    }

    if (startTime && Number.isFinite(startTime) && now < startTime) {
      return false;
    }

    if (endTime && Number.isFinite(endTime) && now > endTime) {
      return false;
    }

    return Boolean(aktivasi?.statusAktif);
  };

  const pickTahunanAktivasi = (list = []) => {
    const tahunanList = list.filter(
      (item) => String(item.kategori).toLowerCase() === "tahunan",
    );

    if (tahunanList.length === 0) {
      return null;
    }

    return [...tahunanList].sort((a, b) => {
      if (a.statusAktif !== b.statusAktif) {
        return a.statusAktif ? -1 : 1;
      }

      return (
        toTimestamp(b.tanggalSelesai || b.tanggalMulai) -
        toTimestamp(a.tanggalSelesai || a.tanggalMulai)
      );
    })[0];
  };

  useEffect(() => {
    const fetchBarang = async () => {
      setIsLoading(true);
      setPageError("");

      try {
        const data = await listBarang();
        setBarangList(data);
      } catch (error) {
        setPageError(getApiErrorMessage(error, "Gagal mengambil data barang."));
      } finally {
        setIsLoading(false);
      }
    };

    fetchBarang();
  }, []);

  useEffect(() => {
    const fetchAktivasi = async () => {
      setActivationError("");

      try {
        const data = await listAktivasiPengajuan();
        const tahunanAktivasi = pickTahunanAktivasi(data);

        if (!tahunanAktivasi) {
          setActivationStatus("inactive");
          return;
        }

        setActivationStatus(
          isActivationActive(tahunanAktivasi) ? "active" : "inactive",
        );
      } catch (error) {
        setActivationError(
          getApiErrorMessage(error, "Gagal memuat status aktivasi."),
        );
        setActivationStatus("unknown");
      }
    };

    fetchAktivasi();
  }, []);

  useEffect(() => {
    if (isActivationBlocked) {
      setIsActivationModalOpen(true);
      return;
    }

    setIsActivationModalOpen(false);
  }, [isActivationBlocked]);

  useEffect(() => {
    setQuantities((prev) => {
      const next = { ...prev };

      barangList.forEach((item) => {
        if (next[item.id] === undefined) {
          next[item.id] = 0;
        }
      });

      Object.keys(next).forEach((key) => {
        const numericId = Number(key);
        const exists = barangList.some(
          (item) => String(item.id) === key || item.id === numericId,
        );

        if (!exists) {
          delete next[key];
        }
      });

      return next;
    });
  }, [barangList]);
  const filteredAtkTahunan = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const baseRows = barangList.filter((item) => item.kategori === "tahunan");

    if (!query) {
      return baseRows;
    }

    return baseRows.filter((item) => item.nama.toLowerCase().includes(query));
  }, [barangList, searchQuery]);

  const totalPages = Math.ceil(filteredAtkTahunan.length / itemsPerPage);

  const currentData = useMemo(
    () =>
      filteredAtkTahunan.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
      ),
    [currentPage, filteredAtkTahunan],
  );

  useEffect(() => {
    if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
      return;
    }

    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const selectedRows = useMemo(
    () => barangList.filter((item) => (quantities[item.id] || 0) > 0),
    [barangList, quantities],
  );

  const hasSelectedItem = selectedRows.length > 0;

  const updateQuantity = (itemId, delta) => {
    setQuantities((prev) => {
      const nextValue = Math.max(0, (prev[itemId] || 0) + delta);
      return {
        ...prev,
        [itemId]: nextValue,
      };
    });
  };

  const handleBrowseFile = () => {
    if (isActivationBlocked) {
      return;
    }

    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    if (isActivationBlocked) {
      return;
    }

    const selectedFile = event.target.files?.[0];
    setUploadedFileName(selectedFile ? selectedFile.name : "");
    setUploadedFile(selectedFile || null);
    setSubmitError("");
  };

  const handleNextStep = () => {
    if (isActivationBlocked) {
      setIsActivationModalOpen(true);
      return;
    }

    if (!hasSelectedItem) {
      return;
    }

    setStep(2);
  };

  useEffect(() => {
    if (isModalOpen) {
      setFormLainnya({
        nama: "",
        jumlah: "",
        kategori: "habis_pakai",
        satuan: "",
      });
      setModalError("");
      setShouldRenderModal(true);
      const timer = setTimeout(() => setShowModal(true), 10);
      return () => clearTimeout(timer);
    }

    setShowModal(false);
    const timer = setTimeout(() => setShouldRenderModal(false), 150);
    return () => clearTimeout(timer);
  }, [isModalOpen]);

  useEffect(() => {
    if (isSuccessModalOpen) {
      setShouldRenderSuccessModal(true);
      const timer = setTimeout(() => setShowSuccessModal(true), 10);
      return () => clearTimeout(timer);
    }

    setShowSuccessModal(false);
    const timer = setTimeout(() => setShouldRenderSuccessModal(false), 150);
    return () => clearTimeout(timer);
  }, [isSuccessModalOpen]);

  useEffect(() => {
    if (isActivationModalOpen) {
      setShouldRenderActivationModal(true);
      const timer = setTimeout(() => setShowActivationModal(true), 10);
      return () => clearTimeout(timer);
    }

    setShowActivationModal(false);
    const timer = setTimeout(() => setShouldRenderActivationModal(false), 150);
    return () => clearTimeout(timer);
  }, [isActivationModalOpen]);

  const handleCloseModal = () => {
    if (isSubmittingLainnya) {
      return;
    }

    setIsModalOpen(false);
  };

  const handleCloseActivationModal = () => {
    setIsActivationModalOpen(false);
    navigate("/");
  };

  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false);
  };

  const handleSubmitLainnya = async (event) => {
    event.preventDefault();

    if (isSubmittingLainnya) {
      return;
    }

    if (isActivationBlocked) {
      setIsActivationModalOpen(true);
      return;
    }

    setModalError("");
    setIsSubmittingLainnya(true);

    const payload = {
      nama: formLainnya.nama.trim(),
      jumlah: Number(formLainnya.jumlah),
      kategori: formLainnya.kategori,
      satuan: formLainnya.satuan.trim(),
    };

    const newItem = {
      id: `lainnya-${Date.now()}`,
      nama: payload.nama,
      jumlah: payload.jumlah,
      kategori: payload.kategori,
      satuan: payload.satuan,
    };
    setPengajuanLainnya((prev) => [newItem, ...prev]);
    setIsModalOpen(false);
    setIsSubmittingLainnya(false);
  };

  const buildBarangPayload = () =>
    selectedRows.map((item) => ({
      id_barang: item.id,
      jumlah: quantities[item.id] || 0,
    }));

  const buildBarangLainnyaPayload = () =>
    pengajuanLainnya.map((item) => ({
      nama: item.nama,
      jumlah: item.jumlah,
      kategori: item.kategori,
      satuan: item.satuan,
    }));

  const handleSubmitPengajuan = async () => {
    if (isSubmittingPengajuan) {
      return;
    }

    if (activationStatus === "inactive") {
      setIsActivationModalOpen(true);
      return;
    }

    if (!hasSelectedItem) {
      return;
    }

    if (!uploadedFile) {
      setSubmitError("Surat pengajuan wajib diunggah.");
      return;
    }

    setSubmitError("");
    setIsSubmittingPengajuan(true);

    const formData = new FormData();
    formData.append(
      "surat_pengajuan",
      uploadedFile,
      uploadedFile.name || "surat_pengajuan",
    );
    formData.append("barang", JSON.stringify(buildBarangPayload()));

    const barangLainnyaPayload = buildBarangLainnyaPayload();
    if (barangLainnyaPayload.length > 0) {
      formData.append("barang_lainnya", JSON.stringify(barangLainnyaPayload));
    }

    try {
      await apiClient.post("/daftar-pengajuan/full", formData, {
        headers: {
          Accept: "application/json",
        },
      });

      setStep(1);
      setQuantities({});
      setPengajuanLainnya([]);
      setUploadedFile(null);
      setUploadedFileName("");
      setIsSuccessModalOpen(true);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Gagal mengirim pengajuan."));
    } finally {
      setIsSubmittingPengajuan(false);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages + 2) {
      for (let i = 1; i <= totalPages; i += 1) {
        pageNumbers.push(i);
      }
    } else if (currentPage <= maxVisiblePages - 1) {
      for (let i = 1; i <= maxVisiblePages; i += 1) {
        pageNumbers.push(i);
      }
      pageNumbers.push("...");
      pageNumbers.push(totalPages);
    } else if (currentPage > totalPages - maxVisiblePages + 2) {
      pageNumbers.push(1);
      pageNumbers.push("...");
      for (let i = totalPages - maxVisiblePages + 1; i <= totalPages; i += 1) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      pageNumbers.push("...");
      for (let i = currentPage - 1; i <= currentPage + 1; i += 1) {
        pageNumbers.push(i);
      }
      pageNumbers.push("...");
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <>
      <Helmet>
        <title>Pengajuan Rutin Tahunan | UNIKOM Perlengkapan</title>
      </Helmet>

      <div className="bg-white rounded border border-gray-200 w-full shadow-sm overflow-hidden">
        <div className="bg-[#4773da] text-white px-6 py-4">
          <h1 className="text-lg font-semibold">
            Pengajuan Rutin Tahunan 2026
          </h1>
        </div>

        <div className="p-6">
          {activationError ? (
            <p className="mb-4 rounded border border-yellow-200 bg-yellow-50 px-4 py-2  text-yellow-700 whitespace-pre-line">
              {activationError}
            </p>
          ) : null}
          {submitError ? (
            <p className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2  text-red-700 whitespace-pre-line">
              {submitError}
            </p>
          ) : null}
          <div className="mb-8">
            <p className=" text-gray-500 mb-2">Surat Permohonan</p>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".jpg,.jpeg,.png,.svg,.pdf"
              onChange={handleFileChange}
              disabled={isActivationBlocked}
            />
            <div className="w-full border border-dashed border-[#86a9e2] rounded-md px-4 py-5 bg-[#fcfdff]">
              <div className="flex flex-col items-center justify-center text-center">
                <CloudArrowUpIcon className="h-6 w-6 text-[#4773da]" />
                <p className=" text-gray-500 mt-2">
                  Drag your file(s) or{" "}
                  <button
                    type="button"
                    onClick={handleBrowseFile}
                    disabled={isActivationBlocked}
                    className={`font-medium ${
                      isActivationBlocked
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-[#4773da]"
                    }`}
                  >
                    browse
                  </button>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  jpg, png, svg, atau pdf
                </p>
                {uploadedFileName ? (
                  <p className="mt-2 text-xs font-medium text-gray-600">
                    {uploadedFileName}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mb-8 flex items-start justify-center">
            <div className="flex items-start w-full max-w-xl px-2">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    step === 1 ? "bg-[#4773da]" : "bg-gray-300"
                  }`}
                >
                  <CheckIcon className="h-5 w-5 text-white" />
                </div>
                <p
                  className={`mt-2  text-center ${
                    step === 1 ? "text-gray-700 font-medium" : "text-gray-300"
                  }`}
                >
                  Pengajuan Barang
                </p>
              </div>

              <div className="mt-4 h-px flex-1 bg-gray-200" />

              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    step === 2 ? "bg-[#4773da]" : "bg-gray-200"
                  }`}
                >
                  <ExclamationTriangleIcon
                    className={`h-5 w-5 ${
                      step === 2 ? "text-white" : "text-gray-400"
                    }`}
                  />
                </div>
                <p
                  className={`mt-2  text-center ${
                    step === 2 ? "text-gray-700 font-medium" : "text-gray-300"
                  }`}
                >
                  Bukti Pengajuan Tidak Habis Pakai
                </p>
              </div>
            </div>
          </div>

          {step === 1 ? (
            <>
              <div className="mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 gap-3">
                  <h2 className="text-lg font-semibold text-gray-700">
                    Pengajuan ATK tahunan 2026
                  </h2>
                  <div className="relative w-full md:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-full  focus:outline-none focus:ring-1 focus:ring-[#4279df] focus:border-[#4279df] bg-white"
                      placeholder="Cari"
                      value={searchQuery}
                      disabled={isActivationBlocked}
                      onChange={(event) => {
                        setSearchQuery(event.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                </div>

                <div className="overflow-x-auto border border-gray-200">
                  <table className="w-full text-left border-collapse min-w-190">
                    <thead className="bg-[#f0f4fc] text-gray-600 font-semibold border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-3 border-r border-gray-200 w-16">
                          No
                        </th>
                        <th className="px-3 py-3 border-r border-gray-200">
                          Nama Barang
                        </th>
                        <th className="px-3 py-3 border-r border-gray-200 w-28">
                          Satuan
                        </th>
                        <th className="px-3 py-3 border-r border-gray-200 w-28">
                          Kategori
                        </th>
                        <th className="px-3 py-3 w-36 text-center">Jumlah</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td colSpan={5} className={CELL_PLACEHOLDER_CLASS}>
                            Memuat data barang...
                          </td>
                        </tr>
                      ) : pageError ? (
                        <tr>
                          <td colSpan={5} className={CELL_PLACEHOLDER_CLASS}>
                            {pageError}
                          </td>
                        </tr>
                      ) : currentData.length > 0 ? (
                        currentData.map((item, index) => (
                          <tr
                            key={item.id}
                            className="border-b border-gray-200 bg-white hover:bg-gray-50"
                          >
                            <td className="px-3 py-2 border-r border-gray-200 text-sm text-gray-500">
                              {(currentPage - 1) * itemsPerPage + index + 1}
                            </td>
                            <td className="px-3 py-2 border-r border-gray-200 text-sm text-gray-500">
                              {item.nama}
                            </td>
                            <td className="px-3 py-2 border-r border-gray-200 text-sm text-gray-500">
                              {item.satuan}
                            </td>
                            <td className="px-3 py-2 border-r border-gray-200 text-sm text-gray-500 capitalize">
                              {item.kategori}
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, -1)}
                                  disabled={isActivationBlocked}
                                  className="h-6 w-6 rounded bg-gray-500 text-white  leading-none"
                                >
                                  -
                                </button>
                                <span className="h-6 min-w-8 px-2 rounded bg-gray-100 border border-gray-200 text-center text-xs leading-6 text-gray-700">
                                  {quantities[item.id] || 0}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, 1)}
                                  disabled={isActivationBlocked}
                                  className="h-6 w-6 rounded bg-[#4773da] text-white  leading-none"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className={CELL_PLACEHOLDER_CLASS}>
                            Data tidak ditemukan
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 ? (
                  <div className="flex justify-end items-center mt-3">
                    <nav className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1 || totalPages === 0}
                        className="p-2 rounded border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeftIcon className="h-4 w-4" />
                      </button>

                      {getPageNumbers().map((page, idx) => (
                        <button
                          key={`${page}-${idx}`}
                          type="button"
                          onClick={() =>
                            typeof page === "number" && setCurrentPage(page)
                          }
                          disabled={page === "..."}
                          className={`px-3 py-1 rounded ${
                            currentPage === page
                              ? "bg-[#4279df] text-white"
                              : page === "..."
                                ? "text-gray-500 cursor-default"
                                : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages),
                          )
                        }
                        disabled={
                          currentPage === totalPages || totalPages === 0
                        }
                        className="p-2 rounded border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRightIcon className="h-4 w-4" />
                      </button>
                    </nav>
                  </div>
                ) : null}
              </div>

              <div className="mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-3">
                  <h2 className="text-lg font-semibold text-gray-700">
                    Pengajuan Lainnya Tahun 2026
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    disabled={isActivationBlocked}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      isActivationBlocked
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-[#4773da] hover:bg-blue-700 text-white"
                    }`}
                  >
                    Tambah Pengajuan Lainnya
                  </button>
                </div>
                <div className="overflow-x-auto border border-gray-200">
                  <table className="w-full text-left border-collapse min-w-190">
                    <thead className="bg-[#f0f4fc] text-gray-600 font-semibold border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-3 border-r border-gray-200 w-16">
                          No
                        </th>
                        <th className="px-3 py-3 border-r border-gray-200">
                          Nama Barang
                        </th>
                        <th className="px-3 py-3 border-r border-gray-200 w-28">
                          Satuan
                        </th>
                        <th className="px-3 py-3 border-r border-gray-200 w-28">
                          Kategori
                        </th>
                        <th className="px-3 py-3 w-36 text-center">Jumlah</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pengajuanLainnya.length > 0 ? (
                        pengajuanLainnya.map((item, index) => (
                          <tr
                            key={item.id}
                            className="border-b border-gray-200 bg-white"
                          >
                            <td className="px-3 py-2 border-r border-gray-200 text-sm text-gray-500">
                              {index + 1}
                            </td>
                            <td className="px-3 py-2 border-r border-gray-200 text-sm text-gray-500">
                              {item.nama}
                            </td>
                            <td className="px-3 py-2 border-r border-gray-200 text-sm text-gray-500">
                              {item.satuan}
                            </td>
                            <td className="px-3 py-2 border-r border-gray-200 text-sm text-gray-500">
                              {formatKategoriLabel(item.kategori)}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-500 text-center">
                              {item.jumlah}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="border-b border-gray-200 bg-white">
                          <td colSpan={5} className={CELL_PLACEHOLDER_CLASS}>
                            Data tidak ditemukan
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!hasSelectedItem || isActivationBlocked}
                  className={`px-5 py-2 rounded-full  font-medium transition-colors ${
                    hasSelectedItem && !isActivationBlocked
                      ? "bg-[#4773da] hover:bg-blue-700 text-white"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Selanjutnya
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-3">
                  Pengajuan ATK tahunan 2026
                </h2>
                <div className="overflow-x-auto border border-gray-200">
                  <table className="w-full text-left border-collapse min-w-245">
                    <thead className="bg-[#f0f4fc] text-gray-600 font-semibold border-b border-gray-200">
                      <tr>
                        <th
                          rowSpan="3"
                          className="px-3 py-2 border border-gray-200 w-14 text-center"
                        >
                          No
                        </th>
                        <th
                          rowSpan="3"
                          className="px-3 py-2 border border-gray-200"
                        >
                          Nama Barang
                        </th>
                        <th
                          rowSpan="3"
                          className="px-3 py-2 border border-gray-200 w-24 text-center"
                        >
                          Satuan
                        </th>
                        <th
                          rowSpan="3"
                          className="px-3 py-2 border border-gray-200 w-24 text-center"
                        >
                          Jumlah
                        </th>
                        <th
                          rowSpan="3"
                          className="px-3 py-2 border border-gray-200 w-24 text-center"
                        >
                          Sisa
                        </th>
                        <th
                          colSpan="6"
                          className="px-3 py-2 border border-gray-200 text-center"
                        >
                          Keterangan
                        </th>
                      </tr>
                      <tr>
                        <th
                          colSpan="3"
                          className="px-3 py-2 border border-gray-200 text-center"
                        >
                          Rusak
                        </th>
                        <th
                          colSpan="2"
                          className="px-3 py-2 border border-gray-200 text-center"
                        >
                          Hilang
                        </th>
                        <th
                          rowSpan="2"
                          className="px-3 py-2 border border-gray-200 text-center"
                        >
                          Lainnya
                        </th>
                      </tr>
                      <tr>
                        <th className="px-3 py-2 border border-gray-200 text-center">
                          Jumlah
                        </th>
                        <th className="px-3 py-2 border border-gray-200 text-center">
                          Foto Barang
                        </th>
                        <th className="px-3 py-2 border border-gray-200 text-center">
                          Surat Lampiran
                        </th>
                        <th className="px-3 py-2 border border-gray-200 text-center">
                          Jumlah
                        </th>
                        <th className="px-3 py-2 border border-gray-200 text-center">
                          Surat Lampiran
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRows.map((row, index) => (
                        <tr
                          key={row.id}
                          className="border-b border-gray-200 bg-white hover:bg-gray-50"
                        >
                          <td className="px-3 py-2 border border-gray-200 text-sm text-gray-500 text-center">
                            {index + 1}
                          </td>
                          <td className="px-3 py-2 border border-gray-200 text-sm text-gray-500">
                            {row.nama}
                          </td>
                          <td className="px-3 py-2 border border-gray-200 text-sm text-gray-500 text-center">
                            {row.satuan}
                          </td>
                          <td className="px-3 py-2 border border-gray-200 text-sm text-gray-500 text-center">
                            {quantities[row.id] || 0}
                          </td>
                          <td className={CELL_PLACEHOLDER_CLASS}>-</td>
                          <td className={CELL_PLACEHOLDER_CLASS}>-</td>
                          <td className={CELL_PLACEHOLDER_CLASS}>-</td>
                          <td className={CELL_PLACEHOLDER_CLASS}>-</td>
                          <td className={CELL_PLACEHOLDER_CLASS}>-</td>
                          <td className={CELL_PLACEHOLDER_CLASS}>-</td>
                          <td className={CELL_PLACEHOLDER_CLASS}>-</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-3">
                  Pengajuan Lainnya Tahun 2026
                </h2>
                <div className="overflow-x-auto border border-gray-200">
                  <table className="w-full text-left border-collapse min-w-190">
                    <thead className="bg-[#f0f4fc] text-gray-600 font-semibold border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-3 border-r border-gray-200 w-16">
                          No
                        </th>
                        <th className="px-3 py-3 border-r border-gray-200">
                          Nama Barang
                        </th>
                        <th className="px-3 py-3 border-r border-gray-200 w-28">
                          Satuan
                        </th>
                        <th className="px-3 py-3 border-r border-gray-200 w-28">
                          Kategori
                        </th>
                        <th className="px-3 py-3 w-36 text-center">Jumlah</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pengajuanLainnya.length > 0 ? (
                        pengajuanLainnya.map((item, index) => (
                          <tr
                            key={item.id}
                            className="border-b border-gray-200 bg-white"
                          >
                            <td className="px-3 py-2 border-r border-gray-200 text-sm text-gray-500">
                              {index + 1}
                            </td>
                            <td className="px-3 py-2 border-r border-gray-200 text-sm text-gray-500">
                              {item.nama}
                            </td>
                            <td className="px-3 py-2 border-r border-gray-200 text-sm text-gray-500">
                              {item.satuan}
                            </td>
                            <td className="px-3 py-2 border-r border-gray-200 text-sm text-gray-500">
                              {formatKategoriLabel(item.kategori)}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-500 text-center">
                              {item.jumlah}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="border-b border-gray-200 bg-white">
                          <td colSpan={5} className={CELL_PLACEHOLDER_CLASS}>
                            Data tidak ditemukan
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSubmitPengajuan}
                  disabled={isSubmittingPengajuan || isActivationBlocked}
                  className={`px-5 py-2 rounded-full  font-medium transition-colors ${
                    isSubmittingPengajuan || isActivationBlocked
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-[#4773da] hover:bg-blue-700 text-white"
                  }`}
                >
                  {isSubmittingPengajuan ? "Menyimpan..." : "Selesai"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {shouldRenderModal ? (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-150 ${
            showModal
              ? "bg-black/30 backdrop-blur-sm opacity-100"
              : "bg-transparent opacity-0"
          }`}
          onClick={handleCloseModal}
        >
          <div
            className={`bg-white rounded-lg shadow-lg w-full max-w-xl overflow-hidden flex flex-col transition-all duration-150 transform ${
              showModal ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="bg-[#4279df] text-white px-6 py-4">
              <h2 className="font-medium text-lg">Tambah Pengajuan Lainnya</h2>
            </div>

            <form
              onSubmit={handleSubmitLainnya}
              className="p-6 bg-[#f8f9fa] flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-600 font-medium text-sm">
                  Nama Barang
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kabel HDMI 10m"
                  value={formLainnya.nama}
                  disabled={isActivationBlocked}
                  onChange={(event) =>
                    setFormLainnya((prev) => ({
                      ...prev,
                      nama: event.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4279df] focus:border-transparent text-gray-700  placeholder-gray-400"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-600 font-medium text-sm">
                    Satuan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: pcs"
                    value={formLainnya.satuan}
                    disabled={isActivationBlocked}
                    onChange={(event) =>
                      setFormLainnya((prev) => ({
                        ...prev,
                        satuan: event.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4279df] focus:border-transparent text-gray-700  placeholder-gray-400"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-600 font-medium text-sm">
                    Jumlah
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Contoh: 2"
                    value={formLainnya.jumlah}
                    disabled={isActivationBlocked}
                    onChange={(event) =>
                      setFormLainnya((prev) => ({
                        ...prev,
                        jumlah: event.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4279df] focus:border-transparent text-gray-700  placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-gray-600 font-medium text-sm">
                  Kategori
                </label>
                <div className="relative">
                  <select
                    value={formLainnya.kategori}
                    disabled={isActivationBlocked}
                    onChange={(event) =>
                      setFormLainnya((prev) => ({
                        ...prev,
                        kategori: event.target.value,
                      }))
                    }
                    className="w-full appearance-none px-4 py-2 pr-10 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4279df] focus:border-transparent text-gray-700 text-sm"
                    required
                  >
                    <option value="habis_pakai">Habis Pakai</option>
                    <option value="tidak_habis_pakai">Tidak Habis Pakai</option>
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-500">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </div>
              </div>

              {modalError ? (
                <p className=" text-red-600 whitespace-pre-line">
                  {modalError}
                </p>
              ) : null}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-full  font-medium border border-gray-300 text-gray-600 hover:bg-gray-50"
                  disabled={isSubmittingLainnya || isActivationBlocked}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full  font-medium bg-[#4773da] hover:bg-blue-700 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={
                    isSubmittingLainnya ||
                    isActivationBlocked ||
                    !formLainnya.nama.trim() ||
                    !formLainnya.satuan.trim() ||
                    !formLainnya.kategori.trim() ||
                    Number(formLainnya.jumlah) <= 0
                  }
                >
                  {isSubmittingLainnya ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {shouldRenderActivationModal ? (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-150 ${
            showActivationModal
              ? "bg-black/30 backdrop-blur-sm opacity-100"
              : "bg-transparent opacity-0"
          }`}
          onClick={handleCloseActivationModal}
        >
          <div
            className={`bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden flex flex-col transition-all duration-150 transform ${
              showActivationModal
                ? "scale-100 opacity-100"
                : "scale-95 opacity-0"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="bg-[#4279df] text-white px-6 py-4">
              <h2 className="text-lg font-medium">Aktivasi Tidak Aktif</h2>
            </div>
            <div className="p-6  text-gray-600">
              Pengajuan tidak dapat dilakukan karena aktivasi tidak aktif atau
              telah berakhir. Silakan hubungi admin untuk mengaktifkan kembali.
            </div>
            <div className="px-6 pb-6 flex justify-end">
              <button
                type="button"
                onClick={handleCloseActivationModal}
                className="px-4 py-2 rounded-full  font-medium bg-[#4773da] hover:bg-blue-700 text-white transition-colors"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {shouldRenderSuccessModal ? (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-150 ${
            showSuccessModal
              ? "bg-black/30 backdrop-blur-sm opacity-100"
              : "bg-transparent opacity-0"
          }`}
          onClick={handleCloseSuccessModal}
        >
          <div
            className={`bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden flex flex-col transition-all duration-150 transform ${
              showSuccessModal ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="bg-[#4279df] text-white px-6 py-4">
              <h2 className="text-lg font-medium">Pengajuan Berhasil</h2>
            </div>
            <div className="p-6  text-gray-600">
              Pengajuan berhasil dikirim. Silakan tunggu proses verifikasi.
            </div>
            <div className="px-6 pb-6 flex justify-end">
              <button
                type="button"
                onClick={handleCloseSuccessModal}
                className="px-4 py-2 rounded-full  font-medium bg-[#4773da] hover:bg-blue-700 text-white transition-colors"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default PengajuanAtkPage;

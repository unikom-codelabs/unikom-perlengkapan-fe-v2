import { useEffect, useState } from "react";
import Dropdown from "../Dropdown";

const getCurrentAcademicYear = () => {
  const currentYear = new Date().getFullYear();
  return `${currentYear}/${currentYear + 1}`;
};

const getCurrentYear = () => String(new Date().getFullYear());

const getNextYear = () => String(new Date().getFullYear() + 1);

const getNextAcademicYear = () => {
  const currentYear = new Date().getFullYear() + 1;
  return `${currentYear}/${currentYear + 1}`;
};

const getPreviousAcademicYear = () => {
  const currentYear = new Date().getFullYear() - 1;
  return `${currentYear}/${currentYear + 1}`;
};

const getStartYearFromAcademicYear = (value) => {
  const match = String(value || "").match(/^(\d{4})/);
  return match ? Number(match[1]) : null;
};

const updateDateYear = (dateValue, targetYear) => {
  if (!dateValue || !targetYear) {
    return dateValue;
  }

  const [_, month, day] = String(dateValue).split("-");
  if (!month || !day) {
    return dateValue;
  }

  return `${targetYear}-${month}-${day}`;
};

const toDateInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const buildInitialFormValues = (defaultValues = null) => ({
  id_pengajuan:
    defaultValues?.id_pengajuan !== undefined &&
    defaultValues?.id_pengajuan !== null
      ? String(defaultValues.id_pengajuan)
      : "",
  aktif_mulai: defaultValues?.aktif_mulai ?? "",
  aktif_selesai: defaultValues?.aktif_selesai ?? "",
  tipe: defaultValues?.tipe ?? "rutin",
  semester: defaultValues?.semester ?? "",
  ujian: defaultValues?.ujian ?? "",
  tahun_akademik: defaultValues?.tahun_akademik ?? getCurrentAcademicYear(),
});

const ModalAktivasiPengajuan = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  defaultValues = null,
  errorMessage = "",
  kategoriTitle = "Periode Pengajuan",
  mode = "create",
  showSemester = false,
  semesterOptions = [],
  showUjianType = false,
  ujianOptions = [],
  useYearOnly = false,
}) => {
  const [formValues, setFormValues] = useState(() =>
    buildInitialFormValues({
      ...defaultValues,
      tahun_akademik:
        defaultValues?.tahun_akademik ??
        (useYearOnly ? getCurrentYear() : getCurrentAcademicYear()),
    }),
  );
  const isEditMode = mode === "edit";
  const yearOptions = useYearOnly
    ? [getCurrentYear(), getNextYear()]
    : [
        getPreviousAcademicYear(),
        getCurrentAcademicYear(),
        getNextAcademicYear(),
      ];

  useEffect(() => {
    setFormValues(
      buildInitialFormValues({
        ...defaultValues,
        tahun_akademik:
          defaultValues?.tahun_akademik ??
          (useYearOnly ? getCurrentYear() : getCurrentAcademicYear()),
      }),
    );
  }, [defaultValues, isOpen, useYearOnly]);

  useEffect(() => {
    if (isEditMode) {
      return;
    }

    const targetYear = useYearOnly
      ? Number(formValues.tahun_akademik)
      : getStartYearFromAcademicYear(formValues.tahun_akademik);

    if (!Number.isFinite(targetYear)) {
      return;
    }

    setFormValues((prev) => {
      const nextStart = updateDateYear(prev.aktif_mulai, targetYear);
      const nextEnd = updateDateYear(prev.aktif_selesai, targetYear);

      if (nextStart === prev.aktif_mulai && nextEnd === prev.aktif_selesai) {
        return prev;
      }

      return {
        ...prev,
        aktif_mulai: nextStart,
        aktif_selesai: nextEnd,
      };
    });
  }, [formValues.tahun_akademik, isEditMode, useYearOnly]);

  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    onClose();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isDateRangeInvalid =
    formValues.aktif_mulai &&
    formValues.aktif_selesai &&
    formValues.aktif_selesai < formValues.aktif_mulai;

  const minSelectableDate = (() => {
    const oneWeekBeforeToday = new Date();
    oneWeekBeforeToday.setDate(oneWeekBeforeToday.getDate() - 7);
    return toDateInputValue(oneWeekBeforeToday);
  })();

  const yearValue = String(formValues.tahun_akademik || "").trim();
  const isAcademicYearInvalid = useYearOnly
    ? !/^\d{4}$/.test(yearValue)
    : !/^\d{4}\/\d{4}$/.test(yearValue);

  const isInvalid =
    !formValues.aktif_mulai ||
    !formValues.aktif_selesai ||
    !formValues.tipe ||
    (showSemester && !String(formValues.semester || "").trim()) ||
    (showUjianType && !String(formValues.ujian || "").trim()) ||
    !String(formValues.tahun_akademik || "").trim() ||
    isDateRangeInvalid ||
    isAcademicYearInvalid;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!onSubmit || isSubmitting || isInvalid) {
      return;
    }

    await onSubmit({
      id_pengajuan: formValues.id_pengajuan
        ? Number(formValues.id_pengajuan)
        : undefined,
      aktif_mulai: formValues.aktif_mulai,
      aktif_selesai: formValues.aktif_selesai,
      tipe: formValues.tipe,
      semester: showSemester
        ? String(formValues.semester || "").trim()
        : undefined,
      ujian: showUjianType ? String(formValues.ujian || "").trim() : undefined,
      tahun_akademik: formValues.tahun_akademik.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-xl overflow-hidden flex flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="bg-[#4279df] text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-medium">Aktivasi Pengajuan</h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 bg-[#f8f9fa] flex flex-col gap-4"
        >
          <p className="text-sm text-gray-600">
            Lengkapi data aktivasi untuk{" "}
            <span className="font-medium">{kategoriTitle}</span>.
          </p>

          <div className="grid grid-cols-1 gap-4">
            {!isEditMode ? (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-600 font-medium text-sm">
                    Tipe Pengajuan
                  </label>
                  <div className="relative">
                    <Dropdown
                      name="tipe"
                      value={formValues.tipe}
                      onChange={handleChange}
                    >
                      <option value="rutin">Rutin</option>
                      <option value="nonrutin">Non Rutin</option>
                    </Dropdown>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-600 font-medium text-sm">
                    {useYearOnly ? "Tahun" : "Tahun Akademik"}
                  </label>
                  <div className="relative">
                    <Dropdown
                      name="tahun_akademik"
                      value={formValues.tahun_akademik}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Pilih Tahun</option>
                      {yearOptions.map((yearValue) => (
                        <option key={yearValue} value={yearValue}>
                          {yearValue}
                        </option>
                      ))}
                    </Dropdown>
                  </div>
                </div>
              </>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-600 font-medium text-sm">
                  Aktif Mulai
                </label>
                <input
                  type="date"
                  name="aktif_mulai"
                  value={formValues.aktif_mulai}
                  onChange={handleChange}
                  min={minSelectableDate}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4279df] focus:border-transparent text-gray-700 text-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-gray-600 font-medium text-sm">
                  Aktif Selesai
                </label>
                {/* Legacy min prop: min={formValues.aktif_mulai || undefined} */}
                <input
                  type="date"
                  name="aktif_selesai"
                  value={formValues.aktif_selesai}
                  onChange={handleChange}
                  min={minSelectableDate}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4279df] focus:border-transparent text-gray-700 text-sm"
                  required
                />
              </div>
            </div>

            {!isEditMode && showSemester ? (
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-600 font-medium text-sm">
                  Semester
                </label>
                <div className="relative">
                  <Dropdown
                    name="semester"
                    value={formValues.semester}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Pilih Semester</option>
                    {semesterOptions.map((semesterValue) => (
                      <option key={semesterValue} value={semesterValue}>
                        {semesterValue === "ganjil"
                          ? "Ganjil"
                          : semesterValue === "genap"
                            ? "Genap"
                            : semesterValue}
                      </option>
                    ))}
                  </Dropdown>
                </div>
              </div>
            ) : null}

            {!isEditMode && showUjianType ? (
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-600 font-medium text-sm">
                  Jenis Ujian
                </label>
                <div className="relative">
                  <Dropdown
                    name="ujian"
                    value={formValues.ujian}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Pilih Jenis Ujian</option>
                    {ujianOptions.map((ujianValue) => (
                      <option key={ujianValue} value={ujianValue}>
                        {ujianValue.toUpperCase()}
                      </option>
                    ))}
                  </Dropdown>
                </div>
              </div>
            ) : null}
          </div>

          {isDateRangeInvalid ? (
            <p className="text-sm text-red-600">
              Tanggal aktif selesai tidak boleh lebih awal dari aktif mulai.
            </p>
          ) : null}

          {isAcademicYearInvalid ? (
            <p className="text-sm text-red-600">
              {useYearOnly
                ? "Format tahun harus seperti 2026."
                : "Format tahun_akademik harus seperti 2025/2026."}
            </p>
          ) : null}

          {errorMessage ? (
            <p className="text-sm text-red-600 whitespace-pre-line">
              {errorMessage}
            </p>
          ) : null}

          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-[#4279df] text-[#4279df] font-medium rounded-full hover:bg-blue-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#4279df] text-white hover:bg-blue-600 font-medium rounded-full text-sm disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
              disabled={isSubmitting || isInvalid}
            >
              {isSubmitting
                ? isEditMode
                  ? "Menyimpan..."
                  : "Mengaktifkan..."
                : isEditMode
                  ? "Simpan"
                  : "Aktifkan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalAktivasiPengajuan;

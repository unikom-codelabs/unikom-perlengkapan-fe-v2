import { useEffect, useState } from "react";
import { listJabatan } from "../../../api/jabatanService";
import { listUnitType } from "../../../api/unitTypeService";
import { createUser } from "../../../api/userService";
import Dropdown from "../Dropdown";

const initialFormValues = {
  nip: "",
  username: "",
  email: "",
  password: "",
  jenis_kelamin: "Pria",
  jabatan_id: "",
  unit_id: "",
  role: "user",
};

const INPUT_CLASS =
  "w-full px-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4279df] text-gray-700 text-sm placeholder-gray-400";

const FieldHint = ({ children }) => (
  <p className="text-xs leading-5 text-gray-400">{children}</p>
);

const getApiErrorMessage = (error, fallbackMessage) => {
  const responseData = error?.response?.data;

  if (responseData?.errors && typeof responseData.errors === "object") {
    const detailedErrors = Object.values(responseData.errors)
      .flat()
      .filter(Boolean);

    if (detailedErrors.length > 0) {
      return detailedErrors.join("\n");
    }
  }

  return responseData?.message || error?.message || fallbackMessage;
};

const ModalTambahAkun = ({ isOpen, onClose, onSuccess }) => {
  const [shouldRender, setRender] = useState(isOpen);
  const [show, setShow] = useState(false);
  const [jabatanList, setJabatanList] = useState([]);
  const [unitTypeList, setUnitTypeList] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formValues, setFormValues] = useState(initialFormValues);

  useEffect(() => {
    if (isOpen) {
      setFormValues(initialFormValues);
      setErrorMessage("");
      setRender(true);
      const timer = setTimeout(() => setShow(true), 10);
      return () => clearTimeout(timer);
    }

    setShow(false);
    const timer = setTimeout(() => setRender(false), 150);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const fetchOptions = async () => {
      setIsLoadingOptions(true);

      try {
        const [jabatanData, unitData] = await Promise.all([
          listJabatan(),
          listUnitType(),
        ]);
        setJabatanList(jabatanData);
        setUnitTypeList(unitData.filter((item) => item.id && item.nama));
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(error, "Gagal memuat dropdown akun."),
        );
        setJabatanList([]);
        setUnitTypeList([]);
      } finally {
        setIsLoadingOptions(false);
      }
    };

    fetchOptions();
  }, [isOpen]);

  const updateField = (name, value) => {
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await createUser(formValues);
      await onSuccess?.();
      onClose();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Gagal menambahkan akun."));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!shouldRender) return null;

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
        className={`bg-white rounded-lg shadow-lg w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-150 transform ${
          show ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="bg-[#4279df] text-white px-6 py-4 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-medium">Tambah Akun</h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 bg-[#f8f9fa] flex flex-col gap-4 overflow-y-auto"
        >
          {errorMessage ? (
            <p className="rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 whitespace-pre-line">
              {errorMessage}
            </p>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-600 font-medium text-sm">NIP</label>
              <input
                type="text"
                value={formValues.nip}
                onChange={(event) => updateField("nip", event.target.value)}
                placeholder="Contoh: 4127XXXXXXXX"
                required
                className={INPUT_CLASS}
              />
              <FieldHint>Masukkan NIP/NIK pengguna tanpa spasi.</FieldHint>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-gray-600 font-medium text-sm">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={formValues.username}
                onChange={(event) =>
                  updateField("username", event.target.value)
                }
                placeholder="Masukkan nama lengkap"
                required
                className={INPUT_CLASS}
              />
              <FieldHint>Gunakan nama lengkap sesuai data pegawai.</FieldHint>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-gray-600 font-medium text-sm">Email</label>
              <input
                type="email"
                value={formValues.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="nama@unikom.ac.id"
                required
                className={INPUT_CLASS}
              />
              <FieldHint>Masukkan alamat email aktif pengguna.</FieldHint>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-gray-600 font-medium text-sm">
                Password
              </label>
              <input
                type="password"
                value={formValues.password}
                onChange={(event) =>
                  updateField("password", event.target.value)
                }
                placeholder="Masukkan password awal"
                required
                className={INPUT_CLASS}
              />
              <FieldHint>Password ini digunakan untuk login pertama kali.</FieldHint>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-gray-600 font-medium text-sm">
                Jabatan
              </label>
              <Dropdown
                value={formValues.jabatan_id}
                onChange={(event) =>
                  updateField("jabatan_id", event.target.value)
                }
                required
                disabled={isLoadingOptions}
              >
                <option value="">
                  {isLoadingOptions ? "Memuat jabatan..." : "Pilih jabatan"}
                </option>
                {jabatanList.map((jabatan) => (
                  <option key={jabatan.id} value={jabatan.id}>
                    {jabatan.nama}
                  </option>
                ))}
              </Dropdown>
              <FieldHint>Pilih jabatan sesuai struktur pengguna.</FieldHint>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-gray-600 font-medium text-sm">
                Pilih Bagian
              </label>
              <Dropdown
                value={formValues.unit_id}
                onChange={(event) => updateField("unit_id", event.target.value)}
                required
                disabled={isLoadingOptions}
              >
                <option value="">
                  {isLoadingOptions ? "Memuat bagian..." : "Pilih bagian"}
                </option>
                {unitTypeList.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.nama}
                  </option>
                ))}
              </Dropdown>
              <FieldHint>
                Pilih unit, bagian, fakultas, atau program studi pengguna.
              </FieldHint>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-gray-600 font-medium text-sm">Role</label>
              <Dropdown
                value={formValues.role}
                onChange={(event) => updateField("role", event.target.value)}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </Dropdown>
              <FieldHint>User untuk pengaju, Admin untuk pengelola sistem.</FieldHint>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-primary text-primary font-medium rounded-full hover:bg-blue-50 transition-colors text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoadingOptions}
              className="px-6 py-2 bg-[#4279df] text-white hover:bg-[#3461b3] transition-colors font-medium rounded-full text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalTambahAkun;

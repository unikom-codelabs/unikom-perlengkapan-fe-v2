import { PDFDownloadLink } from "@react-pdf/renderer";
import { TrashIcon } from "@heroicons/react/24/outline";
import ActionIconButton from "../Element/ActionIconButton";
import Dropdown from "../Element/Dropdown";
import BapDocument from "../Pdf/BapDocument";

const FIELD_INPUT_CLASS =
  "w-full px-4 py-3 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4279df] text-gray-700 text-sm";
const READONLY_INPUT_CLASS =
  "w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-full text-gray-500 text-sm";
const LABEL_CLASS = "mb-2 block text-sm font-normal text-gray-600";

const TextField = ({
  label,
  value,
  onChange,
  readOnly = false,
  placeholder,
  action,
}) => (
  <div>
    <label className={LABEL_CLASS}>{label}</label>
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={
          onChange ? (event) => onChange(event.target.value) : undefined
        }
        readOnly={readOnly}
        placeholder={placeholder}
        className={`${readOnly ? READONLY_INPUT_CLASS : FIELD_INPUT_CLASS} ${
          action ? "pr-12" : ""
        }`}
      />
      {action}
    </div>
  </div>
);

const SignatureSelect = ({ label, value, onChange, options, disabled }) => (
  <div>
    <label className={LABEL_CLASS}>{label}</label>
    <Dropdown
      value={value}
      onChange={(event) => onChange(event.target.value)}
      required
      disabled={disabled}
    >
      <option value="">
        {disabled ? "Memuat jabatan..." : "-- Pilih Jabatan --"}
      </option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Dropdown>
  </div>
);

const BapPrintModal = ({
  isVisible,
  form,
  ttdOptions,
  isLoadingTtdOptions,
  isFormValid,
  documentData,
  fileName,
  onClose,
  onFieldChange,
  onTembusanChange,
  onAddTembusan,
  onRemoveTembusan,
}) => (
  <div
    className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-150 ${
      isVisible
        ? "bg-black/30 backdrop-blur-sm opacity-100"
        : "bg-transparent opacity-0 pointer-events-none"
    }`}
    onClick={onClose}
  >
    <div
      className={`bg-white rounded-lg shadow-lg w-full max-w-3xl overflow-hidden flex flex-col transition-all duration-150 transform ${
        isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
      }`}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="bg-[#4279df] text-white px-6 py-4">
        <h2 className="text-lg font-medium">Data Cetak BAP</h2>
      </div>

      <div className="p-6 bg-[#f8f9fa] flex flex-col gap-4">
        <div className="space-y-4">
          <TextField
            label="Nomor BAP"
            value={form.bapNumber}
            onChange={(value) => onFieldChange("bapNumber", value)}
          />

          <TextField
            label="Nama Penerima (Pihak Kedua)"
            value={form.secondPartyName}
            onChange={(value) => onFieldChange("secondPartyName", value)}
            placeholder="Contoh: Prof. Dr. Budi, M.Si."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField label="Tanda Tangan 1" value={form.ttd1Role} readOnly />
            <TextField label="Tanda Tangan 2" value={form.ttd2Role} readOnly />
            <SignatureSelect
              label="Tanda Tangan 3"
              value={form.ttd3Role}
              onChange={(value) => onFieldChange("ttd3Role", value)}
              options={ttdOptions}
              disabled={isLoadingTtdOptions}
            />
            <SignatureSelect
              label="Tanda Tangan 4"
              value={form.ttd4Role}
              onChange={(value) => onFieldChange("ttd4Role", value)}
              options={ttdOptions}
              disabled={isLoadingTtdOptions}
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4 space-y-4">
          {form.tembusan.map((item, index) => {
            const canRemove = index > 0;

            return (
              <TextField
                key={`tembusan-${index + 1}`}
                label={`Tembusan ${index + 1}`}
                value={item}
                onChange={(value) => onTembusanChange(index, value)}
                placeholder="Masukkan Nama"
                action={
                  canRemove ? (
                    <div className="absolute inset-y-0 right-2 flex items-center">
                      <ActionIconButton
                        label="Hapus"
                        icon={TrashIcon}
                        onClick={() => onRemoveTembusan(index)}
                        variant="danger"
                      />
                    </div>
                  ) : null
                }
              />
            );
          })}

          <button
            type="button"
            onClick={onAddTembusan}
            className="w-full h-9 rounded-full border-2 border-[#4279df] text-[#4279df] text-sm font-medium transition-colors hover:bg-blue-50"
          >
            Tambah Tembusan
          </button>
        </div>

        <div className="flex justify-end gap-4 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="h-11 text-sm px-6 rounded-full border border-[#4279df] text-[#4279df] font-medium transition-colors hover:bg-blue-50"
          >
            Batal
          </button>
          {isFormValid ? (
            <PDFDownloadLink
              document={<BapDocument {...documentData} />}
              fileName={`${fileName || "bap-pengajuan"}.pdf`}
              className="inline-flex h-11 text-sm items-center justify-center rounded-full bg-[#4773da] px-6 font-medium text-white transition-colors hover:bg-[#365db8]"
            >
              {({ loading }) => (loading ? "Menyiapkan..." : "Cetak BAP")}
            </PDFDownloadLink>
          ) : (
            <span className="inline-flex h-11 items-center justify-center rounded-full bg-gray-200 px-6 text-sm font-medium text-gray-400 cursor-not-allowed select-none">
              Cetak BAP
            </span>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default BapPrintModal;

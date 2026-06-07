import { PDFDownloadLink } from "@react-pdf/renderer";
import Dropdown from "../Element/Dropdown";
import BapDocument from "../Pdf/BapDocument";

const FIELD_INPUT_CLASS =
  "w-full px-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4279df] text-gray-700 text-sm";
const READONLY_INPUT_CLASS =
  "w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-full text-gray-600 text-sm";

const TextField = ({
  label,
  value,
  onChange,
  readOnly = false,
  placeholder,
}) => (
  <>
    <label className="text-gray-600 text-sm">{label}</label>
    <input
      type="text"
      value={value}
      onChange={onChange ? (event) => onChange(event.target.value) : undefined}
      readOnly={readOnly}
      placeholder={placeholder}
      className={readOnly ? READONLY_INPUT_CLASS : FIELD_INPUT_CLASS}
    />
  </>
);

const SignatureSelect = ({ label, value, onChange, options, disabled }) => (
  <>
    <label className="text-gray-600 text-sm">{label}</label>
    <Dropdown
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full"
      required
      disabled={disabled}
    >
      <option value="">Pilih Jabatan</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Dropdown>
  </>
);

const BapPrintModal = ({
  isVisible,
  form,
  ttdOptions,
  isLoadingTtdUsers,
  isFormValid,
  documentData,
  fileName,
  onClose,
  onFieldChange,
  onTembusanChange,
  onAddTembusan,
  onRemoveTembusan,
  onReset,
}) => (
  <div
    className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-150 ${
      isVisible
        ? "bg-black/30 backdrop-blur-sm opacity-100"
        : "bg-transparent opacity-0"
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
        <h2 className="font-medium text-lg">Data Cetak BAP</h2>
      </div>

      <div className="p-6 bg-[#f8f9fa] flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4 items-center">
          <TextField
            label="Nomor BAP:"
            value={form.bapNumber}
            onChange={(value) => onFieldChange("bapNumber", value)}
          />
          <TextField label="TTD 1:" value={form.ttd1Role} readOnly />
          <TextField label="TTD 2:" value={form.ttd2Role} readOnly />
          <SignatureSelect
            label="TTD 3:"
            value={form.ttd3Role}
            onChange={(value) => onFieldChange("ttd3Role", value)}
            options={ttdOptions}
            disabled={isLoadingTtdUsers}
          />
          <SignatureSelect
            label="TTD 4:"
            value={form.ttd4Role}
            onChange={(value) => onFieldChange("ttd4Role", value)}
            options={ttdOptions}
            disabled={isLoadingTtdUsers}
          />
          <TextField
            label="Tembusan 1:"
            value={form.tembusan[0]}
            onChange={(value) => onTembusanChange(0, value)}
            placeholder="Masukan Nama ..."
          />
        </div>

        {form.tembusan.slice(1).map((item, index) => (
          <div
            key={`tembusan-${index + 1}`}
            className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4 items-center"
          >
            <TextField
              label={`Tembusan ${index + 2}:`}
              value={item}
              onChange={(value) => onTembusanChange(index + 1, value)}
              placeholder="Masukan Nama ..."
            />
          </div>
        ))}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onRemoveTembusan}
              className="px-4 py-2 rounded-md bg-red-500 text-white text-sm font-medium hover:bg-red-600"
            >
              Hapus
            </button>
            <button
              type="button"
              onClick={onAddTembusan}
              className="px-4 py-2 rounded-md bg-green-500 text-white text-sm font-medium hover:bg-green-600"
            >
              Tambah
            </button>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onReset}
              className="px-4 py-2 rounded-md bg-gray-500 text-white text-sm font-medium hover:bg-gray-600"
            >
              Reset
            </button>
            {isFormValid ? (
              <PDFDownloadLink
                document={<BapDocument {...documentData} />}
                fileName={`${fileName || "bap-pengajuan"}.pdf`}
                className="inline-flex items-center justify-center rounded-md bg-[#4773da] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#365db8]"
              >
                {({ loading }) => (loading ? "Menyiapkan BAP..." : "Cetak")}
              </PDFDownloadLink>
            ) : (
              <span className="inline-flex items-center justify-center rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-500 cursor-not-allowed select-none">
                Cetak
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default BapPrintModal;

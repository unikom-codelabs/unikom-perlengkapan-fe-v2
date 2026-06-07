import Dropdown from "../Element/Dropdown";
import Table from "../Element/Table";

const APPROVAL_COLUMNS = [
  { key: "no", label: "No" },
  { key: "namaBarang", label: "Nama Barang" },
  { key: "satuan", label: "Satuan" },
  { key: "kategori", label: "Kategori" },
  { key: "jumlah", label: "Jumlah" },
  { key: "jumlahDisetujui", label: "Jumlah Disetujui" },
  { key: "status", label: "Status" },
  { key: "aksi", label: "Aksi" },
];

const STATUS_OPTIONS = [
  { value: 0, label: "Belum Disetujui" },
  { value: 1, label: "Disetujui" },
  { value: 2, label: "Tidak Disetujui" },
];

const PengajuanApprovalTable = ({
  title,
  rows,
  emptyMessage,
  pengajuLabel,
  updatingRowId,
  inputErrors,
  formatKategori,
  formatStatus,
  statusBadgeClass,
  onJumlahChange,
  onJumlahBlur,
  onStatusChange,
}) => (
  <div className="mb-8 last:mb-0">
    {pengajuLabel ? (
      <div className="mb-2 text-sm text-gray-600">
        <span className="font-bold text-gray-700">Pengaju:</span> {pengajuLabel}
      </div>
    ) : null}
    <Table
      title={title}
      columns={APPROVAL_COLUMNS}
      rows={rows}
      emptyMessage={emptyMessage}
      wrapperClass="overflow-x-auto overflow-y-visible border z-[100] border-gray-200"
      renderRow={(row, index) => {
        const isUpdating = updatingRowId === row.id;
        const inputError = inputErrors[row.id];

        return (
          <tr key={row.id} className="border-t border-gray-100">
            <td className="px-6 py-4 text-gray-600">{index + 1}</td>
            <td className="px-6 py-4 text-gray-800">{row.namaBarang}</td>
            <td className="px-6 py-4 text-gray-600">{row.satuan}</td>
            <td className="px-6 py-4 text-gray-600">
              {formatKategori(
                row.isLainnya ? row.kategoriBarang || row.kategori : row.kategori,
              )}
            </td>
            <td className="px-6 py-4 text-gray-600">{row.jumlah}</td>
            <td className="px-6 py-4">
              <div className="relative inline-flex">
                <input
                  type="number"
                  min="0"
                  value={row.jumlahDisetujui}
                  onChange={(event) => onJumlahChange(row, event.target.value)}
                  onBlur={(event) => onJumlahBlur(row, event.target.value)}
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
                onChange={(event) => onStatusChange(row, event.target.value)}
                disabled={isUpdating}
                className="w-40 rounded border border-gray-300 px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Dropdown>
            </td>
          </tr>
        );
      }}
    />
  </div>
);

export default PengajuanApprovalTable;

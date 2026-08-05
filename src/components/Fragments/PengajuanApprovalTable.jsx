import { useState, useMemo, useEffect } from "react";
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
  rows = [],
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
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [rows.length, title]);

  const totalPages = Math.ceil(rows.length / itemsPerPage);

  const currentRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return rows.slice(start, start + itemsPerPage);
  }, [rows, currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-100 rounded-b-lg">
        <div className="text-sm text-gray-500">
          Menampilkan <span className="font-semibold text-gray-800">{((currentPage - 1) * itemsPerPage) + 1}</span> hingga <span className="font-semibold text-gray-800">{Math.min(currentPage * itemsPerPage, rows.length)}</span> dari <span className="font-semibold text-gray-800">{rows.length}</span> entri
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(currentPage - 1);
            }}
            disabled={currentPage === 1}
            className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            title="Sebelumnya"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => {
              if (page === '...') {
                return (
                  <span key={`ellipsis-${index}`} className="flex items-center justify-center w-8 h-8 text-gray-400 text-sm">
                    ...
                  </span>
                );
              }
              const isActive = currentPage === page;
              return (
                <button
                  key={`page-${page}`}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(page);
                  }}
                  className={`flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#4279df] text-white border border-[#4279df] shadow-sm"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(currentPage + 1);
            }}
            disabled={currentPage === totalPages}
            className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            title="Selanjutnya"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="mb-8 last:mb-0">
      {pengajuLabel ? (
        <div className="mb-2 text-sm text-gray-600">
          <span className="font-bold text-gray-700">Pengaju:</span> {pengajuLabel}
        </div>
      ) : null}
      <Table
        title={title}
        columns={APPROVAL_COLUMNS}
        rows={currentRows}
        emptyMessage={emptyMessage}
        wrapperClass="overflow-x-auto overflow-y-visible border z-[100] border-gray-200"
        footer={renderPagination()}
        renderRow={(row, index) => {
          const isUpdating = updatingRowId === row.id;
          const inputError = inputErrors[row.id];
          const actualIndex = (currentPage - 1) * itemsPerPage + index + 1;

          return (
            <tr key={row.id} className="border-t border-gray-100">
              <td className="px-6 py-4 text-gray-600">{actualIndex}</td>
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
                    onKeyDown={(e) => {
                      if (['.', 'e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
                    }}
                    onChange={(event) => {
                      let val = event.target.value;
                      if (val !== "") {
                        val = val.replace(/^0+/, "") || "0";
                      }
                      onJumlahChange(row, val);
                    }}
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
};

export default PengajuanApprovalTable;
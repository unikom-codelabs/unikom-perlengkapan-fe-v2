import React from "react";

const Table = ({
  title,
  columns = [],
  rows = [],
  renderRow,
  emptyMessage = "Data tidak ditemukan",
  footer = null,
  renderHeader = null,
  wrapperClass = "overflow-x-auto overflow-y-visible rounded-t-lg border border-gray-200",
}) => {
  const hasRows = rows.length > 0;

  return (
    <div className="mb-10">
      {title && (
        <h3 className="text-[17px] font-bold text-gray-700 mb-4">{title}</h3>
      )}

      <div className={wrapperClass}>
        <table className="w-full text-sm text-left">
          {renderHeader ? (
            renderHeader()
          ) : (
            <thead className="bg-[#f0f4fc] text-gray-600 font-semibold">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key ?? column.label}
                    className="px-6 py-4 text-center"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
          )}

          <tbody className="bg-[#f8f9fc]">
            {!hasRows ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-4 text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, index) => renderRow(row, index))
            )}
          </tbody>
        </table>
      </div>

      {footer}
    </div>
  );
};

export default Table;

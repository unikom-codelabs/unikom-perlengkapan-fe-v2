import { useEffect, useMemo, useState } from "react";
import PageHelmet from "../../components/SEO/PageHelmet";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { listUnitTypeTree } from "../../api/unitTypeService";
import Table from "../../components/Element/Table";

const getApiErrorMessage = (error, fallbackMessage) => {
  const responseData = error?.response?.data;

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

const normalizeRows = (unitTypes = []) =>
  unitTypes
    .map((item, index) => {
      const jabatan = String(item?.nama ?? item?.name ?? "").trim();
      const rawId = String(
        item?.id ??
          item?.unit_id ??
          item?.id_unit_type ??
          item?.unit_type_id ??
          "",
      ).trim();
      const children = Array.isArray(item?.children) ? item.children : [];
      const units = children
        .map((unit) => String(unit?.nama ?? unit?.name ?? "").trim())
        .filter(Boolean);

      return {
        id: rawId ? `unit-type-${rawId}` : `unit-type-${index + 1}`,
        jabatan,
        units,
      };
    })
    .filter((item) => item.jabatan);

const BagianPage = () => {
  const [rows, setRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pageError, setPageError] = useState("");

  const fetchDropdownBagian = async () => {
    setIsLoading(true);
    setPageError("");

    try {
      const unitTypes = await listUnitTypeTree();
      setRows(normalizeRows(unitTypes));
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Gagal mengambil data bagian."));
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdownBagian();
  }, []);

  const filteredRows = useMemo(
    () =>
      rows.filter((item) => {
        const query = searchQuery.toLowerCase().trim();

        if (!query) {
          return true;
        }

        const unitsLabel = item.units.join(", ");

        return [item.jabatan, unitsLabel].some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(query),
        );
      }),
    [rows, searchQuery],
  );
  const tableRows = isLoading ? [] : filteredRows;
  const emptyMessage = isLoading
    ? "Memuat data bagian..."
    : searchQuery.trim()
      ? `Tidak ada jabatan yang cocok dengan pencarian "${searchQuery}".`
      : "Tidak ada data bagian.";

  return (
    <>
      <PageHelmet
        title="Manajemen Bagian"
        description="Kelola data bagian dan struktur unit di UNIKOM Perlengkapan."
      />

      <div className="bg-white rounded border border-gray-200 w-full shadow-sm">
        <div className="bg-[#4279df] w-full text-white px-6 py-4 rounded-t">
          <h1 className="text-xl font-semibold">Daftar Bagian</h1>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari jabatan atau unit"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-[#4279df]"
              />
            </div>
          </div>

          {pageError ? (
            <p className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 whitespace-pre-line">
              {pageError}
            </p>
          ) : null}

          <Table
            title={null}
            columns={[
              { key: "no", label: "No" },
              { key: "jabatan", label: "Nama Jabatan" },
              { key: "unit", label: "Unit" },
            ]}
            rows={tableRows}
            emptyMessage={emptyMessage}
            wrapperClass="overflow-x-auto border border-gray-200"
            renderRow={(item, index) => (
              <tr key={item.id} className="border-t border-gray-100">
                <td className="px-6 py-4 text-gray-600 text-center">
                  {index + 1}
                </td>
                <td className="px-6 py-4 text-gray-800">{item.jabatan}</td>
                <td className="px-6 py-4">
                  {item.units.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {item.units.map((unit) => (
                        <span
                          key={`${item.id}-${unit}`}
                          className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm text-[#4279df]"
                        >
                          {unit}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
              </tr>
            )}
          />
        </div>
      </div>
    </>
  );
};

export default BagianPage;

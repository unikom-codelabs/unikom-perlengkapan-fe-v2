import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  MagnifyingGlassIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import ActionIconButton from "../../components/Element/ActionIconButton";
import Table from "../../components/Element/Table";
import ModalTambahAkun from "../../components/Element/ModalTambahAkun";
import ModalEditAkun from "../../components/Element/ModalEditAkun";
import ModalKonfirmasiHapus from "../../components/Element/ModalKonfirmasiHapus";
import { deleteUser, listUsersPaginated } from "../../api/userService";

const ManajemenPenggunaPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalTambahAkunOpen, setIsModalTambahAkunOpen] = useState(false);
  const [isModalEditAkunOpen, setIsModalEditAkunOpen] = useState(false);
  const [isModalHapusOpen, setIsModalHapusOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 10;

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: itemsPerPage,
    total: 0,
    from: 0,
    to: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const matchesSearch = (item, query) => {
    if (!item) return false;
    const normalizedQuery = query.toLowerCase();

    return [
      item?.nama,
      item?.username,
      item?.nip,
      item?.email,
      item?.satuan,
      item?.jabatan,
    ].some((value) =>
      String(value ?? "")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  };

  const buildLocalPagination = (data, page = 1) => {
    const total = data.length;
    const lastPage = Math.max(Math.ceil(total / itemsPerPage), 1);
    const from = total === 0 ? 0 : (page - 1) * itemsPerPage + 1;
    const to = Math.min(page * itemsPerPage, total);

    return {
      currentPage: page,
      lastPage,
      perPage: itemsPerPage,
      total,
      from,
      to,
    };
  };

  const fetchUsers = async (page = 1, query = "") => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const normalizedQuery = query.trim();

      if (normalizedQuery) {
        const firstResult = await listUsersPaginated({ page: 1 });
        const lastPage = Number(firstResult.pagination.lastPage) || 1;
        const remainingPages = Array.from(
          { length: Math.max(lastPage - 1, 0) },
          (_, index) => index + 2,
        );
        const remainingResults = await Promise.all(
          remainingPages.map((pageNumber) =>
            listUsersPaginated({ page: pageNumber }),
          ),
        );
        const allUsers = [
          ...firstResult.users,
          ...remainingResults.flatMap((result) => result.users),
        ];
        const filteredUsers = allUsers.filter((item) =>
          matchesSearch(item, normalizedQuery),
        );

        setUsers(filteredUsers);
        setPagination(buildLocalPagination(filteredUsers, page));
        return;
      }

      const result = await listUsersPaginated({ page });
      setUsers(result.users);
      setPagination(result.pagination);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          "Gagal memuat data pengguna. Silakan coba lagi.",
      );
      setUsers([]);
      setPagination({
        currentPage: 1,
        lastPage: 1,
        perPage: itemsPerPage,
        total: 0,
        from: 0,
        to: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchUsers(currentPage, debouncedSearchQuery);
  }, [currentPage, debouncedSearchQuery]);

  const totalPages = Math.max(Number(pagination.lastPage) || 1, 1);
  const currentData = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return users;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    return users.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, debouncedSearchQuery, users]);
  const rowNumberStart =
    Number(pagination.from) ||
    (currentPage - 1) * (Number(pagination.perPage) || itemsPerPage) + 1;
  const tableRows = isLoading ? [] : currentData;
  const emptyMessage = isLoading
    ? "Memuat data pengguna..."
    : `Tidak ada akun yang cocok dengan pencarian "${searchQuery}"`;

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const refreshUsers = async (message = "") => {
    await fetchUsers(currentPage, debouncedSearchQuery);

    if (message) {
      setSuccessMessage(message);
    }
  };

  const handleOpenEditModal = (user) => {
    setSelectedUser(user);
    setIsModalEditAkunOpen(true);
  };

  const handleOpenDeleteModal = (user) => {
    setSelectedUser(user);
    setErrorMessage("");
    setIsModalHapusOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser?.id) {
      setErrorMessage("ID pengguna tidak ditemukan.");
      setIsModalHapusOpen(false);
      return;
    }

    setIsDeleting(true);
    setErrorMessage("");

    try {
      await deleteUser(selectedUser.id);
      await refreshUsers("Akun berhasil dihapus.");
      setIsModalHapusOpen(false);
      setSelectedUser(null);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          "Gagal menghapus akun. Silakan coba lagi.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= maxVisiblePages - 1) {
        for (let i = 1; i <= maxVisiblePages; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (currentPage > totalPages - maxVisiblePages + 2) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - maxVisiblePages + 1; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  return (
    <>
      <Helmet>
        <title>Manajemen Pengguna | UNIKOM Perlengkapan</title>
      </Helmet>
      <div className="bg-white rounded border border-gray-200 w-full shadow-sm">
        <div className="bg-[#4279df] w-full text-white px-6 py-4 rounded-t">
          <h1 className="text-xl font-semibold">Daftar Akun</h1>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari pengguna"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-[#4279df] w-full"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>

            <button
              onClick={() => setIsModalTambahAkunOpen(true)}
              className="w-full md:w-auto flex items-center justify-center space-x-1.5 bg-[#4279df] hover:bg-blue-600 text-white px-5 py-2.5 rounded-full transition-colors text-sm shadow-sm"
            >
              <span>Tambah Akun</span>
              <PlusIcon className="h-4 w-4 stroke-2" />
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          <Table
            title={null}
            columns={[
              { key: "no", label: "No" },
              { key: "nip", label: "NIP" },
              { key: "nama", label: "Nama" },
              { key: "jabatan", label: "Jabatan" },
              { key: "aksi", label: "Aksi" },
            ]}
            rows={tableRows}
            emptyMessage={emptyMessage}
            wrapperClass="overflow-x-auto border border-gray-200"
            renderRow={(item, index) => (
              <tr key={item?.id} className="border-t border-gray-100">
                <td className="px-6 py-4 text-gray-600 text-center">
                  {rowNumberStart + index}
                </td>
                <td className="px-6 py-4 text-gray-600">{item?.nip}</td>
                <td className="px-6 py-4 text-gray-800">{item?.nama}</td>
                <td className="px-6 py-4 text-gray-600 text-center">
                  {item?.jabatan}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <ActionIconButton
                      label="Edit"
                      icon={PencilSquareIcon}
                      onClick={() => handleOpenEditModal(item)}
                      variant="primary"
                    />
                    <ActionIconButton
                      label="Hapus"
                      icon={TrashIcon}
                      onClick={() => handleOpenDeleteModal(item)}
                      variant="danger"
                    />
                  </div>
                </td>
              </tr>
            )}
          />

          <div className="flex justify-end items-center mt-6">
            <nav className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>

              {getPageNumbers().map((page, idx) => (
                <button
                  key={idx}
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
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2 rounded border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </nav>
          </div>
        </div>
      </div>
      <ModalTambahAkun
        isOpen={isModalTambahAkunOpen}
        onClose={() => setIsModalTambahAkunOpen(false)}
        onSuccess={() => refreshUsers("Akun berhasil ditambahkan.")}
      />
      <ModalEditAkun
        isOpen={isModalEditAkunOpen}
        onClose={() => {
          setIsModalEditAkunOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSuccess={() => refreshUsers("Akun berhasil diperbarui.")}
      />
      <ModalKonfirmasiHapus
        isOpen={isModalHapusOpen}
        onClose={() => setIsModalHapusOpen(false)}
        onConfirm={handleDeleteUser}
        isProcessing={isDeleting}
        title="Konfirmasi Hapus Akun"
        message={`Apakah Anda yakin ingin menghapus akun${
          selectedUser?.nama ? ` ${selectedUser.nama}` : ""
        }? Data yang sudah dihapus tidak dapat dikembalikan.`}
      />
    </>
  );
};

export default ManajemenPenggunaPage;

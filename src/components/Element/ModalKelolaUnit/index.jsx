import { useState, useEffect } from "react";
import { PlusIcon, PencilSquareIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import ActionIconButton from "../ActionIconButton";
import ModalKonfirmasiHapus from "../ModalKonfirmasiHapus";
import { createUnitType, updateUnitType, deleteUnitType } from "../../../api/unitTypeService";

const ModalKelolaUnit = ({ isOpen, onClose, jabatan, onRefresh }) => {
  const [show, setShow] = useState(false);
  const [shouldRender, setRender] = useState(isOpen);
  
  const [newUnitName, setNewUnitName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [editingUnitId, setEditingUnitId] = useState(null);
  const [editUnitName, setEditUnitName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  if (isOpen && !shouldRender) {
    setRender(true);
  }
  if (!isOpen && show) {
    setShow(false);
  }

  useEffect(() => {
    let timer;
    if (isOpen) {
      timer = setTimeout(() => setShow(true), 10);
      setNewUnitName("");
      setEditingUnitId(null);
      setDeleteTarget(null);
      setErrorMsg("");
    } else {
      timer = setTimeout(() => setRender(false), 150);
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!shouldRender || !jabatan) return null;

  const units = (jabatan.rawChildren || []).map(u => ({
    id: u.id ?? u.unit_id ?? u.id_unit_type ?? u.unit_type_id,
    nama: String(u.nama ?? u.name ?? "").trim()
  }));

  const handleAddUnit = async (e) => {
    e.preventDefault();
    if (!newUnitName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await createUnitType({ nama: newUnitName, parentId: jabatan.id });
      setNewUnitName("");
      await onRefresh();
    } catch (error) {
      setErrorMsg(error?.response?.data?.message || "Gagal menambahkan unit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUnit = async (unitId) => {
    if (!editUnitName.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await updateUnitType(unitId, { nama: editUnitName, parentId: jabatan.id });
      setEditingUnitId(null);
      await onRefresh();
    } catch (error) {
      setErrorMsg(error?.response?.data?.message || "Gagal memperbarui unit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (unit) => {
    setDeleteTarget(unit);
  };

  const handleCloseDeleteModal = () => {
    if (isSubmitting) return;
    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await deleteUnitType(deleteTarget.id);
      await onRefresh();
      setDeleteTarget(null);
    } catch (error) {
      setErrorMsg(error?.response?.data?.message || "Gagal menghapus unit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-150 ${
        show ? "bg-black/30 backdrop-blur-sm opacity-100" : "bg-transparent opacity-0"
      }`}
      onClick={() => !isSubmitting && onClose()}
    >
      <div
        className={`bg-[#f8f9fa] rounded-lg shadow-lg w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-150 transform ${
          show ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="bg-[#4279df] text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-medium">Kelola Unit - {jabatan.jabatan}</h2>
          <button onClick={onClose} disabled={isSubmitting} className="hover:bg-blue-600 p-1 rounded">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
          {errorMsg && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded">
              {errorMsg}
            </p>
          )}

          <form onSubmit={handleAddUnit} className="flex gap-2">
            <input
              type="text"
              placeholder="Nama Unit Baru..."
              value={newUnitName}
              onChange={(e) => setNewUnitName(e.target.value)}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#4279df] text-sm"
            />
            <button
              type="submit"
              disabled={!newUnitName.trim() || isSubmitting}
              className="flex items-center gap-1 bg-[#4279df] hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors text-sm disabled:opacity-50"
            >
              <PlusIcon className="w-4 h-4" /> Tambah
            </button>
          </form>

          <div className="border border-gray-200 rounded bg-white">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                <tr>
                  <th className="px-4 py-3 w-12 text-center font-medium">No</th>
                  <th className="px-4 py-3 font-medium">Nama Unit</th>
                  <th className="px-4 py-3 w-24 text-center font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {units.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-4 py-4 text-center text-gray-500">
                      Belum ada unit.
                    </td>
                  </tr>
                ) : (
                  units.map((u, i) => (
                    <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 last:border-0">
                      <td className="px-4 py-3 text-center text-gray-600">{i + 1}</td>
                      <td className="px-4 py-3">
                        {editingUnitId === u.id ? (
                          <input
                            type="text"
                            value={editUnitName}
                            onChange={(e) => setEditUnitName(e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#4279df]"
                            autoFocus
                          />
                        ) : (
                          <span className="text-gray-800">{u.nama}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {editingUnitId === u.id ? (
                            <>
                              <button
                                onClick={() => handleUpdateUnit(u.id)}
                                disabled={isSubmitting}
                                className="text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
                              >
                                Simpan
                              </button>
                              <button
                                onClick={() => setEditingUnitId(null)}
                                disabled={isSubmitting}
                                className="text-sm text-gray-500 hover:text-gray-700 font-medium disabled:opacity-50"
                              >
                                Batal
                              </button>
                            </>
                          ) : (
                            <>
                              <ActionIconButton
                                label="Edit"
                                icon={PencilSquareIcon}
                                onClick={() => {
                                  setEditingUnitId(u.id);
                                  setEditUnitName(u.nama);
                                }}
                                disabled={isSubmitting}
                                variant="primary"
                              />
                              <ActionIconButton
                                label="Hapus"
                                icon={TrashIcon}
                                onClick={() => handleOpenDeleteModal(u)}
                                disabled={isSubmitting}
                                variant="danger"
                              />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ModalKonfirmasiHapus
        isOpen={Boolean(deleteTarget)}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Konfirmasi Hapus Unit"
        message={`Apakah Anda yakin ingin menghapus unit "${deleteTarget?.nama ?? ""}"?`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        isProcessing={isSubmitting}
      />
    </div>
  );
};

export default ModalKelolaUnit;

import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const HistoriPengajuanPage = () => {
  const [activeTab, setActiveTab] = useState("ATK Tahunan");

  const tabs = ["ATK Tahunan", "ATK Ujian", "ATK Kelas"];

  const renderTableSection = (title) => (
    <div className="mb-10">
      <h3 className="text-[17px] font-bold text-gray-700 mb-4">{title}</h3>
      <div className="overflow-x-auto rounded-t-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#f0f4fc] text-gray-600 font-semibold">
            <tr>
              <th className="px-6 py-4">No</th>
              <th className="px-6 py-4">Nama Barang</th>
              <th className="px-6 py-4">Satuan</th>
              <th className="px-6 py-4">Kategori</th>
              <th className="px-6 py-4">Jumlah</th>
              <th className="px-6 py-4">Jumlah Disetujui</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="bg-[#f8f9fc]">
            <tr>
              <td colSpan="7" className="px-6 py-4 text-gray-500">
                Data tidak ditemukan
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-4">
        <div className="flex items-center space-x-1">
          <button className="p-1.5 border border-gray-300 rounded text-gray-500 bg-white hover:bg-gray-50">
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button className="px-3 py-1.5 border border-[#4773da] bg-[#4773da] text-white rounded text-sm font-medium">
            1
          </button>
          <button className="p-1.5 border border-gray-300 rounded text-gray-500 bg-white hover:bg-gray-50">
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div>
          <label className="block text-sm text-gray-500 mb-2">Tahun</label>
          <select className="w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-500">
            <option value="">-- Pilih Tahun --</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-2">Aktivasi</label>
          <select
            className="w-full border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none appearance-none bg-gray-100 text-gray-400 cursor-not-allowed"
            disabled
          >
            <option value="">-- Pilih Aktivasi --</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-2">
            Tahun Pengajuan
          </label>
          <select
            className="w-full border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none appearance-none bg-gray-100 text-gray-400 cursor-not-allowed"
            disabled
          >
            <option value="">-- Pilih Tahun Pengajuan --</option>
          </select>
        </div>
      </div>

      {renderTableSection("Tahun : -")}
      {renderTableSection("Pengajuan Lainnya")}
    </>
  );

  return (
    <>
      <Helmet>
        <title>Histori Pengajuan</title>
      </Helmet>

      <div className="bg-white rounded shadow-sm overflow-hidden mb-6">
        <div className="bg-[#4773da] text-white px-6 py-4">
          <h1 className="text-xl font-semibold">Histori Pengajuan</h1>
        </div>

        <div className="p-6">
          <div className="flex space-x-6 border-b border-gray-200 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-[15px] font-medium transition-colors relative ${
                  activeTab === tab
                    ? "text-[#4773da]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#4773da]"></span>
                )}
              </button>
            ))}
          </div>

          {renderContent()}
        </div>
      </div>
    </>
  );
};

export default HistoriPengajuanPage;

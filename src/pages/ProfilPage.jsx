import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import ProfileLogo from "/src/assets/img/logo-unikom.png";
import { useAuth } from "../context/useAuth";

const ProfilPage = () => {
  const [activeTab, setActiveTab] = useState("Profil");
  const { currentUser } = useAuth();

  const menuItems = ["Profil", "Akun", "Photo"];

  const profileData = {
    nip: currentUser?.nip || "-",
    nama:
      currentUser?.nama ||
      currentUser?.name ||
      currentUser?.full_name ||
      currentUser?.username ||
      "-",
    jenisKelamin: currentUser?.jenis_kelamin || "-",
    jabatan:
      currentUser?.jabatan?.nama ||
      currentUser?.jabatan_nama ||
      currentUser?.jabatan ||
      "-",
    unit: currentUser?.unit?.nama || currentUser?.unit || "-",
    email: currentUser?.email || "-",
    username: currentUser?.username || "-",
    role: currentUser?.role || "-",
  };

  const renderProfilTab = () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-600 font-medium text-sm">NIP</label>
        <input
          type="text"
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4279df] focus:border-transparent text-gray-700 text-sm"
          value={profileData.nip}
          readOnly
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-gray-600 font-medium text-sm">
          Nama Lengkap
        </label>
        <input
          type="text"
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4279df] focus:border-transparent text-gray-700 text-sm"
          value={profileData.nama}
          readOnly
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-gray-600 font-medium text-sm">
          Jenis Kelamin
        </label>
        <input
          type="text"
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none text-gray-700 text-sm"
          value={profileData.jenisKelamin}
          readOnly
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-gray-600 font-medium text-sm">Jabatan</label>
        <input
          type="text"
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none text-gray-700 text-sm"
          value={profileData.jabatan}
          readOnly
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-gray-600 font-medium text-sm">Bagian</label>
        <input
          type="text"
          className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-full focus:outline-none text-gray-700 text-sm cursor-not-allowed"
          value={profileData.unit}
          readOnly
          disabled
        />
      </div>

      <div className="flex justify-end mt-4">
        <button className="px-8 py-2 rounded-full border border-[#4279df] text-[#4279df] font-medium hover:bg-blue-50 transition-colors text-sm">
          Update
        </button>
      </div>
    </div>
  );

  const renderAkunTab = () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-600 font-medium text-sm">
          Email Sekarang
        </label>
        <input
          type="email"
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none text-gray-700 text-sm"
          value={profileData.email}
          readOnly
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-gray-600 font-medium text-sm">Username</label>
        <input
          type="text"
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none text-gray-700 text-sm"
          value={profileData.username}
          readOnly
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-gray-600 font-medium text-sm">Role</label>
        <input
          type="text"
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none text-gray-700 text-sm"
          value={profileData.role}
          readOnly
        />
      </div>

      <div className="flex justify-end mt-2">
        <button className="px-8 py-2 rounded-full border border-[#4279df] text-[#4279df] font-medium hover:bg-blue-50 transition-colors text-sm">
          Update
        </button>
      </div>
    </div>
  );

  const renderPhotoTab = () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <label className="text-gray-600 font-medium text-sm">
          Upload Photo
        </label>
        <div className="relative">
          <input
            type="text"
            className="w-full pl-28 pr-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4279df] focus:border-transparent text-gray-700 text-sm"
            readOnly
          />
          <button className="absolute left-1 top-1 bottom-1 bg-gray-200 text-gray-600 px-4 text-sm font-medium rounded-full cursor-not-allowed">
            Choose photo
          </button>
        </div>
      </div>

      <div className="flex justify-end mt-2">
        <button className="px-8 py-2 rounded-full border border-[#4279df] text-[#4279df] font-medium hover:bg-blue-50 transition-colors text-sm">
          Update
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Profil</title>
      </Helmet>

      <div className="bg-white rounded shadow-sm overflow-hidden mb-6 flex flex-col justify-start min-h-150">
        <div className="bg-[#4773da] text-white px-6 py-4">
          <h1 className="text-xl font-semibold">Profil</h1>
        </div>

        <div className="flex flex-col md:flex-row grow">
          <div className="w-full md:w-1/3 flex flex-col items-center py-10 px-6 border-b md:border-b-0 md:border-r border-gray-200">
            <img
              src={ProfileLogo}
              alt="Profile Logo"
              className="w-32 h-32 object-contain mb-6"
            />
            <h2 className="text-gray-900 font-bold text-[15px] mb-8 text-center">
              {profileData.nama}
            </h2>

            <div className="w-full flex flex-col gap-2">
              {menuItems.map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveTab(item)}
                  className={`w-full py-2.5 px-6 rounded-full text-sm font-medium transition-colors text-left ${
                    activeTab === item
                      ? "bg-[#4279df] text-white"
                      : "text-[#4279df] bg-transparent hover:bg-blue-50"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full md:w-2/3 p-8">
            {activeTab === "Profil" && renderProfilTab()}
            {activeTab === "Akun" && renderAkunTab()}
            {activeTab === "Photo" && renderPhotoTab()}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilPage;

import { useState, useEffect } from "react";
import { pdf } from "@react-pdf/renderer";
import Dropdown from "../Element/Dropdown";
import Button from "../Element/Button";
import VendorAtkDocument from "../Pdf/VendorAtkDocument";

const sanitizeFileName = (value) =>
  String(value ?? "vendor")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "vendor";

const PRIMARY_BUTTON_CLASS = "min-w-[130px] px-6 py-2.5";
const SECONDARY_BUTTON_CLASS = "min-w-[92px] px-6 py-2.5 font-medium";

const VendorAtkDownloadModal = ({
  isVisible,
  vendors = [],
  selectedVendorId,
  isLoading,
  errorMessage,
  onSelectVendor,
  onClose,
}) => {
  const [isPreparingPdf, setIsPreparingPdf] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const [show, setShow] = useState(false);
  const [shouldRender, setRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setRender(true);
      const timer = setTimeout(() => setShow(true), 10);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
      const timer = setTimeout(() => setRender(false), 150);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!shouldRender) {
    return null;
  }

  const selectedVendor =
    vendors.find(
      (vendor) => String(vendor?.id ?? "") === String(selectedVendorId),
    ) ?? null;
  const fileName = `daftar-atk-vendor-${sanitizeFileName(selectedVendor?.nama)}.pdf`;

  const handleDownloadPdf = async () => {
    if (!selectedVendor || isPreparingPdf) {
      return;
    }

    setIsPreparingPdf(true);
    setDownloadError("");

    try {
      const blob = await pdf(
        <VendorAtkDocument vendor={selectedVendor} generatedAt={new Date()} />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setDownloadError(error?.message ?? "Gagal menyiapkan PDF.");
    } finally {
      setIsPreparingPdf(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-150 ${
        show
          ? "bg-black/30 backdrop-blur-sm opacity-100"
          : "bg-transparent opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`w-full max-w-xl overflow-hidden rounded-lg bg-white shadow-lg transition-all duration-150 transform ${
          show ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="bg-[#4279df] px-6 py-4 text-white">
          <h2 className="text-lg font-medium">
            Download Daftar ATK dan Vendor
          </h2>
        </div>

        <div className="flex flex-col gap-5 bg-[#f8f9fa] p-6">
          <div>
            <label className="mb-2 block text-sm text-gray-600">Vendor</label>
            <Dropdown
              value={selectedVendorId}
              onChange={(event) => onSelectVendor(event.target.value)}
              disabled={isLoading || vendors.length === 0}
              searchable
            >
              <option value="">-- Pilih Vendor --</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.nama}
                </option>
              ))}
            </Dropdown>
          </div>

          {isLoading ? (
            <p className="text-sm text-gray-500">Memuat data vendor...</p>
          ) : null}

          {errorMessage ? (
            <p className="text-sm text-red-600">{errorMessage}</p>
          ) : null}

          {downloadError ? (
            <p className="text-sm text-red-600">{downloadError}</p>
          ) : null}

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              shape="pill"
              fullWidth={false}
              className={SECONDARY_BUTTON_CLASS}
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleDownloadPdf}
              variant="primary"
              shape="pill"
              fullWidth={false}
              className={PRIMARY_BUTTON_CLASS}
              disabled={!selectedVendor || isPreparingPdf}
            >
              {isPreparingPdf ? "Menyiapkan PDF..." : "Download PDF"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorAtkDownloadModal;

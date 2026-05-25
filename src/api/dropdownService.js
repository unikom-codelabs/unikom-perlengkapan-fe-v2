import apiClient from "./ApiClient";

const normalizeOption = (item, index = 0) => {
  if (item && typeof item === "object") {
    const id = item.id ?? item.value ?? item.key ?? index + 1;
    const nama = String(item.nama ?? item.name ?? item.label ?? "").trim();

    return {
      id: String(id).trim(),
      nama,
      value: String(id).trim(),
      label: nama,
    };
  }

  const nama = String(item ?? "").trim();
  const id = String(index + 1);

  return {
    id,
    nama,
    value: id,
    label: nama,
  };
};

const normalizeOptionList = (items = []) => {
  const list = Array.isArray(items)
    ? items
    : Array.isArray(items?.data)
      ? items.data
      : [];

  return list.map(normalizeOption).filter((item) => item.id && item.nama);
};

const normalizeJabatanUnits = (items = []) =>
  items
    .map((item, index) => {
      const nama = String(item?.nama ?? item?.name ?? "").trim();
      const units = Array.isArray(item?.units) ? item.units : [];
      const cleanedUnits = units
        .map((unit) => String(unit ?? "").trim())
        .filter(Boolean);

      return {
        id: String(item?.id ?? index + 1).trim(),
        nama,
        units: cleanedUnits,
      };
    })
    .filter((item) => item.nama);

const extractDropdownData = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (payload?.data && typeof payload.data === "object") {
    return payload.data;
  }

  if (payload && typeof payload === "object") {
    return payload;
  }

  return {};
};

export const getDropdown = async () => {
  const response = await apiClient.get("/dropdown");
  const data = extractDropdownData(response.data);

  if (Array.isArray(data)) {
    return {
      bagian: normalizeOptionList(data),
      jabatanUnits: normalizeJabatanUnits(data),
      success: Boolean(response.data?.success ?? true),
      message: String(response.data?.message ?? "").trim(),
    };
  }

  const bagianSource =
    data.bagian ??
    data.bagian_type ??
    data.bagianType ??
    data.bagian_options ??
    data.bagianOptions ??
    data.jenis_bagian ??
    data.bagianList;

  return {
    bagian: normalizeOptionList(bagianSource),
    fakultas: normalizeOptionList(data.fakultas),
    prodi: normalizeOptionList(data.prodi),
    jabatanUnits: normalizeJabatanUnits(data.jabatan ?? data.jabatanUnits),
    success: Boolean(response.data?.success ?? true),
    message: String(response.data?.message ?? "").trim(),
  };
};

export const listDropdownBagian = async () => {
  const dropdown = await getDropdown();
  return dropdown.bagian ?? [];
};

export const listDropdownJabatan = listDropdownBagian;

export const listDropdownFakultas = async () => {
  const dropdown = await getDropdown();
  return dropdown.fakultas ?? [];
};

export const listDropdownProdi = async () => {
  const dropdown = await getDropdown();
  return dropdown.prodi ?? [];
};

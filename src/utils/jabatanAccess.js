const KAPRODI_ALIAS = [
  "kaprodi",
  "ka prodi",
  "ketua prodi",
  "ketua program studi",
];

export const normalizeJabatanValue = (value) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/\./g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const isKaprodiJabatan = (value) => {
  const normalized = normalizeJabatanValue(value);

  return KAPRODI_ALIAS.some((alias) => normalized.includes(alias));
};

export const isDekanJabatan = (value) =>
  normalizeJabatanValue(value).includes("dekan");

export const canSubmitAllKategori = (value) =>
  isDekanJabatan(value) || isKaprodiJabatan(value);

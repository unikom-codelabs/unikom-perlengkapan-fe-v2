// Periode aktivasi disimpan sebagai tanggal tanpa jam ("2026-09-28"). String
// seperti itu dibaca `new Date()` sebagai tengah malam UTC, yaitu pukul 07.00
// WIB, sehingga periode yang berakhir 28 September sudah dianggap tutup sejak
// pagi tanggal 28. Perbandingan di sini memakai tanggal kalender lokal saja,
// sama seperti backend (`whereDate`), supaya hari terakhir berlaku penuh.

const pad = (value) => String(value).padStart(2, "0");

const keyDariDate = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const toTanggalKey = (value) => {
  if (!value) {
    return null;
  }

  const teks = String(value).trim();

  // Tanggal murni dipakai apa adanya, tanpa lewat Date agar tidak bergeser.
  if (/^\d{4}-\d{2}-\d{2}$/.test(teks)) {
    return teks;
  }

  const tanggal = value instanceof Date ? value : new Date(teks);

  return Number.isNaN(tanggal.getTime()) ? null : keyDariDate(tanggal);
};

export const hariIniKey = () => keyDariDate(new Date());

// null berarti tanggal tidak diketahui, supaya pemanggil bisa memakai
// penanda lain sebagai cadangan.
export const isDalamPeriode = (mulai, selesai) => {
  const mulaiKey = toTanggalKey(mulai);
  const selesaiKey = toTanggalKey(selesai);

  if (!mulaiKey && !selesaiKey) {
    return null;
  }

  const hariIni = hariIniKey();

  if (mulaiKey && hariIni < mulaiKey) {
    return false;
  }

  if (selesaiKey && hariIni > selesaiKey) {
    return false;
  }

  return true;
};

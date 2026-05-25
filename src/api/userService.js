import apiClient from "./ApiClient";

const pickValue = (...values) =>
  values.find((value) => value !== undefined && value !== null);

const extractListData = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
};

const extractPaginationData = (payload) => {
  const paginator =
    payload?.data && !Array.isArray(payload.data)
      ? payload.data
      : payload?.current_page || payload?.last_page
        ? payload
        : null;

  if (!paginator || typeof paginator !== "object") {
    return {
      currentPage: 1,
      lastPage: 1,
      perPage: 0,
      total: 0,
      from: 0,
      to: 0,
      links: [],
      nextPageUrl: null,
      prevPageUrl: null,
    };
  }

  return {
    currentPage: pickValue(paginator.current_page, paginator.currentPage, 1),
    lastPage: pickValue(paginator.last_page, paginator.lastPage, 1),
    perPage: pickValue(paginator.per_page, paginator.perPage, 0),
    total: pickValue(paginator.total, 0),
    from: pickValue(paginator.from, 0),
    to: pickValue(paginator.to, 0),
    links: Array.isArray(paginator.links) ? paginator.links : [],
    nextPageUrl: pickValue(paginator.next_page_url, paginator.nextPageUrl, null),
    prevPageUrl: pickValue(paginator.prev_page_url, paginator.prevPageUrl, null),
  };
};

const extractItemData = (payload) => {
  if (payload?.data?.data && typeof payload.data.data === "object") {
    return payload.data.data;
  }
  if (payload?.data && typeof payload.data === "object") {
    return payload.data;
  }
  if (payload && typeof payload === "object") {
    return payload;
  }
  return {};
};

const normalizeUser = (item) => {
  const safeItem = item ?? {};

  return {
    id: pickValue(safeItem.id, safeItem.user_id),
    nip: String(pickValue(safeItem.nip, safeItem.no_induk, "")).trim(),
    nama: String(
      pickValue(
        safeItem.nama,
        safeItem.name,
        safeItem.nama_lengkap,
        safeItem.username,
        "",
      ),
    ).trim(),
    satuan: String(
      pickValue(
        safeItem.satuan,
        safeItem.unit?.nama,
        safeItem.unit_type?.nama,
        safeItem.unitType?.nama,
        safeItem.unit_name,
        safeItem.unit_type_name,
        safeItem.bagian,
        "-",
      ),
    ).trim(),
    email: String(pickValue(safeItem.email, "")).trim(),
    username: String(pickValue(safeItem.username, "")).trim(),
    jenisKelamin: String(
      pickValue(safeItem.jenis_kelamin, safeItem.jenisKelamin, ""),
    ).trim(),
    jenis_kelamin: String(
      pickValue(safeItem.jenis_kelamin, safeItem.jenisKelamin, ""),
    ).trim(),
    foto: pickValue(safeItem.foto, null),
    role: String(pickValue(safeItem.role, "")).trim(),
    jabatanId: pickValue(
      safeItem.jabatan_id,
      safeItem.jabatanId,
      safeItem.position?.id,
      safeItem.jabatan?.id,
    ),
    jabatan_id: pickValue(
      safeItem.jabatan_id,
      safeItem.jabatanId,
      safeItem.position?.id,
      safeItem.jabatan?.id,
    ),
    jabatan: String(
      pickValue(
        safeItem.jabatan?.nama,
        safeItem.jabatan,
        safeItem.position?.nama,
        safeItem.position_name,
        "",
      ),
    ).trim(),
    position: safeItem.position ?? null,
    unitId: pickValue(
      safeItem.unit_id,
      safeItem.unitId,
      safeItem.unit?.id,
      safeItem.unit_type?.id,
      safeItem.unitType?.id,
    ),
    unit_id: pickValue(
      safeItem.unit_id,
      safeItem.unitId,
      safeItem.unit?.id,
      safeItem.unit_type?.id,
      safeItem.unitType?.id,
    ),
    unit: safeItem.unit ?? safeItem.unit_type ?? safeItem.unitType ?? null,
    createdAt: pickValue(safeItem.created_at, safeItem.createdAt, null),
    created_at: pickValue(safeItem.created_at, safeItem.createdAt, null),
    updatedAt: pickValue(safeItem.updated_at, safeItem.updatedAt, null),
    updated_at: pickValue(safeItem.updated_at, safeItem.updatedAt, null),
  };
};

const buildUserPayload = (payload = {}) => ({
  nip: String(pickValue(payload.nip, "")).trim(),
  username: String(
    pickValue(payload.username, payload.nama, payload.name, payload.nama_lengkap, ""),
  ).trim(),
  email: String(pickValue(payload.email, "")).trim(),
  password: pickValue(payload.password),
  jabatan_id: pickValue(payload.jabatan_id, payload.jabatanId),
  unit_id: pickValue(
    payload.unit_id,
    payload.unitId,
    payload.unit_type_id,
    payload.unitTypeId,
  ),
  jenis_kelamin: pickValue(payload.jenis_kelamin, payload.jenisKelamin),
  role: pickValue(payload.role),
});

export const listUsersPaginated = async (params = {}) => {
  const response = await apiClient.get("/users", { params });
  const users = extractListData(response.data).map(normalizeUser);

  return {
    users,
    data: users,
    pagination: extractPaginationData(response.data),
    success: Boolean(response.data?.success ?? true),
    message: String(pickValue(response.data?.message, "")).trim(),
  };
};

export const listUsers = async (params = {}) => {
  const { users } = await listUsersPaginated(params);
  return users;
};

export const getUserDetail = async (id) => {
  const response = await apiClient.get(`/users/${id}`);
  return normalizeUser(extractItemData(response.data));
};

export const createUser = async (payload = {}) => {
  const response = await apiClient.post("/users", buildUserPayload(payload));
  return normalizeUser(extractItemData(response.data));
};

export const updateUser = async (id, payload = {}) => {
  const body = buildUserPayload(payload);

  if (!body.password) {
    delete body.password;
  }

  const response = await apiClient.put(`/users/${id}`, body);
  return normalizeUser(extractItemData(response.data));
};

export const deleteUser = async (id) => {
  const response = await apiClient.delete(`/users/${id}`);
  return response.data;
};

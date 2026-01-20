/**
 * Tìm ID theo code hoặc name từ danh sách options
 * @param {Array} list - Danh sách options (departments/assetTypes)
 * @param {string} codeValue - Giá trị code
 * @param {string} nameValue - Giá trị name
 * @returns {string} - ID tìm được hoặc chuỗi rỗng
 */
export const findIdByCodeOrName = (list, codeValue, nameValue) => {
  if (!list || list.length === 0) return ''
  const found = list.find(
    (item) => String(item.code) === String(codeValue) || item.name === nameValue,
  )
  return found?.id || ''
}

/**
 * Map dữ liệu từ backend vào form
 * @param {Object} data - Dữ liệu từ backend
 * @param {Array} departments - Danh sách bộ phận
 * @param {Array} assetTypes - Danh sách loại tài sản
 * @param {Function} normalizeDate - Hàm normalize date
 * @returns {Object} - Form data đã map
 */
export const mapBackendDataToForm = (data, departments, assetTypes, normalizeDate) => {
  const departmentCode = data.department_code || data.departmentCode
  const departmentName = data.department_name || data.departmentName || ''

  let departmentIdRaw = data.department_id || data.departmentId
  if (!departmentIdRaw && (departmentCode || departmentName)) {
    departmentIdRaw = findIdByCodeOrName(departments, departmentCode, departmentName)
  }
  const departmentId = departmentIdRaw || ''

  const assetTypeCode =
    data.fixed_asset_category_code || data.fixedAssetCategoryCode || data.assetTypeCode
  const assetTypeName =
    data.fixed_asset_category_name || data.assetTypeName || data.assetCategoryName || ''

  let assetTypeIdRaw = data.fixed_asset_category_id || data.assetTypeId
  if (!assetTypeIdRaw && (assetTypeCode || assetTypeName)) {
    assetTypeIdRaw = findIdByCodeOrName(assetTypes, assetTypeCode, assetTypeName)
  }
  const assetTypeId = assetTypeIdRaw || ''

  const purchaseDateFormatted = normalizeDate(data.purchase_date || '')
  const usedStartDateFormatted = normalizeDate(data.used_start_date || '')
  const usedStartDateFinal = usedStartDateFormatted || purchaseDateFormatted || ''

  return {
    id: data.id || data.fixed_asset_id,
    fixed_asset_id: data.fixed_asset_id || data.id,
    assetCode: data.fixed_asset_code || data.assetCode || '',
    assetName: data.fixed_asset_name || data.assetName || '',
    assetTypeId,
    assetTypeName,
    departmentId,
    departmentName,
    quantity: data.quantity || 1,
    cost: data.cost || 0,
    depreciationRate: data.depreciation_rate || 0,
    purchaseDate: purchaseDateFormatted,
    usedStartDate: usedStartDateFinal,
    trackedYear: data.tracked_year || new Date().getFullYear(),
    lifeTime: data.life_time || 0,
    depreciationValueYear: data.depreciation_value_year || 0,
  }
}

/**
 * Map dữ liệu từ form để gửi lên backend
 * @param {Object} form - Form data
 * @returns {Object} - Data để gửi lên backend
 */
export const mapFormToBackendData = (form) => {
  return {
    fixed_asset_code: form.assetCode,
    fixed_asset_name: form.assetName,
    department_id: form.departmentId,
    department_name: form.departmentName,
    fixed_asset_category_id: form.assetTypeId,
    fixed_asset_category_name: form.assetTypeName,
    quantity: form.quantity,
    cost: form.cost,
    depreciation_rate: form.depreciationRate,
    purchase_date: form.purchaseDate,
    used_start_date: form.usedStartDate,
    tracked_year: form.trackedYear,
    life_time: form.lifeTime,
    depreciation_value_year: form.depreciationValueYear,
  }
}

/**
 * Validate form tài sản
 * @param {Object} form - Form data
 * @returns {Object} - Object chứa errors và isValid
 */
export const validateAssetForm = (form) => {
  let isValid = true
  const errors = {
    assetCode: '',
    assetName: '',
    departmentId: '',
    assetTypeId: '',
    quantity: '',
    cost: '',
    depreciationRate: '',
    purchaseDate: '',
    usedStartDate: '',
    lifeTime: '',
    depreciationValueYear: '',
  }

  if (!form.assetCode?.trim()) {
    errors.assetCode = 'Mã tài sản không được để trống'
    isValid = false
  }

  if (!form.assetName?.trim()) {
    errors.assetName = 'Tên tài sản không được để trống'
    isValid = false
  }

  if (!form.departmentId) {
    errors.departmentId = 'Bộ phận sử dụng không được để trống'
    isValid = false
  }

  if (!form.assetTypeId) {
    errors.assetTypeId = 'Loại tài sản không được để trống'
    isValid = false
  }

  if (!form.quantity || form.quantity <= 0) {
    errors.quantity = 'Số lượng phải lớn hơn 0'
    isValid = false
  }

  if (form.cost < 0) {
    errors.cost = 'Nguyên giá không được âm'
    isValid = false
  }

  if (form.depreciationRate < 0 || form.depreciationRate > 100) {
    errors.depreciationRate = 'Tỷ lệ hao mòn phải từ 0-100%'
    isValid = false
  }

  if (!form.purchaseDate) {
    errors.purchaseDate = 'Ngày mua không được để trống'
    isValid = false
  }

  if (!form.usedStartDate) {
    errors.usedStartDate = 'Ngày bắt đầu sử dụng không được để trống'
    isValid = false
  }

  if (!form.lifeTime || form.lifeTime <= 0) {
    errors.lifeTime = 'Số năm sử dụng phải lớn hơn 0'
    isValid = false
  }

  if (form.depreciationValueYear < 0) {
    errors.depreciationValueYear = 'Giá trị hao mòn năm không được âm'
    isValid = false
  }

  return { errors, isValid }
}

/**
 * Event handler để chỉ cho phép nhập số
 * @param {Event} event - Keyboard event
 */
export const allowOnlyNumbers = (event) => {
  const charCode = event.which ? event.which : event.keyCode
  // Chỉ cho phép số (0-9)
  if (charCode < 48 || charCode > 57) {
    event.preventDefault()
  }
}

/**
 * Format số với dấu chấm phân cách hàng nghìn
 * @param {number|string} value - Giá trị cần format
 * @returns {string} - Chuỗi đã format (vd: 1.000.000)
 * Created by NVBan - 28/01/2026
 */
export const formatNumber = (value) => {
  if (!value && value !== 0) return ''
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/**
 * Parse số từ string có dấu chấm phân cách
 * @param {string} value - Chuỗi có dấu chấm (vd: 1.000.000)
 * @returns {number} - Số nguyên
 * Created by NVBan - 28/01/2026
 */
export const parseFormattedNumber = (value) => {
  if (!value) return 0
  return parseInt(value.replace(/\./g, '')) || 0
}

/**
 * Format tiền với đơn vị VNĐ
 * @param {number} value - Giá trị tiền
 * @returns {string} - Chuỗi đã format (vd: 1.000.000 VNĐ)
 * Created by NVBan - 28/01/2026
 */
export const formatMoney = (value) => {
  if (!value && value !== 0) return '0'
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/**
 * Chuẩn hoá ngày thành yyyy-MM-dd
 * @param {string|Date} value - Giá trị ngày
 * @returns {string} - Chuỗi ngày format yyyy-MM-dd
 * Created by NVBan - 28/01/2026
 */
export const normalizeDate = (value) => {
  if (!value) return ''
  // Nếu là string định dạng YYYY-MM-DD, trả về trực tiếp để tránh lệch timezone
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value
  }
  // Nếu là Date object hoặc string khác, convert sang Date
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  // Lấy các thành phần ngày tháng năm từ local time, không dùng UTC
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Format ngày theo định dạng DD/MM/YYYY
 * @param {string|Date} value - Giá trị ngày
 * @returns {string} - Chuỗi ngày format DD/MM/YYYY
 * Created by NVBan - 28/01/2026
 */
export const formatDate = (value) => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

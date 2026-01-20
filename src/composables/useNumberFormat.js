import { computed } from 'vue'
import { formatNumber, parseFormattedNumber } from '../utils/formatters'

/**
 * Composable để format số với dấu chấm phân cách hàng nghìn
 * @param {Ref} formRef - Ref object của form
 * @param {string} fieldName - Tên field cần format
 * @returns {Object} - Object chứa formattedValue và inputHandler
 */
export const useNumberFormat = (formRef, fieldName) => {
  const formattedValue = computed({
    get: () => formatNumber(formRef.value[fieldName]),
    set: (value) => {
      formRef.value[fieldName] = parseFormattedNumber(value)
    },
  })

  const handleInput = (event) => {
    const input = event.target.value
    // Chỉ cho phép số
    const cleaned = input.replace(/[^0-9]/g, '')
    formRef.value[fieldName] = parseInt(cleaned) || 0
  }

  return {
    formattedValue,
    handleInput,
  }
}

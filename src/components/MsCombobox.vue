<template>
  <div class="ms-combo-wrapper">
    <div v-if="label" class="ms-label">{{ label }}</div>
    <div class="ms-combo-container">
      <div v-if="icon" class="ms-combo-icon">
        <div :class="icon"></div>
      </div>

      <input
        type="text"
        class="ms-select"
        :class="{ 'has-icon': icon, open: isOpen }"
        :value="searchText"
        :placeholder="placeholder || 'Chọn giá trị'"
        @input="onSearch"
        @click="toggleDropdown"
        @keydown="onKeydown"
        @keydown.escape="isOpen = false"
      />

      <div class="ms-combo-arrow" @click="toggleDropdown">
        <div class="icon icon-caret-down"></div>
      </div>

      <!-- Custom Dropdown -->
      <div
        v-if="isOpen"
        class="ms-dropdown"
        :style="dropdownStyle"
        @click.stop
      >
        <div class="ms-dropdown-header">
          <div class="ms-dropdown-col">Mã</div>
          <div class="ms-dropdown-col">Tên</div>
        </div>
        <div v-if="filteredOptions.length > 0" class="ms-dropdown-body">
          <div
            v-for="(item, idx) in filteredOptions"
            :key="item[itemValue]"
            class="ms-dropdown-item"
            :class="{
              selected: modelValue == item[itemValue],
              highlighted: highlightedIndex === idx,
            }"
            @click="selectItem(item)"
          >
            <div class="ms-dropdown-col">{{ item[itemCode] }}</div>
            <div class="ms-dropdown-col">{{ item[itemText] }}</div>
          </div>
        </div>
        <div v-else class="ms-dropdown-empty">Không tìm thấy kết quả</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  modelValue: [String, Number],
  label: String,
  icon: String,
  options: Array,

  itemText: { type: String, default: 'name' },
  itemCode: { type: String, default: 'code' },
  itemValue: { type: String, default: 'id' },

  placeholder: String,

  /** MỚI */
  displayMode: {
    type: String,
    default: 'text', // 'text' | 'code'
  },
  filterBy: {
    type: String,
    default: 'text', // 'text' | 'code' | 'both'
  },
})

const emit = defineEmits(['update:modelValue', 'dropdown-opened'])

const isOpen = ref(false)
const searchText = ref('')
const highlightedIndex = ref(-1) // index mục được highlight khi dùng phím

const selectedItem = computed(() =>
  props.options?.find((item) => {
    // So sánh lỏng lẻo để hỗ trợ cả String và Number
    return item[props.itemValue] == props.modelValue
  }),
)

/**
 * LỌC – chỉ theo tên nếu filterBy = text
 */
const filteredOptions = computed(() => {
  if (!searchText.value.trim()) return props.options || []

  const keyword = searchText.value.toLowerCase()

  return (
    props.options?.filter((item) => {
      if (props.filterBy === 'text') {
        return item[props.itemText]?.toLowerCase().includes(keyword)
      }
      if (props.filterBy === 'code') {
        return item[props.itemCode]?.toLowerCase().includes(keyword)
      }
      return (
        item[props.itemText]?.toLowerCase().includes(keyword) ||
        item[props.itemCode]?.toLowerCase().includes(keyword)
      )
    }) || []
  )
})

/**
 * Gõ tìm kiếm
 */
const onSearch = (e) => {
  searchText.value = e.target.value

  // Nếu ô lọc trống → xóa lựa chọn để quay lại danh sách ban đầu
  if (!searchText.value.trim()) {
    emit('update:modelValue', null)
  }

  if (!isOpen.value) {
    isOpen.value = true
  }

  highlightedIndex.value = filteredOptions.value.length ? 0 : -1
}

/**
 * Toggle dropdown
 */
const toggleDropdown = () => {
  if (!isOpen.value) {
    // Phát event khi mở dropdown để các combobox khác đóng lại
    emit('dropdown-opened')
    isOpen.value = true
    searchText.value = ''
    highlightedIndex.value = filteredOptions.value.length ? 0 : -1
  } else {
    isOpen.value = false
  }
  if (!searchText.value.trim()) {
    emit('update:modelValue', null)
  }
}

/**
 * ✅ Chọn item
 */
const selectItem = (item) => {
  emit('update:modelValue', item[props.itemValue])

  // Sau khi chọn → hiển thị theo mode
  searchText.value = props.displayMode === 'code' ? item[props.itemCode] : item[props.itemText]

  isOpen.value = false
  highlightedIndex.value = -1
}

/**
 * Khi modelValue đổi từ bên ngoài
 */
watch(selectedItem, (item) => {
  if (!item) {
    searchText.value = ''
    highlightedIndex.value = -1
    return
  }

  searchText.value = props.displayMode === 'code' ? item[props.itemCode] : item[props.itemText]
})

/**
 * Khi modelValue hoặc options thay đổi - sync searchText
 */
watch(
  [() => props.modelValue, () => props.options],
  () => {
    const item = props.options?.find((opt) => opt[props.itemValue] == props.modelValue)
    if (item) {
      searchText.value = props.displayMode === 'code' ? item[props.itemCode] : item[props.itemText]
      highlightedIndex.value = filteredOptions.value.findIndex(
        (opt) => opt[props.itemValue] == item[props.itemValue],
      )
    } else {
      searchText.value = ''
      highlightedIndex.value = -1
    }
  },
  { immediate: true },
)

/**
 * Click ngoài
 */
const closeDropdown = (e) => {
  if (!e.target.closest('.ms-combo-wrapper')) {
    isOpen.value = false
    highlightedIndex.value = -1
  }
}

/**
 * Điều hướng bàn phím trong dropdown
 */
const onKeydown = (e) => {
  if (!isOpen.value && ['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key)) {
    isOpen.value = true
    highlightedIndex.value = filteredOptions.value.length ? 0 : -1
    return
  }

  if (!isOpen.value) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    const next = highlightedIndex.value + 1
    if (next < filteredOptions.value.length) {
      highlightedIndex.value = next
      scrollHighlightedIntoView()
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    const prev = highlightedIndex.value - 1
    if (prev >= 0) {
      highlightedIndex.value = prev
      scrollHighlightedIntoView()
    }
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (highlightedIndex.value >= 0 && highlightedIndex.value < filteredOptions.value.length) {
      selectItem(filteredOptions.value[highlightedIndex.value])
    }
  }
}

const scrollHighlightedIntoView = () => {
  requestAnimationFrame(() => {
    const dropdown = document.querySelector('.ms-dropdown-body')
    if (!dropdown) return
    const items = dropdown.querySelectorAll('.ms-dropdown-item')
    const el = items[highlightedIndex.value]
    if (!el) return
    const { offsetTop, offsetHeight } = el
    const { scrollTop, clientHeight } = dropdown
    const visibleTop = scrollTop
    const visibleBottom = scrollTop + clientHeight
    if (offsetTop < visibleTop) {
      dropdown.scrollTop = offsetTop
    } else if (offsetTop + offsetHeight > visibleBottom) {
      dropdown.scrollTop = offsetTop + offsetHeight - clientHeight
    }
  })
}

onMounted(() => document.addEventListener('click', closeDropdown))
onUnmounted(() => document.removeEventListener('click', closeDropdown))
</script>

<style scoped>
.ms-combo-wrapper {
  position: relative;
  min-width: 200px;
}
.ms-combo-container {
  position: relative;
}
.ms-select {
  width: 100%;
  height: 36px;
  border-radius: 3px;
  border: 1px solid #afafaf;
  padding: 0 12px;
  padding-right: 30px;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 13px;
  font-family: inherit;
}
.ms-select.has-icon {
  padding-left: 36px;
}
.ms-select:hover,
.ms-select:focus,
.ms-select.open {
  border-color: #1aa1ff;
  outline: none;
}
.ms-select::placeholder {
  color: var(--placeholder-color, #999);
}
.ms-combo-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  z-index: 1;
}
.ms-combo-arrow {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  cursor: pointer;
  z-index: 1;
}

/* Dropdown */
.ms-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;
  max-height: 300px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 3px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.ms-dropdown-header {
  display: flex;
  background: #82beff;
  color: black;
  font-weight: 600;
  font-size: 13px;
  padding: 8px 12px;
  margin: 2px 4px;
  border-radius: 3px;
  border-bottom: none;
  align-items: center;
  gap: 12px;
}
.ms-dropdown-header .ms-dropdown-col:first-child {
  width: 40px;
  flex-shrink: 0;
  text-align: center;
}
.ms-dropdown-header .ms-dropdown-col:last-child {
  flex: 1;
  text-align: left;
}
.ms-dropdown-body {
  overflow-y: auto;
  max-height: 280px;
  scrollbar-width: thin;
  scrollbar-color: #c0c0c0 #f5f5f5;
}

/* Scrollbar styling cho Chrome, Edge, Safari */
.ms-dropdown-body::-webkit-scrollbar {
  width: 8px;
}

.ms-dropdown-body::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 4px;
}

.ms-dropdown-body::-webkit-scrollbar-thumb {
  background: #c0c0c0;
  border-radius: 4px;
}

.ms-dropdown-body::-webkit-scrollbar-thumb:hover {
  background: #a0a0a0;
}
.ms-dropdown-item {
  display: flex;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 13px;
  border-bottom: 1px solid #f0f0f0;
  margin: 0 4px;
  border-radius: 3px;
  align-items: center;
  gap: 12px;
}
.ms-dropdown-item.highlighted {
  background: #f0f7ff;
  border: 1px solid #b3d7ff;
}
.ms-dropdown-item:hover {
  background: #e6f2ff;
}
.ms-dropdown-item.selected {
  background: #cce5ff;
}
.ms-dropdown-item .ms-dropdown-col:first-child {
  width: 40px;
  flex-shrink: 0;
  font-weight: 500;
  text-align: center;
}
.ms-dropdown-item .ms-dropdown-col:last-child {
  flex: 1;
  color: #333;
  text-align: left;
}

/* Truncate long text with ellipsis but keep full content in DOM */
.ms-dropdown-col {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ms-dropdown-item .ms-dropdown-col:last-child {
  flex: 1;
  color: #333;
}
.ms-dropdown-empty {
  padding: 12px;
  text-align: center;
  color: #999;
  font-size: 13px;
}
</style>

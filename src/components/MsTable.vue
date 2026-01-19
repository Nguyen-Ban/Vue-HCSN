<template>
  <div class="ms-grid-container">
    <div class="ms-table-scroll" ref="bodyScroll" @scroll="syncFooterScroll">
      <table>
        <colgroup>
          <col style="width: 40px" />
          <col v-for="col in columns" :key="col.key" :style="{ width: getColWidth(col) }" />
          <col style="width: 100px" />
        </colgroup>
        <thead>
          <tr>
            <th class="ms-th-checkbox">
              <input type="checkbox" @change="toggleAll" :checked="isAllSelected" />
            </th>

            <th
              v-for="(col, index) in columns"
              :key="col.key"
              :style="getThStyle(col, index)"
              :class="{ 'sticky-col': col.sticky }"
            >
              <span class="th-text">{{ col.title }}</span>
              <span class="col-resizer" @mousedown.prevent="startResize($event, col)"></span>
            </th>

            <th class="ms-th-action sticky-col-right" style="text-align: center">Chức năng</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in data"
            :key="row.id || index"
            @contextmenu.prevent="onRowContextMenu($event, row)"
          >
            <td class="ms-td-checkbox">
              <input type="checkbox" v-model="selectedRows" :value="row.id" />
            </td>

            <td
              v-for="(col, index) in columns"
              :key="col.key"
              :style="getTdStyle(col, index)"
              :class="{ 'sticky-col': col.sticky }"
            >
              <slot :name="col.key" :row="row" :value="row[col.key]">
                {{ formatData(row[col.key], col.type) }}
              </slot>
            </td>

            <td class="ms-td-action sticky-col-right">
              <div class="action-group">
                <slot name="action" :row="row"></slot>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="ms-table-footer">
      <div class="ms-table-footer-scroll" ref="footerScroll">
        <div class="ms-table-footer-content">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'

const props = defineProps({
  columns: Array, // [{ key: 'assetCode', title: 'Mã tài sản', align: 'left', width: '100px' }]
  data: Array,
  // Cho phép parent bind v-model:selected để nhận danh sách ID các dòng được chọn
  selected: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:selected', 'row-contextmenu', 'column-width-change'])

const selectedRows = ref([]) // Chứa ID các dòng được chọn
const bodyScroll = ref(null)
const footerScroll = ref(null)
const widths = ref({})

// Logic chọn tất cả
const isAllSelected = computed(() => {
  return props.data.length > 0 && selectedRows.value.length === props.data.length
})
const toggleAll = (e) => {
  if (e.target.checked) selectedRows.value = props.data.map((i) => i.id)
  else selectedRows.value = []
  emit('update:selected', selectedRows.value)
}

// Đồng bộ từ prop selected xuống local và ngược lại khi thay đổi
watch(
  () => props.selected,
  (val) => {
    selectedRows.value = Array.isArray(val) ? [...val] : []
  },
  { immediate: true, deep: true },
)

watch(selectedRows, (val) => {
  emit('update:selected', val)
})

// Hàm format đơn giản (nếu không dùng slot)
const formatData = (val, type) => {
  if (type === 'number') return new Intl.NumberFormat('vi-VN').format(val)
  return val
}

// Hàm tính toán sticky position
const getThStyle = (col, index) => {
  const baseStyle = { textAlign: col.align || 'left', width: getColWidth(col) }
  if (!col.sticky) return baseStyle

  let leftPos = 40 // checkbox width
  for (let i = 0; i < index; i++) {
    const w = props.columns[i].width
    leftPos += parseInt(w)
  }

  return {
    ...baseStyle,
    position: 'sticky',
    left: leftPos + 'px',
    zIndex: 9,
    backgroundColor: '#f5f5f5',
  }
}

const getTdStyle = (col, index) => {
  const baseStyle = { textAlign: col.align || 'left', width: getColWidth(col) }
  if (!col.sticky) return baseStyle

  let leftPos = 40 // checkbox width
  for (let i = 0; i < index; i++) {
    const w = props.columns[i].width
    leftPos += parseInt(w)
  }

  return {
    ...baseStyle,
    position: 'sticky',
    left: leftPos + 'px',
    backgroundColor: '#fff',
    zIndex: 2,
  }
}

// Đồng bộ cuộn ngang giữa phần thân bảng và footer tổng
const syncFooterScroll = () => {
  if (!bodyScroll.value || !footerScroll.value) return
  footerScroll.value.scrollLeft = bodyScroll.value.scrollLeft
}

onMounted(() => {
  nextTick(syncFooterScroll)
})

// Phát sự kiện contextmenu khi người dùng chuột phải vào một dòng
const onRowContextMenu = (e, row) => {
  emit('row-contextmenu', { x: e.clientX, y: e.clientY, row })
}

// --- Column resize ---
const getColWidth = (col) => {
  const current = widths.value[col.key]
  return current ? current + 'px' : col.width || '120px'
}

const startResize = (e, col) => {
  const startX = e.clientX
  const startWidth = widths.value[col.key] || parseInt(col.width) || 120

  const onMove = (evt) => {
    const delta = evt.clientX - startX
    const newWidth = Math.max(60, startWidth + delta)
    widths.value = { ...widths.value, [col.key]: newWidth }
  }

  const onUp = () => {
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
    const finalWidth = widths.value[col.key] || startWidth
    emit('column-width-change', { key: col.key, width: finalWidth })
  }

  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}

watch(
  () => props.columns,
  (cols) => {
    const next = { ...widths.value }
    cols?.forEach((c) => {
      if (!next[c.key]) {
        const num = parseInt(c.width)
        if (!isNaN(num)) next[c.key] = num
      }
    })
    widths.value = next
  },
  { immediate: true, deep: true },
)
</script>

<style scoped>
.ms-grid-container {
  border: 1px solid #afafaf;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  font-size: 13px;
}
.ms-table-scroll {
  overflow: auto;
  flex: 1;
  min-height: 0;
  width: 100%;
  box-sizing: border-box;
}
table {
  border-collapse: collapse;
  width: 100%;
  table-layout: fixed;
}
th {
  background-color: #f5f5f5;
  font-weight: 700;
  padding: 10px 0px;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid #e0e0e0;
  box-sizing: border-box;
}
th .th-text {
  display: inline-block;
  vertical-align: middle;
  max-width: calc(100% - 8px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
th .col-resizer {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  cursor: col-resize;
  z-index: 15;
}
td {
  padding: 5px 0px;
  border-bottom: 1px solid #e0e0e0;
  box-sizing: border-box;
}

/* Truncate overflowing text with ellipsis while keeping full content in DOM */
:deep(td):not(.ms-td-action):not(.ms-td-checkbox) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(td):not(.ms-td-action):not(.ms-td-checkbox) > * {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(td):not(.ms-td-action):not(.ms-td-checkbox) > * > * {
  display: inline;
}
tr:hover {
  background-color: #f2f9ff; /* Hover màu xanh nhạt theo style MISA */
}
.ms-th-checkbox,
.ms-td-checkbox {
  width: 40px;
  text-align: center;
}

/* Custom Checkbox Styling */
.ms-th-checkbox input[type='checkbox'],
.ms-td-checkbox input[type='checkbox'] {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  width: 14px;
  height: 14px;
  border: 1.5px solid #1f1f1f;
  border-radius: 2px;
  background-color: #fff;
  cursor: pointer;
  position: relative;
  transition: all 0.15s ease;
  vertical-align: middle;
}

/* Hover state - unchecked */
.ms-th-checkbox input[type='checkbox']:hover,
.ms-td-checkbox input[type='checkbox']:hover {
  border-color: #0075c0;
  box-shadow: 0 0 0 6px #e6f2ff;
}

/* Checked state */
.ms-th-checkbox input[type='checkbox']:checked,
.ms-td-checkbox input[type='checkbox']:checked {
  background-color: #00bfff;
  border-color: #00bfff;
}

/* Checkmark icon */
.ms-th-checkbox input[type='checkbox']:checked::before,
.ms-td-checkbox input[type='checkbox']:checked::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  background-color: #fff;
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='white' d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z'/%3E%3C/svg%3E");
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
}

/* Hover state - checked */
.ms-th-checkbox input[type='checkbox']:checked:hover,
.ms-td-checkbox input[type='checkbox']:checked:hover {
  background-color: #00a8e6;
  border-color: #00a8e6;
  box-shadow: 0 0 0 1px #b3e5fc;
}
.action-group {
  display: flex;
  justify-content: center;
  gap: 8px;
}

/* Cố định cột chức năng ở phía phải khi cuộn ngang */
th.sticky-col-right {
  position: sticky;
  right: 0;
  z-index: 12; /* cao hơn các th khác */
  background-color: #f5f5f5;
  box-shadow: -4px 0 6px rgba(0, 0, 0, 0.06); /* viền mờ bên trái */
}
td.sticky-col-right {
  position: sticky;
  right: 0;
  z-index: 3; /* cao hơn các ô thường */
  background-color: #fff;
  box-shadow: -4px 0 6px rgba(0, 0, 0, 0.04);
}

.ms-table-footer {
  height: auto;
  display: flex;
  align-items: center;
  padding: 0;
  flex-shrink: 0;
}

.ms-table-footer-scroll {
  width: 100%;
  overflow: hidden;
}

.ms-table-footer-content {
  min-width: max-content;
  display: inline-block;
}

tfoot {
  background-color: #fafafa;
}

tfoot tr {
  border-bottom: none;
}

:deep(tfoot td) {
  border-bottom: none !important;
}

tfoot td {
  padding: 10px 16px !important;
  font-weight: 500;
  text-align: right;
}

tfoot td:first-child {
  text-align: left;
}
</style>

<template>
  <div class="page-container">
    <div class="page-toolbar">
      <div class="toolbar-left">
        <MsInput
          v-model="searchText"
          placeholder="Tìm kiếm tài sản"
          icon="icon icon-search"
          style="width: 180px; margin-bottom: 0"
        />

        <MsCombobox
          v-model="selectedAssetType"
          :options="assetTypes"
          itemValue="id"
          itemCode="code"
          itemText="name"
          placeholder="Loại tài sản"
          icon="icon icon-filter"
          style="width: 220px; --placeholder-color: #1f1f1f"
        />

        <MsCombobox
          v-model="selectedDepartment"
          :options="departments"
          itemValue="id"
          itemCode="code"
          itemText="name"
          placeholder="Bộ phận sử dụng"
          icon="icon icon-filter"
          style="width: 220px; --placeholder-color: #1f1f1f"
        />
      </div>

      <div class="toolbar-right">
        <MsButton type="primary" icon="icon icon-plus" positionIcon="left" @click="openAddModal">
          Thêm tài sản
        </MsButton>

        <div class="action-tools">
          <button class="tool-btn shadow-btn" title="Xuất Excel">
            <div class="icon icon-file-excel"></div>
          </button>
          <button
            class="tool-btn shadow-btn btn-delete-tool"
            title="Xóa"
            @click="confirmDeleteSelected"
          >
            <div class="icon icon-trash"></div>
          </button>
        </div>
      </div>
    </div>

    <MsTable
      :columns="tableColumns"
      :data="assetData"
      v-model:selected="selectedAssetIds"
      @row-contextmenu="onRowContextMenu"
      @column-width-change="onColumnWidthChange"
    >
      <template #cost="{ value }">
        <div style="text-align: right">{{ formatMoney(value) }}</div>
      </template>

      <template #accumulatedDepreciation="{ value }">
        <div style="text-align: right">{{ formatMoney(value) }}</div>
      </template>

      <template #remainingValue="{ value }">
        <div style="text-align: right">{{ formatMoney(value) }}</div>
      </template>

      <template #action="{ row }">
        <button class="action-btn edit" title="Sửa" @click="editAsset(row)">
          <div class="icon icon-pencil"></div>
        </button>
        <button class="action-btn duplicate" title="Nhân bản" @click="duplicateAsset(row)">
          <div class="icon icon-clone"></div>
        </button>
      </template>

      <template #footer>
        <table
          :style="{
            width: footerTableWidth + 'px',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
          }"
        >
          <colgroup>
            <col style="width: 40px" />
            <col v-for="col in tableColumns" :key="col.key" :style="{ width: col.width }" />
            <col style="width: 100px" />
          </colgroup>
          <tfoot>
            <tr>
              <td
                colspan="6"
                style="
                  text-align: left;
                  padding: 10px 16px;
                  border-bottom: 1px solid #e0e0e0;
                  vertical-align: middle;
                "
              >
                <div style="display: flex; align-items: center; gap: 32px">
                  <span style="white-space: nowrap; font-size: 11px">
                    Tổng số: <strong>{{ totalRecords }}</strong> bản ghi
                  </span>
                  <div class="ms-select-wrapper">
                    <select v-model="pageSize" class="ms-page-size-select">
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                    </select>
                    <div class="icon-arrow-down"></div>
                  </div>

                  <span style="display: inline-flex; align-items: center; gap: 4px">
                    <button
                      class="ms-page-btn"
                      :disabled="!canPrev"
                      @click="goToPage(currentPage - 1)"
                    >
                      <div class="icon icon-arrow-pag-left"></div>
                    </button>
                    <template v-for="btn in pageButtons" :key="btn">
                      <span v-if="typeof btn === 'string'" class="ms-page-dots">...</span>
                      <button
                        v-else
                        class="ms-page-number"
                        :class="{ active: currentPage === btn }"
                        @click="goToPage(btn)"
                      >
                        {{ btn }}
                      </button>
                    </template>
                    <button
                      class="ms-page-btn"
                      :disabled="!canNext"
                      @click="goToPage(currentPage + 1)"
                    >
                      <div class="icon icon-arrow-pag-right"></div>
                    </button>
                  </span>
                </div>
              </td>
              <td
                style="
                  text-align: right;
                  padding: 10px 10px;
                  border-bottom: 1px solid #e0e0e0;
                  font-weight: 700;
                "
              >
                {{ totals.quantity }}
              </td>
              <td
                style="
                  text-align: right;
                  padding: 10px 10px;
                  border-bottom: 1px solid #e0e0e0;
                  font-weight: 700;
                "
              >
                {{ formatMoney(totals.cost) }}
              </td>
              <td
                style="
                  text-align: right;
                  padding: 10px 10px;
                  border-bottom: 1px solid #e0e0e0;
                  font-weight: 700;
                "
              >
                {{ formatMoney(totals.accumulatedDepreciation) }}
              </td>
              <td
                style="
                  text-align: right;
                  padding: 10px 0px;
                  border-bottom: 1px solid #e0e0e0;
                  font-weight: 700;
                "
              >
                {{ formatMoney(totals.remainingValue) }}
              </td>
              <td
                style="text-align: right; padding: 10px 10px; border-bottom: 1px solid #e0e0e0"
              ></td>
              <td
                style="text-align: right; padding: 10px 10px; border-bottom: 1px solid #e0e0e0"
              ></td>
              <td
                style="
                  text-align: right;
                  padding: 10px 10px;
                  border-bottom: 1px solid #e0e0e0;
                  font-weight: 700;
                "
              >
                {{ formatMoney(totals.depreciationValueYear) }}
              </td>

              <td style="padding: 10px 10px; border-bottom: 1px solid #e0e0e0"></td>
            </tr>
          </tfoot>
        </table>
      </template>
    </MsTable>

    <!-- Context Menu for row actions -->
    <div v-if="rowMenu.visible" class="context-menu-mask" @click="hideRowMenu"></div>
    <div
      v-if="rowMenu.visible"
      class="context-menu"
      :style="{ top: rowMenu.y + 'px', left: rowMenu.x + 'px' }"
    >
      <div class="menu-item" @click="handleMenuAdd">
        <span class="icon icon-plus"></span>
        <span>Thêm</span>
      </div>
      <div class="menu-item" @click="handleMenuEdit">
        <span class="icon icon-pencil"></span>
        <span>Sửa</span>
      </div>
      <div class="menu-item" @click="handleMenuDelete">
        <span class="icon icon-trash"></span>
        <span>Xóa</span>
      </div>
      <div class="menu-item" @click="handleMenuDuplicate">
        <span class="icon icon-clone"></span>
        <span>Nhân bản</span>
      </div>
    </div>

    <!-- Asset Form Dialog -->
    <AssetForm
      v-model="showDialog"
      :mode="dialogMode"
      :initial-data="formData"
      :departments="departments"
      :asset-types="assetTypes"
      @save="handleSaveAsset"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import fixedAssetApi from '../../apis/fixedAssetApi'
import fixedAssetCategoryApi from '../../apis/fixedAssetCategoryApi'
import departmentApi from '../../apis/departmentApi'
import MsButton from '../../components/MsButton.vue'
import MsInput from '../../components/MsInput.vue'
import MsCombobox from '../../components/MsCombobox.vue'
import MsTable from '../../components/MsTable.vue'
import AssetForm from './AssetForm.vue'
import { showDeleteConfirm, showToast } from '../../stores/notification'
import { formatMoney } from '../../utils/formatters'

// Debounce helper
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// --- State ---
const searchText = ref('')
const selectedAssetType = ref('')
const selectedDepartment = ref('')
const pageSize = ref(20)
const currentPage = ref(1)
const totalRecords = ref(200)
const totalPages = computed(() => Math.max(1, Math.ceil(totalRecords.value / pageSize.value)))
const canPrev = computed(() => currentPage.value > 1)
const canNext = computed(() => currentPage.value < totalPages.value)
const pageButtons = computed(() => {
  const pages = []
  const total = totalPages.value
  const cur = currentPage.value

  // Chỉ hiển thị toàn bộ số nếu trang <= 4
  if (total <= 4) {
    for (let i = 1; i <= total; i++) pages.push(i)
    return pages
  }

  // Format: < 1 2 ... 5 6 > khi có nhiều trang
  pages.push(1, 2)

  if (cur > 3) pages.push('...')

  const start = Math.max(3, cur - 1)
  const end = Math.min(total - 2, cur + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (cur < total - 2) pages.push('...')

  pages.push(total - 1, total)
  return pages.filter((v, idx, arr) => arr.indexOf(v) === idx)
})

// --- Modal State ---
const showDialog = ref(false)
const dialogMode = ref('add') // 'add' hoặc 'edit'
const formData = ref({
  assetCode: '',
  assetName: '',
  assetTypeId: '',
  assetTypeName: '',
  departmentId: '',
  departmentName: '',
  quantity: 1,
  cost: 0,
  depreciationRate: 0,
  purchaseDate: '',
  startUsingDate: '',
  trackedYear: new Date().getFullYear(),
  productionYear: 0,
  lifeTime: 0,
  depreciationValueYear: 0,
})

// --- Mock Data Options ---
const assetTypes = ref([])

const departments = ref([])

// --- Table Configuration ---
const tableColumns = ref([
  { key: 'stt', title: 'STT', width: '55px', align: 'center'},
  { key: 'assetCode', title: 'Mã tài sản', width: '180px' },
  { key: 'assetName', title: 'Tên tài sản', width: '200px' },
  { key: 'assetTypeName', title: 'Loại tài sản', width: '250px' },
  { key: 'departmentName', title: 'Bộ phận sử dụng', width: '250px' },
  { key: 'quantity', title: 'Số lượng', width: '100px', align: 'right', type: 'number' },
  { key: 'cost', title: 'Nguyên giá', width: '180px', align: 'right' },
  { key: 'accumulatedDepreciation', title: 'HM/KH lũy kế', width: '180px', align: 'right' },
  { key: 'remainingValue', title: 'Giá trị còn lại', width: '140px', align: 'right' },
  { key: 'productionYear', title: 'Năm sử dụng', width: '100px', align: 'right' },
  { key: 'depreciationRate', title: 'Tỷ lệ hao mòn (%)', width: '120px', align: 'right' },
  { key: 'depreciationValueYear', title: 'Giá trị hao mòn năm', width: '150px', align: 'right' },
])

// --- Mock Data Rows ---
const assetData = ref([])
const selectedAssetIds = ref([])

// --- Row Context Menu State ---
const rowMenu = ref({ visible: false, x: 0, y: 0, row: null })

const onRowContextMenu = ({ x, y, row }) => {
  // Adjust if menu would overflow the viewport (basic guard)
  const padding = 8
  const menuWidth = 180
  const menuHeight = 160
  const vw = window.innerWidth
  const vh = window.innerHeight
  let nx = x
  let ny = y
  if (nx + menuWidth + padding > vw) nx = vw - menuWidth - padding
  if (ny + menuHeight + padding > vh) ny = vh - menuHeight - padding
  rowMenu.value = { visible: true, x: nx, y: ny, row }
}

const hideRowMenu = () => {
  rowMenu.value.visible = false
}

const onColumnWidthChange = ({ key, width }) => {
  tableColumns.value = tableColumns.value.map((col) =>
    col.key === key ? { ...col, width: width + 'px' } : col,
  )
}

// Map dữ liệu từ backend response về format frontend
const mapAssetData = (items, pageNumber, pageSizeValue) => {
  const startIndex = (pageNumber - 1) * pageSizeValue
  return items.map((item, index) => ({
    stt: startIndex + index + 1, // STT theo trang hiện tại
    id: item.fixed_asset_id || item.id,
    fixed_asset_id: item.fixed_asset_id || item.id,
    assetCode: item.fixed_asset_code || item.fixedAssetCode || '',
    assetName: item.fixed_asset_name || item.fixedAssetName || '',
    assetTypeId: item.fixed_asset_category_id || item.fixedAssetCategoryId || '',
    assetTypeName:
      item.fixed_asset_category_name || item.assetCategoryName || item.assetTypeName || '',
    departmentId: item.department_id || item.departmentId || '',
    departmentName: item.department_name || item.departmentName || '',
    quantity: item.quantity || 1,
    cost: item.cost || 0,
    depreciationRate: item.depreciation_rate || 0,
    purchaseDate: item.purchase_date || '',
    startUsingDate: item.start_using_date || '',
    trackedYear: item.tracked_year || new Date().getFullYear(),
    lifeTime: item.life_time || 0,
    depreciationValueYear: item.depreciation_value_year || 0,
    accumulatedDepreciation: item.accumulated_depreciation || 0,
    remainingValue: (item.cost || 0) - (item.accumulated_depreciation || 0),
    productionYear: item.tracked_year || new Date().getFullYear(),
  }))
}

const loadData = async () => {
  try {
    const pageSizeValue = parseInt(pageSize.value) || 20
    // Call filter API với paging và filters
    const response = await fixedAssetApi.getByFilter(
      currentPage.value,
      pageSizeValue,
      searchText.value,
      selectedDepartment.value,
      selectedAssetType.value,
    )
    console.log('Response từ API (đã qua interceptor):', response)

    // Axios interceptor trả về response.data trực tiếp
    // Backend response: { totalRecords: 55, data: [...] }
    // Nên response ở đây chính là { totalRecords: 55, data: [...] }
    let totalRecordsValue = response?.totalRecords || response?.TotalRecords || 0
    let dataArray = response?.data || response?.Data || []

    console.log(
      'Extracted: totalRecordsValue =',
      totalRecordsValue,
      'dataArray.length =',
      dataArray.length,
    )

    assetData.value = mapAssetData(dataArray, currentPage.value, pageSizeValue)
    totalRecords.value = totalRecordsValue

    console.log(`Trang ${currentPage.value}: ${dataArray.length} items, Tổng: ${totalRecordsValue}`)
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu:', error)
    assetData.value = []
    totalRecords.value = 0
  }
}

const loadDepartments = async () => {
  try {
    const response = await departmentApi.getDepartments()
    console.log('Dữ liệu bộ phận từ backend:', response)
    // Hỗ trợ cả snake_case và camelCase từ backend
    departments.value = response.map((item) => ({
      id: item.department_id || item.departmentId,
      code: item.department_code || item.departmentCode,
      name: item.department_name || item.departmentName,
    }))
  } catch (error) {
    console.error('Lỗi khi lấy danh sách bộ phận:', error)
  }
}

const loadAssetCategories = async () => {
  try {
    const response = await fixedAssetCategoryApi.getCategories()
    console.log('Dữ liệu loại tài sản từ backend:', response)
    // Hỗ trợ cả snake_case và camelCase từ backend
    assetTypes.value = response.map((item) => ({
      id: item.fixed_asset_category_id || item.fixedAssetCategoryId,
      code: item.fixed_asset_category_code || item.fixedAssetCategoryCode,
      name: item.fixed_asset_category_name || item.fixedAssetCategoryName || item.assetCategoryName,
      lifeTime: item.life_time ?? item.lifeTime ?? 0,
      depreciationRate: item.depreciation_rate ?? item.depreciationRate ?? 0,
    }))
  } catch (error) {
    console.error('Lỗi khi lấy danh sách loại tài sản:', error)
  }
}

onMounted(() => {
  loadDepartments() // Lấy danh sách bộ phận
  loadAssetCategories() // Lấy danh sách loại tài sản
  loadData() // Lấy danh sách tài sản
})

// Watch để reload dữ liệu khi filters hoặc paging thay đổi
const debouncedLoadData = debounce(() => {
  currentPage.value = 1 // Reset về trang 1 khi tìm kiếm/filter
  loadData()
}, 500)

watch([searchText, selectedAssetType, selectedDepartment], () => {
  debouncedLoadData()
})

watch([currentPage, pageSize], () => {
  loadData()
})

// --- Computed Totals ---
const totals = computed(() => {
  return assetData.value.reduce(
    (acc, item) => {
      acc.quantity += item.quantity || 0
      acc.cost += item.cost || 0
      acc.accumulatedDepreciation += item.accumulatedDepreciation || 0
      acc.remainingValue += item.remainingValue || 0
      acc.depreciationRate += item.depreciationRate || 0
      acc.depreciationValueYear += item.depreciationValueYear || 0
      return acc
    },
    {
      quantity: 0,
      cost: 0,
      accumulatedDepreciation: 0,
      remainingValue: 0,
      depreciationRate: 0,
      depreciationValueYear: 0,
    },
  )
})

const footerTableWidth = computed(() => {
  // checkbox (40) + action (100) + sum of column widths
  let total = 140
  tableColumns.value.forEach((col) => {
    const num = parseInt(col.width)
    total += isNaN(num) ? 120 : num
  })
  return total
})

// --- Methods ---
const openAddModal = async () => {
  dialogMode.value = 'add'
  let newCode = ''

  try {
    newCode = await fixedAssetApi.getNewCode()
  } catch (error) {
    console.error('Lỗi sinh mã tài sản mới:', error)
    showToast({ message: 'Không sinh được mã tài sản mới.', type: 'error' })
  } finally {
    formData.value = {
      assetCode: newCode || '',
      assetName: '',
      assetTypeId: '',
      assetTypeName: '',
      departmentId: '',
      departmentName: '',
      quantity: 1,
      cost: 0,
      depreciationRate: 0,
      purchaseDate: '',
      startUsingDate: '',
      trackedYear: new Date().getFullYear(),
      productionYear: 0,
      lifeTime: 0,
      depreciationValueYear: 0,
    }
    showDialog.value = true
  }
}

const editAsset = async (row) => {
  try {
    dialogMode.value = 'edit'
    // Gọi API lấy dữ liệu chi tiết từ backend
    const assetId = row.id || row.fixed_asset_id
    if (!assetId) {
      alert('Không tìm thấy ID tài sản')
      return
    }
    const response = await fixedAssetApi.getById(assetId)
    console.log('Dữ liệu chi tiết tài sản từ backend:', response)
    // Set dữ liệu chi tiết vào form
    formData.value = response
    showDialog.value = true
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết tài sản:', error)
    alert('Không thể lấy dữ liệu tài sản. Vui lòng thử lại!')
  }
}

const handleSaveAsset = async (data) => {
  console.log('Lưu tài sản:', data)
  // Reload lại dữ liệu sau khi lưu
  await loadData()
}

const duplicateAsset = async (row) => {
  try {
    const assetId = row.id || row.fixed_asset_id
    if (!assetId) return

    // 1. Lấy chi tiết tài sản gốc từ Backend
    const sourceAsset = await fixedAssetApi.getById(assetId)

    // 2. Lấy mã tài sản mới (tăng tự động)
    const newCode = await fixedAssetApi.getNewCode()

    // 3. Chuẩn bị dữ liệu cho Form
    // Mẹo: Thêm property 'duplicateMode: true' để AssetForm nhận biết
    formData.value = {
      ...sourceAsset,
      fixed_asset_code: newCode, // Gán mã mới
      fixed_asset_name: sourceAsset.fixed_asset_name + ' (Nhân bản)', // (Tuỳ chọn) Gợi ý tên
      fixed_asset_id: null, // Quan trọng: Xóa ID để tính là thêm mới
      id: null, // Xóa ID
      duplicateMode: true, // Cờ đánh dấu đang nhân bản
    }

    // 4. Mở form ở chế độ 'add' (để nút Lưu gọi API Create)
    dialogMode.value = 'add'
    showDialog.value = true
  } catch (error) {
    console.error('Lỗi khi chuẩn bị dữ liệu nhân bản:', error)
    showToast({ message: 'Không thể lấy dữ liệu để nhân bản.', type: 'error' })
  }
}

// --- Context Menu Actions ---
const handleMenuAdd = () => {
  hideRowMenu()
  openAddModal()
}

const handleMenuEdit = () => {
  const row = rowMenu.value.row
  if (!row) return hideRowMenu()
  hideRowMenu()
  editAsset(row)
}

const handleMenuDelete = () => {
  const row = rowMenu.value.row
  if (!row) return hideRowMenu()
  const id = row.id || row.fixed_asset_id
  const codeName = `${row.assetCode} - ${row.assetName}`
  hideRowMenu()
  showDeleteConfirm({
    text: `Bạn có muốn xóa tài sản ${codeName}?`,
    onConfirm: async () => {
      try {
        await fixedAssetApi.delete(id)
        showToast({ message: 'Xóa thành công', type: 'success' })
        selectedAssetIds.value = selectedAssetIds.value.filter((sid) => sid !== id)
        await loadData()
      } catch (err) {
        console.error(err)
        showToast({ message: 'Không xóa được bản ghi.', type: 'error' })
      }
    },
  })
}

const handleMenuDuplicate = () => {
  const row = rowMenu.value.row
  if (!row) return hideRowMenu()
  hideRowMenu()
  duplicateAsset(row)
}

const goToPage = (page) => {
  if (!pageSize.value) return
  const bounded = Math.min(Math.max(1, page), totalPages.value)
  currentPage.value = bounded
}

// --- Delete Selected ---
const confirmDeleteSelected = () => {
  const count = selectedAssetIds.value.length
  if (count === 0) {
    showToast({ message: 'Vui lòng chọn ít nhất một tài sản để xóa.', type: 'warning' })
    return
  }

  if (count === 1) {
    const id = selectedAssetIds.value[0]
    const row = assetData.value.find((r) => r.id === id)
    const codeName = row ? `${row.assetCode} - ${row.assetName}` : id
    showDeleteConfirm({
      text: `Bạn có muốn xóa tài sản ${codeName}?`,
      onConfirm: async () => {
        // Logic xóa gọi API tại đây
        await fixedAssetApi.delete(id)
        showToast({ message: 'Xóa thành công', type: 'success' })
        selectedAssetIds.value = []
        await loadData()
      },
    })
  } else {
    const countText = String(count).padStart(2, '0')
    showDeleteConfirm({
      title: 'Xóa nhiều tài sản',
      text: `${countText} tài sản đã được chọn. Bạn có muốn xóa các tài sản này khỏi danh sách?`,
      onConfirm: async () => {
        try {
          const res = await fixedAssetApi.deleteBatch(selectedAssetIds.value)
          const msg = res?.message || `Đã xóa ${selectedAssetIds.value.length} bản ghi.`
          showToast({ message: msg, type: 'success' })
          selectedAssetIds.value = []
          await loadData()
        } catch (err) {
          console.error(err)
          showToast({ message: 'Không xóa được bản ghi nào.', type: 'error' })
        }
      },
    })
  }
}
</script>

<style scoped>
.page-container {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f4f7ff;
  box-sizing: border-box;
  overflow: hidden;
  gap: 16px;
}

.page-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  gap: 12px;
  align-items: center; /* Để input và combo thẳng hàng */
}
/* Override margin-bottom của MsInput/Combobox khi ở trong toolbar để khít nhau */
:deep(.ms-input-wrapper),
:deep(.ms-combo-wrapper) {
  margin-bottom: 0 !important;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-tools {
  display: flex;
  gap: 10px;
}

.tool-btn {
  width: 36px;
  height: 36px;
  background-color: #fff;
  border: 1px solid #e0e0e0; /* Viền xám nhạt */
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  /* Hiệu ứng đổ bóng nhẹ cho giống ảnh */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.16);
  overflow: hidden;
}

.tool-btn:hover {
  background-color: #f5f5f5;
  border-color: #ccc;
}

:deep(.ms-grid-container) {
  flex: 1;
  min-height: 0;
}

:deep(table) {
  min-width: 1000px;
}

.action-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0075c0;
  transition: background 0.2s;
  opacity: 0;
}

.action-btn:hover {
  background-color: #eff1f6;
}

:deep(tr:hover) .action-btn {
  opacity: 1;
}

:deep(.row-focused) .action-btn {
  opacity: 1;
}

.ms-page-size select {
  height: 32px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 0 8px;
  color: #1f1f1f;
}

.ms-page-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  font-weight: 500;
  color: #1f1f1f;
  padding: 4px 8px;
}

.ms-page-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.ms-page-number {
  border: none;
  background: transparent;
  cursor: pointer;
  color: #1f1f1f;
  padding: 4px 4px;
  min-width: 20px;
  text-align: center;
  font-size: 11px;
}

.ms-page-number.active {
  font-weight: bold;
  background-color: #f5f5f5;
  border-radius: 3px;
}

.ms-page-number:hover:not(.active) {
  background-color: #f5f5f5;
}

.ms-page-dots {
  padding: 0 4px;
  color: #666;
}

.ms-select-wrapper {
  display: inline-block;
  position: relative;
}

/* 2. Style cho Icon mới */
.icon-arrow-down {
  /* --- Code gốc của bạn (giữ nguyên phần mask) --- */
  mask-image: url('../../assets/icons/qlts-icon.svg');
  mask-position: -72px -338px;
  width: 7px;
  height: 5px;

  /* --- Phần thêm mới để căn chỉnh --- */
  background-color: #1f1f1f; /* QUAN TRỌNG: Đổi màu trắng thành đen để nhìn thấy */
  position: absolute;
  top: 50%;
  right: 12px; /* Cách lề phải một chút */
  transform: translateY(-50%); /* Căn giữa theo chiều dọc */
  pointer-events: none; /* CỰC KỲ QUAN TRỌNG: Để click vào icon vẫn ăn vào Select bên dưới */
  z-index: 1;
}

.ms-page-size-select {
  height: 25px;
  width: 60px;
  padding: 0 14px;
  color: #1f1f1f;
  font-size: 11px;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-color: #ffffff;
  border-radius: 2.625px;
  border: 1px solid #afafaf;
  overflow: hidden;
}

.ms-page-size-select:hover {
  border-color: #b3b3b3;
}

.ms-page-size-select:focus {
  outline: none;
  border-color: #40a9ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

/* --- Row Context Menu Styles --- */
.context-menu-mask {
  position: fixed;
  inset: 0;
  background: transparent;
  z-index: 1000;
}

.context-menu {
  position: fixed;
  z-index: 1001;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  min-width: 180px;
  padding: 6px 0;
}

.context-menu .menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  color: #1f1f1f;
}

.context-menu .menu-item:hover {
  background: #f5f5f5;
}
</style>

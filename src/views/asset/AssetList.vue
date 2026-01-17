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
          style="width: 220px"
        />

        <MsCombobox
          v-model="selectedDepartment"
          :options="departments"
          itemValue="id"
          itemCode="code"
          itemText="name"
          placeholder="Bộ phận sử dụng"
          icon="icon icon-filter"
          style="width: 220px"
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
          <button class="tool-btn shadow-btn btn-delete-tool" title="Xóa">
            <div class="icon icon-trash"></div>
          </button>
        </div>
      </div>
    </div>

    <MsTable :columns="tableColumns" :data="paginatedAssetData">
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
        <table style="width: 100%; border-collapse: collapse; table-layout: fixed">
          <colgroup>
            <col style="width: 50px" />
            <col style="width: 50px" />
            <col style="width: 120px" />
            <col style="width: 200px" />
            <col style="width: 200px" />
            <col style="width: 200px" />
            <col style="width: 100px" />
            <col style="width: 180px" />
            <col style="width: 180px" />
            <col style="width: 140px" />
            <col style="width: 100px" />
            <col style="width: 120px" />
            <col style="width: 150px" />
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
                <div style="display: flex; align-items: center; gap: 12px">
                  <span style="white-space: nowrap">
                    Tổng số: <strong>{{ totalRecords }}</strong> bản ghi
                  </span>
                  <select v-model="pageSize" class="ms-page-size-select">
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>

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
              <td style="text-align: right; padding: 10px 16px; border-bottom: 1px solid #e0e0e0">
                {{ totals.quantity }}
              </td>
              <td style="text-align: right; padding: 10px 16px; border-bottom: 1px solid #e0e0e0">
                {{ formatMoney(totals.cost) }}
              </td>
              <td style="text-align: right; padding: 10px 16px; border-bottom: 1px solid #e0e0e0">
                {{ formatMoney(totals.accumulatedDepreciation) }}
              </td>
              <td style="text-align: right; padding: 10px 16px; border-bottom: 1px solid #e0e0e0">
                {{ formatMoney(totals.remainingValue) }}
              </td>
              <td
                style="text-align: right; padding: 10px 16px; border-bottom: 1px solid #e0e0e0"
              ></td>
              <td
                style="text-align: right; padding: 10px 16px; border-bottom: 1px solid #e0e0e0"
              ></td>
              <td style="text-align: right; padding: 10px 16px; border-bottom: 1px solid #e0e0e0">
                {{ formatMoney(totals.depreciationValueYear) }}
              </td>

              <td style="padding: 10px 16px; border-bottom: 1px solid #e0e0e0"></td>
            </tr>
          </tfoot>
        </table>
      </template>
    </MsTable>

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
import { ref, computed, onMounted } from 'vue'
import fixedAssetApi from '@/apis/fixedAssetApi'
import MsButton from '@/components/MsButton.vue'
import MsInput from '@/components/MsInput.vue'
import MsCombobox from '@/components/MsCombobox.vue'
import MsTable from '@/components/MsTable.vue'
import AssetForm from './AssetForm.vue'

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

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
    return pages
  }

  pages.push(1, 2)

  if (cur > 4) pages.push('...-left')

  const start = Math.max(3, cur - 1)
  const end = Math.min(total - 2, cur + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (cur < total - 3) pages.push('...-right')

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
  usedStartDate: '',
  trackedYear: new Date().getFullYear(),
  productionYear: 0,
  lifeTime: 0,
  depreciationValueYear: 0,
})

// --- Mock Data Options ---
const assetTypes = ref([])

const departments = ref([])

// --- Table Configuration ---
const tableColumns = [
  { key: 'stt', title: 'STT', width: '50px', align: 'center' },
  { key: 'assetCode', title: 'Mã tài sản', width: '120px' },
  { key: 'assetName', title: 'Tên tài sản', width: '200px' },
  { key: 'assetTypeName', title: 'Loại tài sản', width: '200px' },
  { key: 'departmentName', title: 'Bộ phận sử dụng', width: '200px' },
  { key: 'quantity', title: 'Số lượng', width: '100px', align: 'right', type: 'number' },
  { key: 'cost', title: 'Nguyên giá', width: '180px', align: 'right' },
  { key: 'accumulatedDepreciation', title: 'HM/KH lũy kế', width: '180px', align: 'right' },
  { key: 'remainingValue', title: 'Giá trị còn lại', width: '140px', align: 'right' },
  { key: 'productionYear', title: 'Năm sử dụng', width: '100px', align: 'right' },
  { key: 'depreciationRate', title: 'Tỷ lệ hao mòn (%)', width: '120px', align: 'right' },
  { key: 'depreciationValueYear', title: 'Giá trị hao mòn năm', width: '150px', align: 'right' },
]

// --- Mock Data Rows ---
const assetData = ref([])

// Computed property để lấy dữ liệu đã phân trang
const paginatedAssetData = computed(() => {
  if (!assetData.value || assetData.value.length === 0) return []

  const size = parseInt(pageSize.value) || 20
  const start = (currentPage.value - 1) * size
  const end = start + size

  // Cắt dữ liệu theo trang và cập nhật STT
  return assetData.value.slice(start, end).map((item, index) => ({
    ...item,
    stt: start + index + 1, // STT chính xác theo trang
  }))
})

const loadData = async () => {
  try {
    const response = await fixedAssetApi.getAll()
    console.log('Dữ liệu từ backend:', response)
    // Ánh xạ dữ liệu từ backend (FixedAssetDto) sang format frontend
    assetData.value = response.map((item, index) => ({
      stt: index + 1,
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
      usedStartDate: item.used_start_date || '',
      trackedYear: item.tracked_year || new Date().getFullYear(),
      lifeTime: item.life_time || 0,
      depreciationValueYear: item.depreciation_value_year || 0,
      accumulatedDepreciation: item.accumulated_depreciation || 0,
      remainingValue: (item.cost || 0) - (item.accumulated_depreciation || 0),
      productionYear: item.tracked_year || new Date().getFullYear(),
    }))
    totalRecords.value = assetData.value.length
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu:', error)
    if (error.response) {
      alert(
        `Lỗi ${error.response.status}: ${error.response.data?.message || 'Không thể lấy dữ liệu'}`,
      )
    } else if (error.request) {
      alert('Không thể kết nối với máy chủ. Vui lòng kiểm tra backend đã chạy chưa.')
    } else {
      alert('Đã xảy ra lỗi: ' + error.message)
    }
  }
}

const loadDepartments = async () => {
  try {
    const response = await fixedAssetApi.getDepartments()
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
    const response = await fixedAssetApi.getCategories()
    console.log('Dữ liệu loại tài sản từ backend:', response)
    // Hỗ trợ cả snake_case và camelCase từ backend
    assetTypes.value = response.map((item) => ({
      id: item.fixed_asset_category_id || item.fixedAssetCategoryId,
      code: item.fixed_asset_category_code || item.fixedAssetCategoryCode,
      name: item.fixed_asset_category_name || item.fixedAssetCategoryName || item.assetCategoryName,
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

// --- Computed Totals ---
const totals = computed(() => {
  return paginatedAssetData.value.reduce(
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

// --- Methods ---
const formatMoney = (value) => {
  return new Intl.NumberFormat('vi-VN').format(value)
}

const openAddModal = () => {
  dialogMode.value = 'add'
  formData.value = {
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
    usedStartDate: '',
    trackedYear: new Date().getFullYear(),
    productionYear: 0,
    lifeTime: 0,
    depreciationValueYear: 0,
  }
  showDialog.value = true
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

const closeDialog = () => {
  showDialog.value = false
}

const handleSaveAsset = async (data) => {
  console.log('Lưu tài sản:', data)
  // Reload lại dữ liệu sau khi lưu
  await loadData()
}

const saveAsset = () => {
  handleSaveAsset(formData.value)
}

const duplicateAsset = (row) => {
  console.log('Nhân bản', row)
}

const goToPage = (page) => {
  if (!pageSize.value) return
  const bounded = Math.min(Math.max(1, page), totalPages.value)
  currentPage.value = bounded
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
  padding: 4px 8px;
  min-width: 32px;
  text-align: center;
}

.ms-page-number.active {
  font-weight: bold;
}

.ms-page-number:hover:not(.active) {
  background-color: #f5f5f5;
}

.ms-page-dots {
  padding: 0 4px;
  color: #666;
}

.ms-page-size-select {
  height: 32px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 0 8px;
  color: #1f1f1f;
  background-color: #fff;
  font-size: 13px;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231f1f1f' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 4px center;
  background-size: 18px;
  padding-right: 28px;
}

.ms-page-size-select:hover {
  border-color: #b3b3b3;
}

.ms-page-size-select:focus {
  outline: none;
  border-color: #40a9ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}
</style>

<template>
  <MsDialog v-model="isOpen" :title="mode === 'add' ? 'Thêm tài sản' : 'Sửa tài sản'" width="900px">
    <div class="asset-form-grid">
      <div class="form-group col-3">
        <label>Mã tài sản <span class="required">*</span></label>
        <MsInput v-model="form.assetCode" placeholder="TS00001" />
      </div>
      <div class="form-group col-8">
        <label>Tên tài sản <span class="required">*</span></label>
        <MsInput v-model="form.assetName" placeholder="Nhập tên tài sản" />
      </div>

      <div class="form-group col-3">
        <label>Mã bộ phận sử dụng <span class="required">*</span></label>
        <MsCombobox
          v-model="form.departmentId"
          :options="departments"
          itemValue="id"
          itemCode="code"
          itemText="name"
          displayMode="code"
          placeholder="Chọn mã bộ phận sử dụng"
        />
      </div>
      <div class="form-group col-8">
        <label>Tên bộ phận sử dụng</label>
        <MsInput v-model="form.departmentName" disabled />
      </div>

      <div class="form-group col-3">
        <label>Mã loại tài sản <span class="required">*</span></label>
        <MsCombobox
          v-model="form.assetTypeId"
          :options="assetTypes"
          itemValue="id"
          itemCode="code"
          itemText="name"
          displayMode="code"
          placeholder="Chọn mã loại tài sản"
        />
      </div>
      <div class="form-group col-8">
        <label>Tên loại tài sản</label>
        <MsInput v-model="form.assetTypeName" disabled />
      </div>

      <div class="form-group col-3">
        <label>Số lượng <span class="required">*</span></label>
        <MsInput v-model.number="form.quantity" type="number" />
      </div>
      <div class="form-group col-4">
        <label>Nguyên giá <span class="required">*</span></label>
        <MsInput v-model.number="form.cost" type="number" />
      </div>
      <div class="form-group col-4">
        <label>Tỷ lệ hao mòn (%) <span class="required">*</span></label>
        <MsInput v-model.number="form.depreciationRate" type="number" />
      </div>

      <div class="form-group col-3">
        <label>Ngày mua <span class="required">*</span></label>
        <MsInput v-model="form.purchaseDate" type="date" />
      </div>
      <div class="form-group col-4">
        <label>Ngày bắt đầu sử dụng <span class="required">*</span></label>
        <MsInput v-model="form.usedStartDate" type="date" />
      </div>
      <div class="form-group col-4">
        <label>Năm theo dõi</label>
        <MsInput v-model.number="form.trackedYear" type="number" disabled />
      </div>

      <div class="form-group col-3">
        <label>Số năm sử dụng <span class="required">*</span></label>
        <MsInput v-model.number="form.lifeTime" type="number" />
      </div>
      <div class="form-group col-4">
        <label>Giá trị hao mòn năm <span class="required">*</span></label>
        <MsInput v-model.number="form.depreciationValueYear" type="number" />
      </div>
    </div>

    <template #footer>
      <MsButton type="default" @click="handleClose" style="min-width: 100px" :disabled="isLoading"
        >Hủy</MsButton
      >
      <MsButton type="primary" @click="handleSave" style="min-width: 100px" :disabled="isLoading">
        {{ isLoading ? 'Đang lưu...' : 'Lưu' }}
      </MsButton>
    </template>
  </MsDialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import MsDialog from '@/components/MsDialog.vue'
import MsInput from '@/components/MsInput.vue'
import MsCombobox from '@/components/MsCombobox.vue'
import MsButton from '@/components/MsButton.vue'
import fixedAssetApi from '@/apis/fixedAssetApi'

const props = defineProps({
  modelValue: Boolean,
  mode: { type: String, default: 'add' }, // 'add' hoặc 'edit'
  initialData: Object,
  departments: Array,
  assetTypes: Array,
})

const emit = defineEmits(['update:modelValue', 'save'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const form = ref({
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

const isLoading = ref(false)

// Chuyển mọi giá trị ngày về định dạng yyyy-MM-dd để input type="date" đọc được
const normalizeDate = (value) => {
  if (!value) return ''
  const d = new Date(value)
  // Kiểm tra ngày hợp lệ và không phải ngày null (0001-01-01)
  if (Number.isNaN(d.getTime()) || d.getFullYear() < 1900) return ''
  return d.toISOString().slice(0, 10)
}

// Tìm id theo code hoặc name từ danh sách options (departments / assetTypes)
const findIdByCodeOrName = (list, codeValue, nameValue) => {
  if (!list || list.length === 0) return ''
  const found = list.find(
    (item) => String(item.code) === String(codeValue) || item.name === nameValue,
  )
  return found?.id || ''
}

// Watch departmentId để tự động điền departmentName
watch(
  () => form.value.departmentId,
  (newId) => {
    if (newId) {
      const dept = props.departments?.find((d) => d.id === newId)
      if (dept) {
        form.value.departmentName = dept.name
      }
    } else {
      form.value.departmentName = ''
    }
  },
)

// Watch assetTypeId để tự động điền assetTypeName
watch(
  () => form.value.assetTypeId,
  (newId) => {
    if (newId) {
      const type = props.assetTypes?.find((t) => t.id === newId)
      if (type) {
        form.value.assetTypeName = type.name
      }
    } else {
      form.value.assetTypeName = ''
    }
  },
)

// Watch purchaseDate để tự động điền trackedYear
watch(
  () => form.value.purchaseDate,
  (newDate) => {
    if (newDate) {
      const year = new Date(newDate).getFullYear()
      form.value.trackedYear = year
    } else {
      form.value.trackedYear = new Date().getFullYear()
    }
  },
)

// Reset form khi initialData thay đổi
watch(
  () => props.initialData,
  (newData) => {
    if (newData && props.mode === 'edit') {
      // Map dữ liệu từ backend (snake_case hoặc camelCase) vào form
      const departmentCode = newData.department_code || newData.departmentCode
      const departmentName = newData.department_name || newData.departmentName || ''
      const departmentIdRaw =
        newData.department_id ||
        newData.departmentId ||
        findIdByCodeOrName(props.departments, departmentCode, departmentName)
      const departmentId = departmentIdRaw ? String(departmentIdRaw) : ''

      const assetTypeCode =
        newData.fixed_asset_category_code || newData.fixedAssetCategoryCode || newData.assetTypeCode
      const assetTypeName =
        newData.fixed_asset_category_name ||
        newData.assetTypeName ||
        newData.assetCategoryName ||
        ''
      const assetTypeIdRaw =
        newData.fixed_asset_category_id ||
        newData.assetTypeId ||
        findIdByCodeOrName(props.assetTypes, assetTypeCode, assetTypeName)
      const assetTypeId = assetTypeIdRaw ? String(assetTypeIdRaw) : ''

      console.log('=== DEBUG FORM DATA ===')
      console.log('departmentCode:', departmentCode, '| departmentId:', departmentId)
      console.log('assetTypeCode:', assetTypeCode, '| assetTypeId:', assetTypeId)
      console.log('purchase_date:', newData.purchase_date)
      console.log('departments:', props.departments)
      console.log('assetTypes:', props.assetTypes)

      form.value = {
        id: newData.id || newData.fixed_asset_id,
        fixed_asset_id: newData.fixed_asset_id || newData.id,
        assetCode: newData.fixed_asset_code || newData.assetCode || '',
        assetName: newData.fixed_asset_name || newData.assetName || '',
        assetTypeId,
        assetTypeName,
        departmentId,
        departmentName,
        quantity: newData.quantity || 1,
        cost: newData.cost || 0,
        depreciationRate: newData.depreciation_rate || 0,
        purchaseDate: normalizeDate(newData.purchase_date || ''),
        usedStartDate: normalizeDate(newData.used_start_date || ''),
        trackedYear: newData.tracked_year || new Date().getFullYear(),
        lifeTime: newData.life_time || 0,
        depreciationValueYear: newData.depreciation_value_year || 0,
      }
    } else {
      resetForm()
    }
  },
  { deep: true },
)

const resetForm = () => {
  form.value = {
    id: '',
    fixed_asset_id: '',
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
    lifeTime: 0,
    depreciationValueYear: 0,
  }
}

const handleClose = () => {
  emit('update:modelValue', false)
  resetForm()
}

const handleSave = async () => {
  try {
    isLoading.value = true

    // Validate dữ liệu cơ bản
    if (!form.value.assetCode?.trim()) {
      alert('Vui lòng nhập mã tài sản')
      return
    }
    if (!form.value.assetName?.trim()) {
      alert('Vui lòng nhập tên tài sản')
      return
    }

    const formData = {
      fixed_asset_code: form.value.assetCode,
      fixed_asset_name: form.value.assetName,
      department_id: form.value.departmentId,
      department_name: form.value.departmentName,
      fixed_asset_category_id: form.value.assetTypeId,
      fixed_asset_category_name: form.value.assetTypeName,
      quantity: form.value.quantity,
      cost: form.value.cost,
      depreciation_rate: form.value.depreciationRate,
      purchase_date: form.value.purchaseDate,
      used_start_date: form.value.usedStartDate,
      tracked_year: form.value.trackedYear,
      life_time: form.value.lifeTime,
      depreciation_value_year: form.value.depreciationValueYear,
    }

    if (props.mode === 'add') {
      await fixedAssetApi.create(formData)
      alert('Thêm tài sản thành công!')
    } else {
      // Cập nhật tài sản - sử dụng ID đã map vào form
      const assetId = form.value.fixed_asset_id || form.value.id
      if (!assetId) {
        alert('Không tìm thấy ID tài sản')
        isLoading.value = false
        return
      }
      await fixedAssetApi.update(assetId, formData)
      alert('Cập nhật tài sản thành công!')
    }

    emit('save', form.value)
    handleClose()
  } catch (error) {
    console.error('Lỗi khi lưu tài sản:', error)
    if (error.response?.data?.message) {
      alert(`Lỗi: ${error.response.data.message}`)
    } else {
      alert('Không thể lưu tài sản. Vui lòng thử lại!')
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.asset-form-grid {
  display: grid;
  /* Chia grid thành 11 phần bằng nhau */
  grid-template-columns: repeat(11, 1fr);
  gap: 12px 20px; /* Khoảng cách giữa các ô */
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Các lớp định nghĩa độ rộng ô */
.col-3 {
  grid-column: span 3;
}
.col-4 {
  grid-column: span 4;
}
.col-8 {
  grid-column: span 8;
}

.form-group label {
  font-size: 13px;
  font-weight: 500;
  color: #000;
}

.required {
  color: red;
  margin-left: 2px;
}

/* Giao diện Input theo style MISA (ảnh phải) */
:deep(.ms-input) {
  height: 34px !important;
  border: 1px solid #afafaf !important;
  border-radius: 3px !important;
}

:deep(.ms-input:disabled) {
  background-color: #f5f5f5 !important;
}

:deep(.ms-input-wrapper) {
  margin-bottom: 0 !important; /* Xóa margin cũ của component */
}
</style>

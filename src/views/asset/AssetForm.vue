<template>
  <MsDialog v-model="isOpen" :title="mode === 'add' ? 'Thêm tài sản' : 'Sửa tài sản'" width="900px">
    <div class="asset-form-grid">
      <div class="form-group col-3">
        <label>Mã tài sản <span class="required">*</span></label>
        <MsInput v-model="form.assetCode" placeholder="TS00001" />
        <span class="error-message">{{ errors.assetCode }}</span>
      </div>
      <div class="form-group col-8">
        <label>Tên tài sản <span class="required">*</span></label>
        <MsInput v-model="form.assetName" placeholder="Nhập tên tài sản" />
        <span class="error-message">{{ errors.assetName }}</span>
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
        <span class="error-message">{{ errors.departmentId }}</span>
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
        <span class="error-message">{{ errors.assetTypeId }}</span>
      </div>
      <div class="form-group col-8">
        <label>Tên loại tài sản</label>
        <MsInput v-model="form.assetTypeName" disabled />
      </div>

      <div class="form-group col-3">
        <label>Số lượng <span class="required">*</span></label>
        <MsInput v-model.number="form.quantity" icon="icon icon-caret-up-down" type="number" />
        <span class="error-message">{{ errors.quantity }}</span>
      </div>
      <div class="form-group col-4">
        <label>Nguyên giá <span class="required">*</span></label>
        <MsInput v-model.number="form.cost" type="number" />
        <span class="error-message">{{ errors.cost }}</span>
      </div>
      <div class="form-group col-4">
        <label>Tỷ lệ hao mòn (%) <span class="required">*</span></label>
        <MsInput v-model.number="form.depreciationRate" type="number" />
        <span class="error-message">{{ errors.depreciationRate }}</span>
      </div>

      <div class="form-group col-3">
        <label>Ngày mua <span class="required">*</span></label>
        <DatePicker
          v-model:value="form.purchaseDate"
          class="ms-date-picker"
          :suffix-icon="calendarIcon"
          :allow-clear="false"
          format="DD/MM/YYYY"
          value-format="YYYY-MM-DD"
        />
        <span class="error-message">{{ errors.purchaseDate }}</span>
      </div>
      <div class="form-group col-4">
        <label>Ngày bắt đầu sử dụng <span class="required">*</span></label>
        <DatePicker
          v-model:value="form.usedStartDate"
          class="ms-date-picker"
          :suffix-icon="calendarIcon"
          :allow-clear="false"
          format="DD/MM/YYYY"
          value-format="YYYY-MM-DD"
        />
        <span class="error-message">{{ errors.usedStartDate }}</span>
      </div>
      <div class="form-group col-4">
        <label>Năm theo dõi</label>
        <MsInput v-model.number="form.trackedYear" type="number" disabled />
      </div>

      <div class="form-group col-3">
        <label>Số năm sử dụng <span class="required">*</span></label>
        <MsInput v-model.number="form.lifeTime" type="number" icon="icon icon-caret-up-down"/>
        <span class="error-message">{{ errors.lifeTime }}</span>
      </div>
      <div class="form-group col-4">
        <label>Giá trị hao mòn năm <span class="required">*</span></label>
        <MsInput v-model.number="form.depreciationValueYear" type="number" />
        <span class="error-message">{{ errors.depreciationValueYear }}</span>
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
import { ref, computed, watch, h } from 'vue'
import { DatePicker } from 'ant-design-vue'
import MsDialog from '../../components/MsDialog.vue'
import MsInput from '../../components/MsInput.vue'
import MsCombobox from '../../components/MsCombobox.vue'
import MsButton from '../../components/MsButton.vue'
import fixedAssetApi from '../../apis/fixedAssetApi'
import { showToast, showUnsavedChangeConfirm, showDeleteConfirm } from '../../stores/notification'

const props = defineProps({
  modelValue: Boolean,
  mode: { type: String, default: 'add' }, // 'add' hoặc 'edit'
  initialData: Object,
  departments: Array,
  assetTypes: Array,
})

const emit = defineEmits(['update:modelValue', 'save'])

const calendarIcon = h('span', { class: 'icon icon-date-picker' })

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

const errors = ref({
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
})

const isLoading = ref(false)

// Lưu dữ liệu gốc để so sánh sau này khi sửa
const originalFormData = ref(null)

// Chuẩn hoá ngày thành yyyy-MM-dd để input type="date" đọc được
// Giữ nguyên cả các ngày rất nhỏ (ví dụ 0001-01-01) theo yêu cầu backend
const normalizeDate = (value) => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
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
      // Đồng bộ ngày bắt đầu sử dụng theo ngày mua
      // - Ở chế độ thêm: luôn gán theo ngày mua
      // - Ở chế độ sửa: chỉ gán nếu đang trống (backend không có)
      if (props.mode === 'add') {
        form.value.usedStartDate = newDate
      } else if (!form.value.usedStartDate) {
        form.value.usedStartDate = newDate
      }
    } else {
      form.value.trackedYear = new Date().getFullYear()
    }
  },
)

// Reset form khi initialData thay đổi
watch(
  () => props.initialData,
  (newData) => {
    if (newData && (props.mode === 'edit' || newData.duplicateMode)) {
      // Map dữ liệu từ backend (snake_case hoặc camelCase) vào form
      const departmentCode = newData.department_code || newData.departmentCode
      const departmentName = newData.department_name || newData.departmentName || ''

      // Ưu tiên lấy ID trực tiếp từ backend, nếu không có thì mới tìm bằng code/name
      let departmentIdRaw = newData.department_id || newData.departmentId
      if (!departmentIdRaw && (departmentCode || departmentName)) {
        departmentIdRaw = findIdByCodeOrName(props.departments, departmentCode, departmentName)
      }
      const departmentId = departmentIdRaw || ''

      const assetTypeCode =
        newData.fixed_asset_category_code || newData.fixedAssetCategoryCode || newData.assetTypeCode
      const assetTypeName =
        newData.fixed_asset_category_name ||
        newData.assetTypeName ||
        newData.assetCategoryName ||
        ''

      // Ưu tiên lấy ID trực tiếp từ backend, nếu không có thì mới tìm bằng code/name
      let assetTypeIdRaw = newData.fixed_asset_category_id || newData.assetTypeId
      if (!assetTypeIdRaw && (assetTypeCode || assetTypeName)) {
        assetTypeIdRaw = findIdByCodeOrName(props.assetTypes, assetTypeCode, assetTypeName)
      }
      const assetTypeId = assetTypeIdRaw || ''

      console.log('=== DEBUG FORM DATA ===')
      console.log(
        'departmentCode:',
        departmentCode,
        '| departmentId:',
        departmentId,
        '| type:',
        typeof departmentId,
      )
      console.log(
        'assetTypeCode:',
        assetTypeCode,
        '| assetTypeId:',
        assetTypeId,
        '| type:',
        typeof assetTypeId,
      )
      console.log('purchase_date:', newData.purchase_date)
      console.log('departments:', props.departments)
      console.log('assetTypes:', props.assetTypes)

      // Kiểm tra xem có tìm thấy department trong danh sách không
      const foundDept = props.departments?.find((d) => d.id == departmentId)
      console.log('Found department:', foundDept)
      const foundAssetType = props.assetTypes?.find((t) => t.id == assetTypeId)
      console.log('Found assetType:', foundAssetType)

      // Chuẩn hoá ngày mua/sử dụng
      const purchaseDateFormatted = normalizeDate(newData.purchase_date || '')
      const usedStartDateFormatted = normalizeDate(newData.used_start_date || '')
      const usedStartDateFinal = usedStartDateFormatted || purchaseDateFormatted || ''

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
        purchaseDate: purchaseDateFormatted,
        usedStartDate: usedStartDateFinal,
        trackedYear: newData.tracked_year || new Date().getFullYear(),
        lifeTime: newData.life_time || 0,
        depreciationValueYear: newData.depreciation_value_year || 0,
      }
      // Lưu bản sao dữ liệu gốc
      originalFormData.value = JSON.parse(JSON.stringify(form.value))
    } else {
      resetForm()
      // Cho phép truyền sẵn mã tài sản mới vào form thêm
      if (newData?.assetCode) {
        form.value.assetCode = newData.assetCode
      }
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
    // Mặc định ngày mua = hôm nay cho form Thêm
    purchaseDate: normalizeDate(new Date()),
    // Ngày bắt đầu sử dụng mặc định theo ngày mua
    usedStartDate: normalizeDate(new Date()),
    // Tự động set năm theo dõi theo ngày mua hiện tại
    trackedYear: new Date().getFullYear(),
    lifeTime: 0,
    depreciationValueYear: 0,
  }
  errors.value = {
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
  originalFormData.value = null
}

const validateForm = () => {
  let isValid = true
  const newErrors = {
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

  if (!form.value.assetCode?.trim()) {
    newErrors.assetCode = 'Mã tài sản không được để trống'
    isValid = false
  }

  if (!form.value.assetName?.trim()) {
    newErrors.assetName = 'Tên tài sản không được để trống'
    isValid = false
  }

  if (!form.value.departmentId) {
    newErrors.departmentId = 'Bộ phận sử dụng không được để trống'
    isValid = false
  }

  if (!form.value.assetTypeId) {
    newErrors.assetTypeId = 'Loại tài sản không được để trống'
    isValid = false
  }

  if (!form.value.quantity || form.value.quantity <= 0) {
    newErrors.quantity = 'Số lượng phải lớn hơn 0'
    isValid = false
  }

  if (form.value.cost < 0) {
    newErrors.cost = 'Nguyên giá không được âm'
    isValid = false
  }

  if (form.value.depreciationRate < 0 || form.value.depreciationRate > 100) {
    newErrors.depreciationRate = 'Tỷ lệ hao mòn phải từ 0-100%'
    isValid = false
  }

  if (!form.value.purchaseDate) {
    newErrors.purchaseDate = 'Ngày mua không được để trống'
    isValid = false
  }

  if (!form.value.usedStartDate) {
    newErrors.usedStartDate = 'Ngày bắt đầu sử dụng không được để trống'
    isValid = false
  }

  if (!form.value.lifeTime || form.value.lifeTime <= 0) {
    newErrors.lifeTime = 'Số năm sử dụng phải lớn hơn 0'
    isValid = false
  }

  if (form.value.depreciationValueYear < 0) {
    newErrors.depreciationValueYear = 'Giá trị hao mòn năm không được âm'
    isValid = false
  }

  errors.value = newErrors
  return isValid
}

// Kiểm tra xem form có thay đổi so với dữ liệu gốc không
const hasChanges = () => {
  if (!originalFormData.value) return false
  return JSON.stringify(form.value) !== JSON.stringify(originalFormData.value)
}

// Kiểm tra xem form thêm có dữ liệu nhập vào không
const isFormEmpty = () => {
  return (
    !form.value.assetCode?.trim() &&
    !form.value.assetName?.trim() &&
    !form.value.departmentId &&
    !form.value.assetTypeId &&
    form.value.quantity === 1 &&
    form.value.cost === 0 &&
    form.value.depreciationRate === 0 &&
    !form.value.lifeTime &&
    !form.value.depreciationValueYear
  )
}

// Đóng dialog mà không kiểm tra thay đổi
const closeDialogDirectly = () => {
  emit('update:modelValue', false)
  resetForm()
}

const handleClose = () => {
  // Form sửa có thay đổi hoặc form thêm có dữ liệu → hỏi trước khi đóng
  const shouldConfirm =
    (props.mode === 'edit' && hasChanges()) || (props.mode === 'add' && !isFormEmpty())

  if (shouldConfirm) {
    // Form thêm: dùng cảnh báo xóa (2 button)
    if (props.mode === 'add') {
      showDeleteConfirm({
        mode: 'cancel',
        text: 'Bạn có muốn hủy bỏ khai báo tài sản này?',
        onConfirm: () => {
          // Hủy bỏ
          emit('update:modelValue', false)
          resetForm()
        },
        onCancel: () => {
          // Không, quay lại form
        },
      })
    } else {
      // Form sửa: dùng cảnh báo thay đổi chưa lưu (3 button)
      showUnsavedChangeConfirm({
        text: 'Thông tin thay đổi sẽ không được cập nhật nếu bạn không lưu. Bạn có muốn lưu các thay đổi này?',
        onConfirm: () => {
          // Lưu rồi đóng
          handleSave()
        },
        onDeny: () => {
          // Không lưu, đóng dialog
          emit('update:modelValue', false)
          resetForm()
        },
        onCancel: () => {
          // Quay lại form, không đóng dialog
        },
      })
    }
  } else {
    // Form thêm rỗng hoặc form sửa không thay đổi, đóng ngay
    emit('update:modelValue', false)
    resetForm()
  }
}

const handleSave = async () => {
  try {
    isLoading.value = true

    // Validate form
    if (!validateForm()) {
      showToast({ message: 'Vui lòng điền đầy đủ thông tin bắt buộc', type: 'warning' })
      isLoading.value = false
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
      showToast({ message: 'Lưu dữ liệu thành công', type: 'success' })
    } else {
      // Cập nhật tài sản - sử dụng ID đã map vào form
      const assetId = form.value.fixed_asset_id || form.value.id
      if (!assetId) {
        showToast({ message: 'Không tìm thấy ID tài sản', type: 'error' })
        isLoading.value = false
        return
      }
      await fixedAssetApi.update(assetId, formData)
      showToast({ message: 'Lưu dữ liệu thành công', type: 'success' })
    }

    emit('save', form.value)
    closeDialogDirectly()
  } catch (error) {
    console.error('Lỗi khi lưu tài sản:', error)
    const msg = error?.response?.data?.message || 'Không thể lưu tài sản. Vui lòng thử lại!'
    showToast({ message: msg, type: 'error' })
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
  gap: 10px 20px; /* Khoảng cách giữa các ô */
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
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
  color: #000;
  margin-bottom: 8px;
  height: 20px; /* Chiều cao cố định cho label */
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

:deep(.ms-combo-container .ms-select::placeholder) {
  font-style: italic;
}

:deep(.ms-date-picker.ant-picker) {
  width: 100%;
  height: 34px;
  border: 1px solid #afafaf !important;
  border-radius: 3px !important;
}

:deep(.ms-date-picker .ant-picker-input > input) {
  height: 32px;
  line-height: 32px;
}

/* Icon date picker từ sprite */
.icon-date-picker {
  background-position: -287px -67px;
  width: 18px;
  height: 18px;
  display: inline-block;
}

.error-message {
  color: #d9534f;
  font-size: 12px;
  margin-top: 2px;
  display: block;
  line-height: 1.2;
  min-height: 10px; /* Chiều cao tối thiểu để giữ không gian cho error */
  height: 10px; /* Chiều cao cố định */
}
</style>

<template>
  <MsDialog
    v-model="isOpen"
    :title="mode === 'add' ? 'Thêm tài sản' : 'Sửa tài sản'"
    width="900px"
    @close="handleClose"
  >
    <div class="asset-form-grid">
      <div class="form-group col-4">
        <label>Mã tài sản <span class="required">*</span></label>
        <MsInput v-model="form.assetCode" placeholder="TS00001" />
        <span class="error-message">{{ errors.assetCode }}</span>
      </div>
      <div class="form-group col-8">
        <label>Tên tài sản <span class="required">*</span></label>
        <MsInput v-model="form.assetName" placeholder="Nhập tên tài sản" />
        <span class="error-message">{{ errors.assetName }}</span>
      </div>

      <div class="form-group col-4">
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

      <div class="form-group col-4">
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

      <div class="form-group col-4">
        <label>Số lượng <span class="required">*</span></label>
        <MsInput v-model.number="form.quantity" icon="icon icon-caret-up-down" type="number" />
        <span class="error-message">{{ errors.quantity }}</span>
      </div>
      <div class="form-group col-4">
        <label>Nguyên giá <span class="required">*</span></label>
        <MsInput
          v-model="formattedCost"
          type="text"
          class="text-right"
          @input="handleCostInput"
          @keypress="allowOnlyNumbers"
        />
        <span class="error-message">{{ errors.cost }}</span>
      </div>
      <div class="form-group col-4">
        <label>Tỷ lệ hao mòn (%) <span class="required">*</span></label>
        <MsInput
          v-model.number="form.depreciationRate"
          type="number"
          @input="handleDepreciationRateInput"
        />
        <span class="error-message">{{ errors.depreciationRate }}</span>
      </div>

      <div class="form-group col-4">
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
          v-model:value="form.startUsingDate"
          class="ms-date-picker"
          :suffix-icon="calendarIcon"
          :allow-clear="false"
          format="DD/MM/YYYY"
          value-format="YYYY-MM-DD"
        />
        <span class="error-message">{{ errors.startUsingDate }}</span>
      </div>
      <div class="form-group col-4">
        <label>Năm theo dõi</label>
        <MsInput v-model.number="form.trackedYear" type="number" disabled />
      </div>

      <div class="form-group col-4">
        <label>Số năm sử dụng <span class="required">*</span></label>
        <MsInput
          v-model.number="form.lifeTime"
          type="number"
          icon="icon icon-caret-up-down"
          @input="handleLifeTimeInput"
        />
        <span class="error-message">{{ errors.lifeTime }}</span>
      </div>
      <div class="form-group col-4">
        <label>Giá trị hao mòn năm <span class="required">*</span></label>
        <MsInput
          v-model="formattedDepreciationValueYear"
          type="text"
          class="text-right"
          @input="handleDepreciationValueYearInput"
          @keypress="allowOnlyNumbers"
        />
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
import { ref, computed, watch, h, nextTick } from 'vue'
import { DatePicker } from 'ant-design-vue'
import MsDialog from '../../components/MsDialog.vue'
import MsInput from '../../components/MsInput.vue'
import MsCombobox from '../../components/MsCombobox.vue'
import MsButton from '../../components/MsButton.vue'
import fixedAssetApi from '../../apis/fixedAssetApi'
import {
  showToast,
  showUnsavedChangeConfirm,
  showDeleteConfirm,
  showAlert,
} from '../../stores/notification'
import { normalizeDate } from '../../utils/formatters'
import { validateAssetForm, allowOnlyNumbers } from '../../utils/validators'
import { mapBackendDataToForm, mapFormToBackendData } from '../../utils/assetHelpers'
import { useNumberFormat } from '../../composables/useNumberFormat'

const props = defineProps({
  modelValue: Boolean,
  mode: { type: String, default: 'add' }, // 'add' hoặc 'edit'
  initialData: Object,
  departments: Array,
  assetTypes: Array,
})

const emit = defineEmits(['update:modelValue', 'save'])

const calendarIcon = h('span', { class: 'icon icon-date-picker' })

// Đánh dấu người dùng đã chỉnh tay các trường phụ thuộc loại tài sản
const lifeTimeTouched = ref(false)
const depreciationRateTouched = ref(false)
// Bỏ qua auto-fill khi đang nạp dữ liệu ban đầu từ backend
const skipAssetTypeAutofill = ref(false)
// Đánh dấu đang nhân bản để không auto-fill startUsingDate
const isDuplicateMode = ref(false)

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
  startUsingDate: '',
  trackedYear: new Date().getFullYear(),
  productionYear: 0,
  lifeTime: 0,
  depreciationValueYear: 0,
  accumulatedDepreciation: 0,
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
  startUsingDate: '',
  lifeTime: '',
  depreciationValueYear: '',
})

const isLoading = ref(false)

// Sử dụng composable cho format số
const { formattedValue: formattedCost, handleInput: handleCostInput } = useNumberFormat(
  form,
  'cost',
)
const {
  formattedValue: formattedDepreciationValueYear,
  handleInput: handleDepreciationValueYearInput,
} = useNumberFormat(form, 'depreciationValueYear')

// Lưu dữ liệu gốc để so sánh sau này khi sửa
const originalFormData = ref(null)

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
    if (skipAssetTypeAutofill.value) return
    if (newId) {
      const type = props.assetTypes?.find((t) => t.id === newId)
      if (type) {
        form.value.assetTypeName = type.name
        // Đổi loại tài sản: reset trạng thái chỉnh tay và áp giá trị mặc định của loại
        lifeTimeTouched.value = false
        depreciationRateTouched.value = false
        if (typeof type.lifeTime !== 'undefined' && type.lifeTime !== null) {
          form.value.lifeTime = Number(type.lifeTime) || 0
        }
        if (typeof type.depreciationRate !== 'undefined' && type.depreciationRate !== null) {
          form.value.depreciationRate = Number(type.depreciationRate) || 0
        }
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
      // - Ở chế độ thêm (không nhân bản): luôn gán theo ngày mua
      // - Ở chế độ sửa: chỉ gán nếu đang trống (backend không có)
      // - Ở chế độ nhân bản: giữ nguyên startUsingDate từ tài sản gốc
      if (!isDuplicateMode.value && (props.mode === 'add' || !form.value.startUsingDate)) {
        form.value.startUsingDate = newDate
      }
    } else {
      form.value.trackedYear = new Date().getFullYear()
    }
  },
)

// Tự động tính tỷ lệ hao mòn = 100 / Số năm sử dụng
// và hao mòn năm = Nguyên giá / Số năm sử dụng
watch(
  () => form.value.lifeTime,
  (lifeTime) => {
    if (lifeTime && lifeTime > 0 && !depreciationRateTouched.value) {
      // Tỷ lệ hao mòn = 100 / Số năm sử dụng
      form.value.depreciationRate = 100 / lifeTime

      // Hao mòn năm = Nguyên giá / Số năm sử dụng
      const costNumber = Number(form.value.cost) || 0
      if (costNumber > 0) {
        form.value.depreciationValueYear = costNumber / lifeTime
      }
    }
  },
)

// Tự động tính giá trị hao mòn năm = Nguyên giá × Tỷ lệ hao mòn / 100
// Hoặc nếu người dùng chỉnh sửa lifeTime thì dùng: Nguyên giá / lifeTime
watch(
  [() => form.value.cost, () => form.value.depreciationRate],
  ([cost, rate]) => {
    const costNumber = Number(cost) || 0
    const rateNumber = Number(rate) || 0

    // Nếu lifeTime > 0, dùng công thức: cost / lifeTime
    // Nếu không, dùng công thức: cost * rate / 100
    let calc = 0
    if (form.value.lifeTime && form.value.lifeTime > 0) {
      calc = costNumber / form.value.lifeTime
    } else {
      calc = (costNumber * rateNumber) / 100
    }

    if (calc !== form.value.depreciationValueYear) {
      form.value.depreciationValueYear = calc
    }
  },
)

// Tự động tính khấu hao lũy kế = Giá trị hao mòn năm × (Năm theo dõi - Năm bắt đầu sử dụng)
watch(
  [() => form.value.depreciationValueYear, () => form.value.startUsingDate, () => form.value.trackedYear],
  ([depreciationValueYear, startUsingDate, trackedYear]) => {
    const deprecYear = Number(depreciationValueYear) || 0
    const trackedYearNum = Number(trackedYear) || new Date().getFullYear()

    // Tính năm bắt đầu sử dụng từ startUsingDate
    let startYear = trackedYearNum
    if (startUsingDate) {
      const startDate = new Date(startUsingDate)
      startYear = startDate.getFullYear()
    }

    // Số năm đã sử dụng = Năm theo dõi - Năm bắt đầu
    // Nếu ngày bắt đầu > năm theo dõi, dùng giá trị tuyệt đối (cho phép tính lùi)
    let yearsUsed = trackedYearNum - startYear

    // Nếu tài sản chưa bắt đầu sử dụng (startYear > trackedYearNum), để HM/KH = 0
    // Nếu muốn tính với giá trị tuyệt đối, bỏ comment dòng dưới
    yearsUsed = Math.abs(yearsUsed)

    // // Luôn >= 0
    // yearsUsed = Math.max(0, yearsUsed)

    // Khấu hao lũy kế = Giá trị hao mòn năm × Số năm đã sử dụng
    const accumulatedDepreciation = deprecYear * yearsUsed
    form.value.accumulatedDepreciation = accumulatedDepreciation
  },
)

// Reset form khi initialData thay đổi
watch(
  () => props.initialData,
  (newData) => {
    if (newData && (props.mode === 'edit' || newData.duplicateMode)) {
      isDuplicateMode.value = newData.duplicateMode ? true : false
      skipAssetTypeAutofill.value = true
      form.value = mapBackendDataToForm(newData, props.departments, props.assetTypes, normalizeDate)

      if (newData.duplicateMode) {
        form.value.fixed_asset_id = null;
        form.value.id = null;
      }

      nextTick(() => {
        skipAssetTypeAutofill.value = false
      })
      // Lưu bản sao dữ liệu gốc
      originalFormData.value = JSON.parse(JSON.stringify(form.value))
    } else {
      isDuplicateMode.value = false
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
    startUsingDate: normalizeDate(new Date()),
    // Tự động set năm theo dõi theo ngày mua hiện tại
    trackedYear: new Date().getFullYear(),
    lifeTime: 0,
    depreciationValueYear: 0,
    accumulatedDepreciation: 0,
  }
  lifeTimeTouched.value = false
  depreciationRateTouched.value = false
  errors.value = {
    assetCode: '',
    assetName: '',
    departmentId: '',
    assetTypeId: '',
    quantity: '',
    cost: '',
    depreciationRate: '',
    purchaseDate: '',
    startUsingDate: '',
    lifeTime: '',
    depreciationValueYear: '',
  }
  originalFormData.value = null
}

/**
 * Xử lý khi người dùng chỉnh sửa số năm sử dụng
 * @returns {void}
 * Created by NVBan - 28/01/2026
 */
const handleLifeTimeInput = () => {
  lifeTimeTouched.value = true
}

/**
 * Xử lý khi người dùng chỉnh sửa tỷ lệ hao mòn
 * @returns {void}
 * Created by NVBan - 28/01/2026
 */
const handleDepreciationRateInput = () => {
  depreciationRateTouched.value = true
}

/**
 * Kiểm tra tính hợp lệ của form tài sản
 * @returns {Object} - Object chứa isValid và firstMissingField
 * Created by NVBan - 28/01/2026
 */
const validateForm = () => {
  const { errors: newErrors, isValid, firstMissingField } = validateAssetForm(form.value)
  errors.value = newErrors
  return { isValid, firstMissingField }
}

/**
 * Kiểm tra xem form có thay đổi so với dữ liệu gốc không
 * @returns {boolean} - True nếu có thay đổi
 * Created by NVBan - 28/01/2026
 */
const hasChanges = () => {
  if (!originalFormData.value) return false
  return JSON.stringify(form.value) !== JSON.stringify(originalFormData.value)
}

/**
 * Kiểm tra xem form thêm có dữ liệu nhập vào không
 * @returns {boolean} - True nếu form trống
 * Created by NVBan - 28/01/2026
 */
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

/**
 * Đóng dialog mà không kiểm tra thay đổi
 * @returns {void}
 * Created by NVBan - 28/01/2026
 */
const closeDialogDirectly = () => {
  emit('update:modelValue', false)
  resetForm()
}

/**
 * Xử lý đóng form với kiểm tra thay đổi
 * @returns {void}
 * Created by NVBan - 28/01/2026
 */
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

/**
 * Xử lý lưu tài sản
 * @async
 * @returns {Promise<void>}
 * Created by NVBan - 28/01/2026
 */
const handleSave = async () => {
  try {
    isLoading.value = true

    // Validate form
    const { isValid, firstMissingField } = validateForm()
    if (!isValid) {
      const label = firstMissingField || 'thông tin bắt buộc'
      showAlert({ text: `Cần nhập thông tin <strong>${label}</strong>.` })
      isLoading.value = false
      return
    }

    const formData = mapFormToBackendData(form.value)

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
  /* Chia grid thành 12 phần bằng nhau */
  grid-template-columns: repeat(12, 1fr);
  gap: 10px 16px; /* Khoảng cách giữa các ô */
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
}

/* Các lớp định nghĩa độ rộng ô */
.col-4 {
  grid-column: span 4;
}
.col-8 {
  grid-column: span 8;
}

.form-group label {
  font-size: 13px;
  color: #000;
  margin-bottom: 2px;
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

:deep(.text-right .ms-input) {
  text-align: right;
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

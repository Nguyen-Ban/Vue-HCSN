<template>
  <MsDialog
    v-model="isOpen"
    :title="mode === 'add' ? 'Thêm tài sản' : 'Sửa tài sản'"
    width="900px"
  >
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
        <MsInput v-model.number="form.nguyenGia" type="number" />
      </div>
      <div class="form-group col-4">
        <label>Tỷ lệ hao mòn (%) <span class="required">*</span></label>
        <MsInput v-model.number="form.tyLeHaoMon" type="number" />
      </div>

      <div class="form-group col-3">
        <label>Ngày mua <span class="required">*</span></label>
        <MsInput v-model="form.ngayMua" type="date" />
      </div>
      <div class="form-group col-4">
        <label>Ngày bắt đầu sử dụng <span class="required">*</span></label>
        <MsInput v-model="form.ngayBatDauSuDung" type="date" />
      </div>
      <div class="form-group col-4">
        <label>Năm theo dõi</label>
        <MsInput v-model.number="form.namBatDauTheoDoi" type="number" disabled />
      </div>

      <div class="form-group col-3">
        <label>Số năm sử dụng <span class="required">*</span></label>
        <MsInput v-model.number="form.soNamSuDung" type="number" />
      </div>
      <div class="form-group col-4">
        <label>Giá trị hao mòn năm <span class="required">*</span></label>
        <MsInput v-model.number="form.giaTriHaoMonNam" type="number" />
      </div>
      </div>

    <template #footer>
      <MsButton type="default" @click="handleClose" style="min-width: 100px;" :disabled="isLoading">Hủy</MsButton>
      <MsButton type="primary" @click="handleSave" style="min-width: 100px;" :disabled="isLoading">
        {{ isLoading ? 'Đang lưu...' : 'Lưu' }}
      </MsButton>
    </template>
  </MsDialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import MsDialog from '@/components/MsDialog.vue';
import MsInput from '@/components/MsInput.vue';
import MsCombobox from '@/components/MsCombobox.vue';
import MsButton from '@/components/MsButton.vue';
import fixedAssetApi from '@/apis/fixedAssetApi';

const props = defineProps({
  modelValue: Boolean,
  mode: { type: String, default: 'add' }, // 'add' hoặc 'edit'
  initialData: Object,
  departments: Array,
  assetTypes: Array
});

const emit = defineEmits(['update:modelValue', 'save']);

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const form = ref({
  assetCode: '',
  assetName: '',
  assetTypeId: '',
  assetTypeName: '',
  departmentId: '',
  departmentName: '',
  quantity: 1,
  nguyenGia: 0,
  tyLeHaoMon: 0,
  ngayMua: '',
  ngayBatDauSuDung: '',
  namBatDauTheoDoi: new Date().getFullYear(),
  namSuDung: 0,
  soNamSuDung: 0,
  giaTriHaoMonNam: 0
});

const isLoading = ref(false);

// Watch departmentId để tự động điền departmentName
watch(() => form.value.departmentId, (newId) => {
  if (newId) {
    const dept = props.departments?.find(d => d.id === newId);
    if (dept) {
      form.value.departmentName = dept.name;
    }
  } else {
    form.value.departmentName = '';
  }
});

// Watch assetTypeId để tự động điền assetTypeName
watch(() => form.value.assetTypeId, (newId) => {
  if (newId) {
    const type = props.assetTypes?.find(t => t.id === newId);
    if (type) {
      form.value.assetTypeName = type.name;
    }
  } else {
    form.value.assetTypeName = '';
  }
});

// Reset form khi initialData thay đổi
watch(() => props.initialData, (newData) => {
  if (newData) {
    form.value = { ...newData };
  } else {
    resetForm();
  }
}, { deep: true });

const resetForm = () => {
  form.value = {
    assetCode: '',
    assetName: '',
    assetTypeId: '',
    assetTypeName: '',
    departmentId: '',
    departmentName: '',
    quantity: 1,
    nguyenGia: 0,
    tyLeHaoMon: 0,
    ngayMua: '',
    ngayBatDauSuDung: '',
    namBatDauTheoDoi: new Date().getFullYear(),
    namSuDung: 0,
    soNamSuDung: 0,
    giaTriHaoMonNam: 0
  };
};

const handleClose = () => {
  emit('update:modelValue', false);
  resetForm();
};

const handleSave = async () => {
  try {
    isLoading.value = true;

    // Validate dữ liệu cơ bản
    if (!form.value.assetCode?.trim()) {
      alert('Vui lòng nhập mã tài sản');
      return;
    }
    if (!form.value.assetName?.trim()) {
      alert('Vui lòng nhập tên tài sản');
      return;
    }

    const formData = {
      fixed_asset_code: form.value.assetCode,
      fixed_asset_name: form.value.assetName,
      department_id: form.value.departmentId,
      department_name: form.value.departmentName,
      fixed_asset_category_id: form.value.assetTypeId,
      fixed_asset_category_name: form.value.assetTypeName,
      quantity: form.value.quantity,
      cost: form.value.nguyenGia,
      depreciation_rate: form.value.tyLeHaoMon,
      purchase_date: form.value.ngayMua,
      used_start_date: form.value.ngayBatDauSuDung,
      tracked_year: form.value.namBatDauTheoDoi,
      used_years: form.value.soNamSuDung,
      depreciation_value_year: form.value.giaTriHaoMonNam
    };

    if (props.mode === 'add') {
      await fixedAssetApi.create(formData);
      alert('Thêm tài sản thành công!');
    } else {
      // Thêm API update khi backend hỗ trợ
      console.log('Cập nhật tài sản:', formData);
      alert('Sửa tài sản thành công!');
    }

    emit('save', form.value);
    handleClose();
  } catch (error) {
    console.error('Lỗi khi lưu tài sản:', error);
    if (error.response?.data?.message) {
      alert(`Lỗi: ${error.response.data.message}`);
    } else {
      alert('Không thể lưu tài sản. Vui lòng thử lại!');
    }
  } finally {
    isLoading.value = false;
  }
};
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
.col-3 { grid-column: span 3; }
.col-4 { grid-column: span 4; }
.col-8 { grid-column: span 8; }

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

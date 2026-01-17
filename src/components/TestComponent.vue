<template>
  <div class="playground">
    <h1>DEMO BASE COMPONENTS (DESIGN SYSTEM)</h1>

    <section class="section">
      <h2>1. Buttons</h2>
      <div class="row">
        <MsButton type="primary">Thêm tài sản</MsButton>
        <MsButton type="primary" icon="fa fa-plus" positionIcon="left">Thêm (Icon Trái)</MsButton>
        <MsButton type="secondary">Hủy bỏ</MsButton>
        <MsButton type="danger">Xóa dữ liệu</MsButton>
        <MsButton type="link" icon="fa fa-pencil" title="Sửa"></MsButton>
        <MsButton type="link" icon="fa fa-trash" style="color: red" title="Xóa"></MsButton>
      </div>
    </section>

    <section class="section">
      <h2>2. Inputs & Combobox</h2>
      <div class="row">
        <MsInput
            label="Mã tài sản"
            v-model="formData.assetCode"
            placeholder="Nhập mã tài sản"
            required
            :errorMessage="!formData.assetCode ? 'Mã không được để trống' : ''"
        />

        <MsInput
            label="Nguyên giá"
            type="number"
            v-model="formData.cost"
            class="text-right"
        />

        <MsInput
            placeholder="Tìm kiếm tài sản..."
            icon="fa fa-search"
            v-model="searchText"
        />

        <MsCombobox
            label="Loại tài sản"
            v-model="formData.categoryId"
            :options="categoryOptions"
            itemText="name"
            itemValue="id"
            placeholder="Chọn loại tài sản"
            icon="fa fa-filter"
        />
      </div>
      <div class="debug-box">
        Giá trị Form: {{ formData }} <br> Search: {{ searchText }}
      </div>
    </section>

    <section class="section">
      <h2>3. Table & Pagination</h2>
      <div style="height: 400px; border: 1px solid #ccc;">
        <MsTable
            :columns="tableColumns"
            :data="tableData"
        >
            <template #cost="{ value }">
                <div style="text-align: right; font-weight: bold;">
                    {{ new Intl.NumberFormat('vi-VN').format(value) }} đ
                </div>
            </template>

             <template #action="{ row }">
                <MsButton type="link" icon="fa fa-pencil" @click="editItem(row)"></MsButton>
                <MsButton type="link" icon="fa fa-clone" @click="duplicateItem(row)"></MsButton>
            </template>

            <template #footer>
                <MsPagination
                    :total="200"
                    v-model:pageSize="pageSize"
                    v-model:currentPage="currentPage"
                />
            </template>
        </MsTable>
      </div>
    </section>

    <section class="section">
        <h2>4. Popup (Dialog)</h2>
        <MsButton @click="showDialog = true">Mở Form Thêm Mới</MsButton>

        <MsDialog v-model="showDialog" title="Thêm mới tài sản">
            <div class="form-grid">
                <MsInput label="Mã tài sản" required v-model="formData.assetCode" />
                <MsInput label="Tên tài sản" required v-model="formData.assetName" />
                <MsCombobox label="Bộ phận sử dụng" :options="deptOptions" itemText="name" itemValue="id" />
                <MsInput label="Số lượng" type="number" />
                <MsInput label="Nguyên giá" type="number" />
            </div>

            <template #footer>
                <MsButton type="secondary" @click="showDialog = false">Hủy</MsButton>
                <MsButton type="primary" @click="saveData">Lưu</MsButton>
            </template>
        </MSDialog>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

// Import Base Components
import MsButton from './MsButton.vue';
import MsInput from './MsInput.vue';
import MsCombobox from './MsCombobox.vue';
import MsTable from './MsTable.vue';
import MsPagination from './MsPagination.vue';
import MsDialog from './MsDialog.vue';
// --- DATA MẪU ---
const searchText = ref('');
const showDialog = ref(false);
const pageSize = ref(20);
const currentPage = ref(1);

const formData = reactive({
    assetCode: 'TS0001',
    assetName: 'Máy tính Dell Inspiron',
    categoryId: 1,
    cost: 15000000
});

const categoryOptions = [
    { id: 1, name: 'Máy vi tính xách tay' },
    { id: 2, name: 'Máy chiếu' },
    { id: 3, name: 'Bàn ghế văn phòng' }
];

const deptOptions = [
    { id: 'dp1', name: 'Phòng Hành chính' },
    { id: 'dp2', name: 'Phòng CNTT' }
];

// Cấu hình cột cho Table
const tableColumns = [
    { key: 'assetCode', title: 'Mã tài sản', width: '100px' },
    { key: 'assetName', title: 'Tên tài sản', width: '250px' },
    { key: 'categoryName', title: 'Loại tài sản', width: '200px' },
    { key: 'deptName', title: 'Bộ phận sử dụng', width: '200px' },
    { key: 'quantity', title: 'Số lượng', width: '100px', align: 'right', type: 'number' },
    { key: 'cost', title: 'Nguyên giá', width: '150px', align: 'right', type: 'number' } // Sẽ dùng slot custom
];

// Dữ liệu giả cho Table
const tableData = ref([
    { id: 1, assetCode: 'TS0001', assetName: 'Dell Inspiron 3467', categoryName: 'Laptop', deptName: 'Phòng HCNS', quantity: 1, cost: 20000000 },
    { id: 2, assetCode: 'TS0002', assetName: 'Máy chiếu Sony', categoryName: 'Thiết bị', deptName: 'Phòng Đào tạo', quantity: 2, cost: 15000000 },
    { id: 3, assetCode: 'TS0003', assetName: 'Bàn làm việc', categoryName: 'Nội thất', deptName: 'Phòng Kế toán', quantity: 10, cost: 5000000 },
    { id: 4, assetCode: 'TS0004', assetName: 'Ghế xoay', categoryName: 'Nội thất', deptName: 'Phòng Kế toán', quantity: 10, cost: 2000000 },
]);

// --- METHODS ---
const editItem = (row) => {
    alert(`Sửa tài sản: ${row.assetName}`);
    showDialog.value = true;
};

const duplicateItem = (row) => {
    alert(`Nhân bản tài sản ID: ${row.assetCode}`);
};

const saveData = () => {
    alert('Đã lưu dữ liệu!');
    showDialog.value = false;
};
</script>

<style scoped>
.playground {
    padding: 20px;
    background-color: #f4f7ff;
    min-height: 100vh;
}
.section {
    background: #fff;
    padding: 20px;
    margin-bottom: 20px;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
h1 { margin-bottom: 20px; color: #1AA1FF; }
h2 { margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
.row {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
    align-items: center;
}
.debug-box {
    margin-top: 10px;
    padding: 10px;
    background: #eee;
    font-family: monospace;
}
.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 20px;
}
/* Style cho icon font-awesome nếu chưa có */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');
</style>

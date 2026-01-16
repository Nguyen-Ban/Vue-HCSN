<template>
  <div class="ms-grid-container">
    <div class="ms-table-scroll" ref="bodyScroll" @scroll="syncFooterScroll">
      <table>
        <colgroup>
          <col style="width: 50px">
          <col v-for="col in columns" :key="col.key" :style="{ width: col.width }">
          <col style="width: 100px">
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
              {{ col.title }}
            </th>

            <th class="ms-th-action sticky-col-right" style="text-align: center">
              Chức năng
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in data" :key="row.id || index">
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
import { ref, computed, onMounted, nextTick } from 'vue';

const props = defineProps({
  columns: Array, // [{ key: 'assetCode', title: 'Mã tài sản', align: 'left', width: '100px' }]
  data: Array
});

const selectedRows = ref([]); // Chứa ID các dòng được chọn
const bodyScroll = ref(null);
const footerScroll = ref(null);

// Logic chọn tất cả
const isAllSelected = computed(() => {
    return props.data.length > 0 && selectedRows.value.length === props.data.length;
});
const toggleAll = (e) => {
    if (e.target.checked) selectedRows.value = props.data.map(i => i.id);
    else selectedRows.value = [];
};

// Hàm format đơn giản (nếu không dùng slot)
const formatData = (val, type) => {
    if (type === 'number') return new Intl.NumberFormat('vi-VN').format(val);
    return val;
};

// Hàm tính toán sticky position
const getThStyle = (col, index) => {
    const baseStyle = { textAlign: col.align || 'left' };
    if (!col.sticky) return baseStyle;

    let leftPos = 40; // checkbox width
    for (let i = 0; i < index; i++) {
        const w = props.columns[i].width;
        leftPos += parseInt(w);
    }

    return {
        ...baseStyle,
        position: 'sticky',
        left: leftPos + 'px',
        zIndex: 9,
        backgroundColor: '#f5f5f5',
    };
};

const getTdStyle = (col, index) => {
    const baseStyle = { textAlign: col.align || 'left' };
    if (!col.sticky) return baseStyle;

    let leftPos = 40; // checkbox width
    for (let i = 0; i < index; i++) {
        const w = props.columns[i].width;
        leftPos += parseInt(w);
    }

    return {
        ...baseStyle,
        position: 'sticky',
        left: leftPos + 'px',
        backgroundColor: '#fff',
        zIndex: 2,
    };
};

  // Đồng bộ cuộn ngang giữa phần thân bảng và footer tổng
  const syncFooterScroll = () => {
    if (!bodyScroll.value || !footerScroll.value) return;
    footerScroll.value.scrollLeft = bodyScroll.value.scrollLeft;
  };

  onMounted(() => {
    nextTick(syncFooterScroll);
  });
</script>

<style scoped>
.ms-grid-container {
    border: 1px solid #afafaf;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
    padding: 10px 16px;
    position: sticky;
    top: 0;
    z-index: 10;
    border-bottom: 1px solid #e0e0e0;
    box-sizing: border-box;
}
td {
    padding: 10px 16px;
    border-bottom: 1px solid #e0e0e0;
    box-sizing: border-box;
}
tr:hover {
    background-color: #f2f9ff; /* Hover màu xanh nhạt theo style MISA */
}
.ms-th-checkbox, .ms-td-checkbox {
    width: 50px;
    text-align: center;
}
.action-group {
    display: flex;
    justify-content: center;
    gap: 8px;
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

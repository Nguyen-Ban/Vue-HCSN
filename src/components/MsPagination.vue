<template>
  <div class="ms-pagination">
    <div class="ms-pagination-left">
        Tổng số: <strong>{{ total }}</strong> bản ghi
    </div>

    <div class="ms-pagination-right">
        <div class="ms-page-size">
            <select :value="pageSize" @change="$emit('update:pageSize', Number($event.target.value))">
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
            </select>
        </div>

        <div class="ms-page-control">
             <button
                class="ms-page-btn"
                :disabled="currentPage === 1"
                @click="$emit('update:currentPage', currentPage - 1)"
             >
                Trước
             </button>

             <span class="ms-page-info"> {{ currentPage }} </span>

             <button
                class="ms-page-btn"
                @click="$emit('update:currentPage', currentPage + 1)"
             >
                Sau
             </button>
        </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
    total: { type: Number, default: 0 },
    pageSize: { type: Number, default: 20 },
    currentPage: { type: Number, default: 1 }
});
defineEmits(['update:pageSize', 'update:currentPage']);
</script>

<style scoped>
.ms-pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    font-size: 13px;
}
.ms-pagination-right {
    display: flex;
    align-items: center;
    gap: 16px;
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
    background: none;
    cursor: pointer;
    font-weight: 500;
    color: #1f1f1f;
}
.ms-page-btn:disabled {
    color: #ccc;
    cursor: not-allowed;
}
.ms-page-info {
    padding: 0 8px;
    font-weight: bold;
}
</style>

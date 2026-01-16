<template>
  <div class="ms-combo-wrapper">
    <div v-if="label" class="ms-label">{{ label }}</div>
    <div class="ms-combo-container">
        <div v-if="icon" class="ms-combo-icon">
             <div :class="icon"></div>
        </div>

        <input
            type="text"
            class="ms-select"
            :class="{ 'has-icon': icon, 'open': isOpen }"
            :value="searchText"
            :placeholder="placeholder || 'Chọn giá trị'"
            @input="onSearch"
            @focus="onFocus"
            @keydown.escape="isOpen = false"
        />

        <div class="ms-combo-arrow" @click="toggleDropdown">
            <div class="icon icon-caret-down"></div>
        </div>

        <!-- Custom Dropdown -->
        <div v-if="isOpen" class="ms-dropdown" @click.stop>
            <div class="ms-dropdown-header">
                <div class="ms-dropdown-col">Mã</div>
                <div class="ms-dropdown-col">Tên</div>
            </div>
            <div v-if="filteredOptions.length > 0" class="ms-dropdown-body">
                <div
                    v-for="item in filteredOptions"
                    :key="item[itemValue]"
                    class="ms-dropdown-item"
                    :class="{ 'selected': modelValue === item[itemValue] }"
                    @click="selectItem(item)"
                >
                    <div class="ms-dropdown-col">{{ item[itemCode] }}</div>
                    <div class="ms-dropdown-col">{{ item[itemText] }}</div>
                </div>
            </div>
            <div v-else class="ms-dropdown-empty">
                Không tìm thấy kết quả
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  modelValue: [String, Number],
  label: String,
  icon: String,
  options: Array,

  itemText: { type: String, default: 'name' },
  itemCode: { type: String, default: 'code' },
  itemValue: { type: String, default: 'id' },

  placeholder: String,

  /** MỚI */
  displayMode: {
    type: String,
    default: 'text' // 'text' | 'code'
  },
  filterBy: {
    type: String,
    default: 'text' // 'text' | 'code' | 'both'
  }
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const searchText = ref('');

const selectedItem = computed(() =>
  props.options?.find(item => item[props.itemValue] === props.modelValue)
);

/**
 * 🔍 LỌC – chỉ theo tên nếu filterBy = text
 */
const filteredOptions = computed(() => {
  if (!searchText.value.trim()) return props.options || [];

  const keyword = searchText.value.toLowerCase();

  return props.options?.filter(item => {
    if (props.filterBy === 'text') {
      return item[props.itemText]?.toLowerCase().includes(keyword);
    }
    if (props.filterBy === 'code') {
      return item[props.itemCode]?.toLowerCase().includes(keyword);
    }
    return (
      item[props.itemText]?.toLowerCase().includes(keyword) ||
      item[props.itemCode]?.toLowerCase().includes(keyword)
    );
  }) || [];
});

/**
 * ✍️ Gõ tìm kiếm
 */
const onSearch = (e) => {
  searchText.value = e.target.value;
  isOpen.value = true;
};

/**
 * 🎯 Focus
 */
const onFocus = () => {
  isOpen.value = true;
  searchText.value = '';
};

/**
 * ✅ Chọn item
 */
const selectItem = (item) => {
  emit('update:modelValue', item[props.itemValue]);

  // Sau khi chọn → hiển thị theo mode
  searchText.value =
    props.displayMode === 'code'
      ? item[props.itemCode]
      : item[props.itemText];

  isOpen.value = false;
};

/**
 * 🔁 Khi modelValue đổi từ bên ngoài
 */
watch(selectedItem, (item) => {
  if (!item) {
    searchText.value = '';
    return;
  }

  searchText.value =
    props.displayMode === 'code'
      ? item[props.itemCode]
      : item[props.itemText];
});

/**
 * ❌ Click ngoài
 */
const closeDropdown = (e) => {
  if (!e.target.closest('.ms-combo-wrapper')) {
    isOpen.value = false;
  }
};

onMounted(() => document.addEventListener('click', closeDropdown));
onUnmounted(() => document.removeEventListener('click', closeDropdown));
</script>


<style scoped>
.ms-combo-wrapper {
    position: relative;
    min-width: 200px;
}
.ms-combo-container {
    position: relative;
}
.ms-select {
    width: 100%;
    height: 36px;
    border-radius: 2.5px;
    border: 1px solid #afafaf;
    padding: 0 12px;
    padding-right: 30px;
    background: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    font-size: 13px;
    font-family: inherit;
}
.ms-select.has-icon {
    padding-left: 36px;
}
.ms-select:hover,
.ms-select:focus,
.ms-select.open {
    border-color: #1AA1FF;
    outline: none;
}
.ms-select::placeholder {
    color: #999;
}
.ms-combo-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    z-index: 1;
}
.ms-combo-arrow {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 10px;
    cursor: pointer;
    z-index: 1;
}

/* Dropdown */
.ms-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    width: 100%;
    max-height: 300px;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 2.5px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    z-index: 1000;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}
.ms-dropdown-header {
    display: flex;
    background: #0066CC;
    color: #fff;
    font-weight: 600;
    font-size: 13px;
    padding: 8px;
    border-bottom: 1px solid #ccc;
}
.ms-dropdown-header .ms-dropdown-col:first-child {
    width: 80px;
    flex-shrink: 0;
}
.ms-dropdown-header .ms-dropdown-col:last-child {
    flex: 1;
}
.ms-dropdown-body {
    overflow-y: auto;
    max-height: 260px;
}
.ms-dropdown-item {
    display: flex;
    padding: 8px;
    cursor: pointer;
    font-size: 13px;
    border-bottom: 1px solid #f0f0f0;
}
.ms-dropdown-item:hover {
    background: #e6f2ff;
}
.ms-dropdown-item.selected {
    background: #cce5ff;
}
.ms-dropdown-item .ms-dropdown-col:first-child {
    width: 80px;
    flex-shrink: 0;
    font-weight: 500;
}
.ms-dropdown-item .ms-dropdown-col:last-child {
    flex: 1;
    color: #333;
}
.ms-dropdown-empty {
    padding: 12px;
    text-align: center;
    color: #999;
    font-size: 13px;
}
</style>

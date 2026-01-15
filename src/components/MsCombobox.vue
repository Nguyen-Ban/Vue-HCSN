<template>
  <div class="ms-combo-wrapper">
    <div v-if="label" class="ms-label">{{ label }}</div>
    <div class="ms-combo-container">
        <div v-if="icon" class="ms-combo-icon">
             <div :class="icon"></div>
        </div>

        <select
            class="ms-select"
            :class="{ 'has-icon': icon }"
            :value="modelValue"
            @change="$emit('update:modelValue', $event.target.value)"
        >
            <option value="" disabled selected>{{ placeholder || 'Chọn giá trị' }}</option>
            <option
                v-for="item in options"
                :key="item[itemValue]"
                :value="item[itemValue]"
            >
                {{ item[itemText] }}
            </option>
        </select>

        <div class="ms-combo-arrow">
            <div class="icon icon-caret-down"></div>
        </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
    modelValue: [String, Number],
    label: String,
    icon: String, // Icon cái phễu lọc
    options: Array, // [{ id: 1, name: 'TS01' }]
    itemText: { type: String, default: 'name' }, // Tên trường hiển thị
    itemValue: { type: String, default: 'id' },  // Tên trường lấy giá trị
    placeholder: String
});
defineEmits(['update:modelValue']);
</script>

<style scoped>
.ms-combo-wrapper {
    position: relative;
    min-width: 200px;
}
.ms-select {
    width: 100%;
    height: 36px;
    border-radius: 2.5px;
    border: 1px solid #afafaf;
    padding: 0 12px;
    padding-right: 30px; /* Chừa chỗ mũi tên */
    appearance: none; /* Ẩn mũi tên mặc định browser */
    background: #fff;
    cursor: pointer;
}
.ms-select.has-icon {
    padding-left: 36px;
}
.ms-select:focus {
    border-color: #1AA1FF;
    outline: none;
}
.ms-combo-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
}
.ms-combo-arrow {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    font-size: 10px;
}
</style>

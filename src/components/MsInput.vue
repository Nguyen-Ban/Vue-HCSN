<template>
  <div class="ms-input-wrapper" :class="{ 'has-error': errorMessage }">
    <label v-if="label" class="ms-label">
        {{ label }} <span v-if="required" style="color: red">*</span>
    </label>

    <div class="ms-input-container">
        <div v-if="icon" class="ms-input-icon">
            <div :class="icon"></div>
        </div>

        <input
            class="ms-input"
            :class="{ 'has-icon': icon, 'text-right': type === 'number' }"
            :type="type"
            :placeholder="placeholder"
            :value="modelValue"
            @input="$emit('update:modelValue', $event.target.value)"
        />
    </div>

    <span v-if="errorMessage" class="ms-error-msg">{{ errorMessage }}</span>
  </div>
</template>

<script setup>
defineProps({
    modelValue: [String, Number],
    label: String,
    placeholder: String,
    icon: String, // Class icon (vd: 'fa fa-search')
    type: { type: String, default: 'text' },
    required: Boolean,
    errorMessage: String
});
defineEmits(['update:modelValue']);
</script>

<style scoped>
.ms-input-wrapper {
    display: flex;
    flex-direction: column;
    margin-bottom: 16px;
    position: relative;
}
.ms-label {
    font-weight: 500;
    margin-bottom: 8px;
    font-size: 13px;
}
.ms-input-container {
    position: relative;
}
.ms-input {
    width: 100%;
    height: 36px;
    border-radius: 2.5px;
    border: 1px solid #afafaf;
    padding: 0 12px;
    outline: none;
    font-size: 13px;
}
.ms-input::placeholder {
    font-style: italic;
    color: #999;
}
.ms-input:focus {
    border-color: #1AA1FF;
}
.ms-input.has-icon {
    padding-left: 36px; /* Chừa chỗ cho icon */
}
.ms-input-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
}
.text-right {
    text-align: right;
}
/* Trạng thái lỗi */
.has-error .ms-input {
    border-color: #ff4d4f;
}
.ms-error-msg {
    color: #ff4d4f;
    font-size: 11px;
    margin-top: 4px;
}
</style>

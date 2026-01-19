<template>
  <div class="ms-input-wrapper" :class="{ 'has-error': errorMessage }">
    <label v-if="label" class="ms-label">
      {{ label }} <span v-if="required" style="color: red">*</span>
    </label>

    <div class="ms-input-container">
      <input
        class="ms-input"
        :class="{ 'has-spinner': hasSpinner, 'text-right': type === 'number', disabled: disabled }"
        :type="type"
        :placeholder="placeholder"
        :value="modelValue"
        :disabled="disabled"
        @input="handleInput"
      />

      <!-- Spinner cho input number -->
      <div v-if="hasSpinner" class="ms-input-spinner" :class="{ disabled: disabled }">
        <div
          class="spinner-up"
          @mousedown="startIncrement"
          @mouseup="stopChange"
          @mouseleave="stopChange"
        >
          <div class="icon icon-caret-up"></div>
        </div>
        <div
          class="spinner-down"
          @mousedown="startDecrement"
          @mouseup="stopChange"
          @mouseleave="stopChange"
        >
          <div class="icon icon-caret-down"></div>
        </div>
      </div>
    </div>

    <span v-if="errorMessage" class="ms-error-msg">{{ errorMessage }}</span>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: [String, Number],
  label: String,
  placeholder: String,
  icon: String, // Class icon - nếu có và type='number' sẽ hiện spinner
  type: { type: String, default: 'text' },
  required: Boolean,
  errorMessage: String,
  disabled: Boolean,
  step: { type: Number, default: 1 },
  min: { type: Number, default: null },
  max: { type: Number, default: null },
})

const emit = defineEmits(['update:modelValue'])

// Chỉ hiện spinner khi có icon và type là number
const hasSpinner = computed(() => props.icon && props.type === 'number')

const intervalId = ref(null)
const timeoutId = ref(null)

const handleInput = (e) => {
  let value = e.target.value

  if (props.type === 'number') {
    value = value === '' ? 0 : Number(value)
    if (props.min !== null && value < props.min) value = props.min
    if (props.max !== null && value > props.max) value = props.max
  }

  emit('update:modelValue', value)
}

const increment = () => {
  if (props.disabled) return
  let currentValue = Number(props.modelValue) || 0
  let newValue = currentValue + props.step
  if (props.max !== null && newValue > props.max) newValue = props.max
  emit('update:modelValue', newValue)
}

const decrement = () => {
  if (props.disabled) return
  let currentValue = Number(props.modelValue) || 0
  let newValue = currentValue - props.step
  if (props.min !== null && newValue < props.min) newValue = props.min
  emit('update:modelValue', newValue)
}

const startIncrement = (e) => {
  e.preventDefault()
  if (props.disabled) return
  increment()
  timeoutId.value = setTimeout(() => {
    intervalId.value = setInterval(increment, 100)
  }, 500)
}

const startDecrement = (e) => {
  e.preventDefault()
  if (props.disabled) return
  decrement()
  timeoutId.value = setTimeout(() => {
    intervalId.value = setInterval(decrement, 100)
  }, 500)
}

const stopChange = () => {
  if (timeoutId.value) {
    clearTimeout(timeoutId.value)
    timeoutId.value = null
  }
  if (intervalId.value) {
    clearInterval(intervalId.value)
    intervalId.value = null
  }
}

onUnmounted(() => {
  stopChange()
})
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
  border-color: #1aa1ff;
}
.ms-input.has-spinner {
  padding-right: 24px; /* Chừa chỗ cho spinner */
}
.ms-input:disabled {
  background-color: #f0f0f0;
  cursor: not-allowed;
  color: #666;
  border-color: #d9d9d9;
}
.text-right {
  text-align: right;
}

/* Ẩn spinner mặc định của browser */
.ms-input[type='number']::-webkit-inner-spin-button,
.ms-input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.ms-input[type='number'] {
  -moz-appearance: textfield;
}

/* Number Spinner */
.ms-input-spinner {
  position: absolute;
  right: 1px;
  top: 50%;
  transform: translateY(-50%);
  height: 20px;
  width: 20px;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 0 2px 2px 0;
  overflow: hidden;
}

.ms-input-spinner.disabled {
  background-color: #f0f0f0;
  pointer-events: none;
}

.spinner-up,
.spinner-down {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.1s;
}

/* .spinner-up:hover,
.spinner-down:hover {
  background-color: #e6f2ff;
}

.spinner-up:active,
.spinner-down:active {
  background-color: #cce5ff;
} */

/* .spinner-up {
  border-bottom: 0.5px solid #afafaf;
}

.spinner-down {
  border-top: 0.5px solid #afafaf;
} */

.spinner-up .icon,
.spinner-down .icon {
  font-size: 8px;
  color: #666;
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

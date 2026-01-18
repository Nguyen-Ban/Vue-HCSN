<template>
  <div class="toast-container">
    <transition-group name="toast">
      <div
        v-for="toast in state.toasts"
        :key="toast.id"
        class="toast-item"
        :class="`toast-${toast.type}`"
      >
        <div class="toast-icon">
          <component :is="iconMap[toast.type]" class="icon" />
        </div>
        <div class="toast-message">{{ toast.message }}</div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { state } from '../stores/notification'
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
  WarningFilled,
} from '@ant-design/icons-vue'

const iconMap = {
  success: CheckCircleFilled,
  error: CloseCircleFilled,
  info: ExclamationCircleFilled,
  warning: WarningFilled,
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px; /* Bo góc mềm mại hơn chút */
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 300px;
  max-width: 400px;
  /* ĐÃ XÓA: border-left ở đây */
}

/* Cấu hình khung chứa icon để tạo vòng mờ */
.toast-icon {
  flex-shrink: 0;

  /* Kích thước vòng tròn */
  width: 32px;
  height: 32px;
  border-radius: 50%;

  display: grid;
  place-items: center;

  line-height: 0;
}

/* Icon bên trong */
.toast-icon .icon {
  font-size: 18px;

  display: flex;
  align-items: center;
  justify-content: center;
}
/* SUCCESS */
.toast-success .toast-icon {
  background-color: rgba(82, 196, 26, 0.15); /* Màu xanh lá mờ (độ trong suốt 15%) */
}
.toast-success .icon {
  color: #52c41a;
}

/* ERROR */
.toast-error .toast-icon {
  background-color: rgba(255, 77, 79, 0.15); /* Màu đỏ mờ */
}
.toast-error .icon {
  color: #ff4d4f;
}

/* INFO */
.toast-info .toast-icon {
  background-color: rgba(24, 144, 255, 0.15); /* Màu xanh dương mờ */
}
.toast-info .icon {
  color: #1890ff;
}

/* WARNING */
.toast-warning .toast-icon {
  background-color: rgba(250, 173, 20, 0.15); /* Màu vàng cam mờ */
}
.toast-warning .icon {
  color: #faad14;
}

/* --- Các phần khác giữ nguyên --- */
.toast-message {
  flex: 1;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>

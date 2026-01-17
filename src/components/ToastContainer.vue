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
          <div
            class="icon"
            :class="{
              'icon-check-circle': toast.type === 'success',
              'icon-exclamation-circle': toast.type === 'error',
              'icon-info-circle': toast.type === 'info',
              'icon-warning': toast.type === 'warning',
            }"
          ></div>
        </div>
        <div class="toast-message">{{ toast.message }}</div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { state } from '../stores/notification'
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
  border-radius: 4px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 300px;
  max-width: 400px;
}

.toast-icon {
  flex-shrink: 0;
  font-size: 20px;
}

.toast-message {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.toast-success {
  border-left: 4px solid #52c41a;
}

.toast-success .icon {
  color: #52c41a;
}

.toast-error {
  border-left: 4px solid #ff4d4f;
}

.toast-error .icon {
  color: #ff4d4f;
}

.toast-info {
  border-left: 4px solid #1890ff;
}

.toast-info .icon {
  color: #1890ff;
}

.toast-warning {
  border-left: 4px solid #faad14;
}

.toast-warning .icon {
  color: #faad14;
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

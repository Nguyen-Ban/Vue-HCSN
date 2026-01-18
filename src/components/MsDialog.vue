<template>
  <div class="ms-popup-overlay" v-if="modelValue">
    <div class="ms-popup" :style="{ width: width }">
      <div class="ms-popup-header">
        <div class="ms-popup-title">{{ title }}</div>
        <div class="ms-popup-close" @click="close" title="Đóng (Esc)">
            <div class="icon icon-close"></div> </div>
      </div>

      <div class="ms-popup-body">
        <slot></slot>
      </div>

      <div class="ms-popup-footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false }, // Trạng thái đóng/mở
  title: { type: String, default: 'Tiêu đề' },
  width: { type: String, default: '800px' }
});

const emit = defineEmits(['update:modelValue']);

const close = () => {
  emit('update:modelValue', false);
};
</script>

<style scoped>
.ms-popup-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.ms-popup {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  max-height: 90vh; /* Không cao quá màn hình */
}

.ms-popup-header {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 0px 24px;
}

.ms-popup-title {
  font-size: 18px;
  font-weight: 700;
}

.ms-popup-close {
  cursor: pointer;
  font-size: 20px;
  color: #666;
  width: 24px;
  height: 24px;
  display: flex; align-items: center; justify-content: center;
}
.ms-popup-close:hover {
  background-color: #eee;
  border-radius: 50%;
}

.ms-popup-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.ms-popup-footer {
  height: 52px;
  background-color: #f5f5f5;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: flex-end; /* Nút nằm bên phải */
  gap: 10px;
  border-radius: 0 0 4px 4px;
}
</style>

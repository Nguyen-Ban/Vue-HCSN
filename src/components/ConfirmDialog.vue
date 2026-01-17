<template>
  <MsDialog :modelValue="visible" @update:modelValue="handleClose" :width="480">
    <template #header>
      <div style="display: flex; align-items: center; gap: 12px">
        <div class="icon icon-warning" style="color: #faad14; font-size: 24px"></div>
        <span style="font-weight: 600; font-size: 16px">{{ state.confirm.title }}</span>
      </div>
    </template>

    <template #content>
      <div style="padding: 16px 0; font-size: 14px; color: #333">
        {{ state.confirm.text }}
      </div>
    </template>

    <template #footer>
      <div style="display: flex; justify-content: flex-end; gap: 12px">
        <MsButton @click="handleCancel">Không</MsButton>
        <MsButton type="primary" @click="handleConfirm">Xóa</MsButton>
      </div>
    </template>
  </MsDialog>
</template>

<script setup>
import { computed } from 'vue'
import { state, closeConfirm } from '../stores/notification'
import MsDialog from './MsDialog.vue'
import MsButton from './MsButton.vue'

const visible = computed(() => state.confirm.visible)

const handleConfirm = () => {
  if (state.confirm.onConfirm) {
    state.confirm.onConfirm()
  }
  closeConfirm()
}

const handleCancel = () => {
  if (state.confirm.onCancel) {
    state.confirm.onCancel()
  }
  closeConfirm()
}

const handleClose = (value) => {
  if (!value) {
    handleCancel()
  }
}
</script>

<template>
  <teleport to="body">
    <div v-if="visible" class="confirm-overlay" role="dialog" aria-modal="true">
      <div class="confirm-modal">
        <div class="confirm-content">
          <div class="confirm-body">
            <div class="icon-container">
              <WarningFilled style="color: #faad14; font-size: 36px" />
            </div>
            <div class="text-content">
              <span v-html="formattedText"></span>
            </div>
          </div>

          <div class="confirm-footer">
            <template v-if="state.confirm.mode === 'unsaved'">
              <MsButton type="outline" @click="handleCancel" class="btn-left"> Hủy bỏ </MsButton>

              <div class="right-group">
                <MsButton type="outline" @click="handleDeny">Không lưu</MsButton>
                <MsButton type="primary" @click="handleConfirm">Lưu</MsButton>
              </div>
            </template>

            <template v-else>
              <MsButton type="outline" @click="handleCancel">Không</MsButton>
              <MsButton type="primary" @click="handleConfirm">Xóa</MsButton>
            </template>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { computed } from 'vue'
import { state, closeConfirm } from '../stores/notification'
import { WarningFilled } from '@ant-design/icons-vue'
import MsButton from './MsButton.vue'

const visible = computed({
  get: () => state.confirm.visible,
  set: (val) => {
    if (!val) closeConfirm()
  },
})

const handleConfirm = () => {
  if (state.confirm.onConfirm) state.confirm.onConfirm()
  closeConfirm()
}
const handleDeny = () => {
  if (state.confirm.onDeny) state.confirm.onDeny()
  closeConfirm()
}
const handleCancel = () => {
  if (state.confirm.onCancel) state.confirm.onCancel()
  closeConfirm()
}

// Format text: In đậm số lượng (04) và mã tài sản <<...>>
const formattedText = computed(() => {
  let text = state.confirm.text || ''
  text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;') // Escape HTML
  text = text.replace(/&lt;&lt;(.*?)&gt;&gt;/g, '<strong>&lt;&lt;$1&gt;&gt;</strong>') // Bold <<...>>
  text = text.replace(/\b(\d{2,})\b/g, '<strong>$1</strong>') // Bold số lượng (02, 10...)
  return text
})
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
}

.confirm-modal {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  width: 450px;
  max-width: calc(100vw - 32px);
}

.confirm-content {
  padding: 32px 32px 20px 32px; /* Padding chuẩn theo thiết kế */
}

.confirm-body {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 32px;
  border-bottom: 1px solid #f0f0f0; /* Đường kẻ mờ ngăn cách footer */
  padding-bottom: 24px;
}

.icon-container {
  display: flex;
  align-items: center;
}

.text-content {
  margin-top: 5px;
  color: #1f1f1f;
  font-size: 14px;
  line-height: 1.5;
}

.confirm-footer {
  display: flex;
  justify-content: flex-end; /* Mặc định căn phải */
  gap: 12px;
}

/* Style riêng cho footer 3 nút */
.ms-confirm-dialog .confirm-footer:has(.btn-left) {
  justify-content: space-between; /* Hủy bỏ sang trái, 2 nút kia sang phải */
}

.right-group {
  display: flex;
  gap: 12px;
}
</style>

import { reactive } from 'vue'

const state = reactive({
  toasts: [],
  confirm: {
    visible: false,
    model: 'delete', // 'delete' (2 nút) hoặc 'unsaved' (3 nút)
    title: '',
    text: '',
    onConfirm: null, // Nút "Xóa" hoặc "Lưu"
    onDeny: null,    // Nút "Không lưu" (cho trường hợp 3 nút)
    onCancel: null,  // Nút "Không" hoặc "Hủy bỏ"
  },
})

let toastId = 0

export function showToast({ message, type = 'success', duration = 3000 }) {
  const id = toastId++
  const toast = { id, message, type, duration }
  state.toasts.push(toast)

  if (duration > 0) {
    setTimeout(() => {
      const index = state.toasts.findIndex((t) => t.id === id)
      if (index > -1) state.toasts.splice(index, 1)
    }, duration)
  }
}

// Hàm cho trường hợp Xóa (2 nút)
export function showDeleteConfirm({ title, text, onConfirm, onCancel }) {
  state.confirm = {
    visible: true,
    mode: 'delete',
    title: title || 'Thông báo',
    text: text,
    onConfirm: onConfirm || (() => {}),
    onCancel: onCancel || (() => {}),
    onDeny: null
  }
}

// Hàm cho trường hợp Dữ liệu thay đổi (3 nút)
export function showUnsavedChangeConfirm({ title, text, onConfirm, onDeny, onCancel }) {
  state.confirm = {
    visible: true,
    mode: 'unsaved',
    title: title || 'Dữ liệu chưa được lưu',
    text: text || 'Thông tin thay đổi sẽ không được cập nhật nếu bạn không lưu. Bạn có muốn lưu các thay đổi này?',
    onConfirm: onConfirm || (() => {}),
    onDeny: onDeny || (() => {}),
    onCancel: onCancel || (() => {})
  }
}

export function closeConfirm() {
  state.confirm.visible = false
}

export { state }

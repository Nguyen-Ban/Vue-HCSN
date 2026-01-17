import { reactive } from 'vue'

const state = reactive({
  toasts: [],
  confirm: {
    visible: false,
    title: '',
    text: '',
    onConfirm: null,
    onCancel: null,
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

export function showConfirm({ title, text, onConfirm, onCancel }) {
  state.confirm = {
    visible: true,
    title,
    text,
    onConfirm: onConfirm || (() => {}),
    onCancel: onCancel || (() => {}),
  }
}

export function closeConfirm() {
  state.confirm.visible = false
}

export { state }

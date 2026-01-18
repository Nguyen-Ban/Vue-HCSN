<template>
  <button :class="['ms-button', `ms-button--${type}`]">
    <div
      v-if="icon && positionIcon === 'left'"
      class="ms-button__icon ms-button__icon--left"
      :class="icon"
    ></div>

    <span class="ms-button__content">
      <slot></slot>
    </span>

    <div
      v-if="icon && positionIcon === 'right'"
      class="ms-button__icon ms-button__icon--right"
      :class="icon"
    ></div>
  </button>
</template>

<script setup>
//#region Props
defineProps({
  icon: {
    type: Object,
    default: null,
  },
  positionIcon: {
    type: String,
    default: 'left',
    validator: (value) => ['left', 'right'].includes(value),
  },
  type: {
    type: String,
    default: 'primary',
  },
})
//#endregion
</script>

<style scoped>
.ms-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border: none;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s ease;
  border-radius: 3px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.16);
  height: 36px;
  overflow: hidden;
}

.ms-button--primary {
  background-color: #1aa4c8;
  color: white;
}

.ms-button--default {
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #d9d9d9;
}

.ms-button--default:hover {
  background-color: #e6e6e6;
  border-color: #b3b3b3;
}

.ms-button--link {
  background: none;
  color: #1976d2;
  padding: 0;
}

.ms-button--warning {
  background-color: #ff9800;
  color: white;
}

.ms-button--danger {
  background-color: #dc3545;
  color: white;
}

.ms-button__content {
  white-space: nowrap;
}

.ms-button__icon {
  display: inline-flex;
  align-items: center;
}

.ms-button__icon--left {
  margin-right: 8px;
}

.ms-button__icon--right {
  margin-left: 8px;
}
</style>

<!-- <style lang="scss" scoped>
.ms-button {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;

  // Type modifiers
  &--primary {
    background-color: #1976d2;
    color: white;
  }

  &--link {
    background: none;
    color: #1976d2;
    padding: 0;
  }

  &--warning {
    background-color: #ff9800;
    color: white;
  }

  &--danger {
    background-color: #dc3545;
    color: white;
  }

  // Elements
  &__content {
    white-space: nowrap;
  }

  &__icon {
    display: inline-flex;
    align-items: center;

    // Icon modifiers
    &--left {
      margin-right: 8px;
    }

    &--right {
      margin-left: 8px;
    }
  }
}
</style> -->

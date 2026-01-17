<script setup>
import { RouterView } from 'vue-router'
import TheHeader from './layouts/TheHeader.vue'
import TheSidebar from './layouts/TheSidebar.vue'
import ToastContainer from './components/ToastContainer.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
</script>

<template>
  <div class="container flex">
    <TheSidebar />
    <div class="content flex flex-column flex1">
      <TheHeader />
      <div class="main-content flex1">
        <RouterView />
      </div>
    </div>
    <ToastContainer />
    <ConfirmDialog />
  </div>
</template>

<style scoped>
.container {
  width: auto;
  height: 100vh;
  display: flex;
}
.content {
  overflow: hidden;
}
.main-content {
  overflow: hidden;
  position: relative;
}
</style>

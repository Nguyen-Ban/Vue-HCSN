<script setup>
import { RouterView } from 'vue-router'
import { ref } from 'vue';
import TheHeader from './layouts/TheHeader.vue';
import TheSidebar from './layouts/TheSidebar.vue';

// Lưu trạng thái sidebar được active hiện tại (mặc định là item 0)
</script>

<template>
  <div class="container flex">
    <TheSidebar />
    <div class="content flex flex-column flex1">
      <TheHeader/>
      <div class="main-content flex1">
        <RouterView />
      </div>
    </div>
    <ToastHost />
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

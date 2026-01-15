<template>
  <div class="sidebar" :class="{ 'collapsed': !isOpen }">
    <div class="sidebar-logo">
      <div class="icon icon-logo"></div>
      <div v-if="isOpen" class="logo-text">MISA QLTS</div>
    </div>

    <div class="sidebar-menu">
      <router-link to="/overview" class="menu-item" active-class="active">
        <div class="menu-icon"><div class="icon icon-overview"></div></div>
        <span v-if="isOpen" class="menu-text">Tổng quan</span>
      </router-link>

      <router-link to="/assets" class="menu-item" active-class="active">
        <div class="menu-icon"><div class="icon icon-assets"></div></div>
        <span v-if="isOpen" class="menu-text">Tài sản</span>
        <div v-if="isOpen" class="menu-arrow"><div class="icon icon-arrow-down"></div></div>
      </router-link>

      <router-link to="/ht-db" class="menu-item" active-class="active">
        <div class="menu-icon"><div class="icon icon-ht-db"></div></div>
        <span v-if="isOpen" class="menu-text">Tài sản HT-ĐB</span>
        <div v-if="isOpen" class="menu-arrow"><div class="icon icon-arrow-down"></div></div>
      </router-link>

      <router-link to="/tools" class="menu-item" active-class="active">
        <div class="menu-icon"><div class="icon icon-tools"></div></div>
        <span v-if="isOpen" class="menu-text">Công cụ dụng cụ</span>
        <div v-if="isOpen" class="menu-arrow"><div class="icon icon-arrow-down"></div></div>
      </router-link>

      <router-link to="/category" class="menu-item" active-class="active">
        <div class="menu-icon"><div class="icon icon-category"></div></div>
        <span v-if="isOpen" class="menu-text">Danh mục</span>
      </router-link>

      <router-link to="/search" class="menu-item" active-class="active">
        <div class="menu-icon"><div class="icon icon-sidebar-search"></div></div>
        <span v-if="isOpen" class="menu-text">Tra cứu</span>
        <div v-if="isOpen" class="menu-arrow"><div class="icon icon-arrow-down"></div></div>
      </router-link>

      <router-link to="/report" class="menu-item" active-class="active">
        <div class="menu-icon"><div class="icon icon-report"></div></div>
        <span v-if="isOpen" class="menu-text">Báo cáo</span>
        <div v-if="isOpen" class="menu-arrow"><div class="icon icon-arrow-down"></div></div>
      </router-link>
    </div>

    <div class="sidebar-footer">
      <div class="toggle-box" @click="toggleSidebar">
        <div :class="isOpen ? 'icon icon-arrow-right' : 'icon icon-arrow-left'"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const isOpen = ref(true);

const toggleSidebar = () => {
  isOpen.value = !isOpen.value;
  // Emit event ra ngoài nếu AppLayout cần biết để chỉnh margin
};
</script>

<style scoped>
.sidebar {
  width: 200px;
  height: 100vh;
  background-color: #1c3048;
  color: #fff;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  flex-shrink: 0;
  box-shadow: inset 0 3px 6px rgba(0, 0, 0, .16);
}

.sidebar.collapsed {
  width: 66px;
}

/* Logo */
.sidebar-logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  overflow: hidden;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

/* Menu */
.sidebar-menu {
  flex: 1;
  overflow-y: auto;
  padding-top: 4px;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  padding: 0 16px;
  margin: 2px 0;
  cursor: pointer;
  color: #fff;
  text-decoration: none;
  opacity: .5;
  transition: all 0.2s;
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: #fff;
  opacity: .8;
}

.menu-item.active {
  background-color: #1aa4c8;
  color: #fff;
  opacity: 1;
  border-radius: 4px;
  margin-left: 8px;
  margin-right: 8px;
  padding: 0 10px;
}

.collapsed .menu-item.active {
  margin-left: 4px;
  margin-right: 4px;
  padding: 0 4px;
}

.menu-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-right: 10px;
}

.collapsed .menu-icon {
  margin-right: 0;
}

.menu-text {
  flex: 1;
  font-size: 13px;
  white-space: nowrap;
}

.menu-arrow {
  font-size: 10px;
  opacity: 0.8;
}

/* Footer Toggle */
.sidebar-footer {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: flex-end; /* Nút nằm bên phải khi mở */
  padding: 0 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.collapsed .sidebar-footer {
  justify-content: center;
  padding: 0;
}

.toggle-box {
  width: 24px;
  height: 24px;
  /* background-color: rgba(255, 255, 255, 0.1); */
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid #fff;
  opacity: .8;
  font-size: 12px;
}
</style>

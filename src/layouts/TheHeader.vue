<template>
  <div class="header">
    <div class="header-left">
      <div class="header-title">Danh sách tài sản</div>
    </div>

    <div class="header-right">
      <div class="header-org">Sở tài chính</div>

      <div class="header-year">
        <span class="year-label">Năm</span>
        <div class="year-number">2021
          <div class="caret-up-down">
            <div class="icon icon-caret-up"></div>
            <div class="icon icon-caret-down"></div>
          </div>
        </div>
        </div>

      <div class="header-actions">
        <div class="action-item" title="Thông báo"><div class="icon-container"><div class="icon icon-bell"></div></div></div>
        <div class="action-item" title="Lưới"><div class="icon-container"><div class="icon icon-th-large"></div></div></div>
        <div class="action-item" title="Trợ giúp"><div class="icon-container"><div class="icon icon-question-circle"></div></div></div>
        <div class="user-profile">
            <div class="action-item"><div class="icon-container"><div class="icon icon-user"></div></div></div>
            <div class="icon icon-caret-down tiny-arrow"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header {
  height: 44px;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  width: 100%;
  overflow: hidden;
}

.header-title {
  font-weight: 700;
  font-size: 14px;
  color: #1f1f1f;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 14px;
}

.header-org {
  font-weight: 500;
  color: #001031;
}

.header-year {
  display: flex;
  align-items: center;
  padding: 8px 8px 8px 12px;
  cursor: pointer;
  background-color: rgba(26, 164, 200, .2);
  border-radius: 3px;
  width: 112px;
  height: 30px;
  overflow: hidden;
}
.year-label {
    font-weight: 400;
    margin-right: 16px;
}
.year-number {
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 4px;
}

.caret-up-down {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-left: 4px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.action-item {
  cursor: pointer;
}
.action-item:hover {
    color: #1AA1FF;
}

.icon-container {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.user-profile {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
}
.tiny-arrow {
    margin-left: 6px;
}
</style>

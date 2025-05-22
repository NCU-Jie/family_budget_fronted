<template>
  <el-container>
    <el-header>
      <div class="header-title">家庭记账系统</div>
    </el-header>
    <el-container>
      <el-aside width="200px" style="background-color: rgb(238, 241, 246)">
        <el-menu :default-openeds="['1']" router>
          <el-submenu index="1">
            <template slot="title"><i class="el-icon-message"></i>导航一</template>
            <el-menu-item-group>
              <template slot="title">分组一</template>
              <el-menu-item index="/manage">收支分类管理</el-menu-item>
              <el-menu-item index="/statistics">统计分析</el-menu-item>
            </el-menu-item-group>
            <el-menu-item-group title="分组2">
              <el-menu-item index="/other">其他选项</el-menu-item>
            </el-menu-item-group>
            
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: "HomeView",
  data() {
    return {
      activeMenu: this.$route.path, // 初始化为当前路由路径
    };
  },
  watch: {
    $route(to) {
      this.activeMenu = to.path; // 更新导航栏激活状态
    },
  },
};
</script>

<style scoped>
.header-title {
  font-size: 20px;
  color: #fff;
  text-align: center;
  line-height: 60px;
}

.el-header {
  background-color: #409eff;
  color: white;
  height: 60px;
}

.el-aside {
  background-color: #f5f5f5;
}
</style>

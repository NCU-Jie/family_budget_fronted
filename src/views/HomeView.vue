<template>
  <el-container>
    <el-header>
      <div class="header-container">
        <div class="header-title">家庭记账系统</div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link">
              <i class="el-icon-user"></i>
              {{ username }}<i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="logout">注销登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
    </el-header>
    <el-container>
      <el-aside width="200px" style="background-color: rgb(238, 241, 246)">
        <el-menu :default-openeds="['1']" router>
          <el-submenu index="1">
            <template slot="title"><i class="el-icon-message"></i>导航一</template>
            <el-menu-item index="/dashboard">首页</el-menu-item>
            <el-menu-item index="/account">记账页</el-menu-item>
            <el-menu-item index="/statistic">统计分析</el-menu-item>
            <el-menu-item index="/member">家庭成员管理</el-menu-item>
            <el-menu-item index="/category">收支分类管理</el-menu-item>
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
import { mapGetters } from 'vuex';

export default {
  name: "HomeView",
  data() {
    return {
      activeMenu: this.$route.path,
    };
  },
  computed: {
    ...mapGetters('user', ['userInfo']),
    username() {
      return this.userInfo?.name || '用户';
    }
  },
  methods: {
    handleCommand(command) {
      if (command === 'logout') {
        this.logout();
      }
    },
    async logout() {
      try {
        await this.$store.dispatch('user/logout');
        this.$message.success('注销成功');
        this.$router.push('/login');
      } catch (error) {
        this.$message.error(error.message || '注销失败');
      }
    }
  },
  watch: {
    $route(to) {
      this.activeMenu = to.path;
    },
  },
};
</script>

<style scoped>
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.header-title {
  font-size: 20px;
  color: #fff;
}

.header-right {
  color: #fff;
}

.el-dropdown-link {
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.el-icon-user {
  margin-right: 5px;
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
<template>
  <div class="login-container">
    <h1>登录</h1>
    <el-form :model="loginForm" ref="loginForm" class="login-form">
      <el-form-item prop="username">
        <el-input v-model="loginForm.username" placeholder="用户名"></el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input v-model="loginForm.password" type="password" placeholder="密码"></el-input>
      </el-form-item>
      <el-button type="primary" @click="handleLogin">登录</el-button>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "LoginPage", // 修改组件名称为多单词
  data() {
    return {
      loginForm: {
        username: "",
        password: "",
      },
    };
  },
  methods: {
    async handleLogin() {
      // 验证表单输入
      if (!this.loginForm.username || !this.loginForm.password) {
        this.$message.error('请输入用户名和密码');
        return;
      }

      try {
        // 调用 Vuex action 进行登录
        const success = await this.$store.dispatch('user/login', this.loginForm);
        if (success) {
          this.$message.success('登录成功');
          // 跳转到首页或重定向页面
          const redirect = this.$route.query.redirect || '/home';
          this.$router.push(redirect);
        } else {
          // 登录失败（错误信息已在 action 中处理）
        }
      } catch (error) {
        // 处理网络错误或其他异常
        this.$message.error(error.message || '登录失败，请稍后重试');
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.login-form {
  width: 300px;
}
</style>

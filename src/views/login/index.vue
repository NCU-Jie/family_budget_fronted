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
      <el-button 
        type="primary" 
        @click="handleLogin"
        :loading="loading"
        class="custom-login-btn"
      >
        登录
      </el-button>
      <div class="custom-login-link">
        还没有账号？<el-link type="primary" @click="goToRegister">立即注册</el-link>
      </div>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "LoginPage",
  data() {
    return {
      loginForm: {
        username: "",
        password: "",
      },
      loading: false
    };
  },
  methods: {
    goToRegister() {
      this.$router.push('/register');
    },
    async handleLogin() {
      if (!this.loginForm.username || !this.loginForm.password) {
        this.$message.error('请输入用户名和密码');
        return;
      }

      this.loading = true;
      try {
        const success = await this.$store.dispatch('user/login', this.loginForm);
        if (success) {
          this.$message.success('登录成功');
          const redirect = this.$route.query.redirect || '/home';
          this.$router.push(redirect);
        }
      } catch (error) {
        this.$message.error(error.message || '登录失败，请稍后重试');
      } finally {
        this.loading = false;
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
  width: 360px;
  padding: 30px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

/* 自定义登录按钮样式 - 与注册页保持一致 */
.custom-login-btn {
  width: 100%;
  margin-top: 10px;
  height: 40px;
  font-size: 16px;
  border-radius: 4px;
  background-color: #409EFF;
  border-color: #409EFF;
}

.custom-login-btn:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

.custom-login-btn:active {
  background-color: #3a8ee6;
  border-color: #3a8ee6;
}

/* 自定义登录链接样式 - 与注册页保持一致 */
.custom-login-link {
  margin-top: 15px;
  text-align: center;
  font-size: 14px;
  color: #606266;
}

.custom-login-link .el-link {
  font-size: 14px;
  vertical-align: baseline;
}
</style>
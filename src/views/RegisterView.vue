<template>
    <div class="register-container">
      <h1>注册</h1>
      <el-form :model="registerForm" :rules="rules" ref="registerForm" class="register-form">
        <el-form-item prop="name">
          <el-input v-model="registerForm.name" placeholder="名称" clearable></el-input>
        </el-form-item>

        <el-form-item prop="username">
          <el-input v-model="registerForm.username" placeholder="用户名" clearable></el-input>
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input 
            v-model="registerForm.password" 
            type="password" 
            placeholder="密码" 
            show-password
          ></el-input>
        </el-form-item>
        
        <el-form-item prop="confirmPassword">
          <el-input 
            v-model="registerForm.confirmPassword" 
            type="password" 
            placeholder="确认密码" 
            show-password
          ></el-input>
        </el-form-item>
        
        
        <el-button 
          type="primary" 
          @click="handleRegister" 
          :loading="loading"
        >
          注册
        </el-button>
        
        <div class="login-link">
          已有账号？<el-link type="primary" @click="goToLogin">立即登录</el-link>
        </div>
      </el-form>
    </div>
  </template>
  <script>
import { register } from '@/api/user';

  export default {
    name: "RegisterPage",
    data() {
      // 密码验证规则
      const validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码'));
        } else if (value.length < 6) {
          callback(new Error('密码长度不能少于6位'));
        } else {
          if (this.registerForm.confirmPassword !== '') {
            this.$refs.registerForm.validateField('confirmPassword');
          }
          callback();
        }
      };
      
      // 确认密码验证规则
      const validatePass2 = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'));
        } else if (value !== this.registerForm.password) {
          callback(new Error('两次输入密码不一致!'));
        } else {
          callback();
        }
      };
  
      return {
        loading: false,
        registerForm: {
          name: '',
          username: '',
          password: '',
          confirmPassword: '',
        },
        rules: {
          username: [
            { required: true, message: '请输入 ', trigger: 'blur' },
            { min: 3, max: 16, message: '长度在 3 到 16 个字符', trigger: 'blur' }
          ],
          password: [
            { required: true, validator: validatePass, trigger: 'blur' }
          ],
          confirmPassword: [
            { required: true, validator: validatePass2, trigger: 'blur' }
          ],
        }
      };
    },
    methods: {
      // 处理注册
      async handleRegister() {
        try {
          // 表单验证
          const valid = await this.$refs.registerForm.validate();
          if (!valid) return;
          
          this.loading = true;
          
          // 调用注册API
          const response = await register({
            name: this.registerForm.name,
            username: this.registerForm.username,
            password: this.registerForm.password,
          });
          
          if (response.data.code === 1) {
            this.$message.success('注册成功');
            // 跳转到登录页
            this.$router.push('/login');
      
          } else {
            this.$message.error(response.data.msg || '注册失败');
          }
        } catch (error) {
          console.error('注册失败:', error);
          this.$message.error(error.message || '注册失败');
        } finally {
          this.loading = false;
        }
      },
      
      // 跳转到登录页
      goToLogin() {
        this.$router.push('/login');
      }
    }
  };
  </script>
  <style scoped>
  .register-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: #f5f5f5;
  }
  
  .register-form {
    width: 360px;
    padding: 30px;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  
  .login-link {
    margin-top: 15px;
    text-align: center;
    font-size: 14px;
    color: #606266;
  }
  
  .el-button {
    width: 100%;
    margin-top: 10px;
  }
  </style>
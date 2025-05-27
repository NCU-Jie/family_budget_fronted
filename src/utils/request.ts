import axios from 'axios';
import store from '@/store'; 
const request= axios.create({
    baseURL: '/api/budget',
})
// 请求拦截器
request.interceptors.request.use(
    (config) => {
      // 确保config存在且有url属性
      if (config && config.url) {
        // 排除登录请求（更安全的判断方式）
        const isLoginRequest = /\/login$/i.test(config.url);
        
        if (!isLoginRequest) {
          const token = store.getters.token || localStorage.getItem('token');
          if (token) {
            config.headers = config.headers || {};
            config.headers.token = token;
          }
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
export default request;
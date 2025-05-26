// src/store/modules/user.ts
import { Module } from 'vuex';
import { login } from "@/api/login";
import { isValidToken } from "@/utils/auth";
// 定义用户信息类型
interface UserInfo {
  id: number;
  userName: string;
  name: string;
  token: string;
}

// 模块状态类型
interface UserState {
  userInfo: UserInfo | null;
}

const userModule: Module<UserState, any> = {
  namespaced: true,

  state: {
    userInfo: null
  },

  mutations: {
    // 保存用户信息
    SET_USER_INFO(state, payload: UserInfo) {
      state.userInfo = payload;
      // 可选：将 token 存入 localStorage
      localStorage.setItem('token', payload.token);
      sessionStorage.setItem('userInfo', JSON.stringify({
        id: payload.id,
        userName: payload.userName,
        name: payload.name
      }));
    },
    // 清除用户信息
    CLEAR_USER_INFO(state) {
      state.userInfo = null;
      localStorage.removeItem('token');
    }
  },

  actions: {
    // 登录动作
    async login({ commit }, credentials: { username: string; password: string }) {
      const res = await login(credentials); // 替换为实际 API 调用
      if (res.data.code === 1) {
        commit('SET_USER_INFO', res.data.data);

        return true;
      }
      throw new Error(res.data.msg || '登录失败');

    },
    // 退出登录
    logout({ commit }) {
      commit('CLEAR_USER_INFO');
    },
    // 初始化时从 localStorage 恢复 token
    initialize({ commit }) {
      // 1. 必须恢复token（认证基础）

      const token = localStorage.getItem('token');

      if (!token) return;

      // 2. 检查token有效性（示例函数）
      if (!isValidToken(token)) {
        console.log('token无效' + isValidToken(token))
        localStorage.removeItem('token');
        return;
      }

      // 2. 优先尝试从sessionStorage恢复
      const sessionData = sessionStorage.getItem('userInfo');
      if (sessionData) {
        try {
          const { id, name, userName } = JSON.parse(sessionData);
          commit('SET_USER_INFO', { id, name, userName, token });

          return;
        } catch (e) {
          sessionStorage.removeItem('userInfo');
        }
      }
      // 3. 尝试从 localStorage 恢复
      commit('SET_USER_INFO', { token });


    }
  },

  getters: {
    // 是否已登录
    isAuthenticated: state => !!state.userInfo?.token,
    // 获取 token
    token: state => state.userInfo?.token || null,
    // 获取用户信息
    userInfo: state => state.userInfo || null
  }
};

export default userModule;
import { Module } from 'vuex';
import { login } from "@/api/user";
import { isValidToken, parseToken } from "@/utils/auth"; // 添加parseToken方法

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
    SET_USER_INFO(state, payload: UserInfo) {
      // 验证必要字段
      if (typeof payload.id !== 'number'|| !payload.token) {
        throw new Error('Invalid user info');
      }
      
      state.userInfo = payload;
      localStorage.setItem('token', payload.token);
      
      // 仅当有有效数据时才写入sessionStorage
      if (payload.userName) {
        sessionStorage.setItem('userInfo', JSON.stringify({
          id: payload.id,
          userName: payload.userName,
          name: payload.name || ''
        }));
      } else {
        sessionStorage.removeItem('userInfo');
      }
    },
    // 清除用户信息
    CLEAR_USER_INFO(state) {
      state.userInfo = null;
      localStorage.removeItem('token');
      sessionStorage.removeItem('userInfo');
    }
  },

  actions: {
    // 登录动作
    async login({ commit }, credentials: { username: string; password: string }) {
      const res = await login(credentials);
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
      const token = localStorage.getItem('token');
      if (!token) return;

      // 检查token有效性
      if (!isValidToken(token)) {
        console.log('token无效');
        localStorage.removeItem('token');
        return;
      }

      // 优先尝试从sessionStorage恢复
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

      // 从token中解析用户信息
      try {
        const decoded = parseToken(token);
        if (decoded) {
          commit('SET_USER_INFO', {
            id: decoded.memberId,
            name: decoded.name || '',
            userName: decoded.userName || decoded.username || '',
            token
          });
        }
      } catch (e) {
        console.error('解析token失败:', e);
        localStorage.removeItem('token');
      }
    }
  },

  getters: {
    isAuthenticated: state => !!state.userInfo?.token,
    token: state => state.userInfo?.token || null,
    userInfo: state => state.userInfo || null,
    name: state => state.userInfo?.name || '',
  }
};

export default userModule;
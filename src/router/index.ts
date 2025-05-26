import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store' // 确保已导入Vuex store

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/index.vue"),
    meta: { 
      title: "登录", 
      hidden: true, 
      notNeedAuth: true // 明确标记不需要认证
    }
  },
  {
    path: '/home',
    component: () => import("@/views/HomeView.vue"),
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'dashboard',
        component: () => import("@/views/DashboardView.vue"),
        meta: { title: "首页" }
      },
      {
        path: '/account',
        component: () => import("@/views/AccountView.vue"),
        meta: { title: "记账页" }
      },
      {
        path: '/statistics',
        name: 'finance-statistics',
        component: () => import("@/views/StatisticsView.vue"),
        meta: { title: "统计分析" }
      },
    
      {
        path: '/member',
        name: 'finance-statistics',
        component: () => import("@/views/MemberView.vue"),
        meta: { title: "家庭成员管理" }
      },
      {
        path: '/categories',
        component: () => import("@/views/CategoriesView.vue"),
        meta: { title: "收支分类管理" }
      }
    ]
  },
];

const router = new VueRouter({
  routes
})


// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  // 初始化用户状态（恢复登录态）
  await store.dispatch('user/initialize');

  const isAuthenticated = store.getters['user/isAuthenticated'];

   // 2. 设置页面标题
  document.title = to.meta?.title+'-家庭记账';
  // 如果路由需要登录且用户未登录
  if (!to.meta?.notNeedAuth && !isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } 
  // 如果用户已登录却访问登录页，重定向到首页
  else if (to.name === 'Login' && isAuthenticated) {
    next({ path: '/home' });
  } 
  // 其他情况正常放行
  else {
    next();
  }
});


export default router
import Vue from 'vue'
import VueRouter from 'vue-router'
import { component } from 'vue/types/umd';

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: "/login",
    component: () => import("@/views/login/index.vue"),
    meta: { title: "家庭记账", hidden: true, notNeedAuth: true }
  },
  {
    path: '/home',
    component: () => import("@/views/HomeView.vue"),
    redirect:'/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'dashboard',
        component: () =>  import("@/views/DashboardView.vue"),
        meta: { title: "首页" }
      },
      {
        path: '/transaction',
        component: () => import("@/views/TransactionView.vue"),
        meta: { title: "收支分类管理" }
      },
      {
        path: '/statistics',
        name: 'finance-statistics',
        component: () => import("@/views/StatisticsView.vue"),
        meta: { title: "统计分析" }
      },
      {
        path: '/manage',
        name: 'finance-statistics',
        component: () => import("@/views/Manage.vue"),
        meta: { title: "统计分析" }
      },
      {
        path: '/member',
        name: 'finance-statistics',
        component: () => import("@/views/MemberView.vue"),
        meta: { title: "统计分析" }
      },
      {
        path: '/categories',
        component: () => import("@/views/CategoriesView.vue"),
      }
    ]
  },

];

const router = new VueRouter({
  routes
})

export default router

import Vue from 'vue'
import VueRouter from 'vue-router'

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
    name: 'home',
    component: () => import("@/views/HomeView.vue"),
    redirect:'/manage',
    children: [
      {
        path: '/manage',
        name: 'finance-manage',
        component: () => import("@/views/finance/Manage.vue"),
        meta: { title: "收支分类管理" }
      },
      {
        path: '/statistics',
        name: 'finance-statistics',
        component: () => import("@/views/finance/Statistics.vue"),
        meta: { title: "统计分析" }
      },
    ]
  },
  {
    path: '/manage',
    name: 'finance-manage',
    component: () => import("@/views/finance/Manage.vue"),
    meta: { title: "收支分类管理" }
  },
  {
    path: '/statistics',
    name: 'finance-statistics',
    component: () => import("@/views/finance/Statistics.vue"),
    meta: { title: "统计分析" }
  },
];

const router = new VueRouter({
  routes
})

export default router

<template>
  <div class="home-container">
    <!-- 欢迎区域 -->
    <div class="welcome-card">
      <el-card shadow="never">
        <div class="welcome-content">
          <div class="welcome-text">
            <h2>欢迎回来，{{ userName }}！</h2>
            <p class="sub-title">今天是 {{ currentDate }}，本月已消费 ¥{{ formatNumber(monthExpense) }}</p>
          </div>
          <el-avatar :size="60" :src="userAvatar" class="avatar"></el-avatar>
        </div>
      </el-card>
    </div>

    <!-- 快捷功能入口 -->
    <div class="quick-actions">
      <el-row :gutter="20">
        <el-col :span="6" v-for="action in quickActions" :key="action.text">
          <el-card shadow="hover" class="action-card" @click.native="handleAction(action)">
            <div class="action-content">
              <i :class="['icon', action.icon]" :style="{ color: action.color }"></i>
              <p>{{ action.text }}</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 收支概览 -->
    <div class="overview-section">
      <el-card>
        <div slot="header" class="clearfix">
          <span>近期收支</span>
          <el-button style="float: right; padding: 3px 0" type="text" @click="goToStatistic">
            查看全部 <i class="el-icon-arrow-right"></i>
          </el-button>
        </div>
        <div class="chart-container">
          <div id="mini-chart" style="height: 300px;"></div>
        </div>
        <div class="summary-data">
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="data-item">
                <p class="label">日均支出</p>
                <p class="value expense">¥{{ formatNumber(dailyExpense) }}</p>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="data-item">
                <p class="label">剩余预算</p>
                <p class="value budget">¥{{ formatNumber(remainingBudget) }}</p>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="data-item">
                <p class="label">收支比</p>
                <p class="value ratio">{{ incomeExpenseRatio }}%</p>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </div>

    <!-- 最近记录 -->
    <div class="recent-records">
      <el-card>
        <div slot="header" class="clearfix">
          <span>最近10笔记录</span>
          <el-button style="float: right; padding: 3px 0" type="text" @click="goToAccount">
            记一笔 <i class="el-icon-edit"></i>
          </el-button>
        </div>
        <el-table :data="recentRecords" style="width: 100%" height="300">
          <el-table-column prop="date" label="日期" width="100" />
          <el-table-column prop="type" label="类型" width="80">
            <template slot-scope="{row}">
              <el-tag :type="row.type === 'income' ? 'success' : 'danger'" size="mini">
                {{ row.type === 'income' ? '收入' : '支出' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="category" label="分类" width="120" />
          <el-table-column prop="amount" label="金额" align="right" width="120">
            <template slot-scope="{row}">
              <span :class="row.type === 'income' ? 'income-text' : 'expense-text'">
                {{ row.type === 'income' ? '+' : '-' }}{{ formatCurrency(row.amount) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="member" label="成员" width="100" />
          <el-table-column prop="remark" label="备注" />
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  data() {
    return {
      userName: '管理员',
      userAvatar: '',
      currentDate: this.formatDate(new Date()),
      quickActions: [
        { icon: 'el-icon-edit', text: '记一笔账', color: '#409EFF', path: '/addAccount' },
        { icon: 'el-icon-pie-chart', text: '统计分析', color: '#67C23A', path: '/statistic' },
        { icon: 'el-icon-user', text: '成员管理', color: '#F56C6C', path: '/member' },
        { icon: 'el-icon-setting', text: '分类管理', color: '#E6A23C', path: '/category' }
      ],
      monthExpense: 3250.68,
      dailyExpense: 108.36,
      remainingBudget: 1749.32,
      incomeExpenseRatio: 72,
      recentRecords: [
        { id: 1, date: '2023-06-15', type: 'expense', category: '餐饮美食', amount: 68.00, member: '爸爸', remark: '午餐' },
        { id: 2, date: '2023-06-15', type: 'income', category: '工资收入', amount: 8000.00, member: '妈妈', remark: '六月工资' },
        { id: 3, date: '2023-06-14', type: 'expense', category: '交通出行', amount: 15.00, member: '爷爷', remark: '公交车费' },
        { id: 4, date: '2023-06-14', type: 'expense', category: '医疗保健', amount: 125.00, member: '奶奶', remark: '购买药品' },
        { id: 5, date: '2023-06-13', type: 'expense', category: '教育培训', amount: 299.00, member: '孩子', remark: '课外辅导书' }
      ]
    };
  },
  mounted() {
    this.initMiniChart();
  },
  methods: {
    // 初始化迷你图表
    initMiniChart() {
      const chart = echarts.init(document.getElementById('mini-chart'));
      chart.setOption({
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category',
          data: ['6/10', '6/11', '6/12', '6/13', '6/14', '6/15']
        },
        yAxis: { type: 'value' },
        series: [
          {
            name: '支出',
            type: 'line',
            smooth: true,
            data: [120, 132, 101, 299, 190, 68],
            itemStyle: { color: '#F56C6C' }
          },
          {
            name: '收入',
            type: 'line',
            smooth: true,
            data: [0, 0, 0, 0, 0, 8000],
            itemStyle: { color: '#67C23A' }
          }
        ]
      });
      window.addEventListener('resize', () => chart.resize());
    },

    // 快捷操作处理
    handleAction(action) {
      this.$router.push(action.path);
    },

    // 路由跳转
    goToStatistic() {
      this.$router.push('/statistic');
    },
    goToAccount() {
      this.$router.push('/addAccount');
    },

    // 格式化工具
    formatDate(date) {
      const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
      return date.toLocaleDateString('zh-CN', options);
    },
    formatCurrency(value) {
      return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    formatNumber(value) {
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
  }
};
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.welcome-card {
  margin-bottom: 20px;
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-text h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.sub-title {
  margin: 10px 0 0;
  color: #909399;
}

.avatar {
  background-color: #409EFF;
  color: white;
  font-size: 24px;
}

.quick-actions {
  margin-bottom: 20px;
}

.action-card {
  cursor: pointer;
  transition: all 0.3s;
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.action-content {
  text-align: center;
  padding: 20px 0;
}

.action-content .icon {
  font-size: 30px;
  margin-bottom: 10px;
}

.overview-section {
  margin-bottom: 20px;
}

.summary-data {
  margin-top: 20px;
}

.data-item {
  text-align: center;
  padding: 10px;
}

.data-item .label {
  color: #909399;
  margin-bottom: 10px;
}

.data-item .value {
  font-size: 24px;
  font-weight: bold;
}

.expense {
  color: #F56C6C;
}

.budget {
  color: #409EFF;
}

.ratio {
  color: #67C23A;
}

.income-text {
  color: #67C23A;
}

.expense-text {
  color: #F56C6C;
}

.recent-records ::v-deep .el-table .cell {
  padding: 8px 0;
}
</style>
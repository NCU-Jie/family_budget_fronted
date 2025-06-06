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
          <el-table-column prop="accountDate" label="日期" width="100" />
          <el-table-column prop="typeId" label="类型" width="80">
            <template slot-scope="{row}">
              <el-tag :type="row.typeId === 0 ? 'success' : 'danger'" size="mini">
                {{ row.typeId === 0 ? '收入' : '支出' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="categoryName" label="分类" width="120" />
          <el-table-column prop="money" label="金额" width="120">
            <template slot-scope="{row}">
              <span :class="row.typeId === 0 ? 'income-text' : 'expense-text'">
                {{ row.typeId === 0 ? '+' : '-' }}{{ formatCurrency(row.money) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="memberName" label="成员" width="100" />
          <el-table-column prop="description" label="备注" />
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script>
import { getAccountList } from '@/api/account';
import { getStatistic } from '@/api/statistic';
import * as echarts from 'echarts';

export default {
  data() {
    return {
      currentDate: this.formatDate(new Date()),
      quickActions: [
        { icon: 'el-icon-edit', text: '记一笔账', color: '#409EFF', path: '/addAccount' },
        { icon: 'el-icon-pie-chart', text: '统计分析', color: '#67C23A', path: '/statistic' },
        { icon: 'el-icon-user', text: '成员管理', color: '#F56C6C', path: '/member' },
        { icon: 'el-icon-setting', text: '分类管理', color: '#E6A23C', path: '/category' }
      ],
      monthIncome: 0,
      monthExpense: 0,
      dailyExpense: 0,
      remainingBudget: 0,
      incomeExpenseRatio: 0,
      monthExpenselist: [],
      recentRecords: [
      ]
    };
  },

  created() {

    this.getMonthDataAndInitChart();
    this.getRecentRecords();
  },
  computed: {
    userName() {
      return this.$store.getters['user/name']; // 注意模块命名空间
    }
  },
  methods: {
 
    async getMonthDataAndInitChart() {
      try {
        const now = new Date();
        const beginDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1))
          .toISOString().split('T')[0];
        const today = new Date().toISOString().split('T')[0];
        // 1. 获取当月数据
        const response = await getStatistic({
          beginDate,
          endDate: today,
          groupType: 'day'
        });

        // 2. 保存原始数据
        this.monthExpenselist = response.data.data || [];
        const chartData = this.monthExpenselist;

        // 3. 计算月度统计数据
        const monthExpense = chartData.reduce((acc, cur) => acc + cur.expense, 0);
        const monthIncome = chartData.reduce((acc, cur) => acc + cur.income, 0);
        const year = now.getFullYear();
        const month = now.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        
        this.monthExpense = monthExpense;
        this.monthIncome = monthIncome;
        this.dailyExpense =( monthExpense / days).toFixed(2);
        this.remainingBudget = monthIncome - monthExpense;
        this.incomeExpenseRatio = (monthIncome / monthExpense * 100).toFixed(2);

        // 4. 初始化迷你图表
        this.initMiniChart(chartData);
        
      } catch (error) {
        console.error('获取月度数据失败:', error);
      }
    },

    initMiniChart(chartData) {
      if (!chartData || chartData.length === 0) {
        console.warn('没有可用的图表数据');
        return;
      }

      // 处理日期格式 (从 "2025-06-01" 转为 "6/1")
      const dates = chartData.map(item => {
        const [year, month, day] = item.groupName.split('-');
        return `${parseInt(month)}/${parseInt(day)}`;
      });

      // 获取收支数据
      const incomeData = chartData.map(item => item.income);
      const expenseData = chartData.map(item => item.expense);

      // 初始化图表
      const chart = echarts.init(document.getElementById('mini-chart'));
      
      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: params => {
            const date = params[0].axisValue;
            const income = params[1]?.value || 0;
            const expense = params[0]?.value || 0;
            return `日期: ${date}<br/>
                    收入: ¥${income.toFixed(2)}<br/>
                    支出: ¥${expense.toFixed(2)}`;
          }
        },
        xAxis: {
          type: 'category',
          data: dates,
          axisLabel: { interval: 0 } // 强制显示所有标签
        },
        yAxis: {
          type: 'value',
          axisLabel: { formatter: '¥{value}' }
        },
        series: [
          {
            name: '支出',
            type: 'line',
            smooth: true,
            data: expenseData,
            itemStyle: { color: '#F56C6C' },
            symbol: 'circle',
            symbolSize: 6
          },
          {
            name: '收入',
            type: 'line',
            smooth: true,
            data: incomeData,
            itemStyle: { color: '#67C23A' },
            symbol: 'circle',
            symbolSize: 6
          }
        ]
      };

      chart.setOption(option);
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
      // 确保是数字，并保留2位小数
      const num = Number(value).toFixed(2);

      // 处理整数部分的千分位
      return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    
    async getRecentRecords() {
      try {
        const res = await getAccountList({ page: 1, pageSize: 10 });
        if (res.data.code === 1) {
          this.recentRecords = res.data.data.records;
        } else {
          this.$message.error(res.data.msg);
        }
      } catch (error) {
        console.error('获取最近记录失败:', error);
        this.$message.error('获取最近记录失败');
      }
    }
  }
}
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
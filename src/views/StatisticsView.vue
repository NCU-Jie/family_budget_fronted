<template>
  <div class="statistics-container">
    <!-- 标题和筛选区域 -->
    <div class="header">
      <h2>家庭收支统计</h2>
      <div class="filters">
        <el-form :inline="true">
          <!-- 时间维度选择 -->
          <el-form-item label="时间维度">
            <el-radio-group v-model="timeRange" @change="loadData">
              <el-radio-button label="day">日</el-radio-button>
              <el-radio-button label="week">周</el-radio-button>
              <el-radio-button label="month">月</el-radio-button>
              <el-radio-button label="year">年</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <!-- 具体日期选择 -->
          <el-form-item label="选择日期">
            <el-date-picker
              v-model="selectedDate"
              :type="datePickerType"
              @change="loadData"
            />
          </el-form-item>

          <!-- 成员筛选 -->
          <el-form-item label="家庭成员">
            <el-select
              v-model="selectedMember"
              multiple
              collapse-tags
              placeholder="全部成员"
              @change="loadData"
            >
              <el-option
                v-for="member in members"
                :key="member.id"
                :label="member.name"
                :value="member.id"
              />
            </el-select>
          </el-form-item>

          <!-- 收支类型 -->
          <el-form-item label="收支类型">
            <el-select v-model="recordType" @change="loadData">
              <el-option label="全部" value="all" />
              <el-option label="收入" value="income" />
              <el-option label="支出" value="expense" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 数据概览卡片 -->
    <el-row :gutter="20" class="summary-cards">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="card-title">总收入</div>
          <div class="card-value income">¥ {{ formatNumber(summary.totalIncome) }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="card-title">总支出</div>
          <div class="card-value expense">¥ {{ formatNumber(summary.totalExpense) }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="card-title">结余</div>
          <div class="card-value" :class="summary.balance >= 0 ? 'income' : 'expense'">
            ¥ {{ formatNumber(summary.balance) }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="card-title">记录总数</div>
          <div class="card-value">{{ summary.totalRecords }} 笔</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 多形式展示区域 -->
    <el-tabs v-model="activeTab" type="card">
      <!-- 图表展示 -->
      <el-tab-pane label="图表分析" name="charts">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card>
              <h3>收支趋势</h3>
              <div id="trend-chart" style="height: 400px;"></div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card>
              <h3>分类占比</h3>
              <div id="category-chart" style="height: 400px;"></div>
            </el-card>
          </el-col>
        </el-row>
        <el-row style="margin-top: 20px;">
          <el-col :span="24">
            <el-card>
              <h3>成员收支对比</h3>
              <div id="member-chart" style="height: 300px;"></div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <!-- 表格展示 -->
      <el-tab-pane label="详细数据" name="table">
        <el-table
          :data="tableData"
          border
          style="width: 100%"
          v-loading="loading"
        >
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="member" label="成员" width="100" />
          <el-table-column prop="category" label="分类" width="120" />
          <el-table-column prop="type" label="类型" width="80">
            <template slot-scope="{row}">
              <el-tag :type="row.type === 'income' ? 'success' : 'danger'" size="small">
                {{ row.type === 'income' ? '收入' : '支出' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="金额" align="right" width="120">
            <template slot-scope="{row}">
              {{ formatCurrency(row.amount) }}
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" />
        </el-table>
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagination.currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          style="margin-top: 20px;"
        />
      </el-tab-pane>

      <!-- 分类统计 -->
      <el-tab-pane label="分类统计" name="category">
        <el-table
          :data="categoryStats"
          border
          style="width: 100%"
        >
          <el-table-column prop="category" label="分类" />
          <el-table-column label="收入" align="right">
            <template slot-scope="{row}">
              {{ formatCurrency(row.income) }}
            </template>
          </el-table-column>
          <el-table-column label="支出" align="right">
            <template slot-scope="{row}">
              {{ formatCurrency(row.expense) }}
            </template>
          </el-table-column>
          <el-table-column label="占比" width="150">
            <template slot-scope="{row}">
              <el-progress 
                :percentage="row.percentage" 
                :status="row.type === 'income' ? 'success' : 'exception'"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  data() {
    return {
      // 筛选条件
      timeRange: 'month',
      selectedDate: new Date(),
      selectedMember: [],
      recordType: 'all',
      
      // 数据展示
      activeTab: 'charts',
      summary: {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        totalRecords: 0
      },
      tableData: [],
      categoryStats: [],
      
      // 分页
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      
      // 基础数据
      members: [
        { id: 1, name: '爸爸' },
        { id: 2, name: '妈妈' },
        { id: 3, name: '爷爷' },
        { id: 4, name: '奶奶' },
        { id: 5, name: '孩子' }
      ],
      
      // 图表实例
      trendChart: null,
      categoryChart: null,
      memberChart: null,
      
      loading: false
    };
  },
  computed: {
    datePickerType() {
      const map = {
        day: 'date',
        week: 'week',
        month: 'month',
        year: 'year'
      };
      return map[this.timeRange];
    }
  },
  mounted() {
    this.initCharts();
    this.loadData();
  },
  methods: {
    // 初始化图表
    initCharts() {
      this.trendChart = echarts.init(document.getElementById('trend-chart'));
      this.categoryChart = echarts.init(document.getElementById('category-chart'));
      this.memberChart = echarts.init(document.getElementById('member-chart'));
      
      window.addEventListener('resize', this.resizeCharts);
    },
    
    resizeCharts() {
      this.trendChart?.resize();
      this.categoryChart?.resize();
      this.memberChart?.resize();
    },
    
    // 加载数据
    async loadData() {
      this.loading = true;
      
      try {
        // 模拟API请求
        // const params = this.getQueryParams();
        // const res = await this.$axios.get('/api/statistics', { params });
        
        // 模拟数据
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 更新汇总数据
        this.summary = {
          totalIncome: 15800,
          totalExpense: 12350,
          balance: 3450,
          totalRecords: 86
        };
        
        // 更新表格数据
        this.pagination.total = 86;
        this.tableData = this.generateMockTableData();
        
        // 更新分类统计
        this.categoryStats = [
          { category: '工资收入', type: 'income', income: 15000, expense: 0, percentage: 95 },
          { category: '餐饮美食', type: 'expense', income: 0, expense: 4500, percentage: 36 },
          // 其他分类数据...
        ];
        
        // 渲染图表
        this.renderCharts();
      } finally {
        this.loading = false;
      }
    },
    
    // 生成图表配置
    renderCharts() {
      // 收支趋势图
      this.trendChart.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['收入', '支出'] },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月']
        },
        yAxis: { type: 'value' },
        series: [
          {
            name: '收入',
            type: 'line',
            smooth: true,
            data: [5000, 6000, 5500, 7000, 6500, 8000],
            itemStyle: { color: '#67C23A' }
          },
          {
            name: '支出',
            type: 'line',
            smooth: true,
            data: [3500, 4000, 4200, 3800, 4500, 5000],
            itemStyle: { color: '#F56C6C' }
          }
        ]
      });
      
      // 分类占比图
      this.categoryChart.setOption({
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', right: 10, top: 'center' },
        series: [{
          name: '支出分类',
          type: 'pie',
          radius: ['40%', '70%'],
          data: [
            { value: 4500, name: '餐饮' },
            { value: 3200, name: '购物' },
            { value: 1800, name: '住房' },
            { value: 1500, name: '交通' },
            { value: 800, name: '娱乐' },
            { value: 550, name: '医疗' }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      });
      
      // 成员对比图
      this.memberChart.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { data: ['收入', '支出'] },
        xAxis: { type: 'value' },
        yAxis: {
          type: 'category',
          data: ['爸爸', '妈妈', '爷爷', '奶奶', '孩子']
        },
        series: [
          {
            name: '收入',
            type: 'bar',
            data: [8000, 6000, 1000, 800, 200],
            itemStyle: { color: '#67C23A' }
          },
          {
            name: '支出',
            type: 'bar',
            data: [4500, 4000, 1500, 1800, 550],
            itemStyle: { color: '#F56C6C' }
          }
        ]
      });
    },
    
    // 生成模拟表格数据
    generateMockTableData() {
      const mockData = [];
      const categories = ['餐饮', '购物', '住房', '交通', '娱乐', '医疗'];
      const members = ['爸爸', '妈妈', '爷爷', '奶奶', '孩子'];
      
      for (let i = 0; i < 10; i++) {
        const isIncome = Math.random() > 0.7;
        mockData.push({
          date: `2023-06-${10 + i}`,
          member: members[Math.floor(Math.random() * members.length)],
          category: categories[Math.floor(Math.random() * categories.length)],
          type: isIncome ? 'income' : 'expense',
          amount: isIncome 
            ? Math.floor(Math.random() * 5000) + 3000 
            : Math.floor(Math.random() * 1000) + 200,
          remark: isIncome ? '工资收入' : '日常消费'
        });
      }
      
      return mockData;
    },
    
    // 分页处理
    handleSizeChange(val) {
      this.pagination.pageSize = val;
      this.loadData();
    },
    handleCurrentChange(val) {
      this.pagination.currentPage = val;
      this.loadData();
    },
    
    // 格式化工具
    formatCurrency(value) {
      return '¥' + value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    formatNumber(value) {
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeCharts);
  }
};
</script>

<style scoped>
.statistics-container {
  padding: 20px;
  background: #f5f7fa;
}

.header {
  margin-bottom: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.filters {
  margin-top: 20px;
}

.summary-cards {
  margin-bottom: 20px;
}

.card-title {
  color: #909399;
  font-size: 14px;
  margin-bottom: 10px;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
}

.card-value.income {
  color: #67C23A;
}

.card-value.expense {
  color: #F56C6C;
}

.el-card {
  margin-bottom: 20px;
}

.el-card h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}
</style>
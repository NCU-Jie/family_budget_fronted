<template>
  <div class="statistics-container">
    <!-- 标题和筛选区域 -->
    <div class="header">
      <h2>家庭收支统计</h2>
      <div class="filters">
        <el-form :inline="true">
          <!-- 时间维度选择 -->
          <el-form-item label="时间维度">
            <el-radio-group v-model="timeRange" @change="handleDateChange">
              <el-radio-button label="day">日</el-radio-button>
              <el-radio-button label="week">周</el-radio-button>
              <el-radio-button label="month">月</el-radio-button>
              <el-radio-button label="year">年</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <!-- 具体日期选择 -->
          <el-form-item label="选择日期">
            <el-date-picker v-model="selectedDate" :type="datePickerType" @change="handleDateChange" />
          </el-form-item>

          <!-- 成员筛选 -->
          <el-form-item label="家庭成员">
            <el-select v-model="filterForm.memberIds" multiple collapse-tags placeholder="全部成员" @focus="loadMembers"
              :loading="memberLoading" @change="loadData" clearable>
              <el-option v-for="member in members" :key="member.id" :label="member.name" :value="member.id" />
            </el-select>
          </el-form-item>


          <!-- 收支类型 -->
          <el-form-item label="收支类型">
            <el-select v-model="filterForm.typeId" @change="loadData">
              <el-option label="全部" :value=null />
              <el-option label="收入类" :value=0 />
              <el-option label="支出类" :value=1 />
            </el-select>
          </el-form-item>
          
        <!-- 新增重置按钮 -->
        <el-form-item>
          <el-button @click="resetFilters">重置</el-button>
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
        <el-table :data="tableData" border style="width: 100%" v-loading="loading">
          <el-table-column prop="accountDate" label="日期" width="120" />
          <el-table-column prop="memberName" label="成员" width="100" />
          <el-table-column prop="categoryName" label="分类" width="120" />
          <el-table-column prop="typeId" label="类型" width="80">
            <template slot-scope="{row}">
              <el-tag :type="row.typeId === 0 ? 'success' : 'danger'" size="small">
                {{ row.typeId === 0 ? '收入' : '支出' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="money" label="金额" align="right" width="120">
            <template slot-scope="{row}">
              {{ formatCurrency(row.money) }}
            </template>
          </el-table-column>
          <el-table-column prop="description" label="备注" />
          <el-table-column prop="recordMemberName" label="记录人" width="100" />
          <el-table-column prop="createTime" label="创建时间" width="150" />
        </el-table>
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
          :current-page="pagination.currentPage" :page-sizes="[10, 20, 50, 100]" :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper" :total="pagination.total" style="margin-top: 20px;" />
      </el-tab-pane>

      <!-- 分类统计 -->
      <el-tab-pane label="分类统计" name="category">
        <el-table :data="categoryStats" border style="width: 100%">
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
              <el-progress :percentage="row.percentage" :status="row.type === 'income' ? 'success' : 'exception'" />
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import { getMemberList } from '@/api/member';
import { getAccountList } from '@/api/account';
import { getCategoryStatistic, getStatistic } from '@/api/statistic';
export default {
  data() {
    return {
      timeRange: 'month',
      selectedDate: new Date(),
      // 筛选条件
      filterForm: {
        memberIds: [],
        typeId: null,
        beginDate: null,
        endDate: null
      },
      loadedTabs: {
        charts: false,
        table: false,
        category: false
      },

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
      members: [],

      // 图表实例
      trendChart: null,
      categoryChart: null,
      memberChart: null,
      memberLoading: false,
      loading: false
    };
  },
  watch: {
    // 监听activeTab变化
    activeTab(newTab) {
      if (!this.loadedTabs[newTab]) {
        this.loadTabData(newTab);
      }
    },
    // 新增：监听filterForm变化
    'filterForm': {
      deep: true, // 深度监听对象内部变化
      handler() {
        // 重置所有标签页加载状态
        Object.keys(this.loadedTabs).forEach(key => {
          this.loadedTabs[key] = false;
        });

        // 加载当前激活标签页的数据
        if (this.activeTab) {
          this.loadTabData(this.activeTab);
        }
      }
    }
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
    this.addDateRangeParams();
    this.loadData();
  },
  methods: {
    resetFilters() {
    this.timeRange = 'month'; // 重置为月维度
    this.selectedDate = new Date(); // 重置为当前日期
    
    // 重置筛选表单
    this.filterForm = {
      memberIds: [],
      typeId: null,
      beginDate: null,
      endDate: null
    }
  },
    handleDateChange() {
      this.addDateRangeParams(); // 先更新日期范围
      this.loadData(); // 再加载数据
    },
    async loadTabData(tabName) {
      switch (tabName) {
        case 'charts':
          await this.loadChartData();
          break;
        case 'table':
          await this.loadTableData();
          break;
        case 'category':
          await this.loadCategoryData();
          break;
      }
      this.loadedTabs[tabName] = true;
    },
    // 加载图表数据
    async loadChartData() {
      try {
        this.loading = true;

        // 并行发起3个请求
        const [trendRes, categoryRes, memberRes] = await Promise.all([
          getStatistic({ ...this.filterForm, groupType: 'day' }),
          getCategoryStatistic(this.filterForm),
          getStatistic({ ...this.filterForm, groupType: 'member' })
        ]);

        // 处理趋势数据
        if (trendRes.data.code === 1) {
          this.processTrendChartData(trendRes.data.data);
        } else {
          throw new Error(trendRes.data.msg || '获取趋势数据失败');
        }
        // 处理分类数据
        if (categoryRes.data?.code === 1) {
          this.renderCategoryChart(categoryRes.data.data);
        } else {
          throw new Error(categoryRes.data?.msg || '获取分类数据失败');
        }
        // 处理成员数据
        if (memberRes.data?.code === 1) {
          this.renderMemberChart(memberRes.data.data);
        } else {
          throw new Error(memberRes.data?.msg || '获取成员数据失败');
        }

      } catch (error) {
        console.error('加载数据失败:', error);
        this.$message.error('加载数据失败: ' + error.message);
      } finally {
        this.loading = false;
      }
    },

    // 处理趋势图数据
    processTrendChartData(apiData) {
      // 1. 准备x轴数据（日期）和系列数据
      const dates = [];
      const incomeData = [];
      const expenseData = [];

      // 按日期排序
      const sortedData = [...apiData].sort((a, b) => {
        return new Date(a.groupName) - new Date(b.groupName);
      });

      // 填充数据
      sortedData.forEach(item => {
        console.log(item.groupName);
        dates.push(this.formatChartDate(item.groupName)); // 格式化日期显示
        incomeData.push(item.income);
        expenseData.push(item.expense);
      });

      // 2. 更新趋势图
      this.trendChart.setOption({
        tooltip: {
          trigger: 'axis',
          formatter: params => {
            const date = params[0].axisValue;
            const income = params[0].data;
            const expense = params[1].data;
            return `
          <div style="margin-bottom:5px;font-weight:bold">${date}</div>
          <div>收入: <span style="color:#67C23A">¥${this.formatNumber(income)}</span></div>
          <div>支出: <span style="color:#F56C6C">¥${this.formatNumber(expense)}</span></div>
        `;
          }
        },
        legend: {
          data: ['收入', '支出'],
          bottom: 0
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: dates,
          axisLabel: {
            formatter: value => {
              // 如果是按天显示，只显示日部分
         
              return value;
            }
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '¥{value}'
          }
        },
        series: [
          {
            name: '收入',
            type: 'line',
            smooth: true,
            data: incomeData,
            itemStyle: { color: '#67C23A' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
                { offset: 1, color: 'rgba(103, 194, 58, 0.1)' }
              ])
            }
          },
          {
            name: '支出',
            type: 'line',
            smooth: true,
            data: expenseData,
            itemStyle: { color: '#F56C6C' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(245, 108, 108, 0.3)' },
                { offset: 1, color: 'rgba(245, 108, 108, 0.1)' }
              ])
            }
          }
        ]
      });
    },

    // 格式化图表日期显示
    formatChartDate(dateString) {
      const date = new Date(dateString);
      const month = date.getMonth() + 1;
      const day = date.getDate();


      return `${month}月${day}日`;
      
    },

    // 加载表格数据
    async loadTableData() {
      this.loading = true;
      try {
        const params = {
          ...this.filterForm,
          page: this.pagination.currentPage,
          pageSize: this.pagination.pageSize
        };

        const res = await getAccountList(params);
        if (res.data.code === 1) {
          this.tableData = res.data.data.records;
          this.pagination.total = res.data.data.total;
        } else {
          this.$message.error(res.data.msg || '获取数据失败');
        }
      } catch (error) {
        console.error('加载数据出错:', error);
        this.$message.error('加载数据出错');
      } finally {
        this.loading = false;
      }
    },

    // 加载分类数据
    async loadCategoryData() {
      try {
        this.loading = true; // 显示加载状态

        // 1. 调用API获取分类统计数据
        const res = await getCategoryStatistic(this.filterForm);

        // 2. 处理返回的数据
        if (res.data && res.data.code === 1) { // 判断接口是否成功
          this.processCategoryData(res.data.data); // 处理数据

          // 3. 更新图表显示
          this.renderCategoryChart(res.data.data);
        } else {
          throw new Error(res.data.msg || '获取分类数据失败');
        }
      } catch (error) {
        console.error('分类数据加载失败:', error);
        this.$message.error('分类数据加载失败: ' + error.message);
      } finally {
        this.loading = false; // 关闭加载状态
      }
    },

    // 处理分类数据
    processCategoryData(apiData) {
      // 1. 计算总额
      const totalIncome = apiData.reduce((sum, item) => sum + item.income, 0);
      const totalExpense = apiData.reduce((sum, item) => sum + item.expense, 0);
      const totalRecords = apiData.reduce((sum, item) => sum + item.groupCount, 0);

      // 2. 更新汇总数据
      this.summary = {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        totalRecords
      };

      // 3. 处理分类统计详情
      this.categoryStats = apiData.map(item => {
        const isIncome = item.income > 0;
        const total = isIncome ? totalIncome : totalExpense;

        return {
          categoryId: item.categoryId,
          category: item.categoryName,
          type: isIncome ? 'income' : 'expense',
          income: item.income,
          expense: item.expense,
          count: item.groupCount,
          percentage: total > 0
            ? Math.round((isIncome ? item.income : item.expense) / total * 100)
            : 0
        };
      })
      .sort((a, b) => b.percentage - a.percentage); // 按百分比降序排序
    },

    // 渲染分类占比图表
    renderCategoryChart(data) {

      // 1. 准备图表数据
      const chartData = data
        .filter(item => item.income > 0 || item.expense > 0) // 过滤掉0值
        .map(item => ({
          name: item.categoryName,
          value: item.income > 0 ? item.income : item.expense,
          itemStyle: {
            color: item.income > 0 ? '#67C23A' : '#F56C6C'
          }
        }));

      // 2. 设置图表选项
      this.categoryChart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: params => {
            return `${params.name}<br/>
                金额: ¥${params.value.toFixed(2)}<br/>
                占比: ${params.percent}%`;
          }
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center'
        },
        series: [{
          name: '分类占比',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: true,
            formatter: '{b}: {d}%'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          data: chartData
        }]
      });
    },
    renderMemberChart(memberData) {
      if (!this.memberChart) {
        this.memberChart = echarts.init(document.getElementById('member-chart'));
      }

      // 准备图表数据
      const categories = memberData.map(item => item.groupDisplayName);
      const incomeData = memberData.map(item => item.income);
      const expenseData = memberData.map(item => item.expense);

      // 设置图表配置
      const option = {
        title: {
          text: '成员收支对比',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: params => {
            const income = params[0].value;
            const expense = params[1].value;
            const balance = (income - expense).toFixed(2);
            return `
          <div style="margin-bottom:5px;font-weight:bold">${params[0].name}</div>
          <div>收入: <span style="color:#67C23A">¥${this.formatNumber(income)}</span></div>
          <div>支出: <span style="color:#F56C6C">¥${this.formatNumber(expense)}</span></div>
          <div>结余: <span style="color:${balance >= 0 ? '#67C23A' : '#F56C6C'}">¥${this.formatNumber(balance)}</span></div>
        `;
          }
        },
        legend: {
          data: ['收入', '支出'],
          top: 30
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: categories,
          axisLabel: {
            interval: 0,
            rotate: 30 // 如果名称太长可以旋转30度
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '¥{value}'
          }
        },
        series: [
          {
            name: '收入',
            type: 'bar',
            data: incomeData,
            itemStyle: {
              color: '#67C23A'
            },
            label: {
              show: true,
              position: 'top',
              formatter: params => {
                return `¥${this.formatNumber(params.value)}`;
              }
            }
          },
          {
            name: '支出',
            type: 'bar',
            data: expenseData,
            itemStyle: {
              color: '#F56C6C'
            },
            label: {
              show: true,
              position: 'top',
              formatter: params => {
                return `¥${this.formatNumber(params.value)}`;
              }
            }
          }
        ]
      };

      this.memberChart.setOption(option);
      window.addEventListener('resize', () => this.memberChart.resize());
    },
    // 加载成员列表
    async loadMembers() {
      this.memberLoading = true;
      try {

        const res = await getMemberList();
        this.members = res.data.data;

      } finally {
        this.memberLoading = false;
      }
    },
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
        // 准备请求参数
        const params = {
          ...this.filterForm,
          groupType: 'day'
        };
        // 2. 处理日期范围
        const res = await getStatistic(params);
        const groupData = res.data.data;
        // 计算汇总数据
        const summary = groupData.reduce((acc, item) => {
          acc.totalIncome += item.income || 0;
          acc.totalExpense += item.expense || 0;
          acc.totalRecords += item.groupCount || 0;
          return acc;
        }, {
          totalIncome: 0,
          totalExpense: 0,
          balance: 0,
          totalRecords: 0
        });

        // 计算余额
        summary.balance = summary.totalIncome - summary.totalExpense;
        // 更新汇总数据
        this.summary = summary;

      } finally {
        this.loading = false;
      }
    },

    // 日期范围处理方法
    addDateRangeParams() {
      const date = new Date(this.selectedDate);
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();

      switch (this.timeRange) {
        case 'day': {
          this.filterForm.beginDate = this.formatDate(date);
          this.filterForm.endDate = this.formatDate(date);
          break;
        }
        case 'week': {
          const weekStart = new Date(date);
          weekStart.setDate(day - date.getDay() + (date.getDay() === 0 ? -6 : 1));
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);

          this.filterForm.beginDate = this.formatDate(weekStart);
          this.filterForm.endDate = this.formatDate(weekEnd);
          break;
        }
        case 'month': {
          this.filterForm.beginDate = this.formatDate(new Date(year, month, 1));
          this.filterForm.endDate = this.formatDate(new Date(year, month + 1, 0));
          break;
        }
        case 'year': {
          this.filterForm.beginDate = this.formatDate(new Date(year, 0, 1));
          this.filterForm.endDate = this.formatDate(new Date(year, 11, 31));
          break;
        }
      }
    },
    // 日期格式化方法
    formatDate(date) {
      if (!date) return '';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    // 分页处理
    handleSizeChange(val) {
      this.pagination.pageSize = val;
      this.loadTableData();
    },
    handleCurrentChange(val) {
      this.pagination.currentPage = val;
      this.loadTableData();
    },

    // 格式化工具
    formatCurrency(value) {
      return '¥' + value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    formatNumber(value) {
      // 确保是数字，并保留2位小数
      const num = Number(value).toFixed(2);

      // 处理整数部分的千分位
      return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
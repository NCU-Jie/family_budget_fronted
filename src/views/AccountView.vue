<template>
  <div class="table-data-view">
    <!-- 筛选区域 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="成员">
          <el-select v-model="filterForm.member" clearable placeholder="全部成员" @focus="loadMembers"
            :loading="memberLoading">
            <el-option v-for="member in members" :key="member.id" :label="member.name" :value="member.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="分类">
          <el-select v-model="filterForm.category" clearable placeholder="全部分类" @focus="loadCategories"
            :loading="categoryLoading">
            <el-option v-for="category in categories" :key="category.id" :label="category.name" :value="category.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="filterForm.remark" placeholder="输入备注关键词" clearable />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleFilter">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-table :data="tableData" border v-loading="loading">
      <el-table-column prop="date" label="日期" width="120" />
      <el-table-column prop="memberName" label="成员" width="100" />
      <el-table-column prop="categoryName" label="分类" width="120" />
      <el-table-column prop="type" label="类型" width="80">
        <template slot-scope="{row}">
          <el-tag :type="row.typeId === 0 ? 'success' : 'danger'" size="small">
            {{ row.typeId === 0 ? '收入' : '支出' }}
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

    <!-- 分页 -->
    <el-pagination :current-page="pagination.currentPage" :page-sizes="[10, 20, 50, 100]"
      :page-size="pagination.pageSize" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange" @current-change="handleCurrentChange" style="margin-top: 20px;" />
  </div>
</template>

<script>
import { getMemberList } from '@/api/member';
import { getAccountList } from '@/api/account';
export default {
  data() {
    return {
      loading: false,
      memberLoading: false,
      filterForm: {
        member: '',
        category: '',
        remark: ''
      },
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      members: [], // 将从API加载
      categories: [], // 将从API加载
      tableData: [] // 将从API加载
    }
  },
  methods: {
    // 加载成员列表
    async loadMembers() {
      if (this.members.length) return;

      this.memberLoading = true;
      try {

        const res = await getMemberList();
        this.members = res.data.data;

      } finally {
        this.memberLoading = false;
      }
    },

    // 加载分类列表
    async loadCategories() {
      if (this.categories.length) return;

      try {
        const res = await this.$axios.get('/api/categories');
      } catch (error) {
        console.error('加载分类失败:', error);
      }
    },

    // 加载表格数据
    async loadTableData() {
      this.loading = true;
      try {
        // 替换为实际API调用
        const res = await getAccountList({
          params: {
            ...this.filterForm,
            page: this.pagination.currentPage,
            size: this.pagination.pageSize
          }
        });
        this.tableData = res.data.list;
        this.pagination.total = res.data.total;

        // 示例响应结构：
        // this.tableData = [{
        //   id: 1,
        //   date: '2023-06-01',
        //   memberId: 1,
        //   memberName: '爸爸',
        //   categoryId: 1,
        //   categoryName: '餐饮',
        //   type: 'expense',
        //   amount: 100.00,
        //   remark: '午餐'
        // }, ...];
      } finally {
        this.loading = false;
      }
    },

    // 查询
    handleFilter() {
      this.pagination.currentPage = 1;
      this.loadTableData();
    },

    // 重置
    resetFilter() {
      this.filterForm = {
        member: '',
        category: '',
        remark: ''
      };
      this.pagination.currentPage = 1;
      this.loadTableData();
    },

    // 分页
    handleSizeChange(size) {
      this.pagination.pageSize = size;
      this.loadTableData();
    },

    handleCurrentChange(page) {
      this.pagination.currentPage = page;
      this.loadTableData();
    },

    // 格式化金额
    formatCurrency(value) {
      return '¥' + (value || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
  },
  created() {
    // 初始化加载必要数据
    this.loadCategories();
    this.loadTableData();
  }
}
</script>

<style scoped>
.table-data-view {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
}

.el-form-item {
  margin-right: 20px;
  margin-bottom: 0;
}
</style>
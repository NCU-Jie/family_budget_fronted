<template>
  <div class="table-data-view">
    <!-- 筛选区域 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="成员:">
          <el-select v-model="filterForm.memberId" clearable placeholder="全部成员" @focus="loadMembers"
            :loading="memberLoading" @change="loadTableData">
            <el-option v-for="member in members" :key="member.id" :label="member.name" :value="member.id" />
          </el-select>
        </el-form-item>

        <!-- 新增的分类类型选择器 -->
        <el-form-item label="收支类型：">
          <el-select v-model="filterForm.typeId" placeholder="选择类型" clearable style="width: 120px"
            @change="handleCategoryTypeChange">
            <el-option label="全部" value="" />
            <el-option label="收入类" :value=0 />
            <el-option label="支出类" :value=1 />
          </el-select>
        </el-form-item>



        <el-form-item label="分类:">
          <pagination-select v-model="selectedValue" :data-list="categoryList" label-key="name" value-key="id"
            :page-info="pagination" @selectChange="handleSelectChange" @selectPageChange="handlePageChange" />
        </el-form-item>
        <el-form-item label="备注:">
          <el-input v-model="filterForm.description" placeholder="输入备注关键词" clearable />
        </el-form-item>

        <el-form-item style="float: right;">
          <el-button type="primary" @click="handleFilter">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-table :data="tableData" border v-loading="loading">
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
      <el-table-column prop="recordMemberName" label="记账人" />
      <el-table-column prop="createTime" label="记账时间" />
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
import { getCategories } from '@/api/category';
import PaginationSelect from '@/components/PaginationSelect';
import { debounce } from 'lodash';
export default {
  components: {
    PaginationSelect
  },
  data() {
    return {
      loading: false,
      memberLoading: false,
      filterForm: {
        memberId: '',
        typeId: '', // 新增的分类类型字段
        category: '',
        description: ''
      },
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      selectedValue: '',
      categoryList: [], // 你的数据列表

      searchQuery: '',
      categorySearchKeyword: '',
      members: [], // 将从API加载
      categories: [], // 将从API加载
      tableData: [] // 将从API加载
    }
  },
  methods: {
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
    // 分类类型变化时的处理
    handleCategoryTypeChange() {
      this.filterForm.category = ''; // 清空已选分类
      this.loadTableData(); // 重新加载表格数据
    },
    async loadData(pageNum = 1, pageSize = 10, query = '') {
      try {
        // const res = await yourApiMethod({
        //   pageNum,
        //   pageSize,
        //   keyword: query
        // });

        // this.categoryList = res.data.list;
        // this.pagination = {
        //   pageNum: res.data.pageNum,
        //   pageSize: res.data.pageSize,
        //   total: res.data.total
        // };
        // this.searchQuery = query;
      } catch (error) {
        console.error('加载数据失败:', error);
      }
    },

    // 选择项变化
    handleSelectChange(val) {
      console.log('当前选中值:', val);
      // val 格式为 "id-name" (根据你的组件实现)
    },

    // 分页或搜索变化
    handlePageChange(pageNum, pageSize, query) {
      this.loadData(pageNum, pageSize, query);
    },
    // 加载表格数据
    async loadTableData() {
      this.loading = true;
      try {
        // 替换为实际API调用
        const res = await getAccountList({
          ...this.filterForm,
          page: this.pagination.currentPage,
          pageSize: this.pagination.pageSize,

        });
        this.tableData = res.data.data.records;
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
        //   description: '午餐'
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
        description: ''
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
    this.loadTableData();
    this.loadCategories();

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

.loading-text,
.no-more-text {
  padding: 8px 0;
  text-align: center;
  color: #999;
  font-size: 12px;
}
</style>
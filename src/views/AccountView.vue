<template>
  <div class="table-data-view">
    <!-- 筛选区域 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <!-- 日期范围选择 - 直接绑定方案 -->
        <el-form-item label="日期范围:">
          <el-date-picker v-model="filterForm.beginDate" type="date" placeholder="开始日期" value-format="yyyy-MM-dd"
            style="width: 150px;" @change="loadTableData" />
          <span style="margin: 0 5px;">至</span>
          <el-date-picker v-model="filterForm.endDate" type="date" placeholder="结束日期" value-format="yyyy-MM-dd"
            style="width: 150px;" @change="loadTableData" />
        </el-form-item>

        <!-- 成员选择器 -->
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


        <!-- 分类选择 -->
        <el-form-item label="收支分类">
          <category-select v-model="filterForm.categoryId" :type-id="filterForm.typeId"
            @change="loadTableData" />
        </el-form-item>

        <el-form-item label="备注:">
          <el-input v-model="filterForm.description" placeholder="输入备注关键词" clearable @input="handleDescriptionInput"
            @clear="handleDescriptionClear" />
        </el-form-item>

        <el-form-item style="float: right;">
          <el-button @click="resetFilter">重置</el-button>
          <el-button type="primary" @click="handleFilter">查询</el-button>
         
          <el-button type="primary" @click="handleAddAccount">新增</el-button>
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
      <el-table-column label="操作" width="180">
        <template slot-scope="{row}">
          <el-button size="mini" @click="handleEditAccount(row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDeleteAccount(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination :current-page="pagination.currentPage" :page-sizes="[10, 20, 50, 100]"
      :page-size="pagination.pageSize" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange" @current-change="handleCurrentChange" style="margin-top: 20px;" />
  </div>
</template>

<script>
import { getMemberList } from '@/api/member';
import { getAccountList, deleteAccountById } from '@/api/account';
import categorySelect from '@/components/categorySelect';
import { debounce } from 'lodash';  // 或自行实现防抖
export default {
  components: {
    categorySelect
  },
  data() {
    return {
      loading: false,
      memberLoading: false,
      filterForm: {
        memberId: '',
        typeId: '', // 新增的分类类型字段
        categoryId: '',
        description: '',
        dateRange: [], // 日期范围
        beginDate: '', // 开始日期
        endDate: '',   // 结束日期
      },
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      members: [], // 将从API加载
      tableData: [] // 将从API加载
    }
  },
  methods: {
    // 处理日期范围变化
    handleDateChange(val) {
      if (val && val.length === 2) {
        this.filterForm.beginDate = val[0];
        this.filterForm.endDate = val[1];
      } else {
        this.filterForm.beginDate = '';
        this.filterForm.endDate = '';
      }
      this.loadTableData();
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
    // 分类类型变化时的处理
    handleCategoryTypeChange() {
      this.filterForm.category = ''; // 清空已选分类
      this.loadTableData(); // 重新加载表格数据
    },

    // 加载表格数据
    async loadTableData() {
      this.loading = true;
      try {
        // 替换为实际API调用
        const params = {
          ...this.filterForm,
          page: this.pagination.currentPage,
          pageSize: this.pagination.pageSize
        };

        // 删除空值参数
        Object.keys(params).forEach(key => {
          if (params[key] === '' || params[key] == null) {
            delete params[key];
          }
        });

        const res = await getAccountList(params);
        this.tableData = res.data.data.records;
        this.pagination.total = res.data.data.total;

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
    handleDescriptionInput: debounce(function () {
      this.pagination.currentPage = 1;  // 重置到第一页
      this.loadTableData();
    }, 500),

    // 清空备注时的处理
    handleDescriptionClear() {
      this.pagination.currentPage = 1;
      this.loadTableData();
    },
    // 查询
    handleFilter() {
      this.pagination.currentPage = 1;
      this.loadTableData();
    },

    // 修改重置方法
    resetFilter() {
      this.filterForm = {
        dateRange: [],
        beginDate: '',
        endDate: '',
        memberId: '',
        typeId: '',
        categoryId: '',
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
    },
    handleEditAccount(row) {
      this.$router.push(`/addAccount/${row.id}`);

    },
    handleAddAccount() {
      this.$router.push('/addAccount');
    },
    async handleDeleteAccount(accountId) {
      try {
        await this.$confirm('确认删除该记录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        const loading = this.$loading({
          lock: true,
          text: '删除中...',
          spinner: 'el-icon-loading',
        });
        try {
          const res = await deleteAccountById(accountId);
          if (res.data.code === 1) {
            this.$message.success('删除成功');
            if (this.tableData.length === 1 && this.pagination.currentPage > 1) {
              this.pagination.currentPage--;
            }
            this.loadTableData();
          } else {
            this.$message.error(res.data.msg || '删除失败');
          }
        } finally {
          loading.close();
        }
      } catch (error) {
        if (error !== 'cancel' && error !== 'close') {
          this.$message.error('删除失败: ' + (error.data.msg || '未知错误'))
          console.error('删除记录失败:', error)
        }
      }
    },
  },
  created() {
    // 初始化加载必要数据
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

.loading-text,
.no-more-text {
  padding: 8px 0;
  text-align: center;
  color: #999;
  font-size: 12px;
}
</style>
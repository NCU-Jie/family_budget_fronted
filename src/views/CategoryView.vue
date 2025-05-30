<template>
  <div class="categories-page">
    <h2 class="page-title">收支分类管理</h2>

    <div class="toolbar">
      <span class="filter-label">收支类型：</span>
      <el-select v-model="filter.type" placeholder="全部类型" clearable style="width: 120px; margin-left: 10px;"
        @change="handleFilterChange">
        <el-option label="全部" value=''/>
        <el-option label="收入" :value="0" />
        <el-option label="支出" :value="1" />
      </el-select>

      <div style="flex: 1;"></div> <!-- 空白填充 -->

      <el-button type="primary" @click="showAddDialog">新增分类</el-button>
    </div>

    <el-table :data="categories" border v-loading="loading">
      <el-table-column prop="name" label="分类名称" />
      <el-table-column prop="typeID" label="类型">
        <template slot-scope="{row}">
          <el-tag :type="row.typeId === 0 ? 'success' : 'danger'">
            {{ row.typeId === 0 ? '收入' : '支出' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template slot-scope="{row}">
          <el-button size="mini" @click="handleEditCategory(row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDeleteCategory(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
      :current-page="pagination.currentPage" :page-sizes="[5, 10, 20, 50]" :page-size="pagination.pageSize"
      layout="total, sizes, prev, pager, next, jumper" :total="pagination.total" class="pagination" />

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="30%">
      <el-form :model="currentCategory" label-width="80px" :rules="rules" ref="categoryForm">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="currentCategory.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="currentCategory.typeId">
            <el-radio-button :label="0">收入</el-radio-button>
            <el-radio-button :label="1">支出</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { deleteCategory, getCategories, addCategory, updateCategory } from '@/api/category'

export default {
  data() {
    return {
      loading: false,
      categories: [],
      dialogVisible: false,
      dialogTitle: '新增分类',
      currentCategory: {
        id: null,
        name: '',
        typeId: 1 // 默认支出
      },
      // 新增筛选条件
      filter: {
        type: '' // 0-收入, 1-支出, ''-全部
      },
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      rules: {
        name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在2到20个字符', trigger: 'blur' }
        ],
        typeId: [
          { required: true, message: '请选择分类类型', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.getCategories()
  },
  methods: {
    // 获取分类列表（分页+筛选）
    getCategories() {
      this.loading = true
      const params = {
        page: this.pagination.currentPage,
        pageSize: this.pagination.pageSize,
        typeId: this.filter.type // 添加类型筛选参数
      }

      getCategories(params)
        .then(res => {
          console.log('获取分类列表成功:', res.data.data.records)
          this.categories = res.data.data.records || []
          this.pagination.total = res.data.data.total || 0
        })
        .catch(error => {
          this.$message.error('获取分类列表失败: ' + (error.message || '未知错误'))
          console.error('获取分类列表失败:', error)
        })
        .finally(() => {
          this.loading = false
        })
    },

    // 筛选条件变化
    handleFilterChange() {
      this.pagination.currentPage = 1 // 重置为第一页
      this.getCategories()
    },

    // 分页大小改变
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.pagination.currentPage = 1
      this.getCategories()
    },

    // 当前页改变
    handleCurrentChange(val) {
      this.pagination.currentPage = val
      this.getCategories()
    },

    // 显示新增对话框
    showAddDialog() {
      this.currentCategory = {
        id: null,
        name: '',
        typeId: 1 // 默认支出
      }
      this.dialogTitle = '新增分类'
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.categoryForm?.clearValidate()
      })
    },

    // 显示编辑对话框
    handleEditCategory(category) {
      this.currentCategory = { ...category }
      this.dialogTitle = '编辑分类'
      this.dialogVisible = true
    },

    // 表单提交
    submitForm() {
      this.$refs.categoryForm.validate(valid => {
        if (valid) {
          this.saveCategory()
        } else {
          return false
        }
      })
    },

    // 保存分类
    saveCategory() {
      const isEdit = !!this.currentCategory.id
      const savePromise = isEdit
        ? updateCategory(this.currentCategory)
        : addCategory(this.currentCategory)

      savePromise
        .then(res => {
          if (res.data.code === 1) {
            this.$message.success(isEdit ? '更新成功' : '新增成功')
            this.dialogVisible = false
            this.getCategories()
          } else {
            this.$message.error(res.data.msg || '操作失败')
          }
        })
        .catch(error => {
          this.$message.error((isEdit ? '更新' : '新增') + '失败: ' + (error.message || '未知错误'))
          console.error('保存分类失败:', error)
        })
    },

    // 删除分类
    async handleDeleteCategory(category) {
      try {
        await this.$confirm('确定删除此分类吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const loading = this.$loading({
          lock: true,
          text: '删除中...',
          spinner: 'el-icon-loading'
        })

        try {
          const res = await deleteCategory(category.id)
          if (res.data.code === 1) {
            this.$message.success('删除成功')
            // 如果删除的是最后一页的最后一条，则返回上一页
            if (this.categories.length === 1 && this.pagination.currentPage > 1) {
              this.pagination.currentPage -= 1
            }
            this.getCategories()
          } else {
            this.$message.error(res.data.msg || '删除失败')
          }
        } finally {
          loading.close()
        }
      } catch (error) {
        if (error !== 'cancel' && error !== 'close') {
          this.$message.error('删除失败: ' + (error.message || '未知错误'))
          console.error('删除分类失败:', error)
        }
      }
    }
  }
}
</script>

<style scoped>
.categories-page {
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
}

.toolbar {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>
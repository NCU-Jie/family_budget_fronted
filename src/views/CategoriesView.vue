<template>
    <div class="categories-page">
      <h2 class="page-title">收支分类管理</h2>
      
      <div class="toolbar">
        <el-button type="primary" @click="showAddDialog">新增分类</el-button>
      </div>
      
      <el-table :data="categories" border>
        <el-table-column prop="name" label="分类名称" />
        <el-table-column prop="type" label="类型">
          <template slot-scope="{row}">
            <el-tag :type="row.type === 'income' ? 'success' : 'danger'">
              {{ row.type === 'income' ? '收入' : '支出' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="{row}">
            <el-button size="mini" @click="handleEitCategory(row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDeleteCategory(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="30%">
        <el-form :model="currentCategory" label-width="80px">
          <el-form-item label="分类名称" required>
            <el-input v-model="currentCategory.name" />
          </el-form-item>
          <el-form-item label="类型" required>
            <el-radio-group v-model="currentCategory.type">
              <el-radio-button label="income">收入</el-radio-button>
              <el-radio-button label="expense">支出</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <span slot="footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveCategory">保存</el-button>
        </span>
      </el-dialog>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        categories: [
          { id: 1, name: '餐饮美食', type: 'expense' },
          { id: 2, name: '工资收入', type: 'income' }
        ],
        dialogVisible: false,
        dialogTitle: '新增分类',
        currentCategory: {
          id: null,
          name: '',
          type: 'expense'
        }
      }
    },
    methods: {
      showAddDialog() {
        this.currentCategory = { id: null, name: '', type: 'expense' }
        this.dialogTitle = '新增分类'
        this.dialogVisible = true
      },
      editCategory(category) {
        this.currentCategory = { ...category }
        this.dialogTitle = '编辑分类'
        this.dialogVisible = true
      },
      async handleDeleteCategory(category) {
      try {
        await this.$confirm('确定删除此分类吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });

        // 添加加载状态
        const loading = this.$loading({
          lock: true,
          text: '删除中...',
          spinner: 'el-icon-loading'
        });

        try {
          await this.handleDeleteCategory(category.id);
          this.$message.success('删除成功');

          // 重新获取最新分类列表
          await this.getCategories();
        } finally {
          loading.close();
        }

      } catch (error) {
        // 只有当用户点击取消时才不报错
        if (error !== 'cancel' && error !== 'close') {
          this.$message.error('删除失败: ' + (error.message || '未知错误'));
          console.error('删除分类失败:', error);
        }
      }
    },
      saveCategory() {
        if (!this.currentCategory.name) {
          this.$message.warning('请填写分类名称')
          return
        }
        
        if (this.currentCategory.id) {
          // 更新
         
        } else {
          // 新增
          this.currentCategory.id = Date.now()
          this.categories.push({ ...this.currentCategory })
        }
        
        this.dialogVisible = false
        this.$message.success('保存成功')
      }
    }
  }
  </script>
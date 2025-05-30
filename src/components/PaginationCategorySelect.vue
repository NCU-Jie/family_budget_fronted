<template>
  <el-select v-model="selectedValue" placeholder="请选择分类" filterable clearable class="full-width" @focus="handleFocus"
    @change="handleSelectChange" @clear="handleClear" :loading="loading" :remote="true" :filter-method="handleSearch">
    <el-option v-for="item in categoryList" :key="item.id" :label="item.name" :value="item.id" />
    <div class="pagination-footer">
      <el-pagination small @current-change="handlePageChange" :current-page="pagination.pageNum"
        :page-size="pagination.pageSize" layout="prev, pager, next" :total="pagination.total" />
    </div>
  </el-select>
</template>

<script>
import { getCategories } from '@/api/category'

export default {
  name: 'PaginationCategorySelect',
  props: {
    value: [String, Number],  // 选中的值
    typeId: {                 // 收支类型ID
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      selectedValue: this.value,
      categoryList: [],
      loading: false,
      searchQuery: '',
      pagination: {
        pageNum: 1,
        pageSize: 5,
        total: 0
      }
    }
  },
  watch: {
    value(newVal) {
      this.selectedValue = newVal
      this.$emit('input', newVal)
      this.$emit('change', newVal)
    },
    typeId() {
    this.reset()
  }
},
  methods: {
    async loadCategories() {
      this.loading = true
      try {
        const params = {
          typeId: this.typeId,
          page: this.pagination.pageNum,
          pageSize: this.pagination.pageSize,
          keyword: this.searchQuery
        }
        const res = await getCategories(params)
        this.categoryList = res.data.data.records || []
        this.pagination.total = res.data.data.total || 0
      } catch (error) {
        console.error('加载分类失败:', error)
        this.$message.error('加载分类失败')
      } finally {
        this.loading = false
      }
    },

    handleFocus() {
      this.loadCategories()
    },

    handleSearch(query) {
      this.searchQuery = query
      this.pagination.pageNum = 1
      this.loadCategories()
    },

    handlePageChange(pageNum) {
      this.pagination.pageNum = pageNum
      this.loadCategories()
    },
    handleSelectChange(val) {
      // 通知父组件值已变化
      this.$emit('input', val)
    },
    handleClear() {
      this.selectedValue = ''
      this.$emit('input', '')
    },

    reset() {
 
      this.pagination.pageNum = 1
      this.searchQuery = ''
      this.$emit('input', '')
    }
  },
  created() {
    this.loadCategories()
  }
}
</script>

<style scoped>
.pagination-footer {
  padding: 10px;
  text-align: center;
}

.full-width {
  width: 100%;
}
</style>
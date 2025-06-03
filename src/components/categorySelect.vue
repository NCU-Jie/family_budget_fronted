<template>
  <el-select 
    v-model="selectedValue" 
    placeholder="请选择分类" 
    popper-class="scrollable-select" 
    clearable 
    filterable
    :loading="loading" 
    @change="handleChange"
    style="width: 100%"
  >
    <el-option 
      v-for="item in options" 
      :key="item.id" 
      :label="item.name" 
      :value="item.id" 
    />
  </el-select>
</template>

<script>
import { getCategoryByTypeId } from '@/api/category';

export default {
  props: {
    typeId: {
      type: Number,
      required: false,
      default: null,
      validator: value => value === null || [0, 1].includes(value)
    },
    value: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      selectedValue: this.value ? String(this.value) : '',
      options: [],
      loading: false
    }
  },
  watch: {
    typeId: {
      immediate: true,
      handler(newVal) {
        this.selectedValue = '';
        this.$emit('input', '');
        this.$emit('change', '');
        this.getCategories(newVal);
      }
    },
    value(newVal) {
      this.selectedValue = newVal ? String(newVal) : '';
    }
  },
  methods: {
    async getCategories(typeId) {
      try {
        this.loading = true;
        const res = await getCategoryByTypeId(typeId);
        
        if (res.data.code === 1) {
          this.options = (res.data.data || []).map(item => ({
            ...item,
            id: String(item.id)
          }));

          if (res.data.data?.categoryId && !this.options.some(c => c.id === String(res.data.data.categoryId))) {
            this.options.unshift({
              id: String(res.data.data.categoryId),
              name: res.data.data.categoryName || '未知分类'
            });
          }
        }
      } catch (error) {
        console.error('获取分类出错:', error);
      } finally {
        this.loading = false;
      }
    },
    handleChange(value) {
      this.$emit('input', value);
      this.$emit('change', value);
    }
  }
}
</script>

<style>
.scrollable-select .el-select-dropdown__wrap {
  max-height: 200px;
  overflow-y: auto;
}
</style>
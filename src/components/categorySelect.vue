<template>
  <div>
    <el-select 
      v-model="selectedValue" 
      placeholder="请选择" 
      popper-class="scrollable-select" 
      clearable 
      filterable
      :loading="loading" 
      @change="handleChange"
    >
      <el-option 
        v-for="item in options" 
        :key="item.id" 
        :label="item.name" 
        :value="item.id" 
      />
    </el-select>
    <div>
      option: {{ options }}
    </div>
    <p>当前选中的分类ID: {{ selectedValue }}</p>
    <!-- 直接通过 selectedValue 和 options 获取名称 -->
    <div v-if="selectedValue" class="selected-name">

    </div>
  </div>
</template>

<script>
import { getCategoryByTypeId } from '@/api/category';

export default {
  props: {
    typeId: {
      type: Number,
      required: true,
      default: 1
    },
    value: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      selectedValue: this.value,
      options: [],
      loading: false
    }
  },
  watch: {
    typeId: {
      immediate: true,
      handler(newVal) {
        this.selectedValue = '';
        this.getCategories(newVal);
      }
    },
    value(newVal) {
      this.selectedValue = newVal;
    }
  },
  methods: {
    async getCategories(typeId) {
      console.log('typeId:', typeId);
      try {
        this.loading = true;
        const res = await getCategoryByTypeId(typeId || this.typeId);
        const apiData = res.data.data ;
        if (res.data.code === 1) {
          this.options = res.data.data || [];
          if (apiData.categoryId && !this.options.some(c => c.id === String(apiData.categoryId))) {
            console.warn('分类ID不存在，添加到选项列表');
          this.options.unshift({
            id: String(apiData.categoryId),
            name: apiData.categoryName || '未知成员'
          });
        }
        } else {
          this.$message.error(res.data.msg || '获取分类失败');
        }
      } catch (error) {
        console.error('获取分类出错:', error);
        this.$message.error('获取分类出错');
      } finally {
        this.loading = false;
      }
    },
    handleChange(value) {
      this.$emit('input', value);
    },

  }
}
</script>

<style scoped>
.selected-name {
  margin-top: 8px;
  color: #666;
  font-size: 14px;
}
</style>

<style>
.scrollable-select .el-select-dropdown__wrap {
  max-height: 200px;
  overflow-y: auto;
}
</style>
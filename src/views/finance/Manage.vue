<template>
  <div class="manage-container">
    <h1>收支分类管理</h1>
    <template>
      收支类型:
      <el-select v-model="value" filterable placeholder="请选择" @focus="getChoiceList">
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
        </el-option>
      </el-select>
    </template>
    <el-button type="primary" @click="getCategoryList">查询</el-button>
    <el-button type="primary" @click="getCategoryList1">查询封装</el-button>
    <el-table :data="categories" style="width: 100%">
      <el-table-column prop="name" label="分类名称"></el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button type="text" @click="editCategory(scope.row)">编辑</el-button>
          <el-button type="text" @click="deleteCategory(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-button type="primary" @click="addCategory">新增分类</el-button>
  </div>
</template>

<script>
import axios from 'axios';
import { addCategory } from "@/api/category";
export default {
  name: "FinanceManage",
  data() {
    return {
      options: [{
        value: '选项1',
        label: '收入'
      }, {
        value: '选项2',
        label: '支出'
      }],
      categories: [
        { name: "餐饮" },
        { name: "交通" },
        { name: "娱乐" },
      ],
    };
  },
  methods: {
    addCategory() {
      console.log("新增分类");
    },
    editCategory(category) {
      console.log("编辑分类", category);
    },
    deleteCategory(category) {
      console.log("删除分类", category);
    },
    getCategoryList() {
      console.log("查询分类列表");
      axios.post('/api/category',{
    "name": "交通",
    "type": 1
}).then(res => {
        this.$message.success(res.data);
      }).catch(err => {
        console.log(err);
        this.$message.error('查询失败');
      });
      
    },
    getCategoryList1() {
      addCategory({  "name": "交通阿道夫",
      "type": 1}).then(res => {
        this.$message.success(res.data);
      }).catch(err => {
        console.log(err);
        this.$message.error('查询失败');
      });
    }
  }
};

</script>

<style scoped>
.manage-container {
  padding: 20px;
}
</style>

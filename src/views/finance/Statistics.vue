<template>
  <div class="statistics-container">
    <h1>统计分析</h1>
    <el-date-picker v-model="dateRange" type="daterange" placeholder="选择时间范围"></el-date-picker>
    <el-table :data="statistics" style="width: 100%">
      <el-table-column prop="member" label="家庭成员"></el-table-column>
      <el-table-column prop="category" label="分类"></el-table-column>
      <el-table-column prop="amount" label="金额"></el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: "FinanceStatistics",
  data() {
    return {
      dateRange: [],
      statistics: [
        { member: "张三", category: "餐饮", amount: 200 },
        { member: "李四", category: "交通", amount: 100 },
      ],
    };
  },
};
</script>

<style scoped>
.statistics-container {
  padding: 20px;
}
</style>

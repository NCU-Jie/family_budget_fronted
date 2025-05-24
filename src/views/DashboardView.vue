<template>
    <div class="monthly-finance-container">
      <!-- 顶部月度结余信息 -->
      <div class="summary-section">
        <div class="monthly-balance">
          <div class="title">月度结余（总收入 - 总支出）</div>
          <div class="amount">{{ balance }}元</div>
        </div>
        <div class="current-month">当前月份：{{ currentMonth }}</div>
      </div>
    <div>
      <label style="margin-right: 15px;">快速入口:</label>
       <el-button type="primary" @click="() => this.$router.push('/transactions')">记一笔</el-button>
      <el-button type="primary" @click="() => this.$router.push('/statistics')">查看报表</el-button>
    </div>
    <div>
  最近收支记录 

  <template>
        <el-table :data="records" style="width: 100%">
          <el-table-column prop="name" label="员工姓名" width="180">
          </el-table-column>
          <el-table-column prop="username" label="账号" width="180">
          </el-table-column>
          <el-table-column prop="phone" label="手机号">
          </el-table-column>
          <el-table-column prop="status" label="帐号状态">
            <template v-slot="scope">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </template>
          </el-table-column>
          <el-table-column prop="updateTime" label="最后操作时间">
          </el-table-column>
          <el-table-column label="操作">
            <template v-slot="scope">
              <el-button type="text" @click="handleUpdateEmploye(scope.row)">修改</el-button>
              <el-button type="text" @click="handleStartOrStop(scope.row)"> {{
                scope.row.status === 0 ? '启用' : '禁用' }}</el-button>

            </template>
          </el-table-column>
        </el-table>
      </template>
  <label style="margin-right: 15px;">员工姓名:</label>
      <el-input v-model="name" placeholder="请输入员工姓名" style="width: 15%;"></el-input>
      <el-button type="primary" style="margin-left: 15px;" @click="pageQuery">查询</el-button>     </div>
     </div>
    </template>
    
    <script>
    import { getTransactionsList } from '@/api/transaction'
    export default {
  
      data() {
        return {
         balance: 0,
         currentMonth: '1'
         
        };
      },
      created() {
    this.pageQuery()
  },
      methods: {
        pageQuery() {
      const params = { name: this.name, page: this.page, pageSize: this.pageSize }
      //发送ajax请求
      getTransactionsList(params).then(res => {
        if (res.data.code === 1) {
          this.total = res.data.data.total
          this.records = res.data.data.records
        }
      }).catch(err => (
        this.$message.error('请求出错:' + err.message)
      ))
    },
      }
    };
    
    </script>
    
    <style scoped>
    .monthly-finance-container {
    background-color: #fff9e6; /* 浅黄色背景 */
    padding: 20px;
    min-height: 100vh;
    font-family: 'Arial', sans-serif;
  }
  
    </style>
    
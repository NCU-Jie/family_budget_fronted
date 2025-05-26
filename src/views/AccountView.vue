<template>
  <div class="accounting-form-container">
    <h2 class="form-title">家庭记账本</h2>
    
    <el-form :model="form" label-width="100px" class="form-content">
      <!-- 收支类型 -->
      <el-form-item label="收支类型" required>
        <el-radio-group v-model="form.type">
          <el-radio-button label="income">收入</el-radio-button>
          <el-radio-button label="expense">支出</el-radio-button>
        </el-radio-group>
      </el-form-item>
      
      <!-- 分类选择 -->
      <el-form-item label="收支分类" required>
        <el-select 
          v-model="form.category" 
          placeholder="请选择分类"
          filterable
          class="full-width"
        >
          <el-option
            v-for="item in categories"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      
      <!-- 金额输入 -->
      <el-form-item label="金额" required>
        <el-input-number
          v-model="form.amount"
          :precision="2"
          :min="0.01"
          :controls="false"
          placeholder="请输入金额"
        
          class="full-width"
        />
      </el-form-item>
      
      <!-- 家庭成员 -->
      <el-form-item label="家庭成员">
        <el-select 
          v-model="form.familyMember" 
          placeholder="选择成员"
          clearable
          class="full-width"
        >
          <el-option
            v-for="member in familyMembers"
            :key="member"
            :label="member"
            :value="member"
          />
        </el-select>
      </el-form-item>
      
      <!-- 日期选择 -->
      <el-form-item label="日期">
        <el-date-picker
          v-model="form.date"
          type="date"
          placeholder="选择日期"
          format="yyyy/MM/dd"
          value-format="yyyy-MM-dd"
          class="full-width"
        />
      </el-form-item>
      
      <!-- 备注 -->
      <el-form-item label="备注">
        <el-input
          v-model="form.remark"
          type="textarea"
          :rows="2"
          placeholder="请输入备注信息"
          class="full-width"
        />
      </el-form-item>
      
      <!-- 提交按钮 -->
      <el-form-item>
        <el-button 
          type="primary" 
          @click="submitForm"
          :loading="submitting"
          class="submit-btn"
        >
          记一笔
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        type: 'expense',
        category: '',
        amount: null,
        familyMember: '',
        date: this.getTodayDate(),
        remark: ''
      },
      categories: [
        { value: 'food', label: '餐饮美食' },
        { value: 'shopping', label: '购物消费' },
        { value: 'housing', label: '住房物业' },
        { value: 'transport', label: '交通出行' },
        { value: 'entertainment', label: '休闲娱乐' },
        { value: 'education', label: '教育培训' },
        { value: 'medical', label: '医疗保健' },
        { value: 'salary', label: '工资收入' },
        { value: 'investment', label: '投资理财' },
        { value: 'other', label: '其他' }
      ],
      familyMembers: ['爸爸', '妈妈', '爷爷', '奶奶', '孩子'],
      submitting: false
    }
  },
  methods: {
    getTodayDate() {
      const today = new Date()
      return today.toISOString().split('T')[0]
    },
    submitForm() {
      if (!this.form.category || !this.form.amount) {
        this.$message.warning('请填写完整信息')
        return
      }

      this.submitting = true
      // 实际项目中替换为API调用
      console.log('提交数据:', this.form)
      
      // 模拟提交
      setTimeout(() => {
        this.$message.success('记账成功！')
        this.resetForm()
        this.$emit('record-added') // 通知父组件数据更新
        this.submitting = false
      }, 500)
    },
    resetForm() {
      this.form = {
        type: 'expense',
        category: '',
        amount: null,
        familyMember: '',
        date: this.getTodayDate(),
        remark: ''
      }
    }
  }
}
</script>

<style scoped>
.accounting-form-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.form-title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.form-content {
  padding: 0 20px;
}

.full-width {
  width: 100%;
}

.submit-btn {
  width: 100%;
}
</style>
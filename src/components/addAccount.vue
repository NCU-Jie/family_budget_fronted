<template>
  <div class="accounting-form-container">
    <h2 class="form-title">记一笔</h2>

    <el-form :model="form" label-width="100px" class="form-content">
      <!-- 收支类型 -->
      <el-form-item label="收支类型" required>
        <el-radio-group v-model="form.typeId">
          <el-radio-button label="0">收入</el-radio-button>
          <el-radio-button label="1">支出</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <!-- 分类选择 -->
      <el-form-item label="收支分类" required>
        <pagination-category-select v-model="form.category" :type-id="form.typeId" />
      </el-form-item>

      <!-- 金额输入 -->
      <el-form-item label="金额" required>
        <el-input-number v-model="form.amount" :precision="2" :min="0.01" :controls="false" placeholder="请输入金额"
          class="full-width" />
      </el-form-item>

      <!-- 家庭成员 -->
      <el-form-item label="家庭成员">
        <el-select v-model="form.familyMember" placeholder="选择成员" clearable class="full-width"
          @focus="fetchFamilyMembers" :loading="loadingMembers" :remote="true" filterable>
          <el-option v-for="member in familyMembers" :key="member.id" :label="member.name" :value="member.id" />
        </el-select>
      </el-form-item>

      <!-- 日期选择 -->
      <el-form-item label="日期">
        <el-date-picker v-model="form.date" type="date" placeholder="选择日期" format="yyyy/MM/dd" value-format="yyyy-MM-dd"
          class="full-width" />
      </el-form-item>

      <!-- 备注 -->
      <el-form-item label="备注">
        <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注信息" class="full-width" />
      </el-form-item>

      <!-- 提交按钮 -->
      <el-form-item>
        <el-button type="primary" @click="submitForm" :loading="submitting" class="submit-btn">
          记一笔
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { addAccount } from '@/api/account';
import { getMemberList } from '@/api/member';
import PaginationCategorySelect from '@/components/PaginationCategorySelect'
import { Descriptions } from 'element-ui';
export default {
  components: {
    PaginationCategorySelect
  },
  data() {
    return {
      form: {
        typeId: 1,
        category: '',
        amount: null,
        familyMember: '',
        date: this.getTodayDate(),
        remark: ''
      },
      categories: [],
      familyMembers: [], // 初始为空数组，将从API获取
      submitting: false,
      loadingMembers: false,
    }
  },
  methods: {
    getTodayDate() {
      const today = new Date()
      return today.toISOString().split('T')[0]
    },

    async fetchFamilyMembers() {

      this.loadingMembers = true;
      try {
        // 替换为实际的API调用
        const res = await getMemberList();
        this.familyMembers = res.data.data;
      } catch (error) {
        console.error('获取家庭成员失败:', error);
        this.$message.error('获取家庭成员失败');
      } finally {
        this.loadingMembers = false;
      }
    },

    async submitForm() {
      // 1. 基础验证
      if (!this.form.category || !this.form.amount || !this.form.familyMember || !this.form.date) {
        this.$message.warning('请填写完整信息');
        return;
      }

      // 2. 金额验证
      if (this.form.amount <= 0) {
        this.$message.warning('金额必须大于0');
        return;
      }

      this.submitting = true;

      try {
        // 3. 获取成员姓名（添加错误处理）
        const selectedMember = this.familyMembers.find(m => m.id === this.form.familyMember);
        if (!selectedMember) {
          throw new Error('未找到选择的家庭成员');
        }

        // 4. 提交数据
        const res = await addAccount({
          typeId: this.form.typeId,
          categoryId: this.form.category,
          memberId: this.form.familyMember,
          memberName: selectedMember.name,
          money: this.form.amount,
          accountDate: this.form.date,
          Description: this.form.remark || null, // 空字符串转null
        });

        // 5. 处理结果
        this.$message.success(res.message || '记账成功！');
        this.resetForm();
        this.$emit('record-added');

      } catch (error) {
        console.error('提交错误:', error);
        this.$message.error(error.response?.data?.message || error.message || '提交失败');
      } finally {
        this.submitting = false;
      }
    },

    resetForm() {
      this.form = {
        type: 1,
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
<template>
  <div class="accounting-form-container">
    <h2 class="form-title">{{ form.id === null ? '记一笔' : '修改账目' }}</h2>

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
        <category-select v-model="form.categoryId" :type-id="form.typeId"/>
      
      </el-form-item>

      <!-- 金额输入 -->
      <el-form-item label="金额" required>
        <el-input-number v-model="form.money" :precision="2" :min="0.01" :controls="false" placeholder="请输入金额"
          class="full-width" />
      </el-form-item>
      <!-- 成员选择 -->
      <el-form-item label="家庭成员">
        <el-select v-model="form.memberId" placeholder="选择成员" clearable class="full-width" filterable
          @focus="fetchFamilyMembers">
          <el-option v-for="member in familyMembers" :key="member.id" :label="member.name" :value="member.id" />
        </el-select>
      </el-form-item>

      <!-- 日期选择 -->
      <el-form-item label="日期">
        <el-date-picker v-model="form.accountDate" type="date" placeholder="选择日期" format="yyyy/MM/dd"
          value-format="yyyy-MM-dd" class="full-width" />
      </el-form-item>

      <!-- 备注 -->
      <el-form-item label="备注">
        <el-input v-model="form.description" type="textarea" :rows="2" placeholder="请输入备注信息" class="full-width" />
      </el-form-item>

      <!-- 提交按钮 -->
      <el-form-item>
        <el-button type="primary" @click="submitForm" :loading="submitting" class="submit-btn">
          {{ form.id === null ? '记一笔' : '修改账目' }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { addAccount, getAccountById } from '@/api/account';
import { getMemberList } from '@/api/member';
import categorySelect from '@/components/categorySelect'

export default {
  components: {
    categorySelect
  },
  data() {
    return {
      form: {
        id: null,
        typeId: Number(1),
        categoryId: '',
        categoryName: '',
        money: null,
        memberId: '',
        memberName: '',
        accountDate: this.getTodayDate(),
        description: ''
      },
      selectedMember: null,
      familyMembers: [],
      submitting: false,
      loadingMembers: false,
    }
  },
  mounted() {
    const id = this.$route.params.id || this.$route.query.id;
    if (id) {
      // 先加载成员列表，再加载账目数据
      this.loadAccount(id);
    }
  },

  methods: {
    handleCategoryChange(categoryId, categoryName) {
      this.form.categoryId = categoryId;
      this.form.categoryName = categoryName;
    },
    async loadAccount(id) {
      try {
        const res = await getAccountById(id);
        const apiData = res.data.data;

        this.form = {
          ...apiData,
          categoryId: String(apiData.categoryId), // 确保转为字符串
          categoryName: apiData.categoryName,
          typeId: Number(apiData.typeId),
          memberId: String(apiData.memberId) // 确保成员ID也是字符串
        };

        // 确保成员在列表中
        if (apiData.memberId && !this.familyMembers.some(m => m.id === String(apiData.memberId))) {
          this.familyMembers.unshift({
            id: String(apiData.memberId),
            name: apiData.memberName || '未知成员'
          });
        }
      } catch (error) {
        console.error('加载账目失败:', error);
        this.$message.error('加载账目数据失败');
      }
    },
    getTodayDate() {
      const today = new Date()
      return today.toISOString().split('T')[0]
    },

    async fetchFamilyMembers() {

      this.loadingMembers = true;
      try {
        const res = await getMemberList();
        this.familyMembers = res.data.data.map(member => ({
          ...member,
          id: String(member.id) // 统一ID为字符串类型
        }));
      } catch (error) {
        console.error('获取家庭成员失败:', error);
        this.$message.error('获取家庭成员失败');
      } finally {
        this.loadingMembers = false;
      }
    },

    async submitForm() {
      if (!this.form.categoryId || !this.form.money || !this.form.memberId || !this.form.accountDate) {
        this.$message.warning('请填写完整信息');
        return;
      }

      if (this.form.money <= 0) {
        this.$message.warning('金额必须大于0');
        return;
      }

      this.submitting = true;

      try {
        const selectedMember = this.familyMembers.find(m => m.id === this.form.memberId);

        const submitData = {
          id: this.form.id || undefined,
          typeId: this.form.typeId,
          categoryId: this.form.categoryId,
          memberId: this.form.memberId,
          memberName: selectedMember?.name || this.form.memberName,
          money: this.form.money,
          accountDate: this.form.accountDate,
          description: this.form.description || null,
        };

        const res = await addAccount(submitData);
        this.$message.success(res.message || (this.form.id ? '修改成功' : '记账成功！'));
        this.$emit('record-added');

        if (!this.form.id) {
          this.resetForm();
        }
      } catch (error) {
        console.error('提交错误:', error);
        this.$message.error(error.response?.data?.message || error.message || '提交失败');
      } finally {
        this.submitting = false;
      }
    },

    resetForm() {
      this.form = {
        id: null,
        typeId: 1,
        categoryId: '',
        money: null,
        memberId: '',
        memberName: '',
        accountDate: this.getTodayDate(),
        description: ''
      }
    }
  }
}
</script>

<style scoped>
/* 保持原有样式不变 */
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
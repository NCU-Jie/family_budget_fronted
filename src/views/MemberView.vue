<template>
  <div class="members-page">
    <h2 class="page-title">家庭成员管理</h2>

    <div class="toolbar">
      <el-button type="primary" @click="showAddDialog">新增成员</el-button>
    </div>

    <el-table :data="members" border>
      <el-table-column prop="name" label="成员名称" />
      <el-table-column prop="sex" label="性别">
        <template slot-scope="{row}">
          {{ row.sex === 0 ? '男' : '女' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template slot-scope="{row}">
          <el-button size="mini" @click="handleEditMember(row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDeleteMember(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="30%">
      <el-form :model="currentMember" label-width="80px">
        <el-form-item label="成员名称" required>
          <el-input v-model="currentMember.name" />
        </el-form-item>
        <el-form-item label="性别" required>
          <el-radio-group v-model="currentMember.sex">
            <el-radio :label=0>男</el-radio>
            <el-radio :label=1>女</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveMember">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { addMember, getMemberList, deleteMember,updateMember } from '@/api/member'

export default {
  data() {
    return {
      members: [
      
      ],
      dialogVisible: false,
      dialogTitle: '新增成员',
      currentMember: {
        id: null,
        name: '',
        sex: 0 // 默认选择男性
      }
    }
  },
  created() {
    this.getMembers()
  },
  methods: {
    showAddDialog() {
      this.currentMember = {
        id: null,
        name: '',
        sex: 0 // 重置时默认选择男性
      }
      this.dialogTitle = '新增成员'
      this.dialogVisible = true
    },
    handleEditMember(member) {
      this.currentMember = { ...member }
      this.dialogTitle = '编辑成员'
      this.dialogVisible = true
    },
    async handleDeleteMember(member) {
      try {
        await this.$confirm('确定删除此成员吗?', '提示', {
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
          await deleteMember(member.id);
          this.$message.success('删除成功');

          // 重新获取最新成员列表
          await this.getMembers();
        } finally {
          loading.close();
        }

      } catch (error) {
        // 只有当用户点击取消时才不报错
        if (error !== 'cancel' && error !== 'close') {
          this.$message.error('删除失败: ' + (error.message || '未知错误'));
          console.error('删除成员失败:', error);
        }
      }
    },
    saveMember() {
      if (!this.currentMember.name) {
        this.$message.warning('请填写成员名称')
        return
      }

      if (this.currentMember.id) {
        // 更新
        updateMember(this.currentMember).then(res => {
          this.$message.success('更新成功')
          this.getMembers()
        })
      } else {
        // 新增
        addMember(this.currentMember).then(res => {
          this.$message.success('新增成功')
          this.getMembers()
        })
      }

      this.dialogVisible = false
      this.$message.success('保存成功')
    },
    getMembers() {
      getMemberList().then(res => {
        this.members = res.data.data
      })
    }
  }
}
</script>

<style scoped>
.members-page {
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
}

.toolbar {
  margin-bottom: 20px;
}
</style>
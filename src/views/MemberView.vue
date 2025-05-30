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
          {{ row.sex === "0" ? '男' : '女' }}
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
      <el-form :model="currentMember" label-width="100px" :rules="rules" ref="memberForm">
        <el-form-item label="成员名称" prop="name" required>
          <el-input v-model="currentMember.name" placeholder="请输入成员姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="sex" required>
          <el-radio-group v-model="currentMember.sex">
            <el-radio label='0'>男</el-radio>
            <el-radio label='1'>女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否创建账号">
          <el-switch v-model="currentMember.createAccount" active-text="是" inactive-text="否">
          </el-switch>
        </el-form-item>
        <template v-if="currentMember.createAccount">
          <el-form-item label="账号" prop="username" :rules="usernameRules">
            <el-input v-model="currentMember.username" placeholder="请输入账号" />
          </el-form-item>
          <el-form-item label="密码" prop="password" :rules="passwordRules">
            <el-input v-model="currentMember.password" type="password" placeholder="请输入密码" show-password />
          </el-form-item>
        </template>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { addMember, getMemberList, deleteMember, updateMember, getMemberById } from '@/api/member'

export default {
  data() {
    // 密码强度验证
    const validatePassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入密码'))
      } else if (value.length < 6) {
        callback(new Error('密码长度不能少于6位'))
      } else {
        callback()
      }
    }

    return {
      members: [],
      dialogVisible: false,
      dialogTitle: '新增成员',
      currentMember: {
        id: null,
        name: '',
        sex: '0',
        createAccount: false,
        username: '',
        password: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入成员名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        sex: [
          { required: true, message: '请选择性别', trigger: 'change' }
        ]
      },
      usernameRules: [
        { required: true, message: '请输入账号', trigger: 'blur' },
        { min: 4, max: 20, message: '长度在 4 到 20 个字符', trigger: 'blur' },
        {
          pattern: /^[A-Za-z0-9]+$/,  // 只允许字母和数字
          message: '账号只能包含字母或数字',
          trigger: 'blur'
        }
      ],
      passwordRules: [
        { required: true, validator: validatePassword, trigger: 'blur' }
      ]
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
        sex: '0',
        createAccount: false,
        username: '',
        password: ''
      }
      this.dialogTitle = '新增成员'
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.memberForm?.clearValidate()
      })
    },
    handleEditMember(member) {
      getMemberById(member.id).then(res => {
        // 使用 Object.assign 保持响应性
        this.currentMember = Object.assign({}, this.currentMember, res.data.data)

        // 显式设置 createAccount 的响应式状态
        this.$set(this.currentMember, 'createAccount', !!this.currentMember.username)

        this.dialogTitle = '编辑成员'
        this.dialogVisible = true
      }).catch(error => {
        this.$message.error('获取成员信息失败: ' + (error.message || '未知错误'))
      })
    },


    submitForm() {
      this.$refs.memberForm.validate(valid => {
        if (valid) {
          this.saveMember()
        } else {
          return false
        }
      })
    },
    async handleDeleteMember(member) {
      try {
        await this.$confirm('确定删除此成员吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const loading = this.$loading({
          lock: true,
          text: '删除中...',
          spinner: 'el-icon-loading'
        })

        try {
          const res = await deleteMember(member.id)
          if (res.data.code === 1) {
            this.$message.success('删除成功')
            await this.getMembers()
          }
          else if (res.data.code === 0) {
            this.$message.error(res.data.msg || '未知错误')
          }
        } finally {
          loading.close()
        }
      } catch (error) {
        if (error !== 'cancel' && error !== 'close') {
          this.$message.error('删除失败: ' + (error.message || '未知错误'))
          console.error('删除成员失败:', error)
        }
      }
    },
    saveMember() {
      const memberData = { ...this.currentMember }

      // 如果不创建账号，则移除账号密码字段
      if (!memberData.createAccount) {
        delete memberData.username
        delete memberData.password
      }
      const savePromise = memberData.id
        ? updateMember(memberData)
        : addMember(memberData)

      savePromise.then(res => {
        if (res.data.code === 1) {
          this.$message.success(memberData.id ? '更新成功' : '新增成功')
          this.dialogVisible = false
          this.getMembers()
        } else {
          this.$message.error(res.data.msg || '未知错误')
        }
      }).catch(error => {
        this.$message.error((memberData.id ? '更新' : '新增') + '失败: ' + (error.msg || '未知错误'))

      })
    },
    getMembers() {
      getMemberList().then(res => {
        this.members = res.data.data
      }).catch(error => {
        this.$message.error('获取成员列表失败: ' + (error.message || '未知错误'))
        console.error('获取成员列表失败:', error)
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

/* 调整表单标签对齐 */
.el-form-item__label {
  padding-right: 10px;
}
</style>
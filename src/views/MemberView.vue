<template>
    <div class="members-page">
      <h2 class="page-title">家庭成员管理</h2>
      
      <div class="toolbar">
        <el-button type="primary" @click="showAddDialog">新增成员</el-button>
      </div>
      
      <el-table :data="members" border>
        <el-table-column prop="name" label="成员名称" />
        <el-table-column prop="role" label="角色" />
        <el-table-column label="操作" width="180">
          <template slot-scope="{row}">
            <el-button size="mini" @click="editMember(row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="deleteMember(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="30%">
        <el-form :model="currentMember" label-width="80px">
          <el-form-item label="成员名称" required>
            <el-input v-model="currentMember.name" />
          </el-form-item>
          <el-form-item label="角色">
            <el-input v-model="currentMember.role" />
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
  export default {
    data() {
      return {
        members: [
          { id: 1, name: '爸爸', role: '父亲' },
          { id: 2, name: '妈妈', role: '母亲' }
        ],
        dialogVisible: false,
        dialogTitle: '新增成员',
        currentMember: {
          id: null,
          name: '',
          role: ''
        }
      }
    },
    methods: {
      showAddDialog() {
        this.currentMember = { id: null, name: '', role: '' }
        this.dialogTitle = '新增成员'
        this.dialogVisible = true
      },
      editMember(member) {
        this.currentMember = { ...member }
        this.dialogTitle = '编辑成员'
        this.dialogVisible = true
      },
      deleteMember(member) {
        this.$confirm('确定删除此成员吗?', '提示', {
          type: 'warning'
        }).then(() => {
          this.members = this.members.filter(m => m.id !== member.id)
          this.$message.success('删除成功')
        })
      },
      saveMember() {
        if (!this.currentMember.name) {
          this.$message.warning('请填写成员名称')
          return
        }
        
        if (this.currentMember.id) {
          // 更新
          const index = this.members.findIndex(m => m.id === this.currentMember.id)
          this.members.splice(index, 1, { ...this.currentMember })
        } else {
          // 新增
          this.currentMember.id = Date.now()
          this.members.push({ ...this.currentMember })
        }
        
        this.dialogVisible = false
        this.$message.success('保存成功')
      }
    }
  }
  </script>
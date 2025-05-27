  <!-- 表格展示 -->
  <el-tab-pane label="详细数据" name="table">
    <el-table
      :data="tableData"
      border
      style="width: 100%"
      v-loading="loading"
    >
      <el-table-column prop="date" label="日期" width="120" />
      <el-table-column prop="member" label="成员" width="100" />
      <el-table-column prop="category" label="分类" width="120" />
      <el-table-column prop="type" label="类型" width="80">
        <template slot-scope="{row}">
          <el-tag :type="row.type === 'income' ? 'success' : 'danger'" size="small">
            {{ row.type === 'income' ? '收入' : '支出' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="amount" label="金额" align="right" width="120">
        <template slot-scope="{row}">
          {{ formatCurrency(row.amount) }}
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" />
    </el-table>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagination.currentPage"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pagination.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pagination.total"
      style="margin-top: 20px;"
    />
  </el-tab-pane>

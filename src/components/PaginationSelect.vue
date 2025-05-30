<template>
    <el-select v-model="copyValue"
               :disabled="disabled"
               filterable
               clearable
               @clear="selectClear"
               placeholder="请选择"
               @change="updateValue"
               :filter-method="filterMethod"
               @focus="focusMethod"
              >
      <el-option
        v-for="item in dataList"
        :key="item.value"
        :label="item[labelKey]"
        :value="item[valueKey]+'-'+item[labelKey]"
      >
      </el-option>
        <div style="float: right;margin-right:10px;padding-bottom: 10px">
          <el-pagination
            @current-change="handleCurrentChange"
            :current-page="pageInfo.pageNum"
            :page-size="pageInfo.pageSize"
            layout=" prev, pager, next,total"
            :total="pageInfo.total">
          </el-pagination>
        </div>
    </el-select>
</template>
<script>
export default {
    name: "paginationSelect",
    props:{
      //绑定值
      value:String,
      //下拉列表
      dataList:Array,
      //option的label在列表中对应的key
      labelKey:String,
      //option的value在列表中对应的key
      valueKey:String,
      //分页信息
      pageInfo:Object,
      disabled:Boolean,
      elSelectClass:Boolean,
    },
    watch:{
      value:{
        handler:function(val){
          this.copyValue=val;
        },
        deep:true
      }
    },
    methods:{
      //更新值
      updateValue(val){
        this.$emit('selectChange',this.copyValue);
      },
      filterMethod:function (query) {
        this.copyValue=query;
        this.$emit('selectPageChange',1,this.pageInfo.pageSize,query);
      },
      focusMethod:function () {
         if(!this.dataList||(this.dataList&&this.dataList.length==0)){
             this.filterMethod();
         }
      },
      selectClear:function () {
        this.$emit('selectPageChange',1,this.pageInfo.pageSize,"");
      },
      //翻页
      handleCurrentChange(val) {
        this.$emit('selectPageChange',val,this.pageInfo.pageSize);
      }
    },
    data() {
      return {
        copyValue:this.value
      };
    }
  };
</script>
<style scoped>


  .elPaginationSelect{
    width: 100%;
    border: none !important;
  }
  .elPaginationSelect .el-input input{
    border: none !important;
    width: 100%;
  }
</style>
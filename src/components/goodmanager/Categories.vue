<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 添加分类区域 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
                </el-col>
            </el-row>
            <!-- 分类显示区域 -->
            <table-tree class="TreeTable" :data="cateList" :columns="columns" :selection-type="false" :border="true"
                :show-index="true" index-text="#" :show-row-hover="true" :expand-type="false">
                <!-- 是否有效显示区域 -->
                <template slot="isVaild" slot-scope="scope">
                    <i class="el-icon-success" style="color:green" v-if="scope.row.cat_deleted === false"></i>
                    <i class="el-icon-error" style="color:red" v-else></i>
                </template>
                <!-- 排序区域 -->
                <template slot="sort" slot-scope="scope">
                    <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
                    <el-tag size="mini" v-else-if="scope.row.cat_level === 1" type="success">二级</el-tag>
                    <el-tag size="mini" v-else type="warning">三级</el-tag>
                </template>
                <!-- 操作区域 -->
                <template slot="opt" slot-scope="scope">
                    <el-button size="mini" type="primary" icon="el-icon-edit" @click="editCateDialog(scope.row.cat_id)">编辑</el-button>
                    <el-button size="mini" type="danger" icon="el-icon-delete" @click="delCateDialog(scope.row.cat_id)">删除</el-button>
                </template>
            </table-tree>
            <!-- 分页区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="querInfo.pagenum" :page-sizes="[3,5,10,15]" :page-size="querInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>
        <!-- 添加分类区域 -->
        <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
            <el-form :model="addCateForm" :rules="addCaterules" ref="addCateRefs" label-width="100px">
                <el-form-item label="分类名称：" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="所属父类：">
                    <el-cascader expand-trigger="hover" v-model="selectedKeys" :options="parentCateDataList"
                        :props="parentCateProps" @change="parentCateChange" clearable></el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 编辑分类区域 -->
        <el-dialog title="修改分类" :visible.sync="editCateDialogVisible" width="50%">
            <el-form :model="editCateForm" :rules="editCateRules" ref="editCateRefs" label-width="100px" >
                <el-form-item label="分类名称" prop="cat_name">
                  <el-input v-model="editCateForm.cat_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editCate">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
export default {
  data() {
    return {
      // 显示商品分类的参数
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 显示商品分类的数据
      cateList: [],
      // 商品总数量
      total: 0,
      // 表格各列的配置数据
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isVaild'

        },
        {
          label: '排序',
          type: 'template',
          template: 'sort'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      // 添加分类对话框的显示和隐藏状态
      addCateDialogVisible: false,
      // 添加分类的表单数据
      addCateForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      // 添加分类表单规则
      addCaterules: {
        cat_name: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ]
      },
      // 所有父级类名的数据，用于添加分类时选择时用
      parentCateDataList: [],
      // 已经选择的所属父类,用来显示于表单中
      selectedKeys: [],
      // 父类的属性值
      parentCateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      },
      // 编辑分类提示框的显示隐藏状态
      editCateDialogVisible: false,
      // 所编辑的商品分类的数据
      editCateForm: {},
      // 所编辑的商品分类的规则
      editCateRules: {
        cat_name: [
          { required: true, message: '请输入邮箱', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', { params: this.querInfo })
      if (res.meta.status !== 200) { return this.$msg.error('获取商品分类失败！') }
      this.cateList = res.data.result
      this.total = res.data.total
    }, //   监听 pagesize 事件
    handleSizeChange(val) {
      this.querInfo.pagesize = val
      this.getCateList()
    },
    // 监听 pagenum 事件
    handleCurrentChange(val) {
      this.querInfo.pagenum = val
      this.getCateList()
    },
    // 打开添加分类对话框窗口
    showAddCateDialog() {
      this.getParentCateList()
      // 窗口显示
      this.addCateDialogVisible = true
    },
    // 获取所有用于选择的父级类别的数据
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      this.parentCateDataList = res.data
    },
    parentCateChange() {
      // 如果selectedKeys 大于 0 ，证明选中了父类，反之没有选择任何分类
      if (this.selectedKeys.length > 0) {
        // 父级分类pid赋值
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 当前分级等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 关闭添加分类对话框后重置内容
    addCateDialogClosed() {
      this.$refs.addCateRefs.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 添加分类提示框的确认事件
    async addCate() {
      // 先判断数据是否完整
      this.$refs.addCateRefs.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) { return this.$msg.error('添加分类失败') }

        this.$msg.success('添加分类成功！')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 编辑分类提示框启动
    async editCateDialog(id) {
      // 根据id获得要编辑的商品分类数据
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) { return this.$msg.error('获取商品分类信息失败！') }
      this.editCateForm = res.data
      // 显示提示框
      this.editCateDialogVisible = true
    },
    // 编辑商品分类确定按钮
    editCate() {
      // 判断数据是否符合条件
      this.$refs.editCateRefs.validate(async valid => {
        if (!valid) return
        // 提交数据
        const { data: res } = await this.$http.put('categories/' + this.editCateForm.cat_id, {
          cat_name: this.editCateForm.cat_name
        })
        if (res.meta.status !== 200) { return this.$msg.error('编辑分类名称失败！') }

        this.$msg.success('修改分类名称成功！')
        this.getCateList()
        this.editCateDialogVisible = false
      })
    },
    // 删除商品分类事件
    async delCateDialog(id) {
      // 提示是否确认删除
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$msg.error('已取消删除！')
      }
      // 根据id向网络发起删除请求
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) { return this.$msg.error('删除失败！') }

      this.getCateList()
      this.$msg.success('删除成功！')
    }

  }

}
</script>

<style lang="less" scoped>
    .TreeTable {
        margin-top: 15px;
    }

    .el-cascader {
        width: 100%;
        height: 10%;
    }
</style>

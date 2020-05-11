<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false">
      </el-alert>
      <!-- 商品分类选择区域 -->
      <el-row class="cateRow">
        <el-col>
          <span style="font-size: 20px;">选择商品分类：</span>
          <!-- 级联选择器框 -->
          <el-cascader expand-trigger="hover" v-model="selectedKeys" :options="cateList" :props="cateProps"
            @change="cateListChange"></el-cascader>
        </el-col>
      </el-row>
      <!-- 标签页区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 动态参数页标签 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数
          </el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyDataList" border stripe style="width: 100%">
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 已经有的属性标签 -->
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="handleClosed(scope.row,i)">{{item}}</el-tag>
                <!-- 用于添加的标签NewTag -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#">
            </el-table-column>
            <el-table-column prop="attr_name" label="参数名称">
            </el-table-column>
            <!-- 操作列 -->
            <el-table-column label="操作" width=200px>
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑
                </el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="delCate(scope.row.attr_id)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性页标签 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性
          </el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyDataList" border stripe style="width: 100%">
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 已经有的属性标签 -->
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="handleClosed(scope.row,i)">{{item}}</el-tag>
                <!-- 用于添加的标签NewTag -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#">
            </el-table-column>
            <el-table-column prop="attr_name" label="属性名称" width="180">
            </el-table-column>
            <!-- 操作列 -->
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑
                </el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="delCate(scope.row.attr_id)">删除
                </el-button>
              </template>
            </el-table-column>

          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加动态参数/静态属性的对话框 -->
    <el-dialog :title=' "添加"+ addDialogText' :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 添加列 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label='addDialogText' prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑动态参数/静态属性的对话框 -->
    <el-dialog :title=' "修改"+ addDialogText' :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 添加列 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label='addDialogText' prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有商品分类信息
      cateList: [],
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      //   被选中的分类id值
      selectedKeys: [],
      // 被选中的标签名称，显示相对应的页签表
      activeName: 'many',
      // 动态参数数据
      manyDataList: [],
      // 静态参数数据
      onlyDataList: [],
      // 添加对话框的显示与隐藏状态
      addDialogVisible: false,
      // 所添加的表单信息
      addForm: {
        attr_name: ''
      },
      // 所添加的表单规则
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数/属性名称', trigger: 'blur' }
        ]
      },
      // 修改动态属性静态参数对话框的显示与隐藏状态
      editDialogVisible: false,
      // 修改动态属性静态参数表单信息
      editForm: {
        attr_name: ''
      },
      // 所要修改的属性ID值
      editCateId: '',
      // 修改动态属性静态参数表单规则
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数/属性名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) { return this.$msg.error('获取商品分类信息失败！') }
      this.cateList = res.data
    },
    // 商品分类选择修改的监视函数
    cateListChange() {
      this.getParamsData()
    },
    // tab页签的点击事件监视
    handleTabClick() {
      this.getParamsData()
    },
    // 获取表格内参数的事件
    async getParamsData() {
      // 如果所选商品分类不是三级分类，则重置选择框
      if (this.selectedKeys.length < 3) {
        this.selectedKeys = []
        // 清空表格数据
        this.manyDataList = []
        this.onlyDataList = []
        return
      }
      // 如果选择了三级分类，将属性和参数打印出来
      const { data: res } = await this.$http.get(`categories/${this.selectedKeys[2]}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) { return this.$msg.error('获取数据失败！') }
      // 将标签的连续字符串分隔成数组
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.inputVisible = false
        item.inputValue = ''
      })
      // 根据动态参数和静态属性进行区分
      if (this.activeName === 'many') { this.manyDataList = res.data } else { this.onlyDataList = res.data }
    },
    // 添加对话框关闭时重置表单
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加动态参数、静态属性的确定事件
    addParams() {
      // 判断表单数据是否符合规则
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) { return }
        // 向数据库进行添加请求
        const { data: res } = await this.$http.post(`categories/${this.selectedKeys[2]}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) {
          return this.$msg.error('添加商品属性失败！')
        }
        // 重新获取商品的动态属性和静态参数
        this.getParamsData()
        // 关闭对话框
        this.addDialogVisible = false
        // 显示成功
        this.$msg.success('添加商品属性成功！')
      })
    },
    async showEditDialog(id) {
      // 将所要修改的属性ID值传到data中在确定时使用
      this.editCateId = id
      const { data: res } = await this.$http(`categories/${this.selectedKeys[2]}/attributes/${id}`, { params: { attr_sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$msg.error('获取商品属性失败！')
      }
      this.editForm = res.data
      // 显示修改对话框
      this.editDialogVisible = true
    },
    // 编辑对话框关闭时表单重置
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 编辑对话框确定按钮
    editCate() {
      // 验证表单是否满足规则
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) { return }
        // 发起修改请求
        const { data: res } = await this.$http.put(`categories/${this.selectedKeys[2]}/attributes/${this.editCateId}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 200) {
          return this.$msg.error('修改属性失败！')
        }
        // 重新刷新数据
        this.getParamsData()
        // 关闭对话框
        this.editDialogVisible = false
        // 显示修改成功的提示
        this.$msg.success('修改属性成功！')
      })
    },
    async delCate(id) {
      // 弹出确认是否删除属性的对话框
      const confirmResult = await this.$confirm('此操作将永久删除该属性, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$msg.info('已取消删除！')
      }
      // 发起删除请求
      const { data: res } = await this.$http.delete(`categories/${this.selectedKeys[2]}/attributes/${id}`)
      if (res.meta.status !== 200) {
        return this.$msg.error('删除属性失败！')
      }
      // 刷新显示数据
      this.getParamsData()
      // 显示删除成功提示
      this.$msg.success('已删除属性！')
    },
    // 输入enter键或失去焦点后的新增标签确认事件
    handleInputConfirm(row) {
      // 确认用户输入的是否为有效信息
      if (row.inputValue.trim().length === 0) {
        // 重置
        row.inputValue = ''
        // 关闭输入框
        row.inputVisible = false
        return
      }
      // 如果没有return，则证明输入的内容需要做后续处理
      // 将数据多余的空格进行清除后输入
      row.attr_vals.push(row.inputValue.trim())
      // 向数据库提出输入请求
      this.showAttrValues(row)
    },
    async showAttrValues(row) {
      // 向数据库提出输入请求
      const { data: res } = await this.$http.put(`categories/${this.selectedKeys[2]}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_vals: row.attr_vals.join(' '),
        attr_sel: row.attr_sel
      })
      if (res.meta.status !== 200) {
        return this.$msg.error('修改属性失败！')
      }
      // 重置输入框
      row.inputValue = ''
      // 关闭输入框
      row.inputVisible = false
      return this.$msg.success('修改属性成功！')
    },
    // 点击NewTag标签后进入输入框
    showInput(row) {
      // 显示输入框
      row.inputVisible = true
      // 输入框自动获取焦点
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    handleClosed(row, i) {
      row.attr_vals.splice(i, 1)
      // 向数据库提出输入请求
      this.showAttrValues(row)
    }
  },
  computed: {
    // 如果没有选择三级标签，则添加按钮设置为不可用
    isBtnDisabled() {
      if (this.selectedKeys.length !== 3) {
        return true
      } else return false
    },
    // 根据所选页标签使用相对应的对话框标题——动态or静态
    addDialogText() {
      if (this.activeName === 'many') { return '动态参数' } else return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
  .cateRow {
    margin: 20px 0;
  }

  .el-cascader {
    width: 40%;
  }
  .input-new-tag
  {
    width: 150px;
  }
</style>

<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input v-model="queryInfo.query" placeholder="请输入内容" @keyup.enter.native="getUserList" clearable
            @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userlist" style="width: 100%" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStatueChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-tooltip class="item" effect="dark" content="修改" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showeditDialog(scope.row.id)">
              </el-button>
            </el-tooltip>

            <!-- 删除按钮 -->
            <el-tooltip class="item" effect="dark" content="删除" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="delData(scope.row.id)"></el-button>
            </el-tooltip>

            <!-- 分配角色按钮 -->
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum" :page-sizes="[1,2,5,10]" :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addFormClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRefs" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 用户编辑的对话框 -->
    <el-dialog title="修改用户信息" :visible.sync="editDialogVisible" width="50%" @close="editFormClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRefs" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色的对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close="setRoleDialogClosed">
      <div>
        <p>当前用户名：{{userInfo.username}}</p>
        <p>当前角色：{{userInfo.role_name}}</p>
        <p>选择新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  data() {
    // 用于添加用户的邮件检测规则
    var checkMail = (rule, value, callback) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        // 合法的邮箱
        return callback()
      }
      // 邮箱验证错误
      return callback(new Error('请输入合法的邮箱！'))
    }
    // 用于添加用户的手机号检测规则
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^[1]([3-9])[0-9]{9}$/
      if (regMobile.test(value)) {
        return callback()
      }
      return callback(new Error('请输入合法的手机号'))
    }
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: '',
        // 当前页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 2
      },
      // 显示在页面上的用户数据
      userlist: [],
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加用户数据的规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkMail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 编辑用户的表单数据
      editForm: {
        username: '',
        email: '',
        mobile: ''
      },
      // 编辑用户数据的规则
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkMail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      total: 0,
      // 添加用户提示框的显示状态
      addDialogVisible: false,
      // 编辑用户提示框的显示状态
      editDialogVisible: false,
      // 分配角色提示框的显示状态
      setRoleDialogVisible: false,
      // 分配角色时选择的用户信息
      userInfo: {},
      // 分配角色时所有角色数据列表
      rolesList: [],
      // 被选中的角色id
      selectedRoleId: ''

    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败！')
      }
      this.userlist = res.data.users
      this.total = res.data.total
    },

    // 监听 修改每页显示多少条数据
    handleSizeChange(newsizenum) {
      this.queryInfo.pagesize = newsizenum
      this.getUserList()
    },

    // 监听 修改当前为第几页
    handleCurrentChange(newsize) {
      this.queryInfo.pagenum = newsize
      this.getUserList()
    },
    // 监听 switch 开关的状态
    async userStatueChange(userinfo) {
      const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$msg.error('用户状态更新失败！')
      }
      return this.$msg.success('用户状态更新成功！')
    },
    // 关闭后将添加用户里的表单数据重置
    addFormClosed() {
      this.$refs.addFormRefs.resetFields()
    },
    editFormClosed() {
      this.$refs.editFormRefs.resetFields()
    },
    // 添加用户的确定按钮事件
    addUser() {
      // 验证表单中各项值是否满足条件
      this.$refs.addFormRefs.validate(async valid => {
        // 如果不满足直接返回
        if (!valid) return
        // 满足的话可以发起添加用户的网络请求
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          return this.$msg.error('创建用户失败')
        }
        // 关闭添加用户的提示框
        this.addDialogVisible = false
        // 更新显示的用户数据
        this.getUserList()
        return this.$msg.success('创建用户成功')
      })
    },
    // 显示修改用户的提示框
    async showeditDialog(id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$msg.error('获取用户信息失败！')
      }

      this.editDialogVisible = true
      this.editForm = res.data
    },
    // 编辑用户数据的确定按钮
    editUser() {
      // 确定编辑数据是否满足条件
      this.$refs.editFormRefs.validate(async valid => {
        //= = 如果不满足直接返回
        if (!valid) return
        // 满足的话向网络发起编辑请求
        const { data: res } = await this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        if (res.meta.status !== 200) {
          return this.$msg.error('编辑用户失败！')
        }
        // 刷新显示数据
        this.getUserList()
        // 关闭当前的提示框
        this.editDialogVisible = false
        // 提示成功
        this.$msg.success('用户数据更新成功！')
      })
    },
    // 删除某个用户的数据
    async delData(id) {
      // 确认是否删除的提示框
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$msg('已取消删除')
      }
      // 根据id向网络发起删除请求
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        return this.$msg.error('删除用户失败！')
      }
      // 刷新当前用户数据
      this.getUserList()
      // 显示删除成功的消息
      this.$msg.success('删除用户成功！')
    },
    // 展示分配角色的对话框
    async setRole(userInfo) {
      // 得到当前选择的用户信息用于展示
      this.userInfo = userInfo
      // 在展示对话框前，获取所有角色的列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) { return this.$msg.error('获取角色列表失败') }
      this.rolesList = res.data
      // 显示分配角色的对话框
      this.setRoleDialogVisible = true
    },
    // 点击按钮保存所选角色信息
    async saveRoleInfo() {
      // 先判断是否选择了分配角色
      if (!this.selectedRoleId) { return this.$msg.error('请选择要分配的角色') }
      // 分配角色请求
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectedRoleId })
      console.log(res)
      if (res.meta.status !== 200) { return this.$msg.error('设置角色失败') }

      this.$msg.success('更新角色成功！')
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    // 重置分配角色提示框
    setRoleDialogClosed() {
      this.userInfo = {}
      this.selectedRoleId = ''
    }

  }
}
</script>

<style lang="less" scoped>

</style>

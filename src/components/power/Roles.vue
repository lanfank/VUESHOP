<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 添加用户区域 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addRoleDialogVisible = true">添加用户</el-button>
                </el-col>
            </el-row>
            <!-- 主要表单区域 -->
            <el-table :data="roleslist" style="width: 100%" border stripe>
                <!-- 展开列 -->
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row :class="['bdbottom', i1 === 0?'bdtop':'']" v-for="(item1,i1) in scope.row.children"
                            :key="item1.id">
                            <!-- 渲染一级权限 -->
                            <el-col :span="5">
                                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}
                                </el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 渲染二级和三级权限 -->
                            <el-col :span="19">
                                <el-row :class="[i2 === 0?'':'bdtop']" v-for="(item2,i2) in item1.children"
                                    :key="item2.id">
                                    <el-col :span="6">
                                        <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">
                                            {{item2.authName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-tag type="warning" v-for="(item3) in item2.children" :key="item3.id"
                                            closable @close="removeRightById(scope.row,item3.id)">
                                            {{item3.authName}}
                                        </el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作" width="300px">
                    <template slot-scope="scope">
                        <!-- 编辑按钮 -->
                        <el-button type="primary" icon="el-icon-edit" size="mini"
                            @click="showEditRoleDialog(scope.row.id)">编辑
                        </el-button>
                        <!-- 删除按钮 -->
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="delData(scope.row.id)">删除
                        </el-button>
                        <!-- 分配权限按钮 -->
                        <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRightDialog(scope.row)">
                            分配权限
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 添加用户的提示框 -->
            <el-dialog title="新增用户" :visible.sync="addRoleDialogVisible" width="50%" @close="addDialogClosed">
                <el-form :model="addRoleList" :rules="addRoleRules" ref="addRoleRefs" label-width="80px">
                    <el-form-item label="角色名称" prop="roleName">
                        <el-input v-model="addRoleList.roleName"></el-input>
                    </el-form-item>
                    <el-form-item label="角色描述" prop="roleDesc">
                        <el-input v-model="addRoleList.roleDesc"></el-input>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="addRoleDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="addRole">确 定</el-button>
                </span>
            </el-dialog>

            <!-- 编辑用户的提示框 -->
            <el-dialog title="用户权限编辑" :visible.sync="editRoleDialogVisible" width="50%" @close="editUserDialogClosed">
                <el-form :model="editRoleList" :rules="editRoleRules" ref="editRoleRefs" label-width="80px">
                    <el-form-item label="角色名称">
                        <el-input v-model="editRoleList.roleName"></el-input>
                    </el-form-item>
                    <el-form-item label="角色描述">
                        <el-input v-model="editRoleList.roleDesc"></el-input>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="editRoleDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="editRole">确 定</el-button>
                </span>
            </el-dialog>

            <!-- 分配权限提示框 -->
            <el-dialog title="用户权限编辑" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
                <el-tree :data="rightlist" :props="rightProps" node-key="id" :default-checked-keys="rightDefKey"
                    show-checkbox default-expand-all ref="treeRef"></el-tree>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="setRightDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="editRight">确 定</el-button>
                </span>
            </el-dialog>
        </el-card>
    </div>
</template>

<script>
export default {
  data() {
    return {
      // 角色获取的列表
      roleslist: [],
      // 提示框显示属性
      addRoleDialogVisible: false,
      setRightDialogVisible: false,
      editRoleDialogVisible: false,
      // 添加用户的列表
      addRoleList: {
        roleName: '',
        roleDesc: ''
      },
      // 添加用户的规则
      addRoleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      // 编辑用户的列表
      editRoleList: {

      },
      // 编辑用户的规则
      editRoleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      //   角色权限数据
      rightlist: [],
      //  树形控件的属性绑定对象
      rightProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认勾选的权限节点id值数组
      rightDefKey: [],
      //   获取当前角色的id
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    //   获取角色数据
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$msg.error('获取角色列表失败！')
      }
      this.roleslist = res.data
    },
    // 新增角色的提示框关闭后重置
    addDialogClosed() {
      this.$refs.addRoleRefs.resetFields()
    },
    // 编辑角色的提示框关闭后重置
    editUserDialogClosed() {
      this.$refs.editRoleRefs.resetFields()
    },
    // 新增角色
    addRole() {
      // 验证表单是否正确
      this.$refs.addRoleRefs.validate(async valid => {
        if (!valid) return
        // 表单正确后即可向网络发起新增角色请求
        const { data: res } = await this.$http.post('roles', this.addRoleList)
        if (res.meta.status !== 201) {
          return this.$msg.error('添加角色信息失败！')
        }
        // 更新成功提示
        this.$msg.success('添加角色信息成功！')
        // 关闭对话框
        this.addRoleDialogVisible = false
        // 更新角色表单
        this.getRolesList()
      })
    },
    // 打开编辑角色提示框并获取数据
    async showEditRoleDialog(id) {
      // 根据id向网络发起数据请求
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) { return this.$msg.error('获取角色角色失败！') }
      //   获取数据
      this.editRoleList = res.data
      //   打开提示框
      this.editRoleDialogVisible = true
    },
    // 编辑角色提示框的确认事件
    editRole() {
      // 判断表单是否正确
      this.$refs.editRoleRefs.validate(async valid => {
        if (!valid) return
        // 向网络请求编辑角色的操作
        const { data: res } = await this.$http.put('roles/' + this.editRoleList.roleId, {
          roleName: this.editRoleList.roleName,
          roleDesc: this.editRoleList.roleDesc
        })
        if (res.meta.status !== 200) {
          return this.$msg.error('提交失败！')
        }
        // 刷新显示角色信息
        this.getRolesList()
        this.$msg.success('修改成功！')
        this.editRoleDialogVisible = false
      })
    },
    // 删除角色信息
    async delData(id) {
      const ConfirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (ConfirmResult !== 'confirm') {
        return this.$msg.info('已取消删除')
      }
      // 根据id向网络发起删除请求
      const { data: res } = await this.$http.delete('roles/' + id)

      if (res.meta.status !== 200) {
        return this.$msg.error('删除失败！')
      }
      // 刷新数据
      this.getRolesList()
      // 显示删除成功
      this.$msg.success('删除用户成功！')
    },
    // 根据id删除角色的某个权限
    async removeRightById(role, rightId) {
      // 确认是否删除
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') { this.$msg.info('已取消删除') }
      console.log('quern')
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) { return this.$msg.error('删除权限失败！') }
      //   刷新角色权限的数据
      role.children = res.data
    },
    // 分配权限提示框设置
    async setRightDialog(role) {
      // 获取当前角色的id
      this.roleId = role.id
      // 根据roleid获取角色权限
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$msg.error('获取角色权限失败！')
      }
      this.rightlist = res.data
      console.log(this.rightlist)
      //   通过递归函数，勾选当前角色已有权限
      this.getRoleRightById(role, this.rightDefKey)
      console.log(this.rightDefKey)
      // 打开提示框
      this.setRightDialogVisible = true
    },
    // 分配权限提示框关闭时重置数据
    setRightDialogClosed() {
      this.rightDefKey = []
    },
    // 分配权限时，根据角色下所有三级权限id并保存到rightDefKey中
    getRoleRightById(node, arr) {
      // 如果当前节点不包括children属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getRoleRightById(item, arr)
      })
    },
    // 分配权限确定按钮
    async editRight() {
      // 获取当前所选定权限的所有id值
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      //   将keys数组转换为逗号分隔的字符串
      const idStr = keys.join(',')
      // 发起发送请求
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) { return this.$msg.error('更新权限失败！') }
      // 刷新角色权限的数据
      this.getRolesList()
      // 显示更新成功
      this.$msg.success('更新成功！')
      // 关闭提示框
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>

</style>

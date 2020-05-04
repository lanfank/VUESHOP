<template>
    <el-container class="home-container">
        <!-- 头部组件 -->
        <el-header>
            <div>
                <img src="../assets/logo.png" width="50" height="50">
                <span>电商后台管理系统</span>
            </div>
            <el-button type="info" @click="logout">退出</el-button>
        </el-header>
        <el-container>
            <!-- 左侧导航栏组件 -->
            <el-aside :width="isToggleCollapse ? '78px' : '200px'">
                <div class="toggle-button" @click='toggleCollapse'>|||</div>
                <!-- 侧边栏菜单区域 -->
                <el-menu background-color="#3b3f4a" text-color="#fff" active-text-color="#5576b8" unique-opened
                    :collapse='isToggleCollapse' :collapse-transition="false" :router='true' :default-active="activePath">
                    <!-- 一级菜单 -->
                    <el-submenu :index="item.id +''" v-for='item in menulist' :key='item.id'>
                        <!-- 一级菜单模版 -->
                        <template slot="title">
                            <!-- 图标 -->
                            <i :class="iconsObj[item.id]"></i>
                            <!-- 文本 -->
                            <span>{{item.authName}}</span>
                        </template>
                        <!-- 二级菜单 -->
                        <el-menu-item :index="'/' + subItem.path" v-for='subItem in item.children' :key='subItem.id' @click="saveNavState('/' + subItem.path)">
                            <!-- 二级菜单模版 -->
                            <template slot="title">
                                <!-- 图标 -->
                                <i class="el-icon-menu"></i>
                                <!-- 文本 -->
                                <span>{{subItem.authName}}</span>
                            </template>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <!-- 右侧主页面组件 -->
            <el-main>
                <!-- 路由占位符 -->
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>
<script>
export default {
  data() {
    return {
      // 左侧菜单数据
      menulist: [],
      // 一级菜单的图标
      iconsObj: {
        125: 'iconfont icon-users',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju-tianchong',
        145: 'iconfont icon-baobiao'
      },
      // 是否折叠
      isToggleCollapse: false,
      activePath: ''
    }
  },
  created() {
    this.getMenuList()
    // 刷新页面时给activePath变量重新赋值
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    // 退出后清空token值并回到login界面
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },

    // 获取左侧导航栏中的所有菜单的数据
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
      console.log(this.menulist)
    },
    // 点击按钮切换菜单的折叠与展开
    toggleCollapse() {
      this.isToggleCollapse = !this.isToggleCollapse
    },
    // 保存链接的激活状态
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      // 非刷新页面时候保存链接
      this.activePath = activePath
    }
  }

}
</script>
<style lang="less" scoped>
    .home-container {
        height: 100%;
    }

    .el-header {
        background-color: rgb(64, 69, 72);
        display: flex;
        justify-content: space-between;
        padding-left: 0;
        align-items: center;
        color: #fff;
        font-size: 20px;

    }

    .el-header div {
        display: flex;
        align-items: center;
    }

    .el-header div span {
        margin-left: 15px;
    }

    .el-aside {
        background-color: rgb(58, 63, 75);

    }

    .el-menu {
        border-right: 0;
    }

    .el-main {
        background-color: rgb(237, 239, 242);
    }

    .iconfont {
        margin: 10px;
    }

    .toggle-button {
        background-color: #4a5064;
        text-align: center;
        font-size: 10px;
        line-height: 24px;
        letter-spacing: 0.2em;
        color: #fff;
        cursor: pointer;
    }
</style>

<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 搜索订单区域 -->
            <el-row>
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" @keyup.enter.native="getOrderList" clearable
                        @clear="getOrderList">
                        <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
                    </el-input>
                </el-col>
            </el-row>
            <!-- 订单列表显示区域 -->
            <!-- 用户列表区域 -->
            <el-table :data="orderlist" style="width: 100%" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="订单编号" prop="order_number" width="200"></el-table-column>
                <el-table-column label="订单价格" prop="order_price" width="80"></el-table-column>
                <el-table-column label="是否付款" prop="pay_status" width="90">
                    <template slot-scope="scope">
                        <el-tag type="danger" v-if="scope.row.pay_status === '0'">未付款</el-tag>
                        <el-tag type="primary" v-else>已付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="是否发货" prop="is_send" width="80"></el-table-column>
                <el-table-column label="下单时间" prop="create_time">
                    <template slot-scope="scope">
                        {{scope.row.create_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180">
                    <template>
                        <!-- 修改地址 -->
                        <el-tooltip class="item" effect="dark" content="修改地址" placement="top" :enterable="false">
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showChangeAddress">
                            </el-button>
                        </el-tooltip>
                        <!-- 显示物流 -->
                        <el-tooltip class="item" effect="dark" content="物流信息" placement="top" :enterable="false">
                            <el-button type="success" icon="el-icon-location" size="mini" @click="showItemLog"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum" :page-sizes="[10, 20, 30, 50]" :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>

            <!-- 修改地址的提示框 -->
            <el-dialog title="修改地址" :visible.sync="changeAddressVisible" width="50%" @close="changeAddressClosed">
                <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px" >
                    <el-form-item label="省市区/县" prop="address1">
                        <el-cascader v-model="addressForm.address1" :options="Citydata" :props="firstAddressProps"></el-cascader>
                    </el-form-item>
                    <el-form-item label="详细地址" prop="address2">
                        <el-input v-model="addressForm.address2"></el-input>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="changeAddressVisible = false">取 消</el-button>
                    <el-button type="primary" @click="changeAddressVisible = false">确 定</el-button>
                </span>
            </el-dialog>
            <!-- 显示物流的提示框 -->
            <el-dialog title="物流信息" :visible.sync="itemLogVisible" width="50%" >
                <el-timeline>
                    <el-timeline-item
                      v-for="(act, index) in itemLog"
                      :key="index"
                      :timestamp="act.time">
                      {{act.context}}
                    </el-timeline-item>
                  </el-timeline>
            </el-dialog>
        </el-card>
    </div>
</template>

<script>
import Citydata from './citydata.js'
export default {
  data() {
    return {
      queryInfo: {
        // 搜索参数
        query: '',
        // 当前页数
        pagenum: 1,
        // 当前页数显示多少条数据
        pagesize: 10
      },
      // 订单列表数据
      orderlist: [],
      //   数据总数
      total: 0,
      Citydata: Citydata,
      // 修改地址提示框的显示隐藏状态
      changeAddressVisible: false,
      addressForm: {
        address1: [],
        address2: ''
      },
      addressFormRules: {
        address1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      //   省市县的显示对象
      firstAddressProps: {
        lable: 'label',
        value: 'value',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 物流信息对话框的显示与隐藏状态
      itemLogVisible: false,
      //   物流具体信息
      itemLog: []

    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    // 获取订单列表
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$msg.error('获取订单列表失败！')
      }
      this.orderlist = res.data.goods
      this.total = res.data.total
      console.log(this.orderlist)
      console.log(this.queryInfo)
    },
    // 监视每页显示多少数据函数
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    // 监视当前为第几页函数
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    // 打开修改地址提示框
    showChangeAddress() {
      this.changeAddressVisible = true
    },
    // 关闭修改地址提示框后重置
    changeAddressClosed() {
      this.$refs.addressFormRef.resetFields()
    },
    // 打开显示物流对话框
    async showItemLog() {
      this.itemLogVisible = true
      // 向数据库发起获取订单详情的请求
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) {
        return this.$msg.error('获取物流信息失败！')
      }
      this.itemLog = res.data
    }
  }
}
</script>

<style lang="less" scoped>
@import '../../plugins/timeline/timeline.css';
@import '../../plugins/timeline-item/timeline-item.css';
.el-cascader{
    width: 100%
}
</style>

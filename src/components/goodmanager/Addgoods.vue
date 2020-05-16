<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false">
      </el-alert>
      <!-- 步骤条区域 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab栏区域 -->
      <!-- 右侧表单区域 -->
      <!-- tab区域被右侧表单区域包裹 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <!-- 基本信息表单区域 -->
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格（元）" prop="goods_price">
              <el-input class="input-no-button" v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量（kg）" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!-- 商品分类级联选择器 -->
              <el-cascader expand-trigger="hover" v-model="addForm.goods_cat" :options="cateList" :props="cateProps"
                @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 动态参数表单区域 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTabsData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb,i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <!-- 静态属性表单区域 -->
            <el-form-item :label="item.attr_name" v-for="item in onlyTabsData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- 图片上传表单区域 -->
            <el-upload :action="this.uploadURL" :on-preview="handlePreview" :on-remove="handleRemove"
              list-type="picture" :headers="picHeaders" :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 商品内容的富文本编辑器框 -->
            <quill-editor v-model="addForm.goods_introduce">

            </quill-editor>
            <!-- 添加商品按钮 -->
            <el-button type="primary" class="btnAdd" @click="addItem">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 预览图片显示区域 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewUrl" alt="" class="preview_img">
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data() {
    return {
      activeIndex: '0',
      // 添加表单数据
      addForm: {
        goods_name: '',
        goods_number: '',
        goods_price: '',
        goods_weight: '',
        goods_cat: [],
        // 图片的数组
        pics: [],
        // 商品详情内容
        goods_introduce: '',
        // 商品的动态参数和静态属性
        attrs: []
      },
      // 添加表单规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品所属分类', trigger: 'blur' }
        ]
      },
      // 获取商品分类的表单数据
      cateList: [],
      // 获取商品分类的表单规则
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      //   获取商品参数中的动态参数信息
      manyTabsData: [],
      //   获取商品参数中的静态属性信息
      onlyTabsData: [],
      // 上传图片URL
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 上传图片时候的请求头部
      picHeaders: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 用于预览显示图片的地址
      previewUrl: '',
      //   预览显示图片对话框的显示与隐藏状态
      previewVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类信息
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) { return this.$msg.error('获取商品分类信息失败！') }
      this.cateList = res.data
    },
    // 级联选择器修改的监视函数
    handleChange() {
      // 如果选择的不是三级，则清空表单
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // 在标签页进行切换前进行判断函数
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$msg.error('请选择商品分类！')
        return false
      }
    },
    // 点击标签页切换函数
    async tabClicked() {
      // 动态参数页面
      if (this.activeIndex === '1') {
        // 发起获取动态参数的请求
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
        if (res.meta.status !== 200) {
          return this.$msg.error('获取动态参数信息失败！')
        }
        // 将attr_vals的字符串转换为数组
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? []
            : item.attr_vals.split(' ')
        })
        this.manyTabsData = res.data
      } else if (this.activeIndex === '2') {
        // 静态属性页面
        // 发起获得静态属性的请求
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
        if (res.meta.status !== 200) {
          return this.$msg.error('获取静态属性信息失败！')
        }
        this.onlyTabsData = res.data
      }
    },
    // 图片显示预览函数
    handlePreview(file) {
      this.previewUrl = file.response.data.url
      this.previewVisible = true
    },
    // 移除图片函数
    handleRemove(file) {
      // 1、获取将要删除的图片的临时途径
      const filePath = file.response.data.tmp_path
      // 2、从 pics 数组中，找到这个图片对应的索引值
      const index = this.addForm.pics.findIndex(x => x.pic === filePath)
      // 3、调用数组的 splice 方法，把图片信息对象，从 pics 数组中移除
      this.addForm.pics.splice(index, 1)
    },
    // 图片上传成功后的钩子函数，用于接受图片临时url
    handleSuccess(res) {
      // 接受pic的临时url地址
      const PicUrl = { pic: res.data.tmp_path }
      // 导入数据
      this.addForm.pics.push(PicUrl)
    },

    // 添加商品按钮
    addItem() {
      // 判断条件是否符合
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$msg.error('请填写必要信息！')
        }
        // 1、满足要求后先对数据进行处理
        // 将addForm数据进行深拷贝
        const form = _.cloneDeep(this.addForm)
        // 将form中的good_cat数组处理成字符串
        form.goods_cat = form.goods_cat.join(',')
        // 导入动态参数
        this.manyTabsData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 导入静态参数
        this.onlyTabsData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        // 2、向网络发起传输请求
        const { data: res } = await this.$http.post('goods', form)
        console.log(res)
        if (res.meta.status !== 201) {
          return this.$msg.error('添加商品失败！')
        }
        this.$msg.success('添加商品成功！')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    // 获取所选择的三级菜单的ID
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      } else return null
    }
  }
}
</script>

<style lang="less" scoped>
  .el-checkbox {
    margin: 0 !important
  }

  .preview_img {
    width: 100%;
  }

  .btnAdd {
    margin-top: 15px;
  }

  .input-no-button{
    -webkit-appearance: none !important;
    margin: 0;
  }
</style>

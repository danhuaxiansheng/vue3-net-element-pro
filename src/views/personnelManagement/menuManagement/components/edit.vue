<template>
  <el-dialog
    v-loading="listLoading"
    :visible="true"
    :close-on-click-modal="false"
    width="750px"
    :append-to-body="false"
    :show-close="false"
    :title="dtitle"
  >
    <el-form
      ref="formDia"
      :rules="rules"
      :model="dataRow"
      label-width="80px"
      label-position="rigth"
      class="el-form"
    >
      <el-form-item label="上级菜单">
        <el-popover
          ref="popover"
          placement="bottom"
          width="400"
          trigger="click"
        >
          <el-tree
            :data="menusData"
            node-key="id"
            :props="defaultProps"
            :default-checked-keys="checkPid"
            @node-click="handleNodeClick"
          />
          <el-input
            slot="reference"
            v-model.trim="dataRow.parentName"
            placeholder="请选择父级菜单"
            maxlength="50"
            readonly
          />
        </el-popover>
      </el-form-item>
      <el-col v-for="item in column" :key="item.prop" :span="12">
        <FormItem v-model="item.value" v-bind="item"></FormItem>
      </el-col>
    </el-form>
    <div slot="footer" style="text-align: right">
      <el-button @click="cancel">取消</el-button>
      <el-button type="primary" @click="confirmRole">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import { updateData, addData, getFirstData, getData } from '@/api/common.js'
  import { GetMenulist } from '@UTILS/menus.js'

  import FormItem from '@/components/FormItem/index.vue'
  export default {
    name: 'MenuEdit',
    components: {
      FormItem,
    },
    props: {
      rid: {
        type: Number,
        default: () => null,
        require: false,
      },
    },
    data() {
      return {
        indexName: 'tb_menu',
        listLoading: false,
        tableData: [], // 所有菜单的原始数组
        menusData: [], // children 的菜单
        dataRow: {
          // pid: null,
          parentName: '',
        },
        defaultProps: {
          children: 'children',
          label: 'title',
        },
        rules: {
          account: [{ required: true, message: '请输入账户', trigger: 'blur' }],
          username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
          ],
        },
        column: [
          // { prop: 'createtime', label: '创建时间' },
          {
            prop: 'title',
            label: '页面名称',
            type: 'input',
            dataType: 'string',
          },
          {
            prop: 'redirect',
            label: '重定向',
            type: 'input',
            dataType: 'string',
          },
          {
            prop: 'path',
            label: '访问路径',
            type: 'input',
            dataType: 'string',
          },
          {
            prop: 'name',
            label: '路径别名',
            type: 'input',
            dataType: 'string',
          },
          {
            prop: 'component',
            label: '模板名称',
            type: 'input',
            dataType: 'string',
          },
          {
            prop: 'filepath',
            label: '文件路径',
            type: 'input',
            dataType: 'string',
          },
          {
            prop: 'icon',
            label: '图标名称',
            type: 'input',
            dataType: 'string',
          },
          {
            prop: 'sort',
            label: '排序顺序',
            type: 'input',
            dataType: 'number',
            value: 0,
          },
          // {prop:'link',label:'跳转到指定路径',type:'input',dataType:'string'},
          {
            prop: 'isHide',
            label: '是否隐藏',
            type: 'radio',
            dataType: 'number',
            value: 0,
            options: [
              { label: 0, text: '显示' },
              { label: 1, text: '隐藏' },
            ],
          },
        ],
        checkPid: [],
      }
    },
    computed: {
      dtitle() {
        return this.rid ? '编辑菜单' : '新增菜单'
      },
    },
    beforeMount() {
      this.getAllList()

      this.rid != null && this.fetchData()
    },
    methods: {
      getAllList() {
        const parmas = {
          indexName: this.indexName,
          conditions: JSON.stringify([]),
          sort: JSON.stringify([{ sort: 'asc' }, { pid: 'asc' }]),
        }
        getData(parmas).then((result) => {
          this.tableData = result.data
          this.menusData = GetMenulist(result.data)
        })
      },
      fetchData() {
        const parmas = {
          indexName: this.indexName,
          conditions: JSON.stringify([{ field: 'id', value: this.rid }]),
        }
        getFirstData(parmas).then((result) => {
          this.dataRow = result.data
          if (this.dataRow.pid) {
            let filData = this.tableData.filter(
              (el) => el.id === this.dataRow.pid
            )
            this.dataRow.parentName = filData[0]?.title ?? ''
          }
          this.setValue(this.dataRow)
        })
      },

      handleNodeClick(row) {
        this.dataRow.pid = row.id
        this.dataRow.parentName = row.title
        this.$refs.popover.doClose()
      },
      setValue(data) {
        let keys = Object.keys(data)
        this.column.forEach((item) => {
          if (keys.includes(item.prop)) {
            item.value = this.getValue(data[item.prop], item.dataType)
          }
        })
      },

      getValue(value, type) {
        let val
        switch (type) {
          case 'number':
            val = value || value === '0' ? parseInt(value) : 0
            break
          case 'boolean':
            val = value ? true : false
            break
          // case 'string':
          default:
            val = value
            break
        }
        return val
      },

      getFormData() {
        let param = {}
        this.column.forEach((item) => {
          let value = this.getValue(item.value, item.dataType)
          if (value != null) {
            param[item.prop] = value
          }
        })
        return param
      },

      submitData() {
        this.listLoading = true
        const form = { ...this.dataRow }
        delete form.parentName
        if (this.rid) {
          updateData({
            indexName: this.indexName,
            conditions: JSON.stringify([{ field: 'id', value: this.rid }]),
            dataList: JSON.stringify(form),
          })
            .then((res) => {
              this.listLoading = false
              this.$baseMessage('修改成功!', 'success')
              this.$emit('yes')
            })
            .catch(() => {
              this.listLoading = false
            })
        } else {
          addData({
            indexName: this.indexName,
            dataList: JSON.stringify(form),
          })
            .then((res) => {
              this.listLoading = false
              this.$baseMessage('新增成功!', 'success')
              this.$emit('yes')
            })
            .catch(() => {
              this.listLoading = false
            })
        }
      },

      confirmRole() {
        this.dataRow = { ...this.dataRow, ...this.getFormData() }
        this.$refs.formDia.validate((valid) => {
          if (!valid) {
            return false
          } else {
            this.submitData()
          }
        })
      },
      cancel() {
        this.$emit('cancel')
      },
    },
  }
</script>

<style lang="scss" scoped>
  .el-form {
    height: 285px;
  }
</style>

<template>
  <div v-loading="pageloading" class="page-container">
    <el-row>
      <el-col class="panel-left">
        <el-card v-for="item in tableData" :key="item.id">
          <el-row class="card-head">
            <a class="card-head-title title" @click="detailsRow(item)">
              {{ item.title }}
            </a>
          </el-row>
          <el-row class="card-body">
            <div
              class="cart-body-panle"
              :class="getMoreClass(item)"
              v-html="item.content"
            ></div>
            <el-button
              v-if="!item.showMore"
              type="text"
              class="no-background more"
              @click="showMore(item)"
            >
              阅读全文
              <i class="el-icon-arrow-down"></i>
            </el-button>
          </el-row>
          <el-row class="card-btn">
            <el-button
              type="primary"
              icon="el-icon-caret-top"
              class="btn blue"
              @click="addGoods(item)"
            >
              赞同 {{ item.goodtimes }}
            </el-button>
            <el-button
              type="primary"
              icon="el-icon-caret-bottom"
              class="btn blue"
              @click="addBads(item)"
            ></el-button>
            <el-button
              type="text"
              class="no-background color-default"
              @click="openComment(item)"
            >
              <i class="el-icon-s-comment"></i>
              添加评论
            </el-button>
            <el-button
              type="text"
              class="no-background color-default"
              @click="copy(item, $event)"
            >
              <i class="el-icon-s-promotion"></i>
              分享
            </el-button>
            <el-button
              v-if="item.showMore"
              type="text"
              class="no-background more right"
              @click="hideMore(item)"
            >
              收起
              <i class="el-icon-arrow-up"></i>
            </el-button>
          </el-row>
        </el-card>
      </el-col>
      <el-col class="panel-right">
        <div class="box-card">
          <span class="card-item" @click="addMeet">
            <i class="el-icon-tickets blue-color"></i>
            回答问题
          </span>
          <span class="card-item" @click="addMeet">
            <i class="el-icon-video-camera red-color"></i>
            发视频
          </span>
          <span class="card-item" @click="addMeet">
            <i class="el-icon-edit-outline yellow-color"></i>
            写文章
          </span>
          <span class="card-item" @click="addMeet">
            <i class="el-icon-chat-dot-round green-color"></i>
            写想法
          </span>
        </div>
        <div class="read-card">
          <div class="read-item">
            <div class="read-title">今日阅读数</div>
            <div class="read-number">22</div>
            <div class="delta-group">
              <div class="delta-text">昨日数据</div>
              <div class="delta-number">7</div>
            </div>
          </div>
          <div class="read-item">
            <div class="read-title">今日赞同数</div>
            <div class="read-number">5</div>
            <div class="delta-group">
              <div class="delta-text">昨日数据</div>
              <div class="delta-number">8</div>
            </div>
          </div>
        </div>
        <a class="a-center" @click="jumpCenter">
          <div>
            进入个人中心
            <i class="el-icon-arrow-right"></i>
          </div>
        </a>
        <div class="nav-card">
          <ul>
            <li class="nav-item">
              <a type="button" class="nav-button" href="#">
                <i class="el-icon-edit-outline"></i>
                <span class="read-title" @click="jumpmy">我的文章</span>
                <span class="nav-number">3</span>
              </a>
            </li>
            <li class="nav-item">
              <a type="button" class="nav-button" href="#">
                <i class="el-icon-edit-outline"></i>
                <span class="read-title">我的回答</span>
                <span class="nav-number">18</span>
              </a>
            </li>
            <li class="nav-item">
              <a type="button" class="nav-button" href="#">
                <i class="el-icon-edit-outline"></i>
                <span class="read-title">我的点赞</span>
                <span class="nav-number">102</span>
              </a>
            </li>
          </ul>
        </div>
      </el-col>
    </el-row>
    <el-dialog
      width="50%"
      height="500px"
      class="cmment-dia"
      top="7vh"
      :visible.sync="showComment"
      @beforeClose="showComment = false"
    >
      <Comment :rowid="commentid" reversed></Comment>
    </el-dialog>
  </div>
</template>

<script>
  // 外部组件
  import copyText from '@/utils/clipboard'
  // 组件
  import Comment from '@/components/Comment/index'
  // 接口
  import { getData, updateData } from '@/api/common.js'

  export default {
    name: 'Meetlist',
    components: { Comment },
    data() {
      return {
        tableOptions: {
          column: [
            { prop: 'title', label: '标题' },
            // { prop: 'typeid', label: '文章类型' },
            {
              label: '创建时间',
              prop: 'createtime',
              width: '180',
            },
            {
              label: '操作',
              prop: 'oper',
              width: '180',
            },
          ],
        },
        queryForm: {
          pageNo: 1,
          pageSize: 10,
          username: '',
        },
        pageloading: false,
        tableData: [],
        indexName: 'tb_article',
        showComment: false, // 是否展示弹出框
        commentid: 0,
      }
    },
    beforeMount() {
      this.getAllList()
    },
    methods: {
      getAllList() {
        const parmas = {
          indexName: this.indexName,
          conditions: JSON.stringify([]),
          sort: JSON.stringify([{ createtime: 'desc' }]),
        }
        getData(parmas).then((result) => {
          this.tableData = result.data
        })
      },
      addMeet() {
        this.$router.push({
          path: '/meet/meetcreate',
        })
      },
      jumpmy() {
        this.$router.push({ path: '/meet/meetlist' })
      },
      detailsRow(row) {
        this.$router.push({
          path: '/meet/meetdetils',
          query: {
            rowid: row.id,
            type: 'details',
          },
        })
      },

      jumpCenter() {
        this.$router.push('/personalInfo')
      },
      // 点赞
      addGoods(item) {
        updateData({
          indexName: this.indexName,
          conditions: JSON.stringify([{ field: 'id', value: item.id }]),
          dataList: JSON.stringify({
            goodtimes: {
              increment: 1, // 自增
            },
          }),
        }).then((result) => {
          item.goodtimes = result.data.goodtimes
          this.$baseMessage('点赞+1', 'success')
        })
      },
      // 踩
      addBads(item) {
        updateData({
          indexName: this.indexName,
          conditions: JSON.stringify([{ field: 'id', value: item.id }]),
          dataList: JSON.stringify({
            badtimes: {
              increment: 1, // 自增
            },
          }),
        }).then((result) => {
          item.badtimes = result.data.badtimes
          this.$baseMessage('踩+1', 'success')
        })
      },
      // 拼接链接
      getCopyTxt(row) {
        return (
          location.origin +
          '/' +
          location.hash.replace('meetcart', 'meetdetils') +
          `?rowid=${row.id}&type=details`
        )
      },
      // 复制链接
      copy(item, event) {
        let text = this.getCopyTxt(item)
        copyText(text, event)
      },
      // 查看更多
      showMore(row) {
        row.showMore = true
        this.$forceUpdate()
      },
      hideMore(row) {
        row.showMore = false
        this.$forceUpdate()
      },
      getMoreClass(item) {
        item.showMore = item.showMore ?? false
        return item.showMore ? 'show-more' : 'hide-more'
      },
      // 打开评论
      openComment(item) {
        this.commentid = item.id
        this.showComment = true
      },
    },
  }
</script>

<style lang="scss" scoped>
  .page-container {
    font-family: -apple-system, BlinkMacSystemFont, Helvetica Neue, PingFang SC,
      Microsoft YaHei, Source Han Sans SC, Noto Sans CJK SC, WenQuanYi Micro Hei,
      sans-serif;
    font-size: 15px;
    color: #121212;
    padding: 0;
  }
  .card-head-title {
    text-decoration: none;
  }

  .title {
    font-size: 18px;
    font-weight: 600;
    color: #121212;
  }

  .card-body {
    .cart-body-panle {
      margin-top: 9px;
    }
    .hide-more {
      height: 155px;
      overflow: hidden;
    }
    .show-more {
      height: calc(100vh - 225px);
      overflow-y: auto;
    }
  }
  .right {
    margin-left: auto;
  }
  .card-btn {
    display: flex;
    align-items: center;
    padding: 10px 20px;
    margin: 0 -20px -10px;
  }

  .btn {
    display: inline-block;
    padding: 0 16px;
    font-size: 14px;
    line-height: 32px;
    text-align: center;
    cursor: pointer;
    background: none;
    border-radius: 3px;
    color: #8590a6;
    height: 32px;
    ::v-deep {
      i {
        font-size: 16px;
      }
    }
  }

  .blue {
    color: #06f;
    border-color: transparent;
    background: rgba(0, 102, 255, 0.1);
    padding: 0 10px;
  }

  .no-background {
    background-color: transparent;
    border: none;
    border-radius: 0;
    display: inline-block;
    font-size: 14px;
    text-align: center;
    cursor: pointer;
    background: none;
    color: #8590a6;
    height: 32px;
    ::v-deep {
      i {
        font-size: 16px;
      }
    }
  }

  .color-default {
    color: #8590a6;
  }

  .more {
    color: #175199;
  }

  .cmment-dia {
    ::v-deep {
      .el-dialog__header {
        display: none;
      }
      .el-dialog__body {
        padding: 0px;
        .comment-list {
          max-height: 300px;
          overflow-y: auto;
        }
      }
    }
  }
  .panel-left {
    width: calc(100% - 296px - 10px);
  }
  .panel-right {
    margin-left: 10px;
    padding: 0 17px;
    width: 296px;
    background: #fff;
    overflow: hidden;
    border-radius: 2px;
    box-shadow: 0 1px 3px rgb(18 18 18 / 10%);
    box-sizing: border-box;
    border: 1px solid #ebeef5;
    .box-card {
      padding: 8px 0 32px;
      position: relative;
      .card-item {
        margin: 0 auto;
        display: inline-flex;
        -ms-flex-direction: column;
        flex-direction: column;
        -ms-flex-align: center;
        align-items: center;
        cursor: pointer;
        width: 50px;
        margin-right: 18px;
      }
      .card-item:last-child {
        margin-right: 0px;
      }
      span {
        font-size: 12px;
        line-height: 1;
        text-align: center;
        color: #444;
        i {
          width: 50px;
          height: 40px;
          font-size: 24px;
        }
      }
    }
  }

  .read-card {
    font-size: 12px;
    line-height: 22px;
    height: 98px;
    display: flex;
    width: 100%;
    .read-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 50%;
    }

    .read-number {
      font-size: 18px;
      line-height: 28px;
      font-weight: 600;
    }

    .delta-group {
      box-sizing: border-box;
      margin: 0px;
      min-width: 0px;
      display: flex;
      font-size: 12px;
      -webkit-box-align: center;
      align-items: center;
      -webkit-box-pack: justify;
      justify-content: space-between;
      .delta-text {
        box-sizing: border-box;
        margin: 0px;
        min-width: 0px;
        color: rgb(99, 133, 166);
      }

      .delta-number {
        box-sizing: border-box;
        margin: 0px 0px 0px 4px;
        min-width: 0px;
        font-weight: 600;
      }
    }
  }
  .read-title {
    color: #8590a6;
  }
  .nav-card {
    margin-bottom: 10px;
    background: #fff;
    overflow: hidden;
    border-radius: 2px;
    -webkit-box-shadow: 0 1px 3px rgb(18 18 18 / 10%);
    box-shadow: 0 1px 3px rgb(18 18 18 / 10%);
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    ul {
      padding: 8px 0;
      li {
        list-style-type: none;
        a {
          display: flex;
          align-items: center;
          padding: 0 20px;
          height: 40px;
          overflow: hidden;
          .read-title {
            -webkit-box-flex: 1;
            -ms-flex: 1 1;
            flex: 1 1;
            margin: 0 10px;
            text-align: left;
            font-size: 14px;
            color: #8590a6;
          }
          .nav-number {
            padding: 6px 10px;
            border-radius: 2px;
            background: #f6f6f6;
            color: #8590a6;
            font-size: 12px;
          }
        }
      }
    }
  }
  .a-center {
    box-sizing: border-box;
    margin: 0px 0px 18px;
    min-width: 0px;
    -webkit-box-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    align-items: center;
    display: flex;
    border: 1px solid rgba(0, 102, 255, 0.5);
    color: rgb(0, 102, 255);
    border-radius: 4px;
    cursor: pointer;
    height: 40px;
    font-size: 14px;
  }

  .blue-color {
    color: rgb(0, 102, 255);
  }
  .yellow-color {
    color: rgb(244, 200, 7);
  }

  .red-color {
    color: rgb(255, 150, 7);
  }

  .green-color {
    color: rgb(38, 191, 191);
  }
</style>

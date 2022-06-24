<script setup>
import { onMounted, reactive, ref, toRaw, watch } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import localforage from 'localforage';
import Darkmode from 'darkmode-js';
import { Delete, Edit, Search, Share, Upload } from '@element-plus/icons-vue';

/**
 * @Author: jiazehua
 * @Description: 定义参数
 * @param {*}
 * @return {*}
 */

defineProps({
  msg: String
});

/**
 * @Author: jiazehua
 * @Description: 定义响应式数据
 * @param {*}
 * @return {*}
 */
const data = reactive({
  bv: '',
  videoList: [],
  dataInterval: '',
  second: 15,
  fansCount: 0,
  fansChangeCount: 0,
  uid: ''
  // uid: '557998295'
});

/**
 * @Author: jiazehua
 * @Description: 监听 视频列表
 * @param {*}
 * @return {*}
 */
watch(
  () => data.videoList,
  val => {
    setCache(val);
  },
  { deep: true }
);

/**
 * @Author: jiazehua
 * @Description: 监听 计时器 刷新数据
 * @param {*}
 * @return {*}
 */
watch(
  () => data.second,
  val => {
    loopGetData();
  }
);

/**
 * 监听粉丝数量变化
 */
watch(
  () => data.fansCount,
  (val, oldVal) => {
    if (oldVal) {
      data.fansChangeCount = val - oldVal;
      setTimeout(() => {
        // data.fansChangeCount = 0;
      }, 5000);
    }
  }
);

/**
 * @Author: jiazehua
 * @Description: 页面初始化方法
 * @param {*}
 * @return {*}
 */
onMounted(() => {
  const bvListString = getUrlParam('bv');
  const uid = getUrlParam('uid');
  if (bvListString) {
    let bvList = bvListString.split(',');
    let newBvList = [];
    bvList.forEach(bv => {
      newBvList.push({
        bv
      });
    });
    data.videoList = newBvList;
    data.uid = uid;
    setCache(newBvList);
    localforage.setItem('__uid', uid);
  } else {
    getCache();
  }
  setTimeout(() => {
    getDataForUid();
    getDataOnce();
  }, 500);
  loopGetData();
  new Darkmode().showWidget();
});

function setCache(val) {
  const _json = JSON.parse(JSON.stringify(val));
  localforage.setItem('__bvlist', _json);
}

/**
 * 获取UP主信息，粉丝数等
 */

function getDataForUid() {
  // x/relation/stat?vmid=557998295
  let uid = data.uid;
  axios.get('/api/x/relation/stat?vmid=' + uid).then(res => {
    if (res.status !== 200) return;
    const { follower } = res.data.data;
    data.fansCount = follower;
  });
}

/**
 * @Author: jiazehua
 * @Description: 获取页面初始化的url参数
 * @param {*}
 * @return {*}
 */
function getCache() {
  localforage.getItem('__bvlist').then(res => {
    if (res?.length) {
      data.videoList = res;
    }
  });

  localforage.getItem('__uid').then(res => {
    if (res?.length) {
      data.uid = res;
    }
  });
}

/**
 * @Author: jiazehua
 * @Description: 添加视频
 * @param {*}
 * @return {*}
 */
function addVideoHandler() {
  if (!data.bv) return;
  let bvList = [];
  if (data.videoList.length > 3) {
    ElMessage({
      message: '不能超过3个',
      type: 'error'
    });
    return false;
  }
  data.videoList.forEach(element => {
    bvList.push(element.bv);
  });
  if (bvList.includes(data.bv)) {
    ElMessage({
      message: '请勿重复添加',
      type: 'error'
    });
    return;
  } else {
    data.videoList.push({
      bv: data.bv
    });
    getData();
  }
  data.bv = '';
}

/**
 * @Author: jiazehua
 * @Description: 获取视频数据
 * @param {*}
 * @return {*}
 */
function getData() {
  data.videoList.forEach((element, _index) => {
    setTimeout(() => {
      axios
        .get('/api/x/web-interface/view?bvid=' + element.bv)
        .then(res => {
          if (res.status !== 200) return;
          const data = res.data.data;
          // const {cid, bvid} = data
          return data;
        })
        .then(res => {
          if (!res) return;
          let { cid, bvid, title, stat } = res;
          setTimeout(() => {
            axios.get(`/api/x/player/online/total?bvid=${bvid}&cid=${cid}`).then(moreInfo => {
              const data = moreInfo.data.data;
              const targetInfo = {
                view: stat.view,
                online: data?.total || '',
                like: stat.like,
                coin: stat.coin,
                reply: stat.reply,
                danmaku: stat.danmaku
              };
              element.view = targetInfo.view;
              element.title = title;
              element.online = targetInfo.online;
              element.like = targetInfo.like;
              element.coin = targetInfo.coin;
              element.reply = targetInfo.reply;
              element.danmaku = targetInfo.danmaku;
            });
          }, 500);
        });
    }, 1000 * (_index + 1));
  });
}

function getDataOnce() {
  data.videoList.forEach((element, _index) => {
    axios
      .get('/api/x/web-interface/view?bvid=' + element.bv)
      .then(res => {
        if (res.status !== 200) return;
        const data = res.data.data;
        // const {cid, bvid} = data
        return data;
      })
      .then(res => {
        if (!res) return;
        let { cid, bvid, title, stat } = res;
        axios.get(`/api/x/player/online/total?bvid=${bvid}&cid=${cid}`).then(moreInfo => {
          const data = moreInfo.data.data;
          const targetInfo = {
            view: stat.view,
            online: data?.total || '',
            like: stat.like,
            coin: stat.coin,
            reply: stat.reply,
            danmaku: stat.danmaku
          };
          element.view = targetInfo.view;
          element.title = title;
          element.online = targetInfo.online;
          element.like = targetInfo.like;
          element.coin = targetInfo.coin;
          element.reply = targetInfo.reply;
          element.danmaku = targetInfo.danmaku;
        });
      });
  });
}

/**
 * @Author: jiazehua
 * @Description: 移除视频
 * @param {*} videoItem
 * @return {*}
 */
function removeVideo(videoItem) {
  let newList = [];
  data.videoList.forEach(element => {
    if (element.bv !== videoItem.bv) {
      newList.push(element);
    }
  });
  data.videoList = newList;
  ElMessage({
    message: '移除成功',
    type: 'success'
  });
}

/**
 * @Author: jiazehua
 * @Description: 复制地址方法
 * @param {*} id
 * @return {*}
 */
function copyUrl(id) {
  $('body').after("<input id='copyVal'></input>");
  var text = id;
  var input = document.getElementById('copyVal');
  input.value = text;
  input.select();
  input.setSelectionRange(0, input.value.length);
  document.execCommand('copy');
  $('#copyVal').remove();
}

/**
 * @Author: jiazehua
 * @Description: 千位分割 template调用
 * @param {*}
 * @return {*}
 */

function commafy(num) {
  return num ? String(num).replace(/(\d)(?=(\d{3})+$)/g, '$1,') : 0;
}

/**
 * @Author: jiazehua
 * @Description: 获取URL参数
 * @param {*} name
 * @return {*}
 */
function getUrlParam(name) {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)'); // 构造一个含有目标参数的正则表达式对象
  var r = window.location.search.substr(1).match(reg); // 匹配目标参数
  if (r != null) return unescape(r[2]);
  return null; // 返回参数值
}

/**
 * @Author: jiazehua
 * @Description: 定时刷新数据
 * @param {*}
 * @return {*}
 */
function loopGetData() {
  if (data.dataInterval) {
    clearInterval(data.dataInterval);
  }
  data.dataInterval = setInterval(() => {
    getDataForUid();
    getData();
  }, 1000 * data.second);
}

/**
 * @Author: jiazehua
 * @Description: 分享按钮
 * @param {*}
 * @return {*}
 */
function share() {
  let url = 'http://' + window.document.domain;
  let params = data.videoList?.length ? '?bv=' : '';
  let paramsArray = [];
  if (data?.videoList?.length) {
    data.videoList.forEach(element => {
      paramsArray.push(element.bv);
    });
  }
  url = url + params + paramsArray.join();
  if (data.uid) {
    url = url + '&uid=' + data.uid;
  }

  copyUrl(url);
  ElMessage({
    message: '地址已复制，分享给别人吧！',
    type: 'success'
  });
}
</script>

<template>
  <div style="max-width: 1000px;margin: 0 auto">
    <div style="margin-bottom: 5px">
      <div style="display: flex">
        <div style="margin-right: 10px">
          <el-input
            clearable
            v-model="data.uid"
            placeholder="输入UID"
          ></el-input>
        </div>
        <div
          style="width: 170px;margin-right: 10px"
          v-if="data.fansCount"
        >
          <el-badge
            v-if="data.fansChangeCount"
            :value="(data.fansChangeCount > 0 ? '+' : '' )+ data.fansChangeCount"
            :type="data.fansChangeCount > 0 ? 'danger' : 'success'"
            class="item"
          >
            <p style="line-height: 32px; margin:0; padding-right:5px">
              粉丝数
              <span
                :class="data.fansChangeCount ?( data.fansChangeCount > 0 ? 'text-danger' : 'text-success') : 'text-default'"
                style="font-weight: 900"
              >{{data.fansCount}}</span>
            </p>
          </el-badge>
          <p
            v-else
            style="line-height: 32px; margin:0; padding-right:5px"
          >
            粉丝数
            <span
              :class="data.fansChangeCount ?( data.fansChangeCount > 0 ? 'text-danger' : 'text-success') : 'text-default'"
              style="font-weight: 900"
            >{{data.fansCount}}</span>
          </p>
        </div>

        <el-button
          @click="share"
          type="primary"
        >分享</el-button>
      </div>
    </div>

    <!-- <el-button
            @click="share"
            type="primary"
    >分享</el-button>-->
    <div style="margin-bottom: 10px">
      <el-input
        clearable
        v-model="data.bv"
        placeholder="输入BV号"
      >
        <!-- <template #prepend>https://www.bilibili.com/video/</template> -->
        <template #append>
          <el-button
            @click="addVideoHandler"
            type="primary"
          >添加</el-button>
        </template>
      </el-input>
    </div>
    <div
      v-for="(item, index) in data.videoList"
      :key="index + '_video'"
      class="mb-2 video-box"
    >
      <el-descriptions
        :title="item.title"
        border
        style="width: 100%"
        :column="2"
      >
        <template #extra>
          <el-popconfirm
            title="确认移除观察列表？"
            @confirm="removeVideo(item)"
          >
            <template #reference>
              <el-button
                type="danger"
                size="small"
                :icon="Delete"
              />

              <!-- <el-button type="danger"  :icon="Delete" >移除</el-button> -->
            </template>
          </el-popconfirm>
        </template>
        <el-descriptions-item label="播放">
          <span style="color: #e47470">{{commafy(item.view)}}</span>
        </el-descriptions-item>
        <el-descriptions-item label="在线">
          <span style="color: #e47470">{{commafy(item.online)}}</span>
        </el-descriptions-item>
        <el-descriptions-item label="点赞">{{commafy(item.like)}}</el-descriptions-item>
        <el-descriptions-item label="投币">{{commafy(item.coin)}}</el-descriptions-item>
        <el-descriptions-item label="评论">{{commafy(item.reply)}}</el-descriptions-item>
        <el-descriptions-item label="弹幕">{{commafy(item.danmaku)}}</el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>


<style lang="scss">
.mb-2 {
  margin-bottom: 1rem;
}
.mb-4 {
  margin-bottom: 2rem;
}
.el-descriptions__title {
  overflow: hidden;
  max-width: 85% !important;
  word-break: keep-all; /* 不换行 */
  white-space: nowrap; /* 不换行 */
  overflow: hidden; /* 内容超出宽度时隐藏超出部分的内容 */
  text-overflow: ellipsis; /* 当对象内文本溢出时显示省略标记(...) ；需与overflow:hidden;一起使用。*/
}
td.is-bordered-content {
  font-size: 1rem !important;
  font-weight: 900 !important;
}
.video-box {
  background: #fff;
  padding: 5px 10px 20px 10px;
  border-radius: 5px;
}
html,
body {
  background-color: #f5f5f5 !important;
  min-height: 100vh;
  padding: 0 !important;
  margin: 0 !important;
}
.el-descriptions__header {
  margin-bottom: 6px !important;
}
.text-danger {
  color: #e47470;
}
.text-success {
  color: #7ec050;
}
.text-default {
  color: #000;
}
</style>

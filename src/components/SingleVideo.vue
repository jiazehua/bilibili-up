<template>
  <el-row :gutter="20">
    <!-- <el-col :span="8">
      <el-input
        clearable
        v-model="data.uid"
        placeholder="输入UID"
      ></el-input>
    -->
    <el-col :span="14">
      <el-input
        clearable
        v-model="data.bv"
        placeholder="输入BV"
      ></el-input>
    </el-col>

    <el-col :span="10">
      <el-button
        @click="share"
        type="warning"
      >分享</el-button>
      <el-button
        @click="refresh"
        type="primary"
      >刷新</el-button>
    </el-col>
  </el-row>
  <el-row>
    <p class="block-p">
      <span class="title-inline bold">标题</span>
      {{data.videoInfo.title}}
    </p>
  </el-row>
  <el-row v-if="data.follower">
    <p class="block-p">
      <span class="title-inline bold">粉丝数</span>
      {{commafy(data.follower)}}
      <span
        style="margin-left:.5vh;"
        :class="data.followerDiff ?( data.followerDiff > 0 ? 'text-danger bold' : 'text-success bold') : 'text-default bold '"
        v-if="data.followerDiff"
      >{{ data.followerDiff > 0 ? '+' + data.followerDiff : data.followerDiff }}</span>
    </p>
  </el-row>

  <el-row>
    <p class="block-p">
      <span class="title-inline bold text-danger">播放</span>
      {{commafy(data.videoInfo.view)}}
    </p>
  </el-row>
  <el-row>
    <p class="block-p">
      <span class="title-inline bold text-danger">在线</span>
      {{commafy(data.videoInfo.online)}}
    </p>
  </el-row>
  <el-row>
    <p class="block-p">
      <span class="title-inline">点赞</span>
      {{commafy(data.videoInfo.like)}}
    </p>
  </el-row>
  <el-row>
    <p class="block-p">
      <span class="title-inline">投币</span>
      {{commafy(data.videoInfo.coin)}}
    </p>
  </el-row>
  <el-row>
    <p class="block-p">
      <span class="title-inline">评论</span>
      {{commafy(data.videoInfo.reply)}}
    </p>
  </el-row>
  <el-row>
    <p class="block-p">
      <span class="title-inline">弹幕</span>
      {{commafy(data.videoInfo.danmaku)}}
    </p>
  </el-row>
</template>
<script setup>
import { onMounted, reactive, ref, toRaw, watch } from 'vue';
import moment from 'moment';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import localforage from 'localforage';
import Darkmode from 'darkmode-js';
import { Delete, Edit, Search, Share, Upload } from '@element-plus/icons-vue';

const data = reactive({
  bv: '',
  av: '',
  uid: '',
  second: 30,
  follower: 0,
  followerDiff: 0,
  _timeFlag: '',
  videoInfo: {
    title: '',
    like: 0,
    coin: 0,
    reply: 0,
    danmaku: 0
  }
});

watch(
  () => data.follower,
  (val, oldVal) => {
    if (oldVal) {
      data.followerDiff = val - oldVal;
    }
  }
);

watch(
  () => data.followerDiff,
  val => {
    if (val) {
      setTimeout(() => {
        data.followerDiff = 0;
      }, 8000);
    }
  }
);

watch(
  () => data.bv,
  val => {
    if (val) {
      setTimeout(() => {
        window.localStorage.setItem('bv', val);
      }, 1000);
    }
  }
);

onMounted(() => {
  checkCache();
  getData();
  loopGetData();
});

function share() {
  let url = 'http://' + window.document.domain + `?bv=${data.bv}`;
  copyUrl(url);
  ElMessage({
    message: '地址已复制，分享给别人吧！',
    type: 'success'
  });
}

function checkCache() {
  const bv = getUrlParam('bv');
  // const uid = getUrlParam('uid');
  // if (uid) {
  //   window.sessionStorage.setItem('uid', uid);
  //   data.uid = uid;
  // }
  if (bv) {
    window.localStorage.setItem('bv', bv);
    data.bv = bv;
  } else {
    const localBv = window.localStorage.getItem('bv');
    if (localBv) {
      data.bv = localBv;
    }
  }
}

function getData() {
  data._timeFlag = moment();
  if (data.bv) {
    getDataForBv();
  }
}

function loopGetData() {
  if (data.dataInterval) {
    clearInterval(data.dataInterval);
  }
  data.dataInterval = setInterval(() => {
    getData();
  }, 1000 * data.second);
}

function getDataForBv() {
  axios
    .get('/api/x/web-interface/view?bvid=' + data.bv)
    .then(res => {
      if (res.status !== 200) return;
      const data = res.data.data;
      // const {cid, bvid} = data
      return data;
    })
    .then(res => {
      if (!res) return;
      let { cid, bvid, title, stat, owner } = res;
      data.followerDiff = 0;

      getDataForUid(owner.mid);
      axios.get(`/api/x/player/online/total?bvid=${bvid}&cid=${cid}`).then(moreInfo => {
        const _data = moreInfo.data.data;
        const targetInfo = {
          view: stat.view,
          online: _data?.total || '',
          like: stat.like,
          coin: stat.coin,
          reply: stat.reply,
          danmaku: stat.danmaku
        };
        data.videoInfo.view = targetInfo.view;
        data.videoInfo.title = title;
        data.videoInfo.online = targetInfo.online;
        data.videoInfo.like = targetInfo.like;
        data.videoInfo.coin = targetInfo.coin;
        data.videoInfo.reply = targetInfo.reply;
        data.videoInfo.danmaku = targetInfo.danmaku;
      });
    });
}
function getDataForUid(uid) {
  // x/relation/stat?vmid=557998295
  axios.get('/api/x/relation/stat?vmid=' + uid).then(res => {
    if (res.status !== 200) return;
    const { follower } = res.data.data;
    data.follower = follower;
  });
}
function checkMinTimeInterval() {
  const _newTime = moment();
  const _oldTime = data._timeFlag;
  const diff = _newTime.diff(_oldTime, 'seconds');
  return diff;
}
function refresh() {
  const _diffSecond = checkMinTimeInterval();
  if (_diffSecond > 10) {
    getData();
  } else {
    ElMessage({
      message: `请${10 - _diffSecond}秒后再刷新`,
      type: 'error'
    });
  }
}
function getUrlParam(name) {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)'); // 构造一个含有目标参数的正则表达式对象
  var r = window.location.search.substr(1).match(reg); // 匹配目标参数
  if (r != null) return unescape(r[2]);
  return null; // 返回参数值
}
function commafy(num) {
  return num ? String(num).replace(/(\d)(?=(\d{3})+$)/g, '$1,') : 0;
}
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
</script>

<style>
.text-danger {
  color: #e47470;
}
.text-success {
  color: #7ec050;
}
.text-default {
  color: #000;
}
.block-p {
  font-size: 3vh !important;
  margin: 1vh 0;
  text-align: left;
  background: #fff;
  width: 100%;
  padding: 1vh;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
}
html,
body {
  min-height: 100%;
  background-color: #f5f5f5;
}
.title-inline {
  width: 15vh;
  display: inline-block;
}
.bold {
  font-weight: bold;
}
</style>
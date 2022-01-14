<script setup>
import { onMounted, reactive, ref, toRaw, watch } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import localforage from 'localforage';
defineProps({
  msg: String
});

const data = reactive({
  bv: '',
  videoList: [],
  dataInterval: '',
  second: 10
});
watch(
  () => data.videoList,
  val => {
    console.log('val :>> ', JSON.parse(JSON.stringify(val)));
    const _json = JSON.parse(JSON.stringify(val));
    localforage.setItem('__bvlist', _json);
  },
  { deep: true }
);

function getCache() {
  localforage
    .getItem('__bvlist')
    .then(res => {
      if (res?.length) {
        data.videoList = res;
      }
    })
    .catch(e => {
      console.log('e :>> ', e);
    });
}

function addVideoHandler() {
  if (!data.bv) return;
  let bvList = [];
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
}
function getData() {
  data.videoList.forEach(element => {
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
            online: data.total,
            like: stat.like,
            coin: stat.coin
          };
          element.view = targetInfo.view;
          element.title = title;
          element.online = targetInfo.online;
          element.like = targetInfo.like;
          element.coin = targetInfo.coin;
        });
      });
  });
}

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

onMounted(() => {
  getCache();
  setTimeout(() => {
    getData();
  }, 1000);
  loopGetData();
});

function loopGetData() {
  if (data.dataInterval) {
    clearInterval(data.dataInterval);
  }
  data.dataInterval = setInterval(() => {
    getData();
  }, 1000 * data.second);
}
</script>

<template>
  <div style="max-width: 800px;margin: 0 auto">
    <div style="text-align:left;margin-bottom:10px">
      <span style="color: #666; padding-right: 10px">刷新频率</span>
      <el-input-number
        v-model="data.second"
        :min="5"
        :max="10000000"
      />
    </div>
    <div class="mb-4">
      <el-input
        clearable
        v-model="data.bv"
        placeholder="输入BV号"
      >
        <template #prepend>https://www.bilibili.com/video/</template>
        <template #append>
          <el-button
            @click="addVideoHandler"
            type="primary"
          >确定</el-button>
        </template>
      </el-input>
    </div>
    <div
      v-for="(item, index) in data.videoList"
      :key="index + '_video'"
      style="background: #00a1d6; padding: 5px 10px 20px 10px;border-radius: 5px"
      class="mb-2"
    >
      <el-descriptions
        :title="item.title"
        border
        style="width: 100%"
        :column="4"
      >
        <template #extra>
          <el-popconfirm
            title="确认移除观察列表？"
            @confirm="removeVideo(item)"
          >
            <template #reference>
              <el-button type="danger">移除</el-button>
            </template>
          </el-popconfirm>
        </template>
        <el-descriptions-item label="播放">{{item.view}}</el-descriptions-item>
        <el-descriptions-item label="在线">{{item.online}}</el-descriptions-item>
        <el-descriptions-item label="赞">{{item.like}}</el-descriptions-item>
        <el-descriptions-item label="币">{{item.coin}}</el-descriptions-item>
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
  color: #fff !important;
}
</style>

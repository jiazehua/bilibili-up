<template>
  <div class="i-wrapper">
    <el-table
      :data="data.tableData"
      style="width: 100%"
      border
      stripe
    >
      <el-table-column
        fixed
        prop="title"
        label="标题"
        width="180"
      ></el-table-column>
      <el-table-column
        prop="view"
        label="播放"
        width="90"
      ></el-table-column>
      <el-table-column
        prop="online"
        label="在线"
        width="80"
      ></el-table-column>

      <el-table-column
        prop="like"
        label="点赞"
        width="80"
      ></el-table-column>
      <el-table-column
        prop="coin"
        label="投币"
        width="80"
      ></el-table-column>
      <el-table-column
        prop="reply"
        label="评论"
        width="80"
      ></el-table-column>
      <el-table-column
        prop="danmaku"
        label="弹幕"
        width="80"
      ></el-table-column>
      <el-table-column
        label="操作"
        width="120"
      >
        <template #default>
          <!-- 获取参数 定义remove -->
          <el-button
            link
            type="primary"
            size="small"
            @click="remove(params)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 添加按钮 -->
    <div class="mt-4">
      <el-input
        v-model="data.bv"
        placeholder="bv号"
        class="input-with-select"
      >
        <template #append>
          <!-- 蓝色 -->
          <el-button
            type="primary"
            @click="add"
          >添加</el-button>
        </template>
      </el-input>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
let data = reactive({
  bv: '',
  bvList: [],
  uid: '',
  tableData: [
    // {
    //   title: '妻子：他太看重血缘了，禽兽不如！结婚十六年，结果3个孩子都不是亲生的',
    //   view: '100.1万',
    //   online: '1000+',
    //   like: '9999',
    //   coin: '9999',
    //   reply: '9999',
    //   danmaku: '9999'
    // },
    // {
    //   title: '妻子：他太看重血缘了，禽兽不如！结婚十六年，结果3个孩子都不是亲生的',
    //   view: '999999',
    //   online: '1000+'
    // },
    // {
    //   title: '妻子：他太看重血缘了，禽兽不如！结婚十六年，结果3个孩子都不是亲生的',
    //   view: '999999',
    //   online: '1000+'
    // },
    // {
    //   title: '妻子：他太看重血缘了，禽兽不如！结婚十六年，结果3个孩子都不是亲生的',
    //   view: '999999',
    //   online: '1000+'
    // }
  ]
});

// 深度检测data.bvList的变化
watch(
  () => data.bvList,
  bvList => {
    // 存入本地存储
    console.log('bvList :>> ', bvList);
  },
  { deep: true }
);

const setLocalStorage = (key, data) => {
  // 先把data转为字符串
  const dataStr = JSON.stringify(data);
  // 再存入本地存储
  window.localStorage.setItem(key, dataStr);
};

const getLocalStorage = key => {
  // 先获取本地存储的字符串
  const dataStr = window.localStorage.getItem(key);
  // 再把字符串转为对象
  const dataObj = JSON.parse(dataStr);
  // 返回对象
  return dataObj;
};

// 从url params取uid
const getUid = () => {
  // 获取url参数
  const params = new URLSearchParams(window.location.search);
  // 获取uid
  const uid = params.get('uid');
  // 返回uid
  return uid;
};

// 从url params 取bvList
const getBvList = () => {
  // 获取url参数
  const params = new URLSearchParams(window.location.search);
  // 获取bvList
  const bvList = params.get('bvList');
  // 返回bvList
  // 如果有bvList则把这个逗号分割的字符串转为数组
  if (bvList) {
    return bvList.split(',');
  } else {
    return [];
  }
};

onMounted(() => {
  // 启动循环获取数据，根据bvList生成tableData
  getDataList();
  setTimeout(() => {
    getDataList();
  }, 1000);
});

const getDataList = () => {
  if (data.bvList.length === 0) return;
  data.bvList.forEach(element => {
    console.log('element :>> ', element);
  });
};

// 删除行
const remove = params => {
  console.log('remove');
  // 获取参数
  const { row, rowIndex } = params;
  console.log(row, rowIndex);
};

// 添加行
const add = () => {
  if (!data?.bv) return;
  // 检查bv是否已经存在于bvList
  const isExist = data.bvList.some(item => item === data.bv);
  if (isExist) {
    alert('已经存在');
    return;
  }
  // 添加bv到bvList
  data.bvList.push(data.bv);
  console.log('data.bvList :>> ', data.bvList);
  data.bv = '';
};
</script>
<style lang="scss" >
// css大屏幕兼容性
@media screen and (min-width: 1024px) {
  .i-wrapper {
    box-sizing: border-box;
    width: 430px;
    border: 1px solid #ddd;
    min-height: 100vh;
    margin: 0 auto;
    background-color: #fff;
  }
}
body {
  margin: 0 !important;
  background: #252525;
}
</style>
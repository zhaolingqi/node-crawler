const { rejects } = require('assert');
const axios = require('axios');
const { resolve } = require('path');
let url1 = "https://www.1905.com/vod/list/n_1/o3p1.html";

// 获取起始页面所有电影分类的地址
async function getClassUrl() {
  let html = await get(url1);
  // console.log(html);
  let reg = /<span class="search-index-L">栏目(.*?)div>/igs;
  let result = reg.exec(html)[1];
  console.log(result[1]);
}
getClassUrl();
function get(url) {
  return new Promise((resolve, reject) => {
    axios.get(url).then(res => {
      resolve(res.data);
    }, err => {
      reject(err);
    })
  })
}

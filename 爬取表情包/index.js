const cheerio = require('cheerio');
// 获取html文档的内容，与jquery一样
const axios = require('axios');
const fs = require('fs');
const url = require('url');
const path = require('path');

let httpUrl = "https://fabiaoqing.com/bqb/lists/type/hot/page/1.html";
const baseUrl = "https://fabiaoqing.com";
const imgBasePath = "./img";

(async function getEmoticons(url) {
  const html = await getHtml(url);
  const $ = cheerio.load(html);
  let urlArr = [];
  $('#container .right .bqba').each((i, e) => {
    const emoticonsPath = ($(e).attr('href'));
    const emoticonsTitle = $(e).attr('title').split(" ")[0];
    const emoticonsUrl = `${baseUrl}${emoticonsPath}`;
    urlArr.push({ emoticonsUrl, emoticonsTitle });
    // parsePage(emoticonsUrl, emoticonsTitle);
  });
  let i = 0;
  let point = setInterval(() => {
    if (i < urlArr.length) {
      const obj = urlArr[i++];
      parsePage(obj.emoticonsUrl, obj.emoticonsTitle);
    } else {
      clearInterval(point);
    }
  }, 1000);
})(httpUrl)

async function parsePage(url, title) {
  try {
    const html = await getHtml(url);
    const $ = cheerio.load(html);
    // 创建文件夹 （再img文件夹下）
    const imgPath = `${imgBasePath}/${title}`;
    mkdirSync(imgPath, () => {
      console.log(`${title}文件夹创建成功`);
    });
    $('.swiper-wrapper a img').each((i, e) => {
      // console.log($(e).attr('data-original'))
      const imgUrl = $(e).attr('data-original');
      const imgName = path.parse(imgUrl).base;
      downloadImg(imgUrl, `${imgPath}/${imgName}`);
    })
  } catch (err) {
    console.log(err);
  }
}

function downloadImg(imgUrl, imgPath) {
  axios.get(imgUrl, {
    responseType: 'stream'
  }).then(res => {
    res.data.pipe(fs.createWriteStream(imgPath));
  }, err => {
    console.log(err);
  })
}

function getHtml(url) {
  return new Promise((resolve, reject) => {
    axios.get(url).then(res => {
      resolve(res.data);
    }, err => {
      reject(err);
    })
  })
}

function mkdirSync(dir, cb) {
  let paths = dir.split('/');
  let index = 1;
  function next(index) {
    //递归结束判断
    if (index > paths.length) return cb();
    let newPath = paths.slice(0, index).join('/');
    fs.access(newPath, function (err) {
      if (err) {//如果文件不存在，就创建这个文件
        fs.mkdir(newPath, function (err) {
          next(index + 1);
        });
      } else {
        //如果这个文件已经存在，就进入下一个循环
        next(index + 1);
      }
    })
  }
  next(index);
}

const cheerio = require('cheerio');
// 获取html文档的内容，与jquery一样
const axios = require('axios');
const fs = require('fs');
const url = require('url');
const path = require('path');

const links = [
  "https://dblp.uni-trier.de/db/conf/sp/",
  "https://dblp.uni-trier.de/db/conf/uss/",
  "https://dblp.uni-trier.de/db/conf/ccs/",
  "https://dblp.uni-trier.de/db/conf/ndss/",
  "https://dblp.uni-trier.de/db/conf/crypto/",
  "https://dblp.uni-trier.de/db/conf/esorics/",
  "https://dblp.uni-trier.de/db/conf/raid/",
  "https://dblp.uni-trier.de/db/conf/acsac/",
  "https://dblp.uni-trier.de/db/conf/dsn/",
  "https://dblp.uni-trier.de/db/conf/imc/",
  "https://dblp.uni-trier.de/db/conf/asiaccs/",
  "https://dblp.uni-trier.de/db/conf/pet/",
  "https://dblp.uni-trier.de/db/conf/eurosp/",
  "https://dblp.uni-trier.de/db/conf/csfw/",
  "https://dblp.uni-trier.de/db/conf/asiacrypt/",
  "https://dblp.uni-trier.de/db/conf/tcc/",
  "https://dblp.uni-trier.de/db/conf/ches/"
];

(async function main(links) {
  for (let i = 0; i < links.length; i++) {
    await sleep(5000);
    getSession(links[i]);
  }
})(links);

async function getSession(link) {
  const html = await getHtml(link);
  const $ = cheerio.load(html);
  let keyArr = [];
  $('body ul li .toc-link').each((i, e) => {
    const key = $(e).attr('href').match(/db\/conf\/.*\/.*/gi)[0].replace(".html", "");
    keyArr.push(key);
  });
  for (let i = 0; i < keyArr.length; i++) {
    let url = `https://dblp.uni-trier.de/search/publ/api?q=toc%3A${keyArr[i]}.bht%3A&h=1000&format=json`;
    await sleep(1000);
    getPaper(url);
  }
}

async function getPaper(url, key) {
  const res = await get(url);
  const paperDataArr = res.result.hits.hit;
  paperDataArr.forEach(async element => {
    const data = dataProcess(element.info);
    await fsWrite(`./1.txt`, `${JSON.stringify(data)}\n`);
  });
}


function dataProcess(data) {
  const authors = [];
  if (data.authors && data.authors.author instanceof Array) {
    data.authors.author.forEach((e) => {
      authors.push(e.text)
    });
  }
  data.authors = authors;
  console.log(data.authors);
  return data;
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
function get(url) {
  return new Promise((resolve, reject) => {
    axios.get(url).then(res => {
      resolve(res.data);
    }, err => {
      reject(err);
    })
  })
}

const fsWrite = (path, content) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, content, {
      flag: 'a',
      encoding: 'utf-8'
    }, (err) => {
      if (err) reject(err);
      else resolve('success!');
    })
  });
};


function sleep(time) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, time)
  });
}
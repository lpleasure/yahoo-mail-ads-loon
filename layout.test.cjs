const fs = require("node:fs"), vm = require("node:vm"), assert = require("node:assert/strict");
const code = fs.readFileSync(__dirname + "/yahoo-mail-layout.js", "utf8");
const fixture = {MessageList:{Farm:["*"],NGFarm:[],extra:1},FolderList:{Farm:["*"],NGFarm:[]},MessageDetail:{Farm:["*"],NGFarm:[]},unrelated:{keep:true}};
const url = "https://s.yimg.jp/dl/ymail/ios/ad-farm-v2.json";
function run(body=JSON.stringify(fixture), opt={}) {
 let output, calls=0;
 vm.runInNewContext(code,{$request:{url:opt.url || url},$response:{status:opt.status || 200,body,headers:{"Content-Length":"9",ETag:"x","Content-Type":"application/json"}},$argument:{collapse_slots:opt.enabled===undefined?true:opt.enabled},console:{log(){}},$done(x){output=JSON.parse(JSON.stringify(x));calls++;}});
 assert.equal(calls,1); return output;
}
const out=run(), data=JSON.parse(out.body);
for(const name of ["MessageList","FolderList","MessageDetail"]){assert.deepEqual(data[name].Farm,[]);assert.deepEqual(data[name].NGFarm,["*"]);}
assert.deepEqual(data.unrelated,fixture.unrelated);assert.equal(data.MessageList.extra,1);
assert.equal(out.headers["Cache-Control"],"no-store");assert.equal(out.headers.ETag,undefined);assert.equal(out.headers["Content-Length"],undefined);
for(const body of ["bad json","null","[]",JSON.stringify({MessageList:{Farm:["*"],NGFarm:[]}}),JSON.stringify({...fixture,FolderList:{Farm:[1],NGFarm:[]}}),"x".repeat(100001)]) assert.deepEqual(run(body),{});
for(const opt of [{enabled:false},{enabled:"false"},{status:304},{url:url+"Extra"},{url:"https://s.yimg.jp.evil.test/dl/ymail/ios/ad-farm-v2.json"},{url:"https://appcscd.mail.yahooapis.jp/ws/v3/batch"}]) assert.deepEqual(run(undefined,opt),{});
assert.deepEqual(JSON.parse(run(out.body).body),data);
assert.ok(run(undefined,{url:url+"?v=1"}).body);
console.log("PASS: layout transformation, preserved fields, headers, idempotence, 12 fail-open cases, query URL, done-once");

const fs = require("node:fs"), vm = require("node:vm"), assert = require("node:assert/strict");
const code = fs.readFileSync(__dirname + "/yahoo-mail-user.js", "utf8");
const layout = fs.readFileSync(__dirname + "/yahoo-mail-layout.js", "utf8");
const attrs = {result:{responses:[{id:"GETUserAttributes",response:{result:{id:"userAttributes",value:{farm:8200,hasAds:true,isJPPremium:true}}}},{id:"Mail",response:{result:{text:"{\"hasAds\":true}"}}}]}};
const url = "https://appcscd.mail.yahooapis.jp/ws/v3/batch?ymappid=YahooMailIOSNativeApp";
function run(src, body, opt={}, store={}) {
 let output, calls=0;
 vm.runInNewContext(src,{$request:{url:opt.url || url},$response:{status:opt.status || 200,body,headers:{"Content-Type":"application/json"}},$argument:{collapse_slots:opt.enabled===undefined?true:opt.enabled},$persistentStore:{read(k){return store[k]},write(v,k){store[k]=v;return true}},console:{log(){}},$done(x){output=JSON.parse(JSON.stringify(x));calls++;}});
 assert.equal(calls,1); return output;
}
const store={}, out=run(code, JSON.stringify(attrs), {}, store), data=JSON.parse(out.body);
assert.equal(data.result.responses[0].response.result.value.hasAds,false);
assert.equal(data.result.responses[0].response.result.value.isJPPremium,true);
assert.equal(data.result.responses[1].response.result.text,"{\"hasAds\":true}");
assert.equal(store.yahoo_mail_farm,"8200");
assert.deepEqual(run(code, out.body), {});
assert.ok(run(code, JSON.stringify(attrs), {url:"https://appcscd.mail.yahooapis.jp/ws/v3/mailboxes/@.id==abc/attributes/@.id==userAttributes?appid=YahooMailIOSNativeApp"}).body);
for(const opt of [{enabled:false},{enabled:"false"},{status:304},{url:"https://appcscd.mail.yahooapis.jp/ws/v3/mailboxes/@.id==abc/messages"},{url:"https://appcscd.mail.yahooapis.jp.evil.test/ws/v3/batch"}]) assert.deepEqual(run(code, JSON.stringify(attrs), opt), {});
for(const body of ["{}", "bad", JSON.stringify({hasAds:false})]) assert.deepEqual(run(code, body), {});
const farm = {MessageList:{Farm:["*"],NGFarm:[]},FolderList:{Farm:["*"],NGFarm:[]},MessageDetail:{Farm:["*"],NGFarm:[]}};
const lay = JSON.parse(run(layout, JSON.stringify(farm), {url:"https://s.yimg.jp/dl/ymail/ios/ad-farm-v2.json"}, store).body);
for(const name of Object.keys(farm)){assert.deepEqual(lay[name].Farm,[]);assert.deepEqual(lay[name].NGFarm,["*","8200"]);}
console.log("PASS: hasAds rewrite, escaped mail text kept, farm saved and reused by layout, attributes URL, 8 fail-open cases, done-once");

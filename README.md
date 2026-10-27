# Yahoo! JAPAN Mail Ads for Loon

基于用户提供的 Yahoo! JAPAN 邮件 iOS 抓包制作的定向去广告插件，版本 0.4.0。不是国际版 Yahoo Mail 通用规则。插件只使用 Loon 内置的规则和 Rewrite，不含 JS 脚本，也没有开关，安装后全部生效。

## 安装

在 Loon 的插件页面添加：
https://raw.githubusercontent.com/lpleasure/yahoo-mail-ads-loon/main/yahoo-mail-ads.plugin

开启插件和 MitM，安装并信任 Loon 证书，然后完全退出并重新打开邮件 App。需要 Loon 3.5.1 (978) 及以上，新版 Rewrite 语法从这个版本开始支持。MitM 只列出下文用到的主机，未启用通配符。

## 范围

拦截（[Rule]）：

- 广告下发：aag.yahooapis.jp 的 /v2/ads/elookup。抓包中有 3 次响应明确包含 native_infeed 广告，分别返回 6、1、1 条。
- 广告素材：da.flvcdn.net 的 /spaces/da-media/objects/。
- 广告展示统计：apm.yahoo.co.jp 的 /3/m 和 /3/v。
- 广告展示验证 SDK：s.yimg.jp 的 /images/adsdk/omsdk/。

关闭广告位（[Rewrite]）：

- 用户属性：appcscd.mail.yahooapis.jp 的 /ws/v3/batch 和 /ws/v3/mailboxes/…/attributes，用 `response.body.replace` 把 `"hasAds":true` 改为 false。邮件正文里转义的 `\"hasAds\"` 匹配不到，不受影响；其他字段原样保留。
- 广告投放范围：s.yimg.jp/dl/ymail/ios/ad-farm-v2.json，用 `response.body.mock` 直接返回改好的配置：MessageList、FolderList、MessageDetail 三处的 Farm 都为 []，NGFarm 都为 ["*","8200"]，并设置 Cache-Control: no-store。原文件自 2022 年起只有这三处，每处 Farm 为 ["*"]、NGFarm 为 []。

保留邮件同步、登录、通讯录、推送、主题、紧急通知及普通图片资源。会员推广和服务推荐未纳入；不会删除真实邮件中的广告内容。

Loon 规则按请求匹配，不按 App 隔离；其他 Yahoo! JAPAN 应用若使用这些广告接口，也会受到影响。

## 关于 farm 编号 8200

ad-farm-v2.json 的 Farm/NGFarm 按邮件 farm 列出参与或排除广告的账号范围，账号所属的 farm 见 userAttributes 的 `"farm"` 字段，抓包账号为 8200。插件不运行脚本，无法读取账号的 farm，所以把 8200 直接写进配置：Farm 为空，本身已经不选中任何 farm；NGFarm 里的 "*" 和 "8200" 是双重保险。其他账号的 farm 可能不同，可修改插件中的这个数字。

## 验证及限制

- 拦截规则在本地对原始抓包离线匹配：四条规则分别命中 3、6、8、5 个请求；7 个邮件同步、登录、通讯录、推送请求未命中；4 个非目标路径及主机边界样例也都没有误伤。
- 0.4.0 发布前曾在本地按插件原文检验 Rewrite（测试脚本未保留在仓库）：URL 条件、替换效果和 Mock 内容是否为合法 JSON。Node 与 Loon 的正则引擎可能有细微差异，但所用写法都是基础语法。
- 字段含义是根据抓包推断的。App 是否据此不再创建广告位，尚未在 iPhone 上验证。

更新插件后，完全退出邮件 App 再打开，并下拉刷新收件箱一次。App 可能缓存旧属性和配置，可能要多重启几次。仍留白时，需要在开启插件的状态下，从冷启动开始重新抓包。

如有异常，停用插件后重新打开 App。不要清空邮件数据或卸载 App。若规则没有命中，检查 MitM 是否生效以及本地优先放行规则。不要把整个 yahooapis.jp 或 s.yimg.jp 加入拒绝规则。

## 隐私

仓库只包含插件和说明。原始 HAR、账号、Cookie、授权令牌、邮件、设备标识和广告跟踪查询参数均不上传。appcscd.mail.yahooapis.jp 是邮件接口主机，加入 MitM 后由 Loon 在本机解密，插件只做上述一处文本替换，不读取、不上传邮件内容。

Loon 官方文档：URL 规则 https://nsloon.app/docs/Rule/http_rule/ ，Rewrite https://nsloon.app/docs/Rewrite/rewrite_v2

## 更新记录

- 0.4.0：改为 Loon 内置 Rewrite 实现，删除 JS 脚本和“尝试关闭广告占位”开关，改写默认生效。
- 0.3.0：用脚本改写 hasAds，并按账号 farm 排除投放。
- 0.2.0：用脚本改写 ad-farm-v2.json，尝试关闭广告位；实机截图仍显示“広告取得に失敗しました”占位。
- 0.1.0：拦截广告下发、素材、统计和 SDK。

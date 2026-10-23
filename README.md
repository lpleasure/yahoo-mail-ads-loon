# Yahoo! JAPAN Mail Ads for Loon

基于用户提供的 Yahoo! JAPAN 邮件 iOS 抓包制作的定向去广告插件，版本 0.1.0。不是国际版 Yahoo Mail 通用规则。

## 安装

在 Loon 的插件页面添加：
https://raw.githubusercontent.com/lpleasure/yahoo-mail-ads-loon/main/yahoo-mail-ads.plugin

开启插件和 MitM，安装并信任 Loon 证书，然后完全退出并重新打开邮件 App。插件使用原生 URL 规则，无需额外 JavaScript。仅广告相关主机列入 MitM，未启用通配符。

## 范围

- 广告下发：aag.yahooapis.jp 的 /v2/ads/elookup，抓包中 3 次响应明确包含 native_infeed 广告，返回广告数分别为 6、1、1。
- 广告素材：da.flvcdn.net 的 /spaces/da-media/objects/。
- 广告展示统计：apm.yahoo.co.jp 的 /3/m 和 /3/v。
- 广告展示验证 SDK：s.yimg.jp 的 /images/adsdk/omsdk/。

保留邮件同步、登录、通讯录、推送、主题、紧急通知及普通图片资源。未改写广告配置 ad-farm-v2.json，因为空 Farm/NGFarm 的客户端语义未经验证。会员推广和服务推荐未纳入此版；不会删除真实邮件中的广告内容。

Loon 规则按请求匹配，不按 App 隔离；其他 Yahoo! JAPAN 应用若使用这些广告接口也会受到影响。

## 验证及限制

在本地对原始抓包离线匹配：四条规则分别命中 3、6、8、5 个请求；7 个邮件同步/登录/通讯录/推送请求未命中；4 个非目标路径及主机边界样例通过。

以上只验证请求范围，不代表已在 iPhone 上验证页面效果。广告空白位、已缓存素材和其他广告来源可能仍保留；拒绝请求也可能触发客户端重试。开启后检查收发邮件、图片和通知。如有异常，停用插件后重新打开 App。不要清空邮件数据或卸载 App。

若规则没有命中，检查 MitM 是否生效以及本地优先放行规则。不要把整个 yahooapis.jp 或 s.yimg.jp 加入拒绝规则。

## 隐私

仓库只包含插件和说明。原始 HAR、账号、Cookie、授权令牌、邮件、设备标识和广告跟踪查询参数均不上传。后续反馈只需脱敏的主机、路径和规则命中情况。

Loon 官方 URL 规则文档：https://nsloon.app/docs/Rule/http_rule/

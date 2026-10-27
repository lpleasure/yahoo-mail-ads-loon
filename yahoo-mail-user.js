/* Yahoo! JAPAN Mail user attribute rewrite, 0.3.0. */
(function () {
  "use strict";
  var result = {};
  try {
    var enabled = typeof $argument === "undefined" ? true : $argument.collapse_slots;
    if (enabled === false || enabled === "false") return $done({});
    if (!/^https:\/\/appcscd\.mail\.yahooapis\.jp(?::443)?\/ws\/v3\/(?:batch|mailboxes\/[^?]*\/attributes)/.test($request.url)) return $done({});
    if (Number($response.status) !== 200 || typeof $response.body !== "string" || $response.body.indexOf('"hasAds"') < 0) return $done({});
    var body = $response.body;
    // userAttributes carries the mail farm; ad-farm-v2.json lists eligible farms.
    var farm = /"farm"\s*:\s*"?(\d+)"?/.exec(body);
    if (farm && typeof $persistentStore !== "undefined") $persistentStore.write(farm[1], "yahoo_mail_farm");
    // Escaped quotes inside mail content (\"hasAds\") do not match this pattern.
    var next = body.replace(/"hasAds"\s*:\s*true/g, '"hasAds":false');
    if (next !== body) {
      result = {body: next};
      console.log("[YahooMail] user_attributes_modified version=0.3.0" + (farm ? " farm=" + farm[1] : ""));
    }
  } catch (_) { console.log("[YahooMail] user_attributes_skipped"); }
  $done(result);
})();

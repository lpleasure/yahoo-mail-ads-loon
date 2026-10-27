/* Yahoo! JAPAN Mail ad placement experiment, 0.2.0. */
(function () {
  "use strict";
  var result = {};
  try {
    var enabled = typeof $argument === "undefined" ? true : $argument.collapse_slots;
    if (enabled === false || enabled === "false") return $done({});
    if (!/^https:\/\/s\.yimg\.jp(?::443)?\/dl\/ymail\/ios\/ad-farm-v2\.json(?:\?|$)/.test($request.url)) return $done({});
    if (Number($response.status) !== 200 || typeof $response.body !== "string" || $response.body.length > 100000) return $done({});
    var data = JSON.parse($response.body);
    var names = ["MessageList", "FolderList", "MessageDetail"];
    if (!data || Array.isArray(data) || !names.every(function (name) {
      var v = data[name];
      return v && Array.isArray(v.Farm) && Array.isArray(v.NGFarm) &&
        v.Farm.concat(v.NGFarm).every(function (x) { return typeof x === "string"; });
    })) {
      console.log("[YahooMail] layout_config_skipped");
      return $done({});
    }
    // Hypothesis: Farm selects eligible mail farms; NGFarm excludes them.
    // Client-side wildcard and empty-list behavior require device verification.
    names.forEach(function (name) { data[name].Farm = []; data[name].NGFarm = ["*"]; });
    var headers = {};
    Object.keys($response.headers || {}).forEach(function (key) {
      if (!/^(content-length|content-encoding|etag|last-modified|expires|cache-control|content-md5|digest)$/i.test(key)) headers[key] = $response.headers[key];
    });
    headers["Cache-Control"] = "no-store";
    result = {body: JSON.stringify(data), headers: headers};
    console.log("[YahooMail] layout_config_modified version=0.2.0");
  } catch (_) { console.log("[YahooMail] layout_config_skipped"); }
  $done(result);
})();

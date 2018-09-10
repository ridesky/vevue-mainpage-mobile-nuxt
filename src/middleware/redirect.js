export default function (context) {
  var sUserAgent = process.server ? context.req.headers['user-agent'] : navigator.userAgent
  let bIsIpad = /ipad/i.test(sUserAgent);
  let bIsIphone = /iphone os/i.test(sUserAgent);
  let bIsMidp = /midp/i.test(sUserAgent);
  let bIsUc7 = /rv:1.2.3.4/i.test(sUserAgent);
  let bIsUc = /ucweb/i.test(sUserAgent);
  let bIsCE = /windows ce/i.test(sUserAgent);
  let bIsWM = /windows mobile/i.test(sUserAgent);
  let bIsAndroid = /android/i.test(sUserAgent);
  if (
    bIsIpad ||
    bIsIphone ||
    bIsMidp ||
    bIsUc7 ||
    bIsUc ||
    bIsCE ||
    bIsWM ||
    bIsAndroid
  ) {
    // context.redirect('https://m.' + context.req.headers['host'] + '/' + context.req.url)
  }else{
    context.redirect('https://pc.vevue.app/' + context.req.url)
  }
}

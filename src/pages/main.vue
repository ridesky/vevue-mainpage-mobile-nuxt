<template>
  <no-ssr>
    <div class="main-vue">
      <topHeaderDownload/>
      <topmenu/>
      <videoList :listenScroll='true' :params='params'></videoList>
    </div>
  </no-ssr>
</template>
<script>
import totp from '../static/tools/totp.js';
import docCookies from '../static/tools/cookies.js';
import videoList from '../components/videoList.vue';
import topmenu from '../components/topMenu.vue';
import topHeaderDownload from '../components/topHeaderDownload.vue';
export default {
  name: 'mainVideo',
  layout: 'header',
  components: {
    topHeaderDownload,
    topmenu,
    videoList
  },
  data() {
    if (process.client) {
      return {
        params: {
          authcode: docCookies.getItem('userid')
            ? totp.getCode(docCookies.getItem('safekey'))
            : '',
          towho: docCookies.getItem('userid') || '-',
          userid: docCookies.getItem('userid') || '-',
          hashfollow: docCookies.getItem('hashfollow') || '',
          cid: docCookies.getItem('cid'),
          version: '',
          action: 'listofmain',
          timestamp: Math.floor(new Date().getTime() / 1000)
        }
      };
    } else {
      return {
        params: '',
        old: ''
      };
    }
  }
};
</script>
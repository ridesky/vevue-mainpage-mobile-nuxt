<template>
  <!-- <no-ssr> -->
  <div class="main-vue">
    <no-ssr>
      <topHeaderSearch :downloadBar='true'/>
    </no-ssr>
    <topmenu/>
    <!-- <no-ssr> -->
    <videoList :listenScroll='true' :params='params'></videoList>
    <!-- </no-ssr> -->
  </div>
  <!-- </no-ssr> -->
</template>
<script>
import totp from '../static/tools/totp.js';
import docCookies from '../static/tools/cookies.js';
import videoList from '../components/videoList.vue';
import topmenu from '../components/topMenu.vue';
// import topHeaderDownload from '../components/topHeaderDownload.vue';
import topHeaderSearch from '../components/topHeaderSearch.vue';
export default {
  name: 'mainVideo',
  layout: 'header',
  components: {
    // topHeaderDownload,
    topHeaderSearch,
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
        params: {},
        old: ''
      };
    }
  }
};
</script>
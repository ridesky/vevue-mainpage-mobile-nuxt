<template>
  <no-ssr>
    <div class="history-vue">
      <div v-if="params.userid === '-'">
        <topHeaderDownload/>
        <div class="please-login">
          You have not logged in yet. Please
          <a href="/login/">login</a>
        </div>
      </div>
      <div v-else>
        <topHeaderDownload/>
        <topmenu/>
        <videoList :listenScroll='true' :params='params' :showWatchLater='true'></videoList>
      </div>
    </div>
  </no-ssr>
</template>
<script>
import docCookies from '../static/tools/cookies';
import videoList from '../components/videoList.vue';
import topmenu from '../components/topMenu.vue';
import topHeaderDownload from '../components/topHeaderDownload.vue';
export default {
  name: 'mainVideo',
  layout: 'header',
  components: {
    topHeaderDownload,
    videoList,
    topmenu
  },
  data() {
    let result = {
      params: {}
    };
    if (process.client) {
      Object.assign(result, {
        params: {
          towho: docCookies.getItem('userid') || '-',
          userid: docCookies.getItem('userid') || '-',
          cid: docCookies.getItem('cid'),
          action: 'listoftype',
          type: 'unlock'
        }
      });
    }
    return result;
  }
};
</script>
<style lang="stylus">
.please-login {
  text-align: center;
  color: #333;
  font-size: 20px;
  margin-top: 20px;

  a {
    color: #409eff;
  }
}
</style>

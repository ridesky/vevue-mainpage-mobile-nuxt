<template>
  <no-ssr>
    <div class="focus-vue">
      <div v-if="params.userid === '-'">
        <topHeaderSearch/>
        <div class="please-login">
          You have not logged in yet. Please
          <a href="/login/">login</a>
        </div>
      </div>
      <div v-else>
        <topHeaderSearch ref="topHeaderSearch"/>
        <!-- <topHeaderDownload/> -->
        <!-- <topmenu/> -->
        <!-- style="margin-top:55px;" -->
        <videoList :listenScroll='true' :params='params' :showWatchLater='true' :showRecommend='true'></videoList>
      </div>
    </div>
  </no-ssr>
</template>
<script>
import docCookies from '../static/tools/cookies';
import videoList from '../components/videoList.vue';
import topmenu from '../components/topMenu.vue';
import topHeaderSearch from '../components/topHeaderSearch.vue';
import topHeaderDownload from '../components/topHeaderDownload.vue';
export default {
  name: 'mainVideo',
  layout: 'header',
  components: {
    topHeaderDownload,
    topHeaderSearch,
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
          action: 'listoffocus',
          type: 'listoffocus'
        }
      });
    }
    return result;
  },
  // beforeRouteLeave (to, from, next) {
  //   this.$refs.topHeaderSearch.$emit('toHideSearchPannel');
  //   next();
  // }
};
</script>
<style lang="stylus">
.focus-vue {
  // position: relative;
  // min-height:100vh;
}

.please-login {
  text-align: center;
  color: #333;
  font-size: 1.5rem;
  margin-top: 60px;

  a {
    color: #409eff;
  }
}
</style>

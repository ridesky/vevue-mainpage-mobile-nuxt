<template>
  <no-ssr>
    <div class="history-vue">
      <div v-if="params.userid === '-'">
        <topHeaderSearch/>
        <div class="please-login">
          You have not logged in yet. Please
          <a href="/login/">login</a>
        </div>
      </div>
      <div v-else>
        <topHeaderSearch/>
        <topmenu/>
        <videoList :listenScroll='true' :params='params' :showRemoveHistory='true'></videoList>
      </div>
    </div>
  </no-ssr>
</template>
<script>
import docCookies from '../static/tools/cookies';
import videoList from '../components/videoList.vue';
import topmenu from '../components/topMenu.vue';
import topHeaderSearch from '../components/topHeaderSearch.vue';
export default {
  name: 'mainVideo',
  layout: 'header',
  components: {
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
          action: 'listoftype',
          type: 'history'
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

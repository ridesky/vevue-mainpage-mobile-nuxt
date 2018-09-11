<template>
    <div class="follower-vue">
        <div class="followLists">
            <router-link :to="'/user/' + followerList.userid" v-for="(followerList,index) in followerLists" :key="index" class="followerList">
                <!-- :to=" '/user/' + video.yuan.bywho" -->
                <a>
                    <img :src="followerList.avatar" alt="" :onerror='defaultAvatarLogo'>
                </a>
                <div class="flower-meta">
                    <p class="follower-nickname">{{followerList.nickname}}</p>
                    <p class="follower-signature">{{followerList.signature}}</p>
                </div>
            </router-link>
            <div class="nomore" v-if="showNoMore">
                <i class="iconfont icon-nomore"></i>
                <p>No More</p>
            </div>
        </div>
    </div>
</template>
<script>
import axios from 'axios';
import totp from '../../static/tools/totp.js';
import apiUrl from '../../assets/js/config/urlConfig.js';
import jsFormat from '../../static/tools/jsFormat.js';
import docCookies from '../../static/tools/cookies.js';
export default {
  name: 'followerContent',
  layout:'header',
  data() {
    let result = {
      defaultAvatarLogo:
        'this.src="' +
        require('../../assets/images/vevue_logo_50x50.png') +
        '"',
      showNoMore: false,
      hideLoading: false,
      scrollLock: false, // 滚动监听是否加锁
      followerLists: [],
      params: {}
    };
    if (process.client) {
      Object.assign(result, {
        params: {
          action:
            this.$route.params.type === 'following'
              ? 'listoffollow'
              : 'listoffans',
          userid: docCookies.getItem('userid') || '-',
          towho: this.$route.params.towho,
          type: this.$route.params.type,
          cid: docCookies.getItem('cid') || ''
        }
      });
    }
    return result;
  },
  mounted() {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    this.loadFollowers();
  },
  methods: {
    loadFollowers() {
      // 读取关注/关注中的用户
      const that = this;
      this.scrollLock = true; // 触底锁定
      let params = that.params;
      params.authcode = docCookies.getItem('userid')
        ? totp.getCode(docCookies.getItem('safekey'))
        : '';
      params.timestamp = Math.floor(new Date().getTime() / 1000);
      axios.post(apiUrl.vevueAPI + params.action, params).then(res => {
        if (res.data.errcode === 0) {
          let result = res.data.result;
          if (result.length === 0) {
            that.showNoMore = true;
            return;
          }
          result.map(item => {
            item.avatar = apiUrl.avatarURL + item.avatar + '.jpg';
            item.nickname = item.nickname;
            item.signature = item.signature;
          });
          that.followerLists = result;
          that.scrollLock = false; // 触底解锁
        } else {
        }
      });
    }
  }
};
</script>
<style lang="stylus">
.follower-vue {
    position: relative;
    min-height: 100vh;    
    background: #fff;

    .nomore {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translateX(-50%) translateY(-50%);
        text-align: center;
        font-size: 2rem;
    }

    .flower-meta {
        display: flex;
        height: 5rem;
        margin-left: 10px;
        flex-direction: column;
        justify-content: space-around;
    }

    .followLists {
        .followerList {
            padding: 15px 10px;
            display: flex;
            align-items: center;
            border-bottom: 1px solid #ccc;

            img {
                width: 6rem;
                height: 6rem;
                border-radius: 50%;
                display: block;
            }
        }

        .follower-signature {
            max-height: 2rem;
            overflow: hidden;
            white-space: nowrap;
            width: 200px;
            text-overflow: ellipsis;
        }
    }
}
</style>

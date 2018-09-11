<template>
  <div class="videoList-vue">
    <div class="swiper-container" v-show="showRecommend">
      <ul class="recommend swiper-wrapper">
        <li v-for="item in recommend" :key="item.userid" class="swiper-slide">
          <div class="img-box">
            <router-link :to="'/user/' + item.userid">
              <div class="shadow black"></div>
              <img :src="apiUrl.avatarURL + item.avatar + '.jpg'" alt="">
              <div class="recommend_text">{{item.nickname}}</div>
            </router-link>
          </div>
        </li>
      </ul>
    </div>
    <ul class="videoLists scrollload-content">
      <li class="videoList" v-for="(video,index) in videos" :key="index">
        <div class="videoItem">
          <div class="cover-and-description" :class="{orange:0<video.price&&video.price<=70,purple:video.price>70}">
            <div class="videoCoverBox">
              <router-link :to=" '/video/' + video.videoid" :title="video.yuan.note || video.yuan.title" class="image-box">
                <img :src="video.coverURL" alt="" class="videoPoster posterImage" :onerror='defaultCoverLogo'>
              </router-link>
              <div class="video_time" v-if="video.video_time">{{jsFormat.sec_to_time(video.video_time)}}</div>
              <div class="title-avatar">

                <router-link :to=" '/video/' + video.videoid" class=" title" v-if="video.yuan.title" :title="video.yuan.title">{{video.yuan.title}}</router-link>
                <div class="videoAvatarBox">
                  <!-- <router-link :to=" '/user/' + video.yuan.bywho +'/works'">
                    <img :src="video.avatar" alt="avatar" class="videoAvatar" :onerror='defaultAvatarLogo'>
                  </router-link> -->
                  <router-link :to=" '/user/' + video.yuan.bywho +'/works'">
                    <img :src="video.avatar" alt="avatar" class="videoAvatar" :onerror='defaultAvatarLogo'>
                  </router-link>
                </div>

              </div>
            </div>
            <div class="video-description" :class="{topborder:video.yuan.note}">
              <router-link :to=" '/video/' + video.videoid" class=" title note" v-if="video.yuan.note" :title="video.yuan.note">{{video.yuan.note}}</router-link>
            </div>
          </div>
          <div class="likesmen" v-if="video.tipslikes.length>0">
            <div class="tri top"></div>
            <i class="iconfont icon-like-heart"></i>
            <router-link :to="'/user/' + like.userid" class="likesman" v-for="(like,index) in video.tipslikes" :key='index'>{{like.nickname}}
              <span v-show="index !== video.tipslikes.length-1">,</span>
            </router-link>
          </div>
          <div class="flex videoMeta-wrapper">
            <div class="videoMeta">
              <p class="nickname">@{{video.yuan.nickname}} </p>
              <p v-if="video.copyright_blocknumber>0">BlockNumber: {{video.copyright_blocknumber}}<br/> Copyright ID {{video.copyright_id}}</p>
              <div class="metaViewAndData">
                <p class="view">{{video.view}} Views, </p>
                <p class="view"> {{video.comment}} Comments, </p>
                <p class="view"> {{video.likes}} Likes </p>
              </div>
              <!-- <p class="date"> {{video.date}}</p> -->
              <a target="_blank" :href=" 'https://maps.google.com/maps?q=' + video.location" v-show='video.yuan.location_name' :title="video.yuan.location_name" class="locationName">
                <i class="iconfont icon-location"></i>{{video.yuan.location_name}}</a>
            </div>
            <div class="video-meta-menu iconfont icon-menu_col" :class="{'stay':showMetaMenuIndex === index}" v-on:click="toShowMetaMenuIndex(index)">
              <ul class="meta-sel">
                <li class="sel" @click="clipAddress('.clipBtn'+index)" :class="'clipBtn'+index" :aria-label='location.origin+"/#/video/"+video.videoid'>
                  Copy Link
                </li>
                <li class="sel" v-if="showRemoveHistory" @click="toRemoveHistory(video.videoid,index,0)">
                  <span>Remove from History</span>
                </li>
                <li class="sel" v-if="showWatchLater" @click="toWatchLater(video.videoid,true,0)">
                  <span>Watch Later</span>
                </li>
                <li class="sel" v-if="!showWatchLater" @click="toWatchLater(video.videoid,false,0,index)">
                  <span>Remove from Watch Later</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="videoSummary">
          <h3 class="videoTitle">{{video.title}}</h3>
          <div class="metainfo">
            <span>{{video.viewers}}</span>
          </div>
        </div>
      </li>
    </ul>
    <div class="nomore" v-if="showNoMore">
      <i class="iconfont icon-nomore"></i>
      <p>No More</p>
    </div>
    <div v-show="scrollLock && !hideLoading" class="load" :class="{center:videos.length === 0}">
      <img src="../assets/images/loading_bar.gif" alt="">
    </div>
  </div>
</template>
<script>
/* 
获取视频列表时,判断是否为新登陆且没有设置昵称头像的新用户,如果是则跳转用户设置界面
     */
import axios from 'axios';
import totp from '../static/tools/totp';
import apiUrl from '../assets/js/config/urlConfig';
import jsFormat from '../static/tools/jsFormat';
import docCookies from '../static/tools/cookies';
import clipboardJS from 'clipboard';
export default {
  name: 'player',
  props: {
    /**
     * @param 调用组建所需参数
     * listenScroll 监听触底事件
     * params 获取video所需的参数  必填
     */
    listenScroll: {
      // 是否监听触底事件,进行加载新视频
      type: Boolean,
      required: false,
      default: false
    },
    showRecommend: {
      // 是否显示推荐位
      type: Boolean,
      required: false,
      default: false
    },
    showWatchLater: {
      // 显示稍后观看按钮
      type: Boolean,
      require: false,
      default: true
    },
    showRemoveHistory: {
      // 显示移除历史纪录
      type: Boolean,
      require: false,
      default: false
    },
    params: {
      // 获取video所需要的参数 必填
      type: Object,
      required: true
    }
  },
  data() {
    return {
      apiUrl,
      showSetInfo: false,
      jsFormat,
      location: process.client ? window.location : '',
      hideLoading: false,
      scrollLock: true, // 滚动监听是否加锁
      showVideoEle: false,
      showNoMore: false,
      page: 0,
      hashUrl: '',
      TheResult: {},
      showMetaMenuIndex: -1,
      maxRequestTimes: 5,
      cookiesEnd: 604800, // cookies时间
      defaultAvatarLogo:
        'this.src="' + require('../assets/images/vevue_logo_50x50.png') + '"',
      defaultCoverLogo:
        'this.src="' + require('../assets/images/default_cover.png') + '"',
      recommend: [], // 推荐
      videos: []
    };
  },
  mounted() {
    this.loadVideo(0); // 首次加载视频
    this.userid = docCookies.getItem('userid') || '';
    this.hashUrl = encodeURIComponent('/' + window.location.hash);
    if (this.listenScroll) {
      this.addListenScroll();
    }
    document.addEventListener(
      'scroll',
      () => {
        this.showMetaMenuIndex = -1;
      },
      false
    );
  },
  methods: {
    clipAddress(el) {
      const that = this;
      const clip = new clipboardJS(el, {
        text: function(trigger) {
          return trigger.getAttribute('aria-label');
        }
      });
      clip.on('success', function(e) {
        that.$message({
          message: 'Link Copied',
          duration: 1200,
          customClass: 'copyClass',
          type: 'success'
        });
        console.log('success');
        console.log(e);
      });
      clip.on('error', function(e) {
        console.log('error');
        console.log(e);
      });
    },
    addListenScroll() {
      const that = this;
      const distance = 300;
      window.addEventListener('scroll', function() {
        if (!that.scrollLock) {
          if (
            (document.documentElement.scrollTop || document.body.scrollTop) +
              document.documentElement.clientHeight +
              distance >=
            document.documentElement.scrollHeight
          ) {
            that.loadVideo(0);
          }
        }
      });
    },
    toShowMetaMenuIndex(index) {
      this.showMetaMenuIndex = this.showMetaMenuIndex === index ? -1 : index;
    },
    loadVideo(times) {
      // load videos you like
      const that = this;
      if (times > this.maxRequestTimes) {
        this.scrollLock = false;
        return;
      }
      that.scrollLock = true;
      const params = that.params;
      params.offset = that.page;
      params.authcode = docCookies.getItem('userid')
        ? totp.getCode(docCookies.getItem('safekey'))
        : '';
      params.timestamp = Math.floor(new Date().getTime() / 1000);
      axios
        .post(apiUrl.vevueAPI + params.action, params)
        .then(res => {
          if (res.data.errcode === 0) {
            that.TheResult = res.data;
            that.showVideoEle = true;
            that.$store.commit('sethotkey', res.data.hotkey || []);
            let result = res.data.result;
            if (result.length === 0) {
              that.showNoMore = true;
              that.scrollLock = true; // 彻底加锁
              that.hideLoading = true;
              return;
            }
            that.showNoMore = false;
            const arr = [];
            result.map(item => {
              if (
                ['respond', 'vevue', 'vr', 'topics'].some(value => {
                  return value === item.videotype;
                })
              ) {
                Object.assign(item, {
                  playerURL: apiUrl.playerURL + '?videoid=' + item.videoid,
                  date: jsFormat.smartTime(new Date(item.timestamp * 1000)),
                  coverURL:
                    apiUrl.videoURL + item.videoid.split('::')[0] + '.jpg',
                  avatar: apiUrl.avatarURL + item.avatar + '.jpg'
                });
                // item.yuan = JSON.parse(item.yuan);
                Object.assign(item.yuan, {
                  nickname: item.yuan.nickname,
                  location_name: item.yuan.location_name,
                  title: item.yuan.title,
                  note: item.yuan.note
                });
                arr.push(item);
              } else if (item.videotype === 'hash') {
                docCookies.setItem(
                  'hashfollow',
                  item.hashfollow,
                  that.cookiesEnd,
                  '/',
                  null
                );
              }
            });
            this.page += 1;
            this.videos = this.videos.concat(arr);
            this.recommend = res.data.recommend || [];
            this.$nextTick(() => {
              this.swiper = new Swiper('.swiper-container', {
                slidesPerView: 4,
                spaceBetween: 10,
                loop: false,

                // 如果需要分页器
                pagination: {
                  el: '.swiper-pagination'
                },

                // 如果需要前进后退按钮
                navigation: {
                  nextEl: '.swiper-button-next',
                  prevEl: '.swiper-button-prev'
                },

                // 如果需要滚动条
                scrollbar: {
                  el: '.swiper-scrollbar'
                }
              });
            });
            that.scrollLock = false; // 触底加载数据解锁
          } else if (res.data.errcode === 202) {
            // 没有更多视频了
            that.scrollLock = true; // 彻底加锁
            that.hideLoading = true;
          } else if (res.data.errcode === 223) {
            // 没有设置头像 !!!!! 跳转设置界面
            location.href = '/setting';
            that.showSetInfo = true;
            that.scrollLock = true;
            that.hideLoading = true;
          } else if (res.data.errcode === 110) {
            setTimeout(() => {
              that.loadVideo(++times);
            }, 500);
          } else {
            that.scrollLock = false; // 触底加载数据解锁
          }
        })
        .catch(() => {
          that.scrollLock = false; // 触底加载数据解锁
        });
    },
    toRemoveHistory(videoid, index, times) {
      const that = this;
      if (times > that.maxRequestTimes) {
        return;
      }
      this.videos.splice(index, 1);
      axios
        .post(apiUrl.vevueAPI + 'historyrem', {
          videoid,
          userid: this.params.userid,
          authcode: totp.getCode(docCookies.getItem('safekey')),
          cid: docCookies.getItem('cid'),
          timestamp: Math.floor(new Date().getTime() / 1000)
        })
        .then(res => {
          console.log(res);
          if (res.data.errcode === 0 && res.data.result.dorem === true) {
          } else if (res.data.errcode === 110) {
            setTimeout(() => {
              that.toRemoveHistory(videoid, index, ++times);
            }, 500);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    toWatchLater(videoid, sign, times, index) {
      const that = this;
      if (!this.userid.trim()) {
        console.log('???');
        window.location.href = '/login?continue=' + this.hashUrl;
        return;
      }
      if (times >= that.maxRequestTimes) {
        return;
      }
      if (!sign) {
        this.videos.splice(index, 1);
      }
      axios
        .post(apiUrl.vevueAPI + 'delay', {
          videoid,
          sign,
          userid: this.params.userid,
          authcode: totp.getCode(docCookies.getItem('safekey')),
          cid: docCookies.getItem('cid'),
          timestamp: Math.floor(new Date().getTime() / 1000)
        })
        .then(res => {
          console.log(res);
        });
    }
  }
};
</script>
<style lang="stylus">
.el-message__icon.el-icon-success {
  display: none !important;
}

.el-message.copyClass {
  min-width: 160px !important;
  justify-content: center;
}

.videoList-vue {
  background: #F5F5F5;
  min-height: 300px;
  position: relative;

  .swiper-container {
    padding: 10px;
    padding-bottom: 0px;
  }

  .recommend {
    margin-top: 2rem;

    li {
      position: relative;
      z-index: 1px;
      border-radius: 6px;
      overflow: hidden;

      .recommend_text {
        position: absolute;
        color: #fff;
        left: 6px;
        top: 6px;
        z-index: 1;
      }
    }

    img {
      width: 100%;
      display: block;
    }
  }

  .videoList {
    width: 100%;
    // overflow: hidden;
    padding: 10px 10px 15px;
    font-size: 1.2rem;
    border-bottom: solid 1px #ccc;
  }

  .image-box {
    position: relative;
    display: block;
    padding-bottom: 60%;
    overflow: hidden;

    .videoPoster {
      position: absolute;
      top: 0px;
      left: 0px;
      width: 100%;
    }
  }

  .cover-and-description {
    border-radius: 6px;
    margin-bottom: 10px;
    overflow: hidden;

    &.orange {
      border: solid orange 1.5px;
    }

    &.purple {
      border: solid #A58CA7 1.5px;
    }
  }

  .videoItem {
    .videoCoverBox {
      position: relative;
      overflow: hidden;
      border-radius: 6px;
      border-bottom-left-radius: 0px;
      border-bottom-right-radius: 0px;
    }

    .video-description {
      &.topborder {
        border-top: solid 1px rgba(204, 204, 204, 0.3);
        padding: 8px 5px;
      }

      background: #fff;
      border-bottom-left-radius: 6px;
      border-bottom-right-radius: 6px;
      padding: 0 5px 3px;
    }

    .video_time {
      position: absolute;
      left: 5px;
      bottom: 43px;
      z-index: 5;
      padding: 2px;
      border-radius: 2px;
      color: #fff;
      border: solid 1px #fff;
      background: #332E28;
    }

    .title-avatar {
      display: flex;
      position: absolute;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 0 0.4rem;
      height: 3.8rem;
      bottom: 0px;
      left: 0px;
      background: #fff;

      a.title {
        font-size: 1.4rem;
        width: 85%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .videoAvatarBox {
        display: flex;
        align-items: center;

        // width: 3rem;
        // height: 3rem;
        .ilikes {
          margin: 0 5.5px;
        }

        img {
          border-radius: 50%;
          width: 3rem;
          height: 3rem;
          display: block;

          &.ilikeit {
            width: 2.6rem;
            height: 2.6rem;
          }
        }

        .icon-like-heart {
          color: red;
          font-size: 1.15rem;
        }

        .icon-right {
          // font-size:1.4rem
          font-size: 1.2rem;
          color: #ccc;
        }
      }
    }

    .likesmen {
      position: relative;
      background: #fff;
      padding: 5px 8px;
      margin-bottom: 0.2rem;

      .icon-like-heart {
        color: red;
      }

      .tri.top {
        width: 0px;
        height: 0px;
        position: absolute;
        left: 5px;
        top: 0px;
        transform: translateY(-100%);
        border-left: solid 6px rgba(0, 0, 0, 0);
        border-top: solid 6px rgba(0, 0, 0, 0);
        border-right: solid 6px rgba(0, 0, 0, 0);
        border-bottom: solid 6px #fff;
      }

      .likesman {
        padding: 0 3px;
        color: #0094c8;
      }
    }

    .videoMeta {
      opacity: 0.6;
      padding: 0 2px;

      &>p {
        margin: 5px 0px;
      }

      .metaViewAndData {
        display: flex;
        margin-bottom: 5px;

        &>p {
          margin-right: 2px;
        }

        .date {
          margin-left: 3px;
        }
      }
    }
  }

  .load {
    width: 100px;
    height: 100px;
    margin: auto;

    &.center {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translateX(-50%) translateY(-50%);
    }

    img {
      width: 100%;
      height: 100%;
    }
  }

  .video-meta-menu {
    // display: none;
    &.stay {
      display: block;

      .meta-sel {
        display: block !important;
      }
    }

    cursor: pointer;
    position: relative;
    margin-top: 10px;
    font-size: 20px;
    color: #666;

    .meta-sel {
      position: absolute;
      display: none;
      z-index: 2;
      right: 0px;
      width: 180px;
      max-height: 210px;
      font-size: 12px;
      background: #fff;
      box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
      padding: 8px 0px;

      .sel {
        background-color: #fff;
        text-align: left;
        padding: 10px;

        &:hover {
          background: #eeeeee;
        }
      }
    }
  }

  .videolist:hover {
    .video-meta-menu {
      display: block;
    }
  }

  .videoMeta-wrapper {
    .videoMeta {
      flex: 1;
    }

    .del {
      .icon-del {
        cursor: pointer;
      }
    }
  }

  .nomore {
    text-align: center;
    padding-top: 40px;

    .iconfont {
      font-size: 40px;
    }

    p {
      font-size: 20px;
    }
  }
}
</style>

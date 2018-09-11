<template>
    <div>
        <div class="search-pannel" v-show="showSwitch.searchPannel">
            <!-- 搜索框里没有值的时候 显示热门列表和历史纪录 -->
            <div class="hot-detail" v-show="search.status === 0">
                <div class="trending" v-if="hotkey.length>0">
                    <h3>Trending</h3>
                    <div @click="searchVideo(item,false)" class="hotkeytag" size="small" type="info" v-for="(item,index) in hotkey" :key="index">{{item}}</div>
                </div>
                <div class="history" v-if="search.history.length>0">
                    <h3>History</h3>
                    <div v-for="(item,index) in search.history" :key="index" class="history-item">
                        <i class="el-icon-time" @click="searchVideo(item,false)"></i>
                        <p class="item-text" @click="searchVideo(item,false)">{{item}}</p>
                        <i class="el-icon-close" @click="removeSearchHistory(index)"></i>
                    </div>
                    <div class="cleanhistory" v-if='search.history.length>=5' @click="removeSearchHistory()">
                        <i class="el-icon-delete"></i>
                        <p>Clean search history</p>
                    </div>
                </div>
            </div>
            <!-- 搜索框里有值的时候  显示关键词联想 -->
            <div class="search-keylist" v-show="search.status === 1">
                <div v-for="(item,index) in search.keylist" :key="index" class="keylist-item" @click="searchVideo(item,false)">
                    <i class="el-icon-search"></i>
                    <p>{{item}}</p>
                </div>
                <div class="keylist-item searchall" @click="searchVideo(search.keyword,false)">View 「{{search.keyword}}」 results</div>
            </div>
            <!-- 显示搜索后的结果 -->
            <div class="search-result" v-show="search.status === 2">
                <div v-show="!showSwitch.hideLoading" class="load" :class="{center:videos.length === 0}">
                    <img src="../assets/images/loading_bar.gif" alt="">
                </div>
                <ul class="videoLists scrollload-content">
                    <li class="videoList" v-for="(video,index) in videos" :key="index">
                        <div class="videoItem">
                            <div class="videoCoverBox" :class="{orange:0<video.price&&video.price<=70,purple:video.price>70}">
                                <router-link :to=" '/video/' + video.videoid" :title="video.yuan.note || video.yuan.title" class="image-box">
                                    <img :src="video.coverURL" alt="" class="videoPoster posterImage" :onerror='defaultCoverLogo'>
                                </router-link>
                                <div class="video_time" v-if="video.video_time">{{jsFormat.sec_to_time(video.video_time)}}</div>
                                <div class="title-avatar">
                                    <router-link :to=" '/video/' + video.videoid" class=" title note" v-if="video.yuan.title" :title="video.yuan.title">{{video.yuan.title}}</router-link>
                                    <div class="videoAvatarBox">
                                        <router-link :to=" '/user/' + video.yuan.bywho" tanrget='_blank'>
                                            <img :src="video.avatar" alt="avatar" class="videoAvatar" :onerror='defaultAvatarLogo'>
                                        </router-link>
                                    </div>
                                </div>
                            </div>
                            <!-- <div class="likesmen" v-if="video.tipslikes.length>0">
                                <div class="tri top"></div>
                                <i class="iconfont icon-like-heart"></i>
                                <router-link  :to="'/user/' + like.userid" class="likesman" v-for="(like,index) in video.tipslikes" :key='index'>{{like.nickname}}
                                    <span v-show="index !== video.tipslikes.length-1">,</span>
                                </router-link>
                            </div> -->
                            <!-- <div class="flex videoMeta-wrapper">
                                <div class="videoMeta">
                                    <p class="nickname">@{{video.yuan.nickname}} </p>
                                    <p v-if="video.copyright_status !='NO'">BlockNumber: {{video.copyright_blocknumber}}<br/> Copyright ID {{video.copyright_id}}</p>
                                    <div class="metaViewAndData">
                                        <p class="view">{{video.view}} Views at </p>
                                        <p class="date"> {{video.date}}</p>
                                    </div>
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
                            </div> -->
                        </div>
                        <div class="videoSummary">
                            <h3 class="videoTitle">{{video.title}}</h3>
                            <div class="metainfo">
                                <span>{{video.viewers}}</span>
                            </div>
                        </div>
                    </li>
                </ul>
                <div class="nomore" v-if="showSwitch.showNomore">
                    <i class="iconfont icon-nomore"></i>
                    <p>No result</p>
                </div>
            </div>
        </div>
        <header class="header-search-vue-component">
            <div class="top-banner">
                <div class="logoBox">
                    <a href="/">
                        <img src="../static/images/favicon.png" alt="">
                    </a>
                </div>
                <div class="top-searchbar">
                    <form action='#'>
                        <el-input type='search' id="searchinput" ref='searchinput' @input="setSearchStatus" @focus="toShowSearchPannel" size='mini' v-model="search.keyword" placeholder="Search" prefix-icon="el-icon-search">
                            <i slot="suffix" class="el-input__icon el-icon-error" v-show="search.keyword.length >0" @click="search.keyword='';search.status=0;$refs.searchinput.focus()"></i>
                        </el-input>
                    </form>
                </div>
                <div class="banner-right" v-if="showSwitch.searchPannel">
                    <div class="cancel" @click="hideSearchPannel">Cancel</div>
                </div>
                <div class="banner-right" v-else>
                    <div class="personal" v-clickoutside='closePersonPannel'>
                        <div v-if="userInfo.userid" @click="showPersonPannel = !showPersonPannel">
                            <img class="topUserAvatar" :src="userInfo.avatar" alt="" :onerror='defaultAvatar'>
                        </div>
                        <a v-else href="/login">
                            <img src="../assets/images/user-bg.png" class="topUserAvatar">
                        </a>
                        <div class="person-pannel" v-show="showPersonPannel">
                            <div class="tri"></div>
                            <router-link class="list" :to="'/user/' + userInfo.userid +'/works'">
                                <i class="iconfont icon-personal"></i>
                                <span>My page</span>
                            </router-link>
                            <router-link class="list list-border" :to="'/likes/'">
                                <i class="iconfont icon-like"></i>
                                <span>Likes</span>
                            </router-link>
                            <router-link class="list" to="/history">
                                <i class="iconfont icon-history"></i>
                                <span>History</span>
                            </router-link>
                            <router-link class="list" to="/unlock">
                                <i class="iconfont icon-unlock"></i>
                                <span>Unlock</span>
                            </router-link>
                            <router-link class="list" to="/playlist">
                                <i class="iconfont icon-watch_later"></i>
                                <span>Watch Later</span>
                            </router-link>
                            <router-link class="list list-border" :to="'/message/'">
                                <i class="el-icon-message"></i>
                                <span>Message</span>
                            </router-link>
                            <router-link class="list list-border" :to="'/task/'">
                                <i class="el-icon-bell"></i>
                                <span>Task</span>
                            </router-link>
                            <router-link class="list" :to="'/pin/'">
                                <i class="iconfont icon-pin"></i>
                                <span>Pin</span>
                            </router-link>
                            <router-link class="list list-border" :to="'/setting/'">
                                <i class="iconfont icon-setting"></i>
                                <span>Setting</span>
                            </router-link>
                            <a class="list" @click="toLogout">
                                <div class="personal">
                                    <i class="iconfont icon-logout" v-if="userInfo" title="Log out" style="cursor:pointer"></i>
                                    <span @click="toLogout">Sign out</span>
                                    <div class="userSetting">
                                    </div>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    </div>
</template>
<script>
import Vue from 'vue';
import axios from 'axios';
import apiUrl from '../assets/js/config/urlConfig.js';
import docCookies from '../static/tools/cookies.js';
import totp from '../static/tools/totp.js';
import jsFormat from '../static/tools/jsFormat.js';
// import
export default {
  data() {
    const that = this;
    return {
      apiUrl,
      jsFormat,
      cookiesEnd: 604800, // cookies时间
      videos: [],
      search: {
        keyword: '',
        status: 0,
        keylist: [],
        history: process.client
          ? docCookies.getItem('searchHistory')
            ? docCookies.getItem('searchHistory').split(',')
            : [] || []
          : []
      },
      showSwitch: {
        searchPannel: false,
        showNomore: false,
        hideLoading: true
      },
      defaultAvatar:
        'this.src="' + require('../assets/images/vevue_logo_50x50.png') + '"',
      defaultAvatarLogo:
        'this.src="' + require('../assets/images/vevue_logo_50x50.png') + '"',
      defaultCoverLogo:
        'this.src="' + require('../assets/images/default_cover.png') + '"',
      userInfo: '',
      showPersonPannel: false // 显示右上角个人面板
    };
  },
  computed: {
    hotkey() {
      if (this.$store.state.hotkey.length === 0) {
        axios
          .post(apiUrl.vevueAPI + 'listoffocus', {
            userid: docCookies.getItem('userid') || '-',
            towho: docCookies.getItem('userid') || '-',
            authcode: docCookies.getItem('userid')
              ? totp.getCode(docCookies.getItem('safekey'))
              : '',
            cid: docCookies.getItem('cid') || '',
            type: 'listoffocus',
            offset: 0,
            timestamp: Math.floor(new Date().getTime() / 1000)
          })
          .then(res => {
            if (res.data.errcode === 0) {
              this.$store.commit('sethotkey', res.data.hotkey || []);
            }
          });
      }
      return this.$store.state.hotkey;
    }
  },
  mounted() {
    const that = this;
    window.vue = this;
    document
      .querySelector('#searchinput')
      .addEventListener('keypress', function(e) {
        if (e.keyCode === 13) {
          e.preventDefault();
          that.$refs.searchinput.blur();
          that.searchVideo(that.search.keyword, false);
        }
      });
    this.getUserInfo();
  },
  methods: {
    removeSearchHistory(index) {
      if (index >= 0) {
        this.search.history.splice(index, 1);
        docCookies.setItem(
          'searchHistory',
          this.search.history,
          this.cookiesEnd,
          '/',
          null
        );
      } else {
        this.search.history = [];
        docCookies.setItem(
          'searchHistory',
          this.search.history,
          this.cookiesEnd,
          '/',
          null
        );
      }
    },
    toShowSearchPannel() {
      this.showSwitch.searchPannel = true;
      document.body.classList.add('overflowhidden');
    },
    hideSearchPannel() {
      this.showSwitch.searchPannel = false;
      this.search.keyword = '';
      this.search.status = 0;
      this.videos = [];
      document.body.classList.remove('overflowhidden');
    },
    setSearchStatus() {
      if (this.search.keyword.trim().length <= 0) {
        this.search.status = 0;
      } else {
        this.search.status = 1;
        this.searchVideo(this.search.keyword, true);
      }
    },
    searchVideo(keyword, onlykey) {
      if (!keyword.trim()) {
        return;
      }
      this.search.keyword = keyword;
      this.videos = []; // 清空之前的视频列表
      this.showSwitch.showNomore = false; // 如果之前的搜索没有结果 并且显示了 no result 图标,关闭之
      this.showSwitch.hideLoading = false;
      if (!onlykey) {
        this.search.status = 2;
        const hasword = this.search.history.some(item => {
          return item === keyword;
        });
        if (!hasword) {
          this.search.history.push(keyword);
          docCookies.setItem(
            'searchHistory',
            this.search.history,
            this.cookiesEnd,
            '/',
            null
          );
        }
      }
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        axios
          .post(apiUrl.vevueAPI + 'scan', {
            userid: docCookies.getItem('userid') || '-',
            authcode: docCookies.getItem('userid')
              ? totp.getCode(docCookies.getItem('safekey'))
              : '',
            cid: docCookies.getItem('cid') || '',
            timestamp: Math.floor(new Date().getTime() / 1000),
            keyword: keyword,
            onlykey: onlykey
          })
          .then(res => {
            if (res.data.errcode === 0) {
              this.showSwitch.hideLoading = true;
              const data = res.data;
              this.search.keylist = data.keylist || [];
              let videos = res.data.videolist || [];
              if (videos.length === 0) {
                this.showSwitch.showNomore = true;
              } else {
                this.showSwitch.showNomore = false;
              }
              videos.map(item => {
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
                  this.videos = videos;
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
              //   this.videos = data.videolist;
            }
          })
          .catch(() => {
            this.showSwitch.hideLoading = true;
          });
      }, onlykey ? 500 : 0);
    },
    getUserInfo() {
      if (docCookies.getItem('userid')) {
        this.userInfo = {};
        this.userInfo.userid = docCookies.getItem('userid');
        this.userInfo.avatarid = docCookies.getItem('avatar');
        this.userInfo.avatar =
          apiUrl.avatarURL + docCookies.getItem('avatar') + '.jpg';
      }
    },
    toLogout() {
      ['userid', 'avatar', 'cid', 'gender', 'nickname', 'safekey'].map(item => {
        docCookies.removeItem(item, '/');
      });
      window.location.reload();
    },
    closePersonPannel() {
      this.showPersonPannel = false;
    }
  }
};
</script>
<style lang="stylus">
body {
    background: #f5f5f5;
}

.overflowhidden {
    overflow: hidden !important;
}

.search-pannel {
    // border-top: solid 1px #ccc;
    position: fixed;
    background: #f6f6f6;
    z-index: 9999;
    width: 100%;
    top: 55px;
    right: 0px;
    bottom: 0px;
    left: 0px;
    overflow: auto;
    margin: 0px;

    .trending {
        h3 {
            font-weight: bold;
            padding: 5px;
        }

        .hotkeytag {
            margin: 5px;
            display: inline-block;
            font-size: 12px;
            border-radius: 4px;
            padding: 0 10px;
            background-color: hsla(220, 4%, 58%, 0.1);
            border: none;
            color: #333;
            line-height: 30px;
            line-height: 28px;
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

    .nomore {
        text-align: center;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translateX(-50%) translateY(-50%);

        .iconfont {
            font-size: 40px;
        }

        p {
            font-size: 20px;
        }
    }

    .hot-detail {
        .history {
            h3 {
                font-weight: bold;
                padding: 5px;
            }

            .history-item {
                padding: 10px;
                display: flex;
                align-items: center;
                border-bottom: solid 1px #ccc;
                font-size: 12px;

                .item-text {
                    flex: 1;
                    text-overflow: ellipsis;
                    overflow: hidden;
                }

                i {
                    margin-right: 5px;
                }
            }

            .cleanhistory {
                display: flex;
                align-items: center;
                padding: 10px;
                font-size: 12px;

                i {
                    margin-right: 5px;
                }
            }
        }
    }

    .search-keylist {
        .keylist-item {
            &.searchall {
                justify-content: center;
                color: #409eff;
            }

            display: flex;
            padding: 10px;
            align-items: center;
            font-size: 12px;

            i {
                margin-right: 5px;
            }

            &>p {
                word-break: break-all;
            }

            border-bottom: solid 1px #ccc;
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

    .nomore {
        text-align: center;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translateX(-50%) translateY(-50%);

        .iconfont {
            font-size: 40px;
        }

        p {
            font-size: 20px;
        }
    }

    .videoList {
        width: 100%;
        // overflow: hidden;
        padding: 10px;
        font-size: 1.2rem;
    }

    .videoItem {
        .videoCoverBox {
            &.orange {
                border: solid orange 1.5px;
            }

            &.purple {
                border: solid #A58CA7 1.5px;
            }

            position: relative;
            overflow: hidden;
            border-radius: 6px;
            margin: 2rem 0 1rem;
            // padding: 0 1px 2px;
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

                .date {
                    margin-left: 3px;
                }
            }
        }
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
}

.header-search-vue-component {
    position: fixed;
    width: 100%;
    top: 0px;
    z-index: 999;
    background: #fff;
    height: 55px;

    .logoBox {
        // width: 40px;
        height: 35px;

        img {
            height: 100%;
            display: block;
        }
    }

    .top-banner {
        .top-searchbar {
            flex: 1;
            margin: 0 1.5rem;
            .el-input__inner{
                // padding-top:3px!important;
                // padding-bottom:3px!important;
                line-height:inherit;
            }
        }
    }

    .banner-right {
        display: flex;
        align-items: center;

        .cancel {
            color: #409eff;
            font-size: 1.4rem;
        }

        .top-download {
            border: solid 1px #EE2A69;
            color: #333;
            width: 10rem;
            height: 3rem;
            line-height: 3rem;
            text-align: center;
            border-radius: 5px;
            font-size: 1.2rem;
            margin-right: 1rem;
        }
    }

    .top-banner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px;
    }

    .topUserAvatar {
        display: block;
        width: 36px;
        height: 36px;
        border-radius: 50%;
    }

    .personal {
        cursor: pointer;

        .person-pannel {
            .tri {
                position: absolute;
                top: 0px;
                right: 5px;
                transform: translateY(-100%);
                border-top: solid 10px transparent;
                border-left: solid 10px transparent;
                border-right: solid 10px transparent;
                border-bottom: solid 10px #fff;
            }

            position: absolute;
            z-index: 10;
            padding: 5px 0px;
            font-size: 14px;
            top: 65px;
            right: 11px;
            width: 125px;
            text-align: left;
            background-color: #fff;
            box-shadow: 0 8px 24px 2px rgba(0, 0, 0, 0.14), 0 6px 30px 5px rgba(0, 0, 0, 0.12), 0 2px 2px -2px rgba(0, 0, 0, 0.4);

            .list {
                cursor: pointer;
                display: block;

                &.list-border {
                    border-top: solid 2px #E8E8E8;
                }

                &:hover {
                    background-color: #ccc;
                }

                padding: 10px 10px;

                .iconfont {
                    margin-right: 5px;
                }

                [class^='el-icon'] {
                    margin-right: 5px;
                    opacity: 0.7;
                }

                .el-icon-bell {
                    opacity: 0.7;
                }
            }
        }

        a {
            color: #333 !important;

            .iconfont {
                color: #888;
            }
        }
    }
}
</style>

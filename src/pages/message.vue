<template>
    <div>
        <topHeaderDownload/>
        <div class="message-vue">
            <ul class="message-ul">
                <el-dialog class="replay_dialog" title="Reply" :visible.sync="showSwitch.replayDialog" width="75%">
                    <!-- <el-input></el-input> -->
                    <el-input size="mini" v-model="toReplyObj.text" :placeholder="'Reply [ '+toReplyObj.placeholder + ' ]'"></el-input>
                    <span slot="footer" class="dialog-footer">
                        <el-button size="mini" @click="showSwitch.replayDialog = false">Cancel</el-button>
                        <el-button size="mini" type="primary" @click="toReply">OK</el-button>
                    </span>
                </el-dialog>
                <li v-for="(item,index) in messages" :key="index" class="message-li">
                    <!-- {{index}} type {{item.type}} -->
                    <div v-if="item.type == 0">
                        <div class="info-head">
                            <router-link :to="'/user/' + item.bywho ">
                                <img :src="apiUrl.avatarURL + item.avatar + '.jpg'" alt="avatar" class="avatar">
                            </router-link>
                            <div class="user-meta">
                                <p>{{item.nickname}}</p>
                                <p>{{jsFormat.formatTime(new Date(item.timestamp * 1000))}}</p>
                            </div>
                        </div>
                        <div class="info-body">
                            <div class="text">Respond your Request of interest</div>
                            <div class="info-detail">
                                <div @click="showSwitch.showDownloadDialog = true">
                                    <div class="note">
                                        <img class="message_icon" src="../static/images/if_instagram_386648.png" alt="Player" :onerror='defaultCoverLogo'>
                                        <div>{{item.note}}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else-if="item.type == 1">
                        <div class="info-head">
                            <router-link :to="'/user/' + item.bywho ">
                                <img :src="apiUrl.avatarURL + item.avatar + '.jpg'" alt="avatar" class="avatar">
                            </router-link>
                            <div class="user-meta">
                                <p>{{item.nickname}}</p>
                                <p>{{jsFormat.formatTime(new Date(item.timestamp * 1000))}}</p>
                            </div>
                        </div>
                        <div class="info-body">
                            <div class="text">I send a Request near your position</div>
                            <div class="info-detail">
                                <div @click="showSwitch.showDownloadDialog = true">
                                    <div class="note">
                                        <img class="message_icon" src="../static/images/location_orange.png" alt="location" :onerror='defaultCoverLogo'>
                                        <div>{{item.note}}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else-if="item.type ==2">
                        <div class="info-head">
                            <router-link :to="'/user/' + item.bywho ">
                                <img :src="apiUrl.avatarURL + item.avatar + '.jpg'" alt="avatar" class="avatar">
                            </router-link>
                            <div class="user-meta">
                                <p>{{item.nickname}}</p>
                                <p>{{jsFormat.formatTime(new Date(item.timestamp * 1000))}}</p>
                            </div>
                            <div class="Reply">
                                <el-button class="reply-button" size='mini' @click="showReply(item)">Reply</el-button>
                            </div>
                        </div>
                        <div class="info-body">
                            <div class="text">{{item.text}}</div>
                            <div class="info-detail">
                                <router-link :to="'/video/'+ item.targetid">
                                    <div class="note">
                                        <img class="video_image" :src="apiUrl.videoURL + item.targetid.replace('::main','') + '.jpg'" alt="Player" :onerror='defaultCoverLogo'>
                                        <div>{{item.note}}</div>
                                    </div>
                                </router-link>
                            </div>
                        </div>
                    </div>
                    <div v-else-if="item.type ==5 ">
                        <div class="info-head">
                            <router-link :to="'/user/' + item.bywho ">
                                <img :src="apiUrl.avatarURL + item.avatar + '.jpg'" alt="avatar" class="avatar">
                            </router-link>
                            <div class="user-meta">
                                <p>{{item.nickname}}</p>
                                <p>{{jsFormat.formatTime(new Date(item.timestamp * 1000))}}</p>
                            </div>
                            <div class="Reply">
                                <el-button class="reply-button" size='mini' @click="showReply(item)">Reply</el-button>
                            </div>
                        </div>
                        <div class="info-body">
                            <div class="text">{{item.text}}</div>
                            <div class="info-detail">
                                <router-link :to="'/video/' + item.targetid">
                                    <div class="text_at">『 {{item.text_at}} 』</div>
                                    <div class="note">
                                        <img class="play_button" src="../static/images/play_button.png" alt="Player" :onerror='defaultCoverLogo'>
                                        <div>{{item.note}}</div>
                                    </div>
                                </router-link>
                            </div>
                        </div>
                    </div>
                    <div v-else-if="item.type == 7">
                        <div class="info-head">
                            <router-link :to="'/user/' + item.bywho ">
                                <img :src="apiUrl.avatarURL + item.avatar + '.jpg'" alt="avatar" class="avatar">
                            </router-link>
                            <div class="user-meta">
                                <p>{{item.nickname}}</p>
                                <p>{{jsFormat.formatTime(new Date(item.timestamp * 1000))}}</p>
                            </div>
                        </div>
                        <div class="info-body">
                            <div class="text" v-if="item.isok">Request has been completed</div>
                            <div class="text" v-else>Request has been take back</div>
                            <div class="info-detail">
                                <div @click="showSwitch.showDownloadDialog = true">
                                    <div class="note">
                                        <img v-if="item.isok" class="message_icon" src="../static/images/message_right.png" alt="location" :onerror='defaultCoverLogo'>
                                        <img v-else class="message_icon" src="../static/images/message_wrong.png" alt="location" :onerror='defaultCoverLogo'>
                                        <div>{{item.note}}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else></div>
                </li>
            </ul>
            <!-- :class="{center:videos.length === 0}"> -->
            <div v-show="scrollLock && !hideLoading" class="load">
                <img src="../assets/images/loading_bar.gif" alt="">
            </div>
            <div class="nomore" v-if="showNoMore">
                <i class="iconfont icon-nomore"></i>
                <p>No More</p>
            </div>
        </div>
        <no-ssr>
            <el-dialog title="Download" :visible.sync="showSwitch.showDownloadDialog" width="70%">
                <span>Download app to get detail?</span>
                <span slot="footer" class="dialog-footer">
                    <el-button size="small" @click="showSwitch.showDownloadDialog = false">Cancel</el-button>
                    <el-button size='small' type="primary" @click="openPage('https://app.vevue.com/')">Download</el-button>
                </span>
            </el-dialog>
        </no-ssr>
    </div>

</template>
<script>
import axios from 'axios';
import apiUrl from '../assets/js/config/urlConfig.js';
import jsFormat from '../static/tools/jsFormat.js';
import docCookies from '../static/tools/cookies.js';
import totp from '../static/tools/totp.js';
import topHeaderDownload from '../components/topHeaderDownload.vue';
let globalMessages = null;
let globalPage = 0;
export default {
  name: 'message',
  layout: 'header',
  components: {
    topHeaderDownload
  },
  data() {
    return {
      apiUrl,
      jsFormat,
      defaultCoverLogo:
        'this.src="' + require('../assets/images/default_cover.png') + '"',
      showSwitch: {
        replayDialog: false,
        showDownloadDialog: false
      },
      toReplyObj: {
        placeholder: '',
        text: '',
        item: ''
      },
      page: globalPage, // 初始offset
      showNoMore: false,
      hideLoading: false,
      scrollLock: false, // 滚动监听是否加锁
      messages: globalMessages || []
    };
  },
  mounted() {
    if (!docCookies.getItem('userid')) {
      // 没登录还进入设置界面则跳转登录页面
      location.href = '/login';
    }
    this.getMessage();
    this.addListenScroll();
  },
  beforeRouteLeave(to, from, next) {
    //   this.$destroy(); // 销毁vue组件 目的是为了不缓存页面数据
    globalMessages = this.messages || [];
    globalPage = this.page || 0;
    next();
  },
  methods: {
    showReply(item) {
      const that = this;
      that.toReplyObj.item = item;
      that.toReplyObj.placeholder = item.text;
      //   that.toReplyObj.bywho = item.bywho;
      that.showSwitch.replayDialog = true;
    },
    toReply() {
      const that = this;
      if (!this.toReplyObj.text.trim()) return;
      const item = this.toReplyObj.item;
      this.showSwitch.replayDialog = false;
      axios
        .post(apiUrl.vevueAPI + 'msg_user', {
          userid: docCookies.getItem('userid'),
          type: item.type,
          text: that.toReplyObj.text,
          targetid: item.targetid,
          msguid: item.msguid,
          towho: item.bywho,
          cid: docCookies.getItem('cid'),
          authcode: totp.getCode(docCookies.getItem('safekey')),
          timestamp: Math.floor(new Date().getTime() / 1000)
        })
        .then(res => {
          if (res.data.errcode === 0) {
            that.$message({
              message: 'Reply successfully',
              type: 'success'
            });
          } else {
            that.$message({
              message: 'Reply failed, please try again!',
              type: 'error'
            });
          }
          that.toReplyObj.text = '';
        });
    },
    getMessage() {
      const that = this;
      that.scrollLock = true;
      axios
        .post(apiUrl.vevueAPI + 'messagebox', {
          offset: that.page,
          userid: docCookies.getItem('userid'),
          cid: docCookies.getItem('cid'),
          authcode: totp.getCode(docCookies.getItem('safekey')),
          timestamp: Math.floor(new Date().getTime() / 1000)
        })
        .then(res => {
          if (res.data.errcode === 0) {
            // this.messages = res.data.result;
            const result = res.data.result;
            if (result.length === 0) {
              that.showNoMore = true;
              that.scrollLock = true; // 彻底加锁
              that.hideLoading = true;
              return;
            }
            // that.showNoMore = false;
            that.page += 1;
            that.messages = that.messages.concat(result);
            that.scrollLock = false; // 触底加载数据解锁
          } else if (res.data.errcode === 202) {
            // 没有更多视频了
            that.scrollLock = true; // 彻底加锁
            that.hideLoading = true;
          }
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
            console.log('scroll!');
            that.getMessage();
          }
        }
      });
    },
    openPage(url) {
      this.showSwitch.showDownloadDialog = false;
      window.open(url);
    }
  }
};
</script>
<style lang="stylus">
body {
    padding-right: 0px !important;
}

.message-vue {
    position: relative;
    background: #F5F5F5;
    min-height: 50vh;
    padding: 10px;

    .load {
        margin: auto;
        width: 100px;
        height: 100px;

        img {
            width: 100%;
            height: 100%;
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

    .replay_dialog {
        .el-dialog__header {
            padding-top: 10px;
        }

        .el-dialog__body {
            padding: 10px 20px;
        }

        .el-dialog__footer {
            padding-bottom: 10px;
        }
    }

    .message-ul {
        .message-li {
            background: #fff;
            padding: 10px;
            margin-bottom: 20px;
        }

        .info-head {
            display: flex;

            .avatar {
                width: 40px;
                height: 40px;
                border-radius: 2.5px;
            }

            .user-meta {
                display: flex;
                flex: 1;
                flex-direction: column;
                justify-content: space-around;
                padding-left: 5px;
            }

            .Reply {
                .reply-button {
                    color: #707070;
                    background: #ebebeb;
                }
            }
        }

        .info-body {
            .text {
                padding: 5px 0px;
                width: 100%;
                overflow: hidden;
            }

            .info-detail {
                background: #f5f5f5;

                .text_at {
                    padding: 5px 0px;
                }

                .note {
                    height: 50px;
                    overflow: hidden;

                    .play_button {
                        width: 25x;
                        height: 25px;
                        margin-right: 5px;
                    }

                    .video_image {
                        width: 100px;
                        margin-right: 5px;
                    }

                    .message_icon {
                        height: 35px;
                        margin: 0 5px;
                    }

                    display: flex;
                    align-items: center;
                }
            }
        }
    }
}
</style>


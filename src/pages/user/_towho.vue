<template>
    <div>
        <no-ssr>
            <topHeaderDownload/>
        </no-ssr>
        <no-ssr>
            <div class="user-vue">
                <div class="user-info-container">
                    <div class="user-cover">
                        <img :src="userInfo.cover" alt="">
                    </div>
                    <div class="user-meta">
                        <div v-if="userid === towho" class="vevue_score" v-show="userInfo.transactionList">
                            <img @click="showTransactionList = true" src="../../assets/images/logo_coin_100.png" alt="score">
                            <div @click="showTransactionList = true" class="token_left">{{userInfo.amount}}</div>
                            <el-dialog width='90%' title="Score" :visible.sync='showTransactionList' class="transaction_dialog">
                                <div v-for="item in userInfo.transactionList" :key='item.id' class="transactionList">
                                    <div class="item_show">
                                        <div class="item_type">
                                            {{transactionConfig[item.type]? transactionConfig[item.type]['enWord'] : item.type}}
                                        </div>
                                        <div v-if="transactionConfig[item.type]" class="item_amount" :style="'color:'+transactionConfig[item.type]['color']">
                                            {{transactionConfig[item.type]['symbol'] || '' }}{{item.amount}}
                                        </div>
                                        <div v-else class="item_amount">
                                            {{item.amount}}
                                        </div>
                                        <div class="item_date">
                                            {{jsFormat.smartTime(new Date(item.date *1000))}}
                                        </div>
                                    </div>
                                    <div class="item_id">
                                        <p>ID:{{item.id}}</p>
                                    </div>
                                </div>
                            </el-dialog>
                            <el-button type="danger" style="background:#EE2A69;color:#fff" class="plain deposit" size='mini' @click="showQRCode">Deposit</el-button>
                            <el-dialog :visible.sync='showAddrQRCode' width='90%' class="qrcode_dialog">
                                <div id="qrcode"></div>
                                <h3 class="addr_text">{{userInfo.addr_vevue}}</h3>
                                <div @click="clipText('.addr_btn')" class="addr_btn" :aria-label='userInfo.addr_vevue'>Copy Address</div>
                                <div class="deposit_info">*VEVUE address only accepts VEVUE deposit. Any other assets deposited to VEVUE address will be irretrievable</div>
                            </el-dialog>
                        </div>
                        <div class="user-avatar" v-show="userInfo.avatar">
                            <img :src="userInfo.avatar" alt="avatar" :onerror='logo'>
                        </div>
                        <div class="user-meta-text">
                            <div class="meta-left">
                                <p class="nickname">{{userInfo.nickname}}</p>
                                <p class="uid" v-if="userInfo.uid">UID {{userInfo.uid}}</p>
                                <p class="authorsign" v-if="userInfo.authorsign">
                                    <i class="iconfont icon-authorsign"></i> {{userInfo.authorsign}}</p>
                                <p class="signature">{{userInfo.signature}}</p>
                                <p>
                                    <router-link :to="'/follow/' +towho +'/followers'" class="follow">
                                        <b>{{userInfo.followers}}
                                        </b> Followers
                                    </router-link>
                                    <router-link :to="'/follow/' +towho +'/following'" class="follow">
                                        <b>{{userInfo.following}}</b>
                                        Following
                                    </router-link>
                                </p>
                            </div>
                            <div class="meta-right">
                                <router-link to='/setting' class="modify" v-if="userid === towho">
                                    <i class="iconfont icon-pencil"></i>
                                </router-link>
                                <div class="follow-wrapper" v-else>
                                    <div class="followed toFollow" v-show="!userInfo.hasfollowed" @click="toFollow(true,0)">Follow</div>
                                    <div class="followed toUnfollow" v-show="userInfo.hasfollowed" @click="toFollow(false,0)">UnFollow</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="tab-container">
                    <el-menu default-active="works" class="el-menu-demo tab-select" mode="horizontal" @select="handleSelect">
                        <el-menu-item index="works">{{userInfo.vevue}}<br/>WORKS</el-menu-item>
                        <el-menu-item index="likes">{{userInfo.likes}}<br/>LIKES</el-menu-item>
                        <el-menu-item index="respond">{{userInfo.respond}}<br/>RESPOND</el-menu-item>
                    </el-menu>
                </div>
                <keep-alive>
                    <videoList :params='works' :listenScroll='true' v-if="type ==='works' || type === ''"></videoList>
                </keep-alive>
                <keep-alive>
                    <videoList :params='respond' :listenScroll='true' v-if="type ==='respond'"></videoList>
                </keep-alive>
                <keep-alive>
                    <videoList :params='likes' :listenScroll='true' v-if="type ==='likes'"></videoList>
                </keep-alive>
            </div>
        </no-ssr>
        <nuxt-child/>
    </div>
</template>
<script>
import axios from 'axios';
import apiUrl from '../../assets/js/config/urlConfig.js';
import transactionConfig from '../../assets/js/config/transactionConfig.js';
import docCookies from '../../static/tools/cookies.js';
// import QRCode from '../../static/tools/qrcode.min.js';
import ClipboardJS from 'clipboard';
import jsFormat from '../../static/tools/jsFormat.js';
import totp from '../../static/tools/totp.js';
import videoList from '../../components/videoList.vue';
import topHeaderDownload from '../../components/topHeaderDownload.vue';
if (process.browser) {
  require('../../static/tools/qrcode.min.js');
}
let globalUserInfoCache = {};
let globalUserid = '';
export default {
  components: {
    topHeaderDownload,
    videoList
  },
  layout: 'header',
  data() {
    const that = this;
    let result = {
      works: {},
      respond: {},
      likes: {},
      jsFormat,
      transactionConfig,
      showTransactionList: false, // 交易列表 dialog 开关
      showAddrQRCode: false, // 地址二维码开关
      type: 'works', // 初始加载
      oldTowho: '',
      userInfo: globalUserInfoCache,
      maxRequestTimes: 5,
      logo:
        'this.src="' +
        require('../../assets/images/vevue_logo_50x50.png') +
        '"',
      cookiesEnd: 604800, // cookies时间
      userid: globalUserid,
      towho: this.$route.params.towho
    };
    if (process.client) {
      Object.assign(result, {
        works: {
          action: 'listoftype',
          userid: docCookies.getItem('userid') || '-',
          towho: this.$route.params.towho,
          type: 'vevue',
          cid: docCookies.getItem('cid') || ''
        },
        respond: {
          action: 'listoftype',
          userid: docCookies.getItem('userid') || '-',
          towho: this.$route.params.towho,
          type: 'respond',
          cid: docCookies.getItem('cid') || ''
        },
        likes: {
          action: 'listoftype',
          userid: docCookies.getItem('userid') || '-',
          towho: this.$route.params.towho,
          type: 'likes',
          cid: docCookies.getItem('cid') || ''
        }
      });
    }
    return result;
  },
  mounted() {
    this.userid = docCookies.getItem('userid') || '';
    globalUserid = this.userid;
    this.getUserInfo(0);
  },
  methods: {
    clipText(el) {
      console.log('clip');
      const clip = new ClipboardJS(el, {
        text: function(trigger) {
          return trigger.getAttribute('aria-label');
        }
      });
      clip.on('success', e => {
        this.$message({
          message: 'Link Copied',
          duration: 1200,
          type: 'success'
        });
        console.log('success');
        console.log(e);
        clip.destroy();
      });
    },
    showQRCode() {
      this.showAddrQRCode = true;
      // this.qrcode.clear();
      this.$nextTick(() => {
        if (!this.qrcode) {
          this.qrcode = new QRCode(document.getElementById('qrcode'), {
            text: this.userInfo.addr_vevue
          });
        }
      });
    },
    handleSelect(key, keyPath) {
      this.type = keyPath[0];
    },
    getUserInfo(times) {
      const that = this;
      if (times >= that.maxRequestTimes) {
        return;
      }
      axios
        .post(apiUrl.vevueAPI + 'visitor', {
          userid: docCookies.getItem('userid') || '-',
          towho: that.towho,
          date: new Date().getTime(),
          authcode: docCookies.getItem('userid')
            ? totp.getCode(docCookies.getItem('safekey'))
            : '',
          cid: docCookies.getItem('cid') || '',
          timestamp: Math.floor(new Date().getTime() / 1000)
        })
        .then(async res => {
          if (res.data.errcode === 0) {
            let result = JSON.parse(JSON.stringify(res.data.result));
            result.nickname = result.nickname;
            result.signature = result.signature;
            result.avatar = apiUrl.avatarURL + result.avatar + '.jpg';
            result.cover = result.cover
              ? apiUrl.coverURL + result.cover + '.png'
              : require('../../assets/images/person-cover-default.png');
            if (that.towho === docCookies.getItem('userid')) {
              docCookies.setItem(
                'avatar',
                res.data.result.avatar,
                this.cookiesEnd,
                '/',
                null
              );
              let balance = await axios.post(apiUrl.vevueAPI + 'balance', {
                userid: docCookies.getItem('userid'),
                simple: 0,
                version: 0.1,
                authcode: docCookies.getItem('userid')
                  ? totp.getCode(docCookies.getItem('safekey'))
                  : '',
                cid: docCookies.getItem('cid') || '',
                timestamp: Math.floor(new Date().getTime() / 1000)
              });
              if (balance.data.errcode === 0) {
                result.addr_vevue = balance.data.addr_vevue;
                result.amount = balance.data.amount;
                result.transactionList = balance.data.result;
              }
            }
            that.userInfo = JSON.parse(JSON.stringify(result));
            globalUserInfoCache = that.userInfo;
          } else if (res.data.errcode === 110) {
            setTimeout(() => {
              that.getUserInfo(++times);
            }, 500);
          }
        });
    },
    toFollow(bool, times) {
      const that = this;
      if (times >= that.maxRequestTimes) {
        return;
      }
      if (!docCookies.getItem('userid').trim()) {
        window.location.href = '/login?continue=' + this.hashUrl;
        return;
      }
      this.userInfo.hasfollowed = !this.userInfo.hasfollowed;
      axios
        .post(apiUrl.vevueAPI + 'follow', {
          userid: docCookies.getItem('userid'),
          towho: that.towho,
          sign: bool,
          cid: docCookies.getItem('cid'),
          authcode: totp.getCode(docCookies.getItem('safekey')),
          timestamp: Math.floor(new Date().getTime() / 1000)
        })
        .then(res => {
          if (res.data.errcode === 260) {
            this.userInfo.hasfollowed = true;
          } else if (res.data.errcode === 261) {
            this.userInfo.hasfollowed = false;
          } else if (res.data.errcode === 110) {
            setTimeout(() => {
              that.toFollow(bool, ++times);
            }, 500);
          } else {
            this.userInfo.hasfollowed = !this.userInfo.hasfollowed;
          }
        });
    }
  },
  beforeRouteEnter: (to, from, next) => {
    next(vm => {
      if (vm.oldTowho && vm.oldTowho !== to.params.towho) {
        window.location.reload();
      }
    });
  },
  beforeRouteUpdate(to, from, next) {
    console.log('rouer upadate');
    this.towho = to.params.towho;
    this.getUserInfo(0);
    next();
    window.location.reload();
  },
  beforeRouteLeave(to, from, next) {
    this.oldTowho = this.towho;
    next();
  }
};
</script>
<style lang="stylus">
body {
    padding-right: 0px !important; // 解决dialog弹窗 body出现paddingright 5px bug
}

.user-vue {
    position: relative;

    // margin-top: -45px;
    .user-cover {
        width: 100%;
        height: 20rem;
        background-color: #f5f5f5;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }

    .user-meta {
        position: relative;
        background: #fff;
        padding-bottom: 10px;

        .modify {
            font-size: 1.4rem;
        }

        .user-avatar {
            position: relative;

            img {
                position: absolute;
                top: -4rem;
                left: 1rem;
                width: 8rem;
                height: 8rem;
                border-radius: 50%;
            }
        }

        .user-meta-text {
            background-color: #fff l;
            padding: 5rem 1rem 0;
            display: flex;
            justify-content: space-between;

            .meta-left {
                flex: 2;
                font-size: 1.3rem;

                .nickname {
                    font-size: 2rem;
                }

                .signature {
                    max-width: 22rem;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .follow {
                    padding-right: 5px;
                }

                p {
                    margin-top: 0.5rem;
                }
            }

            .icon-authorsign {
                color: #1697CE;
            }

            .uid, .authorsign {
                font-size: 1.2rem;
            }

            .meta-right {
                flex: 1;
                display: flex;
                justify-content: flex-end;
                align-items: center;

                .followed {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: #fff;
                    border-radius: 3px;
                    width: 80px;
                    height: 25px;

                    &.toUnfollow {
                        background-color: #ccc;
                    }

                    &.toFollow {
                        background-color: #409eff;
                        color: #fff;
                    }
                }
            }
        }
    }

    .el-menu--horizontal>.el-menu-item {
        height: 45px !important;
        text-align: center;
        line-height: inherit !important;
    }

    .tab-select {
        display: flex !important;

        &>.el-menu-item {
            flex: 1 !important;
        }
    }

    .vevue_score {
        position: absolute;
        right: 10px;
        top: 5px;
        display: flex;
        justify-content: center;
        align-items: center;

        .token_left {
            margin: 0 5px;
        }

        .deposit {
            padding: 3px 5px !important;
        }

        &>img {
            width: 20px;
            height: 20px;
        }

        .el-dialog__body {
            display: flex !important;
            flex-direction: column;
            align-items: center;
            justify-content: center !important;
        }

        #qrcode {
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .addr_text {
            font-size: 1.5rem;
            margin-top: 20px;
            margin-bottom: 5px;
        }

        .addr_btn {
            color: #409EFF;
            cursor: pointer;
            font-size: 1.4rem;
        }

        .deposit_info {
            margin-top: 20px;
            margin-bottom: 20px;
            color: #E4A611;
            font-size: 1.2rem;
            text-align: center;
        }
    }

    .el-dialog__header {
        text-align: center;
    }

    .el-dialog__body {
        padding: 0px !important;
    }

    .transactionList {
        width: 100%;
        padding: 10px 20px;
        border-bottom: solid 1px #ccc;
    }

    .item_show {
        display: flex;
        padding-bottom: 20px;

        &>div {
            // flex: 1;
            text-align: left;
        }

        .item_type {
            flex: 1;
            font-size: 14px;
            font-weight: bold;
        }

        .item_date {
            flex: 1;
            font-size: 12px;
            text-align: right;
        }
    }

    .item_id {
        &>p {
            transform: scale(0.5);
            transform-origin: left;
            white-space: nowrap;
        }

        text-align: left;
        font-size: 1.6rem;
    }
}
</style>

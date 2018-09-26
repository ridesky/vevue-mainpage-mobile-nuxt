<template>
  <no-ssr>
    <div>
      <topHeaderDownload/>
      <div class="player-vue" :class="{'fixed-video':fixedVideo}">
        <section>
          <div class="video-detail">
            <div class="toggleFixed" ref='toggleFixed'>
              <div class="video-box" ref='video' :class="{camouflageScreen:camouflageScreen}" :style="'height:'+videoBoxHeight">
                <div v-if="showPaytoPlay" @click="showPaytoPlay =false" class="paytoplay">
                  <i class="iconfont icon-tri_right"></i>
                </div>
                <div v-else>
                  <div class="shadow" v-if="tobuydialog"></div>
                  <div class="tobuydialog" v-if="tobuydialog">
                    <div class="note">Pay to unlock this video</div>
                    <div class='pay-img'>
                      <img src="../../assets/images/logo_coin_100.png" alt="Tokens">
                      <span>{{video.price}}</span>
                    </div>
                    <div class="select">
                      <div class="cancelPay" @click="showPaytoPlay =true">
                        <span>Cancel</span>
                      </div>
                      <div class="toPay" @click="toPay">
                        <span>Pay</span>
                      </div>
                    </div>
                  </div>
                  <div class="noexit" v-if="videoNoExit">
                    <i class="iconfont icon-warn"></i> Video Not Found</div>
                </div>
                <div ref='videoDPISelected' class="video-dpi-selected" v-clickoutside='closeShowDPISelect'>
                  <div class="video-dpi-set" v-if='!vrMode'>
                    <p v-if="playlist.length>0" @click='showDPIUl= !showDPIUl'>{{playlist[videoDPISet].scale}}</p>
                    <ul class="video-dpi-ul" v-show="showDPIUl">
                      <li v-for='(item,index) in playlist' :key="item.scale" @click='reloadPlayer(index,item.url)'>{{item.scale}}</li>
                    </ul>
                  </div>
                </div>
                <div v-show="showVRPlayer" class="vrplayer">
                  <div id="vrview"></div>
                </div>
                <video v-if="!showVRPlayer" crossorigin="anonynmous" id='my-video' class="video video-js vjs-default-skin vjs-big-play-centered" webkit-playsinline playsinline>
                  <track kind='captions' v-for='item in subtitle' :src='item.vtt' :srclang='item.language' :label='item.label' :key='item.vtt' />
                  <!-- <track kind='captions' src='https://dotsub.com/media/5d5f008c-b5d5-466f-bb83-2b3cfa997992/c/chi_hans/vtt' srclang='zh' label='Chinese' default />
              <track kind='captions' src='https://dotsub.com/media/5d5f008c-b5d5-466f-bb83-2b3cfa997992/c/eng/vtt' srclang='en' label='English' />
              <track kind='captions' src='https://dotsub.com/media/5d5f008c-b5d5-466f-bb83-2b3cfa997992/c/spa/vtt' srclang='es' label='Spanish' /> -->
                </video>
              </div>
              <div class="danmakuEmit" v-show="!vrMode && video.videoid">
                <div class="controlsButton">
                  <i v-show="showDanmaku" class="iconfont icon-opendanmu" @click="toggleDanmaku" title='Hide Danmaku'></i>
                  <i v-show="!showDanmaku" class="iconfont icon-closedanmu" @click="toggleDanmaku" title='Show Danmaku'></i>
                  <i class="iconfont icon-control" @click='showSetting = !showSetting' title="Danmaku Setting" v-clickoutside='closeShowSetting'>
                    <transition name="fade">
                      <div class="settingBox" v-if="showSetting" @blur='showSetting = !showSetting'>
                        <h2>Color</h2>
                        <div class="colorSelector">
                          <p v-for="(color,index) in colors" :key="color.color" @click="colorSelected = colors[index]" :class="{selectBorder:colorSelected.color === color.color}" :style="'background-color:'+ color.color">
                          </p>
                        </div>
                      </div>
                    </transition>
                  </i>
                </div>
                <div class="inputBox">
                  <input v-if="userid" type="text" placeholder="Fire danmaku!!" v-model="danmakuText" @keyup.13="sendDanmaku" @blur="toWindowTop">
                  <input v-else disabled type="text" placeholder="Login to fire danmaku" v-model="danmakuText">
                </div>
                <div v-if="userid">
                  <div @click="sendDanmaku" class="sendButton" v-show="countdown.fireDanmaku <=0">Fire</div>
                  <div class="sendButton disabled" v-show="countdown.fireDanmaku > 0">{{countdown.fireDanmaku}}</div>
                </div>
                <a v-else :href="'/login?continue='+hashUrl" class="sendButton">Login</a>
              </div>
            </div>
            <div class="videoMeta headMeta" ref='headMeta'>
              <div class="flex1">
                <h3 v-if="video.videoid" class="title">{{video.title}}</h3>
                <h3 v-else class="title notitle"></h3>
                <p v-if="video.videoid" class="note" :class="{'show-all-note':showAllNote}" @click="showAllNote = !showAllNote">{{video.note}}</p>
                <p v-else class="note nonote"></p>
                <div class="inforender">
                  <div v-if="video.videoid" class="view">{{video.view}} views {{video.likes}} likes</div>
                  <div v-else class="view noview"></div>
                </div>
              </div>
              <div class="menu-container">
                <div class="like-tag" v-show="video.isLike" @click="toggleLike(false)">Like
                  <i class="iconfont icon-like-heart"></i>
                </div>
                <div v-if="video.videoid">
                  <div class="like-tag" v-show="!video.isLike" @click="toggleLike(true)">Like
                    <i class="iconfont icon-like"></i>
                  </div>
                </div>
                <div class="like-tag nolike" v-else></div>
              </div>
            </div>
            <div class="videoMeta">
              <div class="owner">
                <div class="flexLeft">
                  <div class="avatar" v-if="video.avatar">
                    <router-link :to='"/user/" + video.bywho'>
                      <img :src="video.avatar" alt="" v-show="video.avatar">
                    </router-link>
                  </div>
                  <div v-else class="avatar noavatar"></div>
                  <div class="ownerInfo">
                    <span v-if="video.videoid">{{video.nickname}}</span>
                    <span v-else class="nonickname"></span>
                    <span v-if="video.videoid">{{video.time}}</span>
                    <span v-else class="notime"></span>
                  </div>
                </div>
                <div v-show="video.videoid && (userid !== video.bywho)">
                  <div class="followed toFollow" v-show="!video.hasfollowed" @click="toFollow(true)">Follow</div>
                  <div class="followed toUnfollow" v-show="video.hasfollowed" @click="toFollow(false)">UnFollow</div>
                </div>
              </div>
            </div>
            <div class="videoMeta op1 right-comment" v-show="video.videoid">
              <div class="comments">
                <div class="toWrite">
                  <el-tag class="count" size="mini" type="warning">{{video.comment}} Comments</el-tag>
                  <div class="showLoading" v-if="commentPack.showLoading">
                    <img src="../../assets/images/loading_bar.gif" alt="">
                  </div>
                  <div v-else>
                    <div class="writeBox" v-if="userid">
                      <div class="thumbnail">
                        <img :src="avatar" alt="" class="img">
                      </div>
                      <div class="inputBox">
                        <input class="textarea" ref="textarea" type="text" placeholder="Write Comment" rows="1" v-model="commentPack.commentText" autocomplete="off" maxlength="50">
                      </div>
                      <div class="arr" @click="toComment" :class="{opacity2:commentPack.commentText.length===0}">Comment</div>
                    </div>
                    <div class="writeBox" v-else>
                      <div class="thumbnail">
                        <img :src="avatar" class="img">
                      </div>
                      <div class="inputBox">
                        Please
                        <a class="loginlink" :href="'/login?continue='+hashUrl"> login</a> to post a comment
                      </div>
                    </div>
                  </div>
                </div>
                <div class="contents">
                  <div v-for="(reply,index) in replies" :key="index" class="replyWrap">
                    <div class="avatarBox">
                      <router-link :to=" '/user/' + reply.bywho">
                        <img :src="reply.avatar" :onerror='logo'>
                      </router-link>
                    </div>
                    <div class="con">
                      <div class="user">{{reply.nickname}}</div>
                      <div class="text">{{reply.text}}</div>
                      <div class="info">
                        <span>{{reply.date}}</span>
                        <span class="showReply" @click="showReply(index,reply)" v-show="userid !== reply.bywho">Reply</span>
                      </div>
                      <ul class="replyToMsgLists">
                        <li v-for="(replyToMsg,rtIndex) in reply.replyToMsgs" :key="rtIndex">
                          <div class="avatarBox">
                            <router-link :to=" '/user/' + replyToMsg.bywho">
                              <img :src="replyToMsg.avatar">
                            </router-link>
                          </div>
                          <div class="con">
                            <div class="user">{{replyToMsg.nickname}}</div>
                            <div class="text">{{replyToMsg.text}}</div>
                            <div class="info">
                              <span>{{replyToMsg.date}}</span>
                              <span class="showReply" @click="showReply(index,replyToMsg)" v-show="userid !== replyToMsg.bywho">Reply</span>
                            </div>
                          </div>
                        </li>
                      </ul>
                      <div class="commentBoxRender" v-show="replyPack.showReplyIndex === index">
                        <div class="showLoading" v-if="replyPack.showLoading">
                          <img src="../../assets/images/loading_bar.gif">
                        </div>
                        <div class="writeBox" v-else :class="'showReply'+index" :ref="'showReply'+index">
                          <div class="thumbnail">
                            <img :src="avatar" alt="" class="img">
                          </div>
                          <div class="inputBox">
                            <input class="textarea" ref='rextarea' @blur="restoreInputHeight" type="text" :placeholder="'@' + replyPack.replySelected.nickname" rows="1" v-model="replyPack.replyText" autocomplete="off" maxlength="50">
                          </div>
                          <div class="arr" @click="toReply(0)" :class="{opacity2:replyPack.replyText.length === 0}">Reply</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </no-ssr>
</template>
<script>
import axios from 'axios';
import apiUrl from '../../assets/js/config/urlConfig.js';
import jsFormat from '../../static/tools/jsFormat.js';
import docCookies from '../../static/tools/cookies.js';
import SparkMD5 from 'spark-md5';
import topHeaderDownload from '../../components/topHeaderDownload.vue';
// import videojs from 'video.js';
// import * as HLS from 'videojs-contrib-hls';
import totp from '../../static/tools/totp.js';
export default {
  layout: 'header',
  components: {
    topHeaderDownload
  },
  data() {
    return {
      apiUrl,
      avatar: '', // 用户头像地址
      rightComment: '',
      commentPack: {
        showLoading: false,
        commentText: ''
      },
      showVRPlayer: false,
      showDPIUl: false, // 显示分辨率选择
      camouflageScreen: false, // 伪全屏开关
      showSetting: false,
      maxRequestTimes: 5,
      tobuydialog: false,
      showPaytoPlay: false,
      videoNoExit: false, // 视频不存在
      videoUrl_real: '', // 收费视频地址
      subtitle: [], // 字幕
      vrMode: false,
      showDanmaku: true,
      fixedVideo: false, // video置顶开关
      hashUrl: '',
      danmakuText: '',
      userid: '',
      video: {
        price: 0
      },
      videoDPI: ['1080', '2K', 'origin'],
      playlist: [],
      videoDPISet: '1080',
      videoBoxHeight: process.client ? window.screen.width * 9 / 16 + 'px' : '',
      replies: [],
      replyPack: {
        showReplyIndex: -1,
        showLoading: false,
        replySelected: {
          nickname: ''
        },
        replyText: ''
      },
      countdown: {
        fireDanmaku: 0
      },
      logo:
        'this.src="' +
        require('../../assets/images/vevue_logo_50x50.png') +
        '"',
      showAllNote: false,
      colors: [
        {
          color: '#ffffff',
          title: 'white'
        },
        {
          color: '#000000',
          title: 'black'
        },
        {
          color: '#0000ff',
          title: 'blue'
        },
        {
          color: '#00ff00',
          title: 'green'
        },
        {
          color: '#ff0000',
          title: 'red'
        },
        {
          color: '#ff66ff',
          title: 'pink'
        },
        {
          color: '#660099',
          title: 'purple'
        },
        {
          color: '#ffff00',
          title: 'yellow'
        },
        {
          color: '#3B4B9D',
          title: '3B4B9D'
        },
        {
          color: '#0C91CE',
          title: '0C91CE'
        },
        {
          color: '#098277',
          title: '098277'
        },
        {
          color: '#ffcc99',
          title: 'ffcc99'
        }
      ]
    };
  },
  async asyncData(context) {
    let result = await axios.post(apiUrl.vevueAPI + 'getvideoseo', {
      videoid: context.params.videoid
    });
    result = result.data;
    if (result.errcode === 0) {
      return {
        videoLink: result.link,
        videoSeoTitle: result.title,
        videoSeoNote: result.note
      };
    } else {
      return {
        videoLink: context.params.videoid,
        videoSeoTitle: 'Vevue',
        videoSeoNote: 'Vevue'
      };
    }
  },
  head() {
    // Set Meta Tags for this Page
    return {
      title: this.videoSeoTitle,
      script: [],
      meta: [
        {
          property: 'twitter:title',
          content: this.videoSeoTitle
        },
        {
          property: 'twitter:description',
          content: this.videoSeoNote
        },
        {
          property: 'og:type',
          content: 'website'
        },
        {
          property: 'og:title',
          content: this.videoSeoTitle
        },
        {
          property: 'og:site_name',
          content: 'Vevue'
        },
        {
          property: 'og:image',
          content: this.apiUrl.videoURL + this.videoLink + '.jpg'
        },
        {
          property: 'og:width',
          content: '512'
        },
        {
          property: 'og:height',
          content: '512'
        },
        {
          property: 'og:description',
          content: this.videoSeoNote
        },
        {
          property: 'description',
          content: this.videoSeoNote
        }
        // {
        //   property: 'twitter:image',
        //   content: this.url + this.$route.params.id + '.jpg'
        // }
      ]
    };
  },
  mounted() {
    window.vue = this;
    Object.assign(this, {
      colorSelected: this.colors[0],
      userid: docCookies.getItem('userid') || '',
      nickname: docCookies.getItem('nickname') || 'User',
      hashUrl: encodeURIComponent(window.location.href),
      avatar: docCookies.getItem('avatar') // 初始化avatar
        ? apiUrl.avatarURL + docCookies.getItem('avatar') + '.jpg'
        : 'https://file.vevue.com/avatar/vevue_logo_1000.jpg',
      rightComment: document.querySelector('.right-comment')
    });
    this.loadVideo();
  },
  methods: {
    addListenerVideoToFixed() {
      const that = this;
      // const gapHeight = 10;
      const toggleFixedHeight = that.$refs.toggleFixed.getBoundingClientRect()
        .height;
      if (
        that.$refs.headMeta.getBoundingClientRect().top <=
        toggleFixedHeight + 2
      ) {
        that.fixedVideo = true;
        that.$refs.headMeta.style.marginTop = toggleFixedHeight + 'px';
      } else if (
        that.$refs.headMeta.getBoundingClientRect().top >= toggleFixedHeight
      ) {
        that.fixedVideo = false;
        that.$refs.headMeta.style.marginTop = '5px';
      }
      // window.addEventListener('scroll', function() {
      //   if (
      //     that.$refs.headMeta.getBoundingClientRect().top <=
      //     toggleFixedHeight + 2
      //   ) {
      //     that.fixedVideo = true;
      //     that.$refs.headMeta.style.marginTop = toggleFixedHeight + 'px';
      //   } else if (
      //     that.$refs.headMeta.getBoundingClientRect().top >= toggleFixedHeight
      //   ) {
      //     that.fixedVideo = false;
      //     that.$refs.headMeta.style.marginTop = '5px';
      //   }
      // });
    },
    toWindowTop() {
      window.scrollTo(0, 0);
    },
    toggleDanmaku() {
      if (!this.showDanmaku) {
        this.danmaku.show();
      } else {
        this.danmaku.hide();
      }
      this.showDanmaku = !this.showDanmaku;
    },
    toPay() {
      const that = this;
      if (!this.userid.trim()) {
        window.location.href = '/login?continue=' + this.hashUrl;
        return;
      }
      axios
        .post(apiUrl.vevueAPI + 'paytovideo', {
          userid: docCookies.getItem('userid'),
          videoid: this.$route.params.videoid,
          cid: docCookies.getItem('cid'),
          authcode: totp.getCode(docCookies.getItem('safekey')),
          timestamp: Math.floor(new Date().getTime() / 1000)
        })
        .then(res => {
          if (res.data.errcode === 0) {
            window.location.reload();
          } else {
            that.$message.error('Payment failed');
          }
        });
    },
    closeShowDPISelect() {
      if (this.showDPIUl) this.showDPIUl = false;
    },
    closeShowSetting() {
      if (this.showSetting) this.showSetting = false;
    },
    toFollow(bool) {
      const that = this;
      if (!that.userid.trim()) {
        window.location.href = '/login?continue=' + that.hashUrl;
        return;
      }
      that.video.hasfollowed = !that.video.hasfollowed;
      axios
        .post(apiUrl.vevueAPI + 'follow', {
          userid: docCookies.getItem('userid'),
          towho: that.video.bywho,
          sign: bool,
          cid: docCookies.getItem('cid'),
          authcode: totp.getCode(docCookies.getItem('safekey')),
          timestamp: Math.floor(new Date().getTime() / 1000)
        })
        .then(res => {
          if (res.data.errcode === 260) {
            that.video.hasfollowed = true;
          } else if (res.data.errcode === 261) {
            that.video.hasfollowed = false;
          } else {
            that.video.hasfollowed = !that.video.hasfollowed;
          }
        });
    },
    GetQueryString(name) {
      var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
      var r = window.location.search.substr(1).match(reg);
      if (r != null) {
        return decodeURI(r[2]);
      }
    },
    showReply(index, reply) {
      if (!this.userid.trim()) {
        window.location.href = '/login?continue=' + this.hashUrl;
        return;
      }
      const that = this;
      this.replyPack.replyText = '';
      this.replyPack.showReplyIndex = index;
      this.replyPack.replySelected = reply;
      const showEle = document.querySelector('.showReply' + index);
      this.showEle = showEle; // 为restoreHeight事件用
      this.$nextTick(function() {
        if (window.screen.height - 80 < showEle.getBoundingClientRect().top) {
          document.body.scrollTop =
            showEle.offsetTop -
            this.$refs.toggleFixed.getBoundingClientRect().height -
            100;
          showEle.querySelector('.textarea').focus();
        } else {
        }
      });
    },
    restoreInputHeight() {
      document.body.scrollTop =
        this.showEle.offsetTop -
        this.$refs.toggleFixed.getBoundingClientRect().height -
        101;
    },
    toComment(times) {
      const that = this;
      times = times || 0;
      if (times >= that.maxRequestTimes) {
        that.commentPack.showLoading = false;
        return;
      }
      if (!that.commentPack.commentText.trim()) {
        return;
      }
      that.commentPack.showLoading = true;
      axios
        .post(apiUrl.vevueAPI + 'msg_video', {
          userid: docCookies.getItem('userid'),
          text: that.commentPack.commentText,
          tovideo: that.video.videoid,
          unitlock: SparkMD5.hash(
            that.commentPack.commentText +
              docCookies.getItem('userid') +
              that.video.videoid
          ),
          cid: docCookies.getItem('cid'),
          authcode: totp.getCode(docCookies.getItem('safekey')),
          timestamp: Math.floor(new Date().getTime() / 1000)
        })
        .then(res => {
          that.commentPack.showLoading = false;
          if (res.data.errcode === 0) {
            let newComment = {
              avatar: that.avatar,
              bywho: docCookies.getItem('userid'),
              date: jsFormat.smartTime(new Date().getTime()),
              msgtype: 'msg',
              msguid: res.data.result.msguid,
              nickname: that.nickname,
              replyToMsgs: [],
              text: that.commentPack.commentText
            };
            that.replies.push(newComment);
            that.commentPack.commentText = '';
          } else if (res.data.errcode === 110) {
            setTimeout(() => {
              that.toComment(++times);
            }, 500);
          }
        })
        .catch(err => {
          that.commentPack.showLoading = false;
          console.error(err);
        });
    },
    sendDanmaku() {
      const that = this;
      if (!that.danmakuText.trim()) {
        return;
      }
      that.countdown.fireDanmaku = 5;
      let countFireDanmaku = setInterval(() => {
        if (that.countdown.fireDanmaku <= 0) clearInterval(countFireDanmaku);
        that.countdown.fireDanmaku -= 1;
      }, 1000);
      let comment = {
        text: that.danmakuText,
        html: false,
        mode: 'rtl',
        time: that.player.currentTime(),
        style: {
          fontSize: '20px',
          color: that.colorSelected.color,
          border: '1px solid #fff',
          textShadow:
            that.colorSelected.color === '#000000'
              ? '-1px -1px #fff, -1px 1px #fff, 1px -1px #fff, 1px 1px #fff'
              : '-1px -1px #000, -1px 1px #000, 1px -1px #000, 1px 1px #000'
        }
      };
      that.danmaku.emit(comment);
      axios
        .post(apiUrl.vevueAPI + 'biubiudanmaku', {
          userid: docCookies.getItem('userid') || '',
          tovideo: that.video.videoid,
          danmu: that.danmakuText,
          textcolor: that.colorSelected.color,
          offset: that.player.currentTime().toString(),
          cid: docCookies.getItem('cid'),
          authcode: totp.getCode(docCookies.getItem('safekey')),
          timestamp: Math.floor(new Date().getTime() / 1000)
        })
        .then(res => {
          if (res.data.errcode === 0) {
            that.danmakuText = '';
          }
        });
    },
    loadVideo() {
      console.log('loadvideo');
      const that = this;
      axios
        .post(apiUrl.vevueAPI + 'getvideoinfo', {
          videoid: this.$route.params.videoid,
          userid: docCookies.getItem('userid') || '-',
          cid: docCookies.getItem('cid') || '-',
          authcode: docCookies.getItem('safekey')
            ? totp.getCode(docCookies.getItem('safekey'))
            : '',
          timestamp: Math.floor(new Date().getTime() / 1000)
        })
        .then(res => {
          if (res.data.errcode === 0) {
            if (!res.data.result) {
              // 返回为 null 视频被禁
              that.videoNoExit = true;
              return;
            }
            that.videoUrl_real = res.data.result.videoid_real.split('::')[0];
            that.playlist = res.data.result.playlist;
            that.videoDPISet = 0;
            that.subtitle = res.data.result.subtitle || [];
            that.playlist.map((item, index) => {
              if (item.scale === '1080P') {
                that.videoDPISet = index;
              }
            });
            if (res.data.result.mode_vr === '1') {
              that.vrMode = true; // 设置vr开关
              let vrWidth = null;
              let vrHeight = null;
              vrWidth = '100%';
              vrHeight = window.screen.width * 9 / 16 + 'px';
              that.showVRPlayer = true;
              that.vrView = new VRView.Player('#vrview', {
                video:
                  apiUrl.videoURL +
                  (that.videoUrl_real ||
                    res.data.result.yuan.videoid.split('::main')[0]) +
                  '.mp4',
                width: vrWidth,
                height: vrHeight
              });
            } else {
              that.$nextTick(that.loadPlayer);
            }
            const data = res.data.result;
            // let yuan = JSON.parse(data.yuan);
            const yuan = data.yuan;
            Object.assign(yuan, {
              time: jsFormat.formatTime(new Date(yuan.timestamp * 1000)),
              title: yuan.title,
              note: yuan.note,
              nickname: yuan.nickname,
              comment: data.comment,
              likes: data.likes,
              view: data.view,
              isLike: data.isLike,
              hasfollowed: data.hasfollowed,
              avatar: apiUrl.avatarURL
                ? apiUrl.avatarURL + data.avatar + '.jpg'
                : '../../assets/images/icon2.png'
            });
            this.video = yuan;
            document.title = this.video.title;
            this.loadComments();
          } else if (res.data.errcode === 281) {
            that.tobuydialog = true;
            that.video.price = res.data.price;
          } else if (res.data.errcode === 110) {
            if (!docCookies.getItem('userid')) {
              that.tobuydialog = true;
              that.video.price = res.data.price;
            }
          } else {
            that.videoNoExit = true;
          }
        });
    },
    loadComments() {
      axios
        .post(apiUrl.vevueAPI + 'getcomments', {
          videoid: this.$route.params.videoid
        })
        .then(res => {
          let data = res.data.result;
          let replies = data;
          const newReplies = [];
          // let replyLength = replies.length;
          for (let i = 0; i < replies.length; i++) {
            // let obj = {};
            if (replies[i].msgtype === 'msg') {
              replies[i].nickname = replies[i].nickname
                ? replies[i].nickname
                : 'unknown author';
              replies[i].avatar = replies[i].avatar
                ? apiUrl.avatarURL + replies[i].avatar + '.jpg'
                : '../../assets/images/icon.png';
              replies[i].text = replies[i].text;
              replies[i].replyToMsgs = [];
              replies[i].date = jsFormat.formatTime(
                new Date(replies[i].timestamp * 1000)
              );
              // this.replies.push(obj);
              newReplies.push(replies[i]);
              replies.splice(i, 1);
              i--;
            }
          }
          let replyLength = replies.length;
          for (let i = 0; i < replyLength; i++) {
            if (replies[i].msgtype === 'reply') {
              for (let j = 0; j < newReplies.length; j++) {
                if (replies[i].msguid === newReplies[j].msguid) {
                  replies[i].nickname = replies[i].nickname
                    ? replies[i].nickname
                    : 'unknown author';
                  replies[i].avatar = replies[i].avatar
                    ? apiUrl.avatarURL + replies[i].avatar + '.jpg'
                    : '../../assets/images/icon.png';
                  replies[i].text = replies[i].text;
                  replies[i].date = jsFormat.formatTime(
                    new Date(replies[i].timestamp * 1000)
                  );
                  newReplies[j].replyToMsgs.push(replies[i]);
                  j = newReplies.length; // 退出循环
                }
              }
            }
          }
          this.replies = newReplies;
        });
    },
    toReply(times) {
      const that = this;
      times = times || 0;
      if (times >= that.maxRequestTimes) {
        that.replyPack.showLoading = false;
        return;
      }
      if (!that.replyPack.replyText.trim()) {
        return;
      }
      that.replyPack.showLoading = true;
      axios
        .post(apiUrl.vevueAPI + 'msg_reply', {
          userid: docCookies.getItem('userid'),
          text: that.replyPack.replyText,
          videoid: that.video.videoid,
          msguid: that.replyPack.replySelected.msguid,
          cid: docCookies.getItem('cid'),
          authcode: totp.getCode(docCookies.getItem('safekey')),
          replyguid: that.replyPack.replySelected.replyguid || '',
          timestamp: Math.floor(new Date().getTime() / 1000)
        })
        .then(res => {
          if (res.data.errcode === 0) {
            that.replyPack.showLoading = false;
            let newReply = {
              avatar: that.avatar,
              bywho: docCookies.getItem('userid'),
              date: jsFormat.smartTime(new Date().getTime()),
              nickname: that.nickname,
              msguid: that.replyPack.replySelected.msguid,
              msgtype: 'reply',
              replyguid: res.data.result.replyguid,
              text: that.replyPack.replyText
            };
            that.replyPack.replyText = '';
            that.replies[that.replyPack.showReplyIndex].replyToMsgs.push(
              newReply
            );
            that.replyPack.showReplyIndex = -1;
          } else if (res.data.errcode === 110) {
            setTimeout(() => {
              that.toReply(++times);
            }, 500);
          } else {
            that.replyPack.showLoading = false;
          }
        })
        .catch(err => {
          that.replyPack.showLoading = false;
          console.error(err);
        });
    },
    reloadPlayer(index, url) {
      const that = this;
      if (url === that.player.currentSource().src) {
        return;
      }
      that.videoDPISet = index;
      const tempTime = that.player.currentTime();
      that.player.src({
        src: url,
        type: url.indexOf('m3u8') > 0 ? 'application/x-mpegURL' : 'video/mp4'
      });
      that.player.on('loadeddata', function() {
        that.player.currentTime(tempTime);
        setTimeout(() => {
          that.player.play();
        }, 500);
      });
    },
    loadPlayer() {
      const that = this;
      that.player = videojs(
        'my-video',
        {
          sources: [
            {
              src: that.playlist[that.videoDPISet].url,
              // src:'https://s3.amazonaws.com/vevue-us/pipe/1080/ab6fb468b6a440b1799965b6a857287b.m3u8',
              type:
                that.playlist[that.videoDPISet].url.indexOf('m3u8') > 0
                  ? 'application/x-mpegURL'
                  : 'video/mp4'
            }
          ],
          poster:
            apiUrl.videoURL + that.video.videoid.split('::main')[0] + '.jpg',
          controls: true,
          autoplay: false
          // textTrackSettings: true
        },
        function() {
          window.player = this;
          window.vue = that;
          that.$refs.video.style.height = window.screen.width * 9 / 16 + 'px';
          window.onresize = function() {
            that.$refs.video.style.height = window.screen.width * 9 / 16 + 'px';
            that.danmaku.resize();
          };
          (function() {
            let newDurationTime = document.getElementsByClassName(
              'vjs-duration'
            )[0];
            var newbtn = that.$refs.videoDPISelected;
            var controlBar = document.getElementsByClassName(
              'vjs-control-bar'
            )[0];
            var insertBeforeNode = document.getElementsByClassName(
              'vjs-fullscreen-control'
            )[0];
            controlBar.insertBefore(newDurationTime, insertBeforeNode);
            controlBar.insertBefore(newbtn, insertBeforeNode);
          })();
          document.addEventListener('webkitfullscreenchange', function() {
            that.danmaku.resize();
          });
          document.addEventListener('mozfullscreenchange', function() {
            that.danmaku.resize();
          });
          that.loadDanmaku();
          // that.addListenerVideoToFixed();
          window.addEventListener('scroll', that.addListenerVideoToFixed);
        }
      );
      // that.player.qualityLevels();
      that.player.on('loadeddata', function() {
        let fullScreenButton = document.querySelector(
          '.vjs-fullscreen-control'
        );
        let newFullScreenButton = fullScreenButton.cloneNode(true);
        fullScreenButton.parentNode.replaceChild(
          newFullScreenButton,
          fullScreenButton
        );
        if (newFullScreenButton.addEventListener) {
          newFullScreenButton.addEventListener('touchstart', function(e) {
            that.camouflageScreen = !that.camouflageScreen;
          });
        }
        window.addEventListener('orientationchange', function() {
          if (window.orientation != 0) {
            that.camouflageScreen = true;
          } else {
            that.camouflageScreen = false;
          }
        });
      });
    },
    loadDanmaku() {
      const that = this;
      axios
        .post(apiUrl.vevueAPI + 'getdanmakus', {
          videoid: that.video.videoid
        })
        .then(res => {
          if (res.data.errcode === 0) {
            this.danmaku = new Danmaku();
            let danmaku = this.danmaku;
            let result = res.data.result;
            const length = result.length;
            const danmakuPack = [];
            for (let i = 0; i < length; i++) {
              let danmaku = result[i];
              danmakuPack.push({
                text: danmaku.text,
                html: false,
                mode: 'rtl',
                time: danmaku.offset,
                style: {
                  fontSize: '20px',
                  color: danmaku.color,
                  border:
                    docCookies.getItem('userid') === danmaku.bywho
                      ? '1px solid #fff'
                      : 'none',
                  textShadow:
                    danmaku.color === '#000000'
                      ? '-1px -1px #fff, -1px 1px #fff, 1px -1px #fff, 1px 1px #fff'
                      : '-1px -1px #000, -1px 1px #000, 1px -1px #000, 1px 1px #000'
                }
              });
            }
            danmaku.init({
              video: document.getElementById('my-video_html5_api'),
              // engine: 'canvas',
              comments: danmakuPack
            });
          }
        });
    },
    toggleLike(bool) {
      const that = this;
      if (!that.userid.trim()) {
        window.location.href = '/login?continue=' + that.hashUrl;
        return;
      }
      that.video.isLike = !that.video.isLike;
      axios.post(apiUrl.vevueAPI + 'likes', {
        videoid: that.video.videoid,
        userid: docCookies.getItem('userid'),
        sign: bool,
        cid: docCookies.getItem('cid'),
        authcode: totp.getCode(docCookies.getItem('safekey')),
        timestamp: Math.floor(new Date().getTime() / 1000)
      });
    }
  },
  beforeRouteLeave(to, from, next) {
    try {
      if (this.player) {
        // 如果当前video是VR视频 则不执行
        this.player.dispose();
      }
      window.removeEventListener('scroll', this.addListenerVideoToFixed);
      this.$destroy(); // 销毁vue组件 目的是为了不缓存页面数据
    } catch (error) {
      document.title = 'Vevue';
      next();
    }
    document.title = 'Vevue';
    next();
  }
};
</script>
<style lang="stylus">
.player-vue {
  &.fixed-video {
    .toggleFixed {
      position: fixed;
      top: 0px;
      left: 0px;
      right: 0px;
    }
  }

  .video-js {
    .vjs-time-control {
      display: block;
    }

    .vjs-time-divider {
      display: none;
    }

    .vjs-remaining-time {
      display: none;
    }

    .vjs-duration {
      // display: none;
    }
  }

  .video-js .vjs-remaining-time {
    // display: none;
  }

  .ptb10 {
    padding-top: 10px !important;
    padding-bottom: 10px !important;
  }

  .flex1 {
    flex: 1;
  }

  .video-detail .video-box .video {
    width: 100%;
    height: 100%;
  }

  .video-box {
    position: relative;

    .shadow {
      position: absolute;
      top: 0px;
      left: 0px;
      bottom: 0px;
      right: 0px;
      z-index: 1;
      background: #333;
      opacity: 0.7;
    }
  }

  .shadow {
    position: absolute;
    top: 0px;
    left: 0px;
    bottom: 0px;
    right: 0px;
    z-index: 1;
    background: #333;
    opacity: 0.8;
  }

  .paytoplay {
    align-items: center;
    justify-content: center;
    display: flex;
    position: absolute;
    cursor: pointer;
    height: 50px;
    border-radius: 6px;
    border: solid 1.5px #fff;
    width: 100px;
    z-index: 2;
    font-size: 35px;
    background-color: rgba(115, 133, 159, 0.5);
    color: #fff;
    left: 50%;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
  }

  .tobuydialog {
    position: absolute;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    border: solid #333 1px;
    background: #fff;
    color: #333;
    z-index: 2;
    left: 50%;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
    width: 250px;
    height: 170px;
    padding: 10px;
    border-radius: 5px;
    font-size: 14px;

    .note {
      font-size: 16px;
    }

    .pay-img {
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 17px;

      img {
        width: 20px;
        height: 20px;
        margin-right: 8px;
      }
    }

    .select {
      display: flex;
    }

    .cancelPay {
      cursor: pointer;
      width: 100px;
      padding: 5px 0;
      margin: 0 auto;
      background: #ccc;
      color: #fff;
      border-radius: 3px;
      align-items: center;
    }

    .toPay {
      cursor: pointer;
      width: 100px;
      padding: 5px 0;
      margin: 0 auto;
      background: orange;
      color: #fff;
      border-radius: 3px;
      align-items: center;
    }
  }

  .noexit {
    position: absolute;
    top: 50%;
    z-index: 2;
    left: 50%;
    font-size: 1.5rem;
    color: #fff;
    transform: translateX(-50%) translateY(-50%);
  }

  .danmakuEmit {
    position: relative;
    // overflow:hidden;
    height: 40px;
    padding: 0 20px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #fff;
    height: 40px;
    background: rgba(43, 51, 63, 1);

    .settingBox {
      border-top-right-radius: 3px;
      border: solid 1px #2b333f;
      width: 202px;
      height: 85px;
      position: absolute;
      top: 0px;
      left: 0px;
      transform: translateY(-100%);
      background-color: rgba(43, 51, 63, 1);
      outline: none;

      h2 {
        font-size: 14px;
        text-align: left;
        margin-left: 5px;
        margin-top: 5px;
      }

      .colorSelector {
        display: flex;
        flex-wrap: wrap;

        &>p {
          width: 20px;
          margin: 5px;
          height: 20px;
          border-radius: 50%;
          opacity: 0.8;
        }

        .selectBorder {
          border: solid 2px orange;
        }

        &>p:hover {
          opacity: 1;
        }
      }
    }

    .icon-opendanmu, .icon-closedanmu {
      cursor: pointer;
      font-size: 26px;
    }

    .icon-control {
      cursor: pointer;
      font-size: 26px;
      margin: 0 3px;
    }

    .inputBox {
      flex: 1;
      margin: 0 20px;
      border-bottom: none;

      input {
        cursor: text;
        height: 25px;
        border-radius: 3px;
        padding: 5px;
        border: none;
        width: 100%;
        outline: none;
      }
    }

    .fade-enter-active, .fade-leave-active {
      transition: all 0.5s;
    }

    .fade-enter, .fade-leave-to { /* .fade-leave-active below version 2.1.8 */
      opacity: 0;
      transform: translateX(-100%) translateY(-100%);
    }

    .sendButton {
      color: #fff;
      cursor: pointer;
      height: 25px;
      padding: 3px 10px;
      background-color: #409EFF;
      display: flex;
      align-items: center;
      border-radius: 3px;
      min-width: 50px;
      justify-content: center;
    }
  }

  .videoMeta {
    &.headMeta {
      min-height: 77px;
    }

    padding: 5px 8px;
    margin: 5px auto;
    border-bottom: solid 0.5px #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .flex1 {
      overflow: hidden;
    }

    &.op1 {
      opacity: 1;
    }

    .title {
      text-align: left;
      font-size: 18px;
      color: #333;
      margin-bottom: 0.5rem;

      &.notitle {
        width: 15rem;
        height: 2rem;
        background: #eee;
        margin-bottom: 0.5rem;
      }
    }

    .note {
      text-align: left;
      overflow: hidden;
      text-overflow: ellipsis;

      &.show-all-note {
        white-space: inherit;
      }

      &.nonote {
        width: 25rem;
        height: 1.3rem;
        background: #eee;
      }
    }

    .inforender {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
      padding-bottom: 5px;

      // border-bottom: solid 1px #eee;
      .view {
        display: flex;
        align-items: center;

        &.noview {
          width: 10rem;
          height: 1rem;
          background: #eee;
        }
      }
    }

    .menu-container {
      display: flex;
      font-size: 20px;
      color: #ccc;
      justify-content: flex-end;

      .like-tag {
        background-color: #fff;
        cursor: pointer;
        color: #f56c6c;
        padding: 0 10px;
        height: 32px;
        line-height: 30px;
        font-size: 12px;
        border: 1px solid hsla(0, 87%, 69%, 0.2);
        border-radius: 4px;

        &.nolike {
          width: 6.5rem;
          height: 3.2rem;
          background: #eee;
          border: none;
        }
      }

      .iconfont {
        // background-color: #fff;
        cursor: pointer;
        margin-left: 5px;
      }

      .icon-like-heart {
        color: #ED4546;
      }
    }

    .owner {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 15px;

      .flexLeft {
        display: flex;
      }

      .avatar {
        &.noavatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          margin-right: 10px;
          background: #eee;
        }

        img {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          margin-right: 10px;
          display: block;
        }
      }

      .ownerInfo {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: flex-start;

        .nonickname, .notime {
          display: inline-block;
          width: 10rem;
          height: 1.3rem;
          background: #eee;
        }
      }

      .followed {
        &.noVideo {
          background: #ccc;
        }

        display: flex;
        font-size: 1.2rem;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #fff;
        border-radius: 3px;
        width: 100px;
        height: 35px;

        &.toUnfollow {
          background-color: #ccc;
        }

        &.toFollow {
          background-color: #409eff;
          color: #fff;
        }
      }
    }

    .comments {
      width: 100%;

      .contents {
        .replyWrap {
          display: flex;
          margin: 20px 0px;

          .showReply {
            margin-left: 5px;
            cursor: pointer;
            font-weight: 600;
            // text-decoration: underline;
          }

          .avatarBox {
            width: 40px;
            height: 40px;

            img {
              width: 100%;
              height: 100%;
              border-radius: 50%;
            }
          }

          .con {
            flex: 1;
            border-bottom: solid 1px #ccc;

            .replyToMsgLists {
              padding-top: 10px;

              .con {
                border-bottom: none;
              }

              li {
                .avatarBox {
                  width: 30px;
                  height: 30px;
                }

                display: flex;
              }
            }

            &>div {
              margin-bottom: 5px;
            }

            .user {
              color: #6d757a;
              font-weight: bold;
            }

            .text {
              font-size: 16px;
              word-break: break-word;
              margin: 12px 0px;
            }

            .info {
              color: #99a2aa;
            }

            text-align: left;
            margin-left: 25px;
          }
        }
      }

      .toWrite {
        text-align: center;
        font-size: 16px;

        .count {
          margin: 10px 0px;
        }
      }
    }
  }

  .video-dpi-selected {
    position: relative;
    z-index: 1;
    user-select: none;

    .video-dpi-set {
      position: relative;
      cursor: pointer;
    }

    .video-dpi-ul {
      position: absolute;
      width: 100px;
      background: #1E242C;
      bottom: 16px;
      left: -34px;

      li {
        &:hover {
          background: #343434;
        }

        padding: 10px 0px;
        text-align: center;
      }
    }
  }

  .writeBox {
    display: flex;
    align-items: center;

    .arr {
      background: #409EFF;
      color: #fff;
      padding: 5px 8px;
      font-size: 1.2rem;
      border-radius: 3px;
      margin-left: 8px;
      cursor: pointer;
    }
  }

  .thumbnail {
    margin-right: 10px;

    img {
      display: block;
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }
  }

  .inputBox.tologin {
    display: block !important;
  }

  .inputBox {
    flex: 1;
    display: flex;
    padding: 5px 0px;
    font-family: initial;
    border-bottom: solid 1px #ccc;

    .loginlink {
      color: #fff;
      font-size: 12px;
      background-color: #409eff;
      padding: 4px 9px;
      margin: 0 5px;
      border-radius: 3px;
    }

    .textarea {
      font-family: inherit;
      width: 100%;
      resize: none;
      border: none;
      background: transparent;
      outline: none;
    }
  }

  .showLoading {
    margin: 0 auto;
    width: 40px;
    height: 40px;

    img {
      display: block;
      width: 100%;
      height: 100%;
    }
  }

  .video-box.camouflageScreen {
    position: fixed;
    // height: 100vh!important;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 999;
    height: inherit !important;
  }

  // .vjs-text-track-display div {
  // background: none !important;
  // color: white;
  // text-shadow: -1px -1px #000, -1px 1px #000, 1px -1px #000, 1px 1px #000;
  // }
  .vjs-control-bar {
    align-items: center;
  }
}
</style>

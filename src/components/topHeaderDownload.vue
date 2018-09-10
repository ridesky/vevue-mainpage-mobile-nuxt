<template>
    <div>
        <header class="header-vue-component">
            <div class="top-banner">
                <div class="logoBox">
                    <a href="/">
                        <img src="../assets/images/logo-01.png" alt="">
                    </a>
                </div>
                <div class="banner-right">
                    <div class="top-download">
                        <a href="https://app.vevue.com">Download APP</a>
                    </div>
                    <div class="personal" v-clickoutside='closePersonPannel' @click="showPersonPannel = !showPersonPannel">
                        <!-- <router-link :to=" '/user/' + userInfo.userid" v-if="userInfo.avatarid"> -->
                        <div v-if="userInfo.userid">
                            <img class="topUserAvatar" :src="userInfo.avatar" alt="" :onerror='defaultAvatar'>
                        </div>
                        <!-- </router-link> -->
                        <a v-else href="/login">
                            <img src="../assets/images/user-bg.png" class="topUserAvatar">
                        </a>
                        <div class="person-pannel" v-show="showPersonPannel">
                            <div class="tri"></div>
                            <router-link class="list" :to="'/user/' + userInfo.userid +'/works'">
                                <i class="iconfont icon-personal"></i>
                                <span>My page</span>
                            </router-link>
                            <router-link class="list list-border" to="/history">
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
                            <router-link class="list list-border" :to="'/pin/'">
                                <i class="iconfont icon-pin"></i>
                                <span>Pin</span>
                            </router-link>
                            <!-- <router-link class="list list-border" :to="'/task/'">
                            <i class="iconfont icon-pin"></i>
                            <span>Task</span>
                        </router-link> -->
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
import apiUrl from '../assets/js/config/urlConfig.js';
import docCookies from '../static/tools/cookies.js';
export default {
  data() {
    const that = this;
    return {
      defaultAvatar:
        'this.src="' + require('../assets/images/vevue_logo_50x50.png') + '"',
      userInfo: '',
      showPersonPannel: false // 显示右上角个人面板
    };
  },
  mounted() {
    this.getUserInfo();
  },
  methods: {
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

.el-message {
    top: 0px !important;
}
.please-login{
    font-size:1.5rem!important;
}
.header-vue-component {
    background: #fff;
    height: 55px;
    overflow: hidden;

    .logoBox {
        width: 144px;

        img {
            width: 100%;
            min-height: 35px;
            display: block;
        }
    }

    .banner-right {
        display: flex;
        align-items: center;

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

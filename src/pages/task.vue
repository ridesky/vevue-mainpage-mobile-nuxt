<template>
    <div class="task-vue">
        <topHeaderDownload/>
        <ul class="tasks-ul">
            <li class="tasks-li" v-for="item in votelist" :key="item.voteid">
                <div class="general">
                    <img src="../assets/images/team.png" alt="vote">
                </div>
                <div class="vote-detail">
                    <div>{{item.name}}</div>
                    <div class="progress">
                        <div class="progress-note">{{item.hit_cur}} / {{item.hit_all}}</div>
                        <el-progress :show-text="false" :text-inside="true" :stroke-width="10" :percentage="( item.hit_cur/item.hit_all )*100">{{item.hit_cur}}/{{item.hit_all}}</el-progress>
                    </div>
                    <div class="vote-ps">
                        <div>{{jsFormat.formatTimeNoHour(new Date(item.expire*1000))}}</div>
                        <div class="hit_you" v-if="item.hit_you">
                            <img v-if="avatar" :src="apiUrl.avatarURL + avatar +'.jpg'" alt="">
                            <span>{{item.hit_you}}</span>
                        </div>
                    </div>
                </div>
                <div class="vote-status">
                    <el-button size="mini" v-if="item.status ==='Wait'" class="wait">Wait</el-button>
                    <el-button size="mini" type="primary" v-if="item.status ==='Vote'" class="Vote" @click="openVoteDialog(item)">Vote</el-button>
                </div>
            </li>
        </ul>
        <el-dialog title="Vote" :visible.sync="dialogVisible" width="60%" class="vote-dialog">
            <!-- <div class="flex">
                <el-select v-model="voteValue" size="small">
                    <el-option v-for="item in voteSelected.paylist" :key="item" :label="item" :value="item">
                    </el-option>
                </el-select>
                <el-button class="okbutton" type="primary" size="small" @click="dialogVisible = false">OK</el-button>
            </div> -->
            <div class="flex">
                <select v-model="voteValue">
                    <option v-for="item in voteSelected.paylist" :key="item" :label="item" :value="item">{{item}}</option>
                </select>
                <el-button size="mini" class="okbutton" @click="toVote">OK</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
import axios from 'axios';
import apiUrl from '../assets/js/config/urlConfig.js';
import docCookies from '../static/tools/cookies.js';
import totp from '../static/tools/totp.js';
import jsFormat from '../static/tools/jsFormat.js';
import topHeaderDownload from '../components/topHeaderDownload.vue';
let globalVotelist = null;
export default {
  name: 'task',
  layout: 'header',
  components: {
    topHeaderDownload
  },
  data() {
    return {
      apiUrl,
      jsFormat,
      voteSelected: {
        paylist: []
      },
      voteValue: '100',
      dialogVisible: false,
      avatar: process.client ? docCookies.getItem('avatar') : '',
      votelist: globalVotelist || []
    };
  },
  mounted() {
    window.vue = this;
    this.getBanlance();
  },
  beforeRouteLeave(to, from, next) {
    // ...
    globalVotelist = this.votelist || [];
    next();
  },
  methods: {
    toVote() {
      const that = this;
      that.dialogVisible = false;
      axios
        .post(apiUrl.vevueAPI + 'paytovote', {
          userid: docCookies.getItem('userid'),
          voteid: that.voteSelected.voteid,
          amount: that.voteValue,
          authcode: docCookies.getItem('userid')
            ? totp.getCode(docCookies.getItem('safekey'))
            : '',
          cid: docCookies.getItem('cid') || '',
          timestamp: Math.floor(new Date().getTime() / 1000)
        })
        .then(res => {
          if (res.data.errcode === 0) {
            this.$message({
              message: 'Success',
              type: 'success'
            });
          } else {
            this.$message({
              message: 'Wrong',
              type: 'error'
            });
          }
        });
    },
    openVoteDialog(item) {
      this.dialogVisible = true;
      this.voteSelected = item;
      this.voteValue = item.paylist[0];
    },
    getBanlance() {
      const that = this;
      axios
        .post(apiUrl.vevueAPI + 'balance', {
          userid: docCookies.getItem('userid'),
          simple: 0,
          version: 0.1,
          authcode: docCookies.getItem('userid')
            ? totp.getCode(docCookies.getItem('safekey'))
            : '',
          cid: docCookies.getItem('cid') || '',
          timestamp: Math.floor(new Date().getTime() / 1000)
        })
        .then(res => {
          if (res.data.errcode === 0) {
            that.votelist = res.data.votelist;
          }
        });
    }
  }
};
</script>
<style lang="stylus">
.task-vue {
    position: relative;
    background: #F5F5F5;
    min-height: 50vh;

    .tasks-ul {
        padding: 2rem 1rem;
    }

    .tasks-li {
        background: #fff;
        margin-bottom: 0.5rem;
        padding: 1rem;
        display: flex;
        justify-content: space-around;
        // flex-direction: column;
        align-items: center;
    }

    .general {
        img {
            width: 30px;
        }

        .name {
            font-size: 24px;
            color: #666;
        }
    }

    .vote-detail {
        height: 42px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .vote-ps {
        display: flex;
        justify-content: space-between;

        .hit_you {
            display: flex;
            align-items: center;

            img {
                width: 15px;
                border-radius: 50%;
                margin-right: 5px;
            }
        }
    }

    .progress {
        position: relative;
        width: 200px;
        color: #fff;

        // text-shadow: -1px -1px #000, -1px 1px #000, 1px -1px #000, 1px 1px #000;
        .progress-note {
            position: absolute;
            z-index: 2;
            top: 50%;
            left: 50%;
            transform: translateX(-50%) translateY(-50%);
        }

        .el-progress-bar__outer {
            border-radius: 0px !important;
            background: #c0c6c9;
        }

        .el-progress-bar__inner {
            border-radius: 0px !important;
        }
    }

    .vote-status {
        .wait {
            background: #ccc;
            color: #fff;
        }
    }

    .vote-dialog {
        .flex {
            text-align: center;
            display: flex;
            align-item: center;
            justify-content: space-between;

            .okbutton {
                // color: #80D441;
                font-family: Arial;
                margin-left: 5px;
            }
        }
    }
}
</style>


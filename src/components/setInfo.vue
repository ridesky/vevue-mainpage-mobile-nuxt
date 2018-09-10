<template>
  <no-ssr>
    <div class="setInfo">
      <div class="avatar-wrapper">
        <img class="user-avatar" v-if="userInfo.avatarid" :src="userInfo.avatar" alt="">
        <i v-else class="iconfont icon-personal avatar-uploader-icon"></i>
        <i v-if="AWSUploading" class="uploading">Uploading</i>
        <i v-else class="iconfont icon-photo avatar-uploader-icon" @click="toggleShowCrop"></i>
      </div>
      <div class="user-meta">
        <el-radio-group v-model="gender">
          <el-radio-button label="m">
            <i class="iconfont icon-male"></i>
          </el-radio-button>
          <el-radio-button label="f" class="female">
            <i class="iconfont icon-female"></i>
          </el-radio-button>
        </el-radio-group>
        <el-input placeholder="Nickname" v-model="userInfo.nickname">
        </el-input>
        <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4}" placeholder="Signature" v-model="userInfo.signature" :maxlength='100' resize='none'>
        </el-input>
        <el-button type="primary" class="save-button" :class="{f:gender ==='f'}" @click="updateAvatar">Save</el-button>
      </div>
      <!-- <my-upload url='' langType='en' :width='300' :height='300' :noSquare='false' :noRotate='true' @crop-success='cropPic' v-model="showCrop"></my-upload> -->
    </div>
  </no-ssr>
</template>
<script>
// import myUpload from './vue-image-crop-upload/upload-2.vue';
import axios from 'axios';
import apiUrl from '../assets/js/config/urlConfig.js';
import jsFormat from '../static/tools/jsFormat.js';
import totp from '../static/tools/totp.js';
import docCookies from '../static/tools/cookies.js';
import SparkMD5 from 'spark-md5';
import AWS from 'aws-sdk';
AWS.config.update({
  region: 'us-east-1',
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:64864bf3-8f6f-4c2b-b38e-56079efbca7e'
  })
});
const BUCKET = 'vevue-us';
export default {
  components: {
    // myUpload
  },
  data() {
    const result = {
      cookiesEnd: 604800, // cookies时间
      gender: '',
      towho: '',
      showCrop: false,
      AWSUploading: false,
      imageId: '',
      imageIdCache: '',
      maxRequestTimes: 5,
      defaultSignature: 'Hi Vevue!',
      userInfo: {
        nickname: '',
        signature: ''
      }
    };
    if (process.client) {
      result.gender = docCookies.getItem('gender') === 'f' ? 'f' : 'm';
      result.towho = docCookies.getItem('userid');
    }
    return result;
  },
  mounted() {
    if (process.client) {
      window.jsFormat = jsFormat;
      if (!docCookies.getItem('userid')) {
        // 没登录还进入设置界面则跳转登录页面
        location.href = '/login';
      }
      this.getUserInfo(0);
    }
  },
  methods: {
    getUserInfo(times) {
      const that = this;
      if (times >= 5) {
        return;
      }
      axios
        .post(apiUrl.vevueAPI + 'visitor', {
          userid: docCookies.getItem('userid') || '-',
          towho: that.towho,
          date: new Date().getTime(),
          authcode: totp.getCode(docCookies.getItem('safekey')),
          cid: docCookies.getItem('cid'),
          timestamp: Math.floor(new Date().getTime() / 1000)
        })
        .then(res => {
          if (res.data.errcode === 0) {
            let result = res.data.result;
            result.nickname = result.nickname;
            result.signature = result.signature;
            result.avatarid = result.avatar;
            result.avatar = apiUrl.avatarURL + result.avatar + '.jpg';
            result.cover = apiUrl.avatarURL + result.cover + '.jpg';
            that.userInfo = result;
            that.gender = result.gender;
          } else if (res.data.errcode === 110) {
            setTimeout(() => {
              that.getUserInfo(++times);
            }, 500);
          }
        });
    },
    cropPic(imageDataUrl, field) {
      let that = this;
      that.imageIdCache = SparkMD5.hash(
        docCookies.getItem('userid') + new Date().getTime()
      );
      this.userInfo.avatarid = this.userInfo.avatarid
        ? this.userInfo.avatarid
        : that.imageIdCache;
      this.userInfo.avatarCache = this.userInfo.avatar; // 缓存图片路径
      this.userInfo.avatar = imageDataUrl;
      this.toUploadAvatar();
    },
    toUploadAvatar() {
      let that = this;
      that.AWSUploading = true;
      let params = {
        Bucket: BUCKET,
        Key: 'avatar/' + this.imageIdCache + '.jpg',
        Body: jsFormat.dataURLtoBlob(this.userInfo.avatar),
        ContentType: 'image/jpeg',
        ACL: 'public-read'
      };
      let upload = new AWS.S3.ManagedUpload({ params: params });
      upload.send((err, data) => {
        if (err) {
          this.$message.error(err.message);
          that.imageId = that.userInfo.avatarid; // 如果上传到亚马逊云失败 则获取原来的avatar id
          that.AWSUploading = false;
        } else {
          that.imageId = that.imageIdCache; // 如果上传到亚马逊成功 则给imageId更新
          that.AWSUploading = false;
        }
      });
    },
    updateAvatar() {
      let that = this;
      if (!that.userInfo.nickname.trim()) {
        that.$message.error('Please enter your nickname.');
        return;
      }
      if (!that.userInfo.signature.trim()) {
        that.$message.error('Please enter the signature.');
        return;
      }
      axios
        .post(apiUrl.vevueAPI + 'avatarwork', {
          userid: docCookies.getItem('userid'),
          avatar: that.imageId || that.userInfo.avatarid,
          cid: docCookies.getItem('cid'),
          authcode: totp.getCode(docCookies.getItem('safekey')),
          timestamp: Math.floor(new Date().getTime() / 1000)
        })
        .then(res => {
          if (res.data.errcode === 0) {
            docCookies.setItem(
              'avatar',
              that.imageId || that.userInfo.avatarid,
              that.cookiesEnd,
              '/',
              null
            );
            that.updateCharactor();
          } else {
            that.$message.error('Upload failed, please try again.');
          }
        });
    },
    updateCharactor() {
      const that = this;
      // 不加处理
      // const nicknameReg = /^[\u4E00-\u9FA5A-Za-z0-9_]+$/;
      // if (!nicknameReg.test(that.userInfo.nickname)) {
      //   this.$message.error(
      //     'Nickname only accept letter, number and underscores'
      //   );
      //   return;
      // }
      axios
        .post(apiUrl.vevueAPI + 'charactor', {
          userid: docCookies.getItem('userid'),
          nickname: that.userInfo.nickname,
          clientid: '',
          gender: that.gender,
          signature: that.userInfo.signature,
          cid: docCookies.getItem('cid'),
          authcode: totp.getCode(docCookies.getItem('safekey')),
          timestamp: Math.floor(new Date().getTime() / 1000),
          language: ''
        })
        .then(res => {
          if (res.data.errcode === 0) {
            docCookies.setItem(
              'nickname',
              that.userInfo.nickname,
              that.cookiesEnd,
              '/',
              null
            );
            docCookies.setItem(
              'gender',
              that.gender,
              that.cookiesEnd,
              '/',
              null
            );
            this.$message({
              message: 'Saved successfully',
              type: 'success',
              duration: 5000
            });
            // location.href = '/';
          } else if (res.data.errcode === 294) {
            that.$message.error('The nickname is exist, please change.');
          } else {
            that.$message.error('Upload failed, please try again.');
          }
        })
        .catch(res => {
          this.$message.error(
            'The server encountered an error. Please try again later.'
          );
        });
    },
    toggleShowCrop() {
      let showCrop = this.showCrop;
      this.showCrop = !showCrop;
    }
  }
};
</script>
<style lang="stylus">
.setting-page {
  text-align: center;
}

.setInfo {
  .el-radio-button:focus:not(.is-focus):not(:active) {
    box-shadow: none !important;
  }

  text-align: center;
  width: 100%;
  padding: 0 15px;
  padding-top: 40px;
  background: #f5f5f5;
  position: relative;
  margin: auto !important;

  .vicp-preview-item {
    box-sizing: content-box;
  }

  .avatar-wrapper {
    // &:hover {
    //   .icon-photo {
    //     display: block !important;
    //   }
    // }

    position: relative;
    width: 150px;
    height: 150px;
    margin: 15px auto;
  }

  .avatar-uploader-icon, .uploading {
    cursor: pointer;
    border: 1px solid #d9d9d9;
    border-radius: 50%;
    display: inline-block;
    color: #8c939d;
    font-size: 16px;
    line-height: 150px;
    width: 150px;
    height: 150px;
    color: #fff;
    background: #d9d9d9;
    text-align: center;
  }

  .uploading {
    position: absolute;
    border: none;
    z-index: 2;
    top: 0px;
    left: 0px;
    opacity: 0.7;
    background-color: #333 !important;
  }

  .avatar-uploader-icon {
    line-height: 150px;
    font-size: 100px;

    &.icon-photo {
      border: none;
      display: none;
      position: absolute;
      z-index: 2;
      top: 0px;
      left: 0px;
      font-size: 30px !important;
      background-color: #333 !important;
      opacity: 0.7;
    }
  }

  .user-avatar {
    cursor: pointer;
    width: 150px;
    height: 150px;
    display: block;
    margin: auto;
    border-radius: 50%;
  }

  .user-meta {
    label, input {
      outline: none;
    }

    margin: 30px auto;

    .el-input input {
      display: block;
      font-family: 'Open Sans' !important;
      margin: 25px auto;
      height: 40px;
    }

    .el-textarea textarea {
      font-family: 'Open Sans' !important;
    }

    .female.is-active {
      .el-radio-button__inner {
        background-color: #f4b3c2;
        border-color: #f4b3c2;
        box-shadow: -1px 0 0 0 #f4b3c2;
      }
    }

    .save-button {
      margin: 20px auto;
      width: 100%;

      &.f {
        background-color: #F4B3C2;
        border-color: #F4B3C2;
      }
    }
  }
}
</style>

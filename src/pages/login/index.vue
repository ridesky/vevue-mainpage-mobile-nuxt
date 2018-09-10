<template>
    <div class="loginContent">
        <div class="countries_wrapper" v-show="countrySearchSwitch">
            <div class="shadow" @click="countrySearchSwitch = false"></div>
            <div class="countries_content">
                <div class="toggle">
                    <span class="iconfont icon-country"></span>
                    <span class="close iconfont icon-close" @click="countrySearchSwitch = false"></span>
                </div>
                <div class="country_select">
                    <div class="search-wrapper">
                        <i class="iconfont icon-magnifier"></i>
                        <input id="search-country" ref="searchCountry" type="text" class="search-country" placeholder="Search" @input="filterCountry" v-model="countrySearchKeyWord">
                    </div>
                    <ul class="countries_lists">
                        <li class="countries_list" v-for="(country,index) in countries" :key="index" v-show="country.hidden !== true" @click="selectCountryIndex(index)">
                            <span class="countryName">{{country.countryName}}</span>
                            <span class="phoneCode"> +{{country.phoneCode}}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="login-wrapper">
            <div class="login-content">
                <div class="register">
                    <img src="../../assets/images/logo-01.png" alt="Vevue" class="login-logo">
                    <div class="countryName" @click="countrySearchSwitchToggle">{{countries[countryIndex].countryName}}</div>
                    <div class="login-account">
                        <input type="text" class="phoneCodeInput phoneCode" v-model="inputPhoneCode" @input="filterCountryByPhoneCode">
                        <div class="login-account-container">
                            <input class="login-account-input login-input" v-model="phoneNumber" type="text" placeholder="Phone number" v-focus="accFocus" @focus="toHideAccErrMask">
                            <div class="errorMask" :class="{displaynone:hideAccErrMask}" @click="toHideAccErrMask">{{accErrMsg}}</div>
                        </div>
                    </div>
                    <div class="login-account border-bottom">
                        <input type="text" class="login-password-input login-input" v-model="vcode" :placeholder="loginMsg" :class="{red:loginErr}" @keyup.13='toLogin' @input="toHideLoginErrMsg" @focus="toHideLoginErrMsg">
                        <span class="send-msg" @click="sendCode(retry)" v-show="countDown<=0">Send SMS</span>
                        <span class="send-msg locked" v-show="sendLocked">Send SMS</span>
                        <span class="send-msg" v-show="countDown>0">{{countDown}}</span>
                    </div>
                    <div class="voice" v-show="retry === 'retry'">
                        <div class="sendVoice" v-show="countDown<=0" @click="sendCode('voice')">Send voice verify code</div>
                        <div class="sendVoice locked" v-show="sendLocked">Send voice verify code</div>
                        <!-- <span class="sendVoice" v-show="countDown>0">{{countDown}}</span> -->
                    </div>
                    <div class="login-button" @click="toLogin">Login</div>
                </div>
            </div>
            <a href="https://app.vevue.com/" class="appLinkButton">Download APP</a>
        </div>
    </div>
</template>
<script>
/* eslint-disable */
import axios from 'axios';
import apiUrl from '../../assets/js/config/urlConfig.js';
import countries from './countries.js';
import docCookies from '../../static/tools/cookies.js';
export default {
  /*   Vue.directive('clickoutside', {
  bind: function (el, binding, vnode) {
    function documentHandler(e) {
      console.log(e);
      console.log(el);
      console.log(binding);
      console.log(binding.expression);
      if (el.contains(e.target)) return false;
      if (binding.expression) {
        binding.value(e);
      }
    }
    document.addEventListener('click', documentHandler);
  }

}); */
  directives: {
    clickoutside: {
      bind: function(el, binding, vnode) {
        function documentHandler(e) {
          // console.log(e);
          // console.log(el);
          // console.log(binding);
          // console.log(binding.expression);
          if (el.contains(e.target)) return false;
          if (binding.expression) {
            binding.value(e);
          }
        }
        document.addEventListener('click', documentHandler);
      }
    },
    focus: {
      update: function(el, { value, oldValue }) {
        if (value && value !== oldValue) {
          el.focus();
        }
      }
    }
  },
  data() {
    let result = {
      apiUrl,
      inputPhoneCode: '',
      countrySearchSwitch: false,
      countrySearchKeyWord: '', // 国家搜索
      cookiesEnd: 604800, // cookies时间
      countryIndex: 0, // 初始国家
      countries: countries, // 获取国家列表
      phoneNumber: '', // 登录手机号码
      vcode: '', // 登录验证码
      accFocus: false, // 输入手机号的input 是否聚焦
      hideAccErrMask: true, // 是否隐藏 未输入手机号的提示
      loginErr: false, // 检测login是否失败
      accErrMsg: 'Phone number',
      loginMsg: 'SMS verification code',
      countDown: -1,
      sendLocked: false,
      retry: 'sms'
    };
    if (process.client) {
      Object.assign(result, {
        inputPhoneCode:
          '+' +
          countries[
            localStorage.getItem('countryIndex')
              ? parseInt(localStorage.getItem('countryIndex'))
              : 0
          ].phoneCode,
        countryIndex: localStorage.getItem('countryIndex')
          ? parseInt(localStorage.getItem('countryIndex'))
          : 0 // 初始国家
      });
    }
    return result;
  },
  watch: {
    countryIndex: {
      handler(value) {
        localStorage.setItem('countryIndex', value);
        // this.inputPhoneCode = '+' + countries[this.countryIndex].phoneCode;
      }
    }
  },
  mounted() {
    const that = this;
    axios.get('https://ipinfo.io').then(res => {
      const length = countries.length;
      for (let i = 0; i < length; i++) {
        if (countries[i].countryCode === res.data.country) {
          that.countryIndex = i;
          that.inputPhoneCode = '+' + countries[that.countryIndex].phoneCode;
          return;
        }
      }
    });
  },
  methods: {
    loginSuccessDefault() {
      window.location.href = '/';
    },
    countrySearchSwitchToggle() {
      this.countrySearchSwitch = true;
      this.$nextTick(function() {
        window.searchInput = document.querySelector('#search-country');
        document.querySelector('#search-country').focus();
      });
    },
    selectCountryIndex(index) {
      this.countryIndex = index;
      this.inputPhoneCode = '+' + countries[this.countryIndex].phoneCode;
      this.countrySearchSwitch = false;
    },
    closeSearchSwitch() {
      const that = this;
      if (that.countrySearchSwitch) that.countrySearchSwitch = false;
    },
    filterCountry() {
      // 搜索过滤国家
      const that = this;
      const length = countries.length;
      for (var i = 0; i < length; i++) {
        // console.log(keyword);
        if (that.countrySearchKeyWord.trim() === '') {
          countries[i].hidden = false;
        } else {
          countries[i].hidden = true;
          const countryValue = Object.values(countries[i]);
          const valuesLen = countryValue.length;
          for (let j = 0; j < valuesLen; j++) {
            // 遍历单个coutry中的value
            if (
              countryValue[j]
                .toString()
                .toLowerCase()
                .indexOf(
                  that.countrySearchKeyWord
                    .replace('+', '')
                    .trim()
                    .toLowerCase()
                ) !== -1
            ) {
              countries[i].hidden = false;
            }
          }
        }
      }
    },
    filterCountryByPhoneCode() {
      const that = this;
      const length = countries.length;
      for (let i = 0; i < length; i++) {
        if (that.inputPhoneCode.trim() === '') {
          that.countryIndex = countries.length - 1;
        } else {
          if (countries[i].phoneCode === that.inputPhoneCode.replace('+', '')) {
            that.countryIndex = i;
            return;
          }
        }
      }
      that.countryIndex = countries.length - 1;
    },
    GetQueryString(name) {
      let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
      let r = window.location.search.substr(1).match(reg);
      if (r != null) {
        return decodeURI(r[2]);
      }
    },
    toShowAccErrMask() {
      if (!this.phoneNumber) {
        this.accFocus = false;
        this.hideAccErrMask = false;
      }
    },
    toHideAccErrMask() {
      this.accErrMsg = 'Phone number';
      this.hideAccErrMask = true;
      this.accFocus = true;
    },
    toHideLoginErrMsg() {
      this.loginMsg = 'SMS verification code';
      this.loginErr = false;
    },
    sendCode(type) {
      const that = this;
      if (that.sendLocked) {
        return;
      }
      that.sendLocked = true; // 锁定发送验证码
      let apiUrl = that.apiUrl;
      if (!that.phoneNumber) {
        that.sendLocked = false; // 解锁发送验证码
        that.toShowAccErrMask();
        return;
      }
      if (!that.phoneNumber.match(/^[0-9]*$/)) {
        that.sendLocked = false; // 解锁发送验证码
        that.accErrMsg = 'Wrong mobile phone number';
        that.hideAccErrMask = false;
        return;
      }

      /**
       * @param (get) 发送验证码接口
       *  action = 'sms_send'
       *  phone = encodeURIComponent('+'@区号@手机号)
       */

      axios
        .post(apiUrl.vevueAPI + 'sms_send', {
          area: that.inputPhoneCode.replace('+', ''),
          type,
          phone: that.phoneNumber
        })
        .then(res => {
          that.sendLocked = false; // 解锁发送验证码
          if (res.data.errcode === 0) {
            that.countDown = 60;
            const CD = setInterval(setCountDown, 1000);
            function setCountDown() {
              if (that.countDown <= 0) {
                clearInterval(CD);
                that.retry = 'retry';
              }
              that.countDown--;
            }
          } else if (res.data.errcode === 206) {
            that.$message({
              showClose: true,
              message: 'Invalid phone number',
              iconClass: '',
              type: 'error'
            });
            // that.$message.error('Error[206]: Invalid phone number.');
          } else if (res.data.errcode === 201) {
            that.$message({
              showClose: true,
              message: 'Slow Down',
              iconClass: '',
              type: 'error'
            });
          } else {
            that.$message({
              showClose: true,
              message: 'Error [' + res.data.errcode + ']',
              iconClass: '',
              type: 'error'
            });
          }
        })
        .catch(res => {
          that.sendLocked = false; // 解锁发送验证码
        });
    },
    toLogin() {
      const that = this;
      let apiUrl = that.apiUrl;
      if (!that.vcode) {
        that.loginMsg = 'SMS verification code';
        that.loginErr = true;
        return;
      }
      /**
       * @param (get) 登录接口
       * action = 'sms_check'
       * phone = encodeURIComponent('+'@countryCode@phoneNumber)
       * vcode = encodeURICompoent(@vcode)
       * type = 'login'
       */
      axios
        .post(apiUrl.vevueAPI + 'sms_check', {
          area: that.countries[that.countryIndex].phoneCode,
          phone: that.phoneNumber,
          vcode: that.vcode,
          type: 'login'
        })
        .then(res => {
          if (res.data.errcode === 0) {
            let data = res.data.result;
            docCookies.setItem(
              'userid',
              data.userid,
              this.cookiesEnd,
              '/',
              null
            );
            docCookies.setItem('cid', data.cid, this.cookiesEnd, '/', null);
            docCookies.setItem(
              'safekey',
              data.safekey,
              this.cookiesEnd,
              '/',
              null
            );
            docCookies.setItem(
              'avatar',
              data.avatar,
              this.cookiesEnd,
              '/',
              null
            );
            docCookies.setItem(
              'nickname',
              data.nickname,
              this.cookiesEnd,
              '/',
              null
            );
            docCookies.setItem(
              'gender',
              data.gender,
              this.cookiesEnd,
              '/',
              null
            );
            if (that.GetQueryString('continue')) {
              location.href = decodeURIComponent(
                that.GetQueryString('continue')
              );
              return;
            }
            that.loginSuccessDefault(); // 执行成功回调
            // location.reload();
          } else {
            that.loginMsg = 'Wrong Code';
            that.loginErr = true;
            that.vcode = '';
          }
        })
        .catch(err => {
          console.log(err);
          that.loginMsg = 'some thing wrong';
        });
    }
  }
};
</script>
<style lang="stylus">
.el-message__icon {
    display: none !important;
}

.el-message--error {
    min-width: 0px !important;
    width: 312px;
}

.el-message__closeBtn {
    color: #f56c6c;
    border: solid 1px #f56c6c;
    border-radius: 50%;
    padding: 1px;
}

.countries_wrapper {
    position: absolute;
    top: 0px;
    left: 0px;
    bottom: 0px;
    right: 0px;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;

    .shadow {
        position: absolute;
        top: 0px;
        left: 0px;
        bottom: 0px;
        right: 0px;
        background: #000;
        opacity: 0.6;
        z-index: -1;
    }

    .countries_content {
        .toggle {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 15px;
            height: 40px;
            font-size: 16px;
            color: #fff;
            background: #F49143;

            .close {
                cursor: pointer;
            }
        }

        .country_select {
            padding-top: 10px;
            padding-bottom: 15px;

            .search-wrapper {
                padding: 0 10px;
                position: relative;

                .icon-magnifier {
                    font-size: 15px;
                    position: absolute;
                    color: #999;
                    left: 15px;
                    top: 6px;
                }

                .search-country {
                    outline: none;
                    margin-bottom: 10px;
                    border: solid 1px #ccc;
                    border-radius: 3px;
                    height: 30px;
                    width: 100%;
                    padding-left: 25px;
                }
            }
        }

        background: #fff;

        @media screen and (min-width: 768px) {
            width: 390px;
        }
    }

    .countries_lists {
        height: 280px;
        overflow-y: scroll;
        width: 100%;

        .countries_list {
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 32px;
            font-size: 14px;
            padding: 5px 12px;
            cursor: pointer;

            &:hover {
                background: #ccc;
            }

            .phoneCode {
                color: #999;
                font-size: 12px;
            }
        }
    }

    @media screen and (max-width: 400px) {
        padding: 0 10px;

        & .countries_content {
            width: 100%;
        }
    }
}

input::placeholder.red {
    color: red;
}

.login-homepage {
    width: 100%;
    height: 100vh;
    background-color: #fafafa;
    // background: url('../../pages/home/assets/images/AdobeStock_126970487_orange.png') no-repeat;
    background-size: cover;
}

.appLinkButton {
    font-family: 'Open Sans';
    background-color: #2BA4DF;
    margin-top: 20px;
    border-radius: 5px;
    color: #fff;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 36px;
}

.displaynone {
    display: none !important;
}

.split {
    width: 2px;
    height: 22px;
    margin: 15px 10px;
    background: #ebebeb;
}

.voice {
    position: relative;
    padding: 5px 0px;
}

.sendVoice {
    position: absolute;
    padding: 4px 0px;
    font-size: 12px;
    color: blue;
    text-decoration: underline;
    padding-top: 5px;
    cursor: pointer;

    &.locked {
        color: #ccc;
        background: #fff;
    }
}

.login-button {
    cursor: pointer;
    font-size: 14px;
    border-radius: 5px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    margin: 30px auto;
    background: orange;
}

.login-account-container {
    position: relative;
    width: 100%;
    border-bottom: solid 1px #ccc;
}

.errorMask {
    display: flex;
    align-items: center;
    position: absolute;
    left: 0px;
    top: 0px;
    color: #dc3545;
    height: 100%;
    font-size: 14px;
    background-color: #fff;
    min-width: 175px;
}

.wrong-msg {
    position: absolute;
    color: #f1403c;
    right: 0px;
    top: 50%;
    transform: translateY(-50%);
}

.send-msg {
    position: absolute;
    font-size: 14px;
    color: #F59233;
    right: 0px;
    top: 50%;
    text-align: center;
    transform: translateY(-50%);
    cursor: pointer;

    &.locked {
        color: #ccc;
        background: #fff;
    }
}

.countrySelect {
    float: left;
    width: 70px;
    background-color: #fff;
}

select {
    appearance: none;
    -moz-appearance: none;
    -webkit-appearance: none;
    border: none;
    outline: none;
}

select::-ms-expand {
    /* 清除ie上的样式 */
    display: none;
}

.register {
    position: relative;
    margin: auto;
    font-size: 14px;

    img {
        width: 80%;
        display: block;
        margin: 40px auto;
    }
}

.login-wrapper {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
}

.login-content {
    border: solid 1px #999;
    width: 310px;
    font-family: 'Open Sans';
    overflow: auto;
    margin: auto;
    padding: 25px 20px 0px;
    border-radius: 3px;
    background: #fff;

    .countryName {
        display: flex;
        cursor: pointer;
        align-items: center;
        height: 35px;
        padding-left: 3px;
        border-bottom: solid 1px #ccc;
    }
}

// @media screen and (max-width: 441px) {
// .login-content {
// height: 100vh;
// margin: 0px;
// width: 100%;
// }

// .register {
// margin: 0px;
// }
// }
@media screen and (min-width: 545px) {
    .login-content, .el-message--error {
        width: 420px;
    }
}

.login-account {
    &.border-bottom {
        border-bottom: solid 1px #ccc;
    }

    .phoneCodeInput {
        font-family: inherit;
        text-align: center;
        outline: none;
        border: none;
    }

    .phoneCode {
        display: flex;
        justify-content: center;
        align-items: center;
        border-bottom: solid 1px #ccc;
        margin-right: 10px;
        width: 50px;
        height: 48px;
    }

    .el-select {
        display: flex;

        &>.el-input {
            display: flex;
            align-items: center;

            .el-input__inner {
                border: none;
            }
        }
    }

    display: flex;
    position: relative;
    // border-bottom: solid #ccc 1px;
}

.login-input {
    border: none;
    outline: none;
    width: 100%;
    height: 48px;
    background: transparent;
}

.login-account-input {
    display: block;
    font-family: 'Open Sans';
    height: 100%;
    font-size: 14px;
}

.logoBox .icon-menu {
    font-size: 18px;
    color: #a0a0a0;
}

.logoBox {
    width: 230px;
    display: flex;
    align-items: center;
}
</style>

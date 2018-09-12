<template>
  <div class="pin-vue">
    <!-- <topHeaderDownload/> -->
    <topHeaderSearch :downloadBar='false'/>
    <div class="textFileWrapper" v-show="!taskMarker">
      <input type="text" id='searchTextField' class="controls searchTextField" placeholder="Search address">
    </div>
    <div class="taskswitch" v-show="showSwitch.taskswitch && !taskMarker" @click="showSwitch.taskListPannel = true">
      <img src="../../assets/images/task_plan_on.png" v-show="process && (process !== 'OK')" alt="Task">
      <img src="../../assets/images/task_plan_off.png" v-show="process ==='OK'" alt='Task'>
    </div>
    <el-dialog title="Map running Task" :visible.sync="showSwitch.taskListPannel" width="90%" class="task-wrapper">
      <ul class="task-ul" v-show="mapTasks.length >0">
        <li v-for="(item,index) in mapTasks" :key="index" @click="watchMylocation(map,item)">
          <i class="iconfont icon-target" v-show="!item.isdone">
          </i>
          <i class="iconfont icon-checkmark" v-show="item.isdone"></i>
          <span>{{item.name}}</span>
        </li>
      </ul>
      <div v-show="(!mapTasks.length)|| mapTasks.length === 0 ">No task point here</div>
    </el-dialog>
    <el-dialog :visible.sync="showSwitch.taskCompleteDialog">
      This task has been completed
    </el-dialog>
    <div id="pin-map" :class="{tasking:!!taskMarker}"></div>
    <transition name="slide-fade">
      <div class="request-pannel" v-show="showRequestPannel">
        <div class='foldborder line'></div>
        <div class="request-container">
          <div class="request-addressinfo">
            <div class="request-header">
              <h3>Send Request</h3>
              <!-- <i class="el-icon-close" @click="toEmptyRequest"></i> -->
            </div>
            <div class="locationcache">
              <i class='el-icon-location-outline'></i>
              <p class='locationnote'>
                {{locationAddressCache || ''}}
              </p>
            </div>
          </div>
          <div class="request-tofill" style='width:100%;'>
            <div class="requestset">
              <div class="setitem">
                <p class='item-head'>Describe</p>
                <p class='item-note'>{{requestObj.note}}</p>
                <i @click='showSwitch.describeDialog = true' class='iconfont icon-pencil'></i>
              </div>
              <div class="setitem">
                <p class='item-head'>
                  Who can respond
                </p>
                <p class="item-note">
                  {{requestObj.whocan.nickname || ''}}
                </p>
                <i @click='toShowWhocanDialog(true)' class='iconfont icon-pencil'></i>
              </div>
              <div class="setitem request-award">
                <p class='item-head'>
                  Bounty
                </p>
                <p class="item-note">
                  <!-- {{requestObj.whocan.nickname || ''}} -->
                </p>
                <div class="reward-select iconfont">
                  <select v-model="requestObj.rewardValue">
                    <option v-for="item in rewardRange" :key="item" :value="item" :label="item">{{item}}</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="request-opt">
              <el-button size='small' v-if="requestObj.requesting" type="primary" disabled>Request</el-button>
              <el-button size='small' v-else type="primary" @click="toRequest">Request</el-button>
              <el-button size='small' @click='toEmptyRequest'>Cancel</el-button>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <el-dialog title='Describe' width="70%" :visible.sync="showSwitch.describeDialog" class='describeDialog' :show-close='false'>
      <el-input v-model="requestSet.note" class="request-input" size="medium" placeholder="Describe what you would like to see">
      </el-input>
      <span slot="footer" class="dialog-footer">
        <el-button size='mini' @click="showSwitch.describeDialog = false; requestSet.note=requestObj.note?requestObj.note:'';">Cancel</el-button>
        <el-button size='mini' type="primary" @click="showSwitch.describeDialog = false; requestObj.note= requestSet.note">OK</el-button>
      </span>
    </el-dialog>
    <el-dialog :fullscreen="true" :show-close='false' title='following' :visible.sync="showSwitch.whocanDialog" class='describeDialog'>
      <div class='slot-title' slot="title">
        <div class='whocan-header'>
          <span class="el-dialog__title">Following</span>
          <i class='el-icon-close' @click="toShowWhocanDialog(false)"></i>
        </div>
        <el-input ref='searchinput' size='mini' @input="filterWhoCan" v-model="search.keyword" placeholder="" prefix-icon="el-icon-search">
          <i slot="suffix" class="el-input__icon el-icon-error" v-show="search.keyword.length >0" @click="search.keyword='';search.result = followerLists"></i>
        </el-input>
      </div>
      <div class="follower-vue">
        <div class="followLists">
          <div class="followerList anyone" @click='setWhoCan()'>
            <a>
              <!-- <i class='el-icon-circle-check'></i> -->
              <img src="../../static/images/message_right.png" alt="" :onerror='defaultAvatarLogo'>
            </a>
            <div class='flower-meta'>
              <p class="follower-nickname">Anyone</p>
            </div>
          </div>
          <div @click='setWhoCan(followerList)' v-for="(followerList,index) in search.result" :key="index" class="followerList">
            <!-- :to=" '/user/' + video.yuan.bywho" -->
            <a>
              <img :src="followerList.avatar" alt="" :onerror='defaultAvatarLogo'>
            </a>
            <div class="flower-meta">
              <p class="follower-nickname">{{followerList.nickname}}</p>
              <p class="follower-signature">{{followerList.signature}}</p>
            </div>
          </div>
          <div class="nomore" v-if="showNoMore">
            <i class="iconfont icon-nomore"></i>
            <p>No More</p>
          </div>
        </div>
      </div>
    </el-dialog>
    <transition name="slide-fade">
      <div class="task-pannel" v-show="showSwitch.taskPannel">
        <div id="pie" style="width: 80px; height: 80px;" v-show="!(currentTaskItem.status === 1)"></div>
        <div class="complete-flag" v-if="currentTaskItem.status === 1">
          <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
            <path class="checkmark__check" fill="none" d="M14.1 27.2l7 7.2 16.7-16.8" />
          </svg>
        </div>
        <div v-show="!currentTaskItem.status">Arrive at the location to achieve the task</div>
        <div v-show="currentTaskItem.status === 1 ">Congratulations on completing the task</div>
        <el-button class="endtaskbutton cancel" @click="clearMyTaskAndLocation" v-show="!currentTaskItem.status">Cancel</el-button>
        <el-button class="endtaskbutton complete" @click="clearMyTaskAndLocation" v-show="currentTaskItem.status === 1">Complete</el-button>
      </div>
    </transition>
  </div>
</template>
<script>
import axios from 'axios';
import apiUrl from '../../assets/js/config/urlConfig.js';
import docCookies from '../../static/tools/cookies.js';
import totp from '../../static/tools/totp.js';
import SparkMD5 from 'spark-md5';
import topHeaderDownload from '../../components/topHeaderDownload.vue';
import topHeaderSearch from '../../components/topHeaderSearch.vue';
export default {
  name: 'pin',
  layout: 'header',
  components: {
    topHeaderSearch,
    topHeaderDownload
  },
  data() {
    return {
      requestObj: {
        requesting: false,
        note: '',
        rewardValue: 2,
        whocan: {
          nickname: 'Anyone',
          uid: 0
        }
      }, //
      requestSet: {
        note: '',
        bounty: 2
      },
      search: {
        keyword: '',
        result: []
      },
      defaultAvatarLogo:
        'this.src="' +
        require('../../assets/images/vevue_logo_50x50.png') +
        '"',
      taskMarker: null, // 任务标记
      markerCluster: '',
      markersOfPin: '',
      mapTasks: [],
      process: '',
      currentTaskItem: {},
      showSwitch: {
        taskPannel: false, // 任务底部面板
        taskCompleteDialog: false, // 当前任务已完成 dialog 开关
        taskswitch: false, // 任务按钮开关
        taskListPannel: false, // 任务列表
        describeDialog: false, // 描述请求的dialog 开关
        whocanDialog: false,
        foldborder: 1
      },
      lastValidCenter: '',
      locationAddressCache: '',
      showRequestPannel: false,
      showNoMore: false,
      followerLists: [], // 关注的人列表
      rewardRange: [2, 3, 4, 5, 6, 7, 8, 9, 10, 50, 100],
      touchY: ''
    };
  },
  mounted() {
    (function() {
      if (!docCookies.getItem('safekey')) {
        location.href = '/login?continue=' + encodeURIComponent('/pin');
      }
    })();
    window.vue = this;
    document.body.addEventListener('touchmove', this.toPreventDefault, {
      passive: false
    });
    this.initMap();
    this.initRequestPannel();
    this.loadFollowers();
  },
  beforeRouteLeave(to, from, next) {
    // ...
    document.body.removeEventListener(
      'touchmove',
      this.toPreventDefault,
      false
    );
    this.$destroy(); // 销毁vue组件 目的是为了不缓存页面数据
    next();
  },
  methods: {
    toPreventDefault(e) {
      e.preventDefault();
    },
    toShowWhocanDialog(flag) {
      if (flag) {
        this.showSwitch.whocanDialog = true;
        document.body.removeEventListener(
          'touchmove',
          this.toPreventDefault,
          false
        );
      } else {
        this.showSwitch.whocanDialog = false;
        document.body.addEventListener('touchmove', this.toPreventDefault, {
          passive: false
        });
      }
    },
    loadFollowers() {
      // 读取关注/关注中的用户
      const that = this;
      this.scrollLock = true; // 触底锁定
      let params = {
        action: 'listoffollow',
        userid: docCookies.getItem('userid') || '-',
        towho: docCookies.getItem('userid'),
        type: 'following',
        cid: docCookies.getItem('cid') || ''
      };
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
          that.search.result = result;
          that.scrollLock = false; // 触底解锁
        } else {
        }
      });
    },
    setWhoCan(item) {
      if (item) {
        this.requestObj.whocan = item;
      } else {
        this.requestObj.whocan = {
          nickname: 'Anyone',
          uid: 0
        };
      }
      this.showSwitch.whocanDialog = false;
      document.body.addEventListener('touchmove', this.toPreventDefault, {
        passive: false
      });
    },
    filterWhoCan() {
      if (this.search.keyword.trim()) {
        let resultCache = null;
        resultCache = this.followerLists.filter(item => {
          return item.nickname.indexOf(this.search.keyword) >= 0;
        });
        this.search.result = resultCache;
      } else {
        this.search.result = this.followerLists;
      }
    },
    toRequest() {
      const that = this;
      if (!this.requestObj.note.trim()) {
        that.$message({
          message: 'Please fill in the description',
          type: 'warning'
        });
        return null;
      } else {
        this.requestObj.requesting = true;
        axios
          .post(apiUrl.vevueAPI + 'request', {
            userid: docCookies.getItem('userid') || '-',
            location: this.requestObj.locationParam,
            note: this.requestObj.note,
            targetuid: this.requestObj.whocan.uid,
            amount: this.requestObj.rewardValue,
            unitlock: SparkMD5.hash(
              docCookies.getItem('userid') +
                this.requestObj.note +
                this.requestObj.locationParam
            ),
            authcode: docCookies.getItem('userid')
              ? totp.getCode(docCookies.getItem('safekey'))
              : '',
            cid: docCookies.getItem('cid') || '',
            timestamp: Math.floor(new Date().getTime() / 1000)
          })
          .then(res => {
            this.requestObj.requesting = false;
            if (res.data.errcode === 0) {
              this.$message({
                message: 'Requested successfully',
                duration: 1200,
                type: 'success'
              });
              // this.requestObj;
              let marker = new google.maps.Marker({
                position: {
                  lat: +that.requestObj.locationParam.split(',')[0],
                  lng: +that.requestObj.locationParam.split(',')[1]
                },
                map: that.map,
                // animation: google.maps.Animation.BOUNCE,
                icon: {
                  url: require('../../assets/images/logo_coin_100.png'),
                  scaledSize: new google.maps.Size(20, 20)
                }
              });
              const note = that.requestObj.note;
              marker.addListener('click', function() {
                that.marker.setPosition(null);
                that.showRequestPannel = false;
                that.infowindow.setContent(
                  note +
                    `<br/><p style='font-size:10px; color:#b4b4b4'>Download <a href = "http://app.vevue.com/" style='color:blue;'>Vevue App</a> and upload video to respond to this request</p>`
                );
                that.infowindow.open(that.map, marker);
              });
              // this.showRequestPannel = false;
              this.toEmptyRequest();
              Object.assign(this.requestObj, {
                note: '',
                locationParam: '',
                rewardValue: 2
              });
              this.requestSet.note = '';
              this.infowindow.close();
              this.marker.setPosition(null);
            } else {
              this.$message.error(res.data.result.message || 'Unknown error.');
            }
          })
          .catch(err => {
            this.requestObj.requesting = false;
            this.$message({
              message: err,
              duration: 1200,
              type: 'error'
            });
          });
      }
    },
    toEmptyRequest() {
      const that = this;
      that.marker.setPosition(null);
      that.infowindow.close();
      that.locationAddressCache = '';
      that.showRequestPannel = false;
      const requestPannelDom = document.querySelector('.request-pannel');
      const requestAddressInfo = document.querySelector('.request-addressinfo');
      requestPannelDom.style.opacity = 0;
      requestPannelDom.style.height =
        requestAddressInfo.getBoundingClientRect().height + 'px';
      Object.assign(that.requestObj, {
        locationParam: '',
        note: '',
        rewardValue: 2
      });
    },
    async initMap() {
      const that = this;
      const uluru = { lat: 39.83, lng: -101.785 };
      that.map = new google.maps.Map(document.getElementById('pin-map'), {
        zoom: 4,
        // center: uluru,
        // clickableIcons: false,
        minZoom: 2,
        fullscreenControl: false,
        zoomControl: false,
        mapTypeControl: false,
        streetViewControl: false
      });
      that.infowindow = new google.maps.InfoWindow();
      that.geocoder = new google.maps.Geocoder();
      const geocoder = that.geocoder;
      const map = that.map;
      that.marker = new google.maps.Marker({
        map: map,
        icon: {
          url:
            'https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2_hdpi.png',
          scaledSize: new google.maps.Size(20, 30) // scaled size
        }
      });
      that.locationMarker = new google.maps.Marker({
        map: map,
        icon: {
          url: require('../../static/images/location.png'),
          scaledSize: new google.maps.Size(30, 30), // scaled size
          origin: new google.maps.Point(0, 0), // origin
          anchor: new google.maps.Point(0, 0) // anchor
        }
      });
      if (navigator.geolocation) {
        // !!! 记得修改回来
        // map.setCenter(uluru);
        that.locationPlace(map, that.locationMarker);
      } else {
        map.setCenter(uluru);
      }
      let centerControlDiv = document.createElement('div');
      let centerControl = that.CenterControl(centerControlDiv, that.map);
      centerControlDiv.index = 1;
      map.controls[google.maps.ControlPosition.RIGHT_TOP].push(
        centerControlDiv
      );
      let marker = that.marker;
      // map.addListener('dragstart', function() {
      //   that.mapDraging = true;
      // });
      // map.addListener('dragend', function() {
      //   that.mapDraging = false;
      // });
      google.maps.event.addDomListener(map, 'center_changed', function() {
        clearTimeout(that.timeOutRequest);
        that.checkBounds(map);
      });
      google.maps.event.addListener(
        map,
        'mousedown',
        function(e) {
          clearTimeout(that.timeOutRequest);
          if (that.taskMarker) return; // 如果任务已经开启 则不显示 request
          that.timeOutRequest = setTimeout(() => {
            that.infowindow.close();
            that.geocodeLatLng(
              geocoder,
              null,
              {
                lat: e.latLng.lat(),
                lng: e.latLng.lng()
              },
              marker
            );
            marker.setPosition(e.latLng); // 标记移到鼠标点击的地方
          }, 800);
        },
        false
      );
      google.maps.event.addListener(map, 'mouseup', function() {
        clearTimeout(that.timeOutRequest); // 取消 reqeust 长按事件
      });
      const input = document.getElementById('searchTextField');
      that.autocomplete = new google.maps.places.Autocomplete(input);
      that.autocomplete.addListener('place_changed', function() {
        let place = this.getPlace();
        map.panTo(place.geometry.location);
        map.setZoom(15);
        marker.setPosition(place.geometry.location);
        that.geocodeLatLng(
          geocoder,
          null,
          {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          },
          marker
        );
      });
      let listPin = await axios.post(apiUrl.vevueAPI + 'listofpin', {
        userid: docCookies.getItem('userid') || '-'
      });
      listPin = listPin.data.result;
      that.markersOfPin = listPin.map((item, i) => {
        let marker = new google.maps.Marker({
          position: {
            lat: +item.location.split(',')[0],
            lng: +item.location.split(',')[1]
          },
          // animation: google.maps.Animation.BOUNCE,
          icon: {
            url: require('../../assets/images/logo_coin_100.png'),
            scaledSize: new google.maps.Size(20, 20)
          }
        });
        marker.addListener('click', function() {
          that.marker.setPosition(null);
          that.showRequestPannel = false;
          that.infowindow.setContent(
            item.note +
              `<br/><p style='font-size:10px; color:#b4b4b4'>Download <a href = "http://app.vevue.com/" style='color:blue;'>Vevue App</a> and upload video to respond to this request</p>`
          );
          that.infowindow.open(that.map, marker);
        });
        return marker;
      });
      that.markerCluster = new MarkerClusterer(that.map, that.markersOfPin, {
        // imagePath: '../../../../../static/images/m',
        ignoreHidden: true,
        styles: [
          {
            url: '/images/m1.png',
            width: 53,
            height: 53,
            fontFamily: 'comic sans ms',
            textSize: 12,
            textColor: '#fff'
          },
          {
            url: '/images/m2.png',
            width: 53,
            height: 53,
            fontFamily: 'comic sans ms',
            textSize: 12,
            textColor: '#fff'
          },
          {
            url: '/images/m3.png',
            width: 53,
            height: 53,
            fontFamily: 'comic sans ms',
            textSize: 12,
            textColor: '#fff'
          },
          {
            url: '/images/m3.png',
            width: 53,
            height: 53,
            fontFamily: 'comic sans ms',
            textSize: 12,
            textColor: '#fff'
          },
          {
            url: '/images/m3.png',
            width: 53,
            height: 53,
            fontFamily: 'comic sans ms',
            textSize: 12,
            textColor: '#fff'
          }
        ]
      });
      that.markerCluster.addListener(
        'clusterclick',
        function(cluster) {},
        false
      );
    },
    hideMarkers() {
      const that = this;
      for (let i in that.markersOfPin) {
        that.markersOfPin[i].setMap(null);
      }
      that.markerCluster.clearMarkers();
    },
    showMarkers() {
      const that = this;
      for (let i in that.markersOfPin) {
        that.markersOfPin[i].setMap(that.map);
      }
      that.markerCluster.addMarkers(that.markersOfPin);
    },
    checkBounds(map) {
      const that = this;
      const LAT_RANGE = 75;
      var allowedBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(-LAT_RANGE, -180),
        new google.maps.LatLng(LAT_RANGE, 180)
      );
      if (allowedBounds.contains(map.getCenter())) {
        // still within valid bounds, so save the last valid position
        that.lastValidCenter = map.getCenter();
        return;
      }
      // not valid anymore => return to last valid position
      map.panTo(that.lastValidCenter);
    },
    geocodeLatLng(geocoder, infowindow, lat, marker) {
      // 反向地理编码
      let that = this;
      that.requestObj.locationParam = lat.lat + ',' + lat.lng;
      geocoder.geocode({ location: lat }, (results, status) => {
        if (results[0]) {
          that.locationAddressCache = results[0].formatted_address;
        } else {
          that.locationAddressCache = '';
        }
        that.infowindow.open(that.map, marker);
        that.infowindow.setContent(that.locationAddressCache);
      });
      const requestPannelDom = document.querySelector('.request-pannel');
      requestPannelDom.style.opacity = 1;
      that.showRequestPannel = true;
    },
    CenterControl(controlDiv, map) {
      const that = this;
      // Set CSS for the control border.
      var controlUI = document.createElement('div');
      controlUI.style.backgroundColor = '#fff';
      controlUI.style.border = '2px solid #fff';
      controlUI.style.borderRadius = '3px';
      controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
      controlUI.style.cursor = 'pointer';
      controlUI.style.marginTop = '16px';
      controlUI.style.marginRight = '8px';
      controlUI.style.textAlign = 'center';
      controlUI.title = 'Click to location';
      controlDiv.appendChild(controlUI);

      // Set CSS for the control interior.
      var controlText = document.createElement('i');
      controlText.classList.add('el-icon-location');
      controlText.style.fontSize = '16px';
      controlText.style.lineHeight = '25px';
      controlText.style.paddingLeft = '5px';
      controlText.style.paddingRight = '5px';
      controlUI.appendChild(controlText);

      controlUI.addEventListener('click', function() {
        // map.setCenter(chicago);
        that.locationPlace(map, that.locationMarker);
      });
    },
    locationPlace(map, marker) {
      const that = this;
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          var latlng = new google.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
          );
          that.myLocation = latlng;
          marker.setPosition(latlng);
          map.setZoom(13);
          map.setCenter(latlng);
          that.showSwitch.taskswitch = true;
          that.getMyTask(
            map,
            position.coords.latitude,
            position.coords.longitude
          );
          that.watchMyPoint = navigator.geolocation.watchPosition(pos => {
            const crd = pos.coords;
            that.myLocation = new google.maps.LatLng(
              crd.latitude,
              crd.longitude
            );
            marker.setPosition(that.myLocation);
          });
        });
      }
    },
    getMyTask(map, lat, lng) {
      const that = this;
      axios
        .post(apiUrl.vevueAPI + 'taskbox', {
          isupdate: false,
          detail: JSON.stringify({
            lat: lat,
            lng: lng,
            name: 'MapRunner'
          }),
          userid: docCookies.getItem('userid'),
          cid: docCookies.getItem('cid'),
          authcode: totp.getCode(docCookies.getItem('safekey')),
          timestamp: Math.floor(new Date().getTime() / 1000)
        })
        .then(res => {
          if (res.data.errcode === 0) {
            that.mapTasks = res.data.list;
            that.process = res.data.process;
          } else {
          }
        });
    },
    watchMylocation(map, item) {
      const that = this;
      if (item.isdone) {
        that.$message({
          message: 'This task has been completed',
          duration: 1200,
          type: 'success'
        });
        return;
      }
      map.setOptions({
        clickableIcons: false
      });
      that.toEmptyRequest(); // 清空request
      that.hideMarkers();
      that.showSwitch.taskPannel = true;
      const latlng = new google.maps.LatLng(+item.lat, +item.lng);
      that.showSwitch.taskListPannel = false;
      if (that.taskMarker) {
        that.taskMarker.setPosition(latlng);
      } else {
        that.taskMarker = new google.maps.Marker({
          map: map,
          icon: {
            url: require('../../static/images/target.png'),
            scaledSize: new google.maps.Size(20, 20)
          }
        });
        that.taskMarker.setPosition(latlng);
      }
      map.setCenter(latlng);
      that.currentTaskItem = {
        status: 0,
        position: latlng,
        item: item
      };
      const pieEle = document.getElementById('pie');
      that.myChart = echarts.init(pieEle);
      if (that.myLocation) {
        const initDistance = google.maps.geometry.spherical.computeDistanceBetween(
          that.currentTaskItem.position,
          that.myLocation
        );
        that.currentTaskItem.initDistance = initDistance;
        that.getTaskItemDistance(
          that.myLocation,
          that.currentTaskItem.position
        );
      } else {
        navigator.geolocation.getCurrentPosition(pos => {
          const crd = pos.coords;
          const initDistance = google.maps.geometry.spherical.computeDistanceBetween(
            that.currentTaskItem.position,
            new google.maps.LatLng(crd.latitude, crd.longitude)
          );
          that.currentTaskItem.initDistance = initDistance;
        });
      }
      that.loopSubmitMyLocation(); // 开始计时
      that.watchGeo = navigator.geolocation.watchPosition(pos => {
        const crd = pos.coords;
        that.myLocation = new google.maps.LatLng(crd.latitude, crd.longitude);
        that.getTaskItemDistance(
          that.myLocation,
          that.currentTaskItem.position
        );
      });
    },
    loopSubmitMyLocation() {
      const that = this;
      clearInterval(that.loopSubmitLocation);
      that.loopSubmitLocation = setInterval(() => {
        axios.post(apiUrl.vevueAPI + 'taskbox', {
          isupdate: true,
          detail: JSON.stringify({
            mapid: that.currentTaskItem.item.mapid,
            distance_total: that.currentTaskItem.initDistance,
            distance_cur:
              that.currentTaskItem.initDistance -
              (that.currentTaskItem.distance > that.currentTaskItem.initDistance
                ? that.currentTaskItem.initDistance
                : that.currentTaskItem.distance),
            lat: that.myLocation.lat(),
            lng: that.myLocation.lng(),
            name: 'MapRunner'
          }),
          userid: docCookies.getItem('userid'),
          cid: docCookies.getItem('cid'),
          authcode: totp.getCode(docCookies.getItem('safekey')),
          timestamp: Math.floor(new Date().getTime() / 1000)
        });
      }, 10000);
    },
    getTaskItemDistance(current, target) {
      const that = this;
      const distance = google.maps.geometry.spherical.computeDistanceBetween(
        current,
        target
      );
      that.currentTaskItem.distance = Math.floor(distance);
      // that.currentTaskItem.myLat = current.lat();
      // that.currentTaskItem.myLng = current.lng();
      // !!! 模拟完成方法 记得删除
      // that.completeMyTask();
      if (that.currentTaskItem.distance <= 100) {
        that.completeMyTask(current);
      }
      const option = {
        series: [
          {
            name: '访问来源',
            type: 'pie',
            clickable: false,
            legendHoverLink: false,
            hoverAnimation: false,
            avoidLabelOverlap: false,
            radius: ['60%', '70%'],
            // center: ['50%', '60%'],
            data: [
              {
                value:
                  that.currentTaskItem.initDistance -
                    that.currentTaskItem.distance || 0,
                name: that.currentTaskItem.distance,
                label: {
                  normal: {
                    show: true,
                    formatter: that.currentTaskItem.distance + 'M',
                    position: 'center',
                    color: '#000'
                  },
                  emphasis: {
                    show: true
                  }
                }
              },
              {
                value: that.currentTaskItem.distance,
                name: '',
                label: {
                  show: false
                }
              }
            ],
            labelLine: {
              normal: {
                show: false
              }
            },
            color: ['#38b48b', '#ccc']
          }
        ],
        textStyle: {
          color: '#000'
        }
      };
      that.myChart.setOption(option);
    },
    completeMyTask(current) {
      const that = this;
      clearInterval(that.loopSubmitLocation);
      navigator.geolocation.clearWatch(that.watchGeo); // 停止跟踪GPS信息
      axios
        .post(apiUrl.vevueAPI + 'taskbox', {
          isupdate: true,
          detail: JSON.stringify({
            mapid: that.currentTaskItem.item.mapid,
            distance_total: that.currentTaskItem.initDistance,
            distance_cur:
              that.currentTaskItem.initDistance -
              (that.currentTaskItem.distance > that.currentTaskItem.initDistance
                ? that.currentTaskItem.initDistance
                : that.currentTaskItem.distance),
            lat: current.lat(),
            lng: current.lng(),
            name: 'MapRunner'
          }),
          userid: docCookies.getItem('userid'),
          cid: docCookies.getItem('cid'),
          authcode: totp.getCode(docCookies.getItem('safekey')),
          timestamp: Math.floor(new Date().getTime() / 1000)
        })
        .then(res => {
          if (res.data.errcode === 0) {
            that.currentTaskItem.status = 1;
            that.currentTaskItem.item.isdone = true;
          }
        })
        .catch(() => {
          that.currentTaskItem.status = 1;
          that.currentTaskItem.item.isdone = true;
        });
    },
    clearMyTaskAndLocation() {
      const that = this;
      that.map.setOptions({
        clickableIcons: true
      });
      clearInterval(that.loopSubmitLocation); // 停止检测追踪
      that.showMarkers(); // 恢复周围的请求标记
      that.showSwitch.taskPannel = false;
      setTimeout(() => {
        that.currentTaskItem = {};
      }, 1000);
      that.taskMarker.setPosition(null);
      that.taskMarker = null; // 清空任务标记
      navigator.geolocation.clearWatch(that.watchGeo); // 停止跟踪GPS信息
    },
    initRequestPannel() {
      let requestPannelDom = document.querySelector('.request-pannel');
      let requestContainerDom = document.querySelector('.request-container');
      let requestAddressInfo = document.querySelector('.request-addressinfo');
      let requestToFillDom = document.querySelector('.request-tofill');

      requestPannelDom.addEventListener('touchstart', e => {
        this.touchY = e.touches[0].clientY;
      });
      requestPannelDom.addEventListener('touchmove', e => {
        // e.stopPropagation();
        if (e.touches[0].clientY >= this.touchY) {
          // 下滑
          this.slideStatus = 'down';
          requestPannelDom.style.height =
            requestPannelDom.getBoundingClientRect().height -
            (e.touches[0].clientY - this.touchY) +
            'px';
        } else {
          // 上滑
          this.slideStatus = 'up';
          if (
            requestPannelDom.getBoundingClientRect().height >=
            requestContainerDom.getBoundingClientRect().height
          ) {
            return;
          }
          requestPannelDom.style.height =
            requestPannelDom.getBoundingClientRect().height +
            (this.touchY - e.touches[0].clientY) +
            'px';
        }
        this.touchY = e.touches[0].clientY;
      });
      requestPannelDom.addEventListener('touchend', e => {
        if (this.slideStatus === 'down') {
          if (
            requestPannelDom.getBoundingClientRect().height +
              requestAddressInfo.getBoundingClientRect().height / 2 <
            requestAddressInfo.getBoundingClientRect().height
          ) {
            this.toEmptyRequest();
            requestPannelDom.style.opacity = 0;
          }
          //---------
          requestPannelDom.style.height =
            requestAddressInfo.getBoundingClientRect().height + 'px';
          //-----------
        } else {
          requestPannelDom.style.height =
            requestContainerDom.getBoundingClientRect().height + 'px';
        }
      });
    }
  }
};
</script>
<style lang="stylus">
.pin-vue {
  .textFileWrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 40px;
    background: #ccc;
    border: solid 5px #ccc;
    position: relative;
    z-index: 2;
  }

  .complete-flag {
    display: flex;
    width: 80px;
    height: 80px;
    padding: 15px;

    .checkmark__circle {
      transform: rotate(-90deg);
      transform-origin: center;
      stroke-dasharray: 166;
      stroke-dashoffset: 166;
      stroke-width: 2;
      stroke-miterlimit: 10;
      stroke: #1296db;
      fill: none;
      animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
    }

    .checkmark {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: block;
      stroke-width: 2;
      stroke: #1296db;
      margin: auto;
      box-shadow: inset 0px 0px 0px #1296db;
    }

    .checkmark__check {
      transform-origin: 50% 50%;
      stroke-dasharray: 48;
      stroke-dashoffset: 48;
      animation: stroke 0.4s cubic-bezier(0.65, 0, 0.45, 1) 0.6s forwards;
    }

    @keyframes stroke {
      100% {
        stroke-dashoffset: 0;
      }
    }

    @keyframes scale {
      0%, 100% {
        transform: none;
      }

      50% {
        transform: scale3d(1.1, 1.1, 1);
      }
    }
  }

  .searchTextField {
    width: 100%;
    height: 100%;
    padding: 10px;
    border: 0px;
    border-radius: 4px;
    outline: none;
  }

  .taskswitch {
    position: absolute;
    top: 115px;
    left: 10px;
    z-index: 1;
    width: 25px;
    height: 25px;

    img {
      display: block;
      width: 100%;
      height: 100%;
    }
  }

  .task-wrapper {
    .el-dialog__body {
      padding-top: 0px;
    }
  }

  .task-ul {
    &>li {
      display: flex;
      // margin: 8px auto;
      padding: 18px 0px;
      border-bottom: solid 1px #aaa;

      .iconfont {
        display: flex;
        align-items: center;
      }

      .icon-target {
        color: #f56c6c;
        margin-right: 10px;
      }

      .icon-checkmark {
        color: #1296DB;
        margin-right: 10px;
      }
    }
  }

  #pin-map {
    position: absolute !important;
    width: 100%;
    top: 95px;
    bottom: 0px;

    &.tasking {
      top: 55px;
    }
  }

  .slide-fade-enter-active {
    transition: all 0.3s ease;
  }

  .slide-fade-leave-active {
    transition: all 0.5s;
  }

  .slide-fade-enter, .slide-fade-leave-to {
    transform: translateY(20px);
    opacity: 0;
  }

  .task-pannel {
    display: flex;
    align-items: center;
    justify-content: space-around;
    position: absolute;
    padding: 10px;
    width: 100%;
    bottom: 0px;
    background: #fff;
  }

  .endtaskbutton {
    width: 90px;
    display: flex;
    justify-content: center;

    span {
      display: inline-block;
      width: 60px;
    }

    &.cancel {
      color: #fff;
      border-color: #f56c6c;
      background: #f56c6c;
    }

    &.complete {
      color: #fff;
      border-color: #1296db;
      background: #1296db;
    }
  }

  .request-pannel {
    position: absolute;
    width: 100%;
    bottom: 0px;
    height: 65px;
    overflow: hidden;
    // height: 131px;
    // z-index: 200;
    background: #fff;

    .foldborder {
      position: absolute;
      top: 4px;
      left: 50%;
      transform: translateX(-50%);

      &.line {
        width: 24px;
        height: 4px;
        border-radius: 2px;
        background: #ccc;
      }
    }

    .request-container {
      padding: 0 10px 10px;
    }

    .request-addressinfo {
      height: 65px;
      padding-top: 10px;
      padding-bottom: 10px;

      .request-header {
        font-size: 1.5rem;

        .el-icon-close {
          font-size: 1.6rem;
        }

        h3 {
          color: #409EFF;
        }

        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .locationcache {
        font-size: 1.3rem;
        display: flex;
        padding-top: 4px;
        align-items: center;

        .locationnote {
          flex: 1;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .el-icon-location-outline {
          // color: #409EFF;
        }
      }
    }

    .request-input {
      margin: 10px 0px;
    }

    .request-opt {
      padding-top: 10px;
      display: flex;
      justify-content: space-around;
      align-items: center;

      .el-button--small {
        padding: 0.9rem 4.6rem;
      }

      button {
        border-radius: 14px !important;
      }
    }

    .request-award {
      display: flex;
      justify-content: center;
      align-items: center;

      .reward-note {
        display: flex;
        align-items: center;
        font-size: 1.4rem;
        margin-right: 10px;

        img {
          width: 20px;
          height: 20px;
          margin-right: 2px;
        }
      }

      .reward-select {
        width: 80px;
        height: 25px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-radius: 5px;
        box-shadow: 0 0 5px #ccc;
        position: relative;

        &:after {
          content: '\e623';
          position: absolute;
          right: 10px;
          font-size: 1.6rem;
        }

        select {
          background: #fff !important;
          border: none;
          // 清除select聚焦时候的边框颜色
          outline: none;
          // 将select的宽高等于div的宽高
          width: 100%;
          // 隐藏select的下拉图标
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          padding-left: 10px;
        }
      }
    }

    .requestset {
      .setitem {
        display: flex;
        justify-content: space-between;
        font-size: 1.5rem;
        padding: 8px 0px;

        .item-head {
          font-weight: bold;
        }

        .item-note {
          flex: 1;
          padding-left: 5px;
        }
      }
    }
  }
}

.describeDialog {
  .el-dialog__header {
    // display:none;
  }

  .el-dialog__body {
    padding: 10px;
  }

  .slot-title {
    position: fixed;
    top: 0px;
    width: 100%;
    left: 0px;
    padding: 10px;
    z-index: 1;
    background: #fff;

    .whocan-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 10px;

      .el-icon-close {
        font-size: 1.6rem;
      }
    }
  }
}

.follower-vue {
  position: relative;
  min-height: 100vh;
  background: #fff;
  padding-top: 30px;

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
    .anyone {
      max-height: 91px;

      .follower-nickname {
        // flex:1;
        // text-align:center;
      }
    }

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

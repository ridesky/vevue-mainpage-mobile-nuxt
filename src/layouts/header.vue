<template>
  <div>
    <nuxt keep-alive />
    <script src="//maps.googleapis.com/maps/api/js?key=AIzaSyD6Zh2AjPRc9CN7qMLKUxAHxBw_M57RbwU&libraries=places,geometry"></script>
    <script src="//developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js"></script>
    <script src="//cdn.bootcss.com/Swiper/4.1.6/js/swiper.min.js"></script>
    <script src="//vjs.zencdn.net/7.0/video.min.js"></script>
    <script src="//cdn.jsdelivr.net/npm/danmaku@1.3.5/dist/danmaku.js"></script>
    <script src="//storage.googleapis.com/vrview/2.0/build/vrview.min.js"></script>
    <script src="//cdn.bootcss.com/echarts/4.1.0.rc2/echarts-en.min.js"></script>
  </div>
</template>
<script>
import Vue from 'vue';
Vue.directive('clickoutside', {
  bind: function(el, binding, vnode) {
    function documentHandler(e) {
      /* console.log(el);
      console.log(e.target); */
      if (el.contains(e.target)) return false;
      if (binding.expression) {
        binding.value(e);
      }
    }
    document.addEventListener('click', documentHandler);
  }
});
export default {
  head() {
    return {
      link: [
        {
          rel: 'stylesheet',
          href: '//cdn.bootcss.com/Swiper/4.1.6/css/swiper.min.css'
        }
      ]
    };
  },
  data() {
    return {
      showSwitch: {
        downloadBar: true
      }
    };
  }
  // head() {
  //   return {
  //     script: [
  //       {
  //         src:
  //           '//maps.googleapis.com/maps/api/js?key=AIzaSyD6Zh2AjPRc9CN7qMLKUxAHxBw_M57RbwU&libraries=places,geometry'
  //       },
  //       {
  //         src:
  //           '//developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js'
  //       },
  //       {
  //         src: '//cdn.bootcss.com/Swiper/4.1.6/js/swiper.min.js'
  //       },
  //       {
  //         src: '//vjs.zencdn.net/7.0/video.min.js'
  //       },
  //       {
  //         src: '//cdn.jsdelivr.net/npm/danmaku@1.3.5/dist/danmaku.js'
  //       },
  //       {
  //         src: '//storage.googleapis.com/vrview/2.0/build/vrview.min.js'
  //       },
  //       {
  //         src: '//cdn.bootcss.com/echarts/4.1.0.rc2/echarts-en.min.js'
  //       }
  //     ],
  //     link: [
  //       {
  //         rel: 'stylesheet',
  //         href: '//cdn.bootcss.com/Swiper/4.1.6/css/swiper.min.css'
  //       }
  //     ]
  //   };
  // }
};
</script>
<style lang="stylus">

.app-download-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 8px;

  .left-item {
    display: flex;
    justify-content: space-between;
    align-items: center;

    &>* {
      margin: 0 5px;
    }

    img {
      display: block;
      width: 40px;
      background: #fff;
      padding: 6px 2px;
      border-radius: 4px;
    }
  }
}

body {
  background: #f5f5f5;
}
</style>

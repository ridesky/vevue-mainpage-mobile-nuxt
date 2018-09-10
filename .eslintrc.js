module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
    // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
    'plugin:vue/essential'
  ],
  // required to lint *.vue files
  plugins: [
    'vue'
  ],
  "globals": {
    'QRCode': true,
    'google': true,
    'Danmaku': true,
    'VRView': true,
    'Swiper': true,
    'videojs': true,
    'Hammer': true,
    'MarkerClusterer': true
  },
  // add your custom rules here
  rules: {}
}

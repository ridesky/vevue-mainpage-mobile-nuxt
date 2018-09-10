<template>
  <div>
    <topHeaderDownload/>
    <setinfo/>
  </div>
</template>
<script>
import setinfo from '../../components/setInfo.vue';
import topHeaderDownload from '../../components/topHeaderDownload.vue';
export default {
  components: {
    topHeaderDownload,
    setinfo
  },
  layout: 'header'
};
</script>

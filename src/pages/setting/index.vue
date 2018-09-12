<template>
  <div>
    <topHeaderSearch/>
    <setinfo/>
  </div>
</template>
<script>
import setinfo from '../../components/setInfo.vue';
import topHeaderSearch from '../../components/topHeaderSearch.vue';
export default {
  components: {
    topHeaderSearch,
    setinfo
  },
  layout: 'header'
};
</script>

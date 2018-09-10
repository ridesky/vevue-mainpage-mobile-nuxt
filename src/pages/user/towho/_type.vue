<template>
    <div></div>
</template>
<script>
export default {
  asyncData(context) {
    if (context.params.type) {
      context.redirect('/user/' + context.params.towho);
    }
  }
};
</script>
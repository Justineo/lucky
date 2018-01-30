<template>
  <span class="name">{{ name.split('|')[0] }} <span class="desc" v-if="name.split('|')[1]">({{ name.split('|')[1] }})</span></span>
</template>

<script>
export default {
  name: 'name-label',
  props: {
    name: String
  }
}
</script>

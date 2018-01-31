<template>
  <span class="name">{{ name }} <span class="desc" v-if="desc">({{ desc }})</span></span>
</template>

<script>
export default {
  name: 'name-label',
  props: {
    name: {
      type: String,
      required: true
    },
    desc: String
  }
}
</script>

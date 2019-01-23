<template>
  <div class="file">
    <button type="button" @click="choose"><slot>选择文件</slot></button>
    <input type="file" ref="file"
      :name="name"
      :disabled="disabled"
      :accept="accept"
      :multiple="multiple"
      :required="required"
      @input="input"
      @change="change">
  </div>
</template>

<style lang="stylus">
@import "../styles/variables.styl"

.file
  display inline-block
  overflow hidden
  vertical-align middle
  border none
  cursor pointer

  input
    position absolute
    top 0
    left -100%
    visibility hidden

  button
    float left
    border 2px solid var(--fg-color)

    &:hover
      border-color var(--active-fg-color)

  input,
  button
    margin 0
</style>

<script>
export default {
  name: 'file',
  props: {
    name: String,
    disabled: Boolean,
    accept: String,
    multiple: Boolean,
    required: Boolean
  },
  methods: {
    input (e) {
      this.$emit('input', e)
    },
    change (e) {
      this.$emit('change', e)
    },
    choose () {
      this.$refs.file.click()
    },
    clear () {
      this.$refs.file.value = ''
    }
  }
}
</script>

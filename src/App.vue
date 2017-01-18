<template>
  <div id="app" @click="click">
    <div id="display">
      <template v-if="winners.length"><span class="name" v-for="winner in winners">{{ winner.split('|')[0] }} <span class="desc" v-if="winner.split('|')[1]">({{ winner.split('|')[1] }})</span></span></template>
      <h1 v-else class="welcome" ref="welcome" :contenteditable="editing" @dblclick="edit(true)" @keydown.enter="edit(false)">Who's feeling lucky?</h1>
    </div>
    <div id="control" :class="{started: isSetup}">
      <form id="setup" @submit.prevent="setup">
        <label><file @change="upload" :disabled="isSetup" ref="upload">选择文件</file></label>
        <span class="separator">- or -</span>
        <label><input type="number" required min="1" max="999" v-model="total" number :disabled="isSetup" ref="total" placeholder="一共有几人？"></label> <button :disabled="isSetup">确定</button>
      </form>
      <form id="roll" @reset="reset" @submit.prevent="roll">
        <label><input type="number" v-model="round" number required :disabled="!this.isSetup || this.rolling" required min="1" :max="remaining || 50" @input="checkRemaining" ref="round" placeholder="本轮抽几人？"></label> / <span class="remaining">{{remaining}}</span> <button :disabled="!isSetup" name="begin" ref="begin">{{rolling ? '停止' : '开始'}}</button> <button type="reset" :disabled="!isSetup">重置</button>
      </form>
    </div>
  </div>
</template>

<style lang="stylus">
@import "./styles/variables.styl";

#app
  display flex
  flex-direction column
  justify-content space-between
  height 100vh
  font-family -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  text-align center

#display
  display flex
  flex-wrap wrap
  justify-content space-around
  align-items center
  flex-grow 1
  overflow hidden
  padding 80px 40px 20px

  .welcome
    min-height 1em
    border-bottom 2px solid transparent
    padding 0 .3em
    font-size 5em
    font-weight 200
    user-select none
    cursor default
    outline none

    &[contenteditable="true"]
      border-color $aux-color
      cursor text

      &:hover
        border-color $normal-color

  .name
    position relative
    min-width 10vw
    padding .3em 1em
    font-size 6em

  .desc
    position absolute
    top 60%
    left 50%
    transform translateX(-50%)
    color $secondary-color
    font-size .55em

#control
  position relative
  height 150px
  flex-shrink 0
  overflow hidden

  form
    position absolute
    top 50%
    left 50%
    width 320px
    background-color #fff
    transform translate(-50%, -50%)
    transition opacity .3s, transform .3s

  #roll
    opacity 0
    z-index -1
    transform translate(-50%, -50%) scale(2)

    .remaining
      margin-right 1em

  &.started
    #setup
      opacity 0
      transform translate(-50%, -50%) scale(2)

    #roll
      opacity 1
      z-index 0
      transform translate(-50%, -50%)

.separator
  margin 0 .5em
  text-transform uppercase
  font-size .7em
  font-weight 700
  color $aux-color
  user-select none
  cursor default
</style>

<script>
import { pad, shuffle } from './utils'
import File from './components/File'

const INITIAL = {
  candidates: [],
  winners: [],
  total: null,
  round: null,
  rolling: false,
  isSetup: false,
  editing: false
}

export default {
  name: 'lucky',
  components: {
    file: File
  },
  data () {
    return {...INITIAL}
  },
  computed: {
    remaining: {
      get () {
        if (!this.isSetup) {
          return '∞'
        }
        return this.candidates.length
      }
    }
  },
  methods: {
    edit (isStart) {
      this.editing = isStart
    },
    click ({target}) {
      if (!this.$refs.welcome.contains(target)) {
        this.editing = false
      }
    },
    setup () {
      if (this.$refs.total.validationMessage) {
        alert(this.$refs.total.validationMessage)
        return
      }

      this.candidates = Array(this.total).fill(true).map((item, i) => pad(i + 1, 3))
      this.isSetup = true
    },
    upload ({target}) {
      let file = target.files[0]
      if (!file) {
        return
      }
      let reader = new FileReader()
      reader.onload = ({target}) => {
        this.candidates = target.result
          .split('\n')
          .map(line => line.trim())
          .filter(line => line)
        this.total = this.candidates.length
        this.isSetup = true
        this.$refs.round.focus()
      }
      reader.readAsText(file)
    },
    roll () {
      if (this.$refs.round.validationMessage) {
        alert(this.$refs.round.validationMessage)
        return
      }

      let count = this.round
      if (!this.rolling) {
        this.rolling = setInterval(() => {
          this.shuffle(count)
        }, 1000 / 15)
        this.$nextTick(() => {
          this.$refs.begin.focus()
        })
      } else {
        this.candidates.splice(0, count)
        clearTimeout(this.rolling)
        this.rolling = false
        this.checkRemaining()
      }
    },
    shuffle (count) {
      let shuffled = shuffle(this.candidates, count)
      this.winners = shuffled.slice(0, count)
      this.candidates = shuffled
    },
    reset () {
      clearTimeout(this.rolling)
      this.$refs.upload.clear()
      Object.assign(this, INITIAL)
    },
    checkRemaining () {
      let validity = ''
      if (this.candidates.length < this.round) {
        validity = '剩余人数不足' + this.round + '人。'
      }
      this.$refs.round.setCustomValidity(validity)
    }
  },
  watch: {
    isSetup (val, oldVal) {
      if (val !== oldVal) {
        this.$nextTick(() => {
          if (val) {
            this.$refs.round.focus()
          } else {
            this.$refs.total.focus()
          }
        })
      }
    }
  },
  mounted () {
    window.onbeforeunload = () => {
      if (this.isSetup) {
        return '目前抽奖尚未结束，是否要离开？'
      }
    }
  }
}
</script>

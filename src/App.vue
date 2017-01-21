<template>
  <div id="app" @click="click" :class="{started: isSetup, fit: isFit}">
    <div id="display">
      <div id="winners" ref="winners"><span class="name" v-for="winner in winners">{{ winner.split('|')[0] }} <span class="desc" v-if="winner.split('|')[1]">({{ winner.split('|')[1] }})</span></span></div>
      <h1 v-show="!winners.length && isFit" id="welcome" ref="welcome" :contenteditable="editing" @dblclick.stop="edit(true)" @keydown.enter="edit(false)" v-html="welcome" spellcheck="false"></h1>
    </div>
    <div id="control">
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
  position relative
  display flex
  flex-direction column
  justify-content space-around
  align-items center
  flex-grow 1
  overflow hidden

#winners
  position absolute
  top 80px
  right 40px
  bottom 20px
  left 40px
  display none
  visibility hidden
  flex-wrap wrap
  justify-content space-around
  align-items center
  flex-grow 1
  font-size 6em
  overflow auto

  .started &
    display flex

  .fit &
    visibility visible

  .name
    position relative
    min-width 10vw
    padding .3em 1em

  .desc
    position absolute
    top 60%
    left 50%
    transform translateX(-50%)
    color $secondary-color
    font-size .55em

#welcome
  min-height 1em
  border-bottom 2px solid transparent
  padding 0 .3em
  font-size 5em
  font-weight 200
  cursor default
  user-select none
  outline none

  &[contenteditable="true"]
    border-color $aux-color
    cursor text
    user-select auto

    &:hover
      border-color $normal-color

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

  .started &
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
import { pad, shuffle } from './lib/utils'
import { save, load } from './lib/storage'
import { focus, fitByFontSize } from './lib/dom'
import File from './components/File'

const INITIAL = {
  candidates: [],
  winners: [],
  total: null,
  round: null,
  rolling: false,
  isSetup: false,
  isFit: true,
  editing: false,
  welcome: load('welcome') || 'Who\'s feeling lucky?'
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
    setup () {
      if (!this.check('total')) {
        return
      }

      this.candidates = Array(this.total).fill(true).map((item, i) => pad(i + 1, 3))
      this.isSetup = true
    },
    log (names) {
      let rounds = load('current', [])
      rounds.push(names)
      save('current', rounds)
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
        this.focus('round')
      }
      reader.readAsText(file)
    },
    roll () {
      if (!this.check('round')) {
        return
      }

      let count = this.round
      if (!this.rolling) {
        this.winners = []
        this.fit(true)
        this.rolling = setInterval(() => {
          this.shuffle(count)
          this.fit()
        }, 1000 / 15)
        this.focus('begin')
      } else {
        this.candidates.splice(0, count)
        clearTimeout(this.rolling)
        this.rolling = false
        this.checkRemaining()
        this.log(this.winners)
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
      save('previous', load('current'))
      save('current', [])
    },
    checkRemaining () {
      let validity = ''
      if (this.candidates.length < this.round) {
        validity = '剩余人数不足' + this.round + '人。'
      }
      this.$refs.round.setCustomValidity(validity)
    },
    edit (isStart) {
      this.editing = isStart
    },
    click ({target}) {
      if (!this.$refs.welcome.contains(target)) {
        this.edit(false)
      }
    },
    focus (ref, isCollapse) {
      let item = this.$refs[ref]
      this.$nextTick(() => {
        if (item instanceof HTMLElement) {
          focus(item, isCollapse)
        } else if (typeof item.focus === 'function') {
          item.focus()
        }
      })
    },
    check (ref) {
      let message = this.$refs[ref].validationMessage
      if (message) {
        alert(message)
        return false
      }
      return true
    },
    fit (isReset) {
      let winners = this.$refs.winners
      if (isReset) {
        this.isFit = false
        winners.style.fontSize = ''
      } else {
        this.$nextTick(() => {
          fitByFontSize(winners)
          this.isFit = true
        })
      }
    }
  },
  watch: {
    isSetup (val, oldVal) {
      if (val !== oldVal) {
        this.focus(val ? 'round' : 'total')
      }
    },
    editing (val, oldVal) {
      if (val !== oldVal) {
        if (val) {
          this.focus('welcome', true)
        } else {
          save('welcome', this.$refs.welcome.innerHTML)
        }
      }
    }
  },
  mounted () {
    window.addEventListener('resize', () => {
      if (this.isSetup) {
        this.fit()
      }
    })
    window.addEventListener('beforeunload', () => {
      if (this.isSetup) {
        return '目前抽奖尚未结束，是否要离开？'
      }
    })
  }
}
</script>

<template>
  <div id="app" @click="click" :class="{started: isSetup, fit: isFit}">
    <div id="display">
      <div id="winners" ref="winners">
        <name-label v-for="(winner, i) in winners" :name="winner.name" :desc="winner.desc" :key="i"/>
      </div>
      <h1 v-show="!winners.length && isFit" id="welcome" ref="welcome" :contenteditable="editing" @dblclick.stop="edit(true)" @keydown.enter="edit(false)" v-html="welcome" spellcheck="false"></h1>
    </div>
    <div id="control">
      <form id="setup" @submit.prevent="setup">
        <label><file @change="upload" :disabled="isSetup" ref="upload">选择文件</file></label>
        <span class="separator">- or -</span>
        <label><input type="number" required min="1" max="999" v-model.number="total" :disabled="isSetup" ref="total" placeholder="一共有几人？"></label> <button :disabled="isSetup">确定</button>
      </form>
      <form id="roll" @reset="reset" @submit.prevent="roll">
        <label><input type="number" v-model.number="round" required :disabled="!this.isSetup || this.rolling" min="1" :max="remaining || 50" @input="checkRemaining" ref="round" placeholder="本轮抽几人？"></label> / <span class="remaining">{{remaining}}</span> <button :disabled="!isSetup" name="begin" ref="begin">{{rolling ? '停止' : '开始'}}</button> <button type="reset" :disabled="!isSetup">重置</button> <button type="button" @click="openLog">记录</button>
      </form>
    </div>
    <div id="log" :class="{show: showLog}" @click="showLog = false">
      <h2>抽取历史</h2>
      <ol v-if="logs.length">
        <li v-for="(log, i) in logs" :key="i">
          <name-label v-for="(winner, j) in log" :name="winner.name" :desc="winner.desc" :key="j"/>
        </li>
      </ol>
      <h2 class="empty" v-if="!logs.length">还没有进行过抽奖</h2>
    </div>
    <button id="setting"><octicon name="gear"/></button>
    <a id="github" href="https://github.com/Justineo/lucky"><octicon name="mark-github" label="View on GitHub" title="View on GitHub"></octicon></a>
  </div>
</template>

<script>
import { pad, shuffle } from './lib/utils'
import { save, load } from './lib/storage'
import { focus, fitByFontSize } from './lib/dom'
import extract from './extract'
import File from './components/File'
import NameLabel from './components/NameLabel'
import Octicon from 'vue-octicon/components/Octicon'
import 'vue-octicon/icons/mark-github'
import 'vue-octicon/icons/gear'

const INITIAL = {
  candidates: [],
  winners: [],
  total: null,
  round: null,
  rolling: false,
  isSetup: false,
  isFit: true,
  editing: false,
  welcome: load('welcome') || 'Who\'s feeling lucky?',
  showLog: false,
  logs: [],
  rounds: []
}

export default {
  name: 'lucky',
  components: {
    File,
    NameLabel,
    Octicon
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

      this.candidates = Array(this.total).fill(true).map((item, i) => ({name: pad(i + 1, 3)}))
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
        let {candidates} = extract(target.result)
        this.candidates = candidates
        this.total = candidates.length
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
    },
    openLog () {
      this.logs = load('current')
      this.showLog = true
    }
  },
  watch: {
    isSetup (val, oldVal) {
      if (val !== oldVal) {
        if (val) {
          save('previous', load('current'))
          save('current', [])
        }
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
  user-select none
  cursor default

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

#log
  position fixed
  top 0
  right 0
  bottom 0
  left 0
  display flex
  flex-direction column
  justify-content center
  align-items center
  padding 3em 5em
  background rgba(0, 0, 0, .8)
  opacity 0
  color rgba(255, 255, 255, .8)
  transform scale(3)
  transition opacity .2s, transform .2s
  pointer-events none

  h2
    margin-top -20vh

  &.show
    opacity 1
    transform none
    pointer-events auto

  .empty
    flex-grow 0
    font-weight 200
    font-size 3em

  ol
    float left
    max-width 80vw
    text-align left
    font-size 1.5em
    color rgba(255, 255, 255, .5)

  .name
    display inline-block
    color #fff

  .name:not(:first-child)::before
    content " / "
    color rgba(255, 255, 255, .7)

  .desc
    font-size .7em
    opacity .7

#github
  position fixed
  top -3em
  right -3em
  width 6em
  height 6em
  transform rotate(45deg) scale(.6)
  background-color $normal-color
  color #fff
  line-height 10em
  text-align center
  transition transform .2s, background-color .2s

  .octicon
    transform rotate(-45deg) scale(1.2)
    transition transform .2s

  &:hover
    background-color $primary-color
    transform rotate(45deg)

    .octicon
      transform rotate(-45deg) scale(1.4)

#setting
  position fixed
  bottom 20px
  left 20px
  width 24px
  height 24px
  padding 0
  opacity .2
  transition opacity .3s

  .octicon
    font-size 16px
    vertical-align top
    margin-top 4px
    transition transform .3s

  &:hover
    opacity 1

    .octicon
      transform rotate(360deg)

  &:active
    opacity .8
</style>

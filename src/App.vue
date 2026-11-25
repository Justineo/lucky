<template>
  <div
    id="app"
    @click="click"
    :class="{
      started: isSetup,
      fit: isFit,
      number: isNumber,
    }"
  >
    <div id="stage" ref="stage">
      <div id="display">
        <div id="winners" ref="winners">
          <name-label
            v-for="(winner, i) in winners"
            :name="winner.name"
            :desc="winner.desc"
            :key="i"
          />
        </div>
        <h1
          v-show="!winners.length && isFit"
          id="welcome"
          ref="welcome"
          :contenteditable="editing"
          @dblclick.stop="edit(true)"
          @keydown.enter="edit(false)"
          v-text="welcome"
          spellcheck="false"
        ></h1>
      </div>
      <div id="control">
        <form id="setup" @submit.prevent="setup">
          <label v-if="mode !== 'number'">
            <roster-file @change="upload" :disabled="isSetup" ref="upload">选择文件</roster-file>
          </label>
          <span class="separator" v-if="mode === 'both'">- or -</span>
          <label v-if="mode !== 'import'">
            <input
              type="number"
              required
              min="1"
              max="999"
              v-model.number="total"
              :disabled="isSetup"
              ref="total"
              placeholder="一共有几人？"
            />
          </label>
          <button v-if="mode !== 'import'" :disabled="isSetup">确定</button>
        </form>
        <form id="roll" @reset="reset" @submit.prevent="roll">
          <label>
            <input
              type="number"
              v-model.number="round"
              required
              :disabled="!isSetup || rolling"
              min="1"
              :max="remaining || 50"
              @input="checkRemaining"
              ref="round"
              placeholder="本轮抽几人？"
            />
          </label>
          /
          <span class="remaining">{{ remaining }}</span>
          <button :disabled="!isSetup || coolingDown" name="begin" ref="begin">
            {{ rolling ? '停止' : '开始' }}
            <span v-if="coolingDown" class="cooler" :style="`animation-duration: ${cooldown}ms;`">
            </span>
          </button>
          <button type="reset" :disabled="!isSetup || coolingDown">
            重置
            <span v-if="coolingDown" class="cooler" :style="`animation-duration: ${cooldown}ms;`">
            </span>
          </button>
          <button type="button" @click="openLog">记录</button>
        </form>
      </div>
    </div>
    <div
      id="log"
      :class="{ show: showLog, modal: true }"
      @click="showLog = false"
      tabindex="-1"
      @keydown.esc="showSettings = false"
    >
      <h2>抽取历史</h2>
      <ol v-if="logs.length">
        <li v-for="(log, i) in logs" :key="i">
          <name-label v-for="(winner, j) in log" :name="winner.name" :desc="winner.desc" :key="j" />
        </li>
      </ol>
      <h2 class="empty" v-if="!logs.length">还没有进行过抽奖</h2>
    </div>
    <div
      id="settings"
      :class="{ show: showSettings, modal: true }"
      tabindex="-1"
      @click.self="showSettings = false"
      @keydown.esc="showSettings = false"
    >
      <h2>设置</h2>
      <form>
        <p>
          <label
            ><span class="label">间隔时间</span
            ><input type="number" v-model.number="cooldown" /><span class="tip">毫秒</span></label
          >
        </p>
        <p>
          <label
            ><span class="label">表情</span><input type="text" class="hero" v-model="emojis"
          /></label>
        </p>
        <p>
          <span class="label">输入模式</span>
          <label><input type="radio" v-model="mode" value="import" /><span>文件导入</span></label>
          <label><input type="radio" v-model="mode" value="number" /><span>抽取序号</span></label>
          <label><input type="radio" v-model="mode" value="both" /><span>自由选择</span></label>
        </p>
        <p id="custom">
          <label
            ><span class="label">自定义样式</span
            ><textarea spellcheck="false" rows="10" v-model="custom"></textarea>
          </label>
        </p>
      </form>
    </div>
    <button id="setting" type="button" aria-label="设置" @click="showSettings = !showSettings">
      <svg class="octicon" aria-hidden="true" width="14" height="16" viewBox="0 0 14 16">
        <path
          d="M14 8.77v-1.6l-1.94-.64-.45-1.09.88-1.84-1.13-1.13-1.81.91-1.09-.45-.69-1.92h-1.6l-.63 1.94-1.11.45-1.84-.88-1.13 1.13.91 1.81-.45 1.09L0 7.23v1.59l1.94.64.45 1.09-.88 1.84 1.13 1.13 1.81-.91 1.09.45.69 1.92h1.59l.63-1.94 1.11-.45 1.84.88 1.13-1.13-.92-1.81.47-1.09L14 8.75v.02zM7 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"
        />
      </svg>
    </button>
    <a id="github" href="https://github.com/Justineo/lucky">
      <svg
        class="octicon"
        role="img"
        aria-label="View on GitHub"
        width="16"
        height="16"
        viewBox="0 0 16 16"
      >
        <title>View on GitHub</title>
        <path
          d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
        />
      </svg>
    </a>
  </div>
</template>

<script>
import { pad, shuffle } from './lib/utils'
import { save, load } from './lib/storage'
import { focus, fitByFontSize } from './lib/dom'
import extract from './extract'
import RosterFile from './components/File.vue'
import NameLabel from './components/NameLabel.vue'

const EMOJIS = ['👻', '🤟', '🖖', '🙈', '🎰', '🤩', '😜', '😎', '🤑', '🤘']

function split(str) {
  let result = []
  for (let c of str) {
    result.push(c)
  }
  return result
}

function loadSettings() {
  let cooldown = load('cooldown')
  cooldown = cooldown == null ? 500 : cooldown

  let emojis = load('emojis') || EMOJIS.join('')
  let emojiList = split(emojis)

  let welcome = load('welcome') || emojiList[Math.floor(Math.random() * emojiList.length)]

  let mode = load('mode') || 'both'

  let custom = load('custom') || ''

  return {
    emojis,
    cooldown,
    welcome,
    mode,
    custom,
  }
}

function initialState() {
  return {
    candidates: [],
    winners: [],
    total: null,
    round: null,
    rolling: false,
    isSetup: false,
    isNumber: false,
    isFit: true,
    editing: false,
    showLog: false,
    logs: [],
    showSettings: false,
    rounds: [],
    coolingDown: false,
    ...loadSettings(),
  }
}

export default {
  name: 'lucky',
  components: {
    RosterFile,
    NameLabel,
  },
  data() {
    return initialState()
  },
  computed: {
    remaining: {
      get() {
        if (!this.isSetup) {
          return '∞'
        }
        return this.candidates.length
      },
    },
  },
  methods: {
    setup() {
      if (!this.check('total')) {
        return
      }

      this.isNumber = true
      this.candidates = Array(this.total)
        .fill(true)
        .map((item, i) => ({ name: pad(i + 1, 3) }))
      this.isSetup = true
    },
    log(names) {
      let rounds = load('current', [])
      rounds.push(names)
      save('current', rounds)
    },
    upload({ target }) {
      let file = target.files[0]
      if (!file) {
        return
      }
      let reader = new FileReader()
      reader.onload = ({ target }) => {
        let { candidates } = extract(target.result)
        this.candidates = candidates
        this.total = candidates.length
        this.isSetup = true
        this.focus('round')
      }
      reader.readAsText(file)
    },
    roll() {
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

      this.coolingDown = true
      setTimeout(() => {
        this.coolingDown = false
      }, this.cooldown)
    },
    shuffle(count) {
      let shuffled = shuffle(this.candidates, count)
      this.winners = shuffled.slice(0, count)
      this.candidates = shuffled
    },
    reset() {
      clearTimeout(this.rolling)
      if (this.$refs.upload) {
        this.$refs.upload.clear()
      }
      Object.assign(this, initialState())
    },
    checkRemaining() {
      let validity = ''
      if (Number(this.round) > this.candidates.length) {
        validity = '剩余人数不足' + this.round + '人。'
      }
      this.$refs.round.setCustomValidity(validity)
    },
    edit(isStart) {
      this.editing = isStart
    },
    click({ target }) {
      if (!this.$refs.welcome.contains(target)) {
        this.edit(false)
      }
    },
    focus(ref, isCollapse) {
      let item = this.$refs[ref]
      if (!item) {
        return
      }
      this.$nextTick(() => {
        if (item instanceof HTMLElement) {
          focus(item, isCollapse)
        } else if (typeof item.focus === 'function') {
          item.focus()
        }
      })
    },
    check(ref) {
      let message = this.$refs[ref].validationMessage
      if (message) {
        alert(message)
        return false
      }
      return true
    },
    fit(isReset) {
      let { winners } = this.$refs
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
    openLog() {
      this.logs = load('current', []) || []
      this.showLog = true
    },
    setStyles(val) {
      if (!this.customStyleEl) {
        let style = document.createElement('style')
        style.innerHTML = val
        document.querySelector('head').appendChild(style)
        this.customStyleEl = style
      } else {
        this.customStyleEl.innerHTML = val
      }
    },
  },
  watch: {
    isSetup(val, oldVal) {
      if (val !== oldVal) {
        if (val) {
          save('previous', load('current'))
          save('current', [])
        }
        this.focus(val ? 'round' : 'total')
      }
    },
    editing(val, oldVal) {
      if (val !== oldVal) {
        if (val) {
          this.focus('welcome', true)
        } else {
          save('welcome', this.$refs.welcome.textContent)
        }
      }
    },
    emojis(val) {
      save('emojis', val)
    },
    cooldown(val) {
      save('cooldown', val)
    },
    mode(val) {
      save('mode', val)
    },
    custom(val) {
      save('custom', val)
      this.setStyles(val)
    },
  },
  mounted() {
    let customStyles = load('custom')
    if (customStyles) {
      this.setStyles(customStyles)
    }

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
  },
}
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
#stage {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
  text-align: center;
  color: var(--fg-color);
  background: var(--bg);
  background-color: var(--bg-color);
}
#display {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  flex-grow: 1;
  overflow: hidden;
}
#winners {
  position: absolute;
  top: 80px;
  right: 40px;
  bottom: 20px;
  left: 40px;
  display: none;
  visibility: hidden;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  flex-grow: 1;
  font-size: 6em;
  overflow: auto;
  user-select: none;
  cursor: default;
}
.started #winners {
  display: flex;
}
.fit #winners {
  visibility: visible;
}
#winners .name {
  position: relative;
  min-width: 10vw;
  padding: 0.3em 1em;
}
.number #winners .name {
  font-family: 'Fira Code', consolas, monospace;
}
#winners .desc {
  position: absolute;
  top: 60%;
  left: 50%;
  transform: translateX(-50%);
  color: var(--aux-color);
  font-size: 0.55em;
}
#welcome {
  min-height: 1em;
  border-bottom: 2px solid transparent;
  padding: 0 0.3em;
  font-size: 5em;
  font-weight: 200;
  cursor: default;
  user-select: none;
  outline: none;
}
#welcome[contenteditable='true'] {
  border-color: var(--aux-color);
  cursor: text;
  user-select: auto;
}
#welcome[contenteditable='true']:hover {
  border-color: var(--fg-color);
}
#control {
  position: relative;
  height: 150px;
  flex-shrink: 0;
  overflow: hidden;
}
#control form {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition:
    opacity 0.3s,
    transform 0.3s;
}
#control #roll {
  opacity: 0;
  z-index: -1;
  transform: translate(-50%, -50%) scale(2);
}
#control #roll .remaining {
  margin-right: 1em;
}
#control #roll button {
  position: relative;
}
.started #control #setup {
  opacity: 0;
  transform: translate(-50%, -50%) scale(2);
}
.started #control #roll {
  opacity: 1;
  z-index: 0;
  transform: translate(-50%, -50%);
}
.separator {
  margin: 0 0.5em;
  text-transform: uppercase;
  font-size: 0.7em;
  font-weight: 700;
  color: var(--aux-color);
  user-select: none;
  cursor: default;
}
.cooler {
  position: absolute;
  top: -2px;
  right: -2px;
  bottom: -2px;
  left: -2px;
  background-color: rgba(255, 255, 255, 0.5);
  transform-origin: right center;
  animation: progress linear;
}
.modal {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 3em 5em;
  background: rgba(0, 0, 0, 0.8);
  opacity: 0;
  color: rgba(255, 255, 255, 0.8);
  transform: scale(3);
  transition:
    opacity 0.2s,
    transform 0.2s;
  pointer-events: none;
}
.modal h2 {
  margin-top: -20vh;
}
.modal.show {
  opacity: 1;
  transform: none;
  pointer-events: auto;
}
#log .empty {
  flex-grow: 0;
  font-weight: 200;
  font-size: 3em;
}
#log ol {
  float: left;
  max-width: 80vw;
  text-align: left;
  font-size: 1.5em;
  color: rgba(255, 255, 255, 0.5);
}
#log .name {
  display: inline-block;
  color: #fff;
}
#log .name:not(:first-child)::before {
  content: '/';
  margin: 0 0.1em;
  color: rgba(255, 255, 255, 0.7);
}
#log .desc {
  font-size: 0.7em;
  opacity: 0.7;
}
.octicon {
  display: inline-block;
  fill: currentColor;
}
#github {
  position: fixed;
  top: -3em;
  right: -3em;
  width: 6em;
  height: 6em;
  transform: rotate(45deg) scale(0.6);
  background-color: var(--fg-color);
  color: var(--bg-color);
  line-height: 10em;
  text-align: center;
  transition:
    transform 0.2s,
    background-color 0.2s;
}
#github .octicon {
  transform: rotate(-45deg) scale(1.2);
  transition: transform 0.2s;
}
#github:hover {
  background-color: var(--active-fg-color);
  transform: rotate(45deg);
}
#github:hover .octicon {
  transform: rotate(-45deg) scale(1.4);
}
#setting {
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 24px;
  height: 24px;
  padding: 0;
  opacity: 0.2;
  transition: opacity 0.3s;
}
#setting .octicon {
  font-size: 16px;
  vertical-align: top;
  margin-top: 4px;
  transition: transform 0.3s;
}
#setting:hover {
  opacity: 1;
}
#setting:hover .octicon {
  transform: rotate(360deg);
}
#setting:active {
  opacity: 0.8;
}
#settings form {
  padding: 2em 3em;
  background-color: var(--bg-color);
  border-radius: 3px;
  color: var(--fg-color);
}
#settings form > p {
  display: flex;
  align-items: center;
}
#settings form p > label:first-child:last-child {
  width: 100%;
}
#settings .label {
  display: inline-flex;
  align-items: center;
  width: 7.5em;
}
#settings label {
  display: inline-flex;
  align-items: center;
}
#settings label + label {
  margin-left: 1em;
}
#settings .tip {
  margin-left: 0.5em;
}
#settings input.hero {
  flex-grow: 1;
  text-align: left;
}
#settings input[type='radio'] {
  position: absolute;
  opacity: 0;
}
#settings input[type='radio'] + span {
  display: inline-block;
  padding: 0 0.5em;
  background: none;
  border: 2px solid var(--fg-color);
  border-radius: 2px;
  cursor: pointer;
  transition:
    opacity 0.3s,
    border-color 0.3s,
    color 0.3s,
    background-color 0.3s;
}
#settings input[type='radio'] + span:hover {
  color: var(--fg-color);
}
#settings input[type='radio']:checked + span {
  background-color: var(--fg-color);
  color: var(--bg-color);
}
#settings textarea {
  min-width: 40vw;
  font-family: 'Fira Code', consolas, monospace;
  font-size: 12px;
  line-height: 1.2;
  padding: 0.5em;
}
#custom .label {
  align-self: start;
}
@-moz-keyframes progress {
  0% {
    transform: scaleX(1);
  }
  100% {
    transform: scaleX(0);
  }
}
@-webkit-keyframes progress {
  0% {
    transform: scaleX(1);
  }
  100% {
    transform: scaleX(0);
  }
}
@-o-keyframes progress {
  0% {
    transform: scaleX(1);
  }
  100% {
    transform: scaleX(0);
  }
}
@keyframes progress {
  0% {
    transform: scaleX(1);
  }
  100% {
    transform: scaleX(0);
  }
}
</style>

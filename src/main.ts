import './style.css'
import {
  beginPet,
  createState,
  endPet,
  formatTime,
  moodCopy,
  moodFromAnger,
  petPulse,
  poke,
  startRun,
  tick,
  type Mood,
} from './game'
import { boomSound, petSound, pokeSound, startSound, unlockAudio } from './audio'

const app = document.querySelector<HTMLDivElement>('#app')!
const state = createState()
let petInterval: number | null = null
let lastOverlay = ''
let lastMood: Mood | null = null
let lastPetting = false
let lastToast: string | null = null
let lastCombo = -1

function bodyColor(mood: Mood): string {
  switch (mood) {
    case 'sleepy':
      return '#c9f0e0'
    case 'calm':
      return '#b8e6d5'
    case 'hmm':
      return '#ffe08a'
    case 'grumpy':
      return '#ffc28a'
    case 'steaming':
      return '#ff9aa2'
    case 'volcanic':
      return '#ff5d73'
  }
}

function cheekColor(mood: Mood): string {
  return mood === 'sleepy' || mood === 'calm' ? '#ffb3c1' : '#ff7a90'
}

function drawMochi(mood: Mood, petting: boolean): string {
  const fill = bodyColor(mood)
  const cheek = cheekColor(mood)
  const brow =
    mood === 'sleepy'
      ? ''
      : mood === 'calm'
        ? `<path d="M58 78h24M118 78h24" stroke="#3a2a32" stroke-width="5" stroke-linecap="round"/>`
        : mood === 'hmm'
          ? `<path d="M56 74l26 6M146 74l-26 6" stroke="#3a2a32" stroke-width="5" stroke-linecap="round"/>`
          : `<path d="M54 70l28 10M148 70l-28 10" stroke="#3a2a32" stroke-width="6" stroke-linecap="round"/>`

  const eyes =
    mood === 'sleepy'
      ? `<path d="M62 96c8 8 20 8 28 0" stroke="#3a2a32" stroke-width="6" fill="none" stroke-linecap="round"/>
         <path d="M110 96c8 8 20 8 28 0" stroke="#3a2a32" stroke-width="6" fill="none" stroke-linecap="round"/>`
      : mood === 'volcanic'
        ? `<path d="M66 88l22 18M88 88l-22 18M114 88l22 18M136 88l-22 18" stroke="#3a2a32" stroke-width="6" stroke-linecap="round"/>`
        : `<circle cx="78" cy="98" r="${mood === 'steaming' ? 9 : 8}" fill="#3a2a32"/>
           <circle cx="124" cy="98" r="${mood === 'steaming' ? 9 : 8}" fill="#3a2a32"/>
           <circle cx="75" cy="95" r="2.4" fill="#fff"/>
           <circle cx="121" cy="95" r="2.4" fill="#fff"/>`

  const mouth =
    mood === 'sleepy'
      ? `<path d="M88 128c8 10 16 10 24 0" stroke="#3a2a32" stroke-width="5" fill="none" stroke-linecap="round"/>`
      : mood === 'calm'
        ? `<path d="M86 124c10 14 20 14 30 0" stroke="#3a2a32" stroke-width="5" fill="none" stroke-linecap="round"/>`
        : mood === 'hmm'
          ? `<path d="M92 130h18" stroke="#3a2a32" stroke-width="6" stroke-linecap="round"/>`
          : mood === 'grumpy'
            ? `<path d="M86 136c10-10 20-10 30 0" stroke="#3a2a32" stroke-width="6" fill="none" stroke-linecap="round"/>`
            : `<ellipse cx="102" cy="132" rx="16" ry="12" fill="#3a2a32"/>
               <ellipse cx="102" cy="136" rx="9" ry="6" fill="#ff8aa0"/>`

  const horns =
    mood === 'steaming' || mood === 'volcanic'
      ? `<path d="M62 58c-6-22 8-30 16-16" fill="#ff8a80" stroke="#3a2a32" stroke-width="4"/>
         <path d="M140 58c6-22-8-30-16-16" fill="#ff8a80" stroke="#3a2a32" stroke-width="4"/>`
      : ''

  const sparkles = petting
    ? `<text x="28" y="70" font-size="18">♡</text><text x="160" y="78" font-size="16">✧</text>`
    : ''

  return `
    <svg viewBox="0 0 200 220" aria-hidden="true">
      <ellipse cx="102" cy="198" rx="58" ry="10" fill="rgba(58,42,50,0.12)"/>
      ${horns}
      <path d="M40 118c0-48 28-86 62-86s62 38 62 86-24 70-62 70-62-22-62-70z" fill="${fill}" stroke="#3a2a32" stroke-width="6"/>
      <ellipse cx="72" cy="118" rx="18" ry="12" fill="${cheek}" opacity="0.85"/>
      <ellipse cx="132" cy="118" rx="18" ry="12" fill="${cheek}" opacity="0.85"/>
      ${brow}
      ${eyes}
      ${mouth}
      ${sparkles}
    </svg>
  `
}

function meterFace(anger: number): string {
  if (anger < 20) return '😴'
  if (anger < 40) return '🙂'
  if (anger < 60) return '😐'
  if (anger < 80) return '😠'
  return '🌋'
}

function overlayHtml(): string {
  if (state.screen === 'title') {
    return `
      <div class="overlay">
        <div>
          <h2>Don’t make Mochi explode</h2>
          <p>Poke for points. Pet to cool them down. Random annoyances will happen, because life.</p>
          <p>Best: <strong>${state.best}</strong></p>
          <button class="start" type="button" data-action="start">Play with Mochi</button>
        </div>
      </div>
    `
  }
  if (state.screen === 'over' && state.lastRun) {
    const isBest = state.lastRun.score >= state.best && state.best > 0
    return `
      <div class="overlay">
        <div>
          <h2>${isBest ? 'New best tantrum!' : 'Mochi exploded!'}</h2>
          <p>Cute rage. Maximum dumpling. Deep breaths.</p>
          <div class="score-xl">${state.lastRun.score}</div>
          <p>${formatTime(state.lastRun.timeAlive)} survived · ${state.lastRun.pokes} pokes</p>
          <p>Best ever: <strong>${state.best}</strong></p>
          <button class="retry" type="button" data-action="start">Soothe &amp; retry</button>
        </div>
      </div>
    `
  }
  return ''
}

function spawnFloater(glyph: string) {
  const node = document.createElement('span')
  node.className = 'heart'
  node.textContent = glyph
  node.style.left = `${36 + Math.random() * 28}%`
  node.style.top = `${42 + Math.random() * 16}%`
  document.querySelector('.hearts')?.appendChild(node)
  setTimeout(() => node.remove(), 900)
}

app.innerHTML = `
  <main class="shell">
    <header class="top">
      <h1 class="brand"><span>Cute anger meter</span>Mochi</h1>
      <div class="stats">
        <div class="chip" data-score>Score 0</div>
        <div class="chip" data-time>0:00</div>
      </div>
    </header>

    <section class="stage">
      <div class="clouds">
        <div class="cloud a"></div>
        <div class="cloud b"></div>
      </div>
      <div data-toast></div>
      <div class="hearts"></div>
      <div class="character" data-action="poke-body">
        <div class="steam" hidden><i class="puff"></i><i class="puff"></i><i class="puff"></i></div>
        <div data-mochi></div>
      </div>
      <div class="combo" data-combo hidden></div>
      <div data-overlay></div>
    </section>

    <div class="meter-wrap">
      <div class="meter-label">
        <span data-mood>Sleepy</span>
        <span data-anger>0 / 100</span>
      </div>
      <div class="meter" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
        <div class="meter-fill"></div>
        <span class="meter-face" data-face>😴</span>
      </div>
    </div>
    <p class="hint" data-hint></p>

    <div class="actions">
      <button class="poke" type="button" data-action="poke">Poke</button>
      <button class="pet" type="button" data-action="pet">Hold to pet</button>
    </div>
    <p class="footer">Works after load with no server · Best score stays on this device</p>
  </main>
`

const el = {
  score: app.querySelector<HTMLElement>('[data-score]')!,
  time: app.querySelector<HTMLElement>('[data-time]')!,
  toast: app.querySelector<HTMLElement>('[data-toast]')!,
  mochi: app.querySelector<HTMLElement>('[data-mochi]')!,
  steam: app.querySelector<HTMLElement>('.steam')!,
  character: app.querySelector<HTMLElement>('.character')!,
  combo: app.querySelector<HTMLElement>('[data-combo]')!,
  overlay: app.querySelector<HTMLElement>('[data-overlay]')!,
  mood: app.querySelector<HTMLElement>('[data-mood]')!,
  anger: app.querySelector<HTMLElement>('[data-anger]')!,
  meter: app.querySelector<HTMLElement>('.meter')!,
  fill: app.querySelector<HTMLElement>('.meter-fill')!,
  face: app.querySelector<HTMLElement>('[data-face]')!,
  hint: app.querySelector<HTMLElement>('[data-hint]')!,
  poke: app.querySelector<HTMLButtonElement>('[data-action="poke"]')!,
  pet: app.querySelector<HTMLButtonElement>('[data-action="pet"]')!,
}

function paint() {
  const mood = moodFromAnger(state.anger)
  const copy = moodCopy(mood)
  const playing = state.screen === 'play'
  const steaming = mood === 'steaming' || mood === 'volcanic'

  el.score.textContent = `Score ${state.score}`
  el.time.textContent = formatTime(state.timeAlive)
  el.mood.textContent = copy.label
  el.anger.textContent = `${Math.round(state.anger)} / 100`
  el.fill.style.width = `${state.anger}%`
  el.meter.setAttribute('aria-valuenow', String(Math.round(state.anger)))
  el.face.textContent = meterFace(state.anger)
  el.hint.textContent = playing
    ? copy.hint
    : 'Keep the meter under 100. Petting is love. Poking is content.'
  el.poke.disabled = !playing
  el.pet.disabled = !playing
  el.pet.classList.toggle('held', state.petHold)
  el.steam.hidden = !steaming || !playing

  if (mood !== lastMood || state.petHold !== lastPetting) {
    el.mochi.innerHTML = drawMochi(mood, state.petHold)
    lastMood = mood
    lastPetting = state.petHold
  }

  if (state.shake > 0.4 && playing) {
    const dx = (Math.random() - 0.5) * state.shake
    const dy = (Math.random() - 0.5) * state.shake
    el.character.style.transform = `translate(${dx}px, ${dy}px)`
  } else if (state.screen !== 'over') {
    el.character.style.transform = ''
  }

  if (state.combo !== lastCombo) {
    lastCombo = state.combo
    if (state.combo > 1) {
      el.combo.hidden = false
      el.combo.textContent = `x${state.combo} poke combo`
    } else {
      el.combo.hidden = true
    }
  }

  if (state.toast !== lastToast) {
    lastToast = state.toast
    el.toast.innerHTML = state.toast ? `<div class="toast">${state.toast}</div>` : ''
  }

  const overlay = overlayHtml()
  if (overlay !== lastOverlay) {
    lastOverlay = overlay
    el.overlay.innerHTML = overlay
    el.character.classList.toggle('boom', state.screen === 'over')
  }
}

function doPoke() {
  if (state.screen !== 'play') return
  poke(state)
  pokeSound(state.anger)
  spawnFloater(['💢', '💥', '!', '✨'][Math.floor(Math.random() * 4)]!)
}

function doPetPulse() {
  if (state.screen !== 'play') return
  petPulse(state)
  petSound()
  spawnFloater(['♡', '✿', '💫'][Math.floor(Math.random() * 3)]!)
}

app.addEventListener('click', (event) => {
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-action]')
  if (!target) return
  unlockAudio()
  const action = target.dataset.action
  if (action === 'start') {
    startRun(state)
    startSound()
    lastOverlay = 'dirty'
    lastMood = null
    el.character.classList.remove('boom')
    return
  }
  if (action === 'poke' || action === 'poke-body') doPoke()
})

function startPetting() {
  if (state.screen !== 'play') return
  unlockAudio()
  beginPet(state)
  doPetPulse()
  if (petInterval) window.clearInterval(petInterval)
  petInterval = window.setInterval(doPetPulse, 280)
}

function stopPetting() {
  endPet(state)
  if (petInterval) {
    window.clearInterval(petInterval)
    petInterval = null
  }
}

app.addEventListener('pointerdown', (event) => {
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-action="pet"]')
  if (!target) return
  event.preventDefault()
  startPetting()
})

window.addEventListener('pointerup', stopPetting)
window.addEventListener('pointercancel', stopPetting)

function loop(now: number) {
  const before = state.screen
  tick(state, now)
  if (before === 'play' && state.screen === 'over') boomSound()
  paint()
  requestAnimationFrame(loop)
}

paint()
requestAnimationFrame(loop)

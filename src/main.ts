import './style.css'
import {
  INSTRUMENTS,
  INTENSITY_OPTIONS,
  MAIL_FROM,
  MAIL_TO,
  PHOTO_PATH,
  PHOTO_FALLBACK,
  TARGET_NAME,
  beginExecution,
  createState,
  launchHit,
  pickInstrument,
  pickIntensity,
  remainingHits,
  resetRun,
  setHitGoal,
  setReason,
  tick,
  type Intensity,
  type Instrument,
} from './game'
import { impactSound, launchSound, startSound, unlockAudio } from './audio'

const app = document.querySelector<HTMLDivElement>('#app')!
const state = createState()
let lastUi = ''
let lastHits = -1
let lastSplat = 0
let mailStatus: 'idle' | 'sending' | 'sent' | 'error' = 'idle'
let mailAttempted = false

function projectilePos(p: { sx: number; sy: number; tx: number; ty: number; t: number }) {
  const e = 1 - (1 - p.t) * (1 - p.t)
  return { x: p.sx + (p.tx - p.sx) * e, y: p.sy + (p.ty - p.sy) * e }
}

app.innerHTML = `
  <main class="shell">
    <header class="top">
      <h1 class="brand"><span>Anger vent</span>Hit ${TARGET_NAME}</h1>
      <div class="stats">
        <div class="chip" data-hits>0 / 0</div>
      </div>
    </header>

    <section class="stage">
      <div class="clouds">
        <div class="cloud a"></div>
        <div class="cloud b"></div>
      </div>
      <div data-toast></div>
      <div class="photo-wrap" data-photo-wrap>
        <img class="aadu" data-photo alt="${TARGET_NAME}" src="${PHOTO_PATH}" />
        <div class="splat" data-splat hidden></div>
        <div class="projectiles" data-projectiles></div>
      </div>
      <div data-overlay></div>
    </section>

    <p class="hint" data-hint></p>
    <div class="actions" data-actions></div>
    <p class="footer">Cartoon venting only. “Someone” is none other than ${TARGET_NAME}.</p>
  </main>
`

const el = {
  hits: app.querySelector<HTMLElement>('[data-hits]')!,
  toast: app.querySelector<HTMLElement>('[data-toast]')!,
  photo: app.querySelector<HTMLImageElement>('[data-photo]')!,
  photoWrap: app.querySelector<HTMLElement>('[data-photo-wrap]')!,
  splat: app.querySelector<HTMLElement>('[data-splat]')!,
  projectiles: app.querySelector<HTMLElement>('[data-projectiles]')!,
  overlay: app.querySelector<HTMLElement>('[data-overlay]')!,
  hint: app.querySelector<HTMLElement>('[data-hint]')!,
  actions: app.querySelector<HTMLElement>('[data-actions]')!,
}

el.photo.addEventListener('error', () => {
  if (!el.photo.src.includes('aadu.svg')) el.photo.src = PHOTO_FALLBACK
})

function overlayHtml(): string {
  if (state.screen === 'reason') {
    return `
      <div class="overlay setup">
        <div>
          <h2>Why the anger?</h2>
          <p>Say it first. Then pick how you want to vent.</p>
          <p class="hint-inline">Hint: someone is none other than <strong>${TARGET_NAME}</strong>.</p>
          <textarea data-reason rows="4" maxlength="500" placeholder="The reason…"></textarea>
          <button class="start" type="button" data-action="to-intensity">Next: type of anger</button>
        </div>
      </div>
    `
  }

  if (state.screen === 'intensity') {
    const buttons = INTENSITY_OPTIONS.map(
      (opt) => `
        <button class="choice" type="button" data-action="intensity" data-id="${opt.id}">
          <strong>${opt.label}</strong>
          <span>${opt.blurb}</span>
        </button>
      `,
    ).join('')
    return `
      <div class="overlay setup">
        <div>
          <h2>Type of anger</h2>
          <p>Aimed at ${TARGET_NAME}.</p>
          <div class="stack">${buttons}</div>
        </div>
      </div>
    `
  }

  if (state.screen === 'instrument' && state.intensity) {
    const buttons = INSTRUMENTS[state.intensity]
      .map(
        (opt) => `
          <button class="choice" type="button" data-action="instrument" data-id="${opt.id}">
            <strong>${opt.glyph} ${opt.label}</strong>
          </button>
        `,
      )
      .join('')
    return `
      <div class="overlay setup">
        <div>
          <h2>Pick an instrument</h2>
          <p>Cartoon hits on ${TARGET_NAME}’s photo.</p>
          <div class="stack">${buttons}</div>
        </div>
      </div>
    `
  }

  if (state.screen === 'hits') {
    const pips = Array.from({ length: 10 }, (_, i) => {
      const n = i + 1
      const on = n === state.hitGoal ? 'on' : ''
      return `<button class="pip ${on}" type="button" data-action="hits" data-n="${n}">${n}</button>`
    }).join('')
    return `
      <div class="overlay setup">
        <div>
          <h2>How many hits end the anger?</h2>
          <p>1 is a tap. 10 is a whole tantrum. Then it stops.</p>
          <div class="pips">${pips}</div>
          <button class="start" type="button" data-action="execute">Throw at ${TARGET_NAME}</button>
        </div>
      </div>
    `
  }

  if (state.screen === 'over') {
    const mailNote =
      mailStatus === 'sending'
        ? `<p class="after-gap">Sending your reason to ${MAIL_TO}…</p>`
        : mailStatus === 'sent'
          ? `<p class="after-gap">Your reason was emailed to ${MAIL_TO} from the site (${MAIL_FROM}).</p>`
          : mailStatus === 'error'
            ? `<p class="after-gap">Couldn’t send from the site. Use the button to open mail to ${MAIL_TO}.</p>
          <button class="start mail" type="button" data-action="mail">Send reason by email</button>`
            : `<p class="after-gap">Your reason will be emailed to ${MAIL_TO}.</p>`
    return `
      <div class="overlay setup">
        <div>
          <h2>How do you feel now?</h2>
          <p>If you’re still angry, you can play again.</p>
          <button class="retry" type="button" data-action="reset">Still angry — play again</button>
          ${mailNote}
        </div>
      </div>
    `
  }

  return ''
}

function bindOverlay() {
  const reason = el.overlay.querySelector<HTMLTextAreaElement>('[data-reason]')
  reason?.addEventListener('input', () => setReason(state, reason.value))
}

function paintOverlay() {
  const html = overlayHtml()
  if (html === lastUi) return
  lastUi = html
  el.overlay.innerHTML = html
  bindOverlay()
}

function paint() {
  el.hits.textContent = `${state.hitsDone} / ${state.hitGoal}`
  el.toast.innerHTML = state.toast ? `<div class="toast">${state.toast}</div>` : ''
  el.hint.textContent =
    state.screen === 'play'
      ? `Tap the photo or Hit. ${remainingHits(state)} left.`
      : `Someone is none other than ${TARGET_NAME}.`
  if (state.screen === 'play') {
    if (!el.actions.querySelector('[data-action="hit"]')) {
      el.actions.innerHTML = `<button class="poke" type="button" data-action="hit">Hit ${TARGET_NAME}</button>`
    }
  } else if (el.actions.innerHTML) {
    el.actions.innerHTML = ''
  }

  const dx = state.shake > 0.4 ? (Math.random() - 0.5) * state.shake : 0
  const dy = state.shake > 0.4 ? (Math.random() - 0.5) * state.shake : 0
  el.photoWrap.style.transform = `translate(${dx}px, ${dy}px)`
  el.splat.hidden = state.splat <= 0.05
  el.splat.style.opacity = String(state.splat)

  if (state.projectiles.length || lastHits !== state.hitsDone) {
    lastHits = state.hitsDone
    el.projectiles.innerHTML = state.projectiles
      .map((p) => {
        const pos = projectilePos(p)
        return `<span class="proj" style="left:${pos.x}%;top:${pos.y}%">${p.glyph}</span>`
      })
      .join('')
  }

  if (state.splat !== lastSplat) lastSplat = state.splat
  paintOverlay()
}

function fire() {
  if (state.screen !== 'play' || !state.instrument) return
  unlockAudio()
  const before = state.projectiles.length
  launchHit(state)
  if (state.projectiles.length > before) launchSound(state.instrument)
}

app.addEventListener('click', (event) => {
  const target = (event.target as HTMLElement).closest<HTMLElement>('[data-action]')
  if (!target) return
  unlockAudio()
  const action = target.dataset.action
  if (action === 'to-intensity') {
    const box = el.overlay.querySelector<HTMLTextAreaElement>('[data-reason]')
    if (box) setReason(state, box.value)
    if (!state.reason.trim()) {
      state.toast = 'Write the reason first.'
      state.toastTimer = 2
      return
    }
    state.screen = 'intensity'
    lastUi = 'dirty'
    startSound()
    return
  }
  if (action === 'intensity') {
    pickIntensity(state, target.dataset.id as Intensity)
    lastUi = 'dirty'
    return
  }
  if (action === 'instrument') {
    pickInstrument(state, target.dataset.id as Instrument)
    lastUi = 'dirty'
    return
  }
  if (action === 'hits') {
    setHitGoal(state, Number(target.dataset.n))
    lastUi = 'dirty'
    return
  }
  if (action === 'execute') {
    beginExecution(state)
    lastUi = 'dirty'
    startSound()
    return
  }
  if (action === 'hit') {
    fire()
    return
  }
  if (action === 'reset') {
    resetRun(state)
    mailStatus = 'idle'
    mailAttempted = false
    lastUi = 'dirty'
    return
  }
  if (action === 'mail') {
    openMailtoFallback()
    return
  }
})

el.photoWrap.addEventListener('click', () => {
  if (state.screen === 'play') fire()
})

function reasonText() {
  return state.reason.trim() || '(no reason written)'
}

function angerTypeText() {
  const opt = INTENSITY_OPTIONS.find((item) => item.id === state.intensity)
  return opt?.label ?? '(none selected)'
}

function mailFields() {
  return {
    reason: reasonText(),
    anger_type: angerTypeText(),
  }
}

function openMailtoFallback() {
  const { reason, anger_type } = mailFields()
  const subject = encodeURIComponent('Anger vent')
  const body = encodeURIComponent(
    `From: ${MAIL_FROM} (mood-pal on GitHub Pages)\nTo: ${MAIL_TO}\n\nType of anger: ${anger_type}\n\nReason:\n${reason}\n`,
  )
  window.location.href = `mailto:${MAIL_TO}?subject=${subject}&body=${body}`
}

async function sendReasonFromPages() {
  if (mailAttempted) return
  mailAttempted = true
  mailStatus = 'sending'
  lastUi = 'dirty'
  const { reason, anger_type } = mailFields()
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${MAIL_TO}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject: 'Anger vent — reason',
        _template: 'table',
        _captcha: false,
        name: 'Mood Pal',
        email: MAIL_FROM,
        _replyto: MAIL_FROM,
        site: 'https://adarshpatil0103.github.io/mood-pal/',
        anger_type,
        message: `Type of anger: ${anger_type}\n\nReason:\n${reason}`,
      }),
    })
    mailStatus = res.ok ? 'sent' : 'error'
  } catch {
    mailStatus = 'error'
  }
  lastUi = 'dirty'
}

function loop(now: number) {
  const beforeScreen = state.screen
  const impacts = tick(state, now)
  impacts.forEach((kind, i) => impactSound(kind, i * 0.04))
  if (beforeScreen === 'play' && state.screen === 'over') {
    lastUi = 'dirty'
    void sendReasonFromPages()
  }
  paint()
  requestAnimationFrame(loop)
}

paint()
requestAnimationFrame(loop)

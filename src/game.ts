export type Screen = 'reason' | 'intensity' | 'instrument' | 'hits' | 'play' | 'over'

export type Intensity = 'light' | 'hard' | 'extreme'

export type Instrument =
  | 'rotten-fruits'
  | 'rotten-eggs'
  | 'spoons-forks'
  | 'kitchen-utensils'
  | 'gun'
  | 'knife'

export interface Projectile {
  id: number
  sx: number
  sy: number
  tx: number
  ty: number
  t: number
  glyph: string
  kind: Instrument
}

export interface GameState {
  screen: Screen
  reason: string
  intensity: Intensity | null
  instrument: Instrument | null
  hitGoal: number
  hitsDone: number
  lastTick: number
  shake: number
  toast: string | null
  toastTimer: number
  photoUrl: string
  projectiles: Projectile[]
  splat: number
}

export const TARGET_NAME = 'Aadu'
export const PHOTO_PATH = './aadu.jpg'
export const PHOTO_FALLBACK = './aadu.svg'
export const MAIL_TO = 'atreus0103@gmail.com'
export const MAIL_FROM = 'patiladarsh65@gmail.com'

export const INTENSITY_OPTIONS: { id: Intensity; label: string; blurb: string }[] = [
  {
    id: 'light',
    label: 'Wants to just hit someone lightly',
    blurb: 'Messy, petty, cartoon splats.',
  },
  {
    id: 'hard',
    label: 'Wants to just hit someone hard',
    blurb: 'Kitchen drawer energy.',
  },
  {
    id: 'extreme',
    label: 'Kill someone',
    blurb: 'Cartoon only. This is a venting toy, not real life.',
  },
]

export const INSTRUMENTS: Record<Intensity, { id: Instrument; label: string; glyph: string }[]> = {
  light: [
    { id: 'rotten-fruits', label: 'Rotten fruits', glyph: '🍅' },
    { id: 'rotten-eggs', label: 'Rotten eggs', glyph: '🥚' },
  ],
  hard: [
    { id: 'spoons-forks', label: 'Spoon & forks', glyph: '🍴' },
    { id: 'kitchen-utensils', label: 'Kitchen utensils', glyph: '🍳' },
  ],
  extreme: [
    { id: 'gun', label: 'Gun', glyph: '💥' },
    { id: 'knife', label: 'Knife', glyph: '🔪' },
  ],
}

let projId = 1

export function createState(): GameState {
  return {
    screen: 'reason',
    reason: '',
    intensity: null,
    instrument: null,
    hitGoal: 5,
    hitsDone: 0,
    lastTick: performance.now(),
    shake: 0,
    toast: `Hint: “someone” is none other than ${TARGET_NAME}.`,
    toastTimer: 4,
    photoUrl: PHOTO_PATH,
    projectiles: [],
    splat: 0,
  }
}

export function setReason(state: GameState, reason: string) {
  state.reason = reason
}

export function pickIntensity(state: GameState, intensity: Intensity) {
  state.intensity = intensity
  state.instrument = null
  state.screen = 'instrument'
}

export function pickInstrument(state: GameState, instrument: Instrument) {
  if (!state.intensity) return
  const allowed = INSTRUMENTS[state.intensity].some((item) => item.id === instrument)
  if (!allowed) return
  state.instrument = instrument
  state.screen = 'hits'
}

export function setHitGoal(state: GameState, count: number) {
  state.hitGoal = Math.min(10, Math.max(1, Math.round(count)))
}

export function beginExecution(state: GameState) {
  if (!state.intensity || !state.instrument || !state.reason.trim()) return
  state.hitsDone = 0
  state.projectiles = []
  state.splat = 0
  state.shake = 0
  state.screen = 'play'
  state.toast = `${TARGET_NAME}. ${state.hitGoal} hit${state.hitGoal === 1 ? '' : 's'} to cool off.`
  state.toastTimer = 2.4
}

export function instrumentGlyph(instrument: Instrument): string {
  for (const group of Object.values(INSTRUMENTS)) {
    const found = group.find((item) => item.id === instrument)
    if (found) return found.glyph
  }
  return '💢'
}

export function launchHit(state: GameState) {
  if (state.screen !== 'play' || !state.instrument) return
  if (state.hitsDone >= state.hitGoal) return

  const fromGun = state.instrument === 'gun'
  const sx = fromGun ? -8 : 18 + Math.random() * 64
  const sy = fromGun ? 38 + Math.random() * 24 : 92
  const tx = 28 + Math.random() * 44
  const ty = 22 + Math.random() * 42

  state.projectiles.push({
    id: projId++,
    sx,
    sy,
    tx,
    ty,
    t: 0,
    glyph: instrumentGlyph(state.instrument),
    kind: state.instrument,
  })
}

export function tick(state: GameState, now: number): Instrument[] {
  const dt = Math.min(0.05, (now - state.lastTick) / 1000)
  state.lastTick = now
  if (state.shake > 0) state.shake = Math.max(0, state.shake - dt * 36)
  if (state.splat > 0) state.splat = Math.max(0, state.splat - dt * 1.6)

  if (state.toastTimer > 0) {
    state.toastTimer -= dt
    if (state.toastTimer <= 0) state.toast = null
  }

  if (state.screen !== 'play') return []

  const speed = state.instrument === 'gun' ? 3.4 : state.instrument === 'knife' ? 2.6 : 2.1
  const landed: number[] = []

  for (const p of state.projectiles) {
    p.t = Math.min(1, p.t + dt * speed)
    if (p.t >= 1) landed.push(p.id)
  }

  const impacts: Instrument[] = state.projectiles.filter((p) => landed.includes(p.id)).map((p) => p.kind)

  if (landed.length) {
    state.projectiles = state.projectiles.filter((p) => !landed.includes(p.id))
    for (let i = 0; i < landed.length; i++) {
      state.hitsDone += 1
      state.shake = Math.min(16, 7 + state.hitsDone)
      state.splat = 1
      if (state.hitsDone >= state.hitGoal) {
        state.screen = 'over'
        state.toast = null
        state.projectiles = []
        break
      }
    }
  }

  return impacts
}

export function remainingHits(state: GameState): number {
  return Math.max(0, state.hitGoal - state.hitsDone)
}

export function resetRun(state: GameState) {
  Object.assign(state, createState())
}

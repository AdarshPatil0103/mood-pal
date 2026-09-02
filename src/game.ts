export type Screen = 'title' | 'play' | 'over'

export type Mood =
  | 'sleepy'
  | 'calm'
  | 'hmm'
  | 'grumpy'
  | 'steaming'
  | 'volcanic'

export interface GameState {
  screen: Screen
  anger: number
  score: number
  combo: number
  comboTimer: number
  timeAlive: number
  pokes: number
  pets: number
  lastTick: number
  petHold: boolean
  shake: number
  toast: string | null
  toastTimer: number
  nextAnnoyance: number
  best: number
  lastRun: { score: number; timeAlive: number; pokes: number } | null
}

const BEST_KEY = 'mochi-anger-best'

export function moodFromAnger(anger: number): Mood {
  if (anger < 12) return 'sleepy'
  if (anger < 28) return 'calm'
  if (anger < 48) return 'hmm'
  if (anger < 68) return 'grumpy'
  if (anger < 88) return 'steaming'
  return 'volcanic'
}

export function moodCopy(mood: Mood): { label: string; hint: string } {
  switch (mood) {
    case 'sleepy':
      return { label: 'Sleepy', hint: 'Mochi is snug. A tiny poke is still a poke.' }
    case 'calm':
      return { label: 'Chill', hint: 'All good. Don’t push your luck.' }
    case 'hmm':
      return { label: 'Hmm…', hint: 'The eyebrow is doing a thing.' }
    case 'grumpy':
      return { label: 'Grumpy', hint: 'Pet. Immediately. Maybe snacks.' }
    case 'steaming':
      return { label: 'Steaming', hint: 'Ears are hot. Anger is a soup now.' }
    case 'volcanic':
      return { label: 'Volcanic', hint: 'One more poke and we all live with it.' }
  }
}

export function loadBest(): number {
  try {
    return Number(localStorage.getItem(BEST_KEY) ?? '0') || 0
  } catch {
    return 0
  }
}

function saveBest(score: number) {
  try {
    localStorage.setItem(BEST_KEY, String(score))
  } catch {
    /* private mode */
  }
}

export function createState(): GameState {
  return {
    screen: 'title',
    anger: 8,
    score: 0,
    combo: 0,
    comboTimer: 0,
    timeAlive: 0,
    pokes: 0,
    pets: 0,
    lastTick: performance.now(),
    petHold: false,
    shake: 0,
    toast: null,
    toastTimer: 0,
    nextAnnoyance: 6 + Math.random() * 5,
    best: loadBest(),
    lastRun: null,
  }
}

const ANNOYANCES = [
  'A mosquito hummed the wrong song.',
  'Someone said “calm down.”',
  'Sock was slightly damp.',
  'The wifi buffered. Once.',
  'A leaf touched a toe.',
  'They remembered that one typo.',
  'The fridge made a judgmental noise.',
  'A pigeon made eye contact.',
]

export function startRun(state: GameState) {
  state.screen = 'play'
  state.anger = 10
  state.score = 0
  state.combo = 0
  state.comboTimer = 0
  state.timeAlive = 0
  state.pokes = 0
  state.pets = 0
  state.lastTick = performance.now()
  state.petHold = false
  state.shake = 0
  state.toast = 'Be gentle… or don’t.'
  state.toastTimer = 1.6
  state.nextAnnoyance = 7 + Math.random() * 6
}

export function poke(state: GameState) {
  if (state.screen !== 'play') return
  const mood = moodFromAnger(state.anger)
  const spike =
    mood === 'sleepy'
      ? 7
      : mood === 'calm'
        ? 9
        : mood === 'hmm'
          ? 11
          : mood === 'grumpy'
            ? 13
            : mood === 'steaming'
              ? 16
              : 20
  state.anger = Math.min(100, state.anger + spike)
  state.comboTimer = 1.15
  state.combo += 1
  state.pokes += 1
  const points = Math.round(10 * state.combo * (1 + state.anger / 120))
  state.score += points
  state.shake = Math.min(18, 6 + state.combo)
  if (state.anger >= 100) tantrum(state)
}

export function beginPet(state: GameState) {
  if (state.screen !== 'play') return
  state.petHold = true
}

export function endPet(state: GameState) {
  state.petHold = false
}

export function petPulse(state: GameState) {
  if (state.screen !== 'play') return
  state.anger = Math.max(0, state.anger - 8)
  state.pets += 1
  state.combo = 0
  state.comboTimer = 0
  state.shake = 3
  state.score += 2
}

function tantrum(state: GameState) {
  const timeBonus = Math.floor(state.timeAlive * 4)
  const finalScore = state.score + timeBonus
  state.score = finalScore
  if (finalScore > state.best) {
    state.best = finalScore
    saveBest(finalScore)
  }
  state.lastRun = {
    score: finalScore,
    timeAlive: state.timeAlive,
    pokes: state.pokes,
  }
  state.screen = 'over'
  state.petHold = false
  state.shake = 22
  state.toast = null
}

export function tick(state: GameState, now: number) {
  const dt = Math.min(0.05, (now - state.lastTick) / 1000)
  state.lastTick = now
  if (state.shake > 0) state.shake = Math.max(0, state.shake - dt * 40)

  if (state.toastTimer > 0) {
    state.toastTimer -= dt
    if (state.toastTimer <= 0) state.toast = null
  }

  if (state.screen !== 'play') return

  state.timeAlive += dt

  if (state.comboTimer > 0) {
    state.comboTimer -= dt
    if (state.comboTimer <= 0) state.combo = 0
  }

  // Impatience: the calmer they are, the slower the rise. High anger snowballs.
  const rise = 1.4 + (state.anger / 100) * 4.2
  state.anger = Math.min(100, state.anger + rise * dt)

  if (state.petHold) {
    state.anger = Math.max(0, state.anger - 18 * dt)
  }

  state.nextAnnoyance -= dt
  if (state.nextAnnoyance <= 0) {
    const line = ANNOYANCES[Math.floor(Math.random() * ANNOYANCES.length)]
    state.toast = line
    state.toastTimer = 2.2
    state.anger = Math.min(100, state.anger + 9 + Math.random() * 8)
    state.shake = 10
    state.nextAnnoyance = 6 + Math.random() * 8
    if (state.anger >= 100) tantrum(state)
  }
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

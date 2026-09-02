let ctx: AudioContext | null = null

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(
  frequency: number,
  duration: number,
  type: OscillatorType,
  gain = 0.08,
  slideTo?: number,
) {
  const ac = audio()
  if (!ac) return
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(frequency, ac.currentTime)
  if (slideTo !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), ac.currentTime + duration)
  }
  g.gain.setValueAtTime(gain, ac.currentTime)
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration)
  osc.connect(g)
  g.connect(ac.destination)
  osc.start()
  osc.stop(ac.currentTime + duration)
}

export function pokeSound(anger: number) {
  const f = 220 + anger * 4
  tone(f, 0.12, 'square', 0.05, f * 0.6)
}

export function petSound() {
  tone(520, 0.16, 'sine', 0.05, 720)
  tone(780, 0.2, 'triangle', 0.03, 980)
}

export function boomSound() {
  tone(180, 0.35, 'sawtooth', 0.07, 60)
  tone(90, 0.5, 'square', 0.05, 40)
}

export function startSound() {
  tone(392, 0.12, 'triangle', 0.05)
  setTimeout(() => tone(523, 0.14, 'triangle', 0.05), 90)
  setTimeout(() => tone(659, 0.18, 'triangle', 0.05), 180)
}

export function unlockAudio() {
  audio()
}

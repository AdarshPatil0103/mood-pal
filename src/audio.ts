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

export function throwSound() {
  tone(240, 0.18, 'square', 0.05, 90)
}

export function splatSound() {
  tone(160, 0.22, 'sawtooth', 0.06, 50)
}

export function bangSound() {
  tone(90, 0.28, 'square', 0.07, 40)
  tone(420, 0.08, 'triangle', 0.04)
}

export function startSound() {
  tone(392, 0.12, 'triangle', 0.05)
  setTimeout(() => tone(523, 0.14, 'triangle', 0.05), 90)
}

export function unlockAudio() {
  audio()
}

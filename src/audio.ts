import type { Instrument } from './game'

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
  delay = 0,
) {
  const ac = audio()
  if (!ac) return
  const t = ac.currentTime + delay
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(frequency, t)
  if (slideTo !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), t + duration)
  }
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration)
  osc.connect(g)
  g.connect(ac.destination)
  osc.start(t)
  osc.stop(t + duration)
}

function noise(duration: number, gain: number, freq: number, type: BiquadFilterType = 'lowpass', delay = 0) {
  const ac = audio()
  if (!ac) return
  const t = ac.currentTime + delay
  const count = Math.max(1, Math.floor(ac.sampleRate * duration))
  const buf = ac.createBuffer(1, count, ac.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < count; i++) data[i] = Math.random() * 2 - 1
  const src = ac.createBufferSource()
  src.buffer = buf
  const filter = ac.createBiquadFilter()
  filter.type = type
  filter.frequency.setValueAtTime(freq, t)
  const g = ac.createGain()
  g.gain.setValueAtTime(gain, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration)
  src.connect(filter)
  filter.connect(g)
  g.connect(ac.destination)
  src.start(t)
  src.stop(t + duration)
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

export function launchSound(instrument: Instrument) {
  if (instrument === 'gun') {
    bangSound()
    return
  }
  if (instrument === 'knife') {
    noise(0.12, 0.08, 2400, 'highpass')
    tone(720, 0.14, 'sawtooth', 0.05, 180)
    return
  }
  if (instrument === 'spoons-forks' || instrument === 'kitchen-utensils') {
    tone(280, 0.16, 'square', 0.04, 110)
    tone(880, 0.06, 'triangle', 0.03)
    return
  }
  throwSound()
}

export function impactSound(instrument: Instrument, delay = 0) {
  switch (instrument) {
    case 'rotten-fruits':
      noise(0.22, 0.14, 700, 'lowpass', delay)
      tone(190, 0.2, 'sawtooth', 0.08, 55, delay)
      break
    case 'rotten-eggs':
      noise(0.08, 0.12, 3200, 'highpass', delay)
      noise(0.2, 0.11, 500, 'lowpass', delay + 0.04)
      tone(210, 0.18, 'square', 0.06, 70, delay)
      break
    case 'spoons-forks':
      tone(920, 0.16, 'triangle', 0.09, 420, delay)
      tone(1380, 0.1, 'square', 0.05, 700, delay)
      noise(0.08, 0.06, 1800, 'bandpass', delay)
      break
    case 'kitchen-utensils':
      tone(240, 0.22, 'square', 0.1, 90, delay)
      tone(640, 0.18, 'triangle', 0.07, 280, delay)
      noise(0.16, 0.1, 900, 'lowpass', delay)
      break
    case 'gun':
      noise(0.18, 0.16, 400, 'lowpass', delay)
      tone(70, 0.32, 'square', 0.12, 40, delay)
      tone(380, 0.08, 'triangle', 0.05, undefined, delay)
      break
    case 'knife':
      noise(0.14, 0.12, 2800, 'highpass', delay)
      tone(980, 0.12, 'sawtooth', 0.07, 220, delay)
      tone(160, 0.16, 'square', 0.05, 80, delay)
      break
    default:
      splatSound()
  }
}

export function unlockAudio() {
  audio()
}

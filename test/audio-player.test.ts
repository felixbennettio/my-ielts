import { describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { createAudioPlayer } from '../src/composables/audioPlayer'

class FakeAudio extends EventTarget {
  src = ''
  currentTime = 0
  duration = 60
  paused = true
  load = vi.fn(() => { this.currentTime = 0 })
  play = vi.fn(() => {
    this.paused = false
    this.dispatchEvent(new Event('play'))
    return Promise.resolve()
  })
  pause = vi.fn(() => {
    this.paused = true
    this.dispatchEvent(new Event('pause'))
  })
  removeAttribute(name: string) { if (name === 'src') this.src = '' }
}
function setup() {
  const player = createAudioPlayer()
  const audio = new FakeAudio()
  player.connect(audio as unknown as HTMLAudioElement)
  return { player, audio }
}

describe('persistent audio player', () => {
  it('uses the same audio element when switching chapter and word audio', () => {
    const { player, audio } = setup()
    player.play('/chapter.mp3', '整章音频')
    expect(player.playing.value).toBe(true)
    audio.currentTime = 25
    player.play('/word.mp3', '单词读音')
    expect(audio.pause).toHaveBeenCalledTimes(2)
    expect(audio.src).toBe('/word.mp3')
    expect(audio.currentTime).toBe(0)
    expect(player.current.value?.title).toBe('单词读音')
  })

  it('pauses and resumes without losing playback position', () => {
    const { player, audio } = setup()
    player.play('/chapter.mp3', '整章音频')
    audio.currentTime = 25
    player.toggle()
    expect(audio.paused).toBe(true)
    expect(player.playing.value).toBe(false)
    player.toggle()
    expect(audio.currentTime).toBe(25)
    expect(player.playing.value).toBe(true)
  })

  it('updates playback state when native controls or playback completion pause audio', () => {
    const { player, audio } = setup()
    player.play('/word.mp3', '单词')
    audio.pause()
    expect(player.playing.value).toBe(false)
    void audio.play()
    expect(player.playing.value).toBe(true)
    audio.dispatchEvent(new Event('ended'))
    expect(player.playing.value).toBe(false)
  })

  it('closes and unloads the source so audio cannot continue invisibly', () => {
    const { player, audio } = setup()
    player.play('/word.mp3', '单词')
    player.close()
    expect(audio.paused).toBe(true)
    expect(audio.src).toBe('')
    expect(player.current.value).toBeNull()
    expect(player.playing.value).toBe(false)
    audio.dispatchEvent(new Event('error'))
    expect(player.error.value).toBe('')
  })

  it('handles page requests that arrive before the player mounts', () => {
    const player = createAudioPlayer()
    player.play('/word.mp3', '单词')
    const audio = new FakeAudio()
    player.connect(audio as unknown as HTMLAudioElement)
    expect(audio.src).toBe('/word.mp3')
    expect(player.playing.value).toBe(true)
  })

  it('clamps keyboard seeking and ignores audio that has no duration yet', () => {
    const { player, audio } = setup()
    player.play('/chapter.mp3', '整章音频')
    player.seekBy(-5)
    expect(audio.currentTime).toBe(0)
    audio.currentTime = 58
    player.seekBy(5)
    expect(audio.currentTime).toBe(60)
    audio.duration = Number.NaN
    player.seekBy(-5)
    expect(audio.currentTime).toBe(60)
  })

  it('offers a retry when autoplay is blocked', async () => {
    const { player, audio } = setup()
    audio.play.mockRejectedValueOnce(new DOMException('blocked', 'NotAllowedError'))
    player.play('/word.mp3', '单词')
    await flushPromises()
    expect(player.error.value).toContain('点击播放按钮')
    player.toggle()
    await flushPromises()
    expect(player.error.value).toBe('')
    expect(player.playing.value).toBe(true)
  })

  it('ignores a rejected playback request from an earlier source', async () => {
    const { player, audio } = setup()
    let rejectOld: (reason: Error) => void = () => {}
    audio.play.mockImplementationOnce(() => new Promise<void>((_, reject) => { rejectOld = reject }))
    player.play('/old.mp3', '旧音频')
    player.play('/new.mp3', '新音频')
    rejectOld(new Error('old request failed'))
    await flushPromises()
    expect(player.current.value?.title).toBe('新音频')
    expect(player.error.value).toBe('')
    expect(player.playing.value).toBe(true)
  })
})

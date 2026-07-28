/* minimal YouTube IFrame API surface used by SongsPlayer */
interface YTPlayer {
  loadVideoById(id: string): void
  playVideo(): void
  pauseVideo(): void
  setVolume(v: number): void
  getVolume(): number
  getCurrentTime(): number
  getDuration(): number
  destroy(): void
}
interface YTPlayerEvent { target: YTPlayer; data?: number }
interface YTNamespace {
  Player: new (el: HTMLElement | string, opts: {
    videoId: string
    playerVars?: Record<string, string | number>
    events?: {
      onReady?: (e: YTPlayerEvent) => void
      onStateChange?: (e: YTPlayerEvent) => void
      onError?: (e: YTPlayerEvent) => void
    }
  }) => YTPlayer
  PlayerState: { PLAYING: number; PAUSED: number; ENDED: number; BUFFERING: number }
}
interface Window {
  YT?: YTNamespace
  onYouTubeIframeAPIReady?: () => void
}

import { Sheet } from '../scenes'
import { StaffConfig } from './staff'

type PlaybackState = 'regular' | 'reverse'

export class PlaybackCursor extends Phaser.GameObjects.Image {
  scene: Sheet
  private staffConfig: StaffConfig
  tween: Phaser.Tweens.Tween
  private readonly minTimeToCompleteBarMs = 1500
  private readonly maxTimeToCompleteBarMs = 9500
  private timeToCompleteBarMs = 5000
  private playbackState: PlaybackState
  private currentStaffIndex: number
  bugColor = 0x380501

  constructor(scene: Sheet, staffConfig: StaffConfig) {
    super(scene, 0, 0, 'playback-cursor')
    this.scene = scene
    scene.add.existing(this)
    scene.physics.add.existing(this)
    this._body.allowGravity = false

    this.staffConfig = staffConfig
    this.currentStaffIndex = 0

    this.x = this.staffConfig.x
    this.y = this.staffConfig.y + this.staffConfig.height / 2

    this.setScale(1, 0.95 * (scene.height / this.height))
    this.playbackState = 'regular'

    this.tween = scene.tweens.add(this.tweenConfig)

    scene.scene
      .get('ui')
      .events.on('playback_speed_updated', (playbackSpeed: number) => {
        // This will only take effect after the tween completes (i.e. next bar)
        // because tween.seek(currentProgress) doesn't work for some reason.
        this.timeToCompleteBarMs =
          this.minTimeToCompleteBarMs +
          (1 - playbackSpeed) *
            (this.maxTimeToCompleteBarMs - this.minTimeToCompleteBarMs)
      })
      .on('playback_restarted', () => {
        const isPaused = this.tween.paused
        this.currentStaffIndex = 0
        this.tween.stop()
        const nextTweenConfig = this.tweenConfig
        if (this.playbackState === 'reverse') {
          // Reverse the `to` and `from` values.
          // This will play the bars in reverse while keeping the
          // bar order the same.
          ;[nextTweenConfig.x.to, nextTweenConfig.x.from] = [
            nextTweenConfig.x.from,
            nextTweenConfig.x.to,
          ]
        }
        this.tween = this.scene.tweens.add({
          ...nextTweenConfig,
          paused: isPaused,
        })
        this.x =
          this.playbackState === 'reverse'
            ? nextTweenConfig.x.to
            : nextTweenConfig.x.from
      })
      .on('playback_skipped_backward', () => {
        // 20% threshold so that clicking quickly(ish) results
        // in skipping to the previous bar
        if (this.tween.progress > 0.2) {
          if (this.tween.paused) {
            this.tween.stop()
            const nextTweenConfig = this.tweenConfig
            if (this.playbackState === 'reverse') {
              // Reverse the `to` and `from` values.
              // This will play the bars in reverse while keeping the
              // bar order the same.
              ;[nextTweenConfig.x.to, nextTweenConfig.x.from] = [
                nextTweenConfig.x.from,
                nextTweenConfig.x.to,
              ]
            }
            this.tween = this.scene.tweens.add({
              ...nextTweenConfig,
              paused: true,
            })
            this.x =
              this.playbackState === 'reverse'
                ? nextTweenConfig.x.to
                : nextTweenConfig.x.from
          } else {
            this.tween.restart()
          }
        } else {
          const isPaused = this.tween.paused
          this.tween.stop()

          // negative looping
          this.currentStaffIndex =
            (this.scene.totalPages +
              ((this.currentStaffIndex - 1) % this.scene.totalPages)) %
            this.scene.totalPages

          const nextTweenConfig = this.tweenConfig
          if (this.playbackState === 'reverse') {
            // Reverse the `to` and `from` values.
            // This will play the bars in reverse while keeping the
            // bar order the same.
            ;[nextTweenConfig.x.to, nextTweenConfig.x.from] = [
              nextTweenConfig.x.from,
              nextTweenConfig.x.to,
            ]
          }
          this.tween = this.scene.tweens.add({
            ...nextTweenConfig,
            paused: isPaused,
          })
          this.x =
            this.playbackState === 'reverse'
              ? nextTweenConfig.x.to
              : nextTweenConfig.x.from
        }
      })
      .on('playback_skipped_forward', () => {
        const isPaused = this.tween.paused
        this.tween.stop()

        this.currentStaffIndex =
          (this.currentStaffIndex + 1) % this.scene.totalPages

        const nextTweenConfig = this.tweenConfig
        if (this.playbackState === 'reverse') {
          // Reverse the `to` and `from` values.
          // This will play the bars in reverse while keeping the
          // bar order the same.
          ;[nextTweenConfig.x.to, nextTweenConfig.x.from] = [
            nextTweenConfig.x.from,
            nextTweenConfig.x.to,
          ]
        }
        this.tween = this.scene.tweens.add({
          ...nextTweenConfig,
          paused: isPaused,
        })
        this.x =
          this.playbackState === 'reverse'
            ? nextTweenConfig.x.to
            : nextTweenConfig.x.from
      })
      .on('playback_paused', () => {
        this.tween.pause()
      })
      .on('playback_resumed', () => {
        this.tween.resume()
      })
  }

  get tweenConfig() {
    const currentLeftBoundary =
      this.scene.leftBoundaries[this.currentStaffIndex]
    const staffX1 =
      this.currentStaffIndex === 0
        ? currentLeftBoundary + this.staffConfig.x
        : currentLeftBoundary +
          2 * this.scene._16thGap -
          ((currentLeftBoundary - this.staffConfig.x) % this.scene._16thGap)

    return {
      targets: this,
      x: {
        from: staffX1,
        to: staffX1 + this.staffConfig.width,
      },
      ease: 'Linear',
      duration: this.timeToCompleteBarMs,
      yoyo: false,
      onComplete: () => this.onTweenComplete(),
    }
  }

  get _body(): Phaser.Physics.Arcade.Body {
    return this.body as Phaser.Physics.Arcade.Body
  }

  private onTweenComplete() {
    this.currentStaffIndex =
      this.playbackState === 'reverse'
        ? (this.scene.totalPages +
            ((this.currentStaffIndex - 1) % this.scene.totalPages)) %
          this.scene.totalPages
        : (this.currentStaffIndex + 1) % this.scene.totalPages

    this.tween.stop()
    const nextTweenConfig = this.tweenConfig
    if (this.playbackState === 'reverse') {
      // Reverse the `to` and `from` values.
      // This will play the bars in reverse while keeping the
      // bar order the same.
      ;[nextTweenConfig.x.to, nextTweenConfig.x.from] = [
        nextTweenConfig.x.from,
        nextTweenConfig.x.to,
      ]
    }
    this.tween = this.scene.tweens.add(nextTweenConfig)
  }

  reversePlaybackDirection() {
    this.playbackState = 'reverse'
    this.setTintFill(this.bugColor)
  }

  resetPlayback() {
    this.playbackState = 'regular'
    this.clearTint()
  }

  resetAndPlay() {
    this.resetPlayback()
    this.x = this.staffConfig.x
    this.currentStaffIndex = 0
    this.tween.stop()
    this.scene.time.addEvent({
      delay: 200,
      callback: () => {
        this.tween = this.scene.tweens.add(this.tweenConfig)
      },
    })
  }
}

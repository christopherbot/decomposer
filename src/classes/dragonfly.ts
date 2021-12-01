import { Sheet } from '../scenes'
import { Bug } from './bug'
import { PlaybackCursor } from './playback-cursor'

export class Dragonfly extends Bug {
  targetPlaybackCursor: PlaybackCursor
  dx!: number

  constructor(scene: Sheet, x: number, y: number, target: any) {
    super(
      scene,
      x,
      y,
      'dragonfly',
      target,
      250,
      false,
      (dx: number) => this.onTargetReached(dx),
      () => this.onCustomUpdate(),
    )

    this.targetPlaybackCursor = target

    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('dragonfly', {
        start: 0,
        end: 3,
      }),
      frameRate: 4,
      repeat: -1,
    })
    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('dragonfly', {
        start: 7,
        end: 10,
      }),
      frameRate: 8,
      repeat: -1,
    })
    this.anims.create({
      key: 'jump',
      frames: this.anims.generateFrameNumbers('dragonfly', {
        start: 14,
        end: 17,
      }),
      frameRate: 8,
      repeat: -1,
    })
    this.anims.create({
      key: 'hit',
      frames: this.anims.generateFrameNumbers('dragonfly', {
        start: 21,
        end: 27,
      }),
      frameRate: 12,
    })

    this.play('idle')

    this.setScale(3)
  }

  onTargetReached(dx: number) {
    this.dx = dx
    this.targetPlaybackCursor.reversePlaybackDirection()
    this.play('jump')
  }

  onCustomUpdate() {
    this.x = this.targetPlaybackCursor.x - this.dx
  }

  onHit() {
    super.onHit()
    this.targetPlaybackCursor.resetPlayback()
  }
}

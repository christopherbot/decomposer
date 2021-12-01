import { Sheet } from '../scenes'
import { Bug } from './bug'
import { PlacedNote } from './placed-note'

export class Spider extends Bug {
  targetNote: PlacedNote

  constructor(scene: Sheet, x: number, y: number, target: PlacedNote) {
    super(
      scene,
      x,
      y,
      'spider',
      target,
      Phaser.Math.Between(80, 200),
      true,
      () => this.onTargetReached(),
    )

    this.targetNote = target
    this.targetNote.onTargeted()

    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('spider', {
        start: 72,
        end: 76,
      }),
      frameRate: 4,
      repeat: -1,
    })
    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('spider', {
        start: 81,
        end: 86,
      }),
      frameRate: 8,
      repeat: -1,
    })
    this.anims.create({
      key: 'jump',
      frames: this.anims.generateFrameNumbers('spider', {
        start: 90,
        end: 98,
      }),
      frameRate: 12,
      repeat: -1,
    })
    this.anims.create({
      key: 'attack',
      frames: this.anims.generateFrameNumbers('spider', {
        start: 108,
        end: 111,
      }),
      frameRate: 4,
    })
    this.anims.create({
      key: 'hit',
      frames: this.anims.generateFrameNumbers('spider', {
        frames: [117, 118, 119, 126, 127, 128, 129, 130, 131, 132, 133, 134],
      }),
      frameRate: 12,
    })

    this.play('idle')

    this.setScale(3)
    this.body.setSize(24, 16).setOffset(4, 16)
  }

  onTargetReached() {
    this.targetNote.modifyPitch()
  }

  onHit() {
    super.onHit()
    this.targetNote.resetPitch()
  }
}

import { Sheet } from '../scenes'
import { Player } from './player'

export class Mushroom extends Player {
  isHit = false

  constructor(scene: Sheet, x: number, y: number) {
    super(scene, x, y, 'mushroom-idle')

    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('mushroom-idle', {
        start: 0,
        end: 3,
      }),
      frameRate: 4,
      repeat: -1,
    })
    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('mushroom-run', {
        start: 0,
        end: 3,
      }),
      frameRate: 8,
      repeat: -1,
    })
    this.anims.create({
      key: 'jump',
      frames: this.anims.generateFrameNumbers('mushroom-jump', {
        start: 0,
        end: 3,
      }),
      frameRate: 8,
    })
    this.anims.create({
      key: 'hit',
      frames: this.anims.generateFrameNumbers('mushroom-hit', {
        start: 0,
        end: 3,
      }),
      frameRate: 12,
    })

    this.play('idle')

    this.setScale(2)
  }

  onHit() {
    this.once(
      'animationcomplete',
      (animation: Phaser.Animations.Animation) => {
        if (animation.key === 'hit') {
          super.onHitDone()
        }
      },
      this,
    )
    super.onHit()
  }
}

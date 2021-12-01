import { NPC } from './npc'

export class Ent extends NPC {
  initialX: number

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'ent-idle')

    this.initialX = x

    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('ent-idle', {
        start: 0,
        end: 3,
      }),
      frameRate: 4,
      repeat: -1,
    })
    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('ent-run', {
        start: 0,
        end: 3,
      }),
      frameRate: 8,
    })

    this.play('idle')

    this.setScale(2)

    scene.scene
      .get('ui')
      .events.on('playback_paused', () => {
        this.anims.pause()
      })
      .on('playback_resumed', () => {
        this.anims.resume()
      })
  }

  runOnce() {
    this.once(
      'animationcomplete',
      (animation: Phaser.Animations.Animation) => {
        if (animation.key === 'run') {
          this.play('idle')
        }
      },
      this,
    )
    this.play('run', true)
  }
}

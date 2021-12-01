import { Sheet } from '../scenes'
import { Actor } from './actor'

export class Bug extends Actor {
  private velocityX: number
  private distanceToTargetThreshold = 30
  private _target!: { x: number; y: number }
  canAttack: boolean
  _onTargetReached: (dx: number, dy: number) => void
  _onCustomUpdate?: () => void
  isAtTarget = false
  nextAttackTime = 0
  isAttacking = false
  isHit = false

  constructor(
    scene: Sheet,
    x: number,
    y: number,
    texture: string,
    target: { x: number; y: number },
    velocity: number,
    canAttack: boolean,
    onTargetReached: (dx: number, dy: number) => void,
    onCustomUpdate?: () => void,
  ) {
    super(scene, x, y, texture)

    this._target = target
    this.velocityX = velocity
    this.canAttack = canAttack
    this._onTargetReached = onTargetReached
    this._onCustomUpdate = onCustomUpdate
  }

  onHit() {
    this.isHit = true
    this.once(
      'animationcomplete',
      (animation: Phaser.Animations.Animation) => {
        if (animation.key === 'hit') {
          this.destroy()
        }
      },
      this,
    )
    this.play('hit', true)
  }

  update(time: number, delta: number): void {
    if (this.isHit) {
      this.setVelocity(0)
      return
    }

    if (this.isAtTarget && this._onCustomUpdate) {
      this._onCustomUpdate()
      return
    }

    var dx = this._target.x - this.x
    var dy = this._target.y - this.y

    const isMovingX = Math.abs(dx) > this.distanceToTargetThreshold
    const isMovingY = Math.abs(dy) > this.distanceToTargetThreshold

    if (isMovingX) {
      this.flipX = Math.sign(dx) === -1
      this.setVelocityX(Math.sign(dx) * this.velocityX)
    } else {
      this.setVelocityX(0)
    }
    if (isMovingY) {
      this.setVelocityY(Math.sign(dy) * this.velocityX)
    } else {
      this.setVelocityY(0)
    }

    if (
      this.canAttack &&
      !isMovingX &&
      !isMovingY &&
      time >= this.nextAttackTime
    ) {
      this.nextAttackTime = time + 1000 / 0.4
      this.isAttacking = true
      this.once(
        'animationcomplete',
        (animation: Phaser.Animations.Animation) => {
          if (animation.key === 'attack') {
            this.isAttacking = false
          }
        },
        this,
      )
      this.play('attack', true)
    }

    if (this.isAttacking) {
      return
    }

    if (!isMovingX && !isMovingY) {
      if (!this.isAtTarget) {
        this._onTargetReached(dx, dy)
        this.isAtTarget = true
      }

      this.play('idle', true)
    } else if (isMovingY) {
      this.play('jump', true)
    } else {
      this.play('run', true)
    }
  }
}

import { Sheet } from '../scenes'
import { Actor } from './actor'

export class Player extends Actor {
  private readonly velocityX = 250
  private readonly velocityY = 470
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private keyW: Phaser.Input.Keyboard.Key
  private keyA: Phaser.Input.Keyboard.Key
  private keyS: Phaser.Input.Keyboard.Key
  private keyD: Phaser.Input.Keyboard.Key
  isHit = false
  hasDoubleJumped = false
  isJumping = false

  constructor(scene: Sheet, x: number, y: number, texture: string) {
    super(scene, x, y, texture)

    this.cursors = scene.input.keyboard.createCursorKeys()
    this.keyW = scene.input.keyboard.addKey('W')
    this.keyA = scene.input.keyboard.addKey('A')
    this.keyS = scene.input.keyboard.addKey('S')
    this.keyD = scene.input.keyboard.addKey('D')
  }

  private get upKeys() {
    return [this.cursors.up, this.keyW]
  }

  private get downKeys() {
    return [this.cursors.down, this.keyS]
  }

  private get leftKeys() {
    return [this.cursors.left, this.keyA]
  }

  private get rightKeys() {
    return [this.cursors.right, this.keyD]
  }

  private isSomeKeyDown(keys: Phaser.Input.Keyboard.Key[]) {
    return keys.some(key => key.isDown)
  }

  private isSomeKeyJustDown(keys: Phaser.Input.Keyboard.Key[]) {
    return keys.some(key => Phaser.Input.Keyboard.JustDown(key))
  }

  onHit() {
    this.isHit = true
    this._body.setVelocityY(-this.velocityY / 2)
    this.play('hit')
  }

  onHitDone() {
    this.isHit = false
    // reset jumping state in case a hit animation interrupts a jump animation:
    this.isJumping = false
  }

  update(): void {
    if (
      !this.isHit &&
      !this.isJumping &&
      !this.isSomeKeyDown(this.leftKeys) &&
      !this.isSomeKeyDown(this.rightKeys) &&
      !this.isSomeKeyDown(this.upKeys) &&
      !this.isSomeKeyDown(this.downKeys)
    ) {
      this.play('idle', true)
    }

    if (
      !this.isHit &&
      !this.isJumping &&
      (this.isSomeKeyDown(this.leftKeys) ||
        this.isSomeKeyDown(this.rightKeys)) &&
      !this.isSomeKeyDown(this.upKeys) &&
      !this.isSomeKeyDown(this.downKeys)
    ) {
      this.play('run', true)
    }

    if (
      !this.isHit &&
      this.isSomeKeyJustDown(this.upKeys) &&
      (this._body.onFloor() || !this.hasDoubleJumped)
    ) {
      if (!this._body.onFloor()) {
        this.hasDoubleJumped = true
      }
      this._body.setVelocityY(-this.velocityY)
      if (!this.isHit) {
        this.isJumping = true
        this.play('jump', true)
        this.once(
          'animationcomplete',
          (animation: Phaser.Animations.Animation) => {
            if (animation.key === 'jump') {
              this.isJumping = false
            }
          },
          this,
        )
      }
    }

    if (this.hasDoubleJumped && this._body.onFloor()) {
      this.hasDoubleJumped = false
    }

    if (this.isSomeKeyDown(this.downKeys)) {
      this._body.setVelocityY(100)
    }

    if (
      !this.isSomeKeyDown(this.leftKeys) &&
      !this.isSomeKeyDown(this.rightKeys)
    ) {
      this._body.setVelocityX(0)
    }

    if (this.isSomeKeyDown(this.leftKeys)) {
      this.flipX = true
      this._body.setVelocityX(-this.velocityX)
    }

    if (this.isSomeKeyDown(this.rightKeys)) {
      this.flipX = false
      this._body.setVelocityX(this.velocityX)
    }
  }
}

import { BaseScene } from './base-scene'

export class Title extends BaseScene {
  private riverVolume = 0.04
  private riverSound!: Phaser.Sound.BaseSound
  private sounds!: Record<string, Phaser.Sound.BaseSound>
  private bgSprite!: Phaser.GameObjects.Sprite
  private enterKey!: Phaser.Input.Keyboard.Key
  private heightScale!: number
  private panConfig!: any // too lazy to type
  private pan!: Phaser.Tweens.Tween
  private isStarting = false
  private titleText!: Phaser.GameObjects.Text
  private leftBarText!: Phaser.GameObjects.Text
  private rightBarText!: Phaser.GameObjects.Text
  private playText!: Phaser.GameObjects.Text
  private noteText!: Phaser.GameObjects.Text
  private authorText!: Phaser.GameObjects.Text

  constructor() {
    super('title')
  }

  activatePlayText() {
    this.playText.setColor('#0095e2')
    this.tweens.add({
      targets: this.leftBarText,
      x: this.middleX - 170,
      duration: 300,
      ease: 'Cubic.easeIn',
    })
    this.tweens.add({
      targets: this.rightBarText,
      x: this.middleX + 170,
      duration: 300,
      ease: 'Cubic.easeIn',
    })
    this.tweens.add({
      targets: this.noteText,
      alpha: 1,
      duration: 300,
      delay: 150,
    })
  }

  onStart(): void {
    if (this.isStarting) {
      return
    }

    this.sound.play('2E')
    this.time.addEvent({
      delay: 250,
      callback: () => {
        this.sound.play('3E')
        this.sound.play('3G')
        this.sound.play('4B')
        this.sound.play('4D')
      },
    })
    ;[this.leftBarText, this.rightBarText, this.noteText].forEach(text => {
      text
        .setColor('#000000')
        .setShadowColor('#ffffff')
        .setShadowBlur(2)
        .setShadowOffset(1, 1)
    })

    this.isStarting = true
    const panProgress = this.pan.progress
    this.pan.stop()
    this.pan = this.tweens.add({
      ...this.panConfig,
      ease: 'Cubic.easeInOut',
      duration: panProgress === 1 ? 100 : panProgress > 0.5 ? 1000 : 2000,
      onComplete: () => {
        this.tweens.add({
          targets: [
            this.leftBarText,
            this.rightBarText,
            this.playText,
            this.noteText,
            this.authorText,
          ],
          alpha: 0,
          duration: 500,
          delay: 200,
        })
        this.tweens.add({
          targets: this.titleText,
          y: 50,
          duration: 2000,
          ease: 'Cubic.easeInOut',
          delay: 200,
        })
        this.tweens.add({
          targets: this.riverSound,
          volume: {
            getStart: () => this.riverVolume,
            getEnd: () => 0,
          },
          duration: 1500,
          ease: 'Linear',
          onComplete: () => this.riverSound.stop(),
        })
        const zoomScale = 4
        this.tweens.add({
          targets: this.bgSprite,
          scale: this.heightScale * zoomScale,
          x: zoomScale * (-this.bgSprite.displayWidth * 0.34),
          y: zoomScale * (-this.bgSprite.displayHeight * 0.132),
          duration: 2000,
          delay: 200,
          ease: 'Cubic.easeInOut',
          onComplete: () => {
            this.scene
              .launch('background', {
                scale: this.bgSprite.scale,
              })
              .launch('ui')
              .launch('sheet', {
                sounds: this.sounds,
              })
              .stop()
          },
        })
      },
    })
  }

  preload(): void {}

  create(data: { sounds: Record<string, Phaser.Sound.BaseSound> }): void {
    this.riverSound = this.sound.add('river', { volume: this.riverVolume })
    this.riverSound.play()

    this.sounds = data.sounds
    this.enterKey = this.input.keyboard.addKey('enter')

    this.bgSprite = this.add.sprite(0, 0, 'forest-gif').setOrigin(0, 0)
    this.heightScale = this.gameHeight / this.bgSprite.height
    this.bgSprite.setScale(this.heightScale)
    this.bgSprite.anims.create({
      key: 'gif',
      frames: this.anims.generateFrameNumbers('forest-gif', {
        start: 0,
        end: 5,
      }),
      frameRate: 6,
      repeat: -1,
    })
    this.bgSprite.play('gif')

    this.panConfig = {
      targets: this.bgSprite,
      x: this.gameWidth - this.bgSprite.displayWidth,
      duration: 30000,
    }
    this.pan = this.tweens.add(this.panConfig)

    this.titleText = this.add
      .text(
        this.middleX,
        this.middleY - 100,
        this.gameTitle,
        this.gameTitleConfig,
      )
      .setOrigin(0.5, 0.5)
      .setPadding(5)

    this.noteText = this.add
      .text(this.middleX, this.middleY + 40, '♫             ♪', {
        ...this.textConfig,
        fontSize: '40px',
        shadow: this.textShadow,
      })
      .setOrigin(0.5, 0.5)
      .setAlpha(0)
    this.leftBarText = this.add
      .text(this.middleX - 70, this.middleY + 40, '𝄆', {
        ...this.textConfig,
        fontSize: '60px',
        shadow: this.textShadow,
      })
      .setOrigin(0.5, 0.5)
    this.rightBarText = this.add
      .text(this.middleX + 70, this.middleY + 40, '𝄇', {
        ...this.textConfig,
        fontSize: '60px',
        shadow: this.textShadow,
      })
      .setOrigin(0.5, 0.5)
    this.playText = this.add
      .text(this.middleX, this.middleY + 40, '            Play            ', {
        ...this.textConfig,
        fontSize: '40px',
        shadow: this.textShadow,
      })
      .setOrigin(0.5, 0.5)
      .setPadding(5)
      .setInteractive()
      .on('pointerover', () => {
        if (this.isStarting) {
          return
        }

        this.activatePlayText()
      })
      .on('pointerout', () => {
        if (this.isStarting) {
          return
        }

        this.playText.setColor('#ffffff')
        this.tweens.add({
          targets: this.leftBarText,
          x: this.middleX - 70,
          duration: 300,
          ease: 'Cubic.easeOut',
        })
        this.tweens.add({
          targets: this.rightBarText,
          x: this.middleX + 70,
          duration: 300,
          ease: 'Cubic.easeOut',
        })
        this.tweens.add({
          targets: this.noteText,
          alpha: 0,
          duration: 100,
        })
      })
      .on('pointerup', () => {
        this.onStart()
      })

    this.authorText = this.add
      .text(this.middleX, this.gameHeight - 100, 'A game by Chris Bot', {
        ...this.textConfig,
        fontSize: '30px',
        shadow: this.textShadow,
      })
      .setOrigin(0.5, 0.5)
      .setPadding(5)
  }

  update(): void {
    if (!this.isStarting && Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.activatePlayText()
      this.onStart()
    }
  }
}

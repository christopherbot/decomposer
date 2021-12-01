import { BaseScene } from './base-scene'

export class Background extends BaseScene {
  image!: Phaser.GameObjects.Image
  initialX = -6
  pageShiftX = 40
  constructor() {
    super('background')
  }

  preload(): void {}

  create(data: { scale: number }): void {
    this.add
      .rectangle(0, 0, this.gameWidth, this.gameHeight)
      .setFillStyle(0xffffff)
      .setOrigin(0, 0)

    this.image = this.add.image(this.initialX, -7, 'forest').setOrigin(0, 0)
    this.image.setScale(data.scale)
    this.tweens.add({
      targets: this.image,
      alpha: 0.4,
      duration: 500,
    })

    this.scene
      .get('sheet')
      .events.on(
        'page_index_updated',
        (currentPageIndex: number, nextPageIndex: number) => {
          this.tweens.add({
            targets: this.image,
            x: this.initialX - nextPageIndex * this.pageShiftX,
            duration: 350,
          })
        },
      )
  }

  update(): void {}
}

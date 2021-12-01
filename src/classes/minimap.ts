export class Minimap extends Phaser.Cameras.Scene2D.Camera {
  private readonly padding = 10

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    sheetWidth: number,
    totalSheetWidth: number,
    sheetHeight: number,
    gameHeight: number,
  ) {
    // `super` needs to be called first, so initialize
    // with 0s and then make the calcs afterwards
    super(0, 0, 0, 0)

    const width = sheetWidth - 2 * this.padding
    const ratio = width / totalSheetWidth
    const height = sheetHeight * ratio

    this.setPosition(this.padding, gameHeight - height - this.padding)
      .setSize(width, height)
      .setScroll(x, y)
      .setZoom(ratio)
      .setOrigin(0, 0)

    scene.cameras.addExisting(this)
  }
}

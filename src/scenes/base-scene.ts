export class BaseScene extends Phaser.Scene {
  protected readonly gameTitle = 'Decomposer'

  protected get gameWidth() {
    return Number(this.sys.game.canvas.width)
  }

  protected get gameHeight() {
    return Number(this.sys.game.canvas.height)
  }

  protected get middleX() {
    return this.gameWidth / 2
  }

  protected get middleY() {
    return this.gameHeight / 2
  }

  protected get textConfig() {
    return {
      fontFamily: 'Comfortaa',
      fontSize: '20px',
      color: '#ffffff',
    }
  }

  protected get textShadow() {
    return {
      offsetX: 2,
      offsetY: 2,
      blur: 4,
      fill: true,
      color: '#000000',
    }
  }

  protected get gameTitleConfig() {
    return {
      ...this.textConfig,
      fontFamily: "'Special Elite'",
      fontSize: '65px',
      shadow: this.textShadow,
    }
  }

  protected createCursorKeys(): Phaser.Types.Input.Keyboard.CursorKeys {
    return this.input.keyboard.createCursorKeys()
  }

  protected drawBorder(x: number, y: number, width: number, height: number) {
    this.add
      .rectangle(x, y, width, height)
      .setStrokeStyle(6, 0x121212)
      .setOrigin(0, 0)
  }

  protected drawGrid({
    x,
    y,
    width,
    height,
    gap = 100,
    backgroundColor,
  }: {
    x: number
    y: number
    width: number
    height: number
    gap?: number
    backgroundColor: string
  }): void {
    const textColor = '#9c9c9c'
    const lineColor = 0x9c9c9c
    const textConfig = {
      fontFamily: 'Arial',
      fontSize: '10px',
      color: textColor,
      backgroundColor,
    }
    const textOffset = 6
    const horizontalLineCount = Math.floor(height / gap)
    const verticalLineCount = Math.floor(width / gap)

    const graphics = this.add.graphics({ lineStyle: { color: lineColor } })

    for (let i = 0; i <= horizontalLineCount; i++) {
      const x1 = x
      const x2 = x + width
      const y1 = y + i * gap
      const y2 = y1

      const line = new Phaser.Geom.Line(x1, y1, x2, y2)
      graphics.strokeLineShape(line)

      for (let j = 0; j <= verticalLineCount; j++) {
        const xx = x + j * gap
        this.add
          .text(xx + textOffset, y1, (y1 - y).toString(), textConfig)
          .setOrigin(0, 0.5)
      }
    }
    for (let i = 0; i <= verticalLineCount; i++) {
      const x1 = x + i * gap
      const y1 = y
      const x2 = x1
      const y2 = y + height

      const line = new Phaser.Geom.Line(x1, y1, x2, y2)
      graphics.strokeLineShape(line)

      for (let j = 0; j <= horizontalLineCount; j++) {
        const yy = y + j * gap
        this.add
          .text(x1, yy + textOffset, (x1 - x).toString(), textConfig)
          .setOrigin(0.5, 0)
      }
    }
  }
}

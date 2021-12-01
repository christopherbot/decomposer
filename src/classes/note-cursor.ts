import { Sheet } from '../scenes'
import { Note } from './note'
import { StaffConfig } from './staff'

export class NoteCursor extends Note {
  private prevX!: number
  private prevY!: number
  private pentatonicOnly = false
  private nonPentatonicYs: number[]
  private successFill = 0x006191 // a darker version of 0x0095e2
  private errorFill = 0xff0000

  constructor(scene: Sheet, staffConfig: StaffConfig) {
    super(scene, 0, 0, 'note50')

    this.setTintFill(this.errorFill)

    this._body.allowGravity = false
    this._body.immovable = true
    this.visible = false

    const halfGap = staffConfig.gap / 2

    this.nonPentatonicYs = [
      staffConfig.y - 10 * halfGap, // 5B
      staffConfig.y - 7 * halfGap, // 5F
      staffConfig.y - 3 * halfGap, // 4B
      staffConfig.y, // 4F
      staffConfig.y + 4 * halfGap, // 3B
      staffConfig.y + 7 * halfGap, // 3F
      staffConfig.y + 11 * halfGap, // 2B
      staffConfig.y + 14 * halfGap, // 2F
      staffConfig.y + 18 * halfGap, // 1B
    ]

    const sheetRectangle = new Phaser.Geom.Rectangle(
      scene.x,
      scene.y,
      scene.totalWidth,
      scene.height,
    )
    const graphics = scene.createLedgerGraphics(0x8c8c8c)

    scene.input.once('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.visible = true
    })

    scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      const isPointerInsideSheet = Phaser.Geom.Rectangle.ContainsPoint(
        sheetRectangle,
        {
          x: pointer.worldX,
          y: pointer.worldY,
        } as Phaser.Geom.Point,
      )

      // hide note-cursor when pointer is out of sheet bounds,
      // i.e. interacting with the UI
      if (!isPointerInsideSheet) {
        graphics.clear()
        this.visible = false
        return
      }

      this.visible = true
      // Adjust the x position by half the width so the middle of the
      // note doesn't line up with the the left edge of the staff:
      const startX = staffConfig.x + this.width / 2
      const nextX =
        startX +
        Math.round((pointer.worldX - startX) / scene._16thGap) * scene._16thGap

      const nextY =
        staffConfig.y +
        Math.round((pointer.worldY - staffConfig.y) / halfGap) * halfGap

      const isNonPentatonic = this.nonPentatonicYs.includes(nextY)
      const ignoreNextY = this.pentatonicOnly && isNonPentatonic

      if (nextX !== this.prevX || (nextY !== this.prevY && !ignoreNextY)) {
        scene.maybePlaceLedgerLine(graphics, true)

        // to ensure the note is on top of the ledger line graphics:
        this.setDepth(window.layers.low)

        this.prevX = this.x
        this.x = nextX

        if (!ignoreNextY) {
          this.prevY = this.y
          this.y = nextY
        }
      }
    })

    scene.scene
      .get('ui')
      .events.on(
        'pentatonic_mode_updated',
        (pentatonicModeEnabled: boolean) => {
          this.pentatonicOnly = pentatonicModeEnabled
        },
      )

    scene.scene
      .get('sheet')
      .events.on('can_place_note', (canPlaceNote: boolean) => {
        if (canPlaceNote) {
          this.setTintFill(this.successFill)
        } else {
          this.setTintFill(this.errorFill)
        }
      })

    scene.scene.get('sheet').events.on('note_placed', () => {
      // Clear the tentative ledger lines after placing the note so
      // the real ledger lines can be seen.
      graphics.clear()
    })
  }
}

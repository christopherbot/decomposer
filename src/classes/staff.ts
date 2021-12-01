import { Sheet } from '../scenes'

export type StaffConfig = {
  x: number
  y: number
  width: number
  height: number
  gap: number
  lineWidth: number
  spaces: 4
}

export class Staff {
  constructor(scene: Sheet, staffConfig: StaffConfig) {
    const lineGraphics = scene.add.graphics({
      lineStyle: {
        color: 0x000000,
        width: staffConfig.lineWidth,
      },
    })
    const thickLineGraphics = scene.add.graphics({
      lineStyle: {
        color: 0x000000,
        width: staffConfig.lineWidth * 2,
      },
    })
    const circleGraphics = scene.add.graphics({
      fillStyle: {
        color: 0x000000,
      },
    })

    const numLinesOnStaff = 5
    const leftPaddingForTrebleClef = 120
    let lastPageStaffX2: number = 0

    scene.leftBoundaries.forEach((leftBoundary, leftBoundaryIndex) => {
      const isFirstPage = leftBoundaryIndex === 0
      const isLastPage = leftBoundaryIndex === scene.leftBoundaries.length - 1
      const _firstPossibleCursorPlacement =
        leftBoundary +
        scene._16thGap -
        ((leftBoundary + 0.5 * scene._16thGap) % scene._16thGap)

      const firstPossibleCursorPlacement =
        leftBoundary +
        scene._16thGap -
        ((leftBoundary - staffConfig.x) % scene._16thGap)

      const x1 = isFirstPage
        ? leftBoundary + staffConfig.x
        : // add one note's width for some buffer from the first placement after the left edge
          firstPossibleCursorPlacement + scene._16thGap
      const leftAjdustment = isFirstPage ? leftPaddingForTrebleClef : 0

      const x2 = x1 + staffConfig.width

      if (isLastPage) {
        // rather than recalculate it, store it for the final repeat bar/symbol
        lastPageStaffX2 = x2
      }

      // staff lines
      for (let i = 0; i < numLinesOnStaff; i++) {
        const y = staffConfig.y + i * staffConfig.gap
        const line = new Phaser.Geom.Line(x1 - leftAjdustment, y, x2, y)
        lineGraphics.strokeLineShape(line)
      }

      // right/left bar lines
      const leftBar = new Phaser.Geom.Line(
        x1 - leftAjdustment + staffConfig.lineWidth / 2,
        staffConfig.y,
        x1 - leftAjdustment + staffConfig.lineWidth / 2,
        staffConfig.y + staffConfig.height,
      )
      lineGraphics.strokeLineShape(leftBar)

      const rightBar = new Phaser.Geom.Line(
        x1 + staffConfig.width - staffConfig.lineWidth / 2,
        staffConfig.y,
        x1 + staffConfig.width - staffConfig.lineWidth / 2,
        staffConfig.y + staffConfig.height,
      )
      lineGraphics.strokeLineShape(rightBar)
    })

    // add a treble clef to the first page only, adjust manually for better placement
    const trebleClef = scene.add
      .image(
        staffConfig.x - 79,
        staffConfig.y + staffConfig.height / 2 + 10,
        'treble-clef',
      )
      .setScale(0.16, 0.21)

    // add repeat bars/symbols on first page
    const thickLeftBar = new Phaser.Geom.Line(
      trebleClef.x + trebleClef.displayWidth / 2 - 18,
      staffConfig.y,
      trebleClef.x + trebleClef.displayWidth / 2 - 18,
      staffConfig.y + staffConfig.height,
    )
    thickLineGraphics.strokeLineShape(thickLeftBar)

    const thinLeftBar = new Phaser.Geom.Line(
      thickLeftBar.x1 + 10,
      staffConfig.y,
      thickLeftBar.x1 + 10,
      staffConfig.y + staffConfig.height,
    )
    lineGraphics.strokeLineShape(thinLeftBar)

    const leftTopCircle = new Phaser.Geom.Circle(
      thinLeftBar.x1 + staffConfig.lineWidth * 3,
      staffConfig.y + staffConfig.gap * 1.5,
      staffConfig.gap / 5,
    )
    circleGraphics.fillCircleShape(leftTopCircle)

    const leftBottomCircle = new Phaser.Geom.Circle(
      thinLeftBar.x1 + staffConfig.lineWidth * 3,
      staffConfig.y + staffConfig.gap * 2.5,
      staffConfig.gap / 5,
    )
    circleGraphics.fillCircleShape(leftBottomCircle)

    // add repeat bars/symbols on last page
    const thickRightBar = new Phaser.Geom.Line(
      lastPageStaffX2 + 35,
      staffConfig.y,
      lastPageStaffX2 + 35,

      staffConfig.y + staffConfig.height,
    )
    thickLineGraphics.strokeLineShape(thickRightBar)

    const thinRightBar = new Phaser.Geom.Line(
      thickRightBar.x1 - 10,
      staffConfig.y,
      thickRightBar.x1 - 10,
      staffConfig.y + staffConfig.height,
    )
    lineGraphics.strokeLineShape(thinRightBar)

    const rightTopCircle = new Phaser.Geom.Circle(
      thinRightBar.x1 - staffConfig.lineWidth * 3,
      staffConfig.y + staffConfig.gap * 1.5,
      staffConfig.gap / 5,
    )
    circleGraphics.fillCircleShape(rightTopCircle)

    const rightBottomCircle = new Phaser.Geom.Circle(
      thinRightBar.x1 - staffConfig.lineWidth * 3,
      staffConfig.y + staffConfig.gap * 2.5,
      staffConfig.gap / 5,
    )
    circleGraphics.fillCircleShape(rightBottomCircle)
  }
}

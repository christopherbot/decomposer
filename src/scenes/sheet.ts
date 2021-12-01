import {
  Bug,
  NoteCursor,
  Minimap,
  Mushroom,
  PlacedNote,
  PlaybackCursor,
  Player,
  Dragonfly,
  Spider,
  Staff,
  StaffConfig,
} from '../classes'
import { BaseScene } from './base-scene'

export class Sheet extends BaseScene {
  readonly x = 0
  readonly y = 100
  readonly height = 600
  readonly totalPages = 4
  readonly _16thGap = 50
  private readonly staffGap = 35
  private readonly staffSpaces = 4
  private readonly staffHeight = this.staffGap * this.staffSpaces
  private readonly staffX = 130
  private staffConfig: StaffConfig = {
    x: this.staffX,
    y: this.y + this.height / 2 - this.staffHeight / 2,
    width: this.initialStaffWidth,
    height: this.staffHeight,
    gap: this.staffGap,
    lineWidth: 5,
    spaces: this.staffSpaces,
  }
  private readonly ledgerOverhangX = 30

  private sounds!: Record<string, Phaser.Sound.BaseSound>
  private noteCursor!: Phaser.GameObjects.Image
  private currentPageIndex!: number
  totalWidth!: number
  leftBoundaries!: number[]
  private minimap!: Phaser.Cameras.Scene2D.Camera
  private player!: Phaser.GameObjects.Sprite
  private bugs!: Phaser.Physics.Arcade.Group
  private playbackCursor!: PlaybackCursor
  private staff!: Staff
  notes!: Phaser.Physics.Arcade.Group
  placeableZone!: Phaser.GameObjects.Container
  placeableZoneVisual!: Phaser.GameObjects.Arc
  canPlaceNote!: boolean
  creativeModeEnabled = false

  constructor() {
    super('sheet')
  }

  private get initialStaffWidth() {
    const rightEdgeBuffer = 5
    const spaceToFill = window.innerWidth - this.staffX - rightEdgeBuffer
    const widthOf4Notes = this._16thGap * 4
    const widthOf8Notes = widthOf4Notes * 2
    const widthOf16Notes = widthOf8Notes * 2

    if (spaceToFill / widthOf16Notes > 1) {
      return widthOf16Notes
    } else if (spaceToFill / widthOf8Notes > 1) {
      return widthOf8Notes
    }

    return widthOf4Notes
  }

  get width() {
    return this.gameWidth
  }

  private get staffBottomY() {
    return this.staffConfig.y + this.staffConfig.height
  }

  public createLedgerGraphics = (color: number) => {
    return this.add.graphics({
      lineStyle: {
        color,
        width: this.staffConfig.lineWidth,
      },
    })
  }

  getPitchByY = (y: number): string | null => {
    const halfGap = this.staffConfig.gap / 2
    switch (y) {
      case this.staffConfig.y - 11 * halfGap:
        return '6C'
      case this.staffConfig.y - 10 * halfGap:
        return '5B'
      case this.staffConfig.y - 9 * halfGap:
        return '5A'
      case this.staffConfig.y - 8 * halfGap:
        return '5G'
      case this.staffConfig.y - 7 * halfGap:
        return '5F'
      case this.staffConfig.y - 6 * halfGap:
        return '5E'
      case this.staffConfig.y - 5 * halfGap:
        return '5D'
      case this.staffConfig.y - 4 * halfGap:
        return '5C'
      case this.staffConfig.y - 3 * halfGap:
        return '4B'
      case this.staffConfig.y - 2 * halfGap:
        return '4A'
      case this.staffConfig.y - 1 * halfGap:
        return '4G'
      case this.staffConfig.y:
        return '4F'
      case this.staffConfig.y + 1 * halfGap:
        return '4E'
      case this.staffConfig.y + 2 * halfGap:
        return '4D'
      case this.staffConfig.y + 3 * halfGap:
        return '4C'
      case this.staffConfig.y + 4 * halfGap:
        return '3B'
      case this.staffConfig.y + 5 * halfGap:
        return '3A'
      case this.staffConfig.y + 6 * halfGap:
        return '3G'
      case this.staffConfig.y + 7 * halfGap:
        return '3F'
      case this.staffConfig.y + 8 * halfGap:
        return '3E'
      case this.staffConfig.y + 9 * halfGap:
        return '3D'
      case this.staffConfig.y + 10 * halfGap:
        return '3C'
      case this.staffConfig.y + 11 * halfGap:
        return '2B'
      case this.staffConfig.y + 12 * halfGap:
        return '2A'
      case this.staffConfig.y + 13 * halfGap:
        return '2G'
      case this.staffConfig.y + 14 * halfGap:
        return '2F'
      case this.staffConfig.y + 15 * halfGap:
        return '2E'
      case this.staffConfig.y + 16 * halfGap:
        return '2D'
      case this.staffConfig.y + 17 * halfGap:
        return '2C'
      case this.staffConfig.y + 18 * halfGap:
        return '1B'
      case this.staffConfig.y + 19 * halfGap:
        return '1A'
      default: {
        return null
      }
    }
  }

  maybePlaceLedgerLine = (
    graphics: Phaser.GameObjects.Graphics,
    shouldClear: boolean = false,
    x?: number,
    y?: number,
  ): void => {
    if (shouldClear) {
      graphics.clear()
    }

    if (!x) {
      x = this.noteCursor.x
    }
    if (!y) {
      y = this.noteCursor.y
    }

    if (y <= this.staffConfig.y - this.staffConfig.gap) {
      const numGapsAboveStaff = Math.floor(
        (this.staffConfig.y - y) / this.staffConfig.gap,
      )

      for (let i = 1; i <= numGapsAboveStaff; i++) {
        const y = this.staffConfig.y - i * this.staffConfig.gap
        const line = new Phaser.Geom.Line(
          x - this.ledgerOverhangX,
          y,
          x + this.ledgerOverhangX,
          y,
        )
        graphics.strokeLineShape(line)
      }
    } else if (y >= this.staffBottomY + this.staffConfig.gap) {
      const numGapsBelowStaff = Math.floor(
        (y - this.staffBottomY) / this.staffConfig.gap,
      )

      for (let i = 1; i <= numGapsBelowStaff; i++) {
        const y = this.staffBottomY + i * this.staffConfig.gap
        const line = new Phaser.Geom.Line(
          x - this.ledgerOverhangX,
          y,
          x + this.ledgerOverhangX,
          y,
        )
        graphics.strokeLineShape(line)
      }
    }
  }

  prepareNotesForSave(): { x: number; y: number }[] {
    return this.notes.getChildren().map(_note => {
      const note = _note as PlacedNote
      return { x: note.x, y: note.y }
    })
  }

  loadSong(notes: { x: number; y: number }[]): void {
    notes.forEach(({ x, y }, i) => {
      const audioNote = this.getPitchByY(y)
      if (!audioNote) {
        return
      }
      const note = new PlacedNote(this, x, y)
      note.ledgerGraphics = this.createLedgerGraphics(0x000000)
      this.maybePlaceLedgerLine(note.ledgerGraphics, false, x, y)

      this.notes.add(note)

      note.setPitch(audioNote)
    })
  }

  private placeOrRemoveNote(): void {
    /*
     * Cast as PlacedNote[] because:
     * 1. we know that `this.notes` children will be PlacedNotes, but also..
     * 2. getChildren returns GameObject[] and GameObjects don't have
     *    x or y properties
     */
    const notes = this.notes.getChildren() as PlacedNote[]
    const existingNote = notes.find(
      child => child.x === this.noteCursor.x && child.y === this.noteCursor.y,
    )

    if (existingNote) {
      const hasBugs = this.bugs.getChildren().some(_bug => {
        const bug = _bug as Bug
        return bug instanceof Spider && bug.targetNote === existingNote
      })

      if (hasBugs) {
        return
      }

      existingNote.onRemove()
      this.notes.remove(existingNote, true, true)
      return
    }

    // Check if visible before attempting to place note.
    // This happens when the pointer is out of the sheet bounds
    if (!this.noteCursor.visible) {
      return
    }

    const audioNote = this.getPitchByY(this.noteCursor.y)

    if (!audioNote) {
      return
    }

    const note = new PlacedNote(this, this.noteCursor.x, this.noteCursor.y)
    note.ledgerGraphics = this.createLedgerGraphics(0x000000)
    this.maybePlaceLedgerLine(note.ledgerGraphics)

    this.notes.add(note)

    note.setPitch(audioNote)
    note.playNote()

    this.events.emit('note_placed')
  }

  restartScene() {
    this.bugs.clear(true, true)
    this.notes.getChildren().forEach(_note => {
      const note = _note as PlacedNote
      note.resetPitch()
      note.onRemove()
    })
    this.notes.clear(true, true)
    this.playbackCursor.resetAndPlay()
  }

  preload(): void {}

  create(data: { sounds: Record<string, Phaser.Sound.BaseSound> }): void {
    this.sounds = data.sounds
    this.totalWidth = this.width * this.totalPages
    this.physics.world.setBounds(this.x, this.y, this.totalWidth, this.height)

    this.cameras.main
      .setViewport(this.x, this.y, this.width, this.height)
      .setBounds(this.x, this.y, this.totalWidth, this.height)

    // For debugging purposes:
    // this.drawGrid({
    //   x: this.x,
    //   y: this.y,
    //   width: this.totalWidth,
    //   height: this.height,
    //   backgroundColor: '#ffffff',
    // })

    this.drawBorder(this.x, this.y, this.totalWidth, this.height)

    this.minimap = new Minimap(
      this,
      this.x,
      this.y,
      this.width,
      this.totalWidth,
      this.height,
      this.gameHeight,
    )
    this.leftBoundaries = []
    const pageNumbers: Phaser.GameObjects.Text[] = []
    for (let i = 0; i < this.totalPages; i++) {
      const boundary = i * this.width
      this.leftBoundaries.push(boundary)
      pageNumbers.push(
        this.add
          .text(
            boundary + this.middleX,
            this.y + this.height - 5,
            (i + 1).toString(),
            {
              ...this.textConfig,
              color: '#000000',
              fontSize: '35px',
            },
          )
          .setOrigin(0.5, 1),
      )
    }

    this.currentPageIndex = 0

    this.scene
      .get('ui')
      .events.on('controls_tooltip_shown', () => {
        pageNumbers[this.currentPageIndex].setVisible(false)
      })
      .on('controls_tooltip_hidden', () => {
        pageNumbers[this.currentPageIndex].setVisible(true)
      })
      .on('creative_mode_updated', (creativeModeEnabled: boolean) => {
        this.creativeModeEnabled = creativeModeEnabled
      })

    this.staff = new Staff(this, this.staffConfig)
    this.playbackCursor = new PlaybackCursor(this, this.staffConfig)
    this.notes = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    })

    this.player = new Mushroom(this, 300, 650)
    this.bugs = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    })
    this.canPlaceNote = false

    this.placeableZone = this.add
      .container(this.player.x, this.player.y)
      .setInteractive(
        new Phaser.Geom.Circle(0, 0, 210),
        Phaser.Geom.Circle.Contains,
      )
      .setInteractive()
      .on('pointerover', () => {
        this.canPlaceNote = true
        this.events.emit('can_place_note', this.canPlaceNote)
      })
      .on('pointerout', () => {
        this.canPlaceNote = false
        this.events.emit('can_place_note', this.canPlaceNote)
      })

    this.placeableZoneVisual = this.add.circle(
      this.player.x,
      this.player.y,
      200,
      0x42ad44,
      0.3,
    )
    this.tweens.add({
      targets: this.placeableZoneVisual,
      radius: 210,
      duration: 1500,
      yoyo: true,
      repeat: -1,
    })

    let isPointerInLowerUi = false
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      const yLowerUI = this.y + this.height
      let nextIsPointerInLowerUi
      nextIsPointerInLowerUi = pointer.worldY > yLowerUI

      if (nextIsPointerInLowerUi !== isPointerInLowerUi) {
        this.events.emit('pointer_in_lower_ui', nextIsPointerInLowerUi)
      }
      isPointerInLowerUi = nextIsPointerInLowerUi
    })
    this.noteCursor = new NoteCursor(this, this.staffConfig)

    this.physics.add.collider(this.player, this.notes)

    this.physics.add.collider(
      this.player,
      this.bugs,
      (
        _player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
        _bug: Phaser.Types.Physics.Arcade.GameObjectWithBody,
      ) => {
        const player = _player as Player
        const bug = _bug as Bug

        if (bug.isHit) {
          return
        }

        player.onHit()
        bug.onHit()
      },
    )

    this.physics.add.overlap(
      this.playbackCursor,
      this.notes,
      (
        _playbackCursor: Phaser.Types.Physics.Arcade.GameObjectWithBody,
        _note: Phaser.Types.Physics.Arcade.GameObjectWithBody,
      ) => {
        const playbackCursor = _playbackCursor as PlaybackCursor
        if (playbackCursor.tween.paused) {
          return
        }
        const note = _note as PlacedNote

        // Prevent further collisions by disabling the body for
        // 900ms so that the note isn't played multiple times:
        note.body.enable = false
        this.time.addEvent({
          delay: 900,
          callback: () => {
            // in case the note has been removed after overlap but
            // before this timed callback:
            if (note.body) {
              note.body.enable = true
            }
          },
        })

        // separate/shorter delay for visual playback tint
        note.setTintFill(0x00455c)
        this.time.addEvent({
          delay: 300,
          callback: () => {
            if (note.modifiedPitch) {
              note.setTintFill(note.bugColor)
            } else {
              note.clearTint()
            }
          },
        })

        note.playNote()
      },
    )

    this.input.on('pointerup', () => {
      if (this.canPlaceNote) {
        this.placeOrRemoveNote()
      }
    })

    const staffLineYs = [
      this.staffConfig.y,
      this.staffConfig.y + this.staffConfig.gap,
      this.staffConfig.y + 2 * this.staffConfig.gap,
      this.staffConfig.y + 3 * this.staffConfig.gap,
      this.staffConfig.y + 4 * this.staffConfig.gap,
    ]
    this.time.addEvent({
      delay: 20000,
      callback: () => {
        if (this.creativeModeEnabled) {
          return
        }
        const notes = this.notes.getChildren() as PlacedNote[]
        const hasModifiableNote =
          notes.length > 0 && notes.some(note => note.pitch !== '6C')
        if (hasModifiableNote) {
          let note = Phaser.Math.RND.pick(notes)
          while (note.pitch === '6C') {
            note = Phaser.Math.RND.pick(notes)
          }
          this.bugs.add(
            new Spider(
              this,
              Phaser.Math.Between(note.x - 500, note.x + 500),
              Phaser.Math.RND.pick(staffLineYs),
              note,
            ),
          )
        }
      },
      callbackScope: this,
      repeat: -1,
    })

    this.time.addEvent({
      delay: 30000,
      callback: () => {
        if (this.creativeModeEnabled) {
          return
        }

        if (this.bugs.getChildren().some(bug => bug instanceof Dragonfly)) {
          // only 1 dragonfly at a time
          return
        }

        this.bugs.add(
          new Dragonfly(
            this,
            Phaser.Math.Between(
              this.playbackCursor.x - 1000,
              this.playbackCursor.x + 1000,
            ),
            Phaser.Math.Between(0, this.gameHeight),
            this.playbackCursor,
          ),
        )
      },
      callbackScope: this,
      repeat: -1,
    })
  }

  update(time: number, delta: number): void {
    this.player.update()
    this.bugs.children.each(bug => bug.update(time, delta))
    this.placeableZone.x = this.player.x
    this.placeableZone.y = this.player.y
    this.placeableZoneVisual.x = this.player.x
    this.placeableZoneVisual.y = this.player.y

    let nextPageIndex: number | undefined
    if (this.player.x >= this.leftBoundaries[this.currentPageIndex + 1]) {
      nextPageIndex = this.currentPageIndex + 1
    } else if (this.player.x < this.leftBoundaries[this.currentPageIndex]) {
      nextPageIndex = this.currentPageIndex - 1
    }
    if (typeof nextPageIndex === 'number') {
      this.events.emit(
        'page_index_updated',
        this.currentPageIndex,
        nextPageIndex,
      )
      this.currentPageIndex = nextPageIndex
      this.tweens.add({
        targets: this.cameras.main,
        scrollX: this.leftBoundaries[this.currentPageIndex],
        ease: 'Linear',
        duration: 350,
      })
    }
  }
}

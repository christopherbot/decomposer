import {
  Slider,
  RoundRectangle,
} from 'phaser3-rex-plugins/templates/ui/ui-components.js'

import { Ent } from '../classes'
import { demoSongConfig } from '../demo-song-config'
import { BaseScene } from './base-scene'
import { Sheet } from './sheet'

export class UI extends BaseScene {
  private titleText!: Phaser.GameObjects.Text
  private pauseIcon!: Phaser.GameObjects.Image
  private playIcon!: Phaser.GameObjects.Image
  private spaceKey!: Phaser.Input.Keyboard.Key
  private zKey!: Phaser.Input.Keyboard.Key
  private xKey!: Phaser.Input.Keyboard.Key
  private cKey!: Phaser.Input.Keyboard.Key
  private tempoHint!: Phaser.GameObjects.Text
  private tempoTail!: Phaser.GameObjects.Triangle
  private controlsHint!: Phaser.GameObjects.Text
  private controlsTail!: Phaser.GameObjects.Triangle
  private saveLoadHint!: Phaser.GameObjects.Text
  private saveLoadTail!: Phaser.GameObjects.Triangle
  private creativeModeEnabled = false
  private pentatonicModeEnabled = false

  constructor() {
    super('ui')
  }

  private get sheet() {
    return this.scene.get('sheet') as Sheet
  }

  private get yLowerUI() {
    const sheet = this.sheet
    return sheet.y + sheet.height
  }

  private createUpperHintText(x: number, originX: number, text: string) {
    const y = this.sheet.y + 10
    const hint = this.add
      .text(x, y, text, {
        ...this.textConfig,
        fontSize: '18px',
      })
      .setOrigin(originX, 0)
      .setBackgroundColor('#000000')
      .setPadding(10)
      .setDepth(window.layers.medium)

    const triangleX = originX === 0 ? x + 30 : originX === 0.5 ? x : x - 30
    const tail = this.add
      .triangle(triangleX, y, 0, 0, 9, -9, 18, 0, 0x000000)
      .setOrigin(0.5, 0)
    return { hint, tail }
  }

  private createLowerHintText(x: number, originX: number, text: string) {
    const y = this.yLowerUI - 10
    const hint = this.add
      .text(x, y, text, {
        ...this.textConfig,
        fontSize: '18px',
      })
      .setOrigin(originX, 1)
      .setBackgroundColor('#000000')
      .setPadding(10)
      .setDepth(window.layers.medium)

    const triangleX = originX === 0 ? x + 30 : originX === 0.5 ? x : x - 30
    const tail = this.add
      .triangle(triangleX, y, 0, 0, 9, 9, 18, 0, 0x000000)
      .setOrigin(0.5, 0)
    return { hint, tail }
  }

  private createCheckboxOption(
    y: number,
    label: string,
    hintLabel: string,
    {
      isEnabled,
      toggleEnabled,
    }: {
      isEnabled: () => boolean
      toggleEnabled: () => void
    },
  ) {
    const checkboxWidth = 20
    const gap = 10
    const text = this.add
      .text(this.gameWidth - gap - checkboxWidth - gap, y, label, {
        ...this.textConfig,
        color: '#ffffff',
        shadow: this.textShadow,
      })
      .setOrigin(1, 0.5)

    const textDisplayX = text.x - text.originX * text.width
    const textDisplayY = text.y - text.originY * text.height

    const checkboxX = text.x + gap
    const checkboxShadow = this.add
      .rectangle(checkboxX + 2, text.y + 2, 20, 20)
      .setStrokeStyle(2, 0x4d4d4d)
      .setOrigin(0, 0.5)
    const checkbox = this.add
      .rectangle(checkboxX, text.y, 20, 20)
      .setStrokeStyle(2, 0xffffff)
      .setOrigin(0, 0.5)

    let checkmarkGraphics: Phaser.GameObjects.Graphics | null = null
    const shadowGraphics = this.add.graphics({
      lineStyle: { color: 0x4d4d4d, width: 2 },
    })
    const drawCheckmark = (color: number) => {
      shadowGraphics.lineBetween(
        checkboxShadow.x + 4,
        checkboxShadow.y + 2,
        checkboxShadow.x + checkboxShadow.width / 2 - 2,
        checkboxShadow.y + checkboxShadow.height / 2 - 3,
      )
      shadowGraphics.lineBetween(
        checkboxShadow.x + checkboxShadow.width / 2 - 2,
        checkboxShadow.y + checkboxShadow.height / 2 - 3,
        checkboxShadow.x + checkboxShadow.width - 5,
        checkboxShadow.y - checkboxShadow.height / 2 + 3,
      )
      const graphics = this.add.graphics({
        lineStyle: { color, width: 2 },
      })
      graphics.lineBetween(
        checkbox.x + 4,
        checkbox.y + 2,
        checkbox.x + checkbox.width / 2 - 2,
        checkbox.y + checkbox.height / 2 - 3,
      )
      graphics.lineBetween(
        checkbox.x + checkbox.width / 2 - 2,
        checkbox.y + checkbox.height / 2 - 3,
        checkbox.x + checkbox.width - 5,
        checkbox.y - checkbox.height / 2 + 3,
      )

      return graphics
    }

    const { hint, tail } = this.createUpperHintText(
      this.gameWidth - gap,
      1,
      hintLabel,
    )
    hint.setAlpha(0)
    tail.setAlpha(0)

    this.add
      .container(textDisplayX, textDisplayY)
      .setInteractive(
        new Phaser.Geom.Rectangle(
          0,
          0,
          text.width + gap + checkbox.width,
          text.height,
        ),
        Phaser.Geom.Rectangle.Contains,
      )
      .on('pointerover', () => {
        this.tweens.add({
          targets: [hint, tail],
          alpha: 1,
          duration: 300,
        })
        text.setColor('#0095e2')
        checkbox.setStrokeStyle(2, 0x0095e2)
        if (isEnabled()) {
          checkmarkGraphics?.clear()
          checkmarkGraphics = drawCheckmark(0x0095e2)
        }
      })
      .on('pointerout', () => {
        this.tweens.add({
          targets: [hint, tail],
          alpha: 0,
          duration: 300,
        })
        text.setColor('#ffffff')
        checkbox.setStrokeStyle(2, 0xffffff)
        if (isEnabled()) {
          checkmarkGraphics?.clear()
          checkmarkGraphics = drawCheckmark(0xffffff)
        }
      })
      .on('pointerup', () => {
        toggleEnabled()
        if (isEnabled()) {
          checkmarkGraphics = drawCheckmark(0x0095e2)
        } else {
          checkmarkGraphics?.clear()
          shadowGraphics.clear()
        }
      })
  }

  private createPlaybackSpeedSlider() {
    const y = this.yLowerUI + 10

    const { hint, tail } = this.createLowerHintText(
      10,
      0,
      'Takes effect next bar',
    )
    this.tempoHint = hint.setAlpha(0)
    this.tempoTail = tail.setAlpha(0)

    this.add
      .text(10, y, 'Tempo', {
        ...this.textConfig,
        color: '#000000',
      })
      .setOrigin(0, 0)

    const track = new RoundRectangle(this, 0, 0, 0, 0, 6, 0xfefefe)
    const thumb = new RoundRectangle(this, 0, 0, 0, 0, 12, 0x0095e2)
    this.add.existing(track)
    this.add.existing(thumb)

    const width = 200
    const slider = new Slider(this, {
      x: width / 2 + 10,
      y: y + 40,
      width,
      height: 10,
      orientation: 'x',
      track,
      thumb,
      input: 'click',
      valuechangeCallback: newValue => {
        this.events.emit('playback_speed_updated', newValue)
      },
      enable: true,
    }).layout()

    slider.setValue(0.5)
  }

  showControlsHint(text: string) {
    this.events.emit('controls_tooltip_shown')
    this.controlsHint.setText(text)
    this.tweens.add({
      targets: [this.controlsHint, this.controlsTail],
      alpha: 1,
      duration: 300,
    })
  }

  hideControlsHint() {
    this.events.emit('controls_tooltip_hidden')
    this.tweens.add({
      targets: [this.controlsHint, this.controlsTail],
      alpha: 0,
      duration: 300,
    })
  }

  createPlaybackControls() {
    const y = this.yLowerUI + 35

    const { hint, tail } = this.createLowerHintText(500, 0.5, '')
    this.controlsHint = hint.setAlpha(0)
    this.controlsTail = tail.setAlpha(0)

    const restartIcon = this.add
      .image(440, y, 'restart')
      .setTintFill(0x000000)
      .setInteractive()
      .on('pointerover', () => {
        restartIcon.setTintFill(0x0095e2)
        this.showControlsHint('Go to beginning')
      })
      .on('pointerout', () => {
        restartIcon.setTintFill(0x000000)
        this.hideControlsHint()
      })
      .on('pointerup', () => {
        this.events.emit('playback_restarted')
      })

    const skipBackwardIcon = this.add
      .image(restartIcon.x + 40, y, 'skip')
      .setTintFill(0x000000)
      .setInteractive()
      .on('pointerover', () => {
        skipBackwardIcon.setTintFill(0x0095e2)
        this.showControlsHint('Seek backward')
      })
      .on('pointerout', () => {
        skipBackwardIcon.setTintFill(0x000000)
        this.hideControlsHint()
      })
      .on('pointerup', () => {
        this.events.emit('playback_skipped_backward')
      })

    this.pauseIcon = this.add
      .image(skipBackwardIcon.x + 40, y, 'pause')
      .setTintFill(0x000000)
      .setInteractive()
      .on('pointerover', () => {
        this.pauseIcon.setTintFill(0x0095e2)
        this.showControlsHint('Pause')
      })
      .on('pointerout', () => {
        this.pauseIcon.setTintFill(0x000000)
        this.hideControlsHint()
      })
      .on('pointerup', () => {
        this.events.emit('playback_paused')
        this.pauseIcon.visible = false
        this.playIcon.visible = true
        this.controlsHint.setText('Play')
      })

    this.playIcon = this.add
      .image(skipBackwardIcon.x + 40, y, 'play')
      .setTintFill(0x000000)
      .setInteractive()
      .on('pointerover', () => {
        this.playIcon.setTintFill(0x0095e2)
        this.showControlsHint('Play')
      })
      .on('pointerout', () => {
        this.playIcon.setTintFill(0x000000)
        this.hideControlsHint()
      })
      .on('pointerup', () => {
        this.events.emit('playback_resumed')
        this.playIcon.visible = false
        this.pauseIcon.visible = true
        this.controlsHint.setText('Pause')
      })
      .setVisible(false)

    const skipForwardIcon = this.add
      .image(this.pauseIcon.x + 40, y, 'skip')
      .setAngle(180)
      .setTintFill(0x000000)
      .setInteractive()
      .on('pointerover', () => {
        skipForwardIcon.setTintFill(0x0095e2)
        this.showControlsHint('Seek forward')
      })
      .on('pointerout', () => {
        skipForwardIcon.setTintFill(0x000000)
        this.hideControlsHint()
      })
      .on('pointerup', () => {
        this.events.emit('playback_skipped_forward')
      })
  }

  createSaveLoadControls() {
    const y = this.yLowerUI + 20
    const gap = 5
    const slot1 = this.add
      .text(this.gameWidth - 250, y, 'Slot 1', {
        ...this.textConfig,
        color: '#000000',
      })
      .setOrigin(0.5, 0.5)
    const iconY = slot1.y + slot1.height / 2 + gap
    const save1 = this.add
      .image(slot1.x - gap, iconY, 'save')
      .setOrigin(1, 0)
      .setTintFill(0x000000)
      .setInteractive()
      .on('pointerover', () => {
        save1.setTintFill(0x0095e2)
      })
      .on('pointerout', () => {
        save1.setTintFill(0x000000)
      })
      .on('pointerup', () => {
        const placedNotes = this.sheet.prepareNotesForSave()
        localStorage.setItem(
          'decomposer_game_save_1',
          JSON.stringify(placedNotes),
        )
      })
    const load1 = this.add
      .image(slot1.x + gap, iconY, 'load')
      .setOrigin(0, 0)
      .setTintFill(0x000000)
      .setInteractive()
      .on('pointerover', () => {
        load1.setTintFill(0x0095e2)
      })
      .on('pointerout', () => {
        load1.setTintFill(0x000000)
      })
      .on('pointerup', () => {
        const placedNotes = localStorage.getItem('decomposer_game_save_1')
        if (placedNotes) {
          this.restartSheetAndLoadSong(JSON.parse(placedNotes))
        }
      })

    const slot2 = this.add
      .text(this.gameWidth - 150, y, 'Slot 2', {
        ...this.textConfig,
        color: '#000000',
      })
      .setOrigin(0.5, 0.5)
    const save2 = this.add
      .image(slot2.x - gap, iconY, 'save')
      .setOrigin(1, 0)
      .setTintFill(0x000000)
      .setInteractive()
      .on('pointerover', () => {
        save2.setTintFill(0x0095e2)
      })
      .on('pointerout', () => {
        save2.setTintFill(0x000000)
      })
      .on('pointerup', () => {
        const placedNotes = this.sheet.prepareNotesForSave()
        localStorage.setItem(
          'decomposer_game_save_2',
          JSON.stringify(placedNotes),
        )
      })
    const load2 = this.add
      .image(slot2.x + gap, iconY, 'load')
      .setOrigin(0, 0)
      .setTintFill(0x000000)
      .setInteractive()
      .on('pointerover', () => {
        load2.setTintFill(0x0095e2)
      })
      .on('pointerout', () => {
        load2.setTintFill(0x000000)
      })
      .on('pointerup', () => {
        const placedNotes = localStorage.getItem('decomposer_game_save_2')
        if (placedNotes) {
          this.restartSheetAndLoadSong(JSON.parse(placedNotes))
        }
      })

    const demo = this.add
      .text(this.gameWidth - 50, y, 'Demo', {
        ...this.textConfig,
        color: '#000000',
      })
      .setOrigin(0.5, 0.5)
    const demoLoad = this.add
      .image(demo.x, iconY, 'load')
      .setOrigin(0.5, 0)
      .setTintFill(0x000000)
      .setInteractive()
      .on('pointerover', () => {
        demoLoad.setTintFill(0x0095e2)
      })
      .on('pointerout', () => {
        demoLoad.setTintFill(0x000000)
      })
      .on('pointerup', () => {
        this.restartSheetAndLoadSong(demoSongConfig)
      })

    const { hint, tail } = this.createLowerHintText(
      this.gameWidth - 10,
      1,
      'Save and/or load your song',
    )
    this.saveLoadHint = hint.setAlpha(0)
    this.saveLoadTail = tail.setAlpha(0)
  }

  restartSheetAndLoadSong(placedNotes: { x: number; y: number }[]) {
    this.sheet.restartScene()
    this.time.addEvent({
      delay: 200,
      callback: () => {
        this.sheet.loadSong(placedNotes)
      },
    })
  }

  preload(): void {}

  create(): void {
    const gradientGraphics = this.add.graphics()
    gradientGraphics.fillGradientStyle(
      0x000000,
      0x000000,
      0x000000,
      0x000000,
      1,
      1,
      0,
      0,
    )
    gradientGraphics.fillRect(0, 0, this.gameWidth, 100)

    this.spaceKey = this.input.keyboard.addKey('space')
    this.zKey = this.input.keyboard.addKey('Z')
    this.xKey = this.input.keyboard.addKey('X')
    this.cKey = this.input.keyboard.addKey('C')

    this.titleText = this.add
      .text(this.middleX, 50, this.gameTitle, this.gameTitleConfig)
      .setOrigin(0.5, 0.5)
      .setPadding(5)

    this.createCheckboxOption(
      this.sheet.y / 3,
      'Creative Mode',
      'Bugs will stop appearing',
      {
        isEnabled: () => this.creativeModeEnabled,
        toggleEnabled: () => {
          this.creativeModeEnabled = !this.creativeModeEnabled
          this.events.emit('creative_mode_updated', this.creativeModeEnabled)
        },
      },
    )
    this.createCheckboxOption(
      (this.sheet.y * 2) / 3,
      'Pentatonic Mode',
      'Prevents placing half-step\nnotes that create dissonance',
      {
        isEnabled: () => this.pentatonicModeEnabled,
        toggleEnabled: () => {
          this.pentatonicModeEnabled = !this.pentatonicModeEnabled
          this.events.emit(
            'pentatonic_mode_updated',
            this.pentatonicModeEnabled,
          )
        },
      },
    )
    this.createPlaybackSpeedSlider()
    this.createPlaybackControls()
    this.createSaveLoadControls()

    const entX = (this.titleText.x - this.titleText.width / 2) / 2
    const ent1 = new Ent(this, entX, this.sheet.y).setOrigin(1, 1)
    const ent2 = new Ent(this, entX, this.sheet.y).setOrigin(0, 1)
    const ents = [ent1, ent2]

    this.scene
      .get('sheet')
      .events.on('pointer_in_lower_ui', (isPointerInLowerUi: boolean) => {
        this.tweens.add({
          targets: [
            this.tempoHint,
            this.tempoTail,
            this.saveLoadHint,
            this.saveLoadTail,
          ],
          alpha: isPointerInLowerUi ? 1 : 0,
          duration: 300,
        })
      })
      .on(
        'page_index_updated',
        (currentPageIndex: number, nextPageIndex: number) => {
          ents.forEach(ent => {
            ent.flipX = nextPageIndex > currentPageIndex
            ent.runOnce()
            this.tweens.add({
              targets: ent,
              x: ent.initialX - nextPageIndex * 15,
              duration: 350,
            })
          })
        },
      )
  }

  togglePauseState() {
    if (this.playIcon.visible) {
      this.events.emit('playback_resumed')
    } else {
      this.events.emit('playback_paused')
    }
    this.playIcon.visible = !this.playIcon.visible
    this.pauseIcon.visible = !this.pauseIcon.visible
  }

  update(): void {
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.togglePauseState()
    }
    if (Phaser.Input.Keyboard.JustDown(this.zKey)) {
      this.events.emit('playback_restarted')
    }
    if (Phaser.Input.Keyboard.JustDown(this.xKey)) {
      this.events.emit('playback_skipped_backward')
    }
    if (Phaser.Input.Keyboard.JustDown(this.cKey)) {
      this.events.emit('playback_skipped_forward')
    }
  }
}

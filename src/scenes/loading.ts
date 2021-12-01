import { BaseScene } from './base-scene'

export class Loading extends BaseScene {
  private assetsLoading = true
  private webFontLoading = true
  private sounds: Record<string, Phaser.Sound.BaseSound>
  private octaveCount = 5
  private noteLetters = [
    'A',
    'As',
    'B',
    'C',
    'Cs',
    'D',
    'Ds',
    'E',
    'F',
    'Fs',
    'G',
    'Gs',
  ]

  constructor() {
    super('loading')
    this.sounds = {}
  }

  private forEachAudioNote(cb: (noteName: string) => void) {
    for (let octave = 1; octave <= this.octaveCount; octave++) {
      this.noteLetters.forEach(letter => {
        cb(`${octave}${letter}`)
      })
    }
  }

  preload(): void {
    this.load.script(
      'webfont',
      'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js',
    )

    this.load.spritesheet('forest-gif', 'assets/forest-sheet.png', {
      frameWidth: 1000,
      frameHeight: 563,
    })

    this.load.spritesheet('mushroom-idle', 'assets/mushroom-idle-sheet.png', {
      frameWidth: 32,
      frameHeight: 32,
    })
    this.load.spritesheet('mushroom-run', 'assets/mushroom-walk-sheet.png', {
      frameWidth: 32,
      frameHeight: 32,
    })
    this.load.spritesheet('mushroom-jump', 'assets/mushroom-jump-sheet.png', {
      frameWidth: 32,
      frameHeight: 32,
    })
    this.load.spritesheet('mushroom-hit', 'assets/mushroom-hit-sheet.png', {
      frameWidth: 32,
      frameHeight: 32,
    })

    this.load.spritesheet('dragonfly', 'assets/dragonfly-sheet.png', {
      frameWidth: 32,
      frameHeight: 32,
    })

    this.load.spritesheet('spider', 'assets/spider-sheet.png', {
      frameWidth: 32,
      frameHeight: 32,
    })

    this.load.spritesheet('ent-idle', 'assets/ent-idle-sheet.png', {
      frameWidth: 32,
      frameHeight: 32,
    })
    this.load.spritesheet('ent-run', 'assets/ent-run-sheet.png', {
      frameWidth: 32,
      frameHeight: 32,
    })

    this.load.image('forest', 'assets/forest.png')
    this.load.image('restart', 'assets/restart-icon.png')
    this.load.image('pause', 'assets/pause-icon.png')
    this.load.image('play', 'assets/play-icon.png')
    this.load.image('skip', 'assets/skip-icon.png')
    this.load.image('save', 'assets/save-icon.png')
    this.load.image('load', 'assets/download-icon.png')
    this.load.image('note50', 'assets/note-50.png')
    this.load.image('note50-0.5', 'assets/note-50-0.5.png')
    this.load.image('playback-cursor', 'assets/playback-cursor.png')
    this.load.image('treble-clef', 'assets/treble-clef.png')

    this.load.audio('river', `assets/audio/river.ogg`)
    this.forEachAudioNote(noteName => {
      this.load.audio(noteName, `assets/audio/${noteName}.ogg`)
    })
    this.load.audio('6C', 'assets/audio/6C.ogg')

    this.load.on('complete', () => {
      this.assetsLoading = false
    })

    this.add
      .text(this.middleX, this.middleY, 'Loading...', {
        ...this.textConfig,
        fontSize: '60px',
      })
      .setOrigin(0.5, 0.5)
  }

  create(): void {
    // @ts-ignore
    if (typeof WebFont !== undefined) {
      // @ts-ignore
      WebFont.load({
        google: {
          families: ['Comfortaa', 'Special Elite'],
        },
        active: () => {
          this.webFontLoading = false
        },
      })
    } else {
      this.webFontLoading = false
    }

    this.forEachAudioNote(noteName => {
      this.sounds[noteName] = this.sound.add(noteName, { volume: 3 })
    })
    this.sounds['6C'] = this.sound.add('6C', { volume: 3 })
  }

  update(): void {
    if (this.assetsLoading || this.webFontLoading) {
      return
    }

    this.scene.start('title')
  }
}

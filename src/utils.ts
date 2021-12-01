export const onWindowResize = () => {
  if (window.game.isBooted) {
    setTimeout(() => {
      window.game.scale.resize(window.innerWidth, window.innerHeight)
      // window.game.scale.displaySize.setAspectRatio(
      //   window.innerWidth / window.innerHeight,
      // )
      // window.game.scale.gameSize.setSize(window.innerWidth, window.innerHeight)
      window.game.scale.refresh()

      window.game.canvas.setAttribute(
        'style',
        `display: block; width: ${window.innerWidth}px; height: ${window.innerHeight}px;`,
      )
    }, 100)
  }
}

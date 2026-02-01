let audioContext = null
let analyser = null
let source = null
let dataArray = null
let animationId = null

export async function startMicrophone(onVolume) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

  audioContext = new (window.AudioContext || window.webkitAudioContext)()
  if (audioContext.state === 'suspended') {
    await audioContext.resume()
  }
  analyser = audioContext.createAnalyser()
  source = audioContext.createMediaStreamSource(stream)

  analyser.fftSize = 256
  dataArray = new Uint8Array(analyser.frequencyBinCount)

  source.connect(analyser)

  function update() {
    if (!analyser) return
    analyser.getByteFrequencyData(dataArray)
    const avg =
      dataArray.reduce((sum, v) => sum + v, 0) / dataArray.length

    onVolume(Math.min(100, avg))
    animationId = requestAnimationFrame(update)
  }

  update()
}

export function stopMicrophone() {
  if (animationId) cancelAnimationFrame(animationId)
  if (audioContext) audioContext.close()

  audioContext = null
  analyser = null
  source = null
}

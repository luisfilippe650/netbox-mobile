import { useCallback, useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import { PageShell } from '../../components/PageShell/PageShell'
import './scanner.css'

type ScannerProps = {
  onBack: () => void
}

type ScannerStatus = 'ready' | 'starting' | 'scanning' | 'result' | 'error'

export default function Scanner({ onBack }: ScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const [status, setStatus] = useState<ScannerStatus>('ready')
  const [message, setMessage] = useState('A câmera será usada somente para ler o QR code.')
  const [result, setResult] = useState('')

  const stopCamera = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  const scanFrame = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      animationFrameRef.current = requestAnimationFrame(scanFrame)
      return
    }

    if (video.videoWidth > 0 && video.videoHeight > 0) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const context = canvas.getContext('2d', { willReadFrequently: true })

      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        const image = context.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(image.data, image.width, image.height, { inversionAttempts: 'attemptBoth' })

        if (code?.data) {
          setResult(code.data)
          setStatus('result')
          setMessage('QR code lido com sucesso.')
          stopCamera()
          return
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanFrame)
  }, [stopCamera])

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('error')
      setMessage('Este dispositivo ou navegador não permite acesso à câmera.')
      return
    }

    setStatus('starting')
    setMessage('Solicitando acesso à câmera…')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' } },
      })

      streamRef.current = stream
      const video = videoRef.current
      if (!video) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }

      video.srcObject = stream
      await video.play()
      setStatus('scanning')
      setMessage('Aponte a câmera para o QR code.')
      animationFrameRef.current = requestAnimationFrame(scanFrame)
    } catch (error) {
      stopCamera()
      setStatus('error')
      setMessage(error instanceof DOMException && error.name === 'NotAllowedError'
        ? 'A permissão da câmera foi recusada. Autorize o acesso nas configurações do navegador e tente novamente.'
        : 'Não foi possível abrir a câmera. Verifique se ela está disponível e tente novamente.')
    }
  }

  const scanAgain = () => {
    setResult('')
    void startCamera()
  }

  useEffect(() => stopCamera, [stopCamera])

  return (
    <PageShell className="scanner-page" eyebrow="Scanner" title="Ler QR code" subtitle="Posicione o código dentro da área indicada.">
      <section className="scanner__panel" aria-live="polite">
        <div className="scanner__frame">
          <div className="scanner__topbar">
            <span className="scanner__live-dot" aria-hidden="true" />
            <span>{status === 'scanning' ? 'Câmera ativa' : 'Scanner de QR code'}</span>
          </div>
          <video ref={videoRef} className="scanner__video" playsInline muted aria-label="Imagem da câmera" />
          <canvas ref={canvasRef} className="scanner__canvas" aria-hidden="true" />
          <div className="scanner__target" aria-hidden="true" />
          {status === 'ready' || status === 'error' ? (
            <div className="scanner__permission">
              <span className="scanner__camera-icon" aria-hidden="true">⌾</span>
              <strong>Permitir uso da câmera?</strong>
              <p>{message}</p>
              <button className="page-button" type="button" onClick={() => void startCamera()}>
                Permitir e iniciar scanner
              </button>
            </div>
          ) : null}
          {status === 'starting' ? <div className="scanner__state">Abrindo câmera…</div> : null}
          {status === 'scanning' ? <p className="scanner__hint">Centralize o código dentro da moldura</p> : null}
        </div>

        {status === 'result' ? (
          <div className="scanner__result">
            <span className="scanner__result-label">✓ QR code identificado</span>
            <strong>{result}</strong>
            <button className="page-button" type="button" onClick={scanAgain}>Escanear novamente</button>
          </div>
        ) : null}
      </section>

      <button className="page-button page-button--secondary" type="button" onClick={() => { stopCamera(); onBack() }}>
        Voltar
      </button>
    </PageShell>
  )
}

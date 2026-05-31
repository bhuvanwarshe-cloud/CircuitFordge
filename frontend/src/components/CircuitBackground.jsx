import { useEffect, useRef } from 'react'

export default function CircuitBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let w, h, nodes, pulses

    function resize() {
      w = canvas.width  = canvas.offsetWidth
      h = canvas.height = canvas.offsetHeight
      init()
    }

    function init() {
      // Create random circuit nodes
      const count = Math.floor((w * h) / 18000)
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        connections: [],
        size: Math.random() * 2 + 1,
      }))

      // Build connections (each node links to nearest 2-3 neighbours)
      nodes.forEach((node, i) => {
        const sorted = nodes
          .map((n, j) => ({ n, d: Math.hypot(n.x - node.x, n.y - node.y), j }))
          .filter(({ j }) => j !== i)
          .sort((a, b) => a.d - b.d)
          .slice(0, 3)
        node.connections = sorted.filter(({ d }) => d < 200).map(({ j }) => j)
      })

      pulses = []
    }

    function spawnPulse() {
      const ni = Math.floor(Math.random() * nodes.length)
      const node = nodes[ni]
      if (!node.connections.length) return
      const ti = node.connections[Math.floor(Math.random() * node.connections.length)]
      pulses.push({ from: ni, to: ti, t: 0, speed: 0.006 + Math.random() * 0.006 })
    }

    function draw() {
      ctx.clearRect(0, 0, w, h)

      // Draw edges
      nodes.forEach((node, i) => {
        node.connections.forEach(j => {
          const other = nodes[j]
          const dist = Math.hypot(other.x - node.x, other.y - node.y)
          const alpha = 0.06 + (1 - dist / 200) * 0.08
          ctx.beginPath()
          ctx.moveTo(node.x, node.y)
          ctx.lineTo(other.x, other.y)
          ctx.strokeStyle = `rgba(79, 70, 229, ${alpha})`
          ctx.lineWidth = 0.8
          ctx.stroke()
        })
      })

      // Draw nodes
      nodes.forEach(node => {
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0, 196, 240, 0.3)'
        ctx.fill()
      })

      // Draw moving pulses
      pulses = pulses.filter(p => {
        const from = nodes[p.from]
        const to   = nodes[p.to]
        if (!from || !to) return false
        p.t += p.speed
        if (p.t >= 1) return false
        const x = from.x + (to.x - from.x) * p.t
        const y = from.y + (to.y - from.y) * p.t
        const grad = ctx.createRadialGradient(x, y, 0, x, y, 6)
        grad.addColorStop(0, 'rgba(0, 222, 255, 0.9)')
        grad.addColorStop(1, 'rgba(0, 222, 255, 0)')
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
        return true
      })

      if (Math.random() < 0.04) spawnPulse()
      animId = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.6,
      }}
    />
  )
}

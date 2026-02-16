"use client"

import { useEffect, useRef } from "react"

class Bolt {
    segments: { x: number, y: number }[]
    opacity: number
    life: number

    constructor(x: number, y: number, canvasWidth: number, canvasHeight: number) {
        this.opacity = 1
        this.life = 20 // Frames to live
        this.segments = []

        let currentX = x
        let currentY = y
        this.segments.push({ x: currentX, y: currentY })

        while (currentY < canvasHeight && currentX > 0 && currentX < canvasWidth) {
            currentX += (Math.random() - 0.5) * 50 // Zigzag horizontal
            currentY += Math.random() * 50 + 10    // Move down
            this.segments.push({ x: currentX, y: currentY })

            // Branching logic (simplified: rarely branch)
            if (Math.random() < 0.2) {
                // TODO: Implement branching for better effect if desired
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (this.life <= 0) return

        ctx.beginPath()
        ctx.moveTo(this.segments[0].x, this.segments[0].y)
        for (let i = 1; i < this.segments.length; i++) {
            ctx.lineTo(this.segments[i].x, this.segments[i].y)
        }

        // Glow
        ctx.shadowBlur = 15
        ctx.shadowColor = "rgba(139, 92, 246, 0.8)" // Purple glow
        ctx.lineWidth = 2
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`
        ctx.stroke()

        // Reset shadow
        ctx.shadowBlur = 0

        this.life--
        this.opacity = this.life / 20
    }
}

export function Thunderstorm() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        let animationFrameId: number
        // eslint-disable-next-line prefer-const
        const bolts: Bolt[] = []
        let lastBoltTime = 0
        let nextBoltIn = Math.random() * 2000 + 1000 // 1-3 seconds

        // Resize handler
        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        window.addEventListener("resize", resize)
        resize()

        const animate = (time: number) => {
            if (!canvas) return

            // Clear with slight fade for trail effect? No, clean wipe for storm.
            // But we want to keep the background gradient visible.
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Random lightning generation
            if (time - lastBoltTime > nextBoltIn) {
                const startX = Math.random() * canvas.width
                bolts.push(new Bolt(startX, 0, canvas.width, canvas.height))
                lastBoltTime = time
                nextBoltIn = Math.random() * 3000 + 500 // Random interval 0.5s - 3.5s

                // Flash effect background
                canvas.style.backgroundColor = "rgba(255, 255, 255, 0.1)"
                setTimeout(() => {
                    if (canvas) canvas.style.backgroundColor = "transparent"
                }, 50)
            }

            // Draw Clouds (Procedural/Static images moved? simplified for now)
            // For now, let's keep clouds in CSS and just draw bolts here.

            // Draw and update bolts
            bolts.forEach((bolt, index) => {
                bolt.draw(ctx)
                if (bolt.life <= 0) {
                    bolts.splice(index, 1)
                }
            })

            animationFrameId = requestAnimationFrame(animate)
        }

        animationFrameId = requestAnimationFrame(animate)

        return () => {
            window.removeEventListener("resize", resize)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1]"
            style={{ transition: "background-color 0.1s" }}
        />
    )
}

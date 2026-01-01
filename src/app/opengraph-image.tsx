import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Todo Bingo 2025 - 今年の目標をビンゴで達成しよう'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: 'absolute',
            top: 40,
            left: 40,
            width: 120,
            height: 120,
            borderRadius: 20,
            background: 'rgba(255,255,255,0.1)',
            transform: 'rotate(15deg)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            right: 60,
            width: 180,
            height: 180,
            borderRadius: 30,
            background: 'rgba(255,255,255,0.08)',
            transform: 'rotate(-10deg)',
            display: 'flex',
          }}
        />

        {/* Mini Bingo Grid */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            marginBottom: 40,
          }}
        >
          {[0, 1, 2].map((row) => (
            <div
              key={row}
              style={{
                display: 'flex',
                gap: 8,
              }}
            >
              {[0, 1, 2].map((col) => {
                const isCenter = row === 1 && col === 1
                const isCompleted = (row === 0 && col === 0) || (row === 1 && col === 1) || (row === 2 && col === 2)
                return (
                  <div
                    key={col}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 12,
                      background: isCompleted
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        : 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 28,
                      boxShadow: isCompleted ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
                    }}
                  >
                    {isCompleted ? '✓' : isCenter ? '🎯' : ''}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Main Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <h1
            style={{
              fontSize: 80,
              fontWeight: 800,
              color: 'white',
              textShadow: '0 4px 20px rgba(0,0,0,0.3)',
              margin: 0,
              letterSpacing: -2,
              display: 'flex',
            }}
          >
            Todo Bingo 2025
          </h1>
          <p
            style={{
              fontSize: 32,
              color: 'rgba(255,255,255,0.9)',
              margin: 0,
              textShadow: '0 2px 10px rgba(0,0,0,0.2)',
              display: 'flex',
            }}
          >
            🎯 目標をビンゴで達成 × ゲーム感覚で習慣化 🏆
          </p>
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: 24,
            marginTop: 40,
          }}
        >
          {['📊 進捗管理', '🔥 ストリーク', '🏅 バッジ収集'].map((feature) => (
            <div
              key={feature}
              style={{
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                padding: '12px 24px',
                borderRadius: 50,
                fontSize: 22,
                color: 'white',
                display: 'flex',
              }}
            >
              {feature}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 192, height: 192 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          borderRadius: 32,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {[0, 1, 2].map((row) => (
            <div
              key={row}
              style={{
                display: 'flex',
                gap: 4,
              }}
            >
              {[0, 1, 2].map((col) => {
                const isCenter = row === 1 && col === 1
                const isCompleted = (row === 0 && col === 2) || (row === 1 && col === 1) || (row === 2 && col === 0)
                return (
                  <div
                    key={col}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: isCompleted
                        ? '#10b981'
                        : 'rgba(255,255,255,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                      color: 'white',
                    }}
                  >
                    {isCompleted ? '✓' : ''}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}

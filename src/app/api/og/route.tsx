import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const bingoLines = parseInt(searchParams.get('bingo') || '0')
  const completed = parseInt(searchParams.get('completed') || '0')
  const total = parseInt(searchParams.get('total') || '25')
  const level = parseInt(searchParams.get('level') || '1')
  const size = parseInt(searchParams.get('size') || '5')
  const cellsData = searchParams.get('cells') || ''

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  // Parse cells data (format: "0,1,0,1,1,..." where 1 = completed)
  const cells = cellsData ? cellsData.split(',').map(c => c === '1') : Array(total).fill(false)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Title */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 20,
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          Todo Bingo 2025
        </div>

        {/* Bingo Grid */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            width: size * 60 + (size - 1) * 8,
            gap: 8,
            marginBottom: 30,
          }}
        >
          {cells.slice(0, size * size).map((isCompleted, i) => (
            <div
              key={i}
              style={{
                width: 60,
                height: 60,
                borderRadius: 8,
                background: isCompleted
                  ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                  : 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                color: 'white',
                boxShadow: isCompleted ? '0 4px 6px rgba(0,0,0,0.2)' : 'none',
              }}
            >
              {isCompleted ? '✓' : ''}
            </div>
          ))}
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            gap: 40,
            color: 'white',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: 48, fontWeight: 'bold' }}>{bingoLines}</div>
            <div style={{ fontSize: 18, opacity: 0.9 }}>ビンゴ</div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: 48, fontWeight: 'bold' }}>{completionRate}%</div>
            <div style={{ fontSize: 18, opacity: 0.9 }}>達成率</div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: 48, fontWeight: 'bold' }}>Lv.{level}</div>
            <div style={{ fontSize: 18, opacity: 0.9 }}>レベル</div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            fontSize: 16,
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          #TodoBingo #目標達成
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}

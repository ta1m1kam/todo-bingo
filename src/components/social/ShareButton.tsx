'use client'

import { useState } from 'react'

interface ShareData {
  title: string
  text: string
  url?: string
  bingoLines?: number
  completedCells?: number
  totalCells?: number
  level?: number
}

interface ShareButtonProps {
  data: ShareData
  onShare?: (platform: string) => void
}

export function ShareButton({ data, onShare }: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false)

  const shareText = generateShareText(data)
  const shareUrl = data.url || (typeof window !== 'undefined' ? window.location.href : '')

  const handleShare = async (platform: string) => {
    setShowMenu(false)
    onShare?.(platform)

    switch (platform) {
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
          '_blank',
          'width=550,height=420'
        )
        break
      case 'line':
        window.open(
          `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
          '_blank'
        )
        break
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
          '_blank',
          'width=550,height=420'
        )
        break
      case 'copy':
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
        alert('クリップボードにコピーしました！')
        break
      case 'native':
        if (navigator.share) {
          try {
            await navigator.share({
              title: data.title,
              text: shareText,
              url: shareUrl,
            })
          } catch {
            // User cancelled or error
          }
        }
        break
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 text-white rounded-full font-medium hover:opacity-90 transition-opacity shadow-md"
        style={{ background: 'linear-gradient(to right, var(--theme-primary), var(--theme-secondary))' }}
      >
        <ShareIcon />
        シェア
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl z-50 overflow-hidden animate-scale-in">
            <div className="p-2">
              <ShareMenuItem
                icon={<TwitterIcon />}
                label="X (Twitter)"
                color="bg-black"
                onClick={() => handleShare('twitter')}
              />
              <ShareMenuItem
                icon={<LineIcon />}
                label="LINE"
                color="bg-[#06C755]"
                onClick={() => handleShare('line')}
              />
              <ShareMenuItem
                icon={<FacebookIcon />}
                label="Facebook"
                color="bg-[#1877F2]"
                onClick={() => handleShare('facebook')}
              />
              <ShareMenuItem
                icon={<CopyIcon />}
                label="リンクをコピー"
                color="bg-gray-500"
                onClick={() => handleShare('copy')}
              />
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <ShareMenuItem
                  icon={<ShareIcon />}
                  label="その他"
                  color="bg-gray-700"
                  onClick={() => handleShare('native')}
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

interface ShareMenuItemProps {
  icon: React.ReactNode
  label: string
  color: string
  onClick: () => void
}

function ShareMenuItem({ icon, label, color, onClick }: ShareMenuItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div className={`w-8 h-8 ${color} rounded-full flex items-center justify-center text-white`}>
        {icon}
      </div>
      <span className="text-gray-700 font-medium">{label}</span>
    </button>
  )
}

function generateShareText(data: ShareData): string {
  const lines: string[] = []

  if (data.bingoLines !== undefined && data.bingoLines > 0) {
    lines.push(`🎰 ${data.bingoLines}ビンゴ達成！`)
  }

  if (data.completedCells !== undefined && data.totalCells !== undefined) {
    const rate = Math.round((data.completedCells / data.totalCells) * 100)
    lines.push(`📊 進捗: ${data.completedCells}/${data.totalCells}マス (${rate}%)`)
  }

  if (data.level !== undefined && data.level > 1) {
    lines.push(`⭐ Lv.${data.level}`)
  }

  lines.push('')
  lines.push('#とぅーどぅーびんご #目標達成')

  return lines.join('\n')
}

function ShareIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  )
}

function TwitterIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function LineIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  )
}

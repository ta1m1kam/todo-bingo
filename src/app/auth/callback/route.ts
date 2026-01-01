import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const errorParam = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Handle OAuth error from provider
  if (errorParam) {
    console.error('OAuth error:', errorParam, errorDescription)
    const errorMessage = encodeURIComponent(errorDescription || errorParam)
    return NextResponse.redirect(`${origin}/auth/error?message=${errorMessage}`)
  }

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // ignore
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }

    console.error('Auth callback error:', error)

    // Determine error type and create user-friendly message
    let errorMessage = 'ログイン処理中にエラーが発生しました'
    if (error.message.includes('email')) {
      errorMessage = 'このメールアドレスは既に別の方法で登録されています。別のログイン方法をお試しください。'
    }

    return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent(errorMessage)}`)
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}

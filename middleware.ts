import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // IMPORTANT: Refresh the session before checking auth
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.error('Auth error:', error.message)
  }

  const { pathname } = request.nextUrl

  // Protected routes
  const protectedRoutes = ['/dashboard', '/exercise', '/nutrition', '/skincare', '/progress', '/profile']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  // Auth routes
  const authRoutes = ['/login', '/signup', '/reset-password']
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Check onboarding status for protected routes
  if (isProtectedRoute && user) {
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('onboarding_complete')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('Error checking profile:', profileError)
    }

    if (!profile?.onboarding_complete && pathname !== '/onboarding') {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

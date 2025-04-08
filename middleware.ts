import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Get current pathname
  const pathname = req.nextUrl.pathname

  // Define routes
  const isAuthPage = ['/login', '/signup', '/signup-success'].includes(pathname)
  const isApiRoute = pathname.startsWith('/api')
  const isPublicAsset = pathname.startsWith('/_next') || 
                       pathname.startsWith('/static') ||
                       pathname.includes('.')
  const isAdminRoute = pathname.startsWith('/admin')
  const isEmployeeRoute = pathname.startsWith('/employee')

  // Allow public assets and API routes
  if (isApiRoute || isPublicAsset) {
    return res
  }

  try {
    // Get session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If on auth page and no session, allow access
    if (isAuthPage && !session) {
      return res
    }

    // If no session and trying to access protected route, redirect to login
    if (!session && !isAuthPage) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // If we have a session
    if (session) {
      // Get user role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (profileError) throw profileError

      const userRole = profileData?.role

      // If on auth page with valid session, redirect to appropriate dashboard
      if (isAuthPage) {
        const dashboardUrl = userRole === 'admin' ? '/admin/dashboard' : '/employee/dashboard'
        return NextResponse.redirect(new URL(dashboardUrl, req.url))
      }

      // Handle route protection based on role
      if (isAdminRoute && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/employee/dashboard', req.url))
      }

      if (isEmployeeRoute && userRole !== 'employee') {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url))
      }

      // Add role to headers for client-side use
      res.headers.set('x-user-role', userRole || '')
      return res
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    
    // Clear session and redirect to login on error
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 
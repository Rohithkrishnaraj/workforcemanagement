import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req: request, res })

  // Refresh session if expired
  await supabase.auth.getSession()

  // Get the pathname of the request
  const pathname = request.nextUrl.pathname

  // Define public routes
  const isPublicRoute = ['/login', '/signup', '/signup-success'].includes(pathname)
  const isApiRoute = pathname.startsWith('/api')
  const isPublicAsset = pathname.startsWith('/_next') || 
                       pathname.startsWith('/static') ||
                       pathname.includes('.')

  // Allow public routes and assets
  if (isPublicRoute || isApiRoute || isPublicAsset) {
    return res
  }

  // Get session
  const { data: { session } } = await supabase.auth.getSession()

  // Redirect to login if no session and trying to access protected route
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If we have a session
  if (session) {
    // Check admin routes
    if (pathname.startsWith('/admin')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
  }

  return res
}

// Specify which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
} 
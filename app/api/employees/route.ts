import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

// Initialize Supabase client with service role key
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export async function POST(request: Request) {
  try {
    // Get the authenticated user's session
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if the user is an admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()

    // 1. Create auth user using service role client
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: {
        first_name: body.first_name,
        last_name: body.last_name,
      },
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create auth user' }, { status: 400 })
    }

    // 2. Create employee record using service role client
    const { error: employeeError } = await supabaseAdmin
      .from('employees')
      .insert({
        id: authData.user.id,
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        phone: body.phone || null,
        department: body.department || null,
        position: body.position || null,
        role: 'employee', // Default role is employee
        status: body.status || 'active',
        address: body.address || null,
        is_present: true, // Default to present
        todays_attendance: null, // Will be set by attendance system
      })

    if (employeeError) {
      console.error('Employee error:', employeeError)
      return NextResponse.json({ error: employeeError.message }, { status: 400 })
    }

    // 3. Create profile record using service role client
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: body.email,
        first_name: body.first_name,
        last_name: body.last_name,
        role: 'employee', // Default role is employee
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (profileError) {
      console.error('Profile error:', profileError)
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
} 
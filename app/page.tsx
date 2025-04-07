import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-3rem)] flex flex-col items-center justify-center bg-slate-50">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">WorkForce</h1>
          <p className="text-slate-500 mt-2">Workforce Management System</p>
        </div>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Link href="/login" className="w-full">
                  <Button className="w-full">Sign In</Button>
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-50 px-2 text-slate-500">Or</span>
                </div>
              </div>
              <div className="grid gap-2">
                <Link href="/signup" className="w-full">
                  <Button variant="outline" className="w-full">
                    Create an account
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-center gap-2">
            <p className="text-xs text-center text-slate-500">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}


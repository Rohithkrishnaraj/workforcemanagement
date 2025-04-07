import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

export default function SignupSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Account Created!</CardTitle>
            <CardDescription>Your account has been successfully created</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-500 mb-4">
              Thank you for registering with our Workforce Management System. You can now sign in to access your
              account.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}


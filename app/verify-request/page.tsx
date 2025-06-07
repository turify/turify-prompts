import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MailCheck } from "lucide-react"

export default function VerifyRequestPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center bg-gradient-to-br from-white to-purple-50">
      <Link href="/" className="absolute left-4 top-4 md:left-8 md:top-8">
        <Button variant="ghost">Home</Button>
      </Link>
      <Card className="w-full max-w-md border-2 border-brand-purple/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-brand-purple/10 to-brand-blue/10 text-center">
          <div className="flex justify-center mb-2">
            <div className="rounded-full bg-brand-purple/10 p-3">
              <MailCheck className="h-6 w-6 text-brand-purple" />
            </div>
          </div>
          <CardTitle className="text-xl">Check your email</CardTitle>
          <CardDescription>A sign in link has been sent to your email address</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-6">
            We've sent you a magic link. Please check your email and click the link to sign in.
          </p>
          <p className="text-sm text-muted-foreground">
            If you don't see the email, check your spam folder or{" "}
            <Link href="/login" className="text-brand-purple hover:underline">
              try again
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

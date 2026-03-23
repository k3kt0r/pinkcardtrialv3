import Link from "next/link"
import Image from "next/image"

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <div className="mb-8">
        <Image src="/logo.png" alt="&Dine" width={160} height={56} className="mx-auto mb-2" />
        <h2 className="text-2xl font-medium text-anddine-text italic">Express Card</h2>
      </div>

      <p className="text-anddine-muted mb-8 max-w-xs">
        Free perks at independent food Makers near your office. Sign up fast with your work email.
      </p>

      <Link href="/signup" className="btn-primary w-full max-w-xs text-center block">
        Get your card
      </Link>

      <p className="text-anddine-muted text-sm mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-anddine-pink hover:underline">
          Sign in
        </Link>
      </p>

      <Link href="/admin" className="fixed bottom-4 left-4 text-anddine-muted/40 text-xs hover:text-anddine-muted/60 transition-colors">
        &Dine Staff Portal
      </Link>
    </main>
  )
}

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen items-start justify-center pt-24 px-4">
      <section className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
            BookSwap
          </h1>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
            Exchange pre-loved books with readers in your community. Give your books a second life.
          </p>
        </div>
        <div className="space-x-4">
          <Button asChild>
            <Link href="/auth/login">Get Started</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/browse">Browse Library</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

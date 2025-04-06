import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <section className="text-center space-y-8 max-w-2xl">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-purple-900 leading-tight tracking-tight">
            BookSwap
          </h1>
          <p className="text-gray-600 text-lg md:text-xl">
            Exchange pre-loved books with readers in your community. Give your books a second life.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
            <Link href="/auth/login">Get Started</Link>
          </Button>
          <Button asChild variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">
            <Link href="/browse">Browse Library</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

import { PromptBuilder } from "@/components/prompt-builder"
import { CommunitySection } from "@/components/community-section"
import { Footer } from "@/components/footer"
import { getCurrentUser } from "@/app/actions/auth-actions"

// Force this page to be dynamic due to cookie usage
export const dynamic = 'force-dynamic'

export default async function Home() {
  const user = await getCurrentUser()
  const userId = user?.id

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900">
      {/* Hero Section with PromptBuilder */}
      <main className="flex-1">
        <section className="bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              {/* Main headline with clear value proposition */}
              <div className="mb-6">
                <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-brand-purple via-brand-blue to-brand-teal bg-clip-text text-transparent leading-tight">
                  Generate Custom Prompts
                  <br />
                   for your AI tools
                </h1>
                <div className="max-w-4xl mx-auto mb-8">
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  Turify crafts personalised prompts that deliver exactly what you need, every time.
                </p>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-purple/10 to-brand-blue/10 rounded-full border border-brand-purple/20">
                    <span className="text-sm font-medium text-brand-purple dark:text-brand-blue">👇 Try the prompt builder below</span>
                  </div>
              </div>

            </div>

            <PromptBuilder userId={userId} />
          </div>
        </section>

        {/* Community Section */}
        <CommunitySection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

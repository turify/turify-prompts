import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Turify',
  description: 'Learn about Turify\'s mission to revolutionize AI prompt engineering. Discover how we help users create, evaluate, and optimize prompts for ChatGPT, Claude, and other AI tools.',
  keywords: [
    "about Turify",
    "AI prompt engineering",
    "prompt optimization",
    "AI tools",
    "prompt evaluation",
    "artificial intelligence",
    "prompt engineering platform"
  ],
  openGraph: {
    title: 'About Turify - AI Prompt Engineering Platform',
    description: 'Learn about Turify\'s mission to revolutionize AI prompt engineering and help users create better prompts.',
    type: 'website',
    images: [
      {
        url: '/og-about.png',
        width: 1200,
        height: 630,
        alt: 'About Turify - AI Prompt Engineering Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Turify - AI Prompt Engineering Platform',
    description: 'Learn about Turify\'s mission to revolutionize AI prompt engineering.',
    images: ['/og-about.png'],
  },
}

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
              About Turify
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Empowering developers and creators to craft better AI prompts through 
              intelligent tools and community collaboration.
            </p>
          </div>

          {/* Mission Section */}
          <div className="mb-16">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Mission</h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                At Turify, we believe that the quality of AI interactions depends heavily on the 
                quality of prompts. Our mission is to democratize prompt engineering by providing 
                powerful, intuitive tools that help everyone—from seasoned developers to curious 
                beginners—create more effective AI prompts.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                We're building a platform where creativity meets precision, where community 
                knowledge accelerates individual growth, and where the art of prompt crafting 
                becomes accessible to all.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Intelligent Prompt Builder
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Our advanced prompt builder helps you craft, test, and refine prompts with 
                real-time feedback and optimization suggestions.
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Community Library
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Access thousands of proven prompts shared by our community, categorized 
                and rated for easy discovery and adaptation.
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Performance Analytics
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Track prompt performance with detailed analytics and insights to 
                understand what makes your prompts successful.
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Collaboration Tools
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Work together with team members, share prompts, and build upon each 
                other's expertise in a collaborative environment.
              </p>
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-16">
            <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-6">Built by AI Enthusiasts</h2>
              <p className="text-lg opacity-90 leading-relaxed">
                Turify is developed by a passionate team of AI researchers, developers, and 
                prompt engineers who understand the challenges of creating effective AI interactions. 
                We've experienced firsthand the frustration of inconsistent AI responses and the 
                joy of discovering that perfect prompt formula.
              </p>
            </div>
          </div>

          {/* Vision Section */}
          <div className="text-center">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Vision</h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                We envision a future where AI interactions are consistently productive and 
                meaningful. Where every prompt is optimized, every AI response is valuable, 
                and the barrier between human intent and AI understanding continues to dissolve. 
                Join us in shaping this future—one prompt at a time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
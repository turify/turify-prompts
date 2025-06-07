import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Read the terms and conditions for using Turify\'s AI prompt engineering platform. Understand your rights and responsibilities as a user.',
  keywords: [
    "terms of service",
    "terms and conditions",
    "user agreement",
    "legal terms",
    "platform rules",
    "user rights"
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Terms of Service - Turify',
    description: 'Read the terms and conditions for using Turify\'s AI prompt engineering platform.',
    type: 'website',
  },
}

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors mb-8 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>

          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
              Terms of Service
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl space-y-8">
            
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Agreement to Terms</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                These Terms of Service ("Terms") govern your use of Turify's AI prompt engineering platform 
                ("Service") operated by Turify ("us", "we", or "our"). By accessing or using our Service, 
                you agree to be bound by these Terms. If you disagree with any part of these Terms, 
                then you may not access the Service.
              </p>
            </section>

            {/* Service Description */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Service Description</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Turify provides a platform for creating, testing, sharing, and optimizing AI prompts. 
                Our Service includes:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                <li>Prompt building and editing tools</li>
                <li>Community prompt library and sharing features</li>
                <li>Performance analytics and optimization suggestions</li>
                <li>Collaboration and team management features</li>
                <li>API access for integration purposes</li>
              </ul>
            </section>

            {/* User Accounts */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">User Accounts</h2>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Account Creation</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                To use certain features of our Service, you must create an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your account information</li>
                <li>Keep your password secure and confidential</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Age Requirements</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                You must be at least 13 years old to use our Service. If you are between 13 and 18 years old, 
                you may only use our Service under the supervision of a parent or legal guardian who agrees 
                to these Terms.
              </p>
            </section>

            {/* Acceptable Use */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Acceptable Use Policy</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                You agree not to use the Service to:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Create or share harmful, offensive, or inappropriate content</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Distribute malware, viruses, or malicious code</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use automated tools to scrape or extract data</li>
                <li>Impersonate others or provide false information</li>
                <li>Engage in any commercial activities without permission</li>
              </ul>
            </section>

            {/* Content and Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Content and Intellectual Property</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Your Content</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                You retain ownership of prompts and content you create using our Service. By sharing content 
                publicly, you grant other users a license to view, use, and adapt your prompts according to 
                the sharing permissions you set.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Our Content</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                The Service, including its design, features, and underlying technology, is owned by Turify 
                and protected by intellectual property laws. You may not copy, modify, or distribute our 
                proprietary content without permission.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">License to Use</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We grant you a limited, non-exclusive, non-transferable license to use our Service for 
                its intended purpose, subject to these Terms.
              </p>
            </section>

            {/* Payment Terms */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Payment Terms</h2>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Subscription Plans</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                We offer various subscription plans with different features and usage limits. Subscription 
                fees are billed in advance on a recurring basis.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Billing and Refunds</h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                <li>Payment is due at the beginning of each billing cycle</li>
                <li>We accept major credit cards and other payment methods</li>
                <li>Refunds are provided according to our refund policy</li>
                <li>You may cancel your subscription at any time</li>
                <li>Access continues until the end of your current billing period</li>
              </ul>
            </section>

            {/* Privacy and Data */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Privacy and Data Protection</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Your privacy is important to us. Please review our Privacy Policy, which explains how we 
                collect, use, and protect your information. By using our Service, you consent to the 
                collection and use of information as outlined in our Privacy Policy.
              </p>
            </section>

            {/* Disclaimers and Limitations */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Disclaimers and Limitations</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Service Availability</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                We strive to maintain high availability but cannot guarantee uninterrupted service. 
                We may temporarily suspend the Service for maintenance, updates, or other reasons.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">AI-Generated Content</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Our Service may integrate with third-party AI models and services. We are not responsible 
                for the accuracy, appropriateness, or reliability of AI-generated content. Users should 
                review and validate all AI outputs before use.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Limitation of Liability</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                To the maximum extent permitted by law, Turify shall not be liable for any indirect, 
                incidental, special, consequential, or punitive damages resulting from your use of the Service.
              </p>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Termination</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Either party may terminate these Terms at any time:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                <li>You may close your account and stop using the Service</li>
                <li>We may suspend or terminate accounts that violate these Terms</li>
                <li>We may discontinue the Service with reasonable notice</li>
                <li>Upon termination, your right to use the Service ceases immediately</li>
                <li>We may retain certain data as required by law or legitimate business interests</li>
              </ul>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Governing Law and Disputes</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                These Terms are governed by the laws of [Your Jurisdiction]. Any disputes arising from 
                these Terms or your use of the Service will be resolved through binding arbitration, 
                except where prohibited by law.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Changes to Terms</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users of material 
                changes via email or prominent notice on our Service. Your continued use of the Service 
                after such changes constitutes acceptance of the updated Terms.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Contact Information</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                If you have questions about these Terms, please contact us:
              </p>
              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Email:</strong> legal@turify.dev<br />
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
} 
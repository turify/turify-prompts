"use client"

import { Card, CardContent } from "@/components/ui/card"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface PromptOutputProps {
  output: string
}

export function PromptOutput({ output }: PromptOutputProps) {
  return (
    <Card className="border border-brand-blue/20 bg-gradient-to-r from-brand-blue/5 to-transparent">
      <CardContent className="p-4">
        <div className="rounded-md bg-white dark:bg-gray-800 p-4 border border-muted shadow-sm">
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Headings
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 mt-6 first:mt-0 border-b border-gray-200 dark:border-gray-700 pb-2">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-5 first:mt-0">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4 first:mt-0">
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-3 first:mt-0">
                    {children}
                  </h4>
                ),
                h5: ({ children }) => (
                  <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-3 first:mt-0">
                    {children}
                  </h5>
                ),
                h6: ({ children }) => (
                  <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-3 first:mt-0">
                    {children}
                  </h6>
                ),
                // Paragraphs
                p: ({ children }) => (
                  <p className="text-gray-700 dark:text-gray-300 mb-4 last:mb-0 leading-relaxed">
                    {children}
                  </p>
                ),
                // Lists
                ul: ({ children }) => (
                  <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300 marker:text-gray-500 dark:marker:text-gray-400">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300 marker:text-gray-500 dark:marker:text-gray-400">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed">{children}</li>
                ),
                // Emphasis
                strong: ({ children }) => (
                  <strong className="font-semibold text-gray-900 dark:text-gray-100">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-gray-700 dark:text-gray-300">{children}</em>
                ),
                // Code
                code: ({ children, className }) => {
                  const isInline = !className?.includes('language-')
                  if (isInline) {
                    return (
                      <code className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-1.5 py-0.5 rounded text-sm font-mono">
                        {children}
                      </code>
                    )
                  }
                  return (
                    <code className="block bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-3 rounded-md text-sm font-mono overflow-x-auto border border-gray-200 dark:border-gray-600">
                      {children}
                    </code>
                  )
                },
                pre: ({ children }) => (
                  <pre className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md mb-4 overflow-x-auto border border-gray-200 dark:border-gray-600">
                    {children}
                  </pre>
                ),
                // Blockquotes
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-brand-blue/30 pl-4 py-2 mb-4 bg-brand-blue/5 dark:bg-brand-blue/10 text-gray-700 dark:text-gray-300 italic">
                    {children}
                  </blockquote>
                ),
                // Tables
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-4">
                    <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-md">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-gray-50 dark:bg-gray-700">{children}</thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">{children}</tbody>
                ),
                tr: ({ children }) => (
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">{children}</tr>
                ),
                th: ({ children }) => (
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                    {children}
                  </td>
                ),
                // Links
                a: ({ children, href }) => (
                  <a
                    href={href}
                    className="text-brand-blue hover:text-brand-blue/80 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                // Horizontal rule
                hr: () => (
                  <hr className="border-gray-200 dark:border-gray-700 my-6" />
                ),
              }}
            >
              {output}
            </ReactMarkdown>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

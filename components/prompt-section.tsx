"use client"

import { Textarea } from "@/components/ui/textarea"

interface PromptSectionProps {
  title: string
  description: string
  placeholder: string
  value: string
  onChange: (value: string) => void
}

export function PromptSection({ title, description, placeholder, value, onChange }: PromptSectionProps) {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Textarea
        placeholder={placeholder}
        className="min-h-[200px] resize-y"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

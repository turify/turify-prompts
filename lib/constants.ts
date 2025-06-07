export const INDUSTRIES = [
  { label: "General", value: "General" },
  { label: "Marketing", value: "Marketing" },
  { label: "Digital Marketing", value: "Digital Marketing" },
  { label: "Technology", value: "Technology" },
  { label: "Customer Service", value: "Customer Service" },
  { label: "Retail", value: "Retail" },
  { label: "Education", value: "Education" },
  { label: "Healthcare", value: "Healthcare" },
  { label: "Finance", value: "Finance" },
  { label: "Legal", value: "Legal" },
  { label: "Real Estate", value: "Real Estate" },
  { label: "Human Resources", value: "Human Resources" },
  { label: "Sales", value: "Sales" },
  { label: "Content Creation", value: "Content Creation" },
] as const

export type Industry = typeof INDUSTRIES[number]['value'] 
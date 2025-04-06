import type React from "react"
import { useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { supabase } from "../../lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useMutation } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { Loader2, AlertCircle, Download } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface RevisionMaterial {
  keyConcepts: string[]
  definitions: { term: string; explanation: string }[]
  formulae: { name: string; formula: string; explanation: string }[]
  summary: string[]
  questions: { question: string; suggestedAnswer: string }[]
}

export default function RevisionGenerator() {
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [generatedMaterial, setGeneratedMaterial] = useState<RevisionMaterial | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [additionalNotes, setAdditionalNotes] = useState("")

  const generateRevisionMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("User not authenticated")
      if (!file) throw new Error("No file selected")

      const apiKey = import.meta.env.VITE_OPENAI_API_KEY
      if (!apiKey) throw new Error("OpenAI API key not found")

      // Read file content
      let text: string
      if (file.type === "application/pdf") {
        const { default: pdfjs } = await import("pdfjs-dist")
        const pdf = await pdfjs.getDocument(await file.arrayBuffer()).promise
        const page = await pdf.getPage(1)
        const content = await page.getTextContent()
        text = content.items.map((item: any) => item.str).join(" ")
      } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        const { default: mammoth } = await import("mammoth")
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })
        text = result.value
      } else {
        text = await file.text()
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are an expert teacher creating revision materials. Always respond with a JSON object containing keyConcepts (array), definitions (array of objects with term and explanation), formulae (array of objects with name, formula, and explanation), summary (array), and questions (array of objects with question and suggestedAnswer).",
            },
            {
              role: "user",
              content: `Analyze this document and create a structured revision summary. Include key concepts, important definitions, formulae/theorems (if applicable), a bullet-pointed summary, and 5-10 key questions for classroom discussion. Format your response as a JSON object. Additional notes: ${additionalNotes}

Document content:
${text}`,
            },
          ],
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || "Failed to generate revision material")
      }

      const data = await response.json()

      if (!data.choices?.[0]?.message?.content) {
        throw new Error("Unexpected response format from OpenAI API")
      }

      let content: RevisionMaterial
      const rawContent = data.choices[0].message.content

      try {
        content = JSON.parse(rawContent)

        // Validate the structure
        if (
          !Array.isArray(content.keyConcepts) ||
          !Array.isArray(content.definitions) ||
          !Array.isArray(content.formulae) ||
          !Array.isArray(content.summary) ||
          !Array.isArray(content.questions) ||
          content.definitions.some((d) => typeof d.term !== "string" || typeof d.explanation !== "string") ||
          content.formulae.some(
            (f) => typeof f.name !== "string" || typeof f.formula !== "string" || typeof f.explanation !== "string",
          ) ||
          content.questions.some((q) => typeof q.question !== "string" || typeof q.suggestedAnswer !== "string")
        ) {
          throw new Error("Invalid structure")
        }
      } catch (error) {
        console.error("Parsing error:", error)
        console.error("Raw content:", rawContent)
        throw new Error(
          "Failed to parse revision material. The AI response was not in the expected format. Please try again.",
        )
      }

      // Store in Supabase
      const { error } = await supabase.from("revision_materials").insert([
        {
          user_id: user.id,
          title: file.name,
          content: content,
          original_filename: file.name,
        },
      ])

      if (error) throw error

      return content
    },
    onSuccess: (data) => {
      setGeneratedMaterial(data)
      toast.success("Revision material generated successfully!")
    },
    onError: (error: Error) => {
      console.error("Generation error:", error)
      setApiError(error.message)
      toast.error(error.message)
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Check file type
      const validTypes = [
        "application/pdf",
        "application/msword",
        "text/plain",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]
      if (!validTypes.includes(selectedFile.type)) {
        toast.error("Please upload a PDF, Word document, or text file")
        return
      }

      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB")
        return
      }

      setFile(selectedFile)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      toast.error("Please select a file")
      return
    }
    generateRevisionMutation.mutate()
  }

  const downloadMaterial = () => {
    if (!generatedMaterial) return

    const content = [
      "REVISION MATERIAL",
      "═".repeat(50),
      "\nKEY CONCEPTS:",
      ...generatedMaterial.keyConcepts.map((concept) => `• ${concept}`),
      "\nIMPORTANT DEFINITIONS:",
      ...generatedMaterial.definitions.map((def) => `${def.term}:\n  ${def.explanation}`),
      "\nFORMULAE & THEOREMS:",
      ...generatedMaterial.formulae.map((f) => `${f.name}:\n  ${f.formula}\n  ${f.explanation}`),
      "\nSUMMARY:",
      ...generatedMaterial.summary.map((point) => `• ${point}`),
      "\nDISCUSSION QUESTIONS:",
      ...generatedMaterial.questions.map(
        (q, i) => `${i + 1}. ${q.question}\n   Suggested Answer: ${q.suggestedAnswer}`,
      ),
    ].join("\n")

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `revision_material_${file?.name.split(".")[0]}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (apiError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{apiError}</AlertDescription>
      </Alert>
    )
  }

  if (generateRevisionMutation.isPending) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="mt-2 text-gray-600">Analyzing document and generating revision material...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="file">Upload Document</Label>
          <Input id="file" type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx,.txt" className="mt-1" />
          <p className="text-sm text-gray-500 mt-1">Upload a PDF, Word document, or text file (max 10MB)</p>
        </div>

        <div>
          <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
          <Textarea
            id="additionalNotes"
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="Any specific focus areas or requirements for the revision material"
            className="mt-1"
            rows={3}
          />
        </div>

        <Button type="submit" className="w-full" disabled={!file}>
          Generate Revision Material
        </Button>
      </form>

      {generatedMaterial && (
        <div className="mt-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Generated Revision Material</h2>
              <Button onClick={downloadMaterial}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>

            <Tabs defaultValue="concepts" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="concepts">Key Concepts</TabsTrigger>
                <TabsTrigger value="definitions">Definitions</TabsTrigger>
                <TabsTrigger value="formulae">Formulae</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="questions">Questions</TabsTrigger>
              </TabsList>

              <TabsContent value="concepts" className="mt-4">
                <div className="space-y-2">
                  {generatedMaterial.keyConcepts.map((concept, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      {concept}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="definitions" className="mt-4">
                <div className="space-y-4">
                  {generatedMaterial.definitions.map((def, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-900">{def.term}</h3>
                      <p className="mt-1 text-gray-600">{def.explanation}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="formulae" className="mt-4">
                <div className="space-y-4">
                  {generatedMaterial.formulae.map((formula, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-900">{formula.name}</h3>
                      <p className="mt-1 font-mono bg-white p-2 rounded">{formula.formula}</p>
                      <p className="mt-2 text-gray-600">{formula.explanation}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="summary" className="mt-4">
                <div className="space-y-2">
                  {generatedMaterial.summary.map((point, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      • {point}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="questions" className="mt-4">
                <div className="space-y-4">
                  {generatedMaterial.questions.map((q, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-900">
                        Q{index + 1}: {q.question}
                      </h3>
                      <p className="mt-2 text-gray-600">
                        <span className="font-medium">Suggested Answer:</span> {q.suggestedAnswer}
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  )
}
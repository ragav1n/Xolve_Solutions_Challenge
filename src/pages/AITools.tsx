import { useState } from "react"
import { FileSpreadsheet, PresentationIcon, Brain, Presentation } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AITools() {
  const [activeDialog, setActiveDialog] = useState<string | null>(null)

  const tools = [
    {
      icon: FileSpreadsheet,
      title: "Quiz Generator",
      description: "AI-powered question generation to create custom quizzes for any subject.",
      action: "Coming Soon",
      id: "quiz",
    },
    {
      icon: PresentationIcon,
      title: "Revision Material Generator",
      description: "Generate structured revision content from documents effortlessly.",
      action: "Coming Soon",
      id: "revision",
    },
    {
      icon: Brain,
      title: "Stress Management Analyzer",
      description: "Track and analyze your stress levels with smart insights.",
      action: "Coming Soon",
      id: "stress",
    },
    {
      icon: Presentation,
      title: "Presentation Generator",
      description: "Create visually appealing presentations powered by AI assistance.",
      action: "Coming Soon",
      id: "presentation",
    },
  ]

  const getDialogTitle = (id: string) => {
    switch (id) {
      case "quiz":
        return "Quiz Generator"
      case "revision":
        return "Revision Material Generator"
      case "stress":
        return "Stress Management Analyzer"
      case "presentation":
        return "Presentation Generator"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">AI Tools</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {tools.map((tool) => (
          <Card key={tool.title} className="overflow-hidden transition-all hover:shadow-lg bg-white dark:bg-gray-800">
            <CardHeader className="space-y-1">
              <div className="flex items-center space-x-2">
                <tool.icon className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">{tool.title}</CardTitle>
              </div>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setActiveDialog(tool.id)}
              >
                {tool.action}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!activeDialog} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{activeDialog ? getDialogTitle(activeDialog) : ""}</DialogTitle>
            <DialogDescription>
              This feature is currently under development. It will use the <strong>Gemma API</strong> to provide intelligent and efficient assistance for your educational needs.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}
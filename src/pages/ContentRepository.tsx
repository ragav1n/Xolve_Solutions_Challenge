import type React from "react"
import { Book, ExternalLink } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const grades = [
  { name: "8th Grade", link: "https://drive.google.com/drive/folders/1pN8kOwrwPHFc0NVhR8iTpxdjUaTQWz8f" },
  { name: "9th Grade", link: "https://drive.google.com/drive/folders/1mPXX8AVx8AWf9QSlJLrMZRyGjlMZtfVh" },
  { name: "10th Grade", link: "https://drive.google.com/drive/folders/139ebm02gFAxWbRLLtLPSH5FvNPc4SpCI" },
]

const ContentRepository: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Content Repository</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {grades.map((grade) => (
          <div key={grade.name} className="transition-all duration-300 ease-in-out hover:transform hover:scale-105">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Book className="mr-2" />
                  {grade.name}
                </CardTitle>
                <CardDescription>Access {grade.name} content</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => window.open(grade.link, "_blank")}>
                  Open Drive <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ContentRepository
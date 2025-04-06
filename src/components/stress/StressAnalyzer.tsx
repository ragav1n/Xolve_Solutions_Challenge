import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { supabase } from "../../lib/supabase"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useMutation, useQuery } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { Loader2, AlertCircle, TrendingUp } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface MoodLog {
  id: string
  mood: string
  emotions: string[]
  reasons: string[]
  timestamp: string
  recommendations: string[]
}

const moodOptions = ["Happy", "Neutral", "Stressed", "Overwhelmed", "Anxious", "Excited", "Tired"]

const emotionOptions = [
  "Fatigue",
  "Irritation",
  "Motivation",
  "Excitement",
  "Frustration",
  "Satisfaction",
  "Worry",
  "Confidence",
]

const reasonOptions = [
  "Lesson difficulty",
  "Student engagement",
  "Workload",
  "Exam stress",
  "Time management",
  "Administrative tasks",
  "Classroom behavior",
  "Parent communication",
]

export default function StressAnalyzer() {
  const { user } = useAuth()
  const [selectedMood, setSelectedMood] = useState<string>("")
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [apiError, setApiError] = useState<string | null>(null)

  // Fetch mood logs
  const { data: moodLogs = [], refetch: refetchMoodLogs } = useQuery<MoodLog[]>({
    queryKey: ["mood-logs"],
    queryFn: async () => {
      if (!user?.id) return []

      const { data, error } = await supabase
        .from("mood_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("timestamp", { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!user?.id,
  })

  // Set up notification interval
  useEffect(() => {
    const checkTime = () => {
      const lastLog = moodLogs[0]
      if (!lastLog) return true

      const lastLogTime = new Date(lastLog.timestamp)
      const now = new Date()
      const hoursSinceLastLog = (now.getTime() - lastLogTime.getTime()) / (1000 * 60 * 60)

      return hoursSinceLastLog >= 3
    }

    const interval = setInterval(
      () => {
        if (checkTime()) {
          toast(
            (t) => (
              <div className="flex items-center">
                <span>Time to log your mood! How are you feeling?</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-2"
                  onClick={() => {
                    toast.dismiss(t.id)
                    document.getElementById("mood-form")?.scrollIntoView({ behavior: "smooth" })
                  }}
                >
                  Log Now
                </Button>
              </div>
            ),
            {
              duration: 10000,
            },
          )
        }
      },
      15 * 60 * 1000,
    ) // Check every 15 minutes

    return () => clearInterval(interval)
  }, [moodLogs])

  const analyzeMoodMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("User not authenticated")

      const apiKey = import.meta.env.VITE_OPENAI_API_KEY
      if (!apiKey) throw new Error("OpenAI API key not found")

      // Get AI recommendations
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
                "You are an expert in teacher well-being and stress management. Always respond with a JSON object containing emotions and recommendations.",
            },
            {
              role: "user",
              content: `Provide 3-5 specific recommendations for a teacher who is feeling ${selectedMood.toLowerCase()} 
                with the following emotions: ${selectedEmotions.join(", ")}. 
                They identified these reasons: ${selectedReasons.join(", ")}.
                Focus on practical classroom strategies and stress management techniques.
                Format your response as a JSON object with 'emotions' and 'recommendations' arrays.`,
            },
          ],
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || "Failed to analyze mood")
      }

      const data = await response.json()

      if (!data.choices?.[0]?.message?.content) {
        throw new Error("Unexpected response format from OpenAI API")
      }

      const analysis = JSON.parse(data.choices[0].message.content)

      // Validate the parsed content has the expected structure
      if (
        !analysis ||
        typeof analysis !== "object" ||
        !Array.isArray(analysis.emotions) ||
        !Array.isArray(analysis.recommendations)
      ) {
        throw new Error("Invalid mood analysis structure received. Please try again.")
      }

      const recommendations: string[] = analysis.recommendations // recommendations is now const

      // Store in Supabase
      const { error } = await supabase.from("mood_logs").insert([
        {
          user_id: user.id,
          mood: selectedMood,
          emotions: selectedEmotions,
          reasons: selectedReasons,
          recommendations,
          timestamp: new Date().toISOString(),
        },
      ])

      if (error) throw error

      return { mood: selectedMood, emotions: selectedEmotions, reasons: selectedReasons, recommendations }
    },
    onSuccess: () => {
      toast.success("Mood logged successfully!")
      refetchMoodLogs()
      // Reset form
      setSelectedMood("")
      setSelectedEmotions([])
      setSelectedReasons([])
    },
    onError: (error: Error) => {
      console.error("Mood analysis error:", error)
      setApiError(error.message)
      toast.error(error.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMood) {
      toast.error("Please select your current mood")
      return
    }
    analyzeMoodMutation.mutate()
  }

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions((prev) => (prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]))
  }

  const toggleReason = (reason: string) => {
    setSelectedReasons((prev) => (prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]))
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

  return (
    <div className="space-y-6 h-[calc(100vh-200px)] overflow-y-auto">
      <form id="mood-form" onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label>How are you feeling now?</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
            {moodOptions.map((mood) => (
              <Button
                key={mood}
                type="button"
                variant={selectedMood === mood ? "default" : "outline"}
                onClick={() => setSelectedMood(mood)}
                className="w-full"
              >
                {mood}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label>What specific emotions are you experiencing?</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
            {emotionOptions.map((emotion) => (
              <Button
                key={emotion}
                type="button"
                variant={selectedEmotions.includes(emotion) ? "default" : "outline"}
                onClick={() => toggleEmotion(emotion)}
                className="w-full"
              >
                {emotion}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label>What are the main reasons?</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
            {reasonOptions.map((reason) => (
              <Button
                key={reason}
                type="button"
                variant={selectedReasons.includes(reason) ? "default" : "outline"}
                onClick={() => toggleReason(reason)}
                className="w-full"
              >
                {reason}
              </Button>
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={analyzeMoodMutation.isPending}>
          {analyzeMoodMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze Stress Level"
          )}
        </Button>
      </form>

      {moodLogs.length > 0 && (
        <div className="mt-8">
          <div className="bg-white p-6 rounded-lg shadow-md h-[500px] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Mood History</h2>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>

            <Tabs defaultValue="daily" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>

              <TabsContent value="daily" className="mt-4">
                <div className="space-y-4">
                  {moodLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-medium text-gray-900">{log.mood}</span>
                          <p className="text-sm text-gray-500 mt-1">{new Date(log.timestamp).toLocaleTimeString()}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex flex-wrap gap-1 justify-end">
                            {log.emotions.map((emotion) => (
                              <span key={emotion} className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                {emotion}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      {log.recommendations && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm font-medium text-gray-900">Recommendations:</p>
                          <ul className="mt-1 space-y-1">
                            {log.recommendations.map((rec, index) => (
                              <li key={index} className="text-sm text-gray-600">
                                • {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="weekly" className="mt-4">
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Weekly mood trends visualization coming soon
                </div>
              </TabsContent>

              <TabsContent value="monthly" className="mt-4">
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Monthly mood trends visualization coming soon
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  )
} 
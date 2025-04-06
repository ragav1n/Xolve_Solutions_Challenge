import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, RefreshCw } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

interface Course {
  title: string
  url: string
}

interface Conference {
  title: string
  date: string
  location: string
  link: string
}

const CareerDevelopment = () => {
  const [retryCount, setRetryCount] = useState(0)

  const {
    data: courseData,
    isLoading: coursesLoading,
    error: coursesError,
    refetch: refetchCourses,
  } = useQuery<Course[], AxiosError>({
    queryKey: ["courses", retryCount],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/courses")
        console.log("Received courses response:", response)
        return response.data
      } catch (error) {
        console.error("Error fetching courses:", error)
        throw error
      }
    },
    retry: 2,
    retryDelay: 1000,
  })

  const {
    data: conferenceData,
    isLoading: conferencesLoading,
    error: conferencesError,
    refetch: refetchConferences,
  } = useQuery<Conference[], AxiosError>({
    queryKey: ["conferences", retryCount],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/conferences")
        console.log("Received conferences response:", response)
        return response.data
      } catch (error) {
        console.error("Error fetching conferences:", error)
        throw error
      }
    },
    retry: 2,
    retryDelay: 1000,
  })

  const handleRetry = () => {
    console.log("Retrying with count:", retryCount + 1)
    setRetryCount((prev) => prev + 1)
    refetchCourses()
    refetchConferences()
  }

  if (coursesLoading || conferencesLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (coursesError || conferencesError) {
    const errorMessage =
      coursesError instanceof AxiosError
        ? coursesError.message
        : conferencesError instanceof AxiosError
          ? conferencesError.message
          : "An unknown error occurred"

    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>Failed to load career development resources: {errorMessage}</p>
          <Button onClick={handleRetry} variant="outline" className="mt-2">
            <RefreshCw className="mr-2 h-4 w-4" /> Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">Career Development</h1>

      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="courses">Online Courses</TabsTrigger>
          <TabsTrigger value="conferences">Conferences & Events</TabsTrigger>
        </TabsList>
        <TabsContent value="courses">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courseData && courseData.length > 0 ? (
              courseData.map((course) => (
                <Card key={course.url} className="h-full bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle>{course.title}</CardTitle>
                    <CardDescription>Online Course</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" onClick={() => window.open(course.url, "_blank")}>
                      Go to Course <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground">No courses available at the moment.</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="conferences">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conferenceData && conferenceData.length > 0 ? (
              conferenceData.map((conference) => (
                <Card key={conference.link} className="h-full bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle>{conference.title}</CardTitle>
                    <CardDescription>{conference.date}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">{conference.location}</p>
                    <Button className="w-full" onClick={() => window.open(conference.link, "_blank")}>
                      Go to Event <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground">No conferences available in Bangalore at the moment.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CareerDevelopment
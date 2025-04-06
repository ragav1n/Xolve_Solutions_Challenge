const PORT = 3001
import axios from "axios"
import * as cheerio from "cheerio"
import express from "express"
import cors from "cors"
import cron from "node-cron"

const app = express()

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  }),
)

app.use((err, req, res, next) => {
  console.error("Server Error:", err)
  res.status(500).json({ error: "Internal Server Error", details: err.message })
})

let cachedCourses = []
let cachedConferences = []

const scrapeCourses = async () => {
  try {
    const response = await axios.get("https://www.coursera.org/courses?query=teaching&topic=Math%20and%20Logic")
    const html = response.data
    const $ = cheerio.load(html)
    const courses = []
    $(".cds-ProductCard-header", html).each(function () {
      let title = $(this).text().trim()
      title = title.replace(/\s+/g, " ")
      const url = "https://www.coursera.org" + $(this).find("a").attr("href")
      courses.push({ title, url })
    })
    console.log(`Scraped ${courses.length} courses`)
    return courses
  } catch (error) {
    console.error("Error scraping courses:", error.message)
    return []
  }
}

const scrapeConferences = async () => {
  try {
    const response = await axios.get("https://www.conferencealerts.com/country-listing?country=India")
    const html = response.data
    const $ = cheerio.load(html)
    const conferences = []
    $(".eventslist tr", html).each((index, element) => {
      if (index === 0) return // Skip header row
      const title = $(element).find("td:nth-child(2) a").text().trim()
      const date = $(element).find("td:nth-child(1)").text().trim()
      const location = $(element).find("td:nth-child(3)").text().trim()
      const link = "https://www.conferencealerts.com" + $(element).find("td:nth-child(2) a").attr("href")
      if (location.toLowerCase().includes("bangalore") || location.toLowerCase().includes("bengaluru")) {
        conferences.push({ title, date, location, link })
      }
    })
    console.log(`Scraped ${conferences.length} conferences in Bangalore`)
    return conferences
  } catch (error) {
    console.error("Error scraping conferences:", error.message)
    return []
  }
}

const updateCachedData = async () => {
  try {
    const courses = await scrapeCourses()
    if (courses.length > 0) {
      cachedCourses = courses
      console.log("Courses updated successfully")
    } else {
      console.warn("No courses were scraped, keeping existing cached courses")
    }

    const conferences = await scrapeConferences()
    if (conferences.length > 0) {
      cachedConferences = conferences
      console.log("Conferences updated successfully")
    } else {
      console.warn("No conferences were scraped, keeping existing cached conferences")
    }
  } catch (error) {
    console.error("Error updating cached data:", error.message)
  }
}

// Initialize data immediately
updateCachedData()

// Update data daily
cron.schedule("0 0 * * *", updateCachedData)

app.get("/health", (req, res) => {
  res.json({ status: "ok" })
})

app.get("/courses", (req, res) => {
  console.log("Courses requested, sending", cachedCourses.length, "courses")
  res.json(cachedCourses)
})

app.get("/conferences", (req, res) => {
  console.log("Conferences requested, sending", cachedConferences.length, "conferences")
  res.json(cachedConferences)
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
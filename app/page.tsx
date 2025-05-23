"use client"
import { useState } from "react"
import { Search, Newspaper, MapPin, Loader2 } from "lucide-react"

// Define the locations data
const locationOptions = [
  { city: "Select a city", coords: "" },
  { city: "New Delhi", coords: "28.6448,77.2167" },
  { city: "Mumbai", coords: "19.0761,72.8775" },
  { city: "Kolkata", coords: "22.5675,88.3700" },
  { city: "Bengaluru", coords: "12.9716,77.5917" },
  { city: "Chennai", coords: "13.0674,80.2376" },
  { city: "Hyderabad", coords: "17.3871,78.4917" },
  { city: "Pune", coords: "18.5167,73.8563" },
  { city: "Jaipur", coords: "26.9075,75.7396" },
  { city: "Ahmedabad", coords: "23.0339,72.5850" },
  { city: "Agra", coords: "27.1761,78.0017" },
]

export default function Home() {
  const [category, setCategory] = useState("")
  const [location, setLocation] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  type NewsItem = {
    urlToImage?: string
    title?: string
    description?: string
  }
  const [news, setNews] = useState<NewsItem[]>([])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleSearch = async () => {
    if (!category.trim() && !selectedCity) {
      setError("Please enter a category or select a location")
      return
    }

    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:8000/api/getnews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          category, 
          location: selectedCity ? locationOptions.find(loc => loc.city === selectedCity)?.coords : ""
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch news")
      }

      const data = await response.json()
      setNews(data.allnews || [])
    } catch (error) {
      console.error("Failed to fetch news:", error)
      setError("Failed to fetch news. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="news-container">
      <div className="hero-section">
        <Newspaper className="hero-icon" />
        <h1 className="heading">News Finder</h1>
        <p className="subheading">Discover the latest news by category and location</p>
      </div>

      <div className="search-container">
        <div className="input-group">
          <div className="input-wrapper">
            <Newspaper className="input-icon" />
            <input
              type="text"
              placeholder="Enter category..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              onKeyPress={handleKeyPress}
              className="search-input"
            />
          </div>

          <div className="input-wrapper">
            <MapPin className="input-icon" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="search-input"
            >
              {locationOptions.map((option) => (
                <option key={option.city} value={option.city}>
                  {option.city}
                </option>
              ))}
            </select>
          </div>

          <button onClick={handleSearch} className="search-button" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <Search className="button-icon" />
                Search
              </>
            )}
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}
      </div>

      <div className="news-display">
        {news.map((item, index) => (
          <div className="news-card" key={index}>
            <div className="card-image-container">
              {item.urlToImage ? (
                <img src={item.urlToImage || "/placeholder.svg"} alt="news" className="news-image" />
              ) : (
                <div className="placeholder-image">
                  <Newspaper size={48} />
                </div>
              )}
            </div>
            <div className="news-content">
              <h2 className="news-title">{item.title || "No Title"}</h2>
              <p className="news-description">{item.description || "No Description"}</p>
              <button className="read-more-button">Read More</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

"use client"
import { useState } from "react"
import { Search, Newspaper, MapPin, Loader2 } from "lucide-react"
import { it } from "node:test"

export default function Home() {
  const [category, setCategory] = useState("")
  const [location, setLocation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  type NewsItem = {
    urlToImage?: string
    title?: string
    description?: string
    url: string
  }
  const [news, setNews] = useState<NewsItem[]>([])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleSearch = async () => {
    if (!category.trim() && !location.trim()) {
      setError("Please enter a category or location to search")
      return
    }

    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:8000/api/getnews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, location }),
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

  const redirectToPage = async (url: string) => {
    window.location.href = url
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
            <input
              type="text"
              placeholder="Enter location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={handleKeyPress}
              className="search-input"
            />
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
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="read-more-button">Read More</a>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

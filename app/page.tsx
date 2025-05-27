"use client"
import { useState } from "react"
import { Search, Newspaper, MapPin, Loader2 } from 'lucide-react'

export default function Home() {
  const [category, setCategory] = useState("")
  const [location, setLocation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [newsUuid, setNewsUuid] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  type NewsItem = {
    title?: string
    image_src?: string
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
    setNews([])
    setCurrentIndex(0)

    try {
      const response = await fetch("http://localhost:8000/api/crawl-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, location }),
      })

      if (!response.ok) throw new Error("Failed to fetch news")

      const data = await response.json()
      const uuid = data.uuid
      setNewsUuid(uuid)

      const news_response = await fetch("http://localhost:8000/api/get-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ news_uuid: uuid }),
      })

      if (!news_response.ok) throw new Error("Failed to fetch news")

      const news_got = await news_response.json()

      const flatNews: NewsItem[] = []
      news_got.forEach((group: any) => {
        const url = group.url
        group.articles.forEach((article: any) => {
          // Only add articles that have valid image_src
          if (article.image_src && article.image_src.trim() !== "") {
            flatNews.push({
              title: article.title,
              image_src: article.image_src,
              url: url,
            })
          }
        })
      })

      setNews(flatNews)

      if (flatNews.length === 0) {
        setError("No images found for your search criteria")
      }
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
            <input
              type="text"
              placeholder="Enter location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={handleKeyPress}
              className="search-input"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="search-button"
          >
            {isLoading ? <Loader2 className="button-icon animate-spin" /> : <Search className="button-icon" />}
            Search
          </button>
        </div>
        {error && <p className="error-message">{error}</p>}
      </div>

      {/* Image Display Only */}
      {news.length > 0 && (
        <div className="image-showcase">
          <img
            src={news[currentIndex].image_src || "/placeholder.svg"}
            alt="News image"
            className="showcase-image"
          />

          {/* Navigation */}
          {news.length > 1 && (
            <div className="navigation-controls">
              {currentIndex > 0 && (
                <button
                  onClick={() => setCurrentIndex(currentIndex - 1)}
                  className="nav-button prev-button"
                >
                  ← Previous
                </button>
              )}
              <span className="image-counter">
                {currentIndex + 1} / {news.length}
              </span>
              {currentIndex < news.length - 1 && (
                <button
                  onClick={() => setCurrentIndex(currentIndex + 1)}
                  className="nav-button next-button"
                >
                  Next →
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="loading-state">
          <Loader2 className="loading-spinner animate-spin" />
          <p className="loading-text">Searching for news...</p>
        </div>
      )}

      {/* No Results */}
      {!isLoading && news.length === 0 && !error && (category || location) && (
        <div className="no-results-state">
          <Newspaper className="no-results-icon" />
          <h3 className="no-results-title">No Images Found</h3>
          <p className="no-results-text">Try different search terms or check your spelling.</p>
        </div>
      )}
    </main>
  )
}
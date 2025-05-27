"use client"
import { useState } from "react"
import { Search, Newspaper, MapPin, Loader2 } from "lucide-react"
import { it } from "node:test"

export default function Home() {
  const [category, setCategory] = useState("")
  const [location, setLocation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [news_uuid, setNewsUuid] = useState("")

  type NewsItem = {
    urlToImage?: string
    title?: string
    description?: string
    url?: string
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
    const response = await fetch("http://localhost:8000/api/crawl-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, location }),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch news")
    }

    const data = await response.json()
    console.log("API Responseeeeee:", data)

    const uuid = data.uuid
    setNewsUuid(uuid)

    const news_response = await fetch("http://localhost:8000/api/get-news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ news_uuid: uuid }),
    })

    if (!news_response.ok) {
      throw new Error("Failed to fetch news")
    }

    const news_got = await news_response.json()

    setNews(news_got)

    if (news_got.length === 0) {
      setError("No news found for your search criteria")
    }
  } catch (error) {
    console.error("Failed to fetch news:", error)
    setError("Failed to fetch news. Please try again.")
  } finally {
    setIsLoading(false)
  }
}

  const handleReadMore = (url?: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
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

      {/* Results Count */}
      {news.length > 0 && (
        <div className="results-header">
          <h2 className="results-count">Found {news.length} news articles</h2>
          <div className="results-divider"></div>
        </div>
      )}

      <div className="news-display">
        {news.map((item, index) => (
          <div className="news-card" key={index}>
            <div className="card-image-container">
              {item.urlToImage ? (
                <img 
                  src={item.urlToImage} 
                  alt={item.title || "News image"} 
                  className="news-image"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const placeholder = target.parentElement?.querySelector('.placeholder-image') as HTMLElement;
                    if (placeholder) {
                      placeholder.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div className={`placeholder-image ${item.urlToImage ? 'hidden' : ''}`}>
                <Newspaper size={48} />
              </div>
            </div>
            <div className="news-content">
              <h2 className="news-title">{item.title || "No Title Available"}</h2>
              <p className="news-description">{item.description || "No description available"}</p>
              <button 
                className="read-more-button"
                onClick={() => handleReadMore(item.url)}
                disabled={!item.url}
              >
                Read More →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="loading-state">
          <Loader2 className="loading-spinner animate-spin" />
          <p className="loading-text">Searching for news...</p>
        </div>
      )}

      {/* No Results State */}
      {!isLoading && news.length === 0 && !error && (category || location) && (
        <div className="no-results-state">
          <Newspaper className="no-results-icon" />
          <h3 className="no-results-title">No News Found</h3>
          <p className="no-results-text">Try different search terms or check your spelling.</p>
        </div>
      )}
    </main>
  )
}

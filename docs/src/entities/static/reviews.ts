namespace ReviewsDAO {
  export async function getStats(): Promise<Stats> {
    const response = await fetch("/static/clutch-reviews.json")
    return await response.json()
  }

  export interface Review {
    rating: number
    author: string
    verified: boolean
    content: string
  }

  export interface Stats {
    totalRating: number
    totalReviews: number
    reviews: Review[]
  }
}

export default ReviewsDAO

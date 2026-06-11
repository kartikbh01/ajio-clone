import { Star } from "lucide-react"

interface Review {
  rating: number
  comment: string
  reviewerName: string
}

interface ReviewsProps {
  reviews?: Review[]
}

export function ProductReviews({
  reviews = [],
}: ReviewsProps) {
  if (reviews.length === 0) {
    return (
      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-4">
          Customer Reviews
        </h2>

        <div className="border rounded-xl p-8 text-center text-muted-foreground">
          No reviews yet.
        </div>
      </section>
    )
  }

  const average =
    reviews.reduce((sum, r) => sum + r.rating, 0) /
    reviews.length

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold mb-6">
        Customer Reviews
      </h2>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold">
            {average.toFixed(1)}
          </span>

          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`size-5 ${
                  i < Math.round(average)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>

          <span className="text-muted-foreground">
            ({reviews.length} reviews)
          </span>
        </div>

        <div className="space-y-4">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="border rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">
                  {review.reviewerName}
                </p>

                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-4 ${
                        i < review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
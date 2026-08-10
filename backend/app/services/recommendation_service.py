from app.core.database import SessionLocal
from app.models.product_score import ProductScore


class RecommendationService:

    def generate_recommendations(self):

        db = SessionLocal()

        try:

            products = db.query(ProductScore).all()

            recommendations = []

            for product in products:

                # Excellent performer
                if product.attractiveness_score >= 80:

                    message = (
                        "Excellent product performance. "
                        "Maintain current placement and stock levels."
                    )

                # High attention but poor conversion
                elif product.attention_duration >= 80 and product.conversion_rate < 20:

                    message = (
                        "High eye attention but low sales. "
                        "Review pricing or promotional offers."
                    )

                # Low customer attention
                elif product.attention_duration < 30:

                    message = (
                        "Low customer attention. "
                        "Move product to a more visible shelf."
                    )

                # Low interaction
                elif product.interaction_frequency < 30:

                    message = "Customers rarely interact. " "Improve product placement."

                else:

                    message = "Product performance is average."

                recommendations.append(
                    {
                        "product": product.product_name,
                        "score": product.attractiveness_score,
                        "recommendation": message,
                    }
                )
            return recommendations

        finally:
            db.close()

from app.core.database import SessionLocal
from app.models.product_score import ProductScore


class RecommendationService:

    def generate_recommendations(self):

        db = SessionLocal()

        try:

            products = db.query(ProductScore).all()

            recommendations = []

            for product in products:

                # High attention but poor sales
                if product.attention_duration >= 80 and product.conversion_rate < 20:

                    message = (
                        "High attention but low sales. "
                        "Review pricing or promotional offers."
                    )

                # Low attention
                elif product.attention_duration < 30:

                    message = (
                        "Low customer attention. "
                        "Move product to a more visible shelf."
                    )

                # Low interaction
                elif product.interaction_frequency < 30:

                    message = "Customers rarely interact. " "Improve product placement."

                # Excellent performer
                elif product.attractiveness_score >= 80:

                    message = "Top performing product. " "Maintain current placement."

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

# Consumer-Attention-Mapping-System

Consumer Attention Mapping System
Overview

The Consumer Attention Mapping System is an AI-powered retail analytics platform that helps retailers understand how customers interact with products, shelves, and store layouts in real time. The system leverages Computer Vision, Artificial Intelligence, and Machine Learning to transform live CCTV camera feeds into meaningful business insights.

Unlike traditional retail systems that only record sales transactions, this platform analyzes the complete customer journey—from the moment a shopper enters the store until they complete their purchase. It detects and tracks shoppers, estimates their attention towards products, monitors product interactions, analyzes shopping behavior, and generates actionable insights that help retailers optimize product placement, improve customer engagement, and increase sales.

The system is designed for retail stores, supermarkets, shopping malls, FMCG companies, consumer brands, and retail analytics teams, enabling them to make data-driven decisions based on real customer behavior instead of assumptions.

Problem Statement

Retail businesses often rely on sales data to evaluate product performance. However, sales reports only indicate what customers purchased, not how they made their purchasing decisions.

Retailers still lack answers to critical questions such as:

Which products attract the highest customer attention?
Which shelves receive the most customer traffic?
How long do customers spend viewing a product?
Which products are picked up but not purchased?
Which areas of the store are frequently ignored?
How do customers move throughout the store?
Which promotional displays are most effective?

Without these insights, retailers cannot accurately optimize product placement, improve store layouts, or enhance customer engagement.

The Consumer Attention Mapping System addresses these challenges by converting live video streams into actionable retail intelligence.

Project Objective

The primary objective of this project is to build a real-time AI-based retail analytics platform capable of understanding customer behavior inside a retail environment.

The system aims to:

Detect and track shoppers in real time.
Analyze customer movement throughout the store.
Estimate customer attention toward shelves and products.
Monitor product interactions such as viewing, picking up, comparing, returning, and purchasing.
Generate customer attention heatmaps.
Analyze shopping behavior and customer journeys.
Calculate product attractiveness scores.
Provide AI-driven recommendations for shelf optimization and product placement.
Deliver interactive dashboards and analytical reports for business decision-making.
How the System Works

The Consumer Attention Mapping System follows a complete end-to-end AI pipeline.

Customer Enters Store
          │
          ▼
CCTV Camera Captures Video
          │
          ▼
OpenCV Processes Video Frames
          │
          ▼
YOLOv8 Detects Customers & Products
          │
          ▼
DeepSORT / ByteTrack Tracks Customers
          │
          ▼
MediaPipe Estimates Head Pose & Gaze
          │
          ▼
Attention Analysis Engine
          │
          ▼
Product Interaction Analysis
          │
          ▼
Consumer Behavior Analysis
          │
          ▼
Heatmap Generation
          │
          ▼
Product Attractiveness Scoring
          │
          ▼
Recommendation Engine
          │
          ▼
Analytics Dashboard

The AI continuously analyzes customer activities and converts them into meaningful retail analytics.

Key Features
Customer Detection

The system detects every customer entering the retail store using YOLOv8 object detection.

Features
Real-time person detection
Multi-person detection
Customer counting
Entry and exit monitoring
Customer Tracking

Each detected shopper is assigned a temporary tracking ID using DeepSORT or ByteTrack.

The tracking engine continuously follows each shopper throughout the shopping session, allowing the system to reconstruct complete customer journeys.

Features
Unique customer tracking
Path tracking
Entry and exit tracking
Shopping session generation
Attention Analysis

The system estimates where customers are looking using head pose estimation and gaze analysis.

It measures:

Dwell Time
View Duration
Shelf Attention
Product Attention
Repeat Attention Events

This helps retailers identify which products attract customer attention.

Product Interaction Detection

The platform detects customer interactions with products.

Interaction events include:

Product Viewed
Product Picked Up
Product Compared
Product Returned
Product Purchased

These interactions provide deeper insights into customer purchasing behavior.

Consumer Behavior Intelligence

The system analyzes shopping patterns to classify customers into different behavioral groups.

Examples include:

Explorer
Quick Buyer
Comparison Shopper
Impulse Buyer
Brand Loyal Customer

Behavior analysis helps retailers understand customer preferences and improve marketing strategies.

Attention Heatmaps

The system generates real-time visual heatmaps showing:

Customer traffic
Shelf engagement
Product attention
High-interest zones
Low-traffic areas

These heatmaps help optimize store layouts and improve customer flow.

Product Attractiveness Scoring

Each product receives an attractiveness score based on multiple customer engagement metrics.

The score considers:

Attention Duration
Product Interaction Frequency
Pickup Rate
Purchase Conversion Rate
Repeat Engagement

Products with higher scores are considered more attractive to shoppers.

Recommendation Engine

Based on customer behavior analysis, the AI provides recommendations such as:

Better shelf placement
Product relocation
Promotional display optimization
Layout improvements
Customer engagement enhancements

These recommendations help improve product visibility and increase sales.

Analytics Dashboard

The platform provides interactive dashboards for different user roles.

Store Manager
Store traffic
Shelf performance
Product engagement
Sales conversion
Retail Analyst
Customer behavior
Heatmaps
Product attractiveness
Shopping journey analysis
Marketing Manager
Campaign performance
Product visibility
Customer engagement
Administrator
User management
Camera management
Platform monitoring
Technology Stack
Backend
Python
FastAPI
Frontend
React.js
Next.js
Tailwind CSS
Databases
PostgreSQL
MongoDB
Computer Vision
YOLOv8
OpenCV
MediaPipe
Multi-Object Tracking
DeepSORT
ByteTrack
Machine Learning
TensorFlow
PyTorch
Scikit-learn
XGBoost
Data Processing
NumPy
Pandas
Data Visualization
Plotly
Matplotlib
Seaborn
Chart.js
Real-Time Streaming
Kafka
Redis Streams
Authentication
JWT Authentication
Cloud & Deployment
Docker
Docker Compose
AWS / Azure
Development Tools
VS Code
Git
GitHub
GitHub Actions
Postman
Expected Outputs

The system generates:

Customer Attention Reports
Product Engagement Reports
Shelf Performance Reports
Consumer Behavior Analytics
Customer Journey Analytics
Store Traffic Reports
Product Attractiveness Scores
Attention Heatmaps
Retail Intelligence Dashboards
PDF & Excel Reports
AI-Based Shelf Optimization Recommendations
Applications

The Consumer Attention Mapping System can be deployed in:

Supermarkets
Retail Stores
Shopping Malls
Hypermarkets
FMCG Companies
Consumer Brands
Retail Chains
Smart Stores
Marketing Analytics Organizations
Benefits
Understand customer shopping behavior.
Improve product visibility.
Optimize shelf placement.
Increase customer engagement.
Reduce low-performing shelf space.
Improve promotional effectiveness.
Generate real-time retail intelligence.
Support data-driven business decisions.
Increase conversion rates and sales.
Enhance the overall customer shopping experience.
Future Enhancements
Facial emotion recognition for customer sentiment analysis.
AI-based personalized product recommendations.
Mobile application for store managers.
Integration with POS (Point of Sale) systems.
Predictive inventory management.
Customer demographic analysis.
Voice-enabled analytics dashboard.
Multi-store centralized monitoring.
Edge AI deployment for low-latency processing.
Integration with IoT shelf sensors and smart retail devices.
Conclusion

The Consumer Attention Mapping System is a comprehensive AI-driven retail analytics solution that bridges the gap between customer behavior and business intelligence. By combining Computer Vision, Artificial Intelligence, Machine Learning, and Real-Time Analytics, the platform enables retailers to understand how shoppers interact with products, shelves, and store layouts.

Through real-time customer detection, tracking, attention analysis, product interaction monitoring, heatmap generation, and behavioral intelligence, the system delivers actionable insights that help retailers optimize merchandising strategies, improve customer engagement, and maximize sales performance. It serves as a scalable and production-ready solution for modern smart retail environments.

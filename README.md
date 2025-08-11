# 🌾 NeerVaani – AI-Powered Personal Assistant for Small-Scale Farmers

*Built with Google AI Technologies | Voice-first | 13 Indian Languages | Firebase Studio Deployment*

---

## 🚀 Objective

*NeerVaani* is a hybrid multi-agent AI system designed to empower small-scale Indian farmers by acting as a *personal agronomist, market analyst, irrigation planner, disease advisor, and government scheme navigator*.

It provides real-time, voice-enabled, localized insights to support decisions on crop selection, irrigation, disease management, market prices, and more – all through a simple and inclusive voice-first interface.

---

## 🧠 Key Features

### 🌱 Crop Recommender Agent
- Recommends crops based on:
  - Soil type
  - Environmental conditions
  - Last crop grown
  - Crop rotation
  - Location (climate, rainfall)
- Uses *Medley dataset* with 24+ environmental factors
- Built using *Vertex AI Genkit, **Flash, and **Localized RAG*

🎯 Output: Structured response in local dialect tailored to the farmer's inputs

---

### 💧 Irrigation Scheduler
- Schedules water use based on:
  - Crop type
  - Soil properties
  - Land size
  - Cultivation duration
  - Weather patterns
- Delivers a full irrigation plan:
  - When and how much to irrigate
  - Efficient use of available water

---

### 🦠 Crop Disease Diagnosis
- Farmers upload one or more photos of a diseased crop or field
- Gemini Vision instantly identifies:
  - Health status
  - Disease name
  - Symptoms
  - Affordable and local remedies
  - Prevention strategies

📚 Each diagnosis is stored in a *Digital Library* for tracking and feedback

---

### 📈 Real-Time Market Price Analysis
- Ask: “What is the price of tomatoes today in Pune?”
- Agent fetches data from *data.gov.in*
- Gemini processes the data to return:
  - Current prices
  - Trend analysis
  - Actionable insights
  - Market dynamics
  - Data source details

---

### 🏛 Government Scheme Navigator
- Farmers ask about needs like “drip irrigation subsidy”
- Gemini returns:
  - Relevant schemes
  - Eligibility
  - Benefits
  - Direct application links
- Built using *scraped government data + Gemini summarization*

---

### 🧑‍🌾 My Farm Agent
- Farmers upload info about current crop (voice or text)
- Ask questions anytime:
  - Fertilizer recommendations
  - Pest support
  - Schemes relevant to current crop
  - Post-harvest guidance

🔁 Personalized and ongoing support for each farmer’s field

---

### 🌦 Weather Card
- Real-time daily weather updates
- Rain prediction, humidity, wind, temperature
- Regional forecasts specific to the farm’s location

---

## 🗣 Voice-First Interaction

- Every field supports *speech-to-text input*
- Gemini understands dialects and variations in crop/local terms
- *Text-to-speech output* provided in native language

🗣 *Languages Supported*:
Hindi, Marathi, Tamil, Telugu, Kannada, Bengali, Gujarati, Punjabi, Odia, Assamese, Malayalam, Urdu, Bhojpuri

---

## 🛠 Tech Stack

| Component | Technology |
|----------|------------|
| Core AI Models | Gemini 1.5 Pro, Gemini Vision |
| Agent Orchestration | Vertex AI Genkit + Flash |
| Reasoning Dataset | Localized RAG on Medley DB |
| Speech Interface | Vertex AI STT / TTS |
| Deployment | Firebase Studio |
| Frontend | Next.js + Tailwind CSS |
| Backend Functions | Firebase Cloud Functions |
| Data Store | Firestore + Realtime Database |
| File Storage | Firebase + GCS (images, audio) |
| Market API | data.gov.in, public agriculture APIs |
| Notification System | Firebase Cloud Messaging (FCM) |

---

## 📚 Digital Library – Use Case & Innovation

The *Digital Library* is a per-farmer diagnosis and advisory storage system.

### 🌟 Why It Matters:
- Builds a *health history* per field and farmer
- Enables *precision agriculture* by learning from the past
- Supports *Human-in-the-loop* feedback and HITL retraining
- Facilitates:
  - Crop issue trend analysis
  - Region-wise disease heatmaps
  - Continuous learning for future AI finetuning

📈 This system not only improves individual farm outcomes but also contributes to agricultural R&D, government insights, and national food security analytics.

---

## Deployment Link :
You can view the live demo [here](https://studio--neervaani-web.us-central1.hosted.app/).

## 🧪 Installation Instructions

To run NeerVaani locally:

```bash
# Step 1: Clone the repository
git clone https://github.com/Sneha123-zudo/NeerVaani---Assistant-for-Farmers.git
cd neervaani

# Step 2: Install dependencies
npm install --legacy-peer-deps

# Step 3: Start development server
npm run dev
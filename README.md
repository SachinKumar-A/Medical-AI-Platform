note: [https://vercel.com/sksandysachin242-6675s-projects/medical-ai-platform](https://medical-ai-platform-rosy.vercel.app/)
the app live in this link 
this is for(Hack2skill google)

And the api key problem in deployment you can verify its working in video attacted 
email: sachinkumar31a@gmail.com
pass: hello@2025


🏥 Medical AI Platform — Prototype
An integrated AI-powered medical ecosystem built with Large Language Models (LLMs). This platform serves doctors, patients, students, and researchers through a unified intelligent interface powered by Google Gemini and Groq AI.

Status Python Flask AI

🎯 What This Platform Does
This prototype is a 4-sided Medical AI Ecosystem:

User Type	What They Get
🩺 Doctors	AI-assisted case analysis, symptom evaluation, patient report summaries
🧑‍🤝‍🧑 Patients	Health queries, medication info, appointment tracking
🎓 Students	Medical case studies, drug explainers, anatomy Q&A
🔬 Researchers	Drug repurposing insights, protocol generation, literature assistance
✨ Key Features
AI Medical Analysis — Describe symptoms or upload an X-ray description; the AI gives a structured differential diagnosis
Multi-Portal System — Separate dashboards for doctors, patients, students, and researchers
AI Chatbot Assistant — Context-aware conversational health assistant (Gemini-powered)
Drug Search & Explainer — Search any drug for mechanism, dosage, side effects, and interactions
Medical Report Generation — Auto-generate patient-ready summaries and structured reports
User Authentication — Secure login/register with session management (SQLite)
Dark Mode UI — Modern, hospital-grade responsive interface
🧠 AI Architecture
This prototype uses LLM-based inference (not a trained deep learning model):

User Input (Text / Query)
        ↓
  Flask Backend (prototype_app.py)
        ↓
  ┌─────────────┬──────────────┐
  │ Google Gemini│   Groq AI   │
  │  (primary)   │  (fallback) │
  └─────────────┴──────────────┘
        ↓
  Structured Medical Response
        ↓
  HTML/CSS/JS Frontend (Templates)
Primary LLM: Google Gemini (gemini-1.5-flash)
Secondary LLM: Groq (llama3-70b-8192)
No GPU required — fully cloud-based inference
🚀 Quick Start
Prerequisites
Python 3.10+
Google Gemini API Key (get one here)
Groq API Key (get one here)
Installation
# Clone the repository
git clone https://github.com/SachinKumar-A/Medical-AI-Platform.git
cd Medical-AI-Platform

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate      # Windows
# source .venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt
Configuration
Create a .env file in the root directory:

GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
FLASK_SECRET_KEY=your_secret_key_here
Run
python prototype_app.py
Open browser at: http://localhost:5000

📁 Project Structure
Medical-AI-Platform/
├── prototype_app.py          # Main Flask application (all routes + AI logic)
├── requirements.txt          # Python dependencies
├── prototype_users.db        # SQLite user database
├── templates/                # Jinja2 HTML templates
│   ├── index.html            # Landing page
│   ├── dashboard.html        # Main portal dashboard
│   ├── chat.html             # AI chatbot interface
│   ├── drug_search.html      # Drug information search
│   └── ...                   # Other portal pages
├── hackathon - ui/           # UI mockups and design assets
├── ADDITIONAL DETAILS/       # Project documentation and diagrams
└── vercel.json               # Vercel deployment configuration
🔧 Technology Stack
Layer	Technology
Backend	Flask (Python 3.10+)
Primary AI	Google Gemini API
Secondary AI	Groq API (LLaMA 3)
Database	SQLite (via Flask session)
Frontend	HTML5, CSS3, Vanilla JavaScript
Auth	Flask-Login + bcrypt
Deployment	Vercel (Python runtime)
⚠️ Disclaimer
This platform is for educational, research, and demonstration purposes only. All AI-generated medical information must be reviewed by a qualified healthcare professional before use in any clinical context.


🏆 Hackathon
Built for Google Build with AI — Solution Challenge 2026 (Hack2Skill India)



📧 Contact
For questions or collaborations, please open an issue on GitHub.

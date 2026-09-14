# Chitta Shanti

## AI-Based Personnel Stress & Welfare Monitoring System

Chitta Shanti is a multimodal AI-based personnel stress and welfare monitoring prototype developed for **Smart India Hackathon (SIH)**.

The system is designed to support personnel well-being by combining:

- Video-derived biometric indicators
- Voice features
- Lifestyle and questionnaire information
- Multimodal stress scoring
- Explainability/SHAP-style attribution
- Readiness classification
- Welfare triage for medical officers
- Welfare intervention logging

The project provides separate interfaces for three types of users:

- **Candidate / Personnel**
- **Commander**
- **Medical Officer**

---

# 1. What Does Chitta Shanti Do?

The core idea is to perform a personnel stress assessment using two sources of information.

## 1.1 Video and Voice Assessment

The candidate records a video through the frontend.

The backend processes the video and extracts features such as:

- Heart rate
- HRV/RMSSD
- Blink rate
- Brow ratio
- Head movement/jitter
- Voice pitch mean
- Voice pitch variation

The backend also performs video quality and liveness checks.

## 1.2 Lifestyle Questionnaire

After the video has been processed, the candidate completes a 16-question questionnaire covering areas such as:

- Age
- Gender
- Sleep duration
- Sleep quality
- Wake-up time
- Bedtime
- Physical activity
- Screen time
- Caffeine consumption
- Alcohol consumption
- Smoking
- Work hours
- Commute time
- Social activity
- Meditation
- Preferred exercise type

## 1.3 Multimodal Assessment

The extracted video/voice information and questionnaire responses are passed to the stress-scoring pipeline.

The system produces:

- Stress probability
- Stress classification
- Readiness status
- Feature attribution information

A high-risk result is classified as:

> **Critical Fatigue**

Otherwise, the current system classifies the candidate as:

> **Cleared**

The readiness status is correspondingly:

- **Mandatory Rest Required**
- **Fit for Duty**

---

# 2. Current Project Status

The current prototype contains a working end-to-end candidate assessment flow.

## Implemented

- User registration
- User login
- JWT-based authentication
- Role-based access control
- Candidate dashboard
- Candidate profile
- Commander dashboard
- Commander profile
- Medical Officer dashboard
- Medical Officer profile
- Video recording
- Video upload
- Video quality checking
- Liveness checking
- Video feature extraction
- Voice feature extraction
- 16-question questionnaire
- Multimodal stress scoring
- Assessment result display
- Candidate assessment history
- Commander personnel roster
- Medical welfare triage
- Welfare intervention logging
- Encrypted clinical assessment data
- Critical fatigue alert trigger

## Prototype Limitations

This is a prototype intended to demonstrate the system architecture and workflow.

It should **not** be treated as a clinically validated diagnostic system or as a production personnel-management system without further validation, security hardening, testing, and domain approval.

---

# 3. System Architecture

The project consists of two main applications.

```text
                   ┌──────────────────────┐
                   │      Frontend        │
                   │   React + Vite       │
                   │   Tailwind CSS       │
                   └──────────┬───────────┘
                              │
                              │ HTTP / REST API
                              ▼
                   ┌──────────────────────┐
                   │       Backend        │
                   │       FastAPI        │
                   │                      │
                   │ Authentication       │
                   │ Assessment Pipeline  │
                   │ Video Processing     │
                   │ Voice Processing     │
                   │ Stress Scoring       │
                   │ Welfare APIs         │
                   └──────────┬───────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │       MongoDB        │
                   │                      │
                   │ Users                │
                   │ Assessment Sessions  │
                   │ Welfare Interventions│
                   └──────────────────────┘
4. Technology Stack
Frontend
Technology	Purpose
React 19	User interface
Vite 8	Frontend development/build tool
React Router 7	Application routing
Tailwind CSS 4	Styling
Lucide / Lucide React	Icons
Backend
Technology	Purpose
FastAPI	REST API
Uvicorn	Backend server
PyMongo	MongoDB connection
Python-dotenv	Environment configuration
Passlib + bcrypt	Password hashing
python-jose	JWT authentication
Cryptography	Data encryption
OpenCV	Video processing
MediaPipe	Facial/landmark processing
NumPy	Numerical processing
Pandas	Data processing
SciPy	Scientific processing
Librosa	Audio processing
Joblib	Machine-learning model loading
SHAP	Explainability support
Google GenAI	Google AI integration
HTTPX	HTTP communication
Database

The backend uses:

MongoDB

The default local database name is:

stress_detector
5. Project Structure

The main project structure is:

Chitta-Shanti/
│
├── Backend/
│   ├── api/
│   │   ├── auth_api.py
│   │   └── assessment_api.py
│   │
│   ├── pipelines/
│   │   ├── pipeline_utils.py
│   │   └── video_processing.py
│   │
│   ├── models/
│   │   └── lifestyle_stress_model.joblib
│   │
│   ├── database.py
│   ├── main.py
│   ├── models_db.py
│   ├── security_utils.py
│   ├── notifications.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── router.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── ...
│
└── README.md
6. Requirements

Before running the project, install the following software.

Required
Python

Install Python 3.10 or newer.

Check whether Python is already installed:

python --version

or:

python3 --version
Node.js and npm

The frontend requires Node.js and npm.

Check:

node --version
npm --version

If these commands do not work, install Node.js before continuing.

MongoDB

Chitta Shanti uses MongoDB as its database.

A local MongoDB server can be used with the default configuration:

mongodb://localhost:27017

The default database name is:

stress_detector

The backend automatically creates/ensures its required indexes when it starts.

7. Downloading the Project

If you are not familiar with Git, you can download the project directly from GitHub.

Open the project repository on GitHub.
Click Code.
Select Download ZIP.
Extract the ZIP file.
Open the extracted Chitta-Shanti folder.

You should see:

Backend
frontend
README.md
8. Backend Setup

Open a terminal inside the project directory.

Move into the backend:

cd Backend
8.1 Create a Python Virtual Environment

Create a virtual environment:

python -m venv venv

A virtual environment keeps the project's Python packages separate from other Python projects on your computer.

Windows

Activate it with:

venv\Scripts\activate

After activation, your terminal will normally show something similar to:

(venv)
8.2 Install Backend Dependencies

Install all required Python packages:

pip install -r requirements.txt

The repository already contains the complete dependency list, so individual packages do not need to be installed manually.

9. Backend Environment Configuration

The backend uses a .env file.

Create:

Backend/.env

The important encryption variable is:

FIELD_ENCRYPTION_KEY=your-generated-key

MongoDB can use the built-in defaults, but they can also be explicitly specified:

MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=stress_detector
FIELD_ENCRYPTION_KEY=your-generated-key
Generate the Encryption Key

From the Backend directory, run:

python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

The command will output a key similar to:

some-long-generated-fernet-key

Copy that value into:

FIELD_ENCRYPTION_KEY=some-long-generated-fernet-key
Important

Keep this key safe.

Do not commit your real .env file or encryption key to GitHub.

Changing the encryption key after encrypted clinical records have been created can make those records unreadable.

10. Start MongoDB

Make sure MongoDB is running before starting the backend.

For a standard local MongoDB installation, the backend expects:

mongodb://localhost:27017

If you are using a different MongoDB server, change MONGO_URI in Backend/.env.

11. Start the Backend

Make sure you are inside:

Chitta-Shanti/Backend

and that the virtual environment is activated.

Run:

python -m uvicorn main:app --reload

The backend should become available at:

http://localhost:8000

You can also open the FastAPI interactive documentation at:

http://localhost:8000/docs

The root endpoint:

http://localhost:8000/

returns a simple online status.

12. Frontend Setup

Open a new terminal window.

Move into the frontend:

cd frontend

Install the frontend dependencies:

npm install

The required versions and packages are defined in:

frontend/package.json
13. Frontend Environment Configuration

A frontend .env file is optional.

By default, the frontend connects to:

http://localhost:8000

If your backend is running somewhere else, create:

frontend/.env

and specify:

VITE_API_BASE_URL=http://localhost:8000

For example, if the backend is running on another machine:

VITE_API_BASE_URL=http://192.168.x.x:8000

Use the actual address of the machine running the backend.

14. Start the Frontend

From the frontend directory:

npm run dev

Vite will display the local development address in the terminal.

Open that address in your browser.

The frontend communicates with the FastAPI backend using the configured VITE_API_BASE_URL.

15. Running the Complete System

You normally need three things running:

Terminal 1
MongoDB
Terminal 2
Backend

python -m uvicorn main:app --reload
Terminal 3
Frontend

npm run dev

The overall connection is:

Browser
   │
   ▼
React Frontend
   │
   │ HTTP requests
   ▼
FastAPI Backend
   │
   ├── Video / Voice Processing
   ├── Stress Scoring
   ├── Authentication
   └── Welfare APIs
   │
   ▼
MongoDB
16. Authentication

Chitta Shanti uses JWT-based authentication.

There are three supported roles:

candidate
commander
medical_officer

Users register with:

Username
Full name
Password
Role
Unit ID

After login, the backend returns an access token.

The frontend stores the authentication information locally and uses the token when communicating with protected APIs.

17. Candidate Assessment Flow

The current assessment process is a two-stage workflow.

Stage 1 — Video Assessment

The candidate records a video.

The frontend sends the recorded video to:

POST /api/assessment/upload-video

The backend:

Receives the video.
Temporarily saves it for processing.
Runs video processing.
Checks video quality.
Performs a liveness check when available.
Extracts biometric/video features.
Extracts voice features.
Deletes the temporary raw video.
Creates an assessment session.
Returns a session_id.

Example response:

{
  "status": "success",
  "session_id": "SESSION_ID",
  "message": "Video processed successfully. Proceed to questionnaire."
}
Stage 2 — Questionnaire

The candidate completes the 16-question questionnaire.

The frontend sends the responses together with the previously generated session_id to:

POST /api/assessment/submit-questionnaire

The backend combines:

Video features
+
Voice features
+
Questionnaire responses

and passes them to the multimodal stress-scoring pipeline.

18. The 16 Questionnaire Fields

The current questionnaire contains:

Age
Gender
Hours of sleep per night
Sleep quality
Wake-up time
Bedtime
Daily physical activity
Daily screen time
Caffeinated drinks per day
Alcoholic drinks per day
Smoking
Average work hours per day
Daily commute time
Social activity hours per day
Regular meditation
Preferred exercise type

The backend receives these using the following field names:

age
gender
sleep_hours_per_night
sleep_quality
wake_up_time
bed_time
physical_activity_hours_daily
daily_screen_time_hours
caffeinated_drinks_per_day
alcoholic_drinks_per_day
smokes
avg_work_hours_per_day
daily_commute_hours
social_activity_hours_per_day
meditates_regularly
preferred_exercise_type
19. Assessment Result

After the questionnaire is submitted, the backend returns information including:

{
  "session_id": "...",
  "personnel_id": "...",
  "readiness_status": "...",
  "classification": "...",
  "stress_probability": 0,
  "shap_attribution": [],
  "timestamp": "..."
}

The candidate can therefore receive:

Cleared
Classification:
Cleared

Readiness:
Fit for Duty

or:

Critical Fatigue
Classification:
Critical Fatigue

Readiness:
Mandatory Rest Required

The exact result depends on the assessment score produced by the current scoring pipeline.

20. Video Data Handling

The current backend does not permanently store the raw assessment video.

The processing flow is:

Recorded Video
      │
      ▼
Temporary File
      │
      ▼
Video Processing
      │
      ├── Biometric Features
      └── Voice Features
      │
      ▼
Assessment Session
      │
      ▼
Temporary Video Deleted

The extracted assessment information is stored as part of the assessment session.

Clinical assessment information is encrypted before being stored.

21. Candidate Assessment History

Candidates can retrieve their completed assessments using:

GET /api/assessment/my-history

The endpoint returns information such as:

Total assessments
Number of critical assessments
Previous classifications
Stress probabilities
Heart-rate information
Attribution information
Assessment timestamps
22. Commander Dashboard

Commanders can access:

GET /api/assessment/commander/roster

The endpoint provides an anonymized personnel roster.

The response includes:

Anonymized candidate ID
Readiness tag
Total evaluated personnel

Readiness is represented as either:

Fit for Duty

or:

Mandatory Rest Required

The endpoint is available to both:

commander
medical_officer

roles.

23. Medical Officer Dashboard

Medical officers can access welfare triage information through:

GET /api/assessment/welfare/triage

The endpoint focuses on completed assessments classified as:

Critical Fatigue

The response can contain:

Session ID
Personnel ID
Risk tier
Primary attribution driver
Full attribution information
Duty-hours information
Rest information
Recent workload trend
Suggested welfare action

The current suggested action is:

Clinical rest order & psychological check-in.
24. Welfare Interventions

Medical officers can record welfare interventions using:

POST /api/assessment/welfare/interventions

The intervention contains:

Personnel ID
Session ID
Action type
Status
Optional notes
Optional scheduled time

The intervention is stored in the:

welfare_interventions

MongoDB collection.

25. API Overview
Authentication
Register
POST /api/auth/register
Login
POST /api/auth/login
Current User
GET /api/auth/me
Assessment
Upload Video
POST /api/assessment/upload-video
Submit Questionnaire
POST /api/assessment/submit-questionnaire
Candidate History
GET /api/assessment/my-history
Commander / Medical Officer
Personnel Roster
GET /api/assessment/commander/roster
Medical Officer
Welfare Triage
GET /api/assessment/welfare/triage
Welfare Intervention
POST /api/assessment/welfare/interventions
26. Interactive API Documentation

Once the backend is running, FastAPI automatically provides interactive documentation.

Open:

http://localhost:8000/docs

From there, you can inspect the available endpoints and test API requests.

This is particularly useful for developers who want to understand how the frontend communicates with the backend.

27. Frontend Commands

From:

frontend/
Start Development Server
npm run dev
Build Production Frontend
npm run build
Run ESLint
npm run lint
Preview the Production Build
npm run preview
28. Backend Dependencies

All backend Python dependencies are listed in:

Backend/requirements.txt

Install them with:

pip install -r requirements.txt

The current project uses packages for:

Web API development
Authentication
Database connectivity
Encryption
Video processing
Facial landmark processing
Audio processing
Numerical analysis
Machine learning
Explainability
HTTP communication
29. Security and Privacy

The prototype includes several security-related mechanisms.

Password Hashing

Passwords are not intended to be stored as plain text.

The authentication system uses password hashing.

JWT Authentication

Protected API endpoints require authentication tokens.

Role-Based Access Control

Different endpoints are restricted to appropriate roles.

For example:

Candidate
   → Own assessment/history

Commander
   → Personnel roster

Medical Officer
   → Welfare triage
   → Welfare interventions
Encrypted Clinical Data

Sensitive assessment information is encrypted before being stored using the configured:

FIELD_ENCRYPTION_KEY
Raw Video

The current assessment endpoint processes the uploaded video temporarily and removes the temporary raw video after processing.

30. Important Security Note

This repository is a prototype.

Before deploying it in a real operational environment, additional work would be required, including:

Strong production authentication configuration
Secure secret management
Restricted CORS configuration
HTTPS/TLS
Production database security
Audit logging
Access monitoring
Data retention policies
Privacy and consent mechanisms
Security testing
Model validation
Domain/clinical validation

Do not use the development configuration as-is for production deployment.

31. Troubleshooting
Backend Does Not Start

Check that you are inside:

Backend/

and that the virtual environment is active.

Then run:

python -m uvicorn main:app --reload
ModuleNotFoundError

Install the backend dependencies:

pip install -r requirements.txt
MongoDB Connection Problems

Make sure MongoDB is running.

The default connection is:

mongodb://localhost:27017

If you use another MongoDB server, verify:

MONGO_URI=...
MONGO_DB_NAME=...
Encryption Key Error

If you see an error indicating that:

FIELD_ENCRYPTION_KEY is not set

create/configure:

Backend/.env

and add:

FIELD_ENCRYPTION_KEY=your-generated-key

Generate a key with:

python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
Frontend Cannot Communicate With Backend

Check that the backend is running:

http://localhost:8000

Then check the frontend API configuration.

By default, the frontend uses:

http://localhost:8000

If the backend is running elsewhere, configure:

VITE_API_BASE_URL=http://YOUR_BACKEND_ADDRESS:8000
Assessment Video Upload Fails

Check:

Camera permissions
Browser permissions
Backend status
Video quality
Lighting conditions
Face positioning
Whether the backend can process the recorded video

The backend can reject a video if the quality is insufficient.

Liveness Check Fails

The assessment video includes a liveness check when the processing pipeline returns liveness information.

A failed liveness check may occur when the system detects a static or recorded video.

Try recording again with:

Good lighting
Your face clearly visible
Your face centered in the frame
Natural movement
32. Development Workflow

When modifying the project, the recommended development structure is:

Frontend changes
       │
       ▼
frontend/src/

Backend API changes
       │
       ▼
Backend/api/

Processing/model changes
       │
       ▼
Backend/pipelines/

Database changes
       │
       ▼
Backend/models_db.py
Backend/database.py

After making changes, test the complete flow:

Login
  ↓
Candidate assessment
  ↓
Video upload
  ↓
Questionnaire
  ↓
Assessment result
  ↓
History

Then test the role-specific dashboards.

33. Complete First-Time Setup Checklist

For someone setting up the project for the first time:

Install
 Python
 Node.js and npm
 MongoDB
Backend
 Open Backend
 Create Python virtual environment
 Activate virtual environment
 Run pip install -r requirements.txt
 Create Backend/.env
 Generate FIELD_ENCRYPTION_KEY
 Start MongoDB
 Start FastAPI
Frontend
 Open a new terminal
 Open frontend
 Run npm install
 Start Vite with npm run dev
Test
 Open the frontend
 Register/login
 Complete a candidate assessment
 Verify the assessment result
 Check assessment history
 Test commander/medical officer roles if required
34. Quick Start

For experienced developers, the essential commands are:

Backend
cd Backend

python -m venv venv

# Windows
venv\Scripts\activate

pip install -r requirements.txt

Create Backend/.env:

FIELD_ENCRYPTION_KEY=your-generated-key
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=stress_detector

Then:

python -m uvicorn main:app --reload

Backend:

http://localhost:8000

API documentation:

http://localhost:8000/docs
Frontend

In a second terminal:

cd frontend
npm install
npm run dev
35. Project Goal

Chitta Shanti aims to demonstrate how multimodal AI can be used as a supporting tool for personnel welfare and stress monitoring.

The prototype brings together:

Video
  +
Voice
  +
Lifestyle Information
  +
Machine Learning
  +
Explainability
  +
Role-Based Welfare Workflows

to create a unified personnel stress and welfare monitoring workflow.

Disclaimer

Chitta Shanti is a prototype developed for demonstration and hackathon purposes.

The generated stress classifications and readiness recommendations should not be interpreted as medical diagnoses or as a replacement for qualified medical or psychological assessment.

Any real-world deployment would require appropriate validation, clinical oversight, security review, privacy safeguards, and authorization from the relevant organization.

License

Add the project's applicable license here if one is adopted.
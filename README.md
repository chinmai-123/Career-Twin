# AI Career Twin: An AI-Powered Placement Readiness and Career Guidance Platform (CareerTwin)

> **B.Tech Computer Science & Engineering Academic Project**  
> **Web Application Only** | Architecture: React.js (Vite) + Java 21 Spring Boot + MySQL + Google Gemini AI

---

## 1. Project Overview

**CareerTwin** is an AI-powered placement readiness and career guidance platform designed specifically for college engineering students. The core innovation of the platform is the **"Career Twin"** concept.

Instead of treating resume analysis, competitive programming profiles, skill assessments, roadmap generation, and career guidance as disconnected silos, **CareerTwin creates and continuously updates a persistent digital twin of the student's career profile**. 

The system compares the student's current capabilities with the dynamic industry requirements of their target career role (e.g., *Backend Developer*, *Software Development Engineer*, *AI/ML Engineer*, *Full Stack Developer*, etc.) and synthesizes them into an objective **Placement Readiness Score (0–100%)**, actionable **Skill Gaps**, a **Personalized Multi-Phase Roadmap**, and **Recruiter-Style AI Feedback**.

---

## 2. Key Highlights for College Viva & Project Review

1. **Pure Web Application**: Built strictly for modern desktop web browsers (React 18 + Vite + Responsive CSS3). No mobile framework, no Android dependencies, and no emulator required.
2. **Deterministic & Explainable Scoring Model**: The core Placement Readiness Engine uses an objective, verifiable mathematical formula rather than relying blindly on black-box LLM hallucinations.
3. **Resilient AI Hybrid Architecture**: Integrates Google Gemini API for natural-language feedback, mock interview generation, and resume bullet rewriting. If an external API key is absent or offline, an intelligent deterministic offline fallback automatically activates so live college demonstrations **never fail**.
4. **Production-Grade Backend**: Built with Java 21, Spring Boot 3.3.4, Spring Security, stateless JWT authentication, BCrypt password hashing, JPA/Hibernate ORM, and Apache PDFBox for server-side resume parsing.
5. **Relational MySQL Database**: 16 normalized relational database tables tracking versioned resumes, coding platform stats, skills, assessments, roadmaps, and progress logs.
6. **Pre-Seeded Viva Demo Mode**: Includes pre-seeded demo credentials (`student@careertwin.edu` / `password123`) and 1-click login buttons for immediate demonstration.

---

## 3. System Architecture

```
                          STUDENT (Web Browser)
                                    │
                                    ▼
                     REACT.JS WEB FRONTEND (Vite)
            - React Router DOM       - Responsive Modern UI
            - Recharts Analytics     - Axios JWT Interceptor
                                    │
                         REST API (HTTP / JSON)
                                    │
                                    ▼
                     SPRING BOOT BACKEND (Port 8085)
            - Spring Security + JWT  - Apache PDFBox Extractor
            - Business Services      - Placement Engine Math
                                    │
                 ┌──────────────────┴──────────────────┐
                 ▼                                     ▼
          MYSQL DATABASE                        GOOGLE GEMINI AI
       - 16 Relational Tables                 - Recruiter Persona
       - Resume Versions (V1..Vn)             - Resume Rewriting
       - Verified Assessments                 - Smart Offline Fallback
```

---

## 4. Placement Readiness Mathematical Formula

The Career Twin Engine calculates placement readiness objectively across five weighted pillars:

$$\text{Readiness Score} = (0.25 \times \text{ATS Score}) + (0.25 \times \text{Skill Completeness}) + (0.20 \times \text{Coding Profile Score}) + (0.15 \times \text{Verified Assessment}) + (0.15 \times \text{Project Portfolio})$$

| Component | Weight | Measured Criteria |
| :--- | :---: | :--- |
| **Resume & ATS Score** | **25%** | PDF keyword density, action-verb usage, section completeness, formatting, role alignment. |
| **Technical Skill Match** | **25%** | Percentage of required target role skills mastered at Intermediate/Advanced proficiency. |
| **Coding & Problem Solving** | **20%** | Combined DSA activity across GitHub, LeetCode, CodeChef, HackerRank, GeeksforGeeks. |
| **Verified Skill Assessment** | **15%** | Objective score from randomized, timed technical multiple-choice assessments. |
| **Project Portfolio** | **15%** | Completed industry-grade portfolio projects demonstrating practical full-stack/system design capability. |

---

## 5. System Modules

### Module 1: User Management & Authentication
- User registration with validation (College, Branch, Year of Study, Graduation Year).
- Stateless JWT authentication with BCrypt password hashing (strength 10).
- Protected API routes and automatic token persistence in `localStorage`.
- Profile editing and password updating.

### Module 2: Career Goal Management
- Dynamic career goal selection (predefined presets or any custom text goal e.g., *"Backend Engineer at Microsoft"*).
- Intelligent target role skill taxonomy extractor (maps goals to core language, framework, database, and CS fundamentals).

### Module 3: Resume Management & Server-Side PDF Parsing
- Strict PDF upload validation (type check and max file size).
- Server-side text and section extraction using **Apache PDFBox 2.0.31**.
- **Immutable Resume Versioning** ($V_1, V_2, \dots, V_n$): Prior uploads are preserved with timestamps, download links, and version audit logs.

### Module 4: ATS Resume Analyzer
- Scores resumes across 5 key dimensions: Keyword Match, Skills Score, Formatting Completeness, Section Completeness, and Project Relevance.
- Detects missing industry keywords and weak action verbs.
- Provides recruiter-grade bullet rewrite suggestions (e.g., converting *"Made a website using Java"* to *"Engineered a scalable RESTful web application using Java, Spring Boot, and MySQL with JWT security"*).

### Module 5: Coding Profile Analyzer
- Supports 5 major developer platforms: **GitHub, LeetCode, CodeChef, HackerRank, and GeeksforGeeks**.
- Calculates DSA strength, consistency, repository volume, and total solved problems.
- Supports both live platform queries and an academic demo simulation mode to ensure smooth presentations regardless of external API rate limits.

### Module 6: Skill Verification Assessments
- Randomized, role-specific technical assessments with a **15-minute countdown timer**.
- Anti-cheating safeguards (tab switch warnings, copy-paste prevention considerations, time enforcement).
- Category-wise performance scoring (OOP, SQL, Frameworks, DSA) with instant review explanations.

### Module 7: Career Twin Engine (Core Module)
- Continuously synthesizes data from all other modules into a single unified Career Twin state.
- Computes the consolidated Readiness Score (0–100%), readiness band (*Needs Foundation*, *Developing*, *Placement Ready*, *Top Tier*), top strengths, and critical weaknesses.
- Enables manual recalculation on demand or automatic updates upon completing assessments or uploading resumes.

### Module 8: Skill Gap Analysis & Priority Matrix
- Categorizes skill deficiencies into **High Priority** (missing core role prerequisites), **Medium Priority**, and **Low Priority / Nice-to-Have**.
- Generates tailored remedy suggestions, estimated time-to-learn, and direct learning resources.

### Module 9: Personalized Roadmap
- Phased curriculum generation (Phase 1: Foundations, Phase 2: Core Engineering, Phase 3: Advanced & System Design, Phase 4: Mock Interviews & Placement Prep).
- Interactive milestone checkboxes allowing students to track real-time phase completion.

### Module 10: Recommended Projects
- Curated project suggestions matched to the student's target role and identified skill gaps.
- Includes recommended tech stacks, difficulty levels, key features to implement, and resume bullet formulation.

### Module 11: Weekly Challenges & Gamification
- Dynamic weekly technical goals (e.g., *"Solve 5 Tree DSA Questions"*, *"Build a Spring Security Filter"*, *"Refactor 2 Resume Bullets"*).
- Gamified experience points (XP) to maintain daily student engagement.

### Module 12: AI Career Guidance & Recruiter Persona
- Integrates Google Gemini AI to act as a senior technical recruiter.
- Generates:
  1. Detailed placement critique and readiness verdict.
  2. Targeted mock interview questions tailored to the student's specific gaps.
  3. Interactive Q&A chat for personalized career strategy.
- Automated fallback ensures uninterrupted demonstration even when offline or unconfigured.

### Module 13: Placement Evaluation Report
- Comprehensive, printable placement readiness summary report with student demographics, scores breakdown, and faculty advisor / placement cell signature fields.

---

## 6. Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, React Router v6, Axios, Recharts, Lucide React, Modern CSS3 |
| **Backend** | Java 21, Spring Boot 3.3.4, Spring Web, Spring Data JPA, Spring Security, JJWT 0.12.6, Apache PDFBox 2.0.31 |
| **Database** | MySQL 8.0 (16 Normalized Tables, InnoDB Engine) |
| **Build & Tooling** | Maven 3.9+, Node.js 18+, Vite, Git |
| **AI Integration** | Google Gemini API (with deterministic offline fallback) |

---

## 7. Database Design (Entity-Relationship Model)

The database schema (`careertwin`) consists of 16 interconnected JPA tables:

1. `users`: Student profile, credentials, college, branch, year, graduation year.
2. `career_goals`: Target role, custom career aspiration, target company, required skills JSON.
3. `resumes`: Versioned resume files ($V_1, V_2\dots$), file path, parsed plain text, active flag.
4. `ats_analyses`: Detailed ATS scoring dimensions, missing keywords, bullet recommendations.
5. `coding_profiles`: GitHub, LeetCode, CodeChef, HackerRank, GeeksforGeeks handles and metrics.
6. `skills`: Master skill taxonomy (Java, Spring Boot, MySQL, React, DSA, System Design, etc.).
7. `user_skills`: Student proficiency levels (Beginner, Intermediate, Advanced) and verified status.
8. `assessment_questions`: Master bank of technical MCQs with category, role, options, and explanations.
9. `assessment_results`: Student assessment history, raw score, percentage, and time taken.
10. `career_twin_profiles`: Consolidated Twin metrics, readiness score, strengths, and weaknesses.
11. `skill_gaps`: Identified missing competencies with priority (HIGH, MEDIUM, LOW) and remedies.
12. `roadmap_phases`: Curriculum phases, topics, milestones, and boolean completion states.
13. `project_recommendations`: Role-tailored portfolio ideas, architectures, and completion flags.
14. `weekly_challenges`: Time-bound technical placement tasks with XP rewards.
15. `progress_logs`: Longitudinal snapshot logs tracking score changes over time.
16. `notifications`: In-app system alerts for assessment reminders and milestone updates.

---

## 8. Prerequisites & Installation

### Prerequisites
- **Operating System**: Windows 10/11, macOS, or Linux
- **Java Development Kit (JDK)**: Java 21 or higher (Verified with OpenJDK 21)
- **Node.js**: v18.0.0 or higher (with `npm`)
- **MySQL Server**: v8.0 or higher running on port `3306`

---

## 9. Quick Start Guide (Windows)

### Step 1: Database Setup
Ensure MySQL is running on port `3306`. Create the database:
```sql
CREATE DATABASE IF NOT EXISTS careertwin;
```
*(The Spring Boot application is configured with `root` / `root` in `backend/src/main/resources/application.properties`. Update credentials there if your local MySQL password differs).*

### Step 2: One-Click Launch (Recommended)
Double-click `start-all.bat` located in the root project folder:
```
CareerTwin/
├── start-all.bat         <-- Double click to start Backend & Frontend together
├── start-backend.bat     <-- Starts Spring Boot on port 8085
├── start-frontend.bat    <-- Starts Vite dev server on port 5173
```

### Manual Terminal Commands (Alternative)

**Backend:**
```powershell
cd CareerTwin\backend
mvn spring-boot:run
```
*(Backend runs at: `http://localhost:8085`)*

**Frontend:**
```powershell
cd CareerTwin\frontend
npm install
npm run dev
```
*(Frontend runs at: `http://localhost:5173`)*

---

## 10. Demo Credentials & Testing Walkthrough

Use these pre-seeded demo credentials to sign in instantly:

- **Email**: `student@careertwin.edu`
- **Password**: `password123`
- *(Alternatively, use the **"Fill Demo Account"** button on the Login page).*

### Recommended 10-Minute Viva Demonstration Flow:

1. **Login & Overview**: Sign in as the demo student. Explain the unified Dashboard displaying the **Placement Readiness Gauge**, score breakdown radar/bar charts, and current career goal.
2. **Career Twin Engine**: Navigate to **"Career Twin"**. Show how the engine synthesizes all dimensions (ATS, Skills, Coding, Verification, Projects) into an explainable score. Click **"Recalculate Career Twin"** to demonstrate real-time pipeline computation.
3. **Career Goal**: Navigate to **"Career Goal"**. Enter a custom goal such as *"Software Development Engineer"* or select a preset. Show how required skills are dynamically extracted.
4. **Resume Management & ATS**:
   - Go to **"Upload Resume"** and upload any PDF resume.
   - Go to **"Resume History"** to show immutable versioning ($V_1, V_2, V_3$).
   - Go to **"ATS Analysis"** to show the 5-dimension scores, matched vs missing keywords, and recruiter-style bullet rewrites.
5. **Coding Profiles**: Navigate to **"Coding Profiles"**. View the simulated LeetCode, GitHub, and CodeChef analytics demonstrating DSA problem-solving depth.
6. **Skill Verification Assessment**: Navigate to **"Skill Verification"**. Start the 15-minute randomized MCQ test. Answer the questions, submit, and review the instant score breakdown and explanations.
7. **Skill Gaps & Personalized Roadmap**: Show the prioritized **Skill Gaps** and how they feed directly into the **Personalized Roadmap**. Check off milestones to show interactive progress.
8. **AI Guidance**: Navigate to **"AI Guidance"**. View the AI Recruiter placement feedback, review mock interview questions, and ask a custom placement question.
9. **Reports**: Navigate to **"Reports"**. Display the clean, formal placement report ready for printing and academic evaluation.

---

## 11. Core REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new student profile |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token |
| `GET` | `/api/auth/demo-credentials` | Fetch demo student credentials |
| `GET` | `/api/career-twin` | Retrieve the student's unified Career Twin state |
| `POST` | `/api/career-twin/recalculate` | Force recalculation of all placement scores |
| `GET` | `/api/career-goal` | Retrieve current career goal and target skills |
| `POST` | `/api/career-goal` | Save or update custom career aspiration |
| `POST` | `/api/resume/upload` | Upload resume PDF (server-side PDFBox extraction) |
| `GET` | `/api/resume/history` | List all historical versions ($V_1, V_2\dots$) |
| `GET` | `/api/ats/latest` | Retrieve latest ATS scores and bullet rewrites |
| `GET` | `/api/coding-profile` | Fetch aggregate coding metrics across platforms |
| `GET` | `/api/assessment/questions` | Fetch randomized technical assessment questions |
| `POST` | `/api/assessment/submit` | Submit answers and receive evaluated scores |
| `GET` | `/api/skill-gaps` | Retrieve prioritized skill gap list |
| `GET` | `/api/roadmap` | Retrieve multi-phase personalized curriculum |
| `PUT` | `/api/roadmap/milestone/{id}/toggle`| Toggle roadmap milestone completion state |
| `GET` | `/api/projects` | Retrieve role-specific recommended projects |
| `GET` | `/api/challenges` | Retrieve weekly gamified placement challenges |
| `POST` | `/api/ai/guidance` | Generate AI recruiter evaluation and interview questions |
| `GET` | `/api/reports/placement-summary` | Generate printable placement evaluation report |

---

## 12. College Viva & Technical Defense Q&A

### Q1: What makes CareerTwin different from existing tools like Resume Worded or LeetCode?
**Answer**: Existing tools operate in isolated silos. An ATS scanner only looks at text keywords without knowing if the student can actually code. A coding platform records solved problems without checking if the student has built complete projects or can pass an interview. **CareerTwin introduces the digital twin paradigm**: all signals (ATS, verified assessments, coding consistency, project depth, and role requirements) continuously feed a single, unified mathematical model that calculates true placement readiness.

### Q2: Why did you use an objective mathematical formula instead of having an LLM calculate the readiness score?
**Answer**: LLM generation for numerical evaluation lacks mathematical consistency, introduces hallucination, and cannot be audited. By using an explainable, deterministic weighted formula (25% Resume, 25% Skills, 20% Coding, 15% Assessment, 15% Projects), our scoring is transparent, reproducible, and verifiable. We use Google Gemini AI specifically where LLMs excel: qualitative semantic evaluation, natural-language resume bullet rewriting, and adaptive mock interview questions.

### Q3: How is resume versioning implemented?
**Answer**: The system does not overwrite prior uploads. Each upload creates an immutable `Resume` entity with an incrementing version number ($V_1, V_2\dots$), storage timestamp, and parsed text cached in MySQL. This allows students and placement officers to track how ATS scores improve over time as the student refines their resume.

### Q4: How does the application handle external API downtime or missing Gemini API keys during an evaluation?
**Answer**: The Spring Boot backend includes an intelligent fallback architecture in `GeminiService.java` and `CodingProfileService.java`. If the Gemini API key is not configured or an external platform is unreachable, the system activates a deterministic fallback engine that synthesizes high-quality, role-specific recruiter feedback and metrics locally. This guarantees that viva presentations will never crash due to network drops or quota limits.

---

## 13. License & Academic Attribution
Developed as an academic B.Tech Computer Science & Engineering Final/Mini Project. Designed for university project viva evaluations, campus placement readiness tracking, and educational research.
#   C a r e e r - T w i n  
 
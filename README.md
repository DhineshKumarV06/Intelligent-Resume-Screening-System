# Intelligent Resume Screening System

## Overview

AI Resume Analyzer is a career assistance platform that evaluates resumes using Large Language Models (LLMs), calculates ATS compatibility, extracts skills, suggests improvements, generates interview questions, and recommends suitable job roles.

The system helps candidates optimize resumes and prepare for interviews more effectively.

## Features

* Resume upload and parsing
* ATS score analysis
* Technical skill extraction
* Missing skill identification
* Resume improvement suggestions
* Interview question generation
* Role recommendations
* Career guidance insights
* PDF resume processing

## Tech Stack

### Backend

* Python
* FastAPI
* SQLite / PostgreSQL

### AI Integration

* OpenAI API
* Gemini API
* Claude API

### Frontend

* React.js
* Vite

### File Processing

* PyPDF2
* python-docx

## Workflow

Resume Upload
→ Resume Parsing
→ Skill Extraction
→ ATS Analysis
→ AI Evaluation
→ Interview Question Generation
→ Role Recommendations
→ Personalized Feedback

## Installation

### Backend

```bash
pip install -r requirements.txt

uvicorn main:app --reload
```

### Frontend

```bash
npm install

npm run dev
```

## Environment Variables

```env
OPENAI_API_KEY=
GEMINI_API_KEY=
ANTHROPIC_API_KEY=
DATABASE_URL=
```

## Core Functionalities

### ATS Score Analysis

* Resume structure evaluation
* Keyword matching
* Skill relevance scoring

### Interview Assistant

* Technical questions
* Behavioral questions
* Role-specific preparation

### Career Recommendations

* Suitable job roles
* Skill gap analysis
* Learning suggestions

## Future Enhancements

* Job description matching
* Resume optimization automation
* LinkedIn profile analysis
* Mock interview simulator
* AI career coach chatbot

## Author

Developed as an AI-Powered Career Intelligence and Interview Preparation Platform.

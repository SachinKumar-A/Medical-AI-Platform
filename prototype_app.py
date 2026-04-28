import json
import os
import re
import sqlite3
from datetime import datetime
from typing import Dict, List
from urllib.parse import quote

import requests
from flask import Flask, jsonify, redirect, render_template, request, session, url_for
from werkzeug.security import check_password_hash, generate_password_hash

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "prototype-secret-key-change-me")

DB_PATH = os.path.join(os.path.dirname(__file__), "prototype_users.db")
VALID_ROLES = {"doctor", "public", "student"}

# â”€â”€ API KEY CONFIGURATION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
GEMINI_API_KEY = ""
GROQ_API_KEY = ""

# In-memory stores for prototype demo only.
DOCTOR_REQUESTS: List[Dict] = []
DOCTOR_SUGGESTIONS: List[Dict] = []
PATIENT_REPORTS: Dict[str, Dict] = {}
STUDENT_TASKS: List[Dict] = []
PUBLIC_ACCESS_REQUESTS: List[Dict] = []
PUBLIC_HEALTH_PROFILES: Dict[str, Dict] = {}
DOCTOR_ACCESS_GRANTS: Dict[str, Dict] = {}
ONLINE_CHAT_THREADS: Dict[str, List[Dict]] = {}

MOCK_DOCTORS: List[Dict] = [
    {
        "id": "DOC001",
        "name": "Dr. Asha Menon",
        "specialty": "General Medicine",
        "category": "General",
        "rating": 4.8,
        "joinedAt": "2022-01-10",
        "scope": "national",
        "interactionModes": ["treatment", "online", "video"],
        "country": "India",
    },
    {
        "id": "DOC002",
        "name": "Dr. Rahul Iyer",
        "specialty": "Cardiology",
        "category": "Cardiology",
        "rating": 4.9,
        "joinedAt": "2024-08-18",
        "scope": "international",
        "interactionModes": ["treatment", "online", "video"],
        "country": "United Kingdom",
    },
    {
        "id": "DOC003",
        "name": "Dr. Neha Kapoor",
        "specialty": "Endocrinology",
        "category": "Endocrinology",
        "rating": 4.7,
        "joinedAt": "2025-02-03",
        "scope": "national",
        "interactionModes": ["treatment", "online"],
        "country": "India",
    },
    {
        "id": "DOC004",
        "name": "Dr. Kunal Arora",
        "specialty": "Pulmonology",
        "category": "Pulmonology",
        "rating": 4.6,
        "joinedAt": "2025-11-20",
        "scope": "international",
        "interactionModes": ["treatment", "online", "video"],
        "country": "Singapore",
    },
]

MOCK_HOSPITALS: List[Dict] = [
    {
        "hospitalId": "HOSP1001",
        "hospitalName": "Central Medical Hospital",
        "city": "Bengaluru",
    },
    {
        "hospitalId": "HOSP1002",
        "hospitalName": "Metro Heart and Wellness Institute",
        "city": "Chennai",
    },
    {
        "hospitalId": "HOSP003",
        "hospitalName": "SRM",
        "city": "Chennai",
    },
]

CUSTOM_HOSPITALS: List[Dict] = []

MOCK_HOSPITAL_PATIENT_REPORTS: Dict[str, Dict] = {
    "PID1001": {
        "hospitalId": "HOSP1001",
        "hospitalName": "Central Medical Hospital",
        "patientName": "Anita Verma",
        "age": 46,
        "diagnosis": "Type 2 Diabetes Mellitus",
        "medicalTests": {
            "HbA1c": "7.8%",
            "Fasting Glucose": "132 mg/dL",
            "Lipid Profile": "LDL 112 mg/dL",
        },
        "treatmentDone": [
            "Metformin 500mg BD",
            "Diet counseling and weekly activity plan",
            "Follow-up every 6 weeks",
        ],
    },
    "PID1002": {
        "hospitalId": "HOSP1001",
        "hospitalName": "Central Medical Hospital",
        "patientName": "Rohit Sen",
        "age": 59,
        "diagnosis": "Post-PCI STEMI recovery",
        "medicalTests": {
            "Troponin": "Down-trending",
            "2D Echo": "LVEF 48%",
            "ECG": "Improving ST changes",
        },
        "treatmentDone": [
            "Primary PCI completed",
            "Dual antiplatelet therapy",
            "Cardiac rehab protocol started",
        ],
    },
    "PID2001": {
        "hospitalId": "HOSP1002",
        "hospitalName": "Metro Heart and Wellness Institute",
        "patientName": "Farah Khan",
        "age": 38,
        "diagnosis": "Community Acquired Pneumonia",
        "medicalTests": {
            "Chest X-ray": "Right lower lobe infiltrate",
            "CRP": "3.4 mg/dL",
            "WBC": "11.9 K/uL",
        },
        "treatmentDone": [
            "Oral antibiotic course 7 days",
            "Hydration and respiratory physiotherapy",
            "Repeat X-ray advised after 2 weeks",
        ],
    },
    "PID1003": {
        "hospitalId": "HOSP1001",
        "hospitalName": "Central Medical Hospital",
        "patientName": "Arjun Patel",
        "age": 38,
        "diagnosis": "Hypertension with CKD Stage 3",
        "medicalTests": {
            "Serum Creatinine": "1.8 mg/dL",
            "eGFR": "42 mL/min/1.73m2",
            "Urine Protein": "0.8 g/24h",
        },
        "treatmentDone": [
            "ACE inhibitor optimization",
            "Low sodium renal diet counseling",
            "Nephrology follow-up every 4 weeks",
        ],
    },
    "PID1004": {
        "hospitalId": "HOSP1001",
        "hospitalName": "Central Medical Hospital",
        "patientName": "Meera Singh",
        "age": 48,
        "diagnosis": "Type 2 Diabetes Mellitus",
        "medicalTests": {
            "HbA1c": "6.9%",
            "Fasting Glucose": "108 mg/dL",
            "Microalbumin": "28 mg/24h",
        },
        "treatmentDone": [
            "Metformin + DPP4 inhibitor continuation",
            "Quarterly diabetic panel review",
            "Retinal screening advised",
        ],
    },
    "PID1005": {
        "hospitalId": "HOSP1001",
        "hospitalName": "Central Medical Hospital",
        "patientName": "Vikram Reddy",
        "age": 35,
        "diagnosis": "Major Depressive Disorder (Moderate)",
        "medicalTests": {
            "PHQ-9": "8",
            "TSH": "2.1 mIU/L",
            "Sleep Score": "Low restorative pattern",
        },
        "treatmentDone": [
            "Escitalopram 10mg OD",
            "Weekly CBT sessions",
            "Sleep hygiene protocol",
        ],
    },
    "PID2002": {
        "hospitalId": "HOSP1002",
        "hospitalName": "Metro Heart and Wellness Institute",
        "patientName": "Sana Ali",
        "age": 29,
        "diagnosis": "Atypical Community Acquired Pneumonia",
        "medicalTests": {
            "Chest X-ray": "Patchy right middle lobe opacity",
            "CRP": "4.0 mg/dL",
            "Procalcitonin": "0.38 ng/mL",
        },
        "treatmentDone": [
            "Macrolide-based oral therapy",
            "Nebulization support",
            "Radiology follow-up in 10 days",
        ],
    },
    "PID2003": {
        "hospitalId": "HOSP1002",
        "hospitalName": "Metro Heart and Wellness Institute",
        "patientName": "Nisha Das",
        "age": 57,
        "diagnosis": "Type 2 Diabetes Mellitus with Peripheral Neuropathy",
        "medicalTests": {
            "HbA1c": "7.4%",
            "Fasting Glucose": "124 mg/dL",
            "Vitamin B12": "265 pg/mL",
        },
        "treatmentDone": [
            "Metformin-based glycemic control",
            "Neuropathy symptom management",
            "Foot-care and metabolic follow-up",
        ],
    },
}

# â”€â”€ MOCK PATIENT DATABASE (Hospital Network Access) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
MOCK_PATIENTS: Dict = {
    "PAT001": {
        "patient_id": "PAT001",
        "name": "Rajesh Kumar",
        "age": 52,
        "gender": "M",
        "mrn": "MRN-2026-0001",
        "hospital": "Central Medical Hospital",
        "admitted_date": "2026-03-08",
        "primary_case": "CASE004",
        "diagnosis": "Acute ST-Elevation Myocardial Infarction (STEMI)",
        "treatment_status": "In-hospital recovery",
        "vital_signs": {
            "bp": "130/80 mmHg",
            "hr": "72 bpm",
            "rr": "18/min",
            "o2_sat": "98% on room air",
        },
        "recent_labs": {
            "troponin": "3.2 ng/mL (elevated)",
            "creatine_kinase": "850 U/L",
            "ejection_fraction": "45%",
            "hemoglobin": "13.1 g/dL",
        },
        "current_medications": ["Aspirin 75mg OD", "Clopidogrel 75mg OD", "Atorvastatin 80mg OD", "Metoprolol 25mg BD", "Ramipril 2.5mg OD"],
        "procedures": ["Primary PCI with stent placement (day 1)", "12-lead ECG", "Cardiac catheterization"],
    },
    "PAT002": {
        "patient_id": "PAT002",
        "name": "Priya Sharma",
        "age": 42,
        "gender": "F",
        "mrn": "MRN-2026-0002",
        "hospital": "Central Medical Hospital",
        "admitted_date": "2026-03-05",
        "primary_case": "CASE002",
        "diagnosis": "Community Acquired Pneumonia (CAP)",
        "treatment_status": "Improving, discharged in 2 days",
        "vital_signs": {
            "bp": "118/76 mmHg",
            "hr": "78 bpm",
            "rr": "20/min",
            "o2_sat": "96% on room air",
            "temp": "37.2Â°C (afebrile)",
        },
        "recent_labs": {
            "wbc": "7.8 K/Î¼L",
            "crp": "2.1 mg/dL (decreasing)",
            "chest_xray": "Right middle lobe infiltrate, improving",
        },
        "current_medications": ["Amoxicillin-Clavulanate 625mg TDS", "Azithromycin 500mg OD", "Paracetamol PRN"],
        "procedures": ["Chest X-Ray", "Sputum culture", "Blood cultures"],
    },
    "PAT003": {
        "patient_id": "PAT003",
        "name": "Arjun Patel",
        "age": 38,
        "gender": "M",
        "mrn": "MRN-2026-0003",
        "hospital": "Central Medical Hospital",
        "admitted_date": "2026-02-20",
        "primary_case": "CASE003",
        "diagnosis": "Hypertension with Chronic Kidney Disease Stage 3",
        "treatment_status": "Out-patient follow-up",
        "vital_signs": {
            "bp": "132/82 mmHg",
            "hr": "68 bpm",
            "rr": "16/min",
            "o2_sat": "99% on room air",
        },
        "recent_labs": {
            "creatinine": "1.8 mg/dL",
            "egfr": "42 mL/min/1.73mÂ²",
            "potassium": "4.5 mEq/L",
            "urine_protein": "0.8 g/24h",
        },
        "current_medications": ["Ramipril 5mg OD", "Amlodipine 5mg OD", "Furosemide 20mg OD", "Atorvastatin 20mg OD"],
        "procedures": ["24-hour ambulatory BP monitoring", "Renal ultrasound", "Urinalysis"],
    },
    "PAT004": {
        "patient_id": "PAT004",
        "name": "Meera Singh",
        "age": 48,
        "gender": "F",
        "mrn": "MRN-2026-0004",
        "hospital": "Central Medical Hospital",
        "admitted_date": "2026-02-28",
        "primary_case": "CASE001",
        "diagnosis": "Type 2 Diabetes Mellitus",
        "treatment_status": "Out-patient management",
        "vital_signs": {
            "bp": "128/78 mmHg",
            "hr": "76 bpm",
            "rr": "18/min",
            "o2_sat": "98% on room air",
        },
        "recent_labs": {
            "fasting_glucose": "108 mg/dL",
            "hba1c": "6.9%",
            "ldl": "98 mg/dL",
            "urine_microalbumin": "28 mg/24h",
        },
        "current_medications": ["Metformin 500mg BD", "Sitagliptin 50mg OD", "Atorvastatin 20mg OD"],
        "procedures": ["HbA1c test", "Lipid profile", "Urine microalbumin", "Retinal screening"],
    },
    "PAT005": {
        "patient_id": "PAT005",
        "name": "Vikram Reddy",
        "age": 35,
        "gender": "M",
        "mrn": "MRN-2026-0005",
        "hospital": "Central Medical Hospital",
        "admitted_date": "2026-03-01",
        "primary_case": "CASE005",
        "diagnosis": "Major Depressive Disorder (MDD) â€“ Moderate Severity",
        "treatment_status": "Out-patient therapy",
        "vital_signs": {
            "bp": "122/80 mmHg",
            "hr": "72 bpm",
            "rr": "16/min",
            "o2_sat": "99% on room air",
        },
        "recent_labs": {
            "phq9_score": "8 (mild-moderate)",
            "tsh": "2.1 mIU/L",
        },
        "current_medications": ["Escitalopram 10mg OD", "Multivitamin OD"],
        "procedures": ["PHQ-9 screening", "Thyroid function test", "Weekly CBT sessions"],
    },
    "PAT006": {
        "patient_id": "PAT006",
        "name": "Nisha Das",
        "age": 57,
        "gender": "F",
        "mrn": "MRN-2026-0006",
        "hospital": "Metro Heart and Wellness Institute",
        "admitted_date": "2026-03-02",
        "primary_case": "CASE001",
        "diagnosis": "Type 2 Diabetes Mellitus with Peripheral Neuropathy",
        "treatment_status": "Medication titration ongoing",
        "vital_signs": {
            "bp": "126/80 mmHg",
            "hr": "74 bpm",
            "rr": "18/min",
            "o2_sat": "98% on room air",
        },
        "recent_labs": {
            "fasting_glucose": "124 mg/dL",
            "hba1c": "7.4%",
            "vit_b12": "265 pg/mL",
        },
        "current_medications": ["Metformin 500mg BD", "Sitagliptin 50mg OD", "Pregabalin 75mg HS"],
        "procedures": ["Monofilament neuropathy testing", "HbA1c monitoring", "Foot care counseling"],
    },
    "PAT007": {
        "patient_id": "PAT007",
        "name": "Karthik Nair",
        "age": 63,
        "gender": "M",
        "mrn": "MRN-2026-0007",
        "hospital": "Central Medical Hospital",
        "admitted_date": "2026-03-03",
        "primary_case": "CASE004",
        "diagnosis": "NSTEMI under post-acute monitoring",
        "treatment_status": "Stable in telemetry ward",
        "vital_signs": {
            "bp": "134/84 mmHg",
            "hr": "69 bpm",
            "rr": "17/min",
            "o2_sat": "97% on room air",
        },
        "recent_labs": {
            "troponin": "0.26 ng/mL (downtrend)",
            "ldl": "86 mg/dL",
            "creatinine": "1.1 mg/dL",
        },
        "current_medications": ["Aspirin 75mg OD", "Clopidogrel 75mg OD", "Rosuvastatin 20mg HS", "Bisoprolol 2.5mg OD"],
        "procedures": ["Serial ECG", "Telemetry monitoring", "Coronary CT angiography"],
    },
    "PAT008": {
        "patient_id": "PAT008",
        "name": "Sana Ali",
        "age": 29,
        "gender": "F",
        "mrn": "MRN-2026-0008",
        "hospital": "Metro Heart and Wellness Institute",
        "admitted_date": "2026-03-07",
        "primary_case": "CASE002",
        "diagnosis": "Atypical Community Acquired Pneumonia",
        "treatment_status": "Improving on oral antibiotics",
        "vital_signs": {
            "bp": "112/70 mmHg",
            "hr": "82 bpm",
            "rr": "21/min",
            "o2_sat": "95% on room air",
            "temp": "37.6C",
        },
        "recent_labs": {
            "wbc": "10.1 K/uL",
            "crp": "4.0 mg/dL",
            "procalcitonin": "0.38 ng/mL",
        },
        "current_medications": ["Azithromycin 500mg OD", "Doxycycline 100mg BD", "Paracetamol 650mg PRN"],
        "procedures": ["Chest X-ray", "Respiratory viral panel", "Nebulization support"],
    },
    "PAT009": {
        "patient_id": "PAT009",
        "name": "Dev Malhotra",
        "age": 47,
        "gender": "M",
        "mrn": "MRN-2026-0009",
        "hospital": "Central Medical Hospital",
        "admitted_date": "2026-02-25",
        "primary_case": "CASE003",
        "diagnosis": "CKD Stage 3 with uncontrolled hypertension",
        "treatment_status": "Renal clinic follow-up",
        "vital_signs": {
            "bp": "146/92 mmHg",
            "hr": "73 bpm",
            "rr": "16/min",
            "o2_sat": "98% on room air",
        },
        "recent_labs": {
            "creatinine": "2.0 mg/dL",
            "egfr": "38 mL/min/1.73m2",
            "urine_protein": "1.1 g/24h",
        },
        "current_medications": ["Telmisartan 40mg OD", "Amlodipine 10mg OD", "Furosemide 40mg OD"],
        "procedures": ["Renal ultrasound", "24-hour urine protein", "Dietician counseling"],
    },
    "PAT010": {
        "patient_id": "PAT010",
        "name": "Ira Chatterjee",
        "age": 33,
        "gender": "F",
        "mrn": "MRN-2026-0010",
        "hospital": "Central Medical Hospital",
        "admitted_date": "2026-03-04",
        "primary_case": "CASE005",
        "diagnosis": "Major Depressive Disorder with insomnia",
        "treatment_status": "Psychiatry day-care follow-up",
        "vital_signs": {
            "bp": "118/76 mmHg",
            "hr": "70 bpm",
            "rr": "15/min",
            "o2_sat": "99% on room air",
        },
        "recent_labs": {
            "phq9_score": "11 (moderate)",
            "gad7_score": "8 (mild)",
            "tsh": "1.9 mIU/L",
        },
        "current_medications": ["Escitalopram 10mg OD", "Melatonin 3mg HS"],
        "procedures": ["CBT weekly sessions", "Sleep hygiene counseling", "Psychiatry review"],
    },
}

# â”€â”€ MOCK PATIENT CASES (educational demo data â€“ no personal identifiers) â”€â”€â”€â”€â”€â”€â”€â”€
MOCK_PATIENT_CASES: Dict = {
    "CASE001": {
        "case_id": "CASE001",
        "disease": "Type 2 Diabetes Mellitus",
        "treatment_done": "Lifestyle modification + Metformin 500mg BD for 3 months, escalated to Metformin + Sitagliptin combo",
        "medicines": ["Metformin 500mg BD", "Sitagliptin (Januvia) 50mg OD"],
        "outcome": "HbA1c reduced from 9.2% to 6.8% in 6 months. Fasting glucose normalized to <110 mg/dL.",
        "success_rate": "87%",
        "duration_months": 6,
        "category": "Endocrinology",
        "tags": ["diabetes", "insulin resistance", "HbA1c", "metformin"],
    },
    "CASE002": {
        "case_id": "CASE002",
        "disease": "Community Acquired Pneumonia (CAP)",
        "treatment_done": "Amoxicillin-Clavulanate 625mg TDS Ã— 7 days + supplemental oxygen therapy",
        "medicines": ["Amoxicillin-Clavulanate 625mg TDS", "Azithromycin 500mg OD", "Paracetamol 650mg PRN"],
        "outcome": "Fever resolved day 3. CXR clearance at day 14. Complete clinical recovery.",
        "success_rate": "92%",
        "duration_months": 1,
        "category": "Pulmonology",
        "tags": ["pneumonia", "antibiotic", "community-acquired", "respiratory"],
    },
    "CASE003": {
        "case_id": "CASE003",
        "disease": "Hypertension with Chronic Kidney Disease Stage 3",
        "treatment_done": "Ramipril 5mg OD (ACE inhibitor) + Amlodipine 5mg OD + Dietary sodium restriction <2g/day",
        "medicines": ["Ramipril 5mg OD", "Amlodipine 5mg OD", "Furosemide 20mg OD"],
        "outcome": "BP maintained 130/80 mmHg. eGFR stabilized at 45 mL/min/1.73mÂ². No CKD progression at 12 months.",
        "success_rate": "78%",
        "duration_months": 12,
        "category": "Nephrology",
        "tags": ["hypertension", "CKD", "ACE inhibitor", "renal protection"],
    },
    "CASE004": {
        "case_id": "CASE004",
        "disease": "Acute ST-Elevation Myocardial Infarction (STEMI)",
        "treatment_done": "Primary PCI within 90 min + dual antiplatelet therapy (Aspirin + Clopidogrel) + high-intensity statin",
        "medicines": ["Aspirin 325mg stat â†’ 75mg OD", "Clopidogrel 600mg stat â†’ 75mg OD", "Atorvastatin 80mg OD", "Metoprolol 25mg BD", "Ramipril 2.5mg OD"],
        "outcome": "TIMI 3 flow restored. LVEF improved 35% â†’ 52% at 3 months. No re-infarction.",
        "success_rate": "81%",
        "duration_months": 3,
        "category": "Cardiology",
        "tags": ["STEMI", "primary PCI", "antiplatelet", "statin", "cardiac rehab"],
    },
    "CASE005": {
        "case_id": "CASE005",
        "disease": "Major Depressive Disorder (MDD) â€“ Moderate Severity",
        "treatment_done": "Escitalopram 10mg OD (SSRI) + weekly CBT sessions for 12 weeks",
        "medicines": ["Escitalopram 10mg OD", "Clonazepam 0.5mg ON (short-term, tapered off week 4)"],
        "outcome": "PHQ-9 score reduced 19 â†’ 5 within 12 weeks. Patient resumed work and social activities.",
        "success_rate": "74%",
        "duration_months": 3,
        "category": "Psychiatry",
        "tags": ["depression", "SSRI", "CBT", "PHQ-9", "mental health"],
    },
}

LEARNING_RESOURCES: Dict = {
    "Endocrinology": {
        "articles": [
            {"title": "ADA Standards of Medical Care in Diabetes 2024", "url": "https://pubmed.ncbi.nlm.nih.gov/?term=ADA+standards+diabetes+2024"},
            {"title": "Metformin mechanisms and therapeutic uses in Type 2 DM", "url": "https://pubmed.ncbi.nlm.nih.gov/?term=metformin+mechanism+type2+diabetes"},
            {"title": "HbA1c as glycemic control target â€“ clinical review", "url": "https://pubmed.ncbi.nlm.nih.gov/?term=HbA1c+glycemic+target+review"},
        ],
        "youtube": [
            {"title": "Type 2 Diabetes â€“ Pathophysiology & Management", "url": "https://www.youtube.com/results?search_query=type+2+diabetes+pathophysiology+management"},
            {"title": "Metformin Mechanism of Action â€“ Pharmacology", "url": "https://www.youtube.com/results?search_query=metformin+mechanism+of+action+pharmacology"},
            {"title": "Insulin Resistance Explained", "url": "https://www.youtube.com/results?search_query=insulin+resistance+explained+medical"},
        ],
    },
    "Pulmonology": {
        "articles": [
            {"title": "Community-Acquired Pneumonia: Diagnosis and Management 2024", "url": "https://pubmed.ncbi.nlm.nih.gov/?term=community+acquired+pneumonia+management+guidelines+2024"},
            {"title": "Antibiotic Selection in CAP â€“ IDSA Guidelines", "url": "https://pubmed.ncbi.nlm.nih.gov/?term=antibiotic+selection+community+acquired+pneumonia+IDSA"},
        ],
        "youtube": [
            {"title": "Pneumonia â€“ Pathophysiology, Signs & Symptoms", "url": "https://www.youtube.com/results?search_query=pneumonia+pathophysiology+signs+symptoms+medical"},
            {"title": "Chest X-Ray Interpretation in Pneumonia", "url": "https://www.youtube.com/results?search_query=chest+x+ray+interpretation+pneumonia"},
        ],
    },
    "Nephrology": {
        "articles": [
            {"title": "KDIGO Guidelines for CKD Management 2024", "url": "https://pubmed.ncbi.nlm.nih.gov/?term=KDIGO+CKD+management+guidelines+2024"},
            {"title": "ACE Inhibitors in Hypertensive CKD â€“ Renoprotection Review", "url": "https://pubmed.ncbi.nlm.nih.gov/?term=ACE+inhibitor+hypertension+CKD+renoprotection"},
        ],
        "youtube": [
            {"title": "Chronic Kidney Disease â€“ Stages & Pathophysiology", "url": "https://www.youtube.com/results?search_query=chronic+kidney+disease+stages+pathophysiology"},
            {"title": "ACE Inhibitors â€“ Mechanism & Renal Protection", "url": "https://www.youtube.com/results?search_query=ACE+inhibitors+mechanism+renal+protection+medical"},
        ],
    },
    "Cardiology": {
        "articles": [
            {"title": "STEMI Management â€“ ESC/ACC Guidelines 2024", "url": "https://pubmed.ncbi.nlm.nih.gov/?term=STEMI+management+primary+PCI+guidelines+2024"},
            {"title": "Dual Antiplatelet Therapy in ACS â€“ Evidence Review", "url": "https://pubmed.ncbi.nlm.nih.gov/?term=dual+antiplatelet+therapy+ACS+review"},
        ],
        "youtube": [
            {"title": "STEMI â€“ Diagnosis and Primary PCI Explained", "url": "https://www.youtube.com/results?search_query=STEMI+diagnosis+primary+PCI+explained+medical"},
            {"title": "Myocardial Infarction â€“ ECG Changes & Pathophysiology", "url": "https://www.youtube.com/results?search_query=myocardial+infarction+ECG+changes+pathophysiology"},
        ],
    },
    "Psychiatry": {
        "articles": [
            {"title": "Major Depressive Disorder â€“ NICE Clinical Guidelines", "url": "https://pubmed.ncbi.nlm.nih.gov/?term=major+depressive+disorder+NICE+guidelines+treatment"},
            {"title": "SSRI Efficacy in MDD â€“ Systematic Review & Meta-Analysis", "url": "https://pubmed.ncbi.nlm.nih.gov/?term=SSRI+major+depressive+disorder+meta+analysis"},
        ],
        "youtube": [
            {"title": "Major Depression â€“ DSM-5 Criteria & Treatment Options", "url": "https://www.youtube.com/results?search_query=major+depressive+disorder+DSM5+treatment+options"},
            {"title": "CBT Techniques Explained â€“ Depression & Anxiety", "url": "https://www.youtube.com/results?search_query=cognitive+behavioral+therapy+CBT+techniques+depression"},
        ],
    },
}

MOCK_CONTEST_QUESTIONS: Dict = {
    "Endocrinology": [
        {
            "q": "Which first-line oral hypoglycemic agent is recommended for Type 2 Diabetes Mellitus?",
            "options": ["Glibenclamide", "Metformin", "Pioglitazone", "Sitagliptin"],
            "answer": 1,
            "explanation": "Metformin is the preferred first-line agent per ADA/WHO guidelines due to proven efficacy, safety, and cardiovascular benefit.",
        },
        {
            "q": "What HbA1c target is recommended for most non-pregnant adults with Type 2 DM?",
            "options": ["< 5.5%", "< 6.5%", "< 7.0%", "< 8.0%"],
            "answer": 2,
            "explanation": "ADA guidelines target HbA1c < 7.0% for most non-pregnant adults to prevent microvascular complications while minimizing hypoglycemia risk.",
        },
        {
            "q": "Which clinical sign best indicates insulin resistance in Type 2 DM?",
            "options": ["Polyuria + polydipsia only", "Fasting glucose > 200 mg/dL alone", "Acanthosis nigricans + obesity", "Weight loss with ketonuria"],
            "answer": 2,
            "explanation": "Acanthosis nigricans (velvety dark skin folds) combined with obesity are classic clinical markers of insulin resistance.",
        },
    ],
    "Pulmonology": [
        {
            "q": "Most common causative organism of Community-Acquired Pneumonia (CAP)?",
            "options": ["Klebsiella pneumoniae", "Streptococcus pneumoniae", "Pseudomonas aeruginosa", "Legionella pneumophila"],
            "answer": 1,
            "explanation": "Streptococcus pneumoniae (pneumococcus) is the most common bacterial cause of CAP across all age groups worldwide.",
        },
        {
            "q": "Which scoring tool guides hospitalization decision in Community-Acquired Pneumonia?",
            "options": ["SOFA score", "CURB-65 score", "APACHE II", "Child-Pugh score"],
            "answer": 1,
            "explanation": "CURB-65 (Confusion, Urea, Respiratory rate, BP, Age â‰¥65) guides CAP severity assessment and admission thresholds.",
        },
    ],
    "Nephrology": [
        {
            "q": "At what eGFR is CKD classified as Stage 3b (KDIGO)?",
            "options": ["60-89 mL/min", "45-59 mL/min", "30-44 mL/min", "15-29 mL/min"],
            "answer": 2,
            "explanation": "CKD Stage 3b = eGFR 30-44 mL/min/1.73mÂ² per KDIGO. Stage 3a = 45-59. Stage 4 = 15-29.",
        },
        {
            "q": "Which drug class provides BP control + renoprotection in hypertensive CKD?",
            "options": ["Beta-blockers", "Calcium channel blockers", "ACE inhibitors / ARBs", "Loop diuretics"],
            "answer": 2,
            "explanation": "ACE inhibitors and ARBs reduce intraglomerular pressure and proteinuria, slowing CKD progression beyond blood pressure lowering.",
        },
    ],
    "Cardiology": [
        {
            "q": "What is the target door-to-balloon time for primary PCI in STEMI?",
            "options": ["30 minutes", "60 minutes", "90 minutes", "120 minutes"],
            "answer": 2,
            "explanation": "ACC/AHA guidelines mandate door-to-balloon time â‰¤90 minutes for primary PCI in STEMI to minimize myocardial damage.",
        },
        {
            "q": "Which ECG finding indicates inferior STEMI (leads II, III, aVF)?",
            "options": ["ST depression + T-wave inversion", "ST elevation â‰¥1mm in â‰¥2 leads", "Left bundle branch block", "Prolonged QT interval"],
            "answer": 1,
            "explanation": "ST elevation â‰¥1mm in â‰¥2 contiguous inferior leads with Q-wave development indicates inferior MI (RCA territory).",
        },
    ],
    "Psychiatry": [
        {
            "q": "How many weeks of symptoms are required for MDD diagnosis per DSM-5?",
            "options": ["1 week", "2 weeks", "4 weeks", "6 months"],
            "answer": 1,
            "explanation": "DSM-5 requires â‰¥5 depressive symptoms for â‰¥2 continuous weeks, with depressed mood or anhedonia as a core feature.",
        },
        {
            "q": "Which PHQ-9 score range indicates moderate depression?",
            "options": ["1-4", "5-9", "10-14", "15-19"],
            "answer": 2,
            "explanation": "PHQ-9: 1-4 minimal, 5-9 mild, 10-14 moderate, 15-19 moderately severe, 20-27 severe depression.",
        },
    ],
}

GENERIC_QUESTIONS: List[Dict] = [
    {
        "q": "Which best describes evidence-based medicine (EBM)?",
        "options": ["Using the newest drugs available", "Integrating clinical expertise with best research evidence", "Following hospital protocols only", "Treating based on patient demand"],
        "answer": 1,
        "explanation": "EBM integrates individual clinical expertise, best available research, and patient preferences to guide clinical decisions.",
    },
    {
        "q": "What does NNT (Number Needed to Treat) represent?",
        "options": ["Number of drug doses in a course", "Patients treated to prevent one adverse outcome vs control", "Drug efficacy percentage", "Side effect severity index"],
        "answer": 1,
        "explanation": "NNT = number of patients who need treatment to prevent one additional bad outcome. Lower NNT = more effective treatment.",
    },
    {
        "q": "What does a Randomized Controlled Trial (RCT) primarily control for?",
        "options": ["Sample size", "Selection bias", "Confounding variables", "Publication bias"],
        "answer": 2,
        "explanation": "Random allocation to treatment/control groups controls for confounding variables, making RCT the gold standard for causal inference.",
    },
]


def _init_db() -> None:
    conn = sqlite3.connect(DB_PATH)
    try:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS student_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL,
                case_id TEXT NOT NULL,
                category TEXT NOT NULL,
                scanned_at TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS student_notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL,
                case_id TEXT NOT NULL,
                title TEXT NOT NULL,
                category TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS student_contest_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL,
                contest_type TEXT NOT NULL,
                score INTEGER NOT NULL,
                total INTEGER NOT NULL,
                taken_at TEXT NOT NULL
            )
            """
        )
        conn.commit()
    finally:
        conn.close()


def _valid_email(email: str) -> bool:
    return bool(re.fullmatch(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", email))


def _auth_required():
    return not session.get("user_email")


def _create_user(email: str, password: str, role: str) -> Dict:
    conn = sqlite3.connect(DB_PATH)
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        if cursor.fetchone():
            return {"ok": False, "error": "Email already registered"}

        cursor.execute(
            "INSERT INTO users (email, password_hash, role, created_at) VALUES (?, ?, ?, ?)",
            (email, generate_password_hash(password), role, datetime.now().isoformat()),
        )
        conn.commit()
        return {"ok": True}
    finally:
        conn.close()


def _login_user(email: str, password: str, role: str) -> Dict:
    conn = sqlite3.connect(DB_PATH)
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT email, password_hash, role FROM users WHERE email = ?", (email,))
        row = cursor.fetchone()
        if not row:
            return {"ok": False, "error": "Account not found"}

        db_email, db_hash, db_role = row
        if db_role != role:
            return {"ok": False, "error": "Selected category does not match account"}

        if not check_password_hash(db_hash, password):
            return {"ok": False, "error": "Invalid password"}

        session["user_email"] = db_email
        session["user_role"] = db_role
        return {"ok": True}
    finally:
        conn.close()


def _clean_text(value: str) -> str:
    text = "" if value is None else str(value)
    return re.sub(r"\s+", " ", text.strip())


def _has_gemini_key() -> bool:
    return bool((GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")).strip())


def _has_grok_key() -> bool:
    return bool((GROQ_API_KEY or os.getenv("GROQ_API_KEY", "")).strip())


# â”€â”€ STUDENT HELPER FUNCTIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
def _medicine_mechanism_hint(medicine: str) -> str:
    m = medicine.lower()
    if "metformin" in m:
        return "reducing hepatic glucose production and improving peripheral insulin sensitivity"
    if "ramipril" in m or "lisinopril" in m:
        return "inhibiting ACE to reduce angiotensin II, lowering BP and protecting kidney glomeruli"
    if "amlodipine" in m:
        return "blocking L-type calcium channels causing smooth muscle relaxation and vasodilation"
    if "escitalopram" in m or "fluoxetine" in m:
        return "selectively inhibiting serotonin reuptake, increasing synaptic serotonin levels"
    if "aspirin" in m:
        return "irreversibly inhibiting COX-1/COX-2, blocking thromboxane A2-mediated platelet aggregation"
    if "atorvastatin" in m or "statin" in m:
        return "inhibiting HMG-CoA reductase, the rate-limiting enzyme in hepatic cholesterol synthesis"
    if "amoxicillin" in m:
        return "inhibiting bacterial cell wall synthesis by binding penicillin-binding proteins (PBPs)"
    if "clopidogrel" in m:
        return "irreversibly blocking P2Y12 ADP receptors on platelets, preventing platelet activation"
    return "targeting disease-specific biological pathways to modulate the underlying pathophysiology"


def _mock_student_summary(case: Dict) -> str:
    drug = case["medicines"][0] if case["medicines"] else "the primary medication"
    mechanism = _medicine_mechanism_hint(drug)
    return (
        f"This case illustrates {case['disease']} managed with a structured approach involving "
        f"{case['treatment_done'].split('+')[0].strip()}. "
        f"The primary agent {drug} exerts its effect by {mechanism}. "
        f"The {case['success_rate']} success rate highlights the critical importance of early diagnosis, "
        f"treatment adherence, and regular monitoring of outcome biomarkers. "
        f"Key learning: Track {', '.join(case['tags'][:2])} parameters throughout treatment to "
        f"optimize therapeutic response and prevent complications."
    )


def _log_student_session(email: str, case_id: str, category: str) -> None:
    conn = sqlite3.connect(DB_PATH)
    try:
        conn.execute(
            "INSERT INTO student_sessions (email, case_id, category, scanned_at) VALUES (?, ?, ?, ?)",
            (email, case_id, category, datetime.now().isoformat()),
        )
        conn.commit()
    finally:
        conn.close()


def _get_student_recent_categories(email: str, days: int = 1) -> List[str]:
    from datetime import timedelta
    cutoff = (datetime.now() - timedelta(days=days)).isoformat()
    conn = sqlite3.connect(DB_PATH)
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT DISTINCT category FROM student_sessions WHERE email = ? AND scanned_at >= ?",
            (email, cutoff),
        )
        return [row[0] for row in cursor.fetchall()]
    finally:
        conn.close()


def _build_contest_questions(categories: List[str], count: int) -> List[Dict]:
    questions: List[Dict] = []
    for cat in categories:
        questions.extend(MOCK_CONTEST_QUESTIONS.get(cat, []))
    seen: set = set()
    unique: List[Dict] = []
    for q in questions:
        if q["q"] not in seen:
            seen.add(q["q"])
            unique.append(q)
    for gq in GENERIC_QUESTIONS:
        if gq["q"] not in seen:
            unique.append(gq)
            seen.add(gq["q"])
    # Return only question text + options (no answer), server-side answer key used on submit
    result = []
    for i, q in enumerate(unique[:count]):
        result.append({"id": i, "q": q["q"], "options": q["options"]})
    return result


def _get_answer_key(categories: List[str], count: int) -> List[Dict]:
    questions: List[Dict] = []
    for cat in categories:
        questions.extend(MOCK_CONTEST_QUESTIONS.get(cat, []))
    seen: set = set()
    unique: List[Dict] = []
    for q in questions:
        if q["q"] not in seen:
            seen.add(q["q"])
            unique.append(q)
    for gq in GENERIC_QUESTIONS:
        if gq["q"] not in seen:
            unique.append(gq)
            seen.add(gq["q"])
    return unique[:count]


def _mock_response(role: str, prompt: str) -> Dict:
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    lower_prompt = prompt.lower()

    if role == "doctor":
        urgency = "HIGH" if any(x in lower_prompt for x in ["bleeding", "trauma", "fracture", "stroke", "severe"]) else "MEDIUM"
        return {
            "summary": "AI assistant suggests immediate clinical review with structured triage.",
            "urgency": urgency,
            "recommendations": [
                "Confirm vitals and neurological status immediately.",
                "Prioritize imaging review and specialist escalation.",
                "Document differential diagnosis and reassess in 30 minutes.",
            ],
            "disclaimer": "Prototype output only. Final decision must be made by licensed clinician.",
            "generatedAt": now,
            "mode": "mock",
        }

    if role == "patient":
        return {
            "summary": "Weekly wellness review generated from provided metrics.",
            "riskLevel": "LOW" if "normal" in lower_prompt else "MODERATE",
            "recommendations": [
                "Maintain consistent sleep and hydration.",
                "Track food timing for heart-rate spikes.",
                "Share this report with your personal doctor for trend review.",
            ],
            "disclaimer": "Wellness guidance only. Not a medical diagnosis.",
            "generatedAt": now,
            "mode": "mock",
        }

    return {
        "summary": "Case-based learning plan generated for medical student training.",
        "learningPlan": [
            "Review the chief complaint and triage category.",
            "List top 3 differential diagnoses with rationale.",
            "Compare final treatment pathway and outcomes.",
        ],
        "quizQuestions": [
            "What finding increased urgency in this case?",
            "Which specialist referral should be prioritized and why?",
        ],
        "generatedAt": now,
        "mode": "mock",
    }


def _next_public_id() -> str:
    return f"FIT{len(PUBLIC_HEALTH_PROFILES) + 1:03d}"


def _find_doctor_name(doctor_id: str) -> str:
    for doctor in MOCK_DOCTORS:
        if doctor["id"] == doctor_id:
            return doctor["name"]
    return "Assigned Doctor"


def _find_doctor(doctor_id: str) -> Dict:
    for doctor in MOCK_DOCTORS:
        if doctor.get("id") == doctor_id:
            return doctor
    return {}


def _doctor_exists(doctor_id: str) -> bool:
    return any(d["id"] == doctor_id for d in MOCK_DOCTORS)


def _mock_doctor_consult_reply(doctor_name: str, diagnosis: str, message: str) -> str:
    return (
        f"Dr. {doctor_name.split('Dr. ')[-1] if doctor_name else 'Consultant'}: "
        f"Based on the current context ({diagnosis or 'general follow-up'}), I suggest we first "
        "review symptom trend, medication adherence, and warning signs. "
        "Please share latest vitals/tests if available so I can refine the plan. "
        f"Regarding your message: '{message[:140]}', we can proceed with a structured follow-up approach."
    )


def _doctor_consult_reply(doctor_name: str, specialty: str, diagnosis: str, message: str, provider: str = "grok") -> Dict:
    prompt = (
        "You are an experienced doctor responding in a tele-consultation chat. "
        "Keep response practical, empathetic, concise (5-7 lines), and clinically safe. "
        "Do not claim definitive diagnosis, suggest next checks and caution signs.\n\n"
        f"Doctor: {doctor_name} ({specialty})\n"
        f"Known diagnosis/context: {diagnosis}\n"
        f"Patient message: {message}\n"
    )

    use_mock = provider == "mock" or (not _has_grok_key() and not _has_gemini_key())
    if use_mock:
        return {"reply": _mock_doctor_consult_reply(doctor_name, diagnosis, message), "source": "mock"}

    try:
        if provider == "gemini" and _has_gemini_key():
            return {"reply": _gemini_generate(prompt), "source": "gemini"}
        if _has_grok_key():
            return {"reply": _grok_generate(prompt), "source": "grok"}
        if _has_gemini_key():
            return {"reply": _gemini_generate(prompt), "source": "gemini"}
    except Exception:
        pass

    return {"reply": _mock_doctor_consult_reply(doctor_name, diagnosis, message), "source": "mock"}


def _find_hospital(hospital_id: str = "", hospital_name: str = "") -> Dict:
    hospital_id = _clean_text(hospital_id).upper()
    hospital_name = _clean_text(hospital_name).lower()
    for hospital in [*MOCK_HOSPITALS, *CUSTOM_HOSPITALS]:
        if hospital_id and hospital["hospitalId"].upper() == hospital_id:
            return hospital
        if hospital_name and hospital["hospitalName"].lower() == hospital_name:
            return hospital
    return {}


def _hospital_personal_ids(hospital_id: str) -> List[str]:
    hid = _clean_text(hospital_id).upper()
    return sorted([
        pid for pid, rec in MOCK_HOSPITAL_PATIENT_REPORTS.items()
        if _clean_text(rec.get("hospitalId", "")).upper() == hid
    ])


def _treatment_categories_from_lines(lines: List[str]) -> List[str]:
    categories = []
    joined = " ".join([_clean_text(x).lower() for x in lines if x])
    if any(k in joined for k in ["mg", "od", "bd", "tds", "therapy", "antibiotic", "metformin", "aspirin", "escitalopram"]):
        categories.append("Medication")
    if any(k in joined for k in ["pci", "stent", "procedure", "catheter", "ecg", "x-ray", "ultrasound"]):
        categories.append("Procedural and Diagnostic")
    if any(k in joined for k in ["diet", "counsel", "rehab", "exercise", "sleep", "cbt", "physio"]):
        categories.append("Lifestyle and Rehabilitation")
    if any(k in joined for k in ["follow-up", "review", "monitor", "screen", "weekly", "monthly"]):
        categories.append("Follow-up and Monitoring")
    if not categories:
        categories.append("General Medical Management")
    return categories


def _find_hospital_by_name(hospital_name: str) -> Dict:
    name = _clean_text(hospital_name).lower()
    for hospital in [*MOCK_HOSPITALS, *CUSTOM_HOSPITALS]:
        if _clean_text(hospital.get("hospitalName", "")).lower() == name:
            return hospital
    return {}


def _build_hospital_style_report_from_patient(patient_id: str, patient: Dict) -> Dict:
    hospital = _find_hospital_by_name(patient.get("hospital", ""))
    hospital_id = hospital.get("hospitalId") or "HOSP1001"
    hospital_name = hospital.get("hospitalName") or patient.get("hospital") or "Central Medical Hospital"

    medical_tests = patient.get("recent_labs", {}) or {}
    treatment_done = []
    treatment_done.extend(patient.get("current_medications", []) or [])
    treatment_done.extend(patient.get("procedures", []) or [])
    if patient.get("treatment_status"):
        treatment_done.append(f"Current status: {patient.get('treatment_status')}")

    treatment_categories = _treatment_categories_from_lines(treatment_done)
    personal_id = f"PID-{patient_id}"

    return {
        "hospId": hospital_id,
        "hospReportId": f"HOSP-REP-{hospital_id}-{personal_id}",
        "hospitalName": hospital_name,
        "personalId": personal_id,
        "patientId": patient_id,
        "patientName": patient.get("name", "Unknown"),
        "age": patient.get("age"),
        "diagnosis": patient.get("diagnosis", "Not specified"),
        "medicalTests": medical_tests,
        "treatmentDone": treatment_done,
        "treatmentCategories": treatment_categories,
        "currentStatus": patient.get("treatment_status", "Under review"),
        "aiReportFormat": {
            "overview": (
                f"Hospital-style educational report for {patient.get('name', 'patient')} "
                f"with diagnosis: {patient.get('diagnosis', 'Not specified')}."
            ),
            "keyFindings": [
                f"Primary diagnosis: {patient.get('diagnosis', 'Not specified')}",
                f"Current status: {patient.get('treatment_status', 'Under review')}",
                f"Treatment categories: {', '.join(treatment_categories)}",
            ],
            "carePlan": treatment_done,
            "followUp": "Educational demo only. Final decisions should be made by licensed clinicians.",
        },
        "generatedAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }


def _diagnosis_to_case_id(diagnosis: str) -> str:
    diag = _clean_text(diagnosis).lower()
    if "diabetes" in diag:
        return "CASE001"
    if "pneumonia" in diag:
        return "CASE002"
    if "stemi" in diag or "myocardial" in diag or "pci" in diag:
        return "CASE004"
    if "kidney" in diag or "ckd" in diag or "hypertension" in diag:
        return "CASE003"
    if "depress" in diag:
        return "CASE005"
    return ""


def _resolve_learning_case(qr_case_id: str, diagnosis: str) -> Dict:
    case_id = _clean_text(qr_case_id).upper()
    if case_id and case_id in MOCK_PATIENT_CASES:
        case = MOCK_PATIENT_CASES[case_id].copy()
        resources = LEARNING_RESOURCES.get(case.get("category", ""), {"articles": [], "youtube": []})
        return {"caseId": case_id, "case": case, "resources": resources, "source": "qr"}

    mapped_case_id = _diagnosis_to_case_id(diagnosis)
    if mapped_case_id and mapped_case_id in MOCK_PATIENT_CASES:
        case = MOCK_PATIENT_CASES[mapped_case_id].copy()
        resources = LEARNING_RESOURCES.get(case.get("category", ""), {"articles": [], "youtube": []})
        return {"caseId": mapped_case_id, "case": case, "resources": resources, "source": "diagnosis-map"}

    return {
        "caseId": "",
        "case": {},
        "resources": {"articles": [], "youtube": []},
        "source": "none",
    }


def _diagnosis_to_doctor_category(diagnosis: str) -> str:
    case_id = _diagnosis_to_case_id(diagnosis)
    case = MOCK_PATIENT_CASES.get(case_id, {})
    return case.get("category", "")


def _build_public_metrics_snapshot(payload: Dict) -> Dict:
    return {
        "restingHeartRate": _clean_text(str(payload.get("restingHeartRate", ""))),
        "bloodPressure": _clean_text(str(payload.get("bloodPressure", ""))),
        "sleepHours": _clean_text(str(payload.get("sleepHours", ""))),
        "stepsPerDay": _clean_text(str(payload.get("stepsPerDay", ""))),
        "exerciseMinutes": _clean_text(str(payload.get("exerciseMinutes", ""))),
        "waterIntake": _clean_text(str(payload.get("waterIntake", ""))),
        "weight": _clean_text(str(payload.get("weight", ""))),
        "fastingGlucose": _clean_text(str(payload.get("fastingGlucose", ""))),
    }


def _parse_int(value: str, default: int = 0) -> int:
    digits = re.findall(r"\d+", value or "")
    return int(digits[0]) if digits else default


def _build_public_risk(metrics: Dict) -> Dict:
    score = 0
    resting_hr = _parse_int(metrics.get("restingHeartRate", "0"))
    sleep_hours = _parse_int(metrics.get("sleepHours", "0"))
    steps = _parse_int(metrics.get("stepsPerDay", "0"))
    exercise = _parse_int(metrics.get("exerciseMinutes", "0"))
    glucose = _parse_int(metrics.get("fastingGlucose", "0"))

    systolic = 0
    bp_raw = metrics.get("bloodPressure", "")
    if "/" in bp_raw:
        systolic = _parse_int(bp_raw.split("/")[0])

    # Critical low/high values should escalate risk quickly.
    if resting_hr and resting_hr < 45:
        score += 3
    if resting_hr >= 95:
        score += 2
    elif resting_hr >= 85:
        score += 1

    if sleep_hours and sleep_hours < 4:
        score += 3
    elif sleep_hours and sleep_hours < 6:
        score += 2
    elif sleep_hours and sleep_hours < 7:
        score += 1

    if steps and steps < 1000:
        score += 2
    elif steps and steps < 5000:
        score += 2
    elif steps and steps < 8000:
        score += 1

    if exercise == 0:
        score += 2
    elif exercise and exercise < 20:
        score += 1

    if systolic and systolic < 85:
        score += 3
    if systolic >= 140:
        score += 2
    elif systolic >= 130:
        score += 1

    if glucose and glucose < 70:
        score += 2
    if glucose >= 126:
        score += 2
    elif glucose >= 100:
        score += 1

    if score >= 12:
        level = "EMERGENCY"
    elif score >= 9:
        level = "DANGER"
    elif score >= 7:
        level = "HIGH"
    elif score >= 4:
        level = "MODERATE"
    else:
        level = "LOW"

    return {"score": score, "level": level}


def _build_public_fake_reports(public_id: str, metrics: Dict, risk: Dict) -> Dict:
    resting_hr = metrics.get("restingHeartRate") or "74 bpm"
    glucose = metrics.get("fastingGlucose") or "96 mg/dL"
    bp = metrics.get("bloodPressure") or "118/76 mmHg"
    risk_level = risk.get("level") or risk.get("riskLevel") or "MODERATE"
    return {
        "reportId": f"REP-{public_id}",
        "scanSummary": [
            "Wearable trend review: 7-day resting heart-rate curve uploaded",
            "Smartwatch sleep analysis: fragmented deep sleep on 3/7 nights",
            "Body composition scan: hydration and recovery score estimated",
        ],
        "labSummary": {
            "fasting_glucose": glucose,
            "resting_heart_rate": resting_hr,
            "blood_pressure": bp,
            "wellness_risk": risk_level,
        },
        "doctorViewNote": "Temporary prototype values only. Final hospital integration is intentionally deferred.",
    }


def _build_public_recommendations(metrics: Dict, risk: Dict) -> List[str]:
    recommendations = []
    sleep_hours = _parse_int(metrics.get("sleepHours", "0"))
    steps = _parse_int(metrics.get("stepsPerDay", "0"))
    water = _parse_int(metrics.get("waterIntake", "0"))
    glucose = _parse_int(metrics.get("fastingGlucose", "0"))

    if sleep_hours and sleep_hours < 7:
        recommendations.append("Increase sleep duration toward 7-8 hours and reduce late-night screen time.")
    if steps and steps < 8000:
        recommendations.append("Raise daily movement volume gradually toward 8,000-10,000 steps.")
    if water and water < 2:
        recommendations.append("Improve hydration consistency across the day, especially around workouts.")
    if glucose >= 100:
        recommendations.append("Track carbohydrate timing and discuss fasting glucose trends with a doctor.")
    if not recommendations:
        recommendations.append("Maintain the current routine and continue weekly monitoring for trend changes.")
    if risk["level"] != "LOW":
        recommendations.append("Share this report with an assigned doctor for review before making major health changes.")
    return recommendations[:4]


def _build_public_report(metrics: Dict, provider: str) -> Dict:
    risk = _build_public_risk(metrics)
    prompt = (
        "You are a wellness AI assistant for a patient-facing fitness dashboard. "
        "Summarize these health metrics in 4 short sentences, focusing on trends, lifestyle guidance, "
        "and when the user should follow up with a doctor. Avoid diagnosis.\n\n"
        f"Metrics: {json.dumps(metrics)}"
    )

    try:
        if provider == "gemini":
            summary = _gemini_generate(prompt)
            source = "Gemini AI"
        elif provider == "grok":
            summary = _grok_generate(prompt)
            source = "Groq AI"
        else:
            raise RuntimeError("mock requested")
    except Exception:
        summary = (
            f"Your current wellness snapshot is marked as {risk['level'].lower()} risk based on activity, sleep, "
            f"and basic home metrics. The pattern suggests focusing on routine consistency rather than emergency care. "
            "Use this as a fitness trend review only and seek medical review for persistent abnormal readings."
        )
        source = "Built-in"

    recommendations = _build_public_recommendations(metrics, risk)
    return {
        "summary": summary,
        "riskLevel": risk["level"],
        "riskScore": risk["score"],
        "recommendations": recommendations,
        "aiSource": source,
        "disclaimer": "Fitness and wellness guidance only. This is not a diagnosis or hospital record.",
        "aiReportFormat": {
            "overview": summary,
            "riskBand": f"{risk['level']} (score {risk['score']})",
            "actionPlan": recommendations,
            "followUp": "Discuss persistent abnormalities with an assigned doctor before changing treatment.",
        },
    }


def _seed_public_profile(email: str, metrics: Dict, provider: str) -> Dict:
    public_id = _next_public_id()
    report = _build_public_report(metrics, provider)
    report["fitId"] = public_id
    report["fitReportId"] = f"FIT-REP-{public_id}"
    record = {
        "publicId": public_id,
        "email": email,
        "metrics": metrics,
        "report": report,
        "fakeReports": _build_public_fake_reports(public_id, metrics, report),
        "createdAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "doctorAssigned": None,
        "accessStatus": "PRIVATE",
    }
    PUBLIC_HEALTH_PROFILES[public_id] = record
    PATIENT_REPORTS[public_id] = record
    return record


def _gemini_generate(prompt: str) -> str:
    api_key = (GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")).strip()
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set")

    models = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
    ]
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.2, "maxOutputTokens": 600},
    }

    last_error = None
    for model in models:
        url = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            f"{model}:generateContent?key={api_key}"
        )
        try:
            response = requests.post(url, json=payload, timeout=45)
            response.raise_for_status()
            data = response.json()

            candidates = data.get("candidates", [])
            if not candidates:
                raise RuntimeError("Gemini returned no candidates")

            parts = candidates[0].get("content", {}).get("parts", [])
            text = "\n".join(part.get("text", "") for part in parts if "text" in part).strip()
            if not text:
                raise RuntimeError("Gemini returned empty content")
            return text
        except requests.HTTPError as exc:
            last_error = exc
            status = getattr(exc.response, "status_code", None)
            if status == 404:
                continue
            raise

    if last_error:
        raise last_error
    raise RuntimeError("Gemini request failed")


def _grok_generate(prompt: str) -> str:
    """Generate text using Groq API (llama-3.3-70b-versatile)."""
    api_key = (GROQ_API_KEY or os.getenv("GROQ_API_KEY", "")).strip()
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is not set")

    url = "https://api.groq.com/openai/v1/chat/completions"
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": "You are a careful medical education assistant. Provide clear, evidence-based educational content. Do not provide definitive clinical diagnosis."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.2,
        "max_tokens": 600,
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    response = requests.post(url, headers=headers, json=payload, timeout=45)
    response.raise_for_status()
    data = response.json()

    choices = data.get("choices", [])
    if not choices:
        raise RuntimeError("Groq returned no choices")

    content = choices[0].get("message", {}).get("content", "").strip()
    if not content:
        raise RuntimeError("Groq returned empty content")
    return content


def _llm_json(role: str, user_input: str, provider: str, use_mock: bool) -> Dict:
    system_prompt = (
        "Return ONLY valid JSON. "
        "For doctor role include: summary, urgency, recommendations(array), disclaimer. "
        "For patient role include: summary, riskLevel, recommendations(array), disclaimer. "
        "For student role include: summary, learningPlan(array), quizQuestions(array)."
    )
    prompt = f"Role: {role}\nInput: {user_input}\n{system_prompt}"

    if use_mock:
        return _mock_response(role, user_input)

    if provider == "gemini":
        raw = _gemini_generate(prompt)
    elif provider == "grok":
        raw = _grok_generate(prompt)
    else:
        raise RuntimeError("Unsupported provider")

    # Parse LLM output as JSON; fallback to mock if parsing fails.
    try:
        parsed = json.loads(raw)
        parsed["mode"] = provider
        parsed["generatedAt"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        return parsed
    except Exception:
        fallback = _mock_response(role, user_input)
        fallback["summary"] = f"Live LLM reply could not be parsed as JSON. Fallback used. Raw starts: {raw[:120]}"
        return fallback


@app.route("/")
def home():
    if session.get("user_email"):
        return redirect(url_for("prototype_app"))
    return render_template("login.html")


@app.route("/auth/register", methods=["POST"])
def auth_register():
    payload = request.get_json(silent=True) or {}
    email = _clean_text(payload.get("email", "")).lower()
    password = payload.get("password", "")
    role = _clean_text(payload.get("role", "")).lower()

    if not email or not password or not role:
        return jsonify({"error": "email, password, and role are required"}), 400
    if not _valid_email(email):
        return jsonify({"error": "Enter a valid email address"}), 400
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400
    if role not in VALID_ROLES:
        return jsonify({"error": "Invalid category selected"}), 400

    result = _create_user(email, password, role)
    if not result["ok"]:
        return jsonify({"error": result["error"]}), 400

    return jsonify({"message": "Registration successful"})


@app.route("/auth/login", methods=["POST"])
def auth_login():
    payload = request.get_json(silent=True) or {}
    email = _clean_text(payload.get("email", "")).lower()
    password = payload.get("password", "")
    role = _clean_text(payload.get("role", "")).lower()

    if not email or not password or not role:
        return jsonify({"error": "email, password, and role are required"}), 400
    if not _valid_email(email):
        return jsonify({"error": "Enter a valid email address"}), 400
    if role not in VALID_ROLES:
        return jsonify({"error": "Invalid category selected"}), 400

    result = _login_user(email, password, role)
    if not result["ok"]:
        return jsonify({"error": result["error"]}), 401

    return jsonify({"message": "Login successful", "redirect": "/app"})


@app.route("/auth/logout", methods=["GET"])
def auth_logout():
    session.clear()
    return redirect(url_for("home"))


@app.route("/app")
def prototype_app():
    if _auth_required():
        return redirect(url_for("home"))
    if session.get("user_role") == "student":
        return redirect(url_for("student_dashboard"))
    return render_template(
        "prototype.html",
        user_email=session.get("user_email"),
        user_role=session.get("user_role"),
    )


@app.route("/app/student")
def student_dashboard():
    if _auth_required():
        return redirect(url_for("home"))
    if session.get("user_role") != "student":
        return redirect(url_for("prototype_app"))
    return render_template(
        "student_dashboard.html",
        user_email=session.get("user_email"),
        demo_cases=list(MOCK_PATIENT_CASES.keys()),
        demo_patient_ids=sorted(MOCK_PATIENTS.keys()),
    )


@app.route("/api/prototype/health", methods=["GET"])
def health():
    return jsonify(
        {
            "status": "ok",
            "service": "prototype_app",
            "session": {
                "loggedIn": bool(session.get("user_email")),
                "role": session.get("user_role"),
                "email": session.get("user_email"),
            },
            "providers": {
                "geminiConfigured": _has_gemini_key(),
                "grokConfigured": _has_grok_key(),
            },
        }
    )


@app.route("/api/prototype/doctor-assist", methods=["POST"])
def doctor_assist():
    if _auth_required():
        return jsonify({"error": "Unauthorized. Please login."}), 401

    payload = request.get_json(silent=True) or {}
    provider = _clean_text(payload.get("provider", "mock")).lower()
    case_note = _clean_text(payload.get("caseNote", ""))
    doctor_name = _clean_text(payload.get("doctorName", ""))

    if not case_note:
        return jsonify({"error": "caseNote is required"}), 400

    use_mock = provider == "mock"
    result = _llm_json("doctor", case_note, provider, use_mock)

    DOCTOR_REQUESTS.append(
        {
            "doctorName": doctor_name or "Unknown",
            "provider": provider,
            "caseNote": case_note,
            "result": result,
            "time": datetime.now().isoformat(),
        }
    )

    return jsonify(result)


@app.route("/api/prototype/patient-report", methods=["POST"])
def patient_report():
    if _auth_required():
        return jsonify({"error": "Unauthorized. Please login."}), 401

    payload = request.get_json(silent=True) or {}
    provider = _clean_text(payload.get("provider", "mock")).lower()
    hospital_id = _clean_text(payload.get("hospitalId", ""))
    metrics = _clean_text(payload.get("metrics", ""))

    if not hospital_id:
        return jsonify({"error": "hospitalId is required"}), 400

    if not metrics:
        return jsonify({"error": "metrics is required"}), 400

    use_mock = provider == "mock"
    result = _llm_json("patient", metrics, provider, use_mock)

    PATIENT_REPORTS[hospital_id] = {
        "hospitalId": hospital_id,
        "metrics": metrics,
        "aiReport": result,
        "updatedAt": datetime.now().isoformat(),
    }

    return jsonify(result)


@app.route("/api/prototype/public/my-records", methods=["GET"])
def public_my_records():
    if _auth_required():
        return jsonify({"error": "Unauthorized. Please login."}), 401
    if session.get("user_role") != "public":
        return jsonify({"error": "Access restricted to public users"}), 403

    email = session.get("user_email")
    records = [
        {
            "publicId": record["publicId"],
            "createdAt": record["createdAt"],
            "riskLevel": record["report"].get("riskLevel"),
            "accessStatus": record.get("accessStatus", "PRIVATE"),
            "doctorAssigned": record.get("doctorAssigned"),
        }
        for record in PUBLIC_HEALTH_PROFILES.values()
        if record.get("email") == email
    ]
    records.sort(key=lambda item: item["createdAt"], reverse=True)
    return jsonify({
        "records": records,
        "doctors": MOCK_DOCTORS,
        "doctorCategories": sorted({d["category"] for d in MOCK_DOCTORS}),
    })


@app.route("/api/prototype/public/search-doctors", methods=["GET"])
def public_search_doctors():
    if _auth_required():
        return jsonify({"error": "Unauthorized. Please login."}), 401
    if session.get("user_role") != "public":
        return jsonify({"error": "Access restricted to public users"}), 403

    query = _clean_text(request.args.get("q", "")).lower()
    category = _clean_text(request.args.get("category", "")).lower()
    sort_by = _clean_text(request.args.get("sort", "top")).lower()

    results = []
    for doctor in MOCK_DOCTORS:
        if query and query not in doctor["id"].lower() and query not in doctor["name"].lower():
            continue
        if category and category != "all" and category != doctor["category"].lower():
            continue
        results.append(doctor)

    if sort_by == "new":
        results.sort(key=lambda d: d.get("joinedAt", ""), reverse=True)
    else:
        results.sort(key=lambda d: d.get("rating", 0), reverse=True)

    return jsonify({"doctors": results, "count": len(results)})


@app.route("/api/prototype/public/generate-report", methods=["POST"])
def public_generate_report():
    if _auth_required():
        return jsonify({"error": "Unauthorized. Please login."}), 401
    if session.get("user_role") != "public":
        return jsonify({"error": "Access restricted to public users"}), 403

    payload = request.get_json(silent=True) or {}
    provider = _clean_text(payload.get("provider", "grok")).lower()
    metrics = _build_public_metrics_snapshot(payload)

    if not any(metrics.values()):
        return jsonify({"error": "At least one fitness metric is required"}), 400

    record = _seed_public_profile(session["user_email"], metrics, provider)
    return jsonify(record)


@app.route("/api/prototype/public/request-access", methods=["POST"])
def public_request_access():
    if _auth_required():
        return jsonify({"error": "Unauthorized. Please login."}), 401
    if session.get("user_role") != "public":
        return jsonify({"error": "Access restricted to public users"}), 403

    payload = request.get_json(silent=True) or {}
    public_id = _clean_text(payload.get("publicId", "")).upper()
    doctor_id = _clean_text(payload.get("doctorId", "")).upper()
    note = _clean_text(payload.get("note", ""))

    record = PUBLIC_HEALTH_PROFILES.get(public_id)
    if not record or record.get("email") != session.get("user_email"):
        return jsonify({"error": "Record not found"}), 404
    if not doctor_id:
        return jsonify({"error": "doctorId is required"}), 400
    if not _doctor_exists(doctor_id):
        return jsonify({"error": "Invalid doctorId. Use a listed doctor ID."}), 400

    request_item = {
        "requestId": f"REQ-{len(PUBLIC_ACCESS_REQUESTS) + 1:03d}",
        "publicId": public_id,
        "patientEmail": session.get("user_email"),
        "doctorId": doctor_id,
        "doctorName": _find_doctor_name(doctor_id),
        "note": note or "Requesting doctor review and access enablement.",
        "status": "PENDING",
        "requestedAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }
    PUBLIC_ACCESS_REQUESTS.append(request_item)
    record["accessStatus"] = "PENDING"
    record["doctorAssigned"] = request_item["doctorName"]
    return jsonify(request_item)


@app.route("/api/prototype/public/notifications", methods=["GET"])
def public_notifications():
    if _auth_required():
        return jsonify({"error": "Unauthorized. Please login."}), 401
    if session.get("user_role") != "public":
        return jsonify({"error": "Access restricted to public users"}), 403

    email = session.get("user_email")
    user_records = {
        rec["publicId"]: rec for rec in PUBLIC_HEALTH_PROFILES.values() if rec.get("email") == email
    }
    items: List[Dict] = []

    for req in PUBLIC_ACCESS_REQUESTS:
        public_id = req.get("publicId")
        if public_id not in user_records:
            continue
        status = req.get("status", "PENDING")
        items.append({
            "type": "DOCTOR_ACCESS_REQUEST",
            "publicId": public_id,
            "requestId": req.get("requestId"),
            "status": status,
            "message": f"Doctor access request {status.lower()} for {public_id} ({req.get('doctorName')}).",
            "createdAt": req.get("requestedAt"),
        })

    for public_id, grant in DOCTOR_ACCESS_GRANTS.items():
        if public_id not in user_records:
            continue
        items.append({
            "type": "DOCTOR_ACCESS_GRANTED",
            "publicId": public_id,
            "status": "GRANTED",
            "message": f"Access granted by {grant.get('doctor')} for {public_id}. You can now view detailed report sections.",
            "createdAt": grant.get("grantedAt"),
            "doctorNote": grant.get("doctorNote"),
        })

    items.sort(key=lambda i: i.get("createdAt", ""), reverse=True)
    return jsonify({"notifications": items, "count": len(items)})


@app.route("/api/prototype/public/save-hospital-session", methods=["POST"])
def public_save_hospital_session():
    if _auth_required():
        return jsonify({"error": "Unauthorized. Please login."}), 401
    if session.get("user_role") != "public":
        return jsonify({"error": "Access restricted to public users"}), 403

    payload = request.get_json(silent=True) or {}
    hospital_id = _clean_text(payload.get("hospitalId", "")).upper()
    hospital_name = _clean_text(payload.get("hospitalName", ""))

    if not hospital_id and not hospital_name:
        return jsonify({"error": "Provide hospitalId or hospitalName"}), 400

    by_id = _find_hospital(hospital_id=hospital_id, hospital_name="") if hospital_id else {}
    by_name = _find_hospital(hospital_id="", hospital_name=hospital_name) if hospital_name else {}
    if by_id and by_name and by_id.get("hospitalId") != by_name.get("hospitalId"):
        return jsonify({
            "error": "Hospital ID and hospital name refer to different hospitals. Please use a matching pair.",
            "hospitalById": by_id,
            "hospitalByName": by_name,
        }), 400

    existing = _find_hospital(hospital_id=hospital_id, hospital_name=hospital_name)
    if existing:
        return jsonify({
            "alreadyExists": True,
            "status": "ACTIVE",
            "hospital": existing,
            "message": "Hospital session already exists. Synced with lookup fields.",
        })

    new_hospital = {
        "hospitalId": hospital_id or f"HOSP{len(MOCK_HOSPITALS) + len(CUSTOM_HOSPITALS) + 1:04d}",
        "hospitalName": hospital_name or "Unnamed Hospital",
        "city": "Custom",
    }
    CUSTOM_HOSPITALS.append(new_hospital)
    return jsonify({
        "alreadyExists": False,
        "status": "ACTIVE",
        "hospital": new_hospital,
        "message": "Hospital session saved successfully.",
    })


@app.route("/api/prototype/public/hospital-report", methods=["POST"])
def public_hospital_report():
    if _auth_required():
        return jsonify({"error": "Unauthorized. Please login."}), 401
    if session.get("user_role") != "public":
        return jsonify({"error": "Access restricted to public users"}), 403

    payload = request.get_json(silent=True) or {}
    hospital_id = _clean_text(payload.get("hospitalId", "")).upper()
    hospital_name = _clean_text(payload.get("hospitalName", ""))
    personal_id = _clean_text(payload.get("personalId", "")).upper()

    if not personal_id:
        return jsonify({"error": "personalId is required"}), 400
    if not hospital_id and not hospital_name:
        return jsonify({"error": "Provide hospitalId or hospitalName"}), 400

    record = MOCK_HOSPITAL_PATIENT_REPORTS.get(personal_id)
    selected_hospital = _find_hospital(hospital_id=hospital_id, hospital_name=hospital_name)

    # Allow PAT IDs from student-side demo data to be used directly in hospital report lookup.
    if not record and personal_id.startswith("PAT") and personal_id in MOCK_PATIENTS:
        pat_report = _build_hospital_style_report_from_patient(personal_id, MOCK_PATIENTS[personal_id])
        report_hospital = _find_hospital(hospital_id=pat_report.get("hospId", ""))
        if selected_hospital and report_hospital and selected_hospital.get("hospitalId") != report_hospital.get("hospitalId"):
            return jsonify({
                "error": (
                    f"Selected hospital does not match patient ID {personal_id}. "
                    f"Use hospital {report_hospital.get('hospitalName')} ({report_hospital.get('hospitalId')})."
                )
            }), 400
        pat_report["hospitalAccessResponse"] = {
            "sessionStatus": "ACTIVE",
            "accessType": "Temporary Prototype Access",
            "checkedAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "message": "Hospital access validated using shared PAT ID demo data.",
            "warning": "",
        }
        return jsonify(pat_report)

    if not record:
        if not selected_hospital:
            return jsonify({"error": "Hospital not found. Use valid hospital name or hospital ID."}), 404
        return jsonify({
            "error": "Personal ID not found in temporary hospital records",
            "availablePersonalIds": _hospital_personal_ids(selected_hospital.get("hospitalId", "")),
            "hospitalId": selected_hospital.get("hospitalId"),
            "hospitalName": selected_hospital.get("hospitalName"),
        }), 404

    expected_hid = _clean_text(record.get("hospitalId", "")).upper()
    expected_hospital = _find_hospital(hospital_id=expected_hid)
    report_hospital = expected_hospital or selected_hospital
    warning = ""

    if not report_hospital:
        return jsonify({"error": "Hospital data is incomplete for this personal ID."}), 500

    if selected_hospital and selected_hospital.get("hospitalId") != expected_hid:
        warning = (
            f"Selected hospital did not match personal ID. Auto-loaded from "
            f"{report_hospital.get('hospitalName')} ({report_hospital.get('hospitalId')})."
        )

    treatment_categories = _treatment_categories_from_lines(record["treatmentDone"])
    report = {
        "hospId": report_hospital["hospitalId"],
        "hospReportId": f"HOSP-REP-{report_hospital['hospitalId']}-{personal_id}",
        "hospitalName": report_hospital["hospitalName"],
        "personalId": personal_id,
        "patientName": record["patientName"],
        "age": record.get("age"),
        "diagnosis": record["diagnosis"],
        "medicalTests": record["medicalTests"],
        "treatmentDone": record["treatmentDone"],
        "treatmentCategories": treatment_categories,
        "currentStatus": "Under active clinical management",
        "aiReportFormat": {
            "overview": f"Hospital report review for {record['patientName']} indicates ongoing management for {record['diagnosis']}.",
            "keyFindings": [
                f"Primary diagnosis: {record['diagnosis']}",
                f"Test panel includes {', '.join(record['medicalTests'].keys())}",
                "Treatment progression appears consistent with current care pathway.",
            ],
            "carePlan": record["treatmentDone"],
            "followUp": "For prototype use only. Confirm all decisions with the hospital care team.",
        },
        "hospitalAccessResponse": {
            "sessionStatus": "ACTIVE",
            "accessType": "Temporary Prototype Access",
            "checkedAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "message": "Hospital access validated. You can review report data and launch learning/doctor collaboration tools.",
            "warning": warning,
        },
        "generatedAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }
    return jsonify(report)


@app.route("/api/prototype/public/hospital-doctors", methods=["GET"])
def public_hospital_doctors():
    if _auth_required():
        return jsonify({"error": "Unauthorized. Please login."}), 401
    if session.get("user_role") != "public":
        return jsonify({"error": "Access restricted to public users"}), 403

    query = _clean_text(request.args.get("q", "")).lower()
    scope = _clean_text(request.args.get("scope", "all")).lower()
    mode = _clean_text(request.args.get("mode", "treatment")).lower()
    diagnosis = _clean_text(request.args.get("diagnosis", ""))
    preferred_category = _diagnosis_to_doctor_category(diagnosis)

    supported_modes = {"treatment", "online", "video"}
    if mode not in supported_modes:
        mode = "treatment"

    results = []
    for doctor in MOCK_DOCTORS:
        if query and query not in doctor.get("id", "").lower() and query not in doctor.get("name", "").lower() and query not in doctor.get("specialty", "").lower():
            continue
        if scope != "all" and doctor.get("scope", "").lower() != scope:
            continue
        if mode not in [m.lower() for m in doctor.get("interactionModes", [])]:
            continue

        doctor_copy = doctor.copy()
        doctor_copy["recommendedForDiagnosis"] = bool(preferred_category and doctor.get("category") == preferred_category)
        if mode == "video":
            doctor_copy["collaborationLabel"] = "Video Interaction Ready"
        elif mode == "online":
            doctor_copy["collaborationLabel"] = "Online Advisory Ready"
        else:
            doctor_copy["collaborationLabel"] = "Treatment Discussion Ready"
        results.append(doctor_copy)

    results.sort(
        key=lambda d: (
            0 if d.get("recommendedForDiagnosis") else 1,
            -float(d.get("rating", 0)),
            d.get("joinedAt", ""),
        )
    )

    return jsonify({
        "count": len(results),
        "diagnosis": diagnosis,
        "preferredCategory": preferred_category or "General",
        "interactionMode": mode,
        "scope": scope,
        "doctors": results,
    })


@app.route("/api/prototype/public/online-sessions", methods=["GET"])
def public_online_sessions():
    if _auth_required():
        return jsonify({"error": "Unauthorized. Please login."}), 401
    if session.get("user_role") != "public":
        return jsonify({"error": "Access restricted to public users"}), 403

    email = session.get("user_email")
    sessions = []
    for public_id, rec in PUBLIC_HEALTH_PROFILES.items():
        if rec.get("email") != email:
            continue
        grant = DOCTOR_ACCESS_GRANTS.get(public_id)
        if not grant:
            continue
        sessions.append({
            "publicId": public_id,
            "doctorId": grant.get("doctorId", ""),
            "doctorName": grant.get("doctorName") or grant.get("doctor") or rec.get("doctorAssigned") or "Assigned Doctor",
            "specialty": grant.get("specialty", "General Medicine"),
            "meetingId": grant.get("onlineMeetingId", ""),
            "grantedAt": grant.get("grantedAt"),
            "riskLevel": rec.get("report", {}).get("riskLevel"),
            "diagnosisHint": rec.get("report", {}).get("summary", ""),
        })
    sessions.sort(key=lambda s: s.get("grantedAt", ""), reverse=True)
    return jsonify({"sessions": sessions, "count": len(sessions)})


@app.route("/api/prototype/public/online-chat", methods=["POST"])
def public_online_chat():
    if _auth_required():
        return jsonify({"error": "Unauthorized. Please login."}), 401
    if session.get("user_role") != "public":
        return jsonify({"error": "Access restricted to public users"}), 403

    payload = request.get_json(silent=True) or {}
    public_id = _clean_text(payload.get("publicId", "")).upper()
    message = _clean_text(payload.get("message", ""))
    provider = _clean_text(payload.get("provider", "grok")).lower()

    if not public_id:
        return jsonify({"error": "publicId is required"}), 400
    if not message:
        return jsonify({"error": "message is required"}), 400
    if len(message) > 1500:
        return jsonify({"error": "message is too long"}), 400

    record = PUBLIC_HEALTH_PROFILES.get(public_id)
    if not record or record.get("email") != session.get("user_email"):
        return jsonify({"error": "Record not found"}), 404

    grant = DOCTOR_ACCESS_GRANTS.get(public_id)
    if not grant:
        return jsonify({"error": "Doctor has not accepted this request yet."}), 400

    doctor_name = grant.get("doctorName") or grant.get("doctor") or record.get("doctorAssigned") or "Assigned Doctor"
    specialty = grant.get("specialty", "General Medicine")
    diagnosis = record.get("report", {}).get("summary", "General wellness follow-up")
    ai = _doctor_consult_reply(doctor_name, specialty, diagnosis, message, provider)

    thread = ONLINE_CHAT_THREADS.setdefault(public_id, [])
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    thread.append({"role": "patient", "author": session.get("user_email"), "message": message, "time": now})
    thread.append({"role": "doctor", "author": doctor_name, "message": ai["reply"], "time": now, "source": ai["source"]})
    if len(thread) > 100:
        ONLINE_CHAT_THREADS[public_id] = thread[-100:]

    return jsonify({
        "publicId": public_id,
        "doctorName": doctor_name,
        "messages": ONLINE_CHAT_THREADS[public_id],
    })


@app.route("/api/prototype/public/connect-online-meeting", methods=["POST"])
def public_connect_online_meeting():
    if _auth_required():
        return jsonify({"error": "Unauthorized. Please login."}), 401
    if session.get("user_role") != "public":
        return jsonify({"error": "Access restricted to public users"}), 403

    payload = request.get_json(silent=True) or {}
    public_id = _clean_text(payload.get("publicId", "")).upper()
    meeting_id = _clean_text(payload.get("meetingId", ""))

    if not public_id:
        return jsonify({"error": "publicId is required"}), 400
    if not meeting_id:
        return jsonify({"error": "meetingId is required"}), 400

    record = PUBLIC_HEALTH_PROFILES.get(public_id)
    if not record or record.get("email") != session.get("user_email"):
        return jsonify({"error": "Record not found"}), 404

    grant = DOCTOR_ACCESS_GRANTS.get(public_id)
    if not grant:
        return jsonify({"error": "Doctor has not accepted this request yet."}), 400

    expected = _clean_text(grant.get("onlineMeetingId", ""))
    if expected and expected.lower() != meeting_id.lower():
        return jsonify({
            "error": "Meeting ID does not match doctor provided session.",
            "expectedMeetingId": expected,
        }), 400

    normalized = re.sub(r"[^A-Za-z0-9-]", "", meeting_id)
    meeting_url = f"https://meet.google.com/lookup/{normalized}"
    return jsonify({
        "connected": True,
        "publicId": public_id,
        "doctorName": grant.get("doctorName") or grant.get("doctor") or "Assigned Doctor",
        "meetingId": expected or meeting_id,
        "meetingUrl": meeting_url,
        "message": "Online consultation session is ready. Open the meeting link to continue.",
    })


@app.route("/api/prototype/public/report/<public_id>", methods=["GET"])
def public_view_report(public_id: str):
    if _auth_required():
        return jsonify({"error": "Unauthorized. Please login."}), 401
    if session.get("user_role") not in {"public", "doctor"}:
        return jsonify({"error": "Access restricted"}), 403

    public_id = _clean_text(public_id.upper())
    record = PUBLIC_HEALTH_PROFILES.get(public_id)
    if not record:
        return jsonify({"error": "Record not found"}), 404

    if session.get("user_role") == "public" and record.get("email") != session.get("user_email"):
        return jsonify({"error": "You can only view your own records"}), 403

    grant = DOCTOR_ACCESS_GRANTS.get(public_id)
    full_access = session.get("user_role") == "doctor" or bool(grant)
    response = {
        "publicId": record["publicId"],
        "createdAt": record["createdAt"],
        "metrics": record["metrics"],
        "report": record["report"],
        "accessStatus": record.get("accessStatus", "PRIVATE"),
        "doctorAssigned": record.get("doctorAssigned"),
        "grant": grant,
    }
    if full_access:
        response["fakeReports"] = record["fakeReports"]
    return jsonify(response)


@app.route("/api/prototype/doctor/access-queue", methods=["GET"])
def doctor_access_queue():
    if _auth_required():
        return jsonify({"error": "Unauthorized. Please login."}), 401
    if session.get("user_role") != "doctor":
        return jsonify({"error": "Access restricted to doctors"}), 403

    items = []
    for request_item in PUBLIC_ACCESS_REQUESTS:
        record = PUBLIC_HEALTH_PROFILES.get(request_item["publicId"], {})
        items.append({
            **request_item,
            "metrics": record.get("metrics", {}),
            "riskLevel": record.get("report", {}).get("riskLevel"),
            "doctorGrant": DOCTOR_ACCESS_GRANTS.get(request_item["publicId"]),
        })
    items.sort(key=lambda item: item.get("requestedAt", ""), reverse=True)
    return jsonify({"requests": items, "doctors": MOCK_DOCTORS})


@app.route("/api/prototype/doctor/grant-access", methods=["POST"])
def doctor_grant_access():
    if _auth_required():
        return jsonify({"error": "Unauthorized. Please login."}), 401
    if session.get("user_role") != "doctor":
        return jsonify({"error": "Access restricted to doctors"}), 403

    payload = request.get_json(silent=True) or {}
    public_id = _clean_text(payload.get("publicId", "")).upper()
    doctor_note = _clean_text(payload.get("doctorNote", ""))
    provided_meeting_id = _clean_text(payload.get("onlineMeetingId", ""))

    record = PUBLIC_HEALTH_PROFILES.get(public_id)
    if not record:
        return jsonify({"error": "Record not found"}), 404

    linked_request = next(
        (
            req for req in reversed(PUBLIC_ACCESS_REQUESTS)
            if req.get("publicId") == public_id and req.get("status") in {"PENDING", "GRANTED"}
        ),
        {},
    )
    doctor_id = _clean_text(linked_request.get("doctorId", "")).upper()
    doctor_meta = _find_doctor(doctor_id) if doctor_id else {}
    doctor_name = (
        linked_request.get("doctorName")
        or doctor_meta.get("name")
        or session.get("user_email")
        or "Doctor"
    )
    online_meeting_id = provided_meeting_id or f"CONSULT-{public_id}-{(doctor_id or 'DOC')[-3:]}"
    grant = {
        "granted": True,
        "doctor": doctor_name,
        "doctorName": doctor_name,
        "doctorId": doctor_id,
        "specialty": doctor_meta.get("specialty", "General Medicine"),
        "onlineMeetingId": online_meeting_id,
        "doctorNote": doctor_note or "Access enabled for fitness report discussion and follow-up.",
        "grantedAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }
    DOCTOR_ACCESS_GRANTS[public_id] = grant
    record["accessStatus"] = "GRANTED"
    record["doctorAssigned"] = doctor_name

    for request_item in PUBLIC_ACCESS_REQUESTS:
        if request_item["publicId"] == public_id and request_item["status"] == "PENDING":
            request_item["status"] = "GRANTED"

    return jsonify({"publicId": public_id, "grant": grant})


@app.route("/api/prototype/doctor/update-meeting-session", methods=["POST"])
def doctor_update_meeting_session():
    if _auth_required():
        return jsonify({"error": "Unauthorized. Please login."}), 401
    if session.get("user_role") != "doctor":
        return jsonify({"error": "Access restricted to doctors"}), 403

    payload = request.get_json(silent=True) or {}
    public_id = _clean_text(payload.get("publicId", "")).upper()
    meeting_id = _clean_text(payload.get("meetingId", ""))

    if not public_id:
        return jsonify({"error": "publicId is required"}), 400

    grant = DOCTOR_ACCESS_GRANTS.get(public_id)
    if not grant:
        return jsonify({"error": "No accepted/granted record found for this FIT ID."}), 404

    doctor_id = _clean_text(grant.get("doctorId", "")).upper() or "DOC"
    final_meeting_id = meeting_id or f"CONSULT-{public_id}-{doctor_id[-3:]}"

    grant["onlineMeetingId"] = final_meeting_id
    grant["meetingUpdatedAt"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    return jsonify({
        "publicId": public_id,
        "meetingId": final_meeting_id,
        "doctorName": grant.get("doctorName") or grant.get("doctor") or session.get("user_email") or "Doctor",
        "updatedAt": grant["meetingUpdatedAt"],
    })


@app.route("/api/prototype/doctor/analyze-report", methods=["POST"])
def doctor_analyze_report():
    if _auth_required():
        return jsonify({"error": "Unauthorized. Please login."}), 401
    if session.get("user_role") != "doctor":
        return jsonify({"error": "Access restricted to doctors"}), 403

    payload = request.get_json(silent=True) or {}
    public_id = _clean_text(payload.get("publicId", "")).upper()
    provider = _clean_text(payload.get("provider", "mock")).lower()

    if not public_id:
        return jsonify({"error": "publicId is required"}), 400

    record = PUBLIC_HEALTH_PROFILES.get(public_id)
    if not record:
        return jsonify({"error": "Record not found"}), 404

    report_data = record.get("report", {})
    metrics_data = record.get("metrics", {})
    case_context = f"Patient ID: {public_id}\nRisk Level: {report_data.get('riskLevel', 'MODERATE')}\nSummary: {report_data.get('summary', '')}\nMetrics: {str(metrics_data)}"

    use_mock = provider == "mock"
    ai_analysis = _llm_json("doctor", case_context, provider, use_mock)

    return jsonify({
        "publicId": public_id,
        "patientReport": {
            "riskLevel": report_data.get("riskLevel"),
            "summary": report_data.get("summary"),
            "metrics": metrics_data,
        },
        "aiSuggestions": ai_analysis,
        "analyzedAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    })


@app.route("/api/prototype/doctor/send-treatment-suggestion", methods=["POST"])
def doctor_send_treatment_suggestion():
    if _auth_required():
        return jsonify({"error": "Unauthorized. Please login."}), 401
    if session.get("user_role") != "doctor":
        return jsonify({"error": "Access restricted to doctors"}), 403

    payload = request.get_json(silent=True) or {}
    public_id = _clean_text(payload.get("publicId", "")).upper()
    doctor_id = _clean_text(payload.get("doctorId", "")).upper()
    treatment_plan = _clean_text(payload.get("treatmentPlan", ""))
    medications = _clean_text(payload.get("medications", ""))
    followup_date = _clean_text(payload.get("followupDate", ""))
    category = _clean_text(payload.get("category", ""))

    if not public_id or not treatment_plan:
        return jsonify({"error": "publicId and treatmentPlan are required"}), 400

    record = PUBLIC_HEALTH_PROFILES.get(public_id)
    if not record:
        return jsonify({"error": "Patient record not found"}), 404

    if not category:
        category = _diagnosis_to_doctor_category(record.get("report", {}).get("summary", "")) or "General"

    doctor_meta = _find_doctor(doctor_id) if doctor_id else {}
    doctor_name = doctor_meta.get("name") or session.get("user_email") or "Doctor"

    suggestion = {
        "suggestionId": f"SUGG-{public_id}-{len(DOCTOR_SUGGESTIONS) + 1:04d}",
        "publicId": public_id,
        "doctorId": doctor_id,
        "doctorName": doctor_name,
        "doctorSpecialty": doctor_meta.get("specialty", "General Medicine"),
        "category": category,
        "treatmentPlan": treatment_plan,
        "medications": medications,
        "followupDate": followup_date,
        "status": "ACTIVE",
        "sentAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }

    DOCTOR_SUGGESTIONS.append(suggestion)

    return jsonify({
        "suggestionId": suggestion["suggestionId"],
        "publicId": public_id,
        "message": f"Treatment suggestion sent to patient by {doctor_name}",
        "suggestion": suggestion,
    })


@app.route("/api/prototype/public/my-suggestions", methods=["GET"])
def public_my_suggestions():
    if _auth_required():
        return jsonify({"error": "Unauthorized. Please login."}), 401
    if session.get("user_role") != "public":
        return jsonify({"error": "Access restricted to public users"}), 403

    user_public_ids = [
        rec["publicId"]
        for rec in PUBLIC_HEALTH_PROFILES.values()
        if rec.get("email") == session.get("user_email")
    ]

    suggestions = [
        sugg
        for sugg in DOCTOR_SUGGESTIONS
        if sugg.get("publicId") in user_public_ids and sugg.get("status") == "ACTIVE"
    ]
    suggestions.sort(key=lambda x: x.get("sentAt", ""), reverse=True)

    return jsonify({
        "suggestions": suggestions,
        "count": len(suggestions),
    })


@app.route("/api/prototype/student-tutor", methods=["POST"])
def student_tutor():
    if _auth_required():
        return jsonify({"error": "Unauthorized. Please login."}), 401

    payload = request.get_json(silent=True) or {}
    provider = _clean_text(payload.get("provider", "mock")).lower()
    case_data = _clean_text(payload.get("caseData", ""))
    student_id = _clean_text(payload.get("studentId", ""))

    if not case_data:
        return jsonify({"error": "caseData is required"}), 400

    use_mock = provider == "mock"
    result = _llm_json("student", case_data, provider, use_mock)

    STUDENT_TASKS.append(
        {
            "studentId": student_id or "Unknown",
            "provider": provider,
            "caseData": case_data,
            "result": result,
            "time": datetime.now().isoformat(),
        }
    )

    return jsonify(result)


@app.route("/api/prototype/demo-stats", methods=["GET"])
def demo_stats():
    if _auth_required():
        return jsonify({"error": "Unauthorized. Please login."}), 401

    return jsonify(
        {
            "doctorRequests": len(DOCTOR_REQUESTS),
            "patientReports": len(PATIENT_REPORTS),
            "studentTasks": len(STUDENT_TASKS),
        }
    )


# â”€â”€ STUDENT API ROUTES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
@app.route("/api/student/process-qr", methods=["POST"])
def student_process_qr():
    if _auth_required():
        return jsonify({"error": "Unauthorized"}), 401
    if session.get("user_role") != "student":
        return jsonify({"error": "Access restricted to students"}), 403

    payload = request.get_json(silent=True) or {}
    qr_data = _clean_text(payload.get("qr_data", "")).upper()
    provider = _clean_text(payload.get("provider", "mock")).lower()

    if not qr_data:
        return jsonify({"error": "qr_data is required"}), 400

    patient = MOCK_PATIENTS.get(qr_data)
    case = {}
    qr_type = "case"
    patient_id = ""
    if patient:
        patient_id = patient.get("patient_id", qr_data)
        case = MOCK_PATIENT_CASES.get(patient.get("primary_case", ""), {})
        qr_type = "patient"
    else:
        case = MOCK_PATIENT_CASES.get(qr_data)
        if case:
            qr_type = "case"

    if not case:
        return jsonify({"error": f"ID '{qr_data}' not found. Use patient IDs PAT001 â€“ PAT010 or CASE001 â€“ CASE005."}), 404

    resolved = _resolve_learning_case(case.get("case_id", ""), patient.get("diagnosis", "") if patient else case.get("disease", ""))
    if resolved.get("case"):
        case = resolved["case"]
    resources = LEARNING_RESOURCES.get(case.get("category", ""), {"articles": [], "youtube": []})
    hospital_style_report = _build_hospital_style_report_from_patient(patient_id, patient) if patient else {}
    use_mock = provider == "mock" or (
        not _has_gemini_key() and not _has_grok_key()
    )

    if use_mock:
        ai_summary = _mock_student_summary(case)
    else:
        student_prompt = (
            f"Medical education case for student learning.\n"
            f"Disease: {case['disease']}\n"
            f"Treatment: {case['treatment_done']}\n"
            f"Medicines: {', '.join(case['medicines'])}\n"
            f"Outcome: {case['outcome']}\n"
            f"Success Rate: {case['success_rate']}\n\n"
            "Provide a 3-4 sentence educational summary explaining: "
            "1) why this treatment was chosen, 2) how the primary medicine works, "
            "3) key clinical lessons from the treatment outcome. For educational use only."
        )
        try:
            # Try Groq first (fast + free), then Gemini as fallback
            if _has_grok_key():
                ai_summary = _grok_generate(student_prompt)
            elif _has_gemini_key():
                ai_summary = _gemini_generate(student_prompt)
            else:
                ai_summary = _mock_student_summary(case)
        except Exception:
            try:
                ai_summary = _gemini_generate(student_prompt)
            except Exception:
                ai_summary = _mock_student_summary(case)

    _log_student_session(session["user_email"], case["case_id"], case["category"])
    return jsonify({
        "inputId": qr_data,
        "inputType": qr_type,
        "patientId": patient_id,
        "patient": patient,
        "case": case,
        "hospitalStyleReport": hospital_style_report,
        "ai_summary": ai_summary,
        "resources": resources,
        "generatedAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    })


@app.route("/api/student/patient-qr-list", methods=["GET"])
def student_patient_qr_list():
    if _auth_required():
        return jsonify({"error": "Unauthorized"}), 401
    if session.get("user_role") != "student":
        return jsonify({"error": "Access restricted to students"}), 403

    items = []
    for pid in sorted(MOCK_PATIENTS.keys()):
        p = MOCK_PATIENTS[pid]
        qr_url = f"https://api.qrserver.com/v1/create-qr-code/?size=160x160&data={quote(pid)}"
        items.append({
            "patient_id": pid,
            "name": p.get("name"),
            "diagnosis": p.get("diagnosis"),
            "qr_data": pid,
            "qr_url": qr_url,
        })
    return jsonify({"patients": items, "count": len(items)})


@app.route("/api/student/daily-contest", methods=["GET"])
def student_daily_contest():
    if _auth_required():
        return jsonify({"error": "Unauthorized"}), 401
    if session.get("user_role") != "student":
        return jsonify({"error": "Access restricted to students"}), 403

    email = session["user_email"]
    categories = _get_student_recent_categories(email, days=1)
    if not categories:
        categories = list(MOCK_CONTEST_QUESTIONS.keys())[:2]
    questions = _build_contest_questions(categories, count=5)
    return jsonify({"questions": questions, "type": "daily", "categories": categories})


@app.route("/api/student/weekly-contest", methods=["GET"])
def student_weekly_contest():
    if _auth_required():
        return jsonify({"error": "Unauthorized"}), 401
    if session.get("user_role") != "student":
        return jsonify({"error": "Access restricted to students"}), 403

    email = session["user_email"]
    categories = _get_student_recent_categories(email, days=7)
    if not categories:
        categories = list(MOCK_CONTEST_QUESTIONS.keys())
    questions = _build_contest_questions(categories, count=10)
    return jsonify({"questions": questions, "type": "weekly", "categories": categories})


@app.route("/api/student/submit-contest", methods=["POST"])
def student_submit_contest():
    if _auth_required():
        return jsonify({"error": "Unauthorized"}), 401
    if session.get("user_role") != "student":
        return jsonify({"error": "Access restricted to students"}), 403

    payload = request.get_json(silent=True) or {}
    contest_type = _clean_text(payload.get("type", "daily"))
    answers = payload.get("answers", {})
    categories = payload.get("categories", [])

    if contest_type not in ("daily", "weekly"):
        return jsonify({"error": "Invalid contest type"}), 400

    count = 5 if contest_type == "daily" else 10
    full_questions = _get_answer_key(categories, count)

    results = []
    score = 0
    for i, q in enumerate(full_questions):
        user_ans = answers.get(str(i))
        correct = q["answer"]
        is_correct = user_ans == correct
        if is_correct:
            score += 1
        results.append({
            "q": q["q"],
            "options": q["options"],
            "correct": correct,
            "selected": user_ans,
            "isCorrect": is_correct,
            "explanation": q["explanation"],
        })

    conn = sqlite3.connect(DB_PATH)
    try:
        conn.execute(
            "INSERT INTO student_contest_log (email, contest_type, score, total, taken_at) VALUES (?, ?, ?, ?, ?)",
            (session["user_email"], contest_type, score, len(full_questions), datetime.now().isoformat()),
        )
        conn.commit()
    finally:
        conn.close()

    return jsonify({"score": score, "total": len(full_questions), "results": results})


@app.route("/api/student/save-note", methods=["POST"])
def student_save_note():
    if _auth_required():
        return jsonify({"error": "Unauthorized"}), 401
    if session.get("user_role") != "student":
        return jsonify({"error": "Access restricted to students"}), 403

    payload = request.get_json(silent=True) or {}
    case_id = _clean_text(payload.get("case_id", ""))
    title = _clean_text(payload.get("title", ""))
    category = _clean_text(payload.get("category", "General"))
    content = payload.get("content", "")

    if not title or not content:
        return jsonify({"error": "title and content are required"}), 400

    conn = sqlite3.connect(DB_PATH)
    try:
        conn.execute(
            "INSERT INTO student_notes (email, case_id, title, category, content, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (session["user_email"], case_id, title, category, content, datetime.now().isoformat()),
        )
        conn.commit()
    finally:
        conn.close()
    return jsonify({"message": "Note saved successfully"})


@app.route("/api/student/get-notes", methods=["GET"])
def student_get_notes():
    if _auth_required():
        return jsonify({"error": "Unauthorized"}), 401
    if session.get("user_role") != "student":
        return jsonify({"error": "Access restricted to students"}), 403

    conn = sqlite3.connect(DB_PATH)
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, case_id, title, category, content, created_at FROM student_notes WHERE email = ? ORDER BY created_at DESC",
            (session["user_email"],),
        )
        notes = [
            {"id": r[0], "case_id": r[1], "title": r[2], "category": r[3], "content": r[4], "created_at": r[5]}
            for r in cursor.fetchall()
        ]
    finally:
        conn.close()
    return jsonify({"notes": notes})


@app.route("/api/student/download-note/<int:note_id>", methods=["GET"])
def student_download_note(note_id: int):
    if _auth_required():
        return redirect(url_for("home"))
    if session.get("user_role") != "student":
        return jsonify({"error": "Access restricted to students"}), 403

    conn = sqlite3.connect(DB_PATH)
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT title, category, content, created_at FROM student_notes WHERE id = ? AND email = ?",
            (note_id, session["user_email"]),
        )
        row = cursor.fetchone()
    finally:
        conn.close()

    if not row:
        return jsonify({"error": "Note not found"}), 404

    title, category, content, created_at = row
    text_out = (
        f"MedLearn Student Note\n"
        f"{'=' * 50}\n"
        f"Title   : {title}\n"
        f"Category: {category}\n"
        f"Date    : {created_at[:10]}\n"
        f"{'=' * 50}\n\n"
        f"{content}\n"
    )
    from flask import Response
    safe_name = re.sub(r"[^A-Za-z0-9_-]", "_", f"{category}_{title[:25]}")
    return Response(
        text_out,
        mimetype="text/plain",
        headers={"Content-Disposition": f"attachment; filename={safe_name}.txt"},
    )


@app.route("/api/student/delete-note/<int:note_id>", methods=["DELETE"])
def student_delete_note(note_id: int):
    if _auth_required():
        return jsonify({"error": "Unauthorized"}), 401
    if session.get("user_role") != "student":
        return jsonify({"error": "Access restricted to students"}), 403

    conn = sqlite3.connect(DB_PATH)
    try:
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM student_notes WHERE id = ? AND email = ?",
            (note_id, session["user_email"]),
        )
        conn.commit()
        deleted = cursor.rowcount
    finally:
        conn.close()

    if not deleted:
        return jsonify({"error": "Note not found"}), 404
    return jsonify({"message": "Note deleted"})


# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# HOSPITAL NETWORK - PATIENT LOOKUP BY ID
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

@app.route("/api/student/get-patient/<patient_id>", methods=["GET"])
def student_get_patient(patient_id: str):
    """Fetch patient data by patient ID from hospital network."""
    if _auth_required():
        return jsonify({"error": "Unauthorized"}), 401
    if session.get("user_role") != "student":
        return jsonify({"error": "Access restricted to students"}), 403

    patient_id = _clean_text(patient_id.upper())
    
    if patient_id not in MOCK_PATIENTS:
        return jsonify({"error": "Patient not found in hospital database"}), 404
    
    patient = MOCK_PATIENTS[patient_id]
    
    # Get the associated case data
    case_id = patient.get("primary_case")
    case_data = MOCK_PATIENT_CASES.get(case_id, {})
    hospital_style_report = _build_hospital_style_report_from_patient(patient_id, patient)
    
    return jsonify({
        "patient": patient,
        "case": case_data,
        "hospital_style_report": hospital_style_report,
        "access_timestamp": datetime.now().isoformat(),
        "hospital_network": "Central Medical Hospital Network",
    })


@app.route("/api/student/search-patients", methods=["GET"])
def student_search_patients():
    """Search patients by name or MRN in hospital network."""
    if _auth_required():
        return jsonify({"error": "Unauthorized"}), 401
    if session.get("user_role") != "student":
        return jsonify({"error": "Access restricted to students"}), 403
    
    query = request.args.get("q", "").lower().strip()
    
    if not query:
        # Return all patients if no query
        patients_list = [
            {
                "patient_id": p.get("patient_id"),
                "name": p.get("name"),
                "mrn": p.get("mrn"),
                "age": p.get("age"),
                "diagnosis": p.get("diagnosis"),
            }
            for p in MOCK_PATIENTS.values()
        ]
        return jsonify({"patients": patients_list})
    
    # Search by name or MRN
    results = []
    for patient in MOCK_PATIENTS.values():
        name_match = query in patient.get("name", "").lower()
        mrn_match = query in patient.get("mrn", "").lower()
        
        if name_match or mrn_match:
            results.append({
                "patient_id": patient.get("patient_id"),
                "name": patient.get("name"),
                "mrn": patient.get("mrn"),
                "age": patient.get("age"),
                "diagnosis": patient.get("diagnosis"),
            })
    
    return jsonify({"patients": results, "query": query, "count": len(results)})


@app.route("/api/student/patient-learning/<patient_id>", methods=["GET"])
def student_patient_learning(patient_id: str):
    """Get AI-generated learning summary for a patient case."""
    if _auth_required():
        return jsonify({"error": "Unauthorized"}), 401
    if session.get("user_role") != "student":
        return jsonify({"error": "Access restricted to students"}), 403
    
    patient_id = _clean_text(patient_id.upper())
    
    if patient_id not in MOCK_PATIENTS:
        return jsonify({"error": "Patient not found"}), 404
    
    patient = MOCK_PATIENTS[patient_id]
    case_id = patient.get("primary_case")
    case_data = MOCK_PATIENT_CASES.get(case_id, {})
    hospital_style_report = _build_hospital_style_report_from_patient(patient_id, patient)
    
    # Generate AI learning summary using Gemini
    prompt = f"""You are a medical education expert. Provide a concise clinical learning summary for:

Patient: {patient.get('name')}, {patient.get('age')} y/o {patient.get('gender')}
Diagnosis: {hospital_style_report.get('diagnosis')}
Treatment Categories: {', '.join(hospital_style_report.get('treatmentCategories', []))}
Medical Tests: {str(hospital_style_report.get('medicalTests', {}))}
Treatment Done: {str(hospital_style_report.get('treatmentDone', []))}
Current Status: {hospital_style_report.get('currentStatus')}

Focus on:
1. Clinical reasoning (why this treatment?)
2. Key learning points for medical students
3. Important lab value interpretation
4. Next steps in management

Keep it educational and concise (max 300 words)."""
    
    try:
        # Try Groq first (fast + free), then Gemini, then mock
        if _has_grok_key():
            ai_summary = _grok_generate(prompt)
            source = "Groq AI (Llama 3.3)"
        else:
            ai_summary = _gemini_generate(prompt)
            source = "Gemini AI"
    except Exception as e:
        try:
            ai_summary = _gemini_generate(prompt)
            source = "Gemini AI (fallback)"
        except Exception:
            ai_summary = _mock_student_summary(case_data)
            source = f"Mock (AI unavailable: {str(e)[:50]})"
    
    # Log the session
    conn = sqlite3.connect(DB_PATH)
    try:
        conn.execute(
            "INSERT INTO student_sessions (email, case_id, category, scanned_at) VALUES (?, ?, ?, ?)",
            (session["user_email"], case_id, case_data.get("category", "General"), datetime.now().isoformat()),
        )
        conn.commit()
    finally:
        conn.close()
    
    return jsonify({
        "patient_id": patient_id,
        "diagnosis": patient.get("diagnosis"),
        "hospital_style_report": hospital_style_report,
        "treatment_categories": hospital_style_report.get("treatmentCategories", []),
        "current_status": hospital_style_report.get("currentStatus"),
        "ai_summary": ai_summary,
        "ai_source": source,
        "vital_signs": patient.get("vital_signs"),
        "recent_labs": patient.get("recent_labs"),
        "current_medications": patient.get("current_medications"),
        "procedures": patient.get("procedures"),
        "case_id": case_id,
        "case_data": case_data,
        "resources": LEARNING_RESOURCES.get(case_data.get("category", "General"), {}),
    })


# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# STUDENT MEDICAL AI CHATBOT
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

CHAT_SYSTEM_PROMPT = (
    "You are MedBot, a helpful AI assistant for medical students. "
    "You help students learn medicine, pharmacology, clinical reasoning, anatomy, "
    "pathophysiology, and evidence-based practice. "
    "You explain complex medical concepts clearly, suggest relevant study resources, "
    "and answer questions about diseases, drugs, procedures, and clinical cases. "
    "Always remind students that your answers are for educational purposes only "
    "and should not replace clinical judgment or professional medical advice. "
    "Be concise but thorough. Use bullet points and structured explanations where helpful."
)


def _gemini_chat(messages: List[Dict]) -> str:
    """Send multi-turn chat to Gemini using contents array."""
    api_key = (GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")).strip()
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set")

    models = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
    ]

    # Build Gemini contents array from chat history
    contents = []
    # Inject system prompt as first user turn (Gemini REST doesn't have system role)
    contents.append({
        "role": "user",
        "parts": [{"text": f"[SYSTEM INSTRUCTION]\n{CHAT_SYSTEM_PROMPT}\n\nAcknowledge and begin."}]
    })
    contents.append({
        "role": "model",
        "parts": [{"text": "Understood. I am MedBot, your medical education assistant. Ask me anything about medicine, pharmacology, clinical cases, or study topics!"}]
    })

    for msg in messages:
        role = "user" if msg["role"] == "user" else "model"
        contents.append({"role": role, "parts": [{"text": msg["content"]}]})

    payload = {
        "contents": contents,
        "generationConfig": {"temperature": 0.3, "maxOutputTokens": 800},
        "safetySettings": [
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_ONLY_HIGH"},
        ],
    }

    last_error = None
    for model in models:
        url = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            f"{model}:generateContent?key={api_key}"
        )
        try:
            response = requests.post(url, json=payload, timeout=45)
            response.raise_for_status()
            data = response.json()
            candidates = data.get("candidates", [])
            if not candidates:
                raise RuntimeError("Gemini returned no candidates")
            parts = candidates[0].get("content", {}).get("parts", [])
            text = "\n".join(p.get("text", "") for p in parts if "text" in p).strip()
            if not text:
                raise RuntimeError("Gemini returned empty content")
            return text
        except requests.HTTPError as exc:
            last_error = exc
            if getattr(exc.response, "status_code", None) == 404:
                continue
            raise

    if last_error:
        raise last_error
    raise RuntimeError("Gemini chat request failed")


def _groq_chat(messages: List[Dict]) -> str:
    """Send multi-turn chat to Groq API (llama-3.3-70b-versatile)."""
    api_key = (GROQ_API_KEY or os.getenv("GROQ_API_KEY", "")).strip()
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is not set")

    # Build messages array with system prompt first
    groq_messages = [
        {"role": "system", "content": CHAT_SYSTEM_PROMPT}
    ]
    for msg in messages:
        role = "user" if msg["role"] == "user" else "assistant"
        groq_messages.append({"role": role, "content": msg["content"]})

    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": groq_messages,
        "temperature": 0.3,
        "max_tokens": 800,
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    response = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers=headers, json=payload, timeout=45
    )
    response.raise_for_status()
    data = response.json()
    choices = data.get("choices", [])
    if not choices:
        raise RuntimeError("Groq returned no choices")
    content = choices[0].get("message", {}).get("content", "").strip()
    if not content:
        raise RuntimeError("Groq returned empty content")
    return content


def _mock_chat_reply(user_message: str) -> str:
    """Fallback mock reply when AI is unavailable."""
    msg = user_message.lower()
    if any(w in msg for w in ["diabetes", "metformin", "hba1c", "insulin"]):
        return (
            "**Diabetes â€“ Key Learning Points**\n\n"
            "â€¢ Type 2 DM: insulin resistance + relative insulin deficiency\n"
            "â€¢ First-line: **Metformin** â€“ reduces hepatic glucose output, improves insulin sensitivity\n"
            "â€¢ Target HbA1c: <7.0% for most non-pregnant adults (ADA 2024)\n"
            "â€¢ Add SGLT-2 inhibitor or GLP-1 agonist if CVD risk present\n\n"
            "_This is an educational summary. Always verify with current guidelines._"
        )
    if any(w in msg for w in ["pneumonia", "cxr", "chest x-ray", "cap", "antibiotic"]):
        return (
            "**Community-Acquired Pneumonia (CAP)**\n\n"
            "â€¢ Most common organism: *Streptococcus pneumoniae*\n"
            "â€¢ Severity scoring: **CURB-65** (Confusion, Urea >7, RRâ‰¥30, BP<90/60, Ageâ‰¥65)\n"
            "â€¢ Outpatient: Amoxicillin or Azithromycin\n"
            "â€¢ Inpatient (non-ICU): Beta-lactam + macrolide\n\n"
            "_For educational use only._"
        )
    if any(w in msg for w in ["heart", "stemi", "mi", "myocardial", "ecg", "troponin"]):
        return (
            "**STEMI â€“ Rapid Review**\n\n"
            "â€¢ ECG: ST elevation â‰¥1mm in â‰¥2 contiguous leads\n"
            "â€¢ Biomarker: Troponin I/T (rises 2-4h, peaks 24h)\n"
            "â€¢ Treatment: Primary PCI within 90 min (door-to-balloon)\n"
            "â€¢ Medications: Aspirin + P2Y12 inhibitor + High-intensity statin + ACE inhibitor\n\n"
            "_Educational content only._"
        )
    if any(w in msg for w in ["kidney", "ckd", "egfr", "creatinine", "renal"]):
        return (
            "**Chronic Kidney Disease (CKD)**\n\n"
            "â€¢ KDIGO stages: G1 (â‰¥90) â†’ G5 (<15) based on eGFR mL/min/1.73mÂ²\n"
            "â€¢ Best renoprotection: **ACE inhibitor or ARB** (reduces proteinuria + slows progression)\n"
            "â€¢ Monitor: eGFR, potassium, BP, urine albumin-to-creatinine ratio\n"
            "â€¢ Avoid nephrotoxins: NSAIDs, IV contrast (precautions), aminoglycosides\n\n"
            "_For educational purposes._"
        )
    if any(w in msg for w in ["depress", "ssri", "phq", "mdd", "mental", "anxiety"]):
        return (
            "**Major Depressive Disorder (MDD)**\n\n"
            "â€¢ DSM-5: â‰¥5 symptoms for â‰¥2 weeks (must include depressed mood or anhedonia)\n"
            "â€¢ PHQ-9 screening: 10-14 = moderate depression\n"
            "â€¢ First-line: **SSRI** (e.g., Escitalopram, Sertraline) + psychotherapy\n"
            "â€¢ CBT equally effective as pharmacotherapy in mild-moderate MDD\n\n"
            "_Educational use only. Please refer to clinical guidelines._"
        )
    return (
        "I'm **MedBot** â€“ your medical education assistant!\n\n"
        "I can help you with:\n"
        "â€¢ ðŸ“š Disease pathophysiology & clinical features\n"
        "â€¢ ðŸ’Š Pharmacology & drug mechanisms\n"
        "â€¢ ðŸ¥ Diagnostic workup & clinical reasoning\n"
        "â€¢ ðŸ“Š Lab interpretation & ECG basics\n"
        "â€¢ ðŸ“ Exam preparation tips\n\n"
        "Try asking about: diabetes, pneumonia, STEMI, CKD, or depression!\n\n"
        "_Note: AI may be temporarily unavailable â€“ showing built-in responses._"
    )


@app.route("/api/student/chat", methods=["POST"])
def student_chat():
    """Medical AI chatbot endpoint powered by Groq (Llama 3.3) with Gemini fallback."""
    if _auth_required():
        return jsonify({"error": "Unauthorized"}), 401
    if session.get("user_role") != "student":
        return jsonify({"error": "Access restricted to students"}), 403

    payload = request.get_json(silent=True) or {}
    messages = payload.get("messages", [])  # [{"role": "user"|"assistant", "content": str}]

    if not messages:
        return jsonify({"error": "messages array is required"}), 400

    # Validate message structure - prevent prompt injection via oversized inputs
    for m in messages:
        if not isinstance(m, dict):
            return jsonify({"error": "Invalid message format"}), 400
        role = m.get("role", "")
        content = m.get("content", "")
        if role not in ("user", "assistant"):
            return jsonify({"error": "Message role must be user or assistant"}), 400
        if not isinstance(content, str) or len(content) > 2000:
            return jsonify({"error": "Message content must be a string under 2000 characters"}), 400

    # Cap history to last 20 messages to avoid token overflow
    messages = messages[-20:]

    last_user = next(
        (m["content"] for m in reversed(messages) if m["role"] == "user"), ""
    )

    # Try Groq first (fast + free), then Gemini, then mock
    try:
        reply = _groq_chat(messages)
        source = "âš¡ Groq AI (Llama 3.3)"
    except Exception as groq_exc:
        try:
            reply = _gemini_chat(messages)
            source = "âœ¨ Gemini AI (fallback)"
        except Exception:
            reply = _mock_chat_reply(last_user)
            source = f"Built-in (AI unavailable: {str(groq_exc)[:50]})"

    return jsonify({
        "reply": reply,
        "source": source,
        "timestamp": datetime.now().strftime("%H:%M"),
    })


if __name__ == "__main__":
    _init_db()
    port = int(os.getenv("PORT", "5001"))
    print("=" * 64)
    print("Medical AI Prototype Server")
    print(f"Running on http://127.0.0.1:{port}")
    print("Use provider=mock for demo without API keys")
    print("Set GEMINI_API_KEY or GROQ_API_KEY for live LLM")
    print("=" * 64)
    app.run(host="0.0.0.0", port=port, debug=False)

/**
 * DISEASE EDUCATIONAL & CLINICAL DETAILS DATABASE
 * 
 * This file contains complete educational materials and clinical guidelines
 * for all diseases in the MediScan AI system.
 * 
 * Structure:
 * - DISEASE_DETAILS: Main object containing all disease information
 * - Each disease has: name, studyGuide (for students), doctorGuide (for doctors)
 * - studyGuide: Pathophysiology, types, diagnostics, treatment, risk factors
 * - doctorGuide: Medications, clinical do's, don'ts, treatment protocols
 */

const DISEASE_DETAILS = {
    // ==================== PNEUMONIA ====================
    pneumonia: {
        name: "Pneumonia",
        icon: "🫁",
        category: "Respiratory",
        studyGuide: {
            title: "Pneumonia - Medical Study Guide",
            pathophysiology: "Pneumonia is an acute lung infection causing alveoli inflammation and fluid/pus buildup. Pathogens (bacteria, viruses, fungi) reach the lower respiratory tract, often via inhalation, causing inflammation and filling the air sacs (alveoli) with exudate, which impairs gas exchange.",
            types: [
                "Community-Acquired (CAP): Contracted outside healthcare settings",
                "Hospital-Acquired (HAP): Acquired during a hospital stay",
                "Bacterial: Common, often severe (e.g., Streptococcus pneumoniae)",
                "Viral: Common, typically milder (COVID-19, Influenza, RSV)",
                "Fungal: Rare, often in immunocompromised individuals"
            ],
            diagnosticMethods: [
                "Imaging: Chest X-ray (gold standard for confirming infiltrates/consolidation) or CT scan",
                "Laboratory Tests: Blood tests (CBC) to check WBC count and C-reactive protein (CRP)",
                "Microbiology: Sputum culture or molecular panels (BioFire) to identify pathogen",
                "Oxygen Level: Pulse oximetry to detect low blood oxygen"
            ],
            clinicalPresentation: "Common symptoms include fever, cough (productive or dry), dyspnea (shortness of breath), and fatigue. Physical examination may reveal crackles, rales, or diminished breath sounds.",
            treatmentProtocols: [
                "Antibiotics: Required for bacterial pneumonia (5-7 day course)",
                "Antivirals: Used for specific viral causes like influenza or SARS-CoV-2",
                "Supportive Care: Oxygen therapy, fever reducers, and hydration"
            ],
            riskFactors: "Individuals over 65, infants, and those with weakened immune systems or chronic diseases (COPD) are at highest risk.",
            referenceLink: "https://ieeexplore.ieee.org/document/9445310"
        },
        doctorGuide: {
            title: "Pneumonia - Clinical Management Guide",
            allergiesNotice: "Always check patient allergies before prescribing",
            antibiotics: {
                firstLine: [
                    "Amoxicillin",
                    "Azithromycin",
                    "Clarithromycin",
                    "Levofloxacin",
                    "Doxycycline"
                ],
                secondLine: [
                    "Ceftriaxone",
                    "Vancomycin (for MRSA coverage when indicated)",
                    "Meropenem (for severe or resistant infections)"
                ]
            },
            antibiotiicSelectionGuidance: "Selection should be guided by clinical severity, local antibiogram, comorbidities, and suspected pathogen.",
            clinicalDos: [
                "✓ Ensure completion of the full antimicrobial course",
                "✓ Encourage adequate rest to reduce metabolic demand",
                "✓ Maintain optimal hydration to aid mucus clearance",
                "✓ Supportive care: humidification, steam inhalation, symptom control",
                "✓ Allow graded mobilization as tolerated",
                "✓ Promote nutritionally adequate diet",
                "✓ Schedule follow-up evaluation to confirm clinical and radiological resolution"
            ],
            clinicalDonts: [
                "✗ Avoid smoking and secondhand smoke exposure",
                "✗ Do not discontinue antibiotics prematurely",
                "✗ Avoid unnecessary cough suppression unless clinically indicated",
                "✗ Prevent early return to strenuous activity",
                "✗ Avoid alcohol due to immune suppression and drug interactions"
            ],
            followUp: "Confirm clinical and radiological resolution after 2-4 weeks",
            hospitalizationIndicators: "O2 saturation <90%, altered mental status, RR >30, systolic BP <90"
        }
    },

    // ==================== LUNG CANCER ====================
    lung: {
        name: "Lung Cancer",
        icon: "🫁",
        category: "Oncology",
        studyGuide: {
            title: "Lung Cancer - Medical Study Guide",
            overview: "Lung cancer studies focus on early detection, molecular profiling, and personalized therapies. Smoking causes up to 90% of cases. The two main types are Small Cell (SCLC) and Non-Small Cell (NSCLC).",
            epidemiology: "Leading cause of cancer deaths worldwide with 2.5 million new cases in 2022. While traditionally associated with older men (average age 70), it is rising in non-smokers and women due to genetic mutations.",
            diagnosticTechniques: [
                "Imaging: CT scans, PET scans, and MRIs visualize tumors",
                "Biopsy: Bronchoscopy, needle biopsy, and thoracentesis obtain tissue samples",
                "Molecular Testing: Identifying genetic mutations (e.g., EGFR) is crucial for targeted treatment"
            ],
            innovativeApproaches: [
                "Liquid biopsies: Blood tests for tumor DNA",
                "VOC detection: Volatile organic compound detection in breath for non-invasive, early diagnosis"
            ],
            treatmentAdvancements: [
                "Targeted Therapy & Immunotherapy: Focus on specific molecular markers, particularly for NSCLC",
                "Surgery & Radiotherapy: Primary treatments for early-stage localized disease (52% 5-year survival if detected early)",
                "AI Integration: Machine learning algorithms improve CT scan interpretation accuracy"
            ],
            mainCauses: [
                "Tobacco Smoke: Responsible for up to 90% of cases",
                "Radon Gas: Second leading cause",
                "Environmental/Occupational: Asbestos, air pollution, arsenic exposure"
            ],
            referenceLink: "https://ieeexplore.ieee.org/document/8402427"
        },
        doctorGuide: {
            title: "Lung Cancer - Clinical Management Guide",
            targetedTherapies: {
                egfr_mutations: ["Osimertinib", "Gefitinib", "Afatinib", "Erlotinib", "Lazertinib"],
                alk_ros1: ["Alectinib", "Brigatinib", "Ceritinib", "Lorlatinib", "Crizotinib"],
                her2_met_ret: ["Amivantamab", "Capmatinib", "Selpercatinib", "Pralsetinib"]
            },
            immunotherapy: ["Pembrolizumab", "Atezolizumab", "Durvalumab", "Nivolumab", "Ipilimumab"],
            chemotherapy: ["Cisplatin", "Carboplatin", "Pemetrexed", "Gemcitabine", "Vinorelbine", "Paclitaxel", "Docetaxel"],
            antiAngiogenic: ["Bevacizumab", "Ramucirumab"],
            clinicalDos: [
                "✓ Enforce complete smoking cessation",
                "✓ Ensure adequate caloric and protein intake",
                "✓ Encourage light physical activity to reduce cancer-related fatigue",
                "✓ Monitor for treatment toxicity and disease progression",
                "✓ Provide psychosocial and palliative support",
                "✓ Minimize exposure to environmental pollutants"
            ],
            clinicalDonts: [
                "✗ No tobacco or secondhand smoke exposure",
                "✗ Avoid unnecessary weight loss",
                "✗ Avoid raw or high-infection-risk foods during immunosuppression",
                "✗ Do not ignore new or worsening symptoms",
                "✗ Avoid excessive physical or emotional stress"
            ]
        }
    },

    // ==================== COVID-19 ====================
    tb_covid: {
        name: "TB & COVID-19",
        icon: "🦠",
        category: "Infectious",
        studyGuide: {
            title: "COVID-19 & TB - Medical Study Guide",
            covidOverview: "Medical studies establish that COVID-19 has a median incubation period of 5.1 days, with symptoms often appearing within 11.5 days. Severity ranges from asymptomatic (17.9-33.3%) to severe (approx. 23%).",
            covidSymptoms: "Fever, cough, and shortness of breath. Laboratory findings frequently show lymphopenia (47.6%), elevated C-reactive protein (65.9%), and increased cardiac enzymes (49.4%).",
            covidComplications: "About 23% experience severe disease. The mortality rate is estimated around 6%. Long-term effects include increased risks of adverse health outcomes.",
            tbOverview: "TB is the leading infectious cause of death with 1.25 million deaths in 2023. Research emphasizes controlling drug-resistant TB (MDR-TB) and improving rapid diagnostics.",
            tbEpidemiology: "TB remains a top global killer with 10.7 million people falling ill in 2024. In high-burden regions like India, latent TB infection (TBI) prevalence is 36-41%.",
            diagnosticAdvancements: [
                "Molecular techniques: Line Probe Assays (LPA) and NAATs crucial for rapid detection",
                "GenoType MTBDRsl: For detecting fluoroquinolone resistance"
            ],
            referenceLink: "https://ieeexplore.ieee.org/document/9336799"
        },
        doctorGuide: {
            title: "COVID-19 & TB - Clinical Management Guide",
            covidPhaseI: {
                phase: "Viral Replication Phase",
                medications: ["Paracetamol", "Montelukast + Levocetirizine", "Favipiravir", "Ivermectin (per protocol)"]
            },
            covidPhaseII: {
                phase: "Inflammatory Phase",
                medications: [
                    "Corticosteroids",
                    "Tocilizumab (with steroids, when indicated)",
                    "Anticoagulants",
                    "Baricitinib"
                ]
            },
            covidInfectionControl: {
                dos: [
                    "✓ Proper respiratory hygiene and cough etiquette",
                    "✓ Frequent hand hygiene",
                    "✓ Mask usage when symptomatic",
                    "✓ Physical distancing and crowd avoidance",
                    "✓ Adequate rest, hydration, and nutrition"
                ],
                donts: [
                    "✗ Avoid face touching",
                    "✗ No handshakes",
                    "✗ No public spitting",
                    "✗ Avoid self-medication",
                    "✗ Minimize contact with high-touch public surfaces"
                ]
            },
            tbFirstLineDrugs: [
                "Isoniazid",
                "Rifampicin / Rifampin",
                "Pyrazinamide",
                "Ethambutol",
                "Rifapentine (select regimens)"
            ],
            tbTreatmentConsiderations: {
                intensivePhase: "First 2 months",
                continuationPhase: "Minimum 4 months",
                pyridoxine: "Supplementation to prevent INH-induced neuropathy",
                drugResistantTB: "Requires extended regimens with bedaquiline"
            },
            tbDos: [
                "✓ Ensure strict adherence to treatment",
                "✓ Educate on cough hygiene and ventilation",
                "✓ Promote early screening for persistent symptoms",
                "✓ Encourage adequate nutrition",
                "✓ Ensure safe disposal of respiratory secretions"
            ],
            tbDonts: [
                "✗ No missed doses",
                "✗ Avoid smoking and alcohol",
                "✗ Limit public exposure until non-infectious",
                "✗ Do not discontinue therapy early"
            ],
            tbImportantNotes: [
                "Infectivity reduces after ~2 weeks of effective therapy",
                "TB does not spread via food or utensils",
                "Ensure BCG vaccination in endemic regions"
            ]
        }
    },

    // ==================== BREAST CANCER ====================
    breast: {
        name: "Breast Cancer",
        icon: "🎗️",
        category: "Oncology",
        studyGuide: {
            title: "Breast Cancer - Medical Study Guide",
            overview: "Breast cancer is where abnormal cells grow uncontrollably, often forming tumors in ducts or lobules. Most common in women over 50, but can affect younger women and, rarely, men.",
            typesAndSubtypes: [
                "Invasive Ductal Carcinoma (most common)",
                "Invasive Lobular Carcinoma",
                "Ductal Carcinoma In Situ (DCIS)",
                "Paget disease",
                "Inflammatory breast cancer"
            ],
            symptoms: [
                "A new lump or thickening in breast or underarm",
                "Change in breast size, shape, or appearance",
                "Dimpling, redness, or skin changes (orange peel texture)",
                "Nipple changes (inversion, discharge, or scaling)"
            ],
            diagnosis: "Doctors use mammograms, ultrasounds, MRIs, and biopsies to diagnose and stage.",
            treatmentOptions: [
                "Surgery: Lumpectomy or mastectomy",
                "Radiation Therapy: To destroy cancer cells",
                "Systemic Therapies: Chemotherapy, hormone therapy, targeted therapy, immunotherapy"
            ],
            riskFactors: "Increased age, genetic mutations, family history, and obesity",
            referenceLink: "https://ieeexplore.ieee.org/document/9077909"
        },
        doctorGuide: {
            title: "Breast Cancer - Clinical Management Guide",
            hormonalTherapy: {
                er_pr_positive: [
                    "Aromatase inhibitors: Letrozole, Anastrozole, Exemestane",
                    "SERMs: Tamoxifen",
                    "SERDs: Fulvestrant"
                ]
            },
            targetedTherapy: [
                "HER2-directed: Trastuzumab, Pertuzumab, Kadcyla, Enhertu",
                "CDK4/6 inhibitors: Palbociclib, Ribociclib, Abemaciclib",
                "PIK3CA inhibitor: Alpelisib"
            ],
            chemotherapy: ["Taxanes", "Anthracyclines", "Capecitabine", "Carboplatin", "Gemcitabine"],
            boneTa rgetedTherapy: ["Denosumab", "Bisphosphonates"],
            clinicalDos: [
                "✓ Routine screening and early detection",
                "✓ Weight management and physical activity",
                "✓ Limit alcohol intake",
                "✓ Prompt evaluation of new breast symptoms",
                "✓ Psychological and survivorship support"
            ],
            clinicalDonts: [
                "✗ Avoid smoking",
                "✗ Do not ignore breast changes",
                "✗ Avoid unnecessary long-term hormone therapy",
                "✗ Ensure adherence to follow-up schedules",
                "✗ Avoid high-infection-risk foods during treatment"
            ]
        }
    },

    // ==================== BRAIN TUMOR ====================
    brain: {
        name: "Brain Tumor",
        icon: "🧠",
        category: "Neurology",
        studyGuide: {
            title: "Brain Tumor - Medical Study Guide",
            overview: "Brain tumor studies focus on diagnosis, classification, and treatment using advanced imaging (MRI, PET/CT) and molecular profiling to determine tumor grade (I-IV).",
            diagnosticsAndImaging: "MRI with contrast is the gold standard for locating and understanding tumor nature. Other tools include PET scans for metabolic activity and CT scans.",
            pathologyAndClassification: "Tumors classified by type, location, and malignancy, typically graded 1 (slow-growing) to 4 (aggressive).",
            molecularResearch: "Recent studies focus on genetic markers like IDH1 or IDH2 mutations in gliomas, allowing targeted therapies like vorasidenib.",
            treatmentModalities: "Surgery (resection), radiotherapy, and chemotherapy, often combined to improve survival.",
            technologicalAdvances: "AI and machine learning improve accuracy of tumor segmentation and classification.",
            epidemiology: "Non-malignant tumors more common in females; malignant tumors more prevalent in males.",
            referenceLink: "https://ieeexplore.ieee.org/document/8934561"
        },
        doctorGuide: {
            title: "Brain Tumor - Clinical Management Guide",
            chemotherapyAndTargeted: [
                "Temozolomide",
                "Lomustine",
                "PCV regimen",
                "Carmustine / Gliadel wafers",
                "Bevacizumab",
                "Vorasidenib, Tovorafenib (select cases)"
            ],
            supportiveMedications: [
                "Corticosteroids (e.g., Dexamethasone)",
                "Anti-epileptics (e.g., Levetiracetam)"
            ],
            clinicalDos: [
                "✓ Multidisciplinary neuro-oncology care",
                "✓ Close monitoring of neurological symptoms",
                "✓ Nutritional and hydration support",
                "✓ Skin care during radiotherapy",
                "✓ Psychological and social support"
            ],
            clinicalDonts: [
                "✗ Do not ignore neurological changes",
                "✗ Avoid alcohol and smoking",
                "✗ Restrict heavy physical activity post-surgery",
                "✗ Avoid unapproved supplements",
                "✗ Avoid skin trauma in irradiated areas"
            ]
        }
    },

    // ==================== BONE FRACTURE ====================
    bone: {
        name: "Bone Fracture",
        icon: "🦴",
        category: "Orthopedics",
        studyGuide: {
            title: "Bone Fracture - Medical Study Guide",
            overview: "Bone fractures are structural failures of the bone cortex caused by trauma or overuse, classified by complexity (complete/incomplete), displacement, and orientation.",
            classification: [
                "Complete/Incomplete: Bone fully separated or partially cracked",
                "Simple/Compound: Closed (skin intact) vs. Open (bone punctures skin)",
                "Stress Fracture: Small cracks from repetitive, overuse forces",
                "Pathological: Weakened bones (osteoporosis, cancer)"
            ],
            diagnosticImaging: "Plain radiography (X-ray) is primary; CT scans and bone scintigraphy for complex cases.",
            healingMechanism: "Four-stage process: haematoma formation, inflammatory response, callus formation, remodeling. Repairs ~90% of fractures successfully.",
            factorsAffectingHealing: [
                "Blood supply (most critical)",
                "Mechanical stability",
                "Nutrition",
                "Age"
            ],
            treatment: "Immobilization (casts, splints) common; surgery required for severe cases.",
            complications: ["Non-union (failure to heal)", "Infection", "Compartment syndrome"],
            referenceLink: "https://ieeexplore.ieee.org/document/9087067"
        },
        doctorGuide: {
            title: "Bone Fracture - Clinical Management Guide",
            painManagement: [
                "Acetaminophen",
                "NSAIDs (short-term use)",
                "Opioids (when indicated)"
            ],
            boneHealthSupport: [
                "Calcium and Vitamin D",
                "Osteoporosis therapy when applicable"
            ],
            fractureDos: [
                "✓ Immobilize the affected limb",
                "✓ Ice application and elevation",
                "✓ Timely orthopedic consultation",
                "✓ Maintain cast hygiene",
                "✓ Begin physiotherapy only when cleared"
            ],
            fractureDonts: [
                "✗ Do not attempt realignment",
                "✗ Avoid weight bearing prematurely",
                "✗ Monitor for neurovascular compromise",
                "✗ Avoid smoking and alcohol",
                "✗ Do not insert objects inside the cast"
            ]
        }
    },

    // ==================== EYE DISEASES ====================
    eye: {
        name: "Eye Diseases",
        icon: "👁️",
        category: "Ophthalmology",
        conditions: {
            // Age-Related Macular Degeneration
            amd: {
                name: "Age-Related Macular Degeneration (AMD)",
                studyGuide: {
                    title: "AMD - Medical Study Guide",
                    overview: "Leading cause of irreversible vision loss in people over 50. Characterized by breakdown of the macula with dry (80-85%) and wet (neovascular) forms.",
                    types: [
                        "Dry (Nonexudative): Drusen accumulation, retinal thinning, geographic atrophy",
                        "Wet (Exudative): Abnormal blood vessel growth, rapid severe vision loss"
                    ],
                    riskFactors: "Smoking (most consistent), age, genetics (CFH, ARMS2), hypertension, low antioxidant diet",
                    diagnosis: "OCT for high-resolution imaging; angiography to detect neovascularization",
                    treatmentAndManagement: [
                        "Wet AMD: Anti-VEGF injections (ranibizumab, aflibercept) highly effective",
                        "Dry AMD: No cure, but lifestyle changes and AREDS2 supplements help"
                    ],
                    prevalence: "5.4% in ages 60-64, over 23% in age 80+",
                    referenceLink: "https://ieeexplore.ieee.org/document/8741768"
                },
                doctorGuide: {
                    title: "AMD - Clinical Management",
                    management: [
                        "Anti-VEGF injections for wet AMD",
                        "Antioxidant supplements (AREDS formula)",
                        "Low-vision aids for vision support"
                    ],
                    dos: ["✓ Regular ophthalmic follow-up", "✓ Smoking cessation", "✓ Use Amsler grid for self-monitoring"],
                    donts: ["✗ Do not ignore sudden vision changes", "✗ Avoid smoking", "✗ Do not miss scheduled injections"]
                }
            },
            // Branch Retinal Vein Occlusion
            brvo: {
                name: "Branch Retinal Vein Occlusion (BRVO)",
                studyGuide: {
                    title: "BRVO - Medical Study Guide",
                    overview: "Common retinal vascular disease from blood flow obstruction at arteriovenous crossing, leading to retinal hemorrhage, ischemia, and macular edema.",
                    pathogenesis: "Retinal artery compresses vein at shared sheath, leading to thrombus and venous outflow obstruction",
                    keyRisks: "Hypertension (most significant), diabetes, smoking, high BMI",
                    presentation: "Sudden or gradual painless blurring or vision loss, often in one eye",
                    signs: "Retinal hemorrhages (flame-shaped/sectoral), cotton-wool spots, edema, tortuous veins",
                    complications: "Macular edema (common vision loss cause), retinal non-perfusion, neovascularization",
                    diagnosis: ["Fundoscopy visualization", "OCT for macular edema", "Fluorescein angiography"],
                    referenceLink: "https://ieeexplore.ieee.org/document/8299721"
                },
                doctorGuide: {
                    title: "BRVO - Clinical Management",
                    management: [
                        "Anti-VEGF: Intravitreal ranibizumab, aflibercept (standard of care)",
                        "Laser: Grid for chronic DME, panretinal for neovascularization",
                        "Steroid Implants: For persistent macular edema"
                    ],
                    dos: ["✓ Early ophthalmology consultation", "✓ Control systemic diseases"],
                    donts: ["✗ Do not delay treatment", "✗ Avoid poor glycemic & BP control"]
                }
            },
            // Cataracts
            cataract: {
                name: "Cataracts",
                studyGuide: {
                    title: "Cataracts - Medical Study Guide",
                    overview: "Leading cause of blindness worldwide, from progressive clouding of eye's lens due to protein breakdown from aging and oxidative stress.",
                    pathophysiology: "Oxidative stress reduces GSH levels and causes protein aggregation. Accelerated by aging, diabetes, UV, steroids.",
                    classification: "Lens Opacities Classification (LOCS III) grades nuclear, cortical, or posterior subcapsular types",
                    diagnosis: "Slit-lamp evaluation; Scheimpflug photography for objective 3D imaging",
                    treatment: "Phacoemulsification using ultrasound; FLACS for precision; premium IOLs for additional correction",
                    riskFactors: "Age (>50% in 74+), smoking, alcohol, metabolic disorders",
                    referenceLink: "https://ieeexplore.ieee.org/document/9938266"
                },
                doctorGuide: {
                    title: "Cataracts - Clinical Management",
                    management: [
                        "Phacoemulsification: Standard procedure",
                        "FLACS: Advanced femtosecond laser technique",
                        "Premium IOLs: Multifocal, trifocal, accommodating options"
                    ],
                    dos: ["✓ Regular eye check-ups", "✓ Post-operative care compliance"],
                    donts: ["✗ Do not self-medicate", "✗ Avoid rubbing after surgery"]
                }
            },
            // Diabetic Retinopathy
            dr: {
                name: "Diabetic Retinopathy (DR)",
                studyGuide: {
                    title: "DR - Medical Study Guide",
                    overview: "Leading cause of preventable blindness from microvascular retinal damage due to hyperglycemia and hypertension.",
                    pathophysiology: "Microvascular occlusion and capillary leakage, preceded by neurodegeneration. Early signs: microaneurysms; advanced: neovascularization.",
                    landmarkTrials: [
                        "DRS: Panretinal photocoagulation reduces severe vision loss by 50%+",
                        "ETDRS: Focal laser effective for diabetic macular edema",
                        "WESDR: Nearly 100% prevalence in Type 1 diabetes after 20 years"
                    ],
                    treatmentStrategies: [
                        "Anti-VEGF: Now standard, reverses not just halts vision loss",
                        "Laser: PRP for proliferative; micropulsed laser emerging"
                    ],
                    prevalence: "Affects ~1/3 of people with diabetes; 10% have vision-threatening disease",
                    conclusion: "Early detection and tight metabolic control critical for preventing blindness",
                    referenceLink: "https://ieeexplore.ieee.org/document/9277506"
                },
                doctorGuide: {
                    title: "DR - Clinical Management",
                    management: [
                        "Strict blood sugar control",
                        "Anti-VEGF injections",
                        "Laser photocoagulation"
                    ],
                    dos: ["✓ Annual dilated exam", "✓ Maintain HbA1c targets"],
                    donts: ["✗ Do not skip eye screening", "✗ Avoid poor diabetes control"]
                }
            },
            // Drusen
            drusen: {
                name: "Drusen",
                studyGuide: {
                    title: "Drusen - Medical Study Guide",
                    overview: "Yellow lipid-rich deposits between RPE and Bruch's membrane, primary marker for AMD. Large/soft drusen increase advanced AMD risk.",
                    composition: "Lipids, proteins, cellular debris from aging and poor waste clearance",
                    classification: [
                        "Hard: Small, distinct, normal aging",
                        "Soft: Larger, hazy, high progression risk",
                        "Reticular Pseudodrusen: Strongly associated with advanced AMD"
                    ],
                    riskAssociation: "Presence in central macula major indicator of intermediate-advanced AMD",
                    treatmentLimitations: "Laser treatment doesn't prevent progression or stop vision loss",
                    diagnosis: "Dilated exam, fundus photography, OCT",
                    referenceLink: "https://ieeexplore.ieee.org/document/6611266"
                },
                doctorGuide: {
                    title: "Drusen - Clinical Management",
                    management: ["Observation if asymptomatic", "Antioxidants if AMD-associated"],
                    dos: ["✓ Monitor vision regularly", "✓ Maintain healthy lifestyle"],
                    donts: ["✗ Do not panic", "✗ Avoid smoking", "✗ Do not neglect follow-ups"]
                }
            },
            // Glaucoma
            glaucoma: {
                name: "Glaucoma",
                studyGuide: {
                    title: "Glaucoma - Medical Study Guide",
                    overview: "Progressive neurodegenerative eye disease from optic nerve damage, often linked to high IOP. Leading cause of irreversible blindness.",
                    mechanisms: "Classified into open-angle (gradual, common) and angle-closure. Acquired loss of retinal ganglion cells.",
                    diagnosticTechniques: [
                        "Automated perimetry (visual field test)",
                        "OCT & HRT for structural measurements",
                        "Stereobiomicroscopy for optic disc assessment"
                    ],
                    pharmacology: [
                        "Prostaglandin analogues",
                        "Beta-blockers",
                        "Alpha-adrenergic agonists",
                        "Carbonic anhydrase inhibitors"
                    ],
                    prevalence: "1.62% of US adults; increases with age and comorbidities",
                    referenceLink: "https://ieeexplore.ieee.org/document/10073995"
                },
                doctorGuide: {
                    title: "Glaucoma - Clinical Management",
                    management: [
                        "Eye drops: First-line",
                        "Laser therapy",
                        "Surgical intervention if needed"
                    ],
                    dos: ["✓ Regular IOP monitoring", "✓ Medication compliance"],
                    donts: ["✗ Do not stop drops abruptly", "✗ Avoid steroid misuse"]
                }
            },
            // Hypertension (related to eye)
            hypertension_eye: {
                name: "Hypertensive Retinopathy",
                studyGuide: {
                    title: "Hypertensive Retinopathy - Medical Study Guide",
                    overview: "Systemic hypertension (BP ≥130/80) affects retinal vasculature, causing arteriolar narrowing and hemorrhages. Manages with lifestyle and medications.",
                    definition: "Stage 1: ≥130/80; Stage 2: ≥140/90",
                    pathophysiology: "Increased vascular resistance and cardiac output leading to vessel remodeling",
                    riskFactors: ["High sodium", "Obesity", "Smoking", "Alcohol", "Age >65"],
                    referenceLink: "https://ieeexplore.ieee.org/document/9673470"
                },
                doctorGuide: {
                    title: "Hypertensive Retinopathy - Clinical Management",
                    management: [
                        "Diuretics",
                        "ACE inhibitors",
                        "ARBs",
                        "Calcium Channel Blockers"
                    ],
                    target: "Blood pressure <130/80 mmHg"
                }
            },
            // Media Haze
            mediaHaze: {
                name: "Media Haze",
                studyGuide: {
                    title: "Media Haze - Medical Study Guide",
                    overview: "Opacity of eye's refractive media (cornea, lens, vitreous) causing blurred vision or blindness. Recent research emphasizes AI for objective classification.",
                    aiBasedDiagnosis: "CNNs achieve 97.2% accuracy (MobileNet); EfficientNetV2-L, VGG-16, ResNet152v2 improved detection",
                    clinicalGrading: "6-level (NIH) or 9-level (Miami) scales traditionally subjective; automated algorithms now objective",
                    ocrTechnology: "Measures vitreous cell density as objective biomarker",
                    causes: ["Cataracts", "Vitreous opacities", "Corneal edema"],
                    referenceLink: "https://ieeexplore.ieee.org/document/10903277"
                },
                doctorGuide: {
                    title: "Media Haze - Clinical Management",
                    management: ["Treat underlying cause", "Detailed slit-lamp exam"],
                    dos: ["✓ Identify and treat root cause"],
                    donts: ["✗ Do not delay diagnosis", "✗ Avoid self-medication"]
                }
            },
            // Pathological Myopia
            pathMyopia: {
                name: "Pathological Myopia",
                studyGuide: {
                    title: "Pathological Myopia - Medical Study Guide",
                    overview: "Severe progressive nearsightedness (often >-6.00D) from excessive ocular elongation causing degenerative damage. Leading cause of irreversible blindness.",
                    pathophysiology: "Extreme elongation causes severe thinning/stretching of retinal, choroidal, scleral layers",
                    complications: [
                        "Myopic Maculopathy: From tessellation to atrophy",
                        "Myopic CNV: Significant vision loss cause",
                        "Posterior Staphyloma: Characteristic protrusion",
                        "Tractional Maculopathy: Holes or detachment"
                    ],
                    diagnosis: ["OCT for macular detail", "Fundus exam for severity grading"],
                    epidemiology: "1-3% global; higher in Asian and younger populations",
                    referenceLink: "https://ieeexplore.ieee.org/document/9102787"
                },
                doctorGuide: {
                    title: "Pathological Myopia - Clinical Management",
                    management: [
                        "Anti-VEGF for myopic CNV",
                        "Surgery: Pars plana vitrectomy",
                        "Prevention: Low-dose atropine, special contact lenses"
                    ],
                    dos: ["✓ Frequent eye check-ups"],
                    donts: ["✗ Avoid eye trauma", "✗ Avoid excessive eye strain"]
                }
            },
            // Tessellation
            tessellation: {
                name: "Fundus Tessellation",
                studyGuide: {
                    title: "Tessellation - Medical Study Guide",
                    overview: "Ophthalmic condition where choroidal vessels are clearly visible, creating 'tigroid' or mosaic pattern. Marker of thinned choroid and early myopic maculopathy.",
                    prevalence: "43-94.35% in high myopia populations, particularly East Asian and elderly",
                    signOfThinning: "Indicates significantly thinner choroid and retina, especially in macular region",
                    progressionPattern: "Can progress from stable tessellation to sight-threatening severe maculopathies",
                    riskFactors: ["Older age", "Longer axial length", "Lower BMI", "Higher myopia"],
                    diagnosticTools: [
                        "Red-free fundus photography",
                        "OCT for choroidal thickness",
                        "Choroidal Vascularity Index (CVI)",
                        "AI automatic labeling"
                    ],
                    referenceLink: "https://ieeexplore.ieee.org/document/1672544"
                },
                doctorGuide: {
                    title: "Tessellation - Clinical Management",
                    management: [
                        "Regular monitoring",
                        "Manage associated myopia",
                        "Early treatment of complications"
                    ],
                    dos: ["✓ Monitor progression"],
                    donts: ["✗ Do not miss routine exams", "✗ Avoid over-treatment if asymptomatic"]
                }
            }
        }
    },

    // ==================== KIDNEY DISEASE ====================
    kidney: {
        name: "Kidney Disease",
        icon: "🫘",
        category: "Nephrology",
        studyGuide: {
            title: "Kidney Disease - Medical Study Guide",
            overview: "Chronic kidney disease (CKD) involves gradual loss of kidney function. Early detection prevents progression through lifestyle modifications and targeted interventions.",
            stages: [
                "Stage 1: GFR ≥90 (normal)",
                "Stage 2: GFR 60-89 (mild loss)",
                "Stage 3: GFR 30-59 (moderate loss)",
                "Stage 4: GFR 15-29 (severe loss)",
                "Stage 5: GFR <15 (kidney failure)"
            ],
            riskFactors: "Diabetes (35% of CKD), Hypertension (25%), Glomerulonephritis, Polycystic kidney disease",
            diagnosis: [
                "Serum creatinine & eGFR calculation",
                "Urine albumin-to-creatinine ratio",
                "Kidney ultrasound or biopsy if needed"
            ],
            management: "Blood pressure control, diabetes management, medications (ACE-I/ARB), low salt diet"
        },
        doctorGuide: {
            title: "Kidney Disease - Clinical Management",
            pharmacotherapy: [
                "ACE Inhibitors: Lisinopril, Enalapril",
                "ARBs: Losartan, Valsartan",
                "SGLT2 inhibitors: Empagliflozin, Dapagliflozin",
                "GLP-1 agonists: Semaglutide, Liraglutide"
            ],
            clinicalDos: [
                "✓ Regular monitoring of kidney function",
                "✓ Blood pressure <120/90 mmHg",
                "✓ Diabetes tight control",
                "✓ Referral to nephrology early"
            ],
            clinicalDonts: [
                "✗ Avoid NSAIDs",
                "✗ Limit sodium & potassium",
                "✗ Avoid nephrotoxic medications"
            ]
        }
    }
};

/**
 * HELPER FUNCTIONS FOR DISPLAYING DISEASE CONTENT
 */

/**
 * Get disease details for a specific disease
 * @param {string} disease - Disease key (e.g., 'pneumonia', 'brain', 'eye')
 * @returns {object} Disease details object or null if not found
 */
function getDiseaseDetails(disease) {
    return DISEASE_DETAILS[disease] || null;
}

/**
 * Get study guide for a disease
 * @param {string} disease - Disease key
 * @returns {object} Study guide object
 */
function getStudyGuide(disease) {
    const details = DISEASE_DETAILS[disease];
    if (details && details.studyGuide) return details.studyGuide;
    if (details && details.conditions) {
        // For eye diseases
        const conditionKey = Object.keys(details.conditions)[0];
        return details.conditions[conditionKey].studyGuide;
    }
    return null;
}

/**
 * Get doctor guide for a disease
 * @param {string} disease - Disease key
 * @returns {object} Doctor guide object
 */
function getDoctorGuide(disease) {
    const details = DISEASE_DETAILS[disease];
    if (details && details.doctorGuide) return details.doctorGuide;
    if (details && details.conditions) {
        const conditionKey = Object.keys(details.conditions)[0];
        return details.conditions[conditionKey].doctorGuide;
    }
    return null;
}

/**
 * Generate HTML for study guide display
 * @param {object} guide - Study guide object
 * @returns {string} HTML content
 */
function generateStudyGuideHTML(guide) {
    if (!guide) return '<p>Study guide not available</p>';
    
    let html = `<div class="study-guide">`;
    
    if (guide.title) html += `<h2>${guide.title}</h2>`;
    if (guide.overview) html += `<p><strong>Overview:</strong> ${guide.overview}</p>`;
    if (guide.pathophysiology) html += `<p><strong>Pathophysiology:</strong> ${guide.pathophysiology}</p>`;
    if (guide.types) html += `<p><strong>Types:</strong><ul>${guide.types.map(t => `<li>${t}</li>`).join('')}</ul></p>`;
    if (guide.diagnosticMethods) html += `<p><strong>Diagnostic Methods:</strong><ul>${guide.diagnosticMethods.map(d => `<li>${d}</li>`).join('')}</ul></p>`;
    if (guide.clinicalPresentation) html += `<p><strong>Clinical Presentation:</strong> ${guide.clinicalPresentation}</p>`;
    if (guide.treatmentProtocols) html += `<p><strong>Treatment:</strong><ul>${guide.treatmentProtocols.map(t => `<li>${t}</li>`).join('')}</ul></p>`;
    if (guide.riskFactors) html += `<p><strong>Risk Factors:</strong> ${guide.riskFactors}</p>`;
    if (guide.referenceLink) html += `<p><a href="${guide.referenceLink}" target="_blank">📖 Read Full Research Paper</a></p>`;
    
    html += `</div>`;
    return html;
}

/**
 * Generate HTML for doctor guide display
 * @param {object} guide - Doctor guide object
 * @returns {string} HTML content
 */
function generateDoctorGuideHTML(guide) {
    if (!guide) return '<p>Doctor guide not available</p>';
    
    let html = `<div class="doctor-guide">`;
    
    if (guide.title) html += `<h2>${guide.title}</h2>`;
    if (guide.antibiotics) {
        html += `<div class="clinical-section">
            <h3>💊 Antibiotics & Medications</h3>`;
        if (guide.antibiotics.firstLine) html += `<p><strong>First-Line:</strong><ul>${guide.antibiotics.firstLine.map(a => `<li>${a}</li>`).join('')}</ul></p>`;
        if (guide.antibiotics.secondLine) html += `<p><strong>Second-Line:</strong><ul>${guide.antibiotics.secondLine.map(a => `<li>${a}</li>`).join('')}</ul></p>`;
        html += `</div>`;
    }
    if (guide.clinicalDos) html += `<p><strong style="color: green;">✓ Clinical Do's:</strong><ul>${guide.clinicalDos.map(d => `<li>${d}</li>`).join('')}</ul></p>`;
    if (guide.clinicalDonts) html += `<p><strong style="color: red;">✗ Clinical Don'ts:</strong><ul>${guide.clinicalDonts.map(d => `<li>${d}</li>`).join('')}</ul></p>`;
    
    html += `</div>`;
    return html;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DISEASE_DETAILS,
        getDiseaseDetails,
        getStudyGuide,
        getDoctorGuide,
        generateStudyGuideHTML,
        generateDoctorGuideHTML
    };
}

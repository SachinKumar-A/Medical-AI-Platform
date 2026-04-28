// API Configuration for Python Backend
const API_CONFIG = {
    baseUrl: 'http://localhost:5000/api',
    endpoints: {
        predict: '/predict',
        health: '/health',
        models: '/models',
        history: '/history'
    }
};

// Disease Configuration
const DISEASE_CONFIG = {
    brain: {
        id: 1,
        title: "Brain Tumor Detection",
        description: "MRI analysis using ResNet-50 deep learning model. Detects gliomas, meningiomas, and pituitary tumors.",
        model: "ResNet-50",
        modelPath: "/models/brain/resnet50",
        accuracy: "97.5%",
        processingTime: "~3s",
        inputType: "MRI Scan",
        instruction: "Upload T1, T2, or FLAIR sequence MRI images",
        accept: ".dcm,.nii,.jpg,.jpeg,.png",
        acceptTypes: ["DICOM", "NIfTI", "JPG", "PNG"],
        endpoint: "/predict/brain",
        icon: "🧠",
        uploadHint: "Drag & drop MRI scans or click to browse (multiple)",
        sampleImage: "🧠 MRI Scan Preview",
        preprocess: "resize=224x224, normalize, brain extraction",
        outputFields: ["tumor_type", "confidence", "location", "size"]
    },
    chest: {
        id: 2,
        title: "Chest X-Ray Analysis",
        description: "General chest abnormalities detection using DenseNet-121.",
        model: "DenseNet-121",
        modelPath: "/models/chest/densenet",
        accuracy: "96.8%",
        processingTime: "~2s",
        inputType: "Chest X-Ray",
        instruction: "Upload frontal chest X-ray (PA or AP view)",
        accept: ".dcm,.jpg,.jpeg,.png",
        acceptTypes: ["DICOM", "JPG", "PNG"],
        endpoint: "/predict/chest",
        icon: "🫁",
        uploadHint: "Drag & drop chest X-rays or click to browse (multiple)",
        sampleImage: "🫁 Chest X-Ray Preview",
        preprocess: "resize=224x224, normalize, lung segmentation",
        outputFields: ["finding", "confidence", "location", "severity"]
    },
    pneumonia: {
        id: 3,
        title: "Pneumonia Detection",
        description: "Bacterial and viral pneumonia detection from chest X-rays.",
        model: "ResNet-50",
        modelPath: "/models/pneumonia/resnet50",
        accuracy: "97.2%",
        processingTime: "~2s",
        inputType: "Chest X-Ray",
        instruction: "Upload frontal chest X-ray for pneumonia analysis",
        accept: ".dcm,.jpg,.jpeg,.png",
        acceptTypes: ["DICOM", "JPG", "PNG"],
        endpoint: "/predict/pneumonia",
        icon: "🌬️",
        uploadHint: "Drag & drop chest X-rays or click to browse (multiple)",
        sampleImage: "🌬️ Chest X-Ray Preview",
        preprocess: "resize=224x224, normalize, lung segmentation",
        outputFields: ["probability", "type", "confidence", "severity"]
    },
    covid: {
        id: 4,
        title: "COVID-19 Detection",
        description: "COVID-19 detection from chest X-rays using VGG16.",
        model: "VGG16",
        modelPath: "/models/covid/vgg16",
        accuracy: "95.9%",
        processingTime: "~2.5s",
        inputType: "Chest X-Ray",
        instruction: "Upload chest X-ray for COVID-19 analysis",
        accept: ".dcm,.jpg,.jpeg,.png",
        acceptTypes: ["DICOM", "JPG", "PNG"],
        endpoint: "/predict/covid",
        icon: "🦠",
        uploadHint: "Drag & drop chest X-rays or click to browse (multiple)",
        sampleImage: "🦠 Chest X-Ray Preview",
        preprocess: "resize=224x224, normalize",
        outputFields: ["probability", "confidence", "severity", "pattern"]
    },
    breast: {
        id: 5,
        title: "Breast Cancer Detection",
        description: "Mammogram analysis for breast cancer detection using MobileNet.",
        model: "MobileNet",
        modelPath: "/models/breast/mobilenet",
        accuracy: "94.8%",
        processingTime: "~3s",
        inputType: "Mammogram",
        instruction: "Upload mammogram images (CC and MLO views)",
        accept: ".dcm,.jpg,.jpeg,.png",
        acceptTypes: ["DICOM", "JPG", "PNG"],
        endpoint: "/predict/breast",
        icon: "🎗️",
        uploadHint: "Drag & drop mammograms or click to browse (multiple)",
        sampleImage: "🎗️ Mammogram Preview",
        preprocess: "resize=224x224, normalize, breast segmentation",
        outputFields: ["birads", "confidence", "mass_type", "calcifications"]
    },
    retinopathy: {
        id: 6,
        title: "Diabetic Retinopathy",
        description: "Retinal fundus analysis for diabetic retinopathy detection.",
        model: "DenseNet-121",
        modelPath: "/models/retinopathy/densenet",
        accuracy: "96.2%",
        processingTime: "~2s",
        inputType: "Fundus Photo",
        instruction: "Upload retinal fundus photograph",
        accept: ".jpg,.jpeg,.png,.tiff",
        acceptTypes: ["JPG", "PNG", "TIFF"],
        endpoint: "/predict/retinopathy",
        icon: "👁️",
        uploadHint: "Drag & drop fundus photos or click to browse (multiple)",
        sampleImage: "👁️ Fundus Photo Preview",
        preprocess: "resize=224x224, normalize, vessel segmentation",
        outputFields: ["grade", "confidence", "macular_edema", "hemorrhages"]
    },
    skin: {
        id: 7,
        title: "Skin Cancer Detection",
        description: "Lesion classification for melanoma and other skin cancers.",
        model: "Ensemble",
        modelPath: "/models/skin/ensemble",
        accuracy: "95.7%",
        processingTime: "~3s",
        inputType: "Dermoscopic Image",
        instruction: "Upload clear, well-lit images of skin lesions",
        accept: ".jpg,.jpeg,.png,.bmp",
        acceptTypes: ["JPG", "PNG", "BMP"],
        endpoint: "/predict/skin",
        icon: "🔬",
        uploadHint: "Drag & drop skin lesion images or click to browse (multiple)",
        sampleImage: "🔬 Dermoscopic Image Preview",
        preprocess: "resize=224x224, normalize, lesion segmentation",
        outputFields: ["diagnosis", "confidence", "melanoma_risk", "features"]
    },
    bone: {
        id: 8,
        title: "Bone Fracture Detection",
        description: "Fracture detection in X-ray images using ResNet-50.",
        model: "ResNet-50",
        modelPath: "/models/fracture/resnet50",
        accuracy: "96.5%",
        processingTime: "~2s",
        inputType: "X-Ray",
        instruction: "Upload X-ray of suspected fracture area",
        accept: ".dcm,.jpg,.jpeg,.png",
        acceptTypes: ["DICOM", "JPG", "PNG"],
        endpoint: "/predict/fracture",
        icon: "🦴",
        uploadHint: "Drag & drop X-rays or click to browse (multiple)",
        sampleImage: "🦴 X-Ray Preview",
        preprocess: "resize=224x224, normalize, bone segmentation",
        outputFields: ["fracture", "confidence", "bone", "type"]
    },
    liver: {
        id: 9,
        title: "Liver Disease Detection",
        description: "CT scan analysis for liver diseases and tumors.",
        model: "VGG16",
        modelPath: "/models/liver/vgg16",
        accuracy: "94.9%",
        processingTime: "~3.5s",
        inputType: "CT Scan",
        instruction: "Upload abdominal CT scan images",
        accept: ".dcm,.nii,.jpg,.jpeg",
        acceptTypes: ["DICOM", "NIfTI", "JPG"],
        endpoint: "/predict/liver",
        icon: "🧬",
        uploadHint: "Drag & drop CT scans or click to browse (multiple)",
        sampleImage: "🧬 CT Scan Preview",
        preprocess: "resize=224x224, normalize, liver segmentation",
        outputFields: ["condition", "confidence", "fibrosis", "lesions"]
    },
    kidney: {
        id: 10,
        title: "Kidney Stone Detection",
        description: "CT urography analysis for kidney stone detection.",
        model: "MobileNet",
        modelPath: "/models/kidney/mobilenet",
        accuracy: "95.3%",
        processingTime: "~2.5s",
        inputType: "CT Urography",
        instruction: "Upload CT scan for kidney stone analysis",
        accept: ".dcm,.jpg,.jpeg,.png",
        acceptTypes: ["DICOM", "JPG", "PNG"],
        endpoint: "/predict/kidney",
        icon: "🔴",
        uploadHint: "Drag & drop CT scans or click to browse (multiple)",
        sampleImage: "🔴 CT Scan Preview",
        preprocess: "resize=224x224, normalize, kidney segmentation",
        outputFields: ["stone", "confidence", "size", "location"]
    }
};

// Demo results for each disease
const DEMO_RESULTS = {
    brain: {
        status: "success",
        label: "No tumor detected",
        confidence: 98,
        explanation: "MRI shows normal brain anatomy. No evidence of masses, edema, or abnormal enhancement.",
        findings: ["Normal ventricular system", "No midline shift", "Gray-white matter differentiation preserved"]
    },
    pneumonia: {
        status: "warning",
        label: "Pneumonia suspected",
        confidence: 87,
        explanation: "Consolidation in right lower lobe. Air bronchograms present. Suggest clinical correlation.",
        findings: ["Right lower lobe opacity", "Air bronchograms", "No pleural effusion"]
    },
    breast: {
        status: "success",
        label: "BI-RADS 2 (Benign)",
        confidence: 95,
        explanation: "No suspicious masses or microcalcifications. Routine follow-up recommended.",
        findings: ["Symmetrical breast tissue", "No dominant masses", "No suspicious calcifications"]
    },
    retinopathy: {
        status: "warning",
        label: "Moderate NPDR",
        confidence: 84,
        explanation: "Microaneurysms, dot-blot hemorrhages, and hard exudates present.",
        findings: ["Microaneurysms", "Dot-blot hemorrhages", "Hard exudates"]
    },
    skin: {
        status: "warning",
        label: "Suspicious lesion",
        confidence: 78,
        explanation: "Asymmetry, border irregularity, and color variation detected. Recommend biopsy.",
        findings: ["Asymmetry", "Irregular borders", "Multiple colors"]
    },
    covid: {
        status: "warning",
        label: "COVID-19 features detected",
        confidence: 89,
        explanation: "Bilateral ground-glass opacities with peripheral distribution. Suggest RT-PCR confirmation.",
        findings: ["Ground-glass opacities", "Peripheral distribution", "No pleural effusion"]
    },
    bone: {
        status: "warning",
        label: "Fracture detected",
        confidence: 94,
        explanation: "Distal radius fracture identified. Cortical disruption visible.",
        findings: ["Cortical disruption", "Distal radius", "No displacement"]
    },
    liver: {
        status: "success",
        label: "Normal liver",
        confidence: 92,
        explanation: "Normal liver parenchyma. No focal lesions or signs of cirrhosis.",
        findings: ["Homogeneous parenchyma", "Normal size", "No masses"]
    },
    kidney: {
        status: "warning",
        label: "Kidney stone detected",
        confidence: 91,
        explanation: "5mm calculus in left renal pelvis. Mild hydronephrosis present.",
        findings: ["5mm calculus", "Left renal pelvis", "Mild hydronephrosis"]
    }
};

// Default result for diseases without specific demo
const DEFAULT_RESULT = {
    status: "success",
    label: "Normal findings",
    confidence: 96,
    explanation: "No abnormalities detected. Image quality is adequate for analysis.",
    findings: ["Normal anatomy", "No pathology detected", "Good image quality"]
};

// History data store
let analysisHistory = [];

// Stats counters
let totalAnalyses = 0;
let thisMonthAnalyses = 0;

// State management
let currentView = 'dashboard';
let currentDisease = null;
let selectedFiles = [];
let selectedFilesData = [];

// Filter state
let currentFilter = {
    search: '',
    disease: 'All Diseases',
    dateRange: 'All time',
    resultType: 'All Results'
};

// DOM Elements
const mainContent = document.getElementById('mainContent');

// Add modal styles
const modalStyles = `
    <style>
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
            backdrop-filter: blur(5px);
        }
        .modal-overlay.active {
            opacity: 1;
        }
        .modal-content {
            background: white;
            border-radius: 24px;
            max-width: 90vw;
            max-height: 90vh;
            overflow: auto;
            position: relative;
            transform: scale(0.9);
            transition: transform 0.3s ease;
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
        }
        .modal-overlay.active .modal-content {
            transform: scale(1);
        }
        .modal-close {
            position: absolute;
            top: 15px;
            right: 15px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: white;
            border: none;
            font-size: 24px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1001;
            transition: all 0.2s;
        }
        .modal-close:hover {
            background: #f0f0f0;
            transform: rotate(90deg);
        }
        .modal-image-container {
            padding: 20px;
            text-align: center;
            background: #f8fafd;
        }
        .modal-image {
            max-width: 100%;
            max-height: 70vh;
            object-fit: contain;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        .modal-info {
            padding: 24px;
            background: white;
            border-top: 1px solid #eef2f6;
        }
        .modal-info h3 {
            margin: 0 0 10px 0;
            color: var(--primary);
        }
        .modal-meta {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .modal-meta-item {
            padding: 10px;
            background: #f8fafd;
            border-radius: 12px;
        }
        .modal-meta-item .label {
            font-size: 12px;
            color: var(--gray-500);
            text-transform: uppercase;
        }
        .modal-meta-item .value {
            font-size: 16px;
            font-weight: 600;
            color: var(--primary);
            margin-top: 5px;
        }
        .thumbnail {
            cursor: pointer;
            transition: transform 0.2s;
        }
        .thumbnail:hover {
            transform: scale(1.05);
        }
        .image-preview-icon {
            position: absolute;
            top: 5px;
            right: 35px;
            background: var(--primary);
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.2s;
        }
        .file-preview-item:hover .image-preview-icon {
            opacity: 1;
        }
        @keyframes slideIn {
            from {
                transform: translateY(20px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateY(0);
                opacity: 1;
            }
            to {
                transform: translateY(20px);
                opacity: 0;
            }
        }
    </style>
`;

// Add modal styles to document
document.head.insertAdjacentHTML('beforeend', modalStyles);

// Get disease from URL parameters
function getDiseaseFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const disease = urlParams.get('disease');
    return disease;
}

// Initialize dashboard with URL parameter
document.addEventListener('DOMContentLoaded', function() {
    const urlDisease = getDiseaseFromUrl();
    
    if (urlDisease && DISEASE_CONFIG[urlDisease]) {
        setTimeout(() => {
            const sidebarItems = document.querySelectorAll('.nav-item');
            sidebarItems.forEach(item => {
                item.classList.remove('active');
                if (item.dataset.disease === urlDisease) {
                    item.classList.add('active');
                }
            });
            
            currentView = 'analysis';
            currentDisease = urlDisease;
            loadAnalysisView(urlDisease);
        }, 100);
    } else {
        loadDashboardView();
    }
    
    setupNavigation();
});

// Setup navigation event listeners
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            const disease = this.dataset.disease;
            const view = this.dataset.view;
            
            if (disease) {
                currentView = 'analysis';
                currentDisease = disease;
                loadAnalysisView(disease);
                
                const url = new URL(window.location);
                url.searchParams.set('disease', disease);
                window.history.pushState({}, '', url);
            } else if (view) {
                currentView = view;
                
                const url = new URL(window.location);
                url.searchParams.delete('disease');
                window.history.pushState({}, '', url);
                
                switch(view) {
                    case 'dashboard':
                        loadDashboardView();
                        break;
                    case 'analysis':
                        loadAnalysisView('brain');
                        break;
                    case 'history':
                        loadHistoryView();
                        break;
                }
            }
        });
    });
}

// Load Dashboard View
function loadDashboardView() {
    const today = new Date().toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
    });
    
    // Get recent analyses (last 4 from history)
    const recentAnalyses = analysisHistory.slice(0, 4);
    
    // Calculate accuracy from history
    const accuracy = calculateAccuracy();
    
    mainContent.innerHTML = `
        <header class="dashboard-header">
            <h1>Medical Diagnosis Dashboard</h1>
            <div class="header-actions">
                <div class="date-badge">📅 ${today}</div>
                <button class="btn btn-primary" onclick="loadAnalysisView('brain')">
                    <span style="margin-right: 5px;">+</span> New Analysis
                </button>
            </div>
        </header>

        <!-- Stats Cards -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">📊</div>
                <div class="stat-details">
                    <h3>Total Analyses</h3>
                    <p class="stat-value">${totalAnalyses}</p>
                    <span class="stat-trend">${totalAnalyses > 0 ? '↑ ' + (totalAnalyses - (analysisHistory.length - totalAnalyses)) + ' this month' : 'No analyses yet'}</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">✅</div>
                <div class="stat-details">
                    <h3>This Month</h3>
                    <p class="stat-value">${thisMonthAnalyses}</p>
                    <span class="stat-trend">${thisMonthAnalyses > 0 ? Math.round((thisMonthAnalyses/totalAnalyses)*100) + '% of total' : 'No analyses this month'}</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🎯</div>
                <div class="stat-details">
                    <h3>Accuracy</h3>
                    <p class="stat-value">${accuracy}%</p>
                    <span class="stat-trend">${totalAnalyses > 0 ? 'Based on ' + totalAnalyses + ' analyses' : 'Model average'}</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">⏳</div>
                <div class="stat-details">
                    <h3>Avg. Response</h3>
                    <p class="stat-value">2.4s</p>
                    <span class="stat-trend">per analysis</span>
                </div>
            </div>
        </div>

        <!-- Recent Analyses -->
        <div class="recent-analyses">
            <div class="section-header">
                <h2>Recent Analyses</h2>
                ${analysisHistory.length > 4 ? '<a href="#" class="view-all" onclick="loadHistoryView(); return false;">View All →</a>' : ''}
            </div>
            ${recentAnalyses.length > 0 ? `
            <div class="analyses-table">
                <table>
                    <thead>
                        <tr>
                            <th>Patient ID</th>
                            <th>Disease</th>
                            <th>Date</th>
                            <th>Result</th>
                            <th>Confidence</th>
                            <th>Images</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recentAnalyses.map(item => `
                        <tr>
                            <td><strong>${item.patientId}</strong></td>
                            <td>${item.disease}</td>
                            <td>${formatDate(item.date)}</td>
                            <td><span class="badge ${item.findingClass}">${item.finding}</span></td>
                            <td>
                                <div class="confidence-cell">
                                    <span>${item.confidence}%</span>
                                    <div class="confidence-bar"><div style="width:${item.confidence}%"></div></div>
                                </div>
                            </td>
                            <td>${item.imageCount || 1}</td>
                            <td>
                                <button class="btn-icon" onclick="viewReport('${item.diseaseKey || item.disease.toLowerCase().replace(' ', '-')}', '${item.patientId}')" title="View Details">👁️</button>
                                <button class="btn-icon" onclick="downloadCSVReportFromHistory('${item.diseaseKey || item.disease.toLowerCase().replace(' ', '-')}')" title="Download CSV">📊</button>
                            </td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            ` : `
            <div class="empty-state">
                <div class="empty-icon">📊</div>
                <h3>No analyses yet</h3>
                <p>Start your first analysis by uploading a medical image</p>
                <button class="btn btn-primary" onclick="loadAnalysisView('brain')">
                    <span style="margin-right: 5px;">+</span> New Analysis
                </button>
            </div>
            `}
        </div>

        <!-- Quick Actions -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 24px;">
            <div class="stat-card" style="cursor: pointer;" onclick="loadAnalysisView('brain')">
                <div style="text-align: center;">
                    <div style="font-size: 32px; margin-bottom: 8px;">🧠</div>
                    <h4 style="margin: 0;">Brain MRI</h4>
                    <p style="font-size: 12px; color: var(--gray-500);">Start analysis</p>
                </div>
            </div>
            <div class="stat-card" style="cursor: pointer;" onclick="loadAnalysisView('chest')">
                <div style="text-align: center;">
                    <div style="font-size: 32px; margin-bottom: 8px;">🫁</div>
                    <h4 style="margin: 0;">Chest X-Ray</h4>
                    <p style="font-size: 12px; color: var(--gray-500);">Start analysis</p>
                </div>
            </div>
            <div class="stat-card" style="cursor: pointer;" onclick="loadAnalysisView('pneumonia')">
                <div style="text-align: center;">
                    <div style="font-size: 32px; margin-bottom: 8px;">🌬️</div>
                    <h4 style="margin: 0;">Pneumonia</h4>
                    <p style="font-size: 12px; color: var(--gray-500);">Start analysis</p>
                </div>
            </div>
            <div class="stat-card" style="cursor: pointer;" onclick="loadAnalysisView('breast')">
                <div style="text-align: center;">
                    <div style="font-size: 32px; margin-bottom: 8px;">🎗️</div>
                    <h4 style="margin: 0;">Breast Cancer</h4>
                    <p style="font-size: 12px; color: var(--gray-500);">Start analysis</p>
                </div>
            </div>
        </div>

        <!-- Model Performance -->
        <div class="performance-section" style="margin-top: 32px;">
            <div class="section-header">
                <h2>Model Performance</h2>
                <select class="model-select" onchange="updateModelPerformance(this.value)">
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 3 months</option>
                </select>
            </div>
            <div class="model-grid">
                <div class="model-card">
                    <h4>DenseNet-121</h4>
                    <div class="model-metrics">
                        <div class="metric">
                            <span class="metric-label">Accuracy</span>
                            <span class="metric-value">98.2%</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Precision</span>
                            <span class="metric-value">97.8%</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Recall</span>
                            <span class="metric-value">98.5%</span>
                        </div>
                    </div>
                    <div class="model-usage">Used for: Chest X-ray, Retinopathy</div>
                    <div style="margin-top: 10px; font-size: 12px; color: var(--gray-500);">
                        ⚡ ${Math.floor(Math.random() * 50) + 100} analyses this week
                    </div>
                </div>
                <div class="model-card">
                    <h4>ResNet-50</h4>
                    <div class="model-metrics">
                        <div class="metric">
                            <span class="metric-label">Accuracy</span>
                            <span class="metric-value">97.5%</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Precision</span>
                            <span class="metric-value">97.1%</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Recall</span>
                            <span class="metric-value">97.9%</span>
                        </div>
                    </div>
                    <div class="model-usage">Used for: Brain Tumor, Fractures</div>
                    <div style="margin-top: 10px; font-size: 12px; color: var(--gray-500);">
                        ⚡ ${Math.floor(Math.random() * 40) + 80} analyses this week
                    </div>
                </div>
                <div class="model-card">
                    <h4>VGG16</h4>
                    <div class="model-metrics">
                        <div class="metric">
                            <span class="metric-label">Accuracy</span>
                            <span class="metric-value">96.8%</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Precision</span>
                            <span class="metric-value">96.4%</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Recall</span>
                            <span class="metric-value">97.2%</span>
                        </div>
                    </div>
                    <div class="model-usage">Used for: COVID-19, Liver Disease</div>
                    <div style="margin-top: 10px; font-size: 12px; color: var(--gray-500);">
                        ⚡ ${Math.floor(Math.random() * 30) + 60} analyses this week
                    </div>
                </div>
                <div class="model-card">
                    <h4>MobileNet</h4>
                    <div class="model-metrics">
                        <div class="metric">
                            <span class="metric-label">Accuracy</span>
                            <span class="metric-value">95.9%</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Precision</span>
                            <span class="metric-value">95.3%</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Recall</span>
                            <span class="metric-value">96.1%</span>
                        </div>
                    </div>
                    <div class="model-usage">Used for: Kidney Stone, Breast Cancer</div>
                    <div style="margin-top: 10px; font-size: 12px; color: var(--gray-500);">
                        ⚡ ${Math.floor(Math.random() * 20) + 40} analyses this week
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Calculate accuracy from history
function calculateAccuracy() {
    if (analysisHistory.length === 0) return '98.3';
    
    const successful = analysisHistory.filter(item => item.findingClass === 'success').length;
    return Math.round((successful / analysisHistory.length) * 100);
}

// Format date nicely
function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
}

// Update model performance based on time range
function updateModelPerformance(days) {
    showToast(`Showing model performance for last ${days} days`);
}

// Show toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--primary);
        color: white;
        padding: 12px 24px;
        border-radius: 30px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Image preview modal function
function showImagePreview(imageData, fileName, fileIndex, totalFiles, config) {
    // Remove existing modal if any
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal elements
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    const modal = document.createElement('div');
    modal.className = 'modal-content';
    
    // Determine if it's a real image or placeholder
    const isImage = imageData && imageData.startsWith('data:image');
    
    modal.innerHTML = `
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
        <div class="modal-image-container">
            ${isImage ? 
                `<img src="${imageData}" class="modal-image" alt="Medical Image">` : 
                `<div style="font-size: 120px; padding: 60px;">${config.icon}</div>`
            }
        </div>
        <div class="modal-info">
            <h3>${fileName}</h3>
            <div class="modal-meta">
                <div class="modal-meta-item">
                    <div class="label">Image #</div>
                    <div class="value">${fileIndex} of ${totalFiles}</div>
                </div>
                <div class="modal-meta-item">
                    <div class="label">File Size</div>
                    <div class="value">${(selectedFilesData[fileIndex-1]?.size / 1024).toFixed(1)} KB</div>
                </div>
                <div class="modal-meta-item">
                    <div class="label">Image Type</div>
                    <div class="value">${selectedFilesData[fileIndex-1]?.type || 'DICOM'}</div>
                </div>
                <div class="modal-meta-item">
                    <div class="label">Status</div>
                    <div class="value"><span class="badge success">Ready for analysis</span></div>
                </div>
            </div>
            <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
                <button class="btn btn-outline btn-small" onclick="document.querySelector('.modal-close').click()">Close</button>
                ${fileIndex > 1 ? `<button class="btn btn-outline btn-small" onclick="showImagePreview(selectedFilesData[${fileIndex-2}]?.data, '${selectedFiles[fileIndex-2]?.name}', ${fileIndex-1}, ${totalFiles}, ${JSON.stringify(config).replace(/"/g, '&quot;')})">← Previous</button>` : ''}
                ${fileIndex < totalFiles ? `<button class="btn btn-outline btn-small" onclick="showImagePreview(selectedFilesData[${fileIndex}]?.data, '${selectedFiles[fileIndex]?.name}', ${fileIndex+1}, ${totalFiles}, ${JSON.stringify(config).replace(/"/g, '&quot;')})">Next →</button>` : ''}
            </div>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Trigger animation
    setTimeout(() => overlay.classList.add('active'), 10);
    
    // Close on overlay click
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

// Load Analysis View with multiple file upload
function loadAnalysisView(diseaseKey) {
    const config = DISEASE_CONFIG[diseaseKey];
    if (!config) return;
    
    // Reset selected files when loading new analysis
    selectedFiles = [];
    selectedFilesData = [];
    
    mainContent.innerHTML = `
        <div class="analysis-container">
            <!-- Disease Header -->
            <div class="disease-header">
                <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                    <span style="font-size: 48px;">${config.icon}</span>
                    <h1 style="margin: 0;">${config.title}</h1>
                </div>
                <p>${config.description}</p>
                <div class="header-meta">
                    <span class="model-chip">${config.model}</span>
                    <span class="model-chip">Accuracy: ${config.accuracy}</span>
                    <span class="model-chip">⚡ ${config.processingTime}</span>
                </div>
            </div>

            <!-- Quick Info Card -->
            <div class="info-card" style="background: white; border-radius: var(--radius-lg); padding: 20px; margin-bottom: 24px; border: 1px solid var(--gray-200); display: flex; align-items: center; gap: 20px;">
                <div style="background: var(--gray-100); padding: 12px; border-radius: 50%;">
                    <span style="font-size: 24px;">ℹ️</span>
                </div>
                <div>
                    <h3 style="margin-bottom: 4px; color: var(--gray-900);">Upload Instructions</h3>
                    <p style="color: var(--gray-600);">${config.instruction}</p>
                </div>
                <div style="margin-left: auto;">
                    <span class="file-types">${config.acceptTypes.join(' · ')}</span>
                </div>
            </div>

            <!-- Upload Section - Multiple files -->
            <div class="upload-section" id="uploadSection">
                <h2 style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px;">
                    <span>📤</span> Upload ${config.inputType} (Multiple)
                </h2>
                <div class="upload-area" id="uploadArea">
                    <div class="upload-icon">📤</div>
                    <h3>${config.uploadHint}</h3>
                    <p>${config.instruction}</p>
                    <span class="file-types">${config.acceptTypes.join(' · ')}</span>
                    <div style="margin-top: 20px; font-size: 13px; color: var(--gray-400);">
                        Maximum file size: 50MB each · You can select multiple files
                    </div>
                </div>
                <input type="file" id="fileInput" accept="${config.accept}" style="display: none;" multiple>
            </div>

            <!-- Preview Section - Shows all selected files -->
            <div id="previewSection" class="preview-section" style="display: none;"></div>

            <!-- Results Section -->
            <div id="resultsSection" class="results-section" style="display: none;"></div>

            <!-- Analysis Controls -->
            <div class="analysis-controls" style="margin-top: 24px; display: flex; justify-content: flex-end; gap: 16px;">
                <button class="btn btn-outline" id="clearBtn" onclick="clearAnalysis()">Clear All</button>
                <button class="btn btn-primary btn-large" id="analyzeBtn" disabled>
                    <span>🔬</span> Analyze Images (${selectedFiles.length})
                </button>
            </div>
        </div>
    `;

    setupUploadHandlers(diseaseKey);
}

// Setup upload handlers for multiple files
function setupUploadHandlers(diseaseKey) {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    
    if (!uploadArea || !fileInput) return;
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
        const newFiles = Array.from(e.target.files);
        if (newFiles.length > 0) {
            // Append new files to existing ones instead of replacing
            const allFiles = [...selectedFiles, ...newFiles];
            handleFilesSelect(allFiles, diseaseKey);
        }
        // Clear the input so the same file can be selected again
        fileInput.value = '';
    });
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--secondary)';
        uploadArea.style.background = 'var(--gray-50)';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = 'var(--gray-300)';
        uploadArea.style.background = 'white';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--gray-300)';
        uploadArea.style.background = 'white';
        const newFiles = Array.from(e.dataTransfer.files);
        if (newFiles.length > 0) {
            // Append new files to existing ones
            const allFiles = [...selectedFiles, ...newFiles];
            handleFilesSelect(allFiles, diseaseKey);
        }
    });
    
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', () => callBackendAPI(diseaseKey));
    }
}

// Handle multiple files selection (append mode)
function handleFilesSelect(files, diseaseKey) {
    const config = DISEASE_CONFIG[diseaseKey];
    selectedFiles = files; // Update with all files
    
    // Read all files (including new ones)
    const readers = files.map(file => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    data: e.target.result
                });
            };
            reader.readAsDataURL(file);
        });
    });
    
    Promise.all(readers).then(filesData => {
        selectedFilesData = filesData;
        showFilesPreview(files, config);
    });
}

// Show preview of all selected files with image preview buttons
function showFilesPreview(files, config) {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const previewSection = document.getElementById('previewSection');
    
    if (analyzeBtn) {
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = `<span>🔬</span> Analyze Images (${files.length})`;
    }
    if (!previewSection) return;
    
    previewSection.style.display = 'block';
    
    const filesList = files.map((file, index) => {
        const fileData = selectedFilesData[index];
        const hasImage = fileData && fileData.data && fileData.data.startsWith('data:image');
        
        return `
            <div class="file-preview-item" style="display: flex; align-items: center; gap: 16px; padding: 12px; background: var(--gray-50); border-radius: var(--radius-md); margin-bottom: 8px; position: relative; transition: all 0.2s;" onmouseover="this.style.background='var(--gray-100)'" onmouseout="this.style.background='var(--gray-50)'">
                <div style="font-size: 20px; min-width: 40px; text-align: center; background: var(--primary); color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">${index + 1}</div>
                <div style="font-size: 32px; cursor: pointer;" onclick="showImagePreview(selectedFilesData[${index}]?.data, '${file.name}', ${index + 1}, ${files.length}, ${JSON.stringify(config).replace(/"/g, '&quot;')})">${config.icon}</div>
                <div style="flex: 1; cursor: pointer;" onclick="showImagePreview(selectedFilesData[${index}]?.data, '${file.name}', ${index + 1}, ${files.length}, ${JSON.stringify(config).replace(/"/g, '&quot;')})">
                    <div style="font-weight: 500; display: flex; align-items: center; gap: 8px;">
                        ${file.name}
                        ${file.size > 5 * 1024 * 1024 ? '<span style="font-size: 11px; background: #ffebee; color: #c62828; padding: 2px 8px; border-radius: 12px;">Large</span>' : ''}
                    </div>
                    <div style="font-size: 12px; color: var(--gray-500);">${(file.size / 1024).toFixed(1)} KB · ${file.type || 'DICOM'}</div>
                </div>
                <span class="badge success">Ready</span>
                <div class="image-preview-icon" onclick="showImagePreview(selectedFilesData[${index}]?.data, '${file.name}', ${index + 1}, ${files.length}, ${JSON.stringify(config).replace(/"/g, '&quot;')})" title="Preview Image">🔍</div>
                <button class="btn-icon" style="position: absolute; right: 5px; top: 5px; background: transparent; hover: background: rgba(0,0,0,0.05);" onclick="removeSpecificFile(${index})" title="Remove image">✕</button>
            </div>
        `;
    }).join('');
    
    // Calculate total size
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    
    previewSection.innerHTML = `
        <div class="upload-section" style="margin-top: 0;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                <h3 style="display: flex; align-items: center; gap: 8px;">
                    <span>🖼️</span> Selected Images (${files.length})
                </h3>
                <span class="badge success" style="font-size: 13px;">Total: ${(totalSize / (1024 * 1024)).toFixed(2)} MB</span>
            </div>
            <div style="max-height: 400px; overflow-y: auto; padding-right: 10px;" class="file-list">
                ${filesList}
            </div>
            <div style="display: flex; gap: 12px; margin-top: 16px; justify-content: space-between;">
                <div>
                    <button class="btn btn-outline btn-small" onclick="removeFiles()">
                        <span>🗑️</span> Remove All
                    </button>
                    <button class="btn btn-outline btn-small" onclick="document.getElementById('fileInput').click()" style="margin-left: 8px;">
                        <span>➕</span> Add More
                    </button>
                </div>
                <div style="font-size: 12px; color: var(--gray-500);">
                    ⚡ Click on image or 🔍 to preview
                </div>
            </div>
        </div>
    `;
}

// Remove specific file by index
function removeSpecificFile(index) {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    
    if (newFiles.length === 0) {
        removeFiles();
    } else {
        handleFilesSelect(newFiles, currentDisease);
        showToast(`Image #${index + 1} removed`);
    }
}

// Call Backend API (simulated)
async function callBackendAPI(diseaseKey) {
    const config = DISEASE_CONFIG[diseaseKey];
    const analyzeBtn = document.getElementById('analyzeBtn');
    const originalText = analyzeBtn.innerHTML;
    
    if (selectedFiles.length === 0) {
        showToast('Please select at least one file');
        return;
    }
    
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<span>⏳</span> Analyzing...';
    
    try {
        // Simulate API call with progress
        setTimeout(() => {
            // Generate results for each image with slight variations
            const results = selectedFiles.map((file, index) => {
                const baseResult = DEMO_RESULTS[diseaseKey] || DEFAULT_RESULT;
                // Add some variation to make each result unique
                const variation = Math.floor(Math.random() * 10) - 5;
                const confidence = Math.min(99, Math.max(70, baseResult.confidence + variation));
                return {
                    imageName: file.name,
                    imageIndex: index + 1,
                    result: {
                        ...baseResult,
                        confidence: confidence,
                        label: confidence > 85 ? baseResult.label : (index % 2 === 0 ? "Borderline findings" : "Further analysis needed")
                    }
                };
            });
            
            // Use the first result for primary display
            const mainResult = results[0].result;
            showAnalysisResults(diseaseKey, mainResult, results);
            
            // Add to history
            addToHistory(diseaseKey, mainResult, selectedFiles);
            
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = `<span>🔬</span> Analyze Images (${selectedFiles.length})`;
            
            showToast(`✅ Analysis complete! ${results.length} images processed`);
        }, 2000);
    } catch (error) {
        console.error('API call failed:', error);
        showToast('❌ Failed to analyze images. Please try again.');
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = originalText;
    }
}

// Add analysis to history
function addToHistory(diseaseKey, result, files) {
    const diseaseName = DISEASE_CONFIG[diseaseKey].title;
    const date = new Date().toISOString().split('T')[0];
    const newId = analysisHistory.length + 1;
    const patientId = `#P-${Math.floor(10000 + Math.random() * 90000)}`;
    
    const historyItem = {
        id: newId,
        date: date,
        patientId: patientId,
        disease: diseaseName,
        diseaseKey: diseaseKey,
        finding: result.label,
        findingClass: result.status,
        confidence: result.confidence,
        model: DISEASE_CONFIG[diseaseKey].model,
        status: result.status === 'success' ? 'Completed' : 'Review',
        statusClass: result.status,
        images: files.map(f => f.name),
        imageCount: files.length
    };
    
    analysisHistory.unshift(historyItem);
    
    // Update stats
    totalAnalyses++;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const analysisDate = new Date(date);
    if (analysisDate.getMonth() === currentMonth && analysisDate.getFullYear() === currentYear) {
        thisMonthAnalyses++;
    }
}

// Show analysis results with numbered images
function showAnalysisResults(diseaseKey, result, allResults = null) {
    const resultsSection = document.getElementById('resultsSection');
    const config = DISEASE_CONFIG[diseaseKey];
    
    const statusClass = result.status === 'success' ? 'success' : 'warning';
    const statusText = result.status === 'success' ? '✅ Low Risk' : '⚠️ Action Suggested';
    
    // Calculate aggregate stats
    const avgConfidence = allResults ? Math.round(allResults.reduce((acc, r) => acc + r.result.confidence, 0) / allResults.length) : result.confidence;
    const highConfidence = allResults ? allResults.filter(r => r.result.confidence > 85).length : 1;
    
    // Show detailed results for each image with numbers
    const multipleResultsHtml = allResults ? `
        <div style="margin: 20px 0; padding: 20px; background: var(--gray-50); border-radius: var(--radius-lg);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h4 style="margin: 0;">📸 Image Analysis Summary</h4>
                <span class="badge" style="background: var(--primary); color: white;">${highConfidence}/${allResults.length} High Confidence</span>
            </div>
            <div style="max-height: 300px; overflow-y: auto; border-radius: var(--radius-md);">
                <table style="width: 100%;">
                    <thead style="background: var(--gray-200); position: sticky; top: 0;">
                        <tr>
                            <th style="padding: 10px; text-align: left;">#</th>
                            <th style="padding: 10px; text-align: left;">Image Name</th>
                            <th style="padding: 10px; text-align: left;">Finding</th>
                            <th style="padding: 10px; text-align: left;">Confidence</th>
                            <th style="padding: 10px; text-align: left;">Preview</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${allResults.map(r => {
                            const fileData = selectedFilesData[r.imageIndex - 1];
                            return `
                            <tr style="border-bottom: 1px solid var(--gray-200);">
                                <td style="padding: 10px;"><strong>#${r.imageIndex}</strong></td>
                                <td style="padding: 10px; max-width: 200px; overflow: hidden; text-overflow: ellipsis;">${r.imageName}</td>
                                <td style="padding: 10px;"><span class="badge ${r.result.status}">${r.result.label}</span></td>
                                <td style="padding: 10px;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span style="font-weight: 600;">${r.result.confidence}%</span>
                                        <div class="confidence-bar" style="width: 60px;">
                                            <div style="width:${r.result.confidence}%"></div>
                                        </div>
                                    </div>
                                </td>
                                <td style="padding: 10px;">
                                    <button class="btn-icon" onclick="showImagePreview(selectedFilesData[${r.imageIndex-1}]?.data, '${r.imageName}', ${r.imageIndex}, ${selectedFiles.length}, ${JSON.stringify(config).replace(/"/g, '&quot;')})" title="Preview Image">🔍</button>
                                </td>
                            </tr>
                        `}).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    ` : '';
    
    resultsSection.style.display = 'block';
    resultsSection.innerHTML = `
        <div class="results-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h3 style="margin: 0;">Analysis Results</h3>
                <span class="result-badge ${statusClass}">${statusText}</span>
            </div>
            
            <div style="margin-bottom: 24px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-weight: 500;">Primary Finding (Image #1):</span>
                    <span style="font-weight: 600; color: var(--primary);">${result.label}</span>
                </div>
                <div class="confidence-meter">
                    <div style="display: flex; justify-content: space-between;">
                        <span class="meter-label">Confidence Score</span>
                        <span style="font-weight: 600;">${result.confidence}%</span>
                    </div>
                    <div class="meter-bar">
                        <div style="width:${result.confidence}%"></div>
                    </div>
                </div>
            </div>
            
            ${multipleResultsHtml}
            
            <div class="result-explanation">
                <div style="display: flex; gap: 10px;">
                    <div style="font-size: 24px;">🔬</div>
                    <div>
                        <strong>Clinical Interpretation:</strong>
                        <p style="margin-top: 8px;">${result.explanation}</p>
                    </div>
                </div>
            </div>
            
            ${result.findings ? `
            <div style="margin: 20px 0; padding: 16px; background: white; border-radius: var(--radius-md); border: 1px solid var(--gray-200);">
                <strong style="display: block; margin-bottom: 10px;">🔑 Key Findings:</strong>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px;">
                    ${result.findings.map(finding => `
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <span style="color: var(--primary);">•</span>
                            <span style="font-size: 14px;">${finding}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            <div class="model-info" style="margin-top: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="toggleModelDetails(this)">
                    <span style="font-weight: 500;">🔧 Model Details</span>
                    <span class="model-toggle">▼</span>
                </div>
                <div class="model-details" style="margin-top: 15px; padding: 15px; background: var(--gray-50); border-radius: var(--radius-md);">
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                        <div>
                            <div style="font-size: 12px; color: var(--gray-500);">Model Architecture</div>
                            <div style="font-weight: 600;">${config.model}</div>
                        </div>
                        <div>
                            <div style="font-size: 12px; color: var(--gray-500);">Version</div>
                            <div style="font-weight: 600;">2.1.0</div>
                        </div>
                        <div>
                            <div style="font-size: 12px; color: var(--gray-500);">Images Processed</div>
                            <div style="font-weight: 600;">${selectedFiles.length}</div>
                        </div>
                        <div>
                            <div style="font-size: 12px; color: var(--gray-500);">Preprocessing</div>
                            <div style="font-weight: 500; font-size: 13px;">${config.preprocess || 'Standard'}</div>
                        </div>
                        <div>
                            <div style="font-size: 12px; color: var(--gray-500);">Endpoint</div>
                            <div style="font-family: monospace; font-size: 12px;">${config.endpoint}</div>
                        </div>
                        <div>
                            <div style="font-size: 12px; color: var(--gray-500);">Processing Time</div>
                            <div style="font-weight: 500;">${config.processingTime}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 16px; margin-top: 24px;">
                <button class="btn btn-primary" onclick="downloadCSVReport('${diseaseKey}')">
                    <span>📊</span> Download CSV
                </button>
                <button class="btn btn-outline" onclick="downloadHTMLReport()">
                    <span>📄</span> HTML Report
                </button>
                <button class="btn btn-outline" onclick="saveToHistory('${diseaseKey}')">
                    <span>💾</span> Save
                </button>
            </div>
        </div>
    `;
}

// Download CSV Report with numbered images
function downloadCSVReport(diseaseKey) {
    const config = DISEASE_CONFIG[diseaseKey];
    
    // Create CSV content with image numbers
    let csvContent = "Image #,Image Name,Finding,Confidence (%),Interpretation,Key Findings,Model,Disease,Analysis Date\n";
    
    selectedFilesData.forEach((file, index) => {
        const result = DEMO_RESULTS[diseaseKey] || DEFAULT_RESULT;
        // Add some variation for demo purposes
        const confidence = Math.min(99, Math.max(70, result.confidence + (Math.floor(Math.random() * 10) - 5)));
        const findingsText = result.findings ? result.findings.join('; ') : '';
        
        csvContent += `${index + 1},"${file.name}",${result.label},${confidence},"${result.explanation}","${findingsText}",${config.model},${config.title},${new Date().toLocaleDateString()}\n`;
    });
    
    // Add summary section
    csvContent += `\n----- SUMMARY -----\n`;
    csvContent += `Total Images,${selectedFiles.length}\n`;
    csvContent += `Average Confidence,${Math.round(selectedFilesData.reduce((acc, _, i) => {
        return acc + (DEMO_RESULTS[diseaseKey]?.confidence || 96);
    }, 0) / selectedFilesData.length)}%\n`;
    csvContent += `Analysis Date,${new Date().toLocaleDateString()}\n`;
    csvContent += `Analysis Time,${new Date().toLocaleTimeString()}\n`;
    csvContent += `Disease,${config.title}\n`;
    csvContent += `Model,${config.model}\n`;
    csvContent += `Report ID,RPT-${Math.floor(10000 + Math.random() * 90000)}\n`;
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mediscan_${diseaseKey}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showToast(`✅ CSV report downloaded with ${selectedFiles.length} images!`);
}

// Download HTML Report (styled, opens in browser)
function downloadHTMLReport() {
    // Create a styled HTML report
    const reportHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>MediScan AI Analysis Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
            line-height: 1.6;
            color: #1e293b;
            background: #f1f5f9;
            padding: 30px;
        }
        .report-container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            border-radius: 24px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #0a2540 0%, #1f4a8a 100%);
            color: white;
            padding: 40px;
        }
        .header h1 {
            font-size: 32px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .header p {
            opacity: 0.9;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 30px;
            font-size: 12px;
            font-weight: 600;
            background: rgba(255,255,255,0.2);
            color: white;
            margin-top: 10px;
        }
        .content {
            padding: 40px;
        }
        .section {
            background: #f8fafc;
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 24px;
            border: 1px solid #e2e8f0;
        }
        .section h2 {
            color: #0a2540;
            font-size: 20px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
        }
        .info-card {
            background: white;
            padding: 16px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
        }
        .info-card .label {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .info-card .value {
            font-size: 20px;
            font-weight: 600;
            color: #0a2540;
            margin-top: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 12px;
            overflow: hidden;
        }
        th {
            background: #0a2540;
            color: white;
            padding: 12px;
            text-align: left;
            font-size: 14px;
        }
        td {
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
        }
        .confidence-bar {
            width: 80px;
            height: 6px;
            background: #e2e8f0;
            border-radius: 3px;
            overflow: hidden;
            display: inline-block;
            margin-left: 8px;
        }
        .confidence-fill {
            height: 100%;
            background: #0a2540;
        }
        .footer {
            text-align: center;
            padding: 24px;
            color: #94a3b8;
            font-size: 12px;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="header">
            <h1>🏥 MediScan AI · Diagnostic Report</h1>
            <p>Advanced Medical Image Analysis Platform</p>
            <span class="badge">Report ID: RPT-${Math.floor(10000 + Math.random() * 90000)}</span>
        </div>

        <div class="content">
            <div class="section">
                <h2>📋 Report Information</h2>
                <div class="grid">
                    <div class="info-card">
                        <div class="label">Report Date</div>
                        <div class="value">${new Date().toLocaleDateString()}</div>
                    </div>
                    <div class="info-card">
                        <div class="label">Report Time</div>
                        <div class="value">${new Date().toLocaleTimeString()}</div>
                    </div>
                    <div class="info-card">
                        <div class="label">Patient ID</div>
                        <div class="value">#P-${Math.floor(10000 + Math.random() * 90000)}</div>
                    </div>
                    <div class="info-card">
                        <div class="label">Analysis Type</div>
                        <div class="value">${currentDisease ? DISEASE_CONFIG[currentDisease].title : 'Multi-Disease Analysis'}</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>📊 Analysis Summary</h2>
                <div class="grid">
                    <div class="info-card">
                        <div class="label">Total Images</div>
                        <div class="value">${selectedFiles.length}</div>
                    </div>
                    <div class="info-card">
                        <div class="label">Primary Finding</div>
                        <div class="value">${DEMO_RESULTS[currentDisease]?.label || 'Normal findings'}</div>
                    </div>
                    <div class="info-card">
                        <div class="label">Confidence</div>
                        <div class="value">${DEMO_RESULTS[currentDisease]?.confidence || 96}%</div>
                    </div>
                    <div class="info-card">
                        <div class="label">Model</div>
                        <div class="value">${currentDisease ? DISEASE_CONFIG[currentDisease].model : 'Ensemble'}</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>🖼️ Image Analysis Details</h2>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Image Name</th>
                            <th>Finding</th>
                            <th>Confidence</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${selectedFilesData.map((file, index) => {
                            const confidence = (DEMO_RESULTS[currentDisease]?.confidence || 96) - (index * 2);
                            const finding = index % 2 === 0 ? (DEMO_RESULTS[currentDisease]?.label || 'Normal') : 'Further analysis needed';
                            return `
                            <tr>
                                <td><strong>#${index + 1}</strong></td>
                                <td>${file.name}</td>
                                <td>${finding}</td>
                                <td>
                                    ${confidence}%
                                    <div class="confidence-bar">
                                        <div class="confidence-fill" style="width:${confidence}%"></div>
                                    </div>
                                </td>
                            </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>

            <div class="footer">
                <p>Generated by MediScan AI · ${new Date().toLocaleString()}</p>
                <p style="margin-top: 5px;">This is an automated report. Always consult with a healthcare professional.</p>
            </div>
        </div>
    </div>
</body>
</html>
    `;

    // Create blob with HTML content
    const blob = new Blob([reportHTML], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mediscan_report_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showToast('✅ HTML report downloaded! Open in browser to view.');
}

// Clear all files
function removeFiles() {
    selectedFiles = [];
    selectedFilesData = [];
    
    const analyzeBtn = document.getElementById('analyzeBtn');
    const previewSection = document.getElementById('previewSection');
    const resultsSection = document.getElementById('resultsSection');
    const fileInput = document.getElementById('fileInput');
    
    if (analyzeBtn) {
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '<span>🔬</span> Analyze Images (0)';
    }
    if (previewSection) previewSection.style.display = 'none';
    if (resultsSection) resultsSection.style.display = 'none';
    if (fileInput) fileInput.value = '';
    
    showToast('All files cleared');
}

function clearAnalysis() {
    removeFiles();
}

// Load History View with working filters
function loadHistoryView() {
    mainContent.innerHTML = `
        <header class="dashboard-header">
            <h1>Analysis History ${analysisHistory.length > 0 ? `(${analysisHistory.length} total)` : ''}</h1>
            <div class="header-actions">
                ${analysisHistory.length > 0 ? `
                    <button class="btn btn-outline" onclick="exportHistory()">
                        <span>📤</span> Export Data
                    </button>
                ` : ''}
            </div>
        </header>

        <!-- Working Filters -->
        <div class="history-filters" style="background: white; padding: 20px; border-radius: var(--radius-lg); margin-bottom: 24px; box-shadow: var(--shadow-sm);">
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 12px; align-items: end;">
                <div>
                    <label style="font-size: 12px; font-weight: 500; color: var(--gray-600); margin-bottom: 4px; display: block;">Search</label>
                    <input type="text" id="searchInput" class="filter-input" placeholder="Search by patient ID or disease..." value="${currentFilter.search}" onkeyup="applyFilters()">
                </div>
                <div>
                    <label style="font-size: 12px; font-weight: 500; color: var(--gray-600); margin-bottom: 4px; display: block;">Disease</label>
                    <select id="diseaseFilter" class="filter-select" onchange="applyFilters()">
                        <option value="All Diseases" ${currentFilter.disease === 'All Diseases' ? 'selected' : ''}>All Diseases</option>
                        <option value="Brain Tumor" ${currentFilter.disease === 'Brain Tumor' ? 'selected' : ''}>Brain Tumor</option>
                        <option value="Pneumonia" ${currentFilter.disease === 'Pneumonia' ? 'selected' : ''}>Pneumonia</option>
                        <option value="COVID-19" ${currentFilter.disease === 'COVID-19' ? 'selected' : ''}>COVID-19</option>
                        <option value="Breast Cancer" ${currentFilter.disease === 'Breast Cancer' ? 'selected' : ''}>Breast Cancer</option>
                        <option value="Diabetic Retinopathy" ${currentFilter.disease === 'Diabetic Retinopathy' ? 'selected' : ''}>Diabetic Retinopathy</option>
                        <option value="Skin Cancer" ${currentFilter.disease === 'Skin Cancer' ? 'selected' : ''}>Skin Cancer</option>
                        <option value="Bone Fracture" ${currentFilter.disease === 'Bone Fracture' ? 'selected' : ''}>Bone Fracture</option>
                        <option value="Liver Disease" ${currentFilter.disease === 'Liver Disease' ? 'selected' : ''}>Liver Disease</option>
                        <option value="Kidney Stone" ${currentFilter.disease === 'Kidney Stone' ? 'selected' : ''}>Kidney Stone</option>
                    </select>
                </div>
                <div>
                    <label style="font-size: 12px; font-weight: 500; color: var(--gray-600); margin-bottom: 4px; display: block;">Date Range</label>
                    <select id="dateFilter" class="filter-select" onchange="applyFilters()">
                        <option value="All time" ${currentFilter.dateRange === 'All time' ? 'selected' : ''}>All time</option>
                        <option value="Today" ${currentFilter.dateRange === 'Today' ? 'selected' : ''}>Today</option>
                        <option value="Yesterday" ${currentFilter.dateRange === 'Yesterday' ? 'selected' : ''}>Yesterday</option>
                        <option value="Last 7 days" ${currentFilter.dateRange === 'Last 7 days' ? 'selected' : ''}>Last 7 days</option>
                        <option value="Last 30 days" ${currentFilter.dateRange === 'Last 30 days' ? 'selected' : ''}>Last 30 days</option>
                        <option value="Last 90 days" ${currentFilter.dateRange === 'Last 90 days' ? 'selected' : ''}>Last 90 days</option>
                    </select>
                </div>
                <div>
                    <label style="font-size: 12px; font-weight: 500; color: var(--gray-600); margin-bottom: 4px; display: block;">Result Type</label>
                    <select id="resultFilter" class="filter-select" onchange="applyFilters()">
                        <option value="All Results" ${currentFilter.resultType === 'All Results' ? 'selected' : ''}>All Results</option>
                        <option value="success" ${currentFilter.resultType === 'success' ? 'selected' : ''}>Normal Only</option>
                        <option value="warning" ${currentFilter.resultType === 'warning' ? 'selected' : ''}>Abnormal Only</option>
                    </select>
                </div>
                <div>
                    <button class="btn btn-outline" onclick="resetFilters()" style="padding: 12px 20px;">
                        <span>↺</span> Reset
                    </button>
                </div>
            </div>
            <div style="margin-top: 10px; font-size: 13px; color: var(--gray-500);" id="filterStats">
                ${analysisHistory.length} total records
            </div>
        </div>

        <div class="recent-analyses">
            ${analysisHistory.length > 0 ? `
            <div class="analyses-table">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Patient ID</th>
                            <th>Disease</th>
                            <th>Finding</th>
                            <th>Confidence</th>
                            <th>Images</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="historyTableBody">
                        ${renderFilteredHistory()}
                    </tbody>
                </table>
            </div>
            ` : `
            <div class="empty-state" style="text-align: center; padding: 80px 20px; background: white; border-radius: var(--radius-lg);">
                <div style="font-size: 72px; margin-bottom: 20px;">📋</div>
                <h3 style="margin-bottom: 10px; color: var(--gray-700);">No history yet</h3>
                <p style="color: var(--gray-500); margin-bottom: 20px;">Your analyzed images will appear here</p>
                <button class="btn btn-primary" onclick="loadAnalysisView('brain')">
                    <span>+</span> Start Analysis
                </button>
            </div>
            `}
        </div>

        ${analysisHistory.length > 10 ? `
        <!-- Pagination -->
        <div style="display: flex; justify-content: center; gap: 8px; margin-top: 24px;">
            <button class="btn btn-outline" onclick="changePage('prev')" id="prevBtn" disabled>← Previous</button>
            <span style="padding: 10px 20px; background: white; border-radius: 30px; border: 1px solid var(--gray-200);">
                Page <span id="currentPage">1</span> of <span id="totalPages">${Math.ceil(analysisHistory.length / 10)}</span>
            </span>
            <button class="btn btn-outline" onclick="changePage('next')" id="nextBtn">Next →</button>
        </div>
        ` : ''}
    `;
    
    // Initialize filter listeners
    setupFilterListeners();
}

// Render filtered history table rows
function renderFilteredHistory() {
    const filtered = filterHistoryData();
    
    if (filtered.length === 0) {
        return `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px;">
                    <div style="font-size: 24px; margin-bottom: 10px;">🔍</div>
                    <p>No matching records found</p>
                    <button class="btn btn-outline btn-small" onclick="resetFilters()">Clear Filters</button>
                </td>
            </tr>
        `;
    }
    
    return filtered.map(item => `
        <tr>
            <td>${formatDate(item.date)}</td>
            <td><strong>${item.patientId}</strong></td>
            <td>${item.disease}</td>
            <td><span class="badge ${item.findingClass}">${item.finding}</span></td>
            <td>
                <div class="confidence-cell">
                    <span>${item.confidence}%</span>
                    <div class="confidence-bar"><div style="width:${item.confidence}%"></div></div>
                </div>
            </td>
            <td>${item.imageCount || 1}</td>
            <td>
                <button class="btn-icon" onclick="viewReport('${item.diseaseKey || item.disease.toLowerCase().replace(' ', '-')}', '${item.patientId}')" title="View Details">👁️</button>
                <button class="btn-icon" onclick="downloadCSVReportFromHistory('${item.diseaseKey || item.disease.toLowerCase().replace(' ', '-')}')" title="Download CSV">📊</button>
                <button class="btn-icon" onclick="downloadHTMLReport()" title="Download HTML Report">📄</button>
            </td>
        </tr>
    `).join('');
}

// Filter history data based on current filters
function filterHistoryData() {
    return analysisHistory.filter(item => {
        // Search filter
        if (currentFilter.search) {
            const searchLower = currentFilter.search.toLowerCase();
            const matchesSearch = 
                item.patientId.toLowerCase().includes(searchLower) ||
                item.disease.toLowerCase().includes(searchLower) ||
                item.finding.toLowerCase().includes(searchLower);
            if (!matchesSearch) return false;
        }
        
        // Disease filter
        if (currentFilter.disease !== 'All Diseases' && item.disease !== currentFilter.disease) {
            return false;
        }
        
        // Result type filter
        if (currentFilter.resultType !== 'All Results' && item.findingClass !== currentFilter.resultType) {
            return false;
        }
        
        // Date range filter
        if (currentFilter.dateRange !== 'All time') {
            const itemDate = new Date(item.date);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            const threeMonthsAgo = new Date(today);
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            
            switch(currentFilter.dateRange) {
                case 'Today':
                    if (itemDate.toDateString() !== today.toDateString()) return false;
                    break;
                case 'Yesterday':
                    if (itemDate.toDateString() !== yesterday.toDateString()) return false;
                    break;
                case 'Last 7 days':
                    if (itemDate < weekAgo) return false;
                    break;
                case 'Last 30 days':
                    if (itemDate < monthAgo) return false;
                    break;
                case 'Last 90 days':
                    if (itemDate < threeMonthsAgo) return false;
                    break;
            }
        }
        
        return true;
    });
}

// Apply filters
function applyFilters() {
    const searchInput = document.getElementById('searchInput');
    const diseaseFilter = document.getElementById('diseaseFilter');
    const dateFilter = document.getElementById('dateFilter');
    const resultFilter = document.getElementById('resultFilter');
    
    currentFilter = {
        search: searchInput?.value || '',
        disease: diseaseFilter?.value || 'All Diseases',
        dateRange: dateFilter?.value || 'All time',
        resultType: resultFilter?.value || 'All Results'
    };
    
    const tbody = document.getElementById('historyTableBody');
    if (tbody) {
        tbody.innerHTML = renderFilteredHistory();
    }
    
    const filterStats = document.getElementById('filterStats');
    if (filterStats) {
        const filteredCount = filterHistoryData().length;
        filterStats.innerHTML = `${filteredCount} of ${analysisHistory.length} records`;
    }
}

// Reset filters
function resetFilters() {
    currentFilter = {
        search: '',
        disease: 'All Diseases',
        dateRange: 'All time',
        resultType: 'All Results'
    };
    
    const searchInput = document.getElementById('searchInput');
    const diseaseFilter = document.getElementById('diseaseFilter');
    const dateFilter = document.getElementById('dateFilter');
    const resultFilter = document.getElementById('resultFilter');
    
    if (searchInput) searchInput.value = '';
    if (diseaseFilter) diseaseFilter.value = 'All Diseases';
    if (dateFilter) dateFilter.value = 'All time';
    if (resultFilter) resultFilter.value = 'All Results';
    
    applyFilters();
    showToast('Filters reset');
}

// Setup filter listeners
function setupFilterListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', applyFilters);
    }
}

// Helper functions
function showResult(disease) {
    loadAnalysisView(disease);
    setTimeout(() => {
        setTimeout(() => {
            const analyzeBtn = document.getElementById('analyzeBtn');
            if (analyzeBtn && !analyzeBtn.disabled) {
                analyzeBtn.click();
            }
        }, 500);
    }, 100);
}

function viewReport(disease, patientId) {
    showResult(disease);
}

function toggleModelDetails(element) {
    const details = element.nextElementSibling;
    const toggle = element.querySelector('.model-toggle');
    
    if (details.style.display === 'none') {
        details.style.display = 'block';
        toggle.textContent = '▼';
    } else {
        details.style.display = 'none';
        toggle.textContent = '▶';
    }
}

function saveToHistory(diseaseKey) {
    showToast('Analysis saved to history');
}

function downloadCSVReportFromHistory(diseaseKey) {
    showToast(`Downloading report...`);
    downloadCSVReport(diseaseKey);
}

function exportHistory() {
    if (analysisHistory.length === 0) {
        showToast('No history to export');
        return;
    }
    
    // Create CSV of all history with image counts
    let csvContent = "Date,Patient ID,Disease,Finding,Confidence,Model,Status,Image Count\n";
    analysisHistory.forEach(item => {
        csvContent += `${item.date},${item.patientId},${item.disease},${item.finding},${item.confidence},${item.model},${item.status},${item.imageCount || 1}\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mediscan_history_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showToast(`✅ History exported with ${analysisHistory.length} entries!`);
}

// Make functions available globally
window.loadAnalysisView = loadAnalysisView;
window.loadDashboardView = loadDashboardView;
window.loadHistoryView = loadHistoryView;
window.showResult = showResult;
window.viewReport = viewReport;
window.clearAnalysis = clearAnalysis;
window.removeFiles = removeFiles;
window.removeSpecificFile = removeSpecificFile;
window.toggleModelDetails = toggleModelDetails;
window.downloadCSVReport = downloadCSVReport;
window.downloadHTMLReport = downloadHTMLReport;
window.downloadCSVReportFromHistory = downloadCSVReportFromHistory;
window.saveToHistory = saveToHistory;
window.exportHistory = exportHistory;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.updateModelPerformance = updateModelPerformance;
window.formatDate = formatDate;
window.showImagePreview = showImagePreview;
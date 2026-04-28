// ==================== GLOBAL VARIABLES ====================
let currentView = 'overview';
let selectedRegion = 'head';
let selectedFiles = [];
let selectedFilesData = [];
let analysisHistory = JSON.parse(localStorage.getItem('analysisHistory')) || [];
let currentAnalysisResults = null;
let currentUserMode = 'public';

// Head scan variables
let headSelectedFiles = [];
let headSelectedFilesData = [];

// Body scan variables
let bodySelectedFiles = [];
let bodySelectedFilesData = [];

// Bone scan variables
let boneSelectedFiles = [];
let boneSelectedFilesData = [];

// General scan variables
let generalSelectedFiles = [];
let generalSelectedFilesData = [];

// ==================== DISEASE CONFIG ====================
const DISEASE_CONFIG = {
    head: {
        title: "Brain Tumor Detection",
        icon: "🧠",
        model: "ResNet-50",
        rules: [
            "Upload clear MRI or CT scans of the head",
            "Ensure images are not blurry or pixelated",
            "Acceptable formats: DICOM, JPG, PNG",
            "Maximum 10 images per analysis"
        ],
        examples: [
            { icon: '🧠', label: 'Brain MRI', desc: 'Tumor detection' },
            { icon: '👁️', label: 'Vision Scan', desc: 'Retinal analysis' },
            { icon: '🦷', label: 'Dental X-Ray', desc: 'Tooth decay' },
            { icon: '👂', label: 'Sinus CT', desc: 'Sinusitis' }
        ]
    },
    body: {
        title: "Chest & Body Analysis",
        icon: "🫁",
        model: "DenseNet-121",
        rules: [
            "Upload chest X-rays or CT scans",
            "Ensure proper positioning and exposure",
            "Acceptable formats: DICOM, JPG, PNG",
            "Multiple angles recommended"
        ],
        examples: [
            { icon: '🎗️', label: 'Breast', desc: 'Mammogram' },
            { icon: '🌬️', label: 'Lungs', desc: 'Nodules' },
            { icon: '🧬', label: 'Kidney', desc: 'Stones' },
            { icon: '🫁', label: 'Pneumonia', desc: 'Infection' }
        ]
    },
    bone: {
        title: "Bone Fracture Detection",
        icon: "🦴",
        model: "ResNet-50",
        rules: [
            "Upload X-rays of affected area",
            "Include multiple angles if possible",
            "Clear visibility of bone structure",
            "Mark suspected fracture area (optional)"
        ],
        examples: [
            { icon: '🦴', label: 'Arm', desc: 'Humerus/Radius' },
            { icon: '🦵', label: 'Leg', desc: 'Femur/Tibia' },
            { icon: '🖐️', label: 'Hand', desc: 'Fingers/Wrist' },
            { icon: '🦶', label: 'Foot', desc: 'Ankle/Toes' }
        ]
    }
};

// Demo results for each region
const DEMO_RESULTS = {
    head: {
        label: "No tumor detected",
        confidence: 98,
        explanation: "MRI shows normal brain anatomy. No evidence of masses, edema, or abnormal enhancement.",
        findings: ["Normal ventricular system", "No midline shift", "Gray-white matter differentiation preserved"]
    },
    body: {
        label: "Normal findings",
        confidence: 96,
        explanation: "No abnormalities detected. Lung fields are clear. Heart size normal.",
        findings: ["Clear lung fields", "Normal heart silhouette", "No effusions"]
    },
    bone: {
        label: "No fracture detected",
        confidence: 97,
        explanation: "Bone structure appears normal. No evidence of fractures or dislocations.",
        findings: ["Normal bone density", "Intact cortex", "Proper alignment"]
    }
};

// Treatment data for doctor mode
const TREATMENT_DATA = {
    head: {
        medications: [
            { name: "Dexamethasone", dosage: "4mg twice daily", purpose: "Reduce brain swelling" },
            { name: "Mannitol", dosage: "0.25-1g/kg IV", purpose: "Decrease intracranial pressure" },
            { name: "Levetiracetam", dosage: "500mg twice daily", purpose: "Seizure prophylaxis" }
        ],
        treatments: [
            "Surgical resection if accessible",
            "Stereotactic radiosurgery",
            "Radiation therapy 30-40 Gy",
            "Regular MRI monitoring every 3 months"
        ],
        notes: "Patient shows no acute distress. Monitor for increased ICP. Consider oncology referral."
    },
    body: {
        medications: [
            { name: "Amoxicillin", dosage: "875mg twice daily", purpose: "Antibiotic for 10 days" },
            { name: "Prednisone", dosage: "40mg daily", purpose: "Reduce inflammation" },
            { name: "Albuterol inhaler", dosage: "2 puffs every 4-6h", purpose: "Bronchodilation" }
        ],
        treatments: [
            "Chest physiotherapy",
            "Oxygen therapy if O2 saturation < 92%",
            "Follow-up X-ray in 6 weeks",
            "Pulmonary function tests"
        ],
        notes: "Encourage deep breathing exercises. Monitor for respiratory distress."
    },
    bone: {
        medications: [
            { name: "Ibuprofen", dosage: "600mg every 8h", purpose: "Pain management" },
            { name: "Calcium carbonate", dosage: "1000mg daily", purpose: "Bone healing" },
            { name: "Vitamin D3", dosage: "2000 IU daily", purpose: "Calcium absorption" }
        ],
        treatments: [
            "Immobilization with cast for 6 weeks",
            "Physical therapy after cast removal",
            "Weight-bearing as tolerated",
            "Follow-up X-ray in 4 weeks"
        ],
        notes: "Assess neurovascular status frequently. Check for compartment syndrome."
    }
};

// Educational data for student mode
const EDUCATIONAL_DATA = {
    head: {
        pathophysiology: "Brain tumors arise from uncontrolled cell growth in brain tissue. MRI shows abnormal tissue density with contrast enhancement due to blood-brain barrier disruption.",
        diagnostics: "T1-weighted MRI with contrast shows enhancing mass. T2/FLAIR shows peritumoral edema. CT may show calcifications.",
        treatment: "Surgical resection for accessible tumors. Radiation therapy (30-40 Gy) for residual disease.",
        studyNotes: [
            "Glioblastoma multiforme (GBM) is most common malignant primary brain tumor",
            "Meningiomas are extra-axial, often benign",
            "Contrast enhancement indicates blood-brain barrier disruption"
        ]
    },
    body: {
        pathophysiology: "Pneumonia involves alveolar inflammation and consolidation due to infectious agents. X-ray shows opacities in affected lobes.",
        diagnostics: "CXR: lobar or interstitial opacities, air bronchograms. CT: ground-glass opacities.",
        treatment: "Antibiotics based on suspected organism. Supportive care with oxygen if needed.",
        studyNotes: [
            "Community-acquired pneumonia: Streptococcus pneumoniae most common",
            "Consolidation on X-ray indicates alveolar filling with exudate",
            "Air bronchograms are pathognomonic for consolidation"
        ]
    },
    bone: {
        pathophysiology: "Fracture occurs when bone stress exceeds structural strength. X-ray shows cortical disruption, angulation, or displacement.",
        diagnostics: "X-ray in 2 orthogonal views: look for cortical break, angulation, displacement.",
        treatment: "Reduction, immobilization with cast or splint, rehabilitation.",
        studyNotes: [
            "Greenstick fractures: incomplete fractures in children",
            "Salter-Harris classification for pediatric fractures",
            "Neurovascular assessment is critical after casting"
        ]
    }
};

// ==================== UTILITY FUNCTIONS ====================
function getFormattedDate() {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

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
        toast.remove();
    }, 3000);
}

function updateActiveNav(view) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.view === view) {
            item.classList.add('active');
        }
    });
}

// ==================== MODE-SPECIFIC CONTENT ====================
function generateModeSpecificContent(region, baseResult, results) {
    if (currentUserMode === 'public') {
        return `
            <div class="mode-content" style="background: #e8f0fe; padding: 20px; border-radius: 16px; margin: 20px 0; border-left: 5px solid var(--secondary);">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                    <span style="font-size: 24px;">👥</span>
                    <h3 style="margin: 0; color: var(--primary);">Public Information & Recommendations</h3>
                </div>
                
                <div style="background: white; padding: 15px; border-radius: 12px; margin-bottom: 15px;">
                    <h4 style="color: var(--primary); margin-bottom: 10px;">📋 What This Means:</h4>
                    <p>${baseResult.explanation}</p>
                </div>
                
                <div style="background: white; padding: 15px; border-radius: 12px; margin-bottom: 15px;">
                    <h4 style="color: var(--primary); margin-bottom: 10px;">⚕️ Recommendations:</h4>
                    <ul style="padding-left: 20px;">
                        <li>Consult with a healthcare provider for proper evaluation</li>
                        <li>Keep this report for your medical records</li>
                        <li>Follow up with your doctor within 2 weeks</li>
                        <li>Maintain a healthy lifestyle and regular checkups</li>
                    </ul>
                </div>
                
                <div style="background: #fff3cd; padding: 15px; border-radius: 12px;">
                    <h4 style="color: #856404; margin-bottom: 10px;">⚠️ Important Note:</h4>
                    <p style="color: #856404;">This is an AI-assisted analysis and should not replace professional medical advice. Always consult with a qualified healthcare provider.</p>
                </div>
            </div>
        `;
    } else if (currentUserMode === 'doctor') {
        const regionData = TREATMENT_DATA[region] || TREATMENT_DATA.body;
        
        return `
            <div class="mode-content" style="background: #e8f4e8; padding: 20px; border-radius: 16px; margin: 20px 0; border-left: 5px solid #28a745;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                    <span style="font-size: 24px;">👨‍⚕️</span>
                    <h3 style="margin: 0; color: #28a745;">Clinical Treatment Plan</h3>
                </div>
                
                <div style="background: white; padding: 15px; border-radius: 12px; margin-bottom: 15px;">
                    <h4 style="color: #28a745; margin-bottom: 15px;">💊 Prescribed Medications:</h4>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f0f0f0;">
                                <th style="padding: 8px; text-align: left;">Medication</th>
                                <th style="padding: 8px; text-align: left;">Dosage</th>
                                <th style="padding: 8px; text-align: left;">Purpose</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${regionData.medications.map(med => `
                                <tr style="border-bottom: 1px solid #ddd;">
                                    <td style="padding: 8px;"><strong>${med.name}</strong></td>
                                    <td style="padding: 8px;">${med.dosage}</td>
                                    <td style="padding: 8px;">${med.purpose}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div style="background: white; padding: 15px; border-radius: 12px; margin-bottom: 15px;">
                    <h4 style="color: #28a745; margin-bottom: 10px;">🏥 Recommended Treatments:</h4>
                    <ul style="padding-left: 20px;">
                        ${regionData.treatments.map(t => `<li>${t}</li>`).join('')}
                    </ul>
                </div>
                
                <div style="background: #fff3cd; padding: 15px; border-radius: 12px;">
                    <h4 style="color: #856404; margin-bottom: 10px;">📝 Clinical Notes:</h4>
                    <p>${regionData.notes}</p>
                    <p style="margin-top: 10px; font-size: 12px;">Follow-up scheduled in 2 weeks. Monitor for adverse reactions.</p>
                </div>
            </div>
        `;
    } else if (currentUserMode === 'student') {
        const edu = EDUCATIONAL_DATA[region] || EDUCATIONAL_DATA.body;
        
        return `
            <div class="mode-content" style="background: #fff4e6; padding: 20px; border-radius: 16px; margin: 20px 0; border-left: 5px solid #fd7e14;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                    <span style="font-size: 24px;">📚</span>
                    <h3 style="margin: 0; color: #fd7e14;">Educational Module</h3>
                </div>
                
                <div style="background: white; padding: 15px; border-radius: 12px; margin-bottom: 15px;">
                    <h4 style="color: #fd7e14; margin-bottom: 10px;">🔬 Pathophysiology:</h4>
                    <p>${edu.pathophysiology}</p>
                </div>
                
                <div style="background: white; padding: 15px; border-radius: 12px; margin-bottom: 15px;">
                    <h4 style="color: #fd7e14; margin-bottom: 10px;">🩻 Diagnostic Criteria:</h4>
                    <p>${edu.diagnostics}</p>
                </div>
                
                <div style="background: white; padding: 15px; border-radius: 12px; margin-bottom: 15px;">
                    <h4 style="color: #fd7e14; margin-bottom: 10px;">💊 Treatment Principles:</h4>
                    <p>${edu.treatment}</p>
                </div>
                
                <div style="background: #e7f3ff; padding: 15px; border-radius: 12px;">
                    <h4 style="color: #0066cc; margin-bottom: 10px;">📝 Study Notes:</h4>
                    <ul style="padding-left: 20px;">
                        ${edu.studyNotes.map(note => `<li style="margin-bottom: 8px;">${note}</li>`).join('')}
                    </ul>
                    <p style="margin-top: 15px; font-size: 12px; color: #666;">Reference: Robbins Pathology, Harrison's Internal Medicine</p>
                </div>
            </div>
        `;
    }
    return '';
}

// ==================== VIEW FUNCTIONS ====================
function showOverviewView() {
    currentView = 'overview';
    updateActiveNav('overview');
    
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    
    const totalAnalyses = analysisHistory.length;
    

    
    const successfulAnalyses = analysisHistory.filter(i => 
        i.findingClass === 'success' || i.overallStatus === 'success'
    ).length;
    
    const accuracy = totalAnalyses > 0 ? Math.round((successfulAnalyses / totalAnalyses) * 100) : 98;
    const successRate = totalAnalyses > 0 ? `${successfulAnalyses}/${totalAnalyses}` : '0/0';
    const recentAnalyses = analysisHistory.slice(0, 5);
    
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <div class="analysis-container">
            <header class="dashboard-header">
                <h1>Medical Scan Analysis</h1>
                <div class="header-actions">
                    <div class="date-badge">📅 ${formattedDate}</div>
                    <span class="settings-icon" onclick="toggleSettings()">⚙️</span>
                </div>
            </header>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-details">
                        <h3>Total Analyses</h3>
                        <p class="stat-value">${totalAnalyses}</p>
                        <span class="stat-trend">${totalAnalyses > 0 ? '↑ Lifetime' : 'No data yet'}</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">🎯</div>
                    <div class="stat-details">
                        <h3>Accuracy</h3>
                        <p class="stat-value">${accuracy}%</p>
                        <span class="stat-trend">${totalAnalyses > 0 ? 'Based on ' + totalAnalyses + ' scans' : 'Model average'}</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⏳</div>
                    <div class="stat-details">
                        <h3>Avg. Time</h3>
                        <p class="stat-value">2.4s</p>
                        <span class="stat-trend">per analysis</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">✅</div>
                    <div class="stat-details">
                        <h3>Success Rate</h3>
                        <p class="stat-value">${successRate}</p>
                        <span class="stat-trend">${totalAnalyses > 0 ? successfulAnalyses + ' completed' : 'No data yet'}</span>
                    </div>
                </div>
            </div>

            <div class="quick-actions">
                <div class="action-card" onclick="showGeneralScanView()">
                    <div class="action-icon">🔬</div>
                    <h4>General Scan</h4>
                    <p>Quick image upload</p>
                </div>
                <div class="action-card" onclick="showHeadScanView()">
                    <div class="action-icon">🧠</div>
                    <h4>Head Scan</h4>
                    <p>Brain, Vision, Dental</p>
                </div>
                <div class="action-card" onclick="showBodyScanView()">
                    <div class="action-icon">🫁</div>
                    <h4>Body Scan</h4>
                    <p>Chest, Lungs, Organs</p>
                </div>
                <div class="action-card" onclick="showBoneScanView()">
                    <div class="action-icon">🦴</div>
                    <h4>Bone Fracture</h4>
                    <p>Fracture detection</p>
                </div>
            </div>

            <div class="recent-analyses">
                <div class="section-header">
                    <h2>Recent Analyses</h2>
                    <a href="#" class="view-all" onclick="showHistoryView(); return false;">View All →</a>
                </div>
                
                ${recentAnalyses.length > 0 ? `
                <div class="analyses-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Region</th>
                                <th>Finding</th>
                                <th>Confidence</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${recentAnalyses.map(item => `
                                <tr>
                                    <td>${item.date || 'N/A'}</td>
                                    <td>${item.region || 'N/A'}</td>
                                    <td><span class="badge ${item.overallStatus || item.findingClass || 'success'}">${item.overallFinding || item.finding || 'N/A'}</span></td>
                                    <td>
                                        <div class="confidence-cell">
                                            <span>${item.avgConfidence || item.confidence || 0}%</span>
                                            <div class="confidence-bar"><div style="width:${item.avgConfidence || item.confidence || 0}%"></div></div>
                                        </div>
                                    </td>
                                    <td>
                                        <button class="btn-icon" onclick="downloadCSVReportFromHistory('${item.id}')" title="Download CSV">📊</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ` : `
                <div style="text-align: center; padding: 40px;">
                    <p style="color: var(--gray-500);">No analyses yet. Start a new scan!</p>
                </div>
                `}
            </div>
        </div>
    `;
}

// ==================== HEAD SCAN FUNCTIONS ====================
function showHeadScanView() {
    currentView = 'head';
    updateActiveNav('head');
    
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;
    
    const config = DISEASE_CONFIG.head;
    
    mainContent.innerHTML = `
        <div class="analysis-container">
            <header class="dashboard-header">
                <h1>🧠 Head Scan Analysis</h1>
                <div class="header-actions">
                    <div class="date-badge">📅 ${getFormattedDate()}</div>
                    <span class="settings-icon" onclick="toggleSettings()">⚙️</span>
                </div>
            </header>

            <div class="rules-card">
                <div class="rules-title">
                    <span>📋</span> Guidelines for Head Scans
                </div>
                <ul class="rules-list">
                    <li>Upload clear MRI or CT scans of the head</li>
                    <li>Ensure images are not blurry or pixelated</li>
                    <li>Acceptable formats: DICOM, JPG, PNG</li>
                    <li>Maximum 10 images per analysis</li>
                </ul>
            </div>

            <div class="rules-card">
                <div class="rules-title">
                    <span>🖼️</span> Example Images
                </div>
                <div class="examples-grid">
                    ${config.examples.map(ex => `
                        <div class="example-card">
                            <div class="example-icon">${ex.icon}</div>
                            <div class="example-label">${ex.label}</div>
                            <div class="example-desc">${ex.desc}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="upload-section">
                <h2 style="text-align: center; margin-bottom: 30px;">📤 Upload Head Scan Images</h2>
                <div class="upload-area" onclick="document.getElementById('headFileInput').click()">
                    <div class="upload-icon">📤</div>
                    <h3>Click to upload or drag and drop</h3>
                    <p>JPG, PNG, DICOM (Max 50MB each)</p>
                </div>
                <input type="file" id="headFileInput" accept=".jpg,.jpeg,.png,.dcm" style="display: none;" multiple onchange="handleHeadFileSelect(event)">
                
                <div style="display: flex; justify-content: flex-end; gap: 20px; margin-top: 30px;">
                    <button class="btn btn-outline" onclick="clearHeadUpload()">Clear</button>
                    <button class="btn btn-primary btn-large" id="headAnalyzeBtn" disabled onclick="analyzeHeadImages()">Analyze Images (0)</button>
                </div>
            </div>

            <div id="headPreviewSection" style="display: none; margin-top: 20px;"></div>
            <div id="headResultsSection" style="display: none; margin-top: 20px;"></div>
        </div>
    `;
}

function handleHeadFileSelect(event) {
    const files = Array.from(event.target.files);
    headSelectedFiles = files;
    
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
        headSelectedFilesData = filesData;
        showHeadFilePreview(files);
    });
    
    const analyzeBtn = document.getElementById('headAnalyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = `Analyze Images (${files.length})`;
    }
}

function showHeadFilePreview(files) {
    const previewSection = document.getElementById('headPreviewSection');
    if (!previewSection) return;
    
    previewSection.style.display = 'block';
    
    const previewHtml = files.map((file, index) => {
        const fileData = headSelectedFilesData[index];
        const isImage = fileData && fileData.data && fileData.data.startsWith('data:image');
        
        return `
            <div class="preview-item">
                <div class="preview-image" onclick="showImagePreview(headSelectedFilesData[${index}])" style="cursor: pointer;">
                    ${isImage ? 
                        `<img src="${fileData.data}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;" alt="preview">` : 
                        '🖼️'
                    }
                </div>
                <div class="preview-name">${file.name.substring(0, 15)}${file.name.length > 15 ? '...' : ''}</div>
                <div class="preview-size">${(file.size / 1024).toFixed(1)} KB</div>
                <button class="preview-remove" onclick="removeHeadFile(${index})">✕</button>
            </div>
        `;
    }).join('');
    
    previewSection.innerHTML = `
        <div class="preview-section">
            <h3>Selected Images (${files.length})</h3>
            <div class="preview-grid">
                ${previewHtml}
            </div>
        </div>
    `;
}

function showImagePreview(fileData) {
    if (!fileData || !fileData.data) return;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        cursor: pointer;
    `;
    
    modal.innerHTML = `
        <img src="${fileData.data}" style="max-width: 90%; max-height: 90%; border-radius: 10px;">
        <button style="position: absolute; top: 20px; right: 20px; background: white; border: none; width: 40px; height: 40px; border-radius: 50%; font-size: 20px; cursor: pointer;" onclick="this.parentElement.remove()">✕</button>
    `;
    
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
    
    document.body.appendChild(modal);
}

function removeHeadFile(index) {
    headSelectedFiles.splice(index, 1);
    headSelectedFilesData.splice(index, 1);
    
    const analyzeBtn = document.getElementById('headAnalyzeBtn');
    
    if (headSelectedFiles.length === 0) {
        if (analyzeBtn) {
            analyzeBtn.disabled = true;
            analyzeBtn.textContent = 'Analyze Images (0)';
        }
        document.getElementById('headPreviewSection').style.display = 'none';
    } else {
        if (analyzeBtn) {
            analyzeBtn.textContent = `Analyze Images (${headSelectedFiles.length})`;
        }
        showHeadFilePreview(headSelectedFiles);
    }
}

function clearHeadUpload() {
    headSelectedFiles = [];
    headSelectedFilesData = [];
    
    const analyzeBtn = document.getElementById('headAnalyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.disabled = true;
        analyzeBtn.textContent = 'Analyze Images (0)';
    }
    
    const previewSection = document.getElementById('headPreviewSection');
    if (previewSection) previewSection.style.display = 'none';
    
    const resultsSection = document.getElementById('headResultsSection');
    if (resultsSection) resultsSection.style.display = 'none';
    
    const fileInput = document.getElementById('headFileInput');
    if (fileInput) fileInput.value = '';
}

function analyzeHeadImages() {
    // Updated to use REAL API - calls diagnosis.js
    analyzeRealHeadImages(headSelectedFiles, 'brain');
}

function downloadHeadCSV() {
    if (!headSelectedFiles.length || !currentAnalysisResults) return;
    
    const data = currentAnalysisResults;
    const config = DISEASE_CONFIG.head;
    
    let csvContent = "Image #,Image Name,Finding,Confidence (%),Interpretation,Key Findings,Model,Disease\n";
    
    data.results.forEach((r, i) => {
        const imageName = r.imageName.replace(/"/g, '""');
        const findingsText = r.findings ? r.findings.join('; ') : '';
        csvContent += `${i + 1},"${imageName}",${r.finding},${r.confidence},"${r.explanation}","${findingsText}",${config.model},${config.title}\n`;
    });
    
    csvContent += `\n----- SUMMARY -----\n`;
    csvContent += `Total Images,${data.imageCount}\n`;
    csvContent += `Average Confidence,${data.avgConfidence}%\n`;
    csvContent += `Analysis Date,${data.date}\n`;
    csvContent += `Disease,${config.title}\n`;
    csvContent += `Model,${config.model}\n`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `head_analysis_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    showToast('✅ CSV report downloaded!');
}

// ==================== HTML REPORT FUNCTIONS ====================
function downloadHeadHTML() {
    if (!headSelectedFiles.length || !currentAnalysisResults) return;
    
    const data = currentAnalysisResults;
    const config = DISEASE_CONFIG.head;
    
    const htmlContent = generateHTMLReport(data, config);
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `head_report_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    // Open in new tab
    const newWindow = window.open();
    if (newWindow) {
        newWindow.document.write(htmlContent);
    }
    
    showToast('✅ HTML report generated!');
}

// ==================== BODY SCAN FUNCTIONS ====================
function showBodyScanView() {
    currentView = 'body';
    updateActiveNav('body');
    
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;
    
    const config = DISEASE_CONFIG.body;
    
    mainContent.innerHTML = `
        <div class="analysis-container">
            <header class="dashboard-header">
                <h1>🫁 Body Scan Analysis</h1>
                <div class="header-actions">
                    <div class="date-badge">📅 ${getFormattedDate()}</div>
                    <span class="settings-icon" onclick="toggleSettings()">⚙️</span>
                </div>
            </header>

            <div class="rules-card">
                <div class="rules-title">
                    <span>📋</span> Guidelines for Body Scans
                </div>
                <ul class="rules-list">
                    <li>Upload chest X-rays or CT scans</li>
                    <li>Ensure proper positioning and exposure</li>
                    <li>Acceptable formats: DICOM, JPG, PNG</li>
                    <li>Multiple angles recommended</li>
                </ul>
            </div>

            <div class="rules-card">
                <div class="rules-title">
                    <span>🖼️</span> Example Images
                </div>
                <div class="examples-grid">
                    ${config.examples.map(ex => `
                        <div class="example-card">
                            <div class="example-icon">${ex.icon}</div>
                            <div class="example-label">${ex.label}</div>
                            <div class="example-desc">${ex.desc}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="upload-section">
                <h2 style="text-align: center; margin-bottom: 30px;">📤 Upload Body Scan Images</h2>
                <div class="upload-area" onclick="document.getElementById('bodyFileInput').click()">
                    <div class="upload-icon">📤</div>
                    <h3>Click to upload or drag and drop</h3>
                    <p>JPG, PNG, DICOM (Max 50MB each)</p>
                </div>
                <input type="file" id="bodyFileInput" accept=".jpg,.jpeg,.png,.dcm" style="display: none;" multiple onchange="handleBodyFileSelect(event)">
                
                <div style="display: flex; justify-content: flex-end; gap: 20px; margin-top: 30px;">
                    <button class="btn btn-outline" onclick="clearBodyUpload()">Clear</button>
                    <button class="btn btn-primary btn-large" id="bodyAnalyzeBtn" disabled onclick="analyzeBodyImages()">Analyze Images (0)</button>
                </div>
            </div>

            <div id="bodyPreviewSection" style="display: none; margin-top: 20px;"></div>
            <div id="bodyResultsSection" style="display: none; margin-top: 20px;"></div>
        </div>
    `;
}

function handleBodyFileSelect(event) {
    const files = Array.from(event.target.files);
    bodySelectedFiles = files;
    
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
        bodySelectedFilesData = filesData;
        showBodyFilePreview(files);
    });
    
    const analyzeBtn = document.getElementById('bodyAnalyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = `Analyze Images (${files.length})`;
    }
}

function showBodyFilePreview(files) {
    const previewSection = document.getElementById('bodyPreviewSection');
    if (!previewSection) return;
    
    previewSection.style.display = 'block';
    
    const previewHtml = files.map((file, index) => {
        const fileData = bodySelectedFilesData[index];
        const isImage = fileData && fileData.data && fileData.data.startsWith('data:image');
        
        return `
            <div class="preview-item">
                <div class="preview-image" onclick="showImagePreview(bodySelectedFilesData[${index}])" style="cursor: pointer;">
                    ${isImage ? 
                        `<img src="${fileData.data}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;" alt="preview">` : 
                        '🖼️'
                    }
                </div>
                <div class="preview-name">${file.name.substring(0, 15)}${file.name.length > 15 ? '...' : ''}</div>
                <div class="preview-size">${(file.size / 1024).toFixed(1)} KB</div>
                <button class="preview-remove" onclick="removeBodyFile(${index})">✕</button>
            </div>
        `;
    }).join('');
    
    previewSection.innerHTML = `
        <div class="preview-section">
            <h3>Selected Images (${files.length})</h3>
            <div class="preview-grid">
                ${previewHtml}
            </div>
        </div>
    `;
}

function removeBodyFile(index) {
    bodySelectedFiles.splice(index, 1);
    bodySelectedFilesData.splice(index, 1);
    
    const analyzeBtn = document.getElementById('bodyAnalyzeBtn');
    
    if (bodySelectedFiles.length === 0) {
        if (analyzeBtn) {
            analyzeBtn.disabled = true;
            analyzeBtn.textContent = 'Analyze Images (0)';
        }
        document.getElementById('bodyPreviewSection').style.display = 'none';
    } else {
        if (analyzeBtn) {
            analyzeBtn.textContent = `Analyze Images (${bodySelectedFiles.length})`;
        }
        showBodyFilePreview(bodySelectedFiles);
    }
}

function clearBodyUpload() {
    bodySelectedFiles = [];
    bodySelectedFilesData = [];
    
    const analyzeBtn = document.getElementById('bodyAnalyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.disabled = true;
        analyzeBtn.textContent = 'Analyze Images (0)';
    }
    
    const previewSection = document.getElementById('bodyPreviewSection');
    if (previewSection) previewSection.style.display = 'none';
    
    const resultsSection = document.getElementById('bodyResultsSection');
    if (resultsSection) resultsSection.style.display = 'none';
    
    const fileInput = document.getElementById('bodyFileInput');
    if (fileInput) fileInput.value = '';
}

function analyzeBodyImages() {
    // Updated to use REAL API - calls diagnosis.js
    analyzeRealBodyImages(bodySelectedFiles, 'pneumonia');
}

function downloadBodyCSV() {
    if (!bodySelectedFiles.length || !currentAnalysisResults) return;
    
    const data = currentAnalysisResults;
    const config = DISEASE_CONFIG.body;
    
    let csvContent = "Image #,Image Name,Finding,Confidence (%),Interpretation,Key Findings,Model,Disease\n";
    
    data.results.forEach((r, i) => {
        const imageName = r.imageName.replace(/"/g, '""');
        const findingsText = r.findings ? r.findings.join('; ') : '';
        csvContent += `${i + 1},"${imageName}",${r.finding},${r.confidence},"${r.explanation}","${findingsText}",${config.model},${config.title}\n`;
    });
    
    csvContent += `\n----- SUMMARY -----\n`;
    csvContent += `Total Images,${data.imageCount}\n`;
    csvContent += `Average Confidence,${data.avgConfidence}%\n`;
    csvContent += `Analysis Date,${data.date}\n`;
    csvContent += `Disease,${config.title}\n`;
    csvContent += `Model,${config.model}\n`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `body_analysis_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    showToast('✅ CSV report downloaded!');
}

function downloadBodyHTML() {
    if (!bodySelectedFiles.length || !currentAnalysisResults) return;
    
    const data = currentAnalysisResults;
    const config = DISEASE_CONFIG.body;
    
    const htmlContent = generateHTMLReport(data, config);
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `body_report_${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    
    const newWindow = window.open();
    if (newWindow) {
        newWindow.document.write(htmlContent);
    }
    
    showToast('✅ HTML report generated!');
}

// ==================== BONE SCAN FUNCTIONS ====================
function showBoneScanView() {
    currentView = 'bone';
    updateActiveNav('bone');
    
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;
    
    const config = DISEASE_CONFIG.bone;
    
    mainContent.innerHTML = `
        <div class="analysis-container">
            <header class="dashboard-header">
                <h1>🦴 Bone Fracture Analysis</h1>
                <div class="header-actions">
                    <div class="date-badge">📅 ${getFormattedDate()}</div>
                    <span class="settings-icon" onclick="toggleSettings()">⚙️</span>
                </div>
            </header>

            <div class="rules-card">
                <div class="rules-title">
                    <span>📋</span> Guidelines for Bone Scans
                </div>
                <ul class="rules-list">
                    <li>Upload X-rays of affected area</li>
                    <li>Include multiple angles if possible</li>
                    <li>Clear visibility of bone structure</li>
                    <li>Mark suspected fracture area (optional)</li>
                </ul>
            </div>

            <div class="rules-card">
                <div class="rules-title">
                    <span>🖼️</span> Example Images
                </div>
                <div class="examples-grid">
                    ${config.examples.map(ex => `
                        <div class="example-card">
                            <div class="example-icon">${ex.icon}</div>
                            <div class="example-label">${ex.label}</div>
                            <div class="example-desc">${ex.desc}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="upload-section">
                <h2 style="text-align: center; margin-bottom: 30px;">📤 Upload Bone Scan Images</h2>
                <div class="upload-area" onclick="document.getElementById('boneFileInput').click()">
                    <div class="upload-icon">📤</div>
                    <h3>Click to upload or drag and drop</h3>
                    <p>JPG, PNG, DICOM (Max 50MB each)</p>
                </div>
                <input type="file" id="boneFileInput" accept=".jpg,.jpeg,.png,.dcm" style="display: none;" multiple onchange="handleBoneFileSelect(event)">
                
                <div style="display: flex; justify-content: flex-end; gap: 20px; margin-top: 30px;">
                    <button class="btn btn-outline" onclick="clearBoneUpload()">Clear</button>
                    <button class="btn btn-primary btn-large" id="boneAnalyzeBtn" disabled onclick="analyzeBoneImages()">Analyze Images (0)</button>
                </div>
            </div>

            <div id="bonePreviewSection" style="display: none; margin-top: 20px;"></div>
            <div id="boneResultsSection" style="display: none; margin-top: 20px;"></div>
        </div>
    `;
}

function handleBoneFileSelect(event) {
    const files = Array.from(event.target.files);
    boneSelectedFiles = files;
    
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
        boneSelectedFilesData = filesData;
        showBoneFilePreview(files);
    });
    
    const analyzeBtn = document.getElementById('boneAnalyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = `Analyze Images (${files.length})`;
    }
}

function showBoneFilePreview(files) {
    const previewSection = document.getElementById('bonePreviewSection');
    if (!previewSection) return;
    
    previewSection.style.display = 'block';
    
    const previewHtml = files.map((file, index) => {
        const fileData = boneSelectedFilesData[index];
        const isImage = fileData && fileData.data && fileData.data.startsWith('data:image');
        
        return `
            <div class="preview-item">
                <div class="preview-image" onclick="showImagePreview(boneSelectedFilesData[${index}])" style="cursor: pointer;">
                    ${isImage ? 
                        `<img src="${fileData.data}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;" alt="preview">` : 
                        '🖼️'
                    }
                </div>
                <div class="preview-name">${file.name.substring(0, 15)}${file.name.length > 15 ? '...' : ''}</div>
                <div class="preview-size">${(file.size / 1024).toFixed(1)} KB</div>
                <button class="preview-remove" onclick="removeBoneFile(${index})">✕</button>
            </div>
        `;
    }).join('');
    
    previewSection.innerHTML = `
        <div class="preview-section">
            <h3>Selected Images (${files.length})</h3>
            <div class="preview-grid">
                ${previewHtml}
            </div>
        </div>
    `;
}

function removeBoneFile(index) {
    boneSelectedFiles.splice(index, 1);
    boneSelectedFilesData.splice(index, 1);
    
    const analyzeBtn = document.getElementById('boneAnalyzeBtn');
    
    if (boneSelectedFiles.length === 0) {
        if (analyzeBtn) {
            analyzeBtn.disabled = true;
            analyzeBtn.textContent = 'Analyze Images (0)';
        }
        document.getElementById('bonePreviewSection').style.display = 'none';
    } else {
        if (analyzeBtn) {
            analyzeBtn.textContent = `Analyze Images (${boneSelectedFiles.length})`;
        }
        showBoneFilePreview(boneSelectedFiles);
    }
}

function clearBoneUpload() {
    boneSelectedFiles = [];
    boneSelectedFilesData = [];
    
    const analyzeBtn = document.getElementById('boneAnalyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.disabled = true;
        analyzeBtn.textContent = 'Analyze Images (0)';
    }
    
    const previewSection = document.getElementById('bonePreviewSection');
    if (previewSection) previewSection.style.display = 'none';
    
    const resultsSection = document.getElementById('boneResultsSection');
    if (resultsSection) resultsSection.style.display = 'none';
    
    const fileInput = document.getElementById('boneFileInput');
    if (fileInput) fileInput.value = '';
}

function analyzeBoneImages() {
    analyzeRealBoneImages(boneSelectedFiles);
}

function downloadBoneCSV() {
    if (!boneSelectedFiles.length || !currentAnalysisResults) return;
    
    const data = currentAnalysisResults;
    const config = DISEASE_CONFIG.bone;
    
    let csvContent = "Image #,Image Name,Finding,Confidence (%),Interpretation,Key Findings,Model,Disease\n";
    
    data.results.forEach((r, i) => {
        const imageName = r.imageName.replace(/"/g, '""');
        const findingsText = r.findings ? r.findings.join('; ') : '';
        csvContent += `${i + 1},"${imageName}",${r.finding},${r.confidence},"${r.explanation}","${findingsText}",${config.model},${config.title}\n`;
    });
    
    csvContent += `\n----- SUMMARY -----\n`;
    csvContent += `Total Images,${data.imageCount}\n`;
    csvContent += `Average Confidence,${data.avgConfidence}%\n`;
    csvContent += `Analysis Date,${data.date}\n`;
    csvContent += `Disease,${config.title}\n`;
    csvContent += `Model,${config.model}\n`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bone_analysis_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    showToast('✅ CSV report downloaded!');
}

function downloadBoneHTML() {
    if (!boneSelectedFiles.length || !currentAnalysisResults) return;
    
    const data = currentAnalysisResults;
    const config = DISEASE_CONFIG.bone;
    
    const htmlContent = generateHTMLReport(data, config);
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bone_report_${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    
    const newWindow = window.open();
    if (newWindow) {
        newWindow.document.write(htmlContent);
    }
    
    showToast('✅ HTML report generated!');
}

// ==================== GENERAL SCAN FUNCTIONS ====================
function showGeneralScanView() {
    currentView = 'general';
    updateActiveNav('general');
    
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <div class="analysis-container">
            <header class="dashboard-header">
                <h1>General Scan</h1>
                <div class="header-actions">
                    <div class="date-badge">📅 ${getFormattedDate()}</div>
                    <span class="settings-icon" onclick="toggleSettings()">⚙️</span>
                </div>
            </header>

            <div style="max-width: 800px; margin: 40px auto;">
                <div class="upload-section">
                    <h2 style="text-align: center; margin-bottom: 30px;">📤 Upload Images for Analysis</h2>
                    <div class="upload-area" onclick="document.getElementById('generalFileInput').click()">
                        <div class="upload-icon">📤</div>
                        <h3>Click to upload or drag and drop</h3>
                        <p>JPG, PNG, DICOM (Max 50MB each)</p>
                    </div>
                    <input type="file" id="generalFileInput" accept=".jpg,.jpeg,.png,.dcm" style="display: none;" multiple onchange="handleGeneralFileSelect(event)">
                    
                    <div style="display: flex; justify-content: center; gap: 20px; margin-top: 30px;">
                        <button class="btn btn-outline" onclick="clearGeneralUpload()">Clear</button>
                        <button class="btn btn-primary btn-large" id="generalAnalyzeBtn" disabled onclick="analyzeGeneralImages()">Analyze Images (0)</button>
                    </div>
                </div>

                <div id="generalPreviewSection" style="display: none; margin-top: 20px;"></div>
                <div id="generalResultsSection" style="display: none; margin-top: 20px;"></div>
            </div>
        </div>
    `;
}

function handleGeneralFileSelect(event) {
    const files = Array.from(event.target.files);
    generalSelectedFiles = files;
    
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
        generalSelectedFilesData = filesData;
        showGeneralFilePreview(files);
    });
    
    const analyzeBtn = document.getElementById('generalAnalyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = `Analyze Images (${files.length})`;
    }
}

function showGeneralFilePreview(files) {
    const previewSection = document.getElementById('generalPreviewSection');
    if (!previewSection) return;
    
    previewSection.style.display = 'block';
    
    const previewHtml = files.map((file, index) => {
        const fileData = generalSelectedFilesData[index];
        const isImage = fileData && fileData.data && fileData.data.startsWith('data:image');
        
        return `
            <div class="preview-item">
                <div class="preview-image" onclick="showImagePreview(generalSelectedFilesData[${index}])" style="cursor: pointer;">
                    ${isImage ? 
                        `<img src="${fileData.data}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;" alt="preview">` : 
                        '🖼️'
                    }
                </div>
                <div class="preview-name">${file.name.substring(0, 15)}${file.name.length > 15 ? '...' : ''}</div>
                <div class="preview-size">${(file.size / 1024).toFixed(1)} KB</div>
                <button class="preview-remove" onclick="removeGeneralFile(${index})">✕</button>
            </div>
        `;
    }).join('');
    
    previewSection.innerHTML = `
        <div class="preview-section">
            <h3>Selected Images (${files.length})</h3>
            <div class="preview-grid">
                ${previewHtml}
            </div>
        </div>
    `;
}

function removeGeneralFile(index) {
    generalSelectedFiles.splice(index, 1);
    generalSelectedFilesData.splice(index, 1);
    
    const analyzeBtn = document.getElementById('generalAnalyzeBtn');
    
    if (generalSelectedFiles.length === 0) {
        if (analyzeBtn) {
            analyzeBtn.disabled = true;
            analyzeBtn.textContent = 'Analyze Images (0)';
        }
        document.getElementById('generalPreviewSection').style.display = 'none';
    } else {
        if (analyzeBtn) {
            analyzeBtn.textContent = `Analyze Images (${generalSelectedFiles.length})`;
        }
        showGeneralFilePreview(generalSelectedFiles);
    }
}

function clearGeneralUpload() {
    generalSelectedFiles = [];
    generalSelectedFilesData = [];
    
    const analyzeBtn = document.getElementById('generalAnalyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.disabled = true;
        analyzeBtn.textContent = 'Analyze Images (0)';
    }
    
    const previewSection = document.getElementById('generalPreviewSection');
    if (previewSection) previewSection.style.display = 'none';
    
    const resultsSection = document.getElementById('generalResultsSection');
    if (resultsSection) resultsSection.style.display = 'none';
    
    const fileInput = document.getElementById('generalFileInput');
    if (fileInput) fileInput.value = '';
}

function analyzeGeneralImages() {
    analyzeRealBodyImages(generalSelectedFiles, 'pneumonia');
}

function downloadGeneralCSV() {
    if (!generalSelectedFiles.length || !currentAnalysisResults) return;
    
    const data = currentAnalysisResults;
    
    let csvContent = "Image #,Image Name,Finding,Confidence (%),Interpretation,Key Findings,Model,Disease\n";
    
    data.results.forEach((r, i) => {
        const imageName = r.imageName.replace(/"/g, '""');
        const findingsText = r.findings ? r.findings.join('; ') : '';
        csvContent += `${i + 1},"${imageName}",${r.finding},${r.confidence},"${r.explanation}","${findingsText}",${data.model},${data.disease}\n`;
    });
    
    csvContent += `\n----- SUMMARY -----\n`;
    csvContent += `Total Images,${data.imageCount}\n`;
    csvContent += `Average Confidence,${data.avgConfidence}%\n`;
    csvContent += `Analysis Date,${data.date}\n`;
    csvContent += `Disease,${data.disease}\n`;
    csvContent += `Model,${data.model}\n`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `general_analysis_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    showToast('✅ CSV report downloaded!');
}

function downloadGeneralHTML() {
    if (!generalSelectedFiles.length || !currentAnalysisResults) return;
    
    const data = currentAnalysisResults;
    const config = {
        title: data.disease,
        model: data.model
    };
    
    const htmlContent = generateHTMLReport(data, config);
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `general_report_${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    
    const newWindow = window.open();
    if (newWindow) {
        newWindow.document.write(htmlContent);
    }
    
    showToast('✅ HTML report generated!');
}

// ==================== HTML REPORT GENERATOR ====================
function generateHTMLReport(data, config) {
    const modeSpecificHTML = currentUserMode === 'public' ? `
        <div style="background: #e8f0fe; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 5px solid #2b6ef0;">
            <h3 style="color: #0a2540; margin-top: 0;">👥 Public Information</h3>
            <p>${data.results[0].explanation}</p>
            <h4>Recommendations:</h4>
            <ul>
                <li>Consult with healthcare provider</li>
                <li>Follow up in 2 weeks</li>
                <li>Keep this report for your records</li>
            </ul>
            <p style="color: #856404; background: #fff3cd; padding: 10px; border-radius: 5px; margin-top: 15px;">
                ⚠️ This is an AI-assisted analysis. Always consult with a qualified healthcare provider.
            </p>
        </div>
    ` : currentUserMode === 'doctor' ? `
        <div style="background: #e8f4e8; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 5px solid #28a745;">
            <h3 style="color: #28a745; margin-top: 0;">👨‍⚕️ Clinical Summary</h3>
            <p><strong>Primary Finding:</strong> ${data.overallFinding}</p>
            <p><strong>Confidence:</strong> ${data.avgConfidence}%</p>
            <p><strong>Images Analyzed:</strong> ${data.imageCount}</p>
            <p style="margin-top: 15px;">Refer to the clinical treatment plan in the dashboard for detailed recommendations.</p>
        </div>
    ` : `
        <div style="background: #fff4e6; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 5px solid #fd7e14;">
            <h3 style="color: #fd7e14; margin-top: 0;">📚 Educational Notes</h3>
            <p><strong>Pathophysiology:</strong> ${data.results[0].explanation}</p>
            <p><strong>Key Learning Points:</strong></p>
            <ul>
                ${data.results[0].findings.map(f => `<li>${f}</li>`).join('')}
            </ul>
        </div>
    `;
    
    return `<!DOCTYPE html>
<html>
<head>
    <title>MediScan AI Analysis Report</title>
    <style>
        body {
            font-family: 'Inter', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            background: #f5f5f5;
        }
        .report-container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #0a2540 0%, #1f4a8a 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .header p {
            margin: 5px 0 0;
            opacity: 0.9;
        }
        .badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 30px;
            font-size: 14px;
            font-weight: 600;
            background: rgba(255,255,255,0.2);
            color: white;
            margin-top: 10px;
        }
        .content {
            padding: 30px;
        }
        .section {
            background: #f8fafc;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 20px;
        }
        .section h2 {
            color: #0a2540;
            margin-top: 0;
            margin-bottom: 15px;
            font-size: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            background: white;
            border-radius: 10px;
            overflow: hidden;
        }
        th {
            background: #0a2540;
            color: white;
            padding: 12px;
            text-align: left;
        }
        td {
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
        }
        .success { background: #e0f2e9; color: #0b5e42; padding: 4px 12px; border-radius: 20px; }
        .warning { background: #fff3e0; color: #a66907; padding: 4px 12px; border-radius: 20px; }
        .footer {
            text-align: center;
            padding: 20px;
            color: #94a3b8;
            font-size: 12px;
            border-top: 1px solid #e2e8f0;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin: 15px 0;
        }
        .info-card {
            background: white;
            padding: 15px;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
        }
        .info-card .label {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
        }
        .info-card .value {
            font-size: 20px;
            font-weight: 600;
            color: #0a2540;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="header">
            <h1>🏥 MediScan AI Diagnostic Report</h1>
            <p>Report ID: RPT-${Date.now()} | ${data.date}</p>
            <span class="badge">${currentUserMode.toUpperCase()} MODE</span>
        </div>
        
        <div class="content">
            <div class="section">
                <h2>📊 Analysis Summary</h2>
                <div class="grid">
                    <div class="info-card">
                        <div class="label">Disease</div>
                        <div class="value">${config.title}</div>
                    </div>
                    <div class="info-card">
                        <div class="label">Model</div>
                        <div class="value">${config.model}</div>
                    </div>
                    <div class="info-card">
                        <div class="label">Images Analyzed</div>
                        <div class="value">${data.imageCount}</div>
                    </div>
                    <div class="info-card">
                        <div class="label">Avg. Confidence</div>
                        <div class="value">${data.avgConfidence}%</div>
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
                        ${data.results.map((r, i) => `
                        <tr>
                            <td><strong>#${i+1}</strong></td>
                            <td>${r.imageName}</td>
                            <td><span class="${r.status}">${r.finding}</span></td>
                            <td>${r.confidence}%</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            ${modeSpecificHTML}
            
            <div class="footer">
                <p>Generated by MediScan AI · ${new Date().toLocaleString()}</p>
                <p style="margin-top: 5px;">This is an automated report. Always consult with a healthcare professional.</p>
            </div>
        </div>
    </div>
</body>
</html>`;
}

// ==================== HISTORY FUNCTIONS ====================
function showHistoryView() {
    currentView = 'history';
    updateActiveNav('history');
    
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;
    
    if (analysisHistory.length === 0) {
        mainContent.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <h2>No History Yet</h2>
                <p>Your analyzed scans will appear here</p>
                <button class="btn btn-primary" onclick="showOverviewView()">Start New Analysis</button>
            </div>
        `;
    } else {
        mainContent.innerHTML = `
            <header class="dashboard-header">
                <h1>Analysis History (${analysisHistory.length})</h1>
                <button class="btn btn-outline" onclick="exportAllHistory()">📥 Export All</button>
            </header>
            <div style="background: white; border-radius: 24px; padding: 20px; margin-top: 20px;">
                <table class="history-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Region</th>
                            <th>Finding</th>
                            <th>Confidence</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${analysisHistory.map(item => `
                            <tr>
                                <td>${item.date}</td>
                                <td>${item.region}</td>
                                <td><span class="badge ${item.overallStatus}">${item.overallFinding}</span></td>
                                <td>${item.avgConfidence}%</td>
                                <td>
                                    <button class="btn-icon" onclick="downloadHistoryCSV('${item.id}')" title="Download CSV">📊</button>
                                    <button class="btn-icon" onclick="downloadHistoryHTML('${item.id}')" title="Download HTML">📄</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
}

function downloadHistoryCSV(id) {
    const item = analysisHistory.find(i => i.id == id);
    if (!item) return;
    
    let csvContent = "Image #,Image Name,Finding,Confidence (%),Interpretation,Key Findings,Model,Disease\n";
    
    item.results.forEach((r, i) => {
        const imageName = r.imageName.replace(/"/g, '""');
        const findingsText = r.findings ? r.findings.join('; ') : '';
        csvContent += `${i + 1},"${imageName}",${r.finding},${r.confidence},"${r.explanation}","${findingsText}",${item.model},${item.disease}\n`;
    });
    
    csvContent += `\n----- SUMMARY -----\n`;
    csvContent += `Total Images,${item.imageCount}\n`;
    csvContent += `Average Confidence,${item.avgConfidence}%\n`;
    csvContent += `Analysis Date,${item.date}\n`;
    csvContent += `Disease,${item.disease}\n`;
    csvContent += `Model,${item.model}\n`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `history_${item.id}.csv`;
    a.click();
    
    showToast('✅ History CSV downloaded!');
}

function downloadHistoryHTML(id) {
    const item = analysisHistory.find(i => i.id == id);
    if (!item) return;
    
    const config = {
        title: item.disease,
        model: item.model
    };
    
    const htmlContent = generateHTMLReport(item, config);
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `history_report_${item.id}.html`;
    a.click();
    
    const newWindow = window.open();
    if (newWindow) {
        newWindow.document.write(htmlContent);
    }
    
    showToast('✅ History HTML report generated!');
}

function downloadCSVReportFromHistory(id) {
    downloadHistoryCSV(id);
}

function exportAllHistory() {
    if (analysisHistory.length === 0) {
        showToast('No history to export');
        return;
    }
    
    let csv = 'Date,Region,Disease,Images,Finding,Confidence,Model\n';
    analysisHistory.forEach(item => {
        csv += `${item.date},${item.region},${item.disease},${item.imageCount},${item.overallFinding},${item.avgConfidence}%,${item.model}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `complete_history_${Date.now()}.csv`;
    a.click();
    
    showToast('✅ Complete history exported!');
}

// ==================== SETTINGS FUNCTIONS ====================
function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    if (panel) panel.classList.toggle('open');
}

function setUserMode(mode) {
    currentUserMode = mode;
    
    document.querySelectorAll('input[name="userMode"]').forEach(radio => {
        radio.checked = (radio.value === mode);
    });
    
    document.querySelectorAll('.mode-option').forEach(option => {
        option.classList.remove('selected-mode');
        if (option.querySelector(`input[value="${mode}"]`)) {
            option.classList.add('selected-mode');
        }
    });
    
    const settings = JSON.parse(localStorage.getItem('mediscan_settings') || '{}');
    settings.userMode = mode;
    localStorage.setItem('mediscan_settings', JSON.stringify(settings));
    
    showToast(`Switched to ${mode} mode`);
}

function toggleDarkMode() {
    const isDark = document.getElementById('darkMode')?.checked || false;
    if (isDark) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

function saveSettings() {
    const settings = {
        darkMode: document.getElementById('darkMode')?.checked || false,
        autoSave: document.getElementById('autoSave')?.checked || true,
        userMode: currentUserMode
    };
    
    localStorage.setItem('mediscan_settings', JSON.stringify(settings));
    
    if (settings.darkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    
    showToast('✅ Settings saved!');
    toggleSettings();
}

function loadSettings() {
    const saved = localStorage.getItem('mediscan_settings');
    if (saved) {
        try {
            const settings = JSON.parse(saved);
            
            if (settings.darkMode) {
                document.body.classList.add('dark-mode');
            }
            
            if (settings.userMode) {
                currentUserMode = settings.userMode;
            }
            
            if (document.getElementById('darkMode')) {
                document.getElementById('darkMode').checked = settings.darkMode || false;
            }
            if (document.getElementById('autoSave')) {
                document.getElementById('autoSave').checked = settings.autoSave !== false;
            }
        } catch (e) {
            console.error('Error loading settings:', e);
        }
    }
}
// ==================== FILTER FUNCTIONS ====================
let currentFilter = {
    search: '',
    disease: 'all',
    dateRange: 'all',
    sortBy: 'newest'
};

function applyFilters() {
    // Get filter values
    currentFilter.search = document.getElementById('searchHistory')?.value?.toLowerCase() || '';
    currentFilter.disease = document.getElementById('filterDisease')?.value || 'all';
    currentFilter.dateRange = document.getElementById('filterDate')?.value || 'all';
    currentFilter.sortBy = document.getElementById('sortBy')?.value || 'newest';
    
    // Refresh history view with filters
    showHistoryView();
}

function resetFilters() {
    // Reset filter object
    currentFilter = {
        search: '',
        disease: 'all',
        dateRange: 'all',
        sortBy: 'newest'
    };
    
    // Reset input fields
    const searchInput = document.getElementById('searchHistory');
    const diseaseFilter = document.getElementById('filterDisease');
    const dateFilter = document.getElementById('filterDate');
    const sortBy = document.getElementById('sortBy');
    
    if (searchInput) searchInput.value = '';
    if (diseaseFilter) diseaseFilter.value = 'all';
    if (dateFilter) dateFilter.value = 'all';
    if (sortBy) sortBy.value = 'newest';
    
    // Refresh history view
    showHistoryView();
    showToast('Filters reset');
}

function filterHistoryData(historyData) {
    if (!historyData || historyData.length === 0) return [];
    
    let filtered = [...historyData];
    
    // Apply search filter
    if (currentFilter.search) {
        filtered = filtered.filter(item => 
            (item.region && item.region.toLowerCase().includes(currentFilter.search)) ||
            (item.disease && item.disease.toLowerCase().includes(currentFilter.search)) ||
            (item.overallFinding && item.overallFinding.toLowerCase().includes(currentFilter.search)) ||
            (item.finding && item.finding.toLowerCase().includes(currentFilter.search))
        );
    }
    
    // Apply disease/region filter
    if (currentFilter.disease !== 'all') {
        filtered = filtered.filter(item => item.region === currentFilter.disease);
    }
    
    // Apply date filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (currentFilter.dateRange === 'today') {
        filtered = filtered.filter(item => {
            if (!item.date) return false;
            const [day, month, year] = item.date.split('/');
            const itemDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            return itemDate.toDateString() === today.toDateString();
        });
    } else if (currentFilter.dateRange === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = filtered.filter(item => {
            if (!item.date) return false;
            const [day, month, year] = item.date.split('/');
            const itemDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            return itemDate >= weekAgo;
        });
    } else if (currentFilter.dateRange === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filtered = filtered.filter(item => {
            if (!item.date) return false;
            const [day, month, year] = item.date.split('/');
            const itemDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            return itemDate >= monthAgo;
        });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
        // Parse dates (format: DD/MM/YYYY)
        const getDate = (item) => {
            if (!item.date) return new Date(0);
            const [day, month, year] = item.date.split('/');
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        };
        
        const aDate = getDate(a);
        const bDate = getDate(b);
        
        if (currentFilter.sortBy === 'newest') {
            return bDate - aDate;
        } else if (currentFilter.sortBy === 'oldest') {
            return aDate - bDate;
        } else if (currentFilter.sortBy === 'confidence-high') {
            return (b.avgConfidence || b.confidence || 0) - (a.avgConfidence || a.confidence || 0);
        } else if (currentFilter.sortBy === 'confidence-low') {
            return (a.avgConfidence || a.confidence || 0) - (b.avgConfidence || b.confidence || 0);
        }
        return 0;
    });
    
    return filtered;
}

// ==================== CLEAR HISTORY FUNCTION ====================
function clearHistory() {
    if (analysisHistory.length === 0) {
        showToast('No history to clear');
        return;
    }
    
    if (confirm('⚠️ Are you sure you want to clear ALL history? This action cannot be undone.')) {
        analysisHistory = [];
        localStorage.removeItem('analysisHistory');
        showHistoryView();
        showToast('✅ All history cleared!');
    }
}

// ==================== UPDATED HISTORY VIEW WITH FILTERS ====================
function showHistoryView() {
    currentView = 'history';
    updateActiveNav('history');
    
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;
    
    // Apply filters to history data
    const filteredHistory = filterHistoryData(analysisHistory);
    const totalCount = analysisHistory.length;
    const filteredCount = filteredHistory.length;
    
    if (analysisHistory.length === 0) {
        mainContent.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <h2>No History Yet</h2>
                <p>Your analyzed scans will appear here</p>
                <button class="btn btn-primary" onclick="showOverviewView()">Start New Analysis</button>
            </div>
        `;
    } else {
        mainContent.innerHTML = `
            <header class="dashboard-header">
                <h1>Analysis History ${totalCount > 0 ? `(${filteredCount}/${totalCount} shown)` : ''}</h1>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-outline" onclick="exportAllHistory()">📥 Export All</button>
                    <button class="btn btn-outline" style="border-color: #dc3545; color: #dc3545;" onclick="clearHistory()">🗑️ Clear All</button>
                </div>
            </header>

            <!-- Filters Section -->
            <div class="filter-section" style="background: white; border-radius: 16px; padding: 20px; margin: 20px 0; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 10px;">
                <input type="text" id="searchHistory" placeholder="🔍 Search by region, disease, or finding..." 
                       value="${currentFilter.search}" class="filter-input"
                       onkeyup="applyFilters()">
                
                <select id="filterDisease" class="filter-select" onchange="applyFilters()">
                    <option value="all" ${currentFilter.disease === 'all' ? 'selected' : ''}>All Regions</option>
                    <option value="head" ${currentFilter.disease === 'head' ? 'selected' : ''}>Head</option>
                    <option value="body" ${currentFilter.disease === 'body' ? 'selected' : ''}>Body</option>
                    <option value="bone" ${currentFilter.disease === 'bone' ? 'selected' : ''}>Bone</option>
                    <option value="general" ${currentFilter.disease === 'general' ? 'selected' : ''}>General</option>
                </select>
                
                <select id="filterDate" class="filter-select" onchange="applyFilters()">
                    <option value="all" ${currentFilter.dateRange === 'all' ? 'selected' : ''}>All Time</option>
                    <option value="today" ${currentFilter.dateRange === 'today' ? 'selected' : ''}>Today</option>
                    <option value="week" ${currentFilter.dateRange === 'week' ? 'selected' : ''}>Last 7 Days</option>
                    <option value="month" ${currentFilter.dateRange === 'month' ? 'selected' : ''}>Last 30 Days</option>
                </select>
                
                <select id="sortBy" class="filter-select" onchange="applyFilters()">
                    <option value="newest" ${currentFilter.sortBy === 'newest' ? 'selected' : ''}>Newest First</option>
                    <option value="oldest" ${currentFilter.sortBy === 'oldest' ? 'selected' : ''}>Oldest First</option>
                    <option value="confidence-high" ${currentFilter.sortBy === 'confidence-high' ? 'selected' : ''}>Confidence (High-Low)</option>
                    <option value="confidence-low" ${currentFilter.sortBy === 'confidence-low' ? 'selected' : ''}>Confidence (Low-High)</option>
                </select>
                
                <button class="btn btn-outline" onclick="resetFilters()" style="padding: 10px 20px;">↺ Reset</button>
            </div>

            <div style="background: white; border-radius: 24px; padding: 20px;">
                ${filteredHistory.length > 0 ? `
                <table class="history-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Region</th>
                            <th>Disease</th>
                            <th>Finding</th>
                            <th>Confidence</th>
                            <th>Images</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredHistory.map(item => `
                            <tr>
                                <td>${item.date || 'N/A'}</td>
                                <td>${item.region || 'N/A'}</td>
                                <td>${item.disease || 'N/A'}</td>
                                <td><span class="badge ${item.overallStatus || 'success'}">${item.overallFinding || item.finding || 'N/A'}</span></td>
                                <td>${item.avgConfidence || item.confidence || 0}%</td>
                                <td>${item.imageCount || 1}</td>
                                <td>
                                    <button class="btn-icon" onclick="downloadHistoryCSV('${item.id}')" title="Download CSV">📊</button>
                                    <button class="btn-icon" onclick="downloadHistoryHTML('${item.id}')" title="Download HTML">📄</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                ` : `
                <div style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 48px; margin-bottom: 20px;">🔍</div>
                    <h3 style="margin-bottom: 10px;">No matching records</h3>
                    <p style="color: var(--gray-500); margin-bottom: 20px;">Try adjusting your filters</p>
                    <button class="btn btn-outline" onclick="resetFilters()">Clear Filters</button>
                </div>
                `}
            </div>
        `;
    }
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard JS loaded');
    if (document.getElementById('mainContent')) {
        showOverviewView();
        loadSettings();
    }
});

// Make all functions globally available
window.showOverviewView = showOverviewView;
window.showGeneralScanView = showGeneralScanView;
window.showHeadScanView = showHeadScanView;
window.showBodyScanView = showBodyScanView;
window.showBoneScanView = showBoneScanView;
window.showHistoryView = showHistoryView;

window.handleHeadFileSelect = handleHeadFileSelect;
window.removeHeadFile = removeHeadFile;
window.clearHeadUpload = clearHeadUpload;
window.analyzeHeadImages = analyzeHeadImages;
window.downloadHeadCSV = downloadHeadCSV;
window.downloadHeadHTML = downloadHeadHTML;

window.handleBodyFileSelect = handleBodyFileSelect;
window.removeBodyFile = removeBodyFile;
window.clearBodyUpload = clearBodyUpload;
window.analyzeBodyImages = analyzeBodyImages;
window.downloadBodyCSV = downloadBodyCSV;
window.downloadBodyHTML = downloadBodyHTML;

window.handleBoneFileSelect = handleBoneFileSelect;
window.removeBoneFile = removeBoneFile;
window.clearBoneUpload = clearBoneUpload;
window.analyzeBoneImages = analyzeBoneImages;
window.downloadBoneCSV = downloadBoneCSV;
window.downloadBoneHTML = downloadBoneHTML;

window.handleGeneralFileSelect = handleGeneralFileSelect;
window.removeGeneralFile = removeGeneralFile;
window.clearGeneralUpload = clearGeneralUpload;
window.analyzeGeneralImages = analyzeGeneralImages;
window.downloadGeneralCSV = downloadGeneralCSV;
window.downloadGeneralHTML = downloadGeneralHTML;

window.downloadHistoryCSV = downloadHistoryCSV;
window.downloadHistoryHTML = downloadHistoryHTML;
window.exportAllHistory = exportAllHistory;
window.downloadCSVReportFromHistory = downloadCSVReportFromHistory;
window.showImagePreview = showImagePreview;

window.toggleSettings = toggleSettings;
window.setUserMode = setUserMode;
window.toggleDarkMode = toggleDarkMode;
window.saveSettings = saveSettings;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.clearHistory = clearHistory;
window.filterHistoryData = filterHistoryData;
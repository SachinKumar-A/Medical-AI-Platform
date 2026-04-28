// ==================== REAL API INTEGRATION ====================
// diagnosis.js - Handles real predictions from MediScan backend

const API_BASE = 'http://localhost:5000';
const DISEASE_MAPPING = {
    'head': ['brain', 'eye', 'dental'],     // Multiple diseases in head category
    'body': ['pneumonia', 'lung', 'kidney', 'breast', 'tb_covid'],  // Multiple in body
    'bone': ['bone'],                        // Bone category
    'general': ['pneumonia']                 // General scans default to pneumonia
};

// ==================== API CALL FUNCTIONS ====================

/**
 * Send image to backend for prediction
 * @param {File} imageFile - The image file to analyze
 * @param {String} disease - The disease to detect (pneumonia, brain, bone, etc)
 * @returns {Promise} - Response from API
 */
async function predictDisease(imageFile, disease) {
    try {
        const formData = new FormData();
        formData.append('file', imageFile);
        
        const response = await fetch(`${API_BASE}/api/predict/${disease}`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Prediction error:', error);
        throw error;
    }
}

/**
 * Check if API is healthy
 * @returns {Promise<Boolean>} - True if API is responding
 */
async function checkAPIHealth() {
    try {
        const response = await fetch(`${API_BASE}/api/health`);
        return response.ok;
    } catch (error) {
        console.error('API health check failed:', error);
        return false;
    }
}

/**
 * Get available models/diseases from backend
 * @returns {Promise<Array>} - List of available diseases
 */
async function getAvailableModels() {
    try {
        const response = await fetch(`${API_BASE}/api/models`);
        if (!response.ok) throw new Error('Failed to fetch models');
        const data = await response.json();
        return data.models || [];
    } catch (error) {
        console.error('Failed to fetch models:', error);
        return [];
    }
}

// ==================== REAL ANALYSIS FUNCTIONS ====================

/**
 * Analyze images for head scan (brain, eye, dental)
 * @param {Array} imageFiles - Array of image files
 * @param {String} specificDisease - Specific disease (e.g., 'brain', 'eye', 'dental')
 */
async function analyzeRealHeadImages(imageFiles, specificDisease = 'brain') {
    const resultsSection = document.getElementById('headResultsSection');
    const analyzeBtn = document.getElementById('headAnalyzeBtn');
    
    if (!imageFiles.length) {
        showToast('❌ No images selected');
        return;
    }
    
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = '⏳ Analyzing with real models...';
    
    try {
        // Check API connection first
        const isHealthy = await checkAPIHealth();
        if (!isHealthy) {
            showToast('❌ Backend server not responding. Start mediscan_production.py');
            return;
        }
        
        const results = [];
        
        // Analyze each image
        for (const imageFile of imageFiles) {
            try {
                const prediction = await predictDisease(imageFile, specificDisease);
                
                results.push({
                    imageName: imageFile.name,
                    finding: prediction.label || 'Unknown',
                    confidence: prediction.confidence || 0,
                    status: prediction.confidence > 70 ? 'success' : (prediction.confidence > 50 ? 'warning' : 'error'),
                    explanation: `${prediction.label} - Confidence: ${prediction.confidence}%`,
                    findings: [
                        `Detected: ${prediction.label}`,
                        `Confidence Score: ${prediction.confidence}%`,
                        `Model: ${specificDisease.toUpperCase()}`
                    ]
                });
                
                showToast(`✅ Analyzed: ${imageFile.name}`);
            } catch (error) {
                showToast(`❌ Failed to analyze ${imageFile.name}`);
                results.push({
                    imageName: imageFile.name,
                    finding: 'Analysis Failed',
                    confidence: 0,
                    status: 'error',
                    explanation: error.message,
                    findings: ['Analysis failed - check image format']
                });
            }
        }
        
        // Calculate averages
        const validResults = results.filter(r => r.status !== 'error');
        const avgConfidence = validResults.length > 0 
            ? Math.round(validResults.reduce((acc, r) => acc + r.confidence, 0) / validResults.length)
            : 0;
        
        const overallStatus = avgConfidence > 70 ? 'success' : (avgConfidence > 50 ? 'warning' : 'error');
        const overallFinding = validResults.length > 0 ? validResults[0].finding : 'No valid results';
        
        const analysisData = {
            id: Date.now(),
            region: 'head',
            date: getFormattedDate(),
            time: new Date().toLocaleTimeString(),
            imageCount: imageFiles.length,
            results: results,
            avgConfidence: avgConfidence,
            overallFinding: overallFinding,
            overallStatus: overallStatus,
            model: specificDisease,
            disease: `Head Scan - ${specificDisease.toUpperCase()}`,
            isRealPrediction: true
        };
        
        // Save to history
        analysisHistory.unshift(analysisData);
        localStorage.setItem('analysisHistory', JSON.stringify(analysisHistory));
        currentAnalysisResults = analysisData;
        
        // Display results
        displayHeadResults(analysisData);
        
    } catch (error) {
        showToast(`❌ Analysis error: ${error.message}`);
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = `Analyze Images (${imageFiles.length})`;
    }
}

/**
 * Analyze images for body scan (pneumonia, lung, kidney, breast, tb_covid)
 */
async function analyzeRealBodyImages(imageFiles, specificDisease = 'pneumonia') {
    const resultsSection = document.getElementById('bodyResultsSection');
    const analyzeBtn = document.getElementById('bodyAnalyzeBtn');
    
    if (!imageFiles.length) {
        showToast('❌ No images selected');
        return;
    }
    
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = '⏳ Analyzing with real models...';
    
    try {
        const isHealthy = await checkAPIHealth();
        if (!isHealthy) {
            showToast('❌ Backend server not responding. Start mediscan_production.py');
            return;
        }
        
        const results = [];
        
        for (const imageFile of imageFiles) {
            try {
                const prediction = await predictDisease(imageFile, specificDisease);
                
                results.push({
                    imageName: imageFile.name,
                    finding: prediction.label || 'Unknown',
                    confidence: prediction.confidence || 0,
                    status: prediction.confidence > 70 ? 'success' : (prediction.confidence > 50 ? 'warning' : 'error'),
                    explanation: `${prediction.label} - Confidence: ${prediction.confidence}%`,
                    findings: [
                        `Detected: ${prediction.label}`,
                        `Confidence Score: ${prediction.confidence}%`,
                        `Model: ${specificDisease.toUpperCase()}`
                    ]
                });
                
                showToast(`✅ Analyzed: ${imageFile.name}`);
            } catch (error) {
                showToast(`❌ Failed to analyze ${imageFile.name}`);
                results.push({
                    imageName: imageFile.name,
                    finding: 'Analysis Failed',
                    confidence: 0,
                    status: 'error',
                    explanation: error.message,
                    findings: ['Analysis failed - check image format']
                });
            }
        }
        
        const validResults = results.filter(r => r.status !== 'error');
        const avgConfidence = validResults.length > 0 
            ? Math.round(validResults.reduce((acc, r) => acc + r.confidence, 0) / validResults.length)
            : 0;
        
        const overallStatus = avgConfidence > 70 ? 'success' : (avgConfidence > 50 ? 'warning' : 'error');
        const overallFinding = validResults.length > 0 ? validResults[0].finding : 'No valid results';
        
        const analysisData = {
            id: Date.now(),
            region: 'body',
            date: getFormattedDate(),
            time: new Date().toLocaleTimeString(),
            imageCount: imageFiles.length,
            results: results,
            avgConfidence: avgConfidence,
            overallFinding: overallFinding,
            overallStatus: overallStatus,
            model: specificDisease,
            disease: `Body Scan - ${specificDisease.toUpperCase()}`,
            isRealPrediction: true
        };
        
        analysisHistory.unshift(analysisData);
        localStorage.setItem('analysisHistory', JSON.stringify(analysisHistory));
        currentAnalysisResults = analysisData;
        
        displayBodyResults(analysisData);
        
    } catch (error) {
        showToast(`❌ Analysis error: ${error.message}`);
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = `Analyze Images (${imageFiles.length})`;
    }
}

/**
 * Analyze images for bone scan
 */
async function analyzeRealBoneImages(imageFiles) {
    const resultsSection = document.getElementById('boneResultsSection');
    const analyzeBtn = document.getElementById('boneAnalyzeBtn');
    
    if (!imageFiles.length) {
        showToast('❌ No images selected');
        return;
    }
    
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = '⏳ Analyzing with real models...';
    
    try {
        const isHealthy = await checkAPIHealth();
        if (!isHealthy) {
            showToast('❌ Backend server not responding. Start mediscan_production.py');
            return;
        }
        
        const results = [];
        
        for (const imageFile of imageFiles) {
            try {
                const prediction = await predictDisease(imageFile, 'bone');
                
                results.push({
                    imageName: imageFile.name,
                    finding: prediction.label || 'Unknown',
                    confidence: prediction.confidence || 0,
                    status: prediction.confidence > 70 ? 'success' : (prediction.confidence > 50 ? 'warning' : 'error'),
                    explanation: `${prediction.label} - Confidence: ${prediction.confidence}%`,
                    findings: [
                        `Detected: ${prediction.label}`,
                        `Confidence Score: ${prediction.confidence}%`,
                        'Model: BONE_FRACTURE'
                    ]
                });
                
                showToast(`✅ Analyzed: ${imageFile.name}`);
            } catch (error) {
                showToast(`❌ Failed to analyze ${imageFile.name}`);
                results.push({
                    imageName: imageFile.name,
                    finding: 'Analysis Failed',
                    confidence: 0,
                    status: 'error',
                    explanation: error.message,
                    findings: ['Analysis failed - check image format']
                });
            }
        }
        
        const validResults = results.filter(r => r.status !== 'error');
        const avgConfidence = validResults.length > 0 
            ? Math.round(validResults.reduce((acc, r) => acc + r.confidence, 0) / validResults.length)
            : 0;
        
        const overallStatus = avgConfidence > 70 ? 'success' : (avgConfidence > 50 ? 'warning' : 'error');
        const overallFinding = validResults.length > 0 ? validResults[0].finding : 'No valid results';
        
        const analysisData = {
            id: Date.now(),
            region: 'bone',
            date: getFormattedDate(),
            time: new Date().toLocaleTimeString(),
            imageCount: imageFiles.length,
            results: results,
            avgConfidence: avgConfidence,
            overallFinding: overallFinding,
            overallStatus: overallStatus,
            model: 'bone',
            disease: 'Bone Fracture Detection',
            isRealPrediction: true
        };
        
        analysisHistory.unshift(analysisData);
        localStorage.setItem('analysisHistory', JSON.stringify(analysisHistory));
        currentAnalysisResults = analysisData;
        
        displayBoneResults(analysisData);
        
    } catch (error) {
        showToast(`❌ Analysis error: ${error.message}`);
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = `Analyze Images (${imageFiles.length})`;
    }
}

// ==================== RESULT DISPLAY FUNCTIONS ====================

/**
 * Display head scan results
 */
function displayHeadResults(analysisData) {
    const resultsSection = document.getElementById('headResultsSection');
    if (!resultsSection) return;
    
    const { results, avgConfidence, overallStatus, overallFinding } = analysisData;
    const modeContent = generateModeSpecificContent('head', { 
        label: overallFinding,
        confidence: avgConfidence,
        explanation: `AI Analysis: ${overallFinding}`,
        findings: results[0]?.findings || []
    }, results);
    
    resultsSection.style.display = 'block';
    resultsSection.innerHTML = `
        <div class="results-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2>Head Scan Results (REAL ANALYSIS)</h2>
                <span class="badge ${overallStatus}" style="font-size: 14px; padding: 8px 16px;">
                    ${avgConfidence > 70 ? '✅ ' : '⚠️ '} Confidence: ${avgConfidence}%
                </span>
            </div>
            
            <table class="result-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Image Name</th>
                        <th>Finding</th>
                        <th>Confidence</th>
                        <th>Accuracy</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.map((r, i) => `
                        <tr>
                            <td>${i + 1}</td>
                            <td>${r.imageName.substring(0, 25)}${r.imageName.length > 25 ? '...' : ''}</td>
                            <td><span class="badge ${r.status}">${r.finding}</span></td>
                            <td><strong>${r.confidence}%</strong></td>
                            <td>
                                <div class="confidence-bar" style="width: 100px; height: 6px; background: #ddd; border-radius: 3px; overflow: hidden;">
                                    <div style="width: ${r.confidence}%; height: 100%; background: ${r.confidence > 70 ? '#4CAF50' : '#ff9800'};"></div>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div style="margin-top: 20px; padding: 15px; background: #e8f5e9; border-radius: 8px; border-left: 4px solid #4CAF50;">
                <strong>✅ Real Predictions:</strong> These results are from actual trained models (NOT demo data)
            </div>
            
            ${modeContent}
            
            <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                <button class="btn btn-outline" onclick="downloadHeadCSV()">📥 Download CSV</button>
                <button class="btn btn-outline" onclick="clearHeadUpload()">New Analysis</button>
            </div>
        </div>
    `;
}

/**
 * Display body scan results
 */
function displayBodyResults(analysisData) {
    const resultsSection = document.getElementById('bodyResultsSection');
    if (!resultsSection) return;
    
    const { results, avgConfidence, overallStatus, overallFinding } = analysisData;
    const modeContent = generateModeSpecificContent('body', { 
        label: overallFinding,
        confidence: avgConfidence,
        explanation: `AI Analysis: ${overallFinding}`,
        findings: results[0]?.findings || []
    }, results);
    
    resultsSection.style.display = 'block';
    resultsSection.innerHTML = `
        <div class="results-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2>Body Scan Results (REAL ANALYSIS)</h2>
                <span class="badge ${overallStatus}" style="font-size: 14px; padding: 8px 16px;">
                    ${avgConfidence > 70 ? '✅ ' : '⚠️ '} Confidence: ${avgConfidence}%
                </span>
            </div>
            
            <table class="result-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Image Name</th>
                        <th>Finding</th>
                        <th>Confidence</th>
                        <th>Accuracy</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.map((r, i) => `
                        <tr>
                            <td>${i + 1}</td>
                            <td>${r.imageName.substring(0, 25)}${r.imageName.length > 25 ? '...' : ''}</td>
                            <td><span class="badge ${r.status}">${r.finding}</span></td>
                            <td><strong>${r.confidence}%</strong></td>
                            <td>
                                <div class="confidence-bar" style="width: 100px; height: 6px; background: #ddd; border-radius: 3px; overflow: hidden;">
                                    <div style="width: ${r.confidence}%; height: 100%; background: ${r.confidence > 70 ? '#4CAF50' : '#ff9800'};"></div>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div style="margin-top: 20px; padding: 15px; background: #e8f5e9; border-radius: 8px; border-left: 4px solid #4CAF50;">
                <strong>✅ Real Predictions:</strong> These results are from actual trained models (NOT demo data)
            </div>
            
            ${modeContent}
            
            <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                <button class="btn btn-outline" onclick="downloadBodyCSV()">📥 Download CSV</button>
                <button class="btn btn-outline" onclick="clearBodyUpload()">New Analysis</button>
            </div>
        </div>
    `;
}

/**
 * Display bone scan results
 */
function displayBoneResults(analysisData) {
    const resultsSection = document.getElementById('boneResultsSection');
    if (!resultsSection) return;
    
    const { results, avgConfidence, overallStatus, overallFinding } = analysisData;
    const modeContent = generateModeSpecificContent('bone', { 
        label: overallFinding,
        confidence: avgConfidence,
        explanation: `AI Analysis: ${overallFinding}`,
        findings: results[0]?.findings || []
    }, results);
    
    resultsSection.style.display = 'block';
    resultsSection.innerHTML = `
        <div class="results-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2>Bone Scan Results (REAL ANALYSIS)</h2>
                <span class="badge ${overallStatus}" style="font-size: 14px; padding: 8px 16px;">
                    ${avgConfidence > 70 ? '✅ ' : '⚠️ '} Confidence: ${avgConfidence}%
                </span>
            </div>
            
            <table class="result-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Image Name</th>
                        <th>Finding</th>
                        <th>Confidence</th>
                        <th>Accuracy</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.map((r, i) => `
                        <tr>
                            <td>${i + 1}</td>
                            <td>${r.imageName.substring(0, 25)}${r.imageName.length > 25 ? '...' : ''}</td>
                            <td><span class="badge ${r.status}">${r.finding}</span></td>
                            <td><strong>${r.confidence}%</strong></td>
                            <td>
                                <div class="confidence-bar" style="width: 100px; height: 6px; background: #ddd; border-radius: 3px; overflow: hidden;">
                                    <div style="width: ${r.confidence}%; height: 100%; background: ${r.confidence > 70 ? '#4CAF50' : '#ff9800'};"></div>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div style="margin-top: 20px; padding: 15px; background: #e8f5e9; border-radius: 8px; border-left: 4px solid #4CAF50;">
                <strong>✅ Real Predictions:</strong> These results are from actual trained models (NOT demo data)
            </div>
            
            ${modeContent}
            
            <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                <button class="btn btn-outline" onclick="downloadBoneCSV()">📥 Download CSV</button>
                <button class="btn btn-outline" onclick="clearBoneUpload()">New Analysis</button>
            </div>
        </div>
    `;
}

// ==================== EDUCATIONAL CONTENT DISPLAY ====================

/**
 * Display educational content based on prediction and user mode
 * @param {String} disease - Disease name
 * @param {String} finding - Disease finding/prediction
 * @param {String} mode - User mode ('student', 'doctor', 'public')
 */
function showEducationalContent(disease, finding, mode = 'public') {
    if (typeof DISEASE_DETAILS === 'undefined') {
        console.warn('DISEASE_DETAILS not loaded');
        return;
    }
    
    const details = getDiseaseDetails(disease);
    if (!details) return;
    
    const educationDiv = document.getElementById('educationContent') || createEducationDiv();
    
    let content = `<div class="education-panel">`;
    
    if (mode === 'student') {
        const studyGuide = getStudyGuide(disease);
        if (studyGuide) {
            content += `
                <div class="study-guide-section">
                    <h3>📚 Learning Material</h3>
                    <div class="content-box">
                        ${generateStudyGuideHTML(studyGuide)}
                    </div>
                </div>
            `;
        }
    } else if (mode === 'doctor') {
        const doctorGuide = getDoctorGuide(disease);
        if (doctorGuide) {
            content += `
                <div class="doctor-guide-section">
                    <h3>💊 Clinical Guidelines</h3>
                    <div class="content-box">
                        ${generateDoctorGuideHTML(doctorGuide)}
                    </div>
                </div>
            `;
        }
    } else {
        // Public/Patient mode
        content += `
            <div class="patient-info-section">
                <h3>ℹ️ What does this mean?</h3>
                <p>Your AI analysis detected: <strong>${finding}</strong></p>
                <p style="color: #ff6b6b; margin: 15px 0; font-weight: bold;">
                    ⚠️ This is an AI-assisted analysis. Always consult with a qualified healthcare provider.
                </p>
                <div style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <h4>Next Steps:</h4>
                    <ul>
                        <li>Share this report with your doctor</li>
                        <li>Get a professional medical evaluation</li>
                        <li>Follow your doctor's recommendations</li>
                        <li>Maintain regular health check-ups</li>
                    </ul>
                </div>
            </div>
        `;
    }
    
    content += `</div>`;
    educationDiv.innerHTML = content;
    educationDiv.style.display = 'block';
}

/**
 * Create education content container if it doesn't exist
 */
function createEducationDiv() {
    const div = document.createElement('div');
    div.id = 'educationContent';
    div.style.cssText = `
        margin-top: 20px;
        padding: 20px;
        background: #f5f7fa;
        border-radius: 10px;
        border-left: 5px solid #2b6ef0;
    `;
    
    // Append to results section or document body
    const resultsSection = document.querySelector('.results-card') || document.body;
    resultsSection.appendChild(div);
    
    return div;
}

/**
 * Display mode-specific content tabs
 * @param {String} disease - Disease key
 * @param {String} currentMode - Current user mode
 */
function displayContentTabs(disease, currentMode = 'public') {
    const tabsContainer = document.getElementById('contentTabs') || createTabsContainer();
    
    let tabsHTML = `
        <div class="content-tabs">
            <button class="tab-btn ${currentMode === 'student' ? 'active' : ''}" onclick="setContentMode('${disease}', 'student')">
                📚 Learn (Student)
            </button>
            <button class="tab-btn ${currentMode === 'doctor' ? 'active' : ''}" onclick="setContentMode('${disease}', 'doctor')">
                💊 Clinical (Doctor)
            </button>
            <button class="tab-btn ${currentMode === 'public' ? 'active' : ''}" onclick="setContentMode('${disease}', 'public')">
                ℹ️ Patient Info
            </button>
        </div>
    `;
    
    tabsContainer.innerHTML = tabsHTML;
    tabsContainer.style.display = 'flex';
}

/**
 * Create tabs container if it doesn't exist
 */
function createTabsContainer() {
    const div = document.createElement('div');
    div.id = 'contentTabs';
    div.style.cssText = `
        gap: 10px;
        margin: 15px 0;
        display: flex;
        flex-wrap: wrap;
    `;
    
    const resultsSection = document.querySelector('.results-card') || document.body;
    resultsSection.insertAdjacentElement('afterend', div);
    
    return div;
}

/**
 * Set content mode and display appropriate content
 */
function setContentMode(disease, mode) {
    currentMode = mode;
    
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Show content
    const currentFinding = document.querySelector('.badge')?.textContent || 'Analysis';
    showEducationalContent(disease, currentFinding, mode);
}

// Module export (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        predictDisease,
        checkAPIHealth,
        getAvailableModels,
        analyzeRealHeadImages,
        analyzeRealBodyImages,
        analyzeRealBoneImages,
        showEducationalContent,
        displayContentTabs
    };
}

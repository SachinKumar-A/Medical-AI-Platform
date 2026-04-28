# 🏥 Multi-Disease AI Platform - Implementation Guide
**Status**: Ready for Backend Development

---

## 📋 Table of Contents
1. [Input/Output Specifications by Disease](#inputoutput-specifications)
2. [Model Loading Implementation](#model-loading)
3. [Unified API Architecture](#api-architecture)
4. [Preprocessing Pipeline](#preprocessing)
5. [Code Examples](#code-examples)

---

## Input/Output Specifications

### 1. **🫁 PNEUMONIA DETECTION**
```
INPUT:
  - Format: JPG, PNG, JPEG
  - Size: Any (auto-resized to 224×224)
  - Color: RGB
  - Data Type: Image file upload

PROCESSING:
  - Resize to 224×224
  - Convert to RGB
  - Normalize using DenseNet preprocessing
  - Prediction threshold: 0.5

OUTPUT:
  - result: "⚠️ PNEUMONIA DETECTED" or "✅ NORMAL"
  - confidence: Float (0-100%)
  - status: "warning" or "success"
  - timestamp: ISO format
```

---

### 2. **🧠 BRAIN TUMOR DETECTION**
```
INPUT:
  - Format: JPG, PNG
  - Size: Typically 224×224 or 512×512 (model dependent)
  - Color: Grayscale (MRI slices)
  - Data Type: Medical imaging

PROCESSING:
  - Load with medical imaging library
  - Normalize intensity values
  - Apply ViT-L16 + Xception fusion

OUTPUT:
  - tumor_class: "benign", "malignant", "absent"
  - confidence: Float (0-100%)
  - location_heatmap: Optional visualization
```

---

### 3. **🦴 BONE FRACTURE DETECTION**
```
INPUT:
  - Format: JPG, PNG, DICOM
  - Size: Any (auto-resized)
  - Color: Grayscale X-ray
  - Data Type: Image

PROCESSING:
  - Grayscale conversion
  - Histogram equalization for contrast
  - Resize to model input size

OUTPUT:
  - fracture_detected: Boolean
  - fracture_type: "simple", "compound", "stress", "none"
  - location: "femur", "tibia", "fibula", etc.
  - confidence: Float (0-100%)
  - severity: "mild", "moderate", "severe"
```

---

### 4. **🦷 DENTAL DISEASE DETECTION**
```
INPUT:
  - Format: JPG, PNG, DICOM
  - Size: Any (auto-resized)
  - Color: RGB
  - Data Type: Dental X-ray or intraoral image

PROCESSING:
  - YOLO preprocessing (normalization to [0,1])
  - Target size: 640×640 (YOLOv11 standard)
  - Real-time object detection + segmentation

OUTPUT:
  - detections: Array of
    - class: "cavity", "calculus", "periodontal", "etc"
    - confidence: Float (0-100%)
    - bbox: [x1, y1, x2, y2]
    - mask: Segmentation mask (optional)
  - tooth_map: Position map of detected issues
```

---

### 5. **👁️ EYE DISEASE DETECTION**
```
INPUT:
  - Format: JPG, PNG
  - Size: Typically 224×224 or 512×512
  - Color: RGB
  - Data Type: Fundus photograph or retinal image

PROCESSING:
  - Resize to 224×224
  - Normalize RGB channels
  - Retinal-specific preprocessing

OUTPUT:
  - disease_class: "normal", "diabetic_retinopathy", "cataracts", "glaucoma", "etc"
  - severity: "none", "mild", "moderate", "severe"
  - confidence: Float (0-100%)
  - risk_score: Float (0-100%)
```

---

### 6. **🫘 KIDNEY DISEASE DETECTION** (Tabular Data)
```
INPUT:
  - Format: CSV or JSON (NOT image)
  - Features: 11-26 biomedical parameters
  - Type: Patient laboratory data

Example Features:
  - age, bp (blood pressure), sg (specific gravity), al (albumin)
  - su (sugar), frpu (frbc), rbc (red blood cells)
  - wc (white cell count), rc (red cell count)
  - htn (hypertension), dm (diabetes mellitus)
  - cad (coronary artery disease), appet (appetite)
  - pe (pedal edema), ane (anemia)

PROCESSING:
  - Data normalization/standardization
  - Feature scaling (0-1 or z-score)
  - LGBM classifier prediction (98% accuracy)

OUTPUT:
  - ckd_risk: "positive", "negative"
  - confidence: Float (0-100%)
  - ckd_stage: "0", "1", "2", "3", "4", "5"
  - risk_parameters: Top 5 contributing features
```

---

### 7. **🫁 LUNG CANCER DETECTION**
```
INPUT:
  - Format: DICOM, NIfTI, or 3D image slices
  - Size: 3D volume (typically 64×64×64 or similar)
  - Color: Grayscale (CT scans)
  - Data Type: 3D Medical imaging

PROCESSING:
  - Load 3D medical image
  - EfficientNet-B0 or MobileNetV2 (best models)
  - 3D preprocessing
  - Ensemble voting

OUTPUT:
  - cancer_type: "adenocarcinoma", "large_cell", "small_cell", "squamous_cell"
  - confidence: Float (0-100%)
  - stage: "1a", "1b", "2a", "2b", "3a", "3b", "4"
  - treatment_recommendation: Text
```

---

### 8. **🎗️ BREAST CANCER DETECTION**
```
INPUT:
  - Format: JPG, PNG, DICOM
  - Size: Variable (auto-resized)
  - Color: Grayscale (Ultrasound/Thermal)
  - Data Type: Medical imaging

PROCESSING:
  - Physics-Informed Neural Network (PINN)
  - Incorporates thermal physics constraints
  - Self-supervised learning

OUTPUT:
  - lesion_detected: Boolean
  - lesion_type: "benign", "malignant", "suspicious"
  - confidence: Float (0-100%)
  - thermal_parameters:
    - k (thermal conductivity)
    - Q (heat generation)
    - sigma_blur (focal spot size)
  - birads_score: "1-5"
```

---

### 9. **🫁 TB & COVID-19 DETECTION**
```
INPUT:
  - Format: JPG, PNG
  - Size: Any (auto-resized to 224×224)
  - Color: Grayscale X-ray
  - Data Type: Chest X-ray

PROCESSING:
  - Resize to 224×224
  - Grayscale normalization
  - Multi-class classification

OUTPUT:
  - diagnosis: "normal", "tb", "covid-19"
  - confidence: Float (0-100%)
  - severity: "mild", "moderate", "severe"
  - affected_area: Lung region description
```

---

## Model Loading

### TensorFlow/Keras Models (5 models)
```python
import tensorflow as tf

def load_keras_model(model_path):
    """Load TensorFlow/Keras models"""
    try:
        model = tf.keras.models.load_model(model_path)
        print(f"✅ Loaded: {model_path}")
        return model
    except Exception as e:
        print(f"❌ Error loading {model_path}: {str(e)}")
        raise

# Usage
models_keras = {
    "pneumonia": load_keras_model("model2result.keras"),
    "brain_tumor": load_keras_model("brain_tumor/best_ViT-L16-fe-Xception.h5"),
    "bone_fracture": load_keras_model("Bone_fracture/bone_fracture_model.h5"),
    "eye_disease": load_keras_model("eye_disease/model231.h5"),
    "chest_tb_covid": load_keras_model("chestXray_tubercolsis_covid19/model_tawsifur.keras"),
}
```

---

### PyTorch Models (2 models)
```python
import torch

def load_pytorch_model(model_path, model_class=None):
    """Load PyTorch models"""
    try:
        checkpoint = torch.load(model_path, map_location='cpu')
        
        # If it's a checkpoint with state_dict
        if isinstance(checkpoint, dict) and 'model_state_dict' in checkpoint:
            model.load_state_dict(checkpoint['model_state_dict'])
            print(f"✅ Loaded checkpoint: {model_path}")
        else:
            # Direct model loading
            model = checkpoint
            print(f"✅ Loaded model: {model_path}")
        
        model.eval()
        return model
    except Exception as e:
        print(f"❌ Error loading {model_path}: {str(e)}")
        raise

# Usage
from ultralytics import YOLO

models_pytorch = {
    "dental": YOLO("dental/data/best.pt"),  # YOLO returns ready model
    "breast_cancer": load_pytorch_model("breast_cancer/results/pinn_best.pt"),
}
```

---

### Scikit-learn Models (To be exported)
```python
import joblib
import pickle

def load_sklearn_model(model_path):
    """Load scikit-learn models"""
    try:
        if model_path.endswith('.joblib'):
            model = joblib.load(model_path)
        elif model_path.endswith('.pkl'):
            with open(model_path, 'rb') as f:
                model = pickle.load(f)
        
        print(f"✅ Loaded: {model_path}")
        return model
    except Exception as e:
        print(f"❌ Error loading {model_path}: {str(e)}")
        raise

# Usage (after export)
models_sklearn = {
    "kidney": load_sklearn_model("kidney/kidney_disease_lgbm.joblib"),
    "lung_cancer": load_pytorch_model("lung_cancer/lung_cancer_efficientnet.pth"),
}
```

---

## Unified API Architecture

### FastAPI Implementation
```python
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
import io
from PIL import Image
import numpy as np

app = FastAPI(title="Multi-Disease AI Platform")

class DiseaseModelManager:
    def __init__(self):
        self.models = {}
        self.load_all_models()
    
    def load_all_models(self):
        """Load all disease models"""
        print("Loading all disease models...")
        
        # TensorFlow models
        self.models['pneumonia'] = tf.keras.models.load_model("model2result.keras")
        self.models['brain_tumor'] = tf.keras.models.load_model("brain_tumor/best_ViT-L16-fe-Xception.h5")
        # ... etc
        
        # PyTorch models
        self.models['dental'] = YOLO("dental/data/best.pt")
        # ... etc
        
        print("✅ All models loaded successfully")

model_manager = DiseaseModelManager()

# Unified prediction endpoint
@app.post("/api/predict/{disease}")
async def predict_disease(
    disease: str,
    file: UploadFile = File(...),
    patient_id: str = Form(...),
    metadata: str = Form(default=None)
):
    """
    Unified prediction endpoint for all diseases
    
    Args:
        disease: Disease type (pneumonia, brain_tumor, etc)
        file: Image or data file
        patient_id: Patient identifier
        metadata: Optional additional information
    
    Returns:
        JSON with prediction results
    """
    try:
        # Validate disease
        if disease not in model_manager.models:
            return JSONResponse(
                status_code=400,
                content={"error": f"Disease '{disease}' not supported"}
            )
        
        # Read file
        file_content = await file.read()
        
        # Disease-specific processing
        result = await process_prediction(disease, file_content, patient_id)
        
        return result
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

async def process_prediction(disease: str, file_content: bytes, patient_id: str):
    """Route to disease-specific prediction handler"""
    
    if disease == "pneumonia":
        return await predict_pneumonia(file_content, patient_id)
    elif disease == "brain_tumor":
        return await predict_brain_tumor(file_content, patient_id)
    elif disease == "dental":
        return await predict_dental(file_content, patient_id)
    elif disease == "kidney":
        return await predict_kidney(file_content, patient_id)
    # ... etc
    else:
        raise ValueError(f"Unknown disease: {disease}")
```

---

## Preprocessing Pipeline

### Image-Based Diseases
```python
import cv2
from PIL import Image
import numpy as np

class ImagePreprocessor:
    @staticmethod
    def preprocess_xray(image_data, target_size=(224, 224), normalize=True):
        """Preprocess X-ray images"""
        # Load image
        img = Image.open(io.BytesIO(image_data)).convert('RGB')
        
        # Resize
        img = img.resize(target_size, Image.Resampling.LANCZOS)
        
        # Convert to array
        img_array = np.array(img, dtype=np.float32)
        
        # Normalize
        if normalize:
            img_array = img_array / 255.0
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    
    @staticmethod
    def preprocess_mri(image_data, target_size=(256, 256)):
        """Preprocess MRI images"""
        # Similar to X-ray but with medical imaging considerations
        img = Image.open(io.BytesIO(image_data))
        img = img.resize(target_size)
        img_array = np.array(img, dtype=np.float32)
        
        # Window/level adjustment for better contrast
        img_array = np.clip(img_array, 0, 255)
        img_array = img_array / 255.0
        
        return np.expand_dims(img_array, axis=0)
    
    @staticmethod
    def preprocess_yolo(image_data, target_size=(640, 640)):
        """Preprocess for YOLO models"""
        img = Image.open(io.BytesIO(image_data)).convert('RGB')
        img = img.resize(target_size)
        img_array = np.array(img) / 255.0  # YOLO expects [0,1]
        return img_array

class TabularPreprocessor:
    """Preprocess tabular data for kidney disease"""
    
    @staticmethod
    def preprocess_kidney_data(data_dict):
        """
        data_dict example:
        {
            'age': 48, 'bp': 70, 'sg': 1.015,
            'al': 4, 'su': 0, 'frpu': 1, 'rbc': 1,
            'wc': 7600, 'rc': 4.5, 'htn': 1, 'dm': 1,
            'cad': 0, 'appet': 1, 'pe': 0, 'ane': 0
        }
        """
        # Extract features in correct order
        feature_columns = [
            'age', 'bp', 'sg', 'al', 'su', 'frpu', 'rbc',
            'wc', 'rc', 'htn', 'dm', 'cad', 'appet', 'pe', 'ane'
        ]
        
        data = np.array([[data_dict.get(col, 0) for col in feature_columns]])
        
        # Standardization (apply same scaling used during training)
        scaler = StandardScaler()
        data_scaled = scaler.fit_transform(data)
        
        return data_scaled
```

---

## Code Examples

### Complete Disease Prediction Functions

```python
# 1. Pneumonia Prediction
async def predict_pneumonia(file_content: bytes, patient_id: str):
    """Pneumonia detection from chest X-ray"""
    img_array = ImagePreprocessor.preprocess_xray(file_content, target_size=(224, 224))
    
    # Apply DenseNet preprocessing
    from tensorflow.keras.applications.densenet import preprocess_input
    img_array = preprocess_input(img_array)
    
    # Predict
    prediction = model_manager.models['pneumonia'].predict(img_array, verbose=0)[0][0]
    
    if prediction > 0.5:
        result = "PNEUMONIA DETECTED"
        confidence = float(prediction * 100)
        status = "warning"
    else:
        result = "NORMAL"
        confidence = float((1 - prediction) * 100)
        status = "success"
    
    return {
        "disease": "pneumonia",
        "patient_id": patient_id,
        "result": result,
        "confidence": round(confidence, 1),
        "status": status,
        "timestamp": datetime.now().isoformat()
    }

# 2. Dental Detection (YOLO)
async def predict_dental(file_content: bytes, patient_id: str):
    """Dental lesion detection using YOLO"""
    from PIL import Image
    img = Image.open(io.BytesIO(file_content))
    
    # Run YOLO inference
    results = model_manager.models['dental'](img)
    
    detections = []
    for result in results:
        for detection in result.boxes:
            detections.append({
                "class": result.names[int(detection.cls)],
                "confidence": float(detection.conf),
                "bbox": detection.xyxy.tolist()
            })
    
    return {
        "disease": "dental",
        "patient_id": patient_id,
        "detections": detections,
        "total_issues_found": len(detections),
        "timestamp": datetime.now().isoformat()
    }

# 3. Kidney Disease (Tabular)
async def predict_kidney(file_content: bytes, patient_id: str):
    """Kidney disease prediction from patient data"""
    import json
    
    # Parse JSON data
    data_dict = json.loads(file_content.decode())
    
    # Preprocess
    data_scaled = TabularPreprocessor.preprocess_kidney_data(data_dict)
    
    # Predict
    prediction = model_manager.models['kidney'].predict(data_scaled)[0]
    confidence = max(model_manager.models['kidney'].predict_proba(data_scaled)[0]) * 100
    
    return {
        "disease": "kidney",
        "patient_id": patient_id,
        "ckd_status": "POSITIVE" if prediction == 1 else "NEGATIVE",
        "confidence": round(confidence, 1),
        "risk_level": "high" if confidence > 85 else "medium" if confidence > 70 else "low",
        "timestamp": datetime.now().isoformat()
    }
```

---

## 🚀 Quick Start

### Installation
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install dependencies
pip install fastapi uvicorn tensorflow torch pytorch torchvision ultralytics scikit-learn xgboost catboost lightgbm pandas numpy opencv-python pillow nibabel

# Run server
uvicorn main:app --reload --port 8000
```

### Test API
```bash
curl -X POST "http://localhost:8000/api/predict/pneumonia" \
  -F "file=@chest_xray.jpg" \
  -F "patient_id=P12345"
```

---

**Next Step**: Backend development ready. Choose FastAPI or Flask based on your preference.

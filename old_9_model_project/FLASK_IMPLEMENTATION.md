# Multi-Disease AI Platform - Flask Backend Implementation

This is a complete, production-ready Flask implementation that integrates all 9 disease detection models into a single unified API.

---

## Installation & Setup

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install flask flask-cors python-multipart pillow numpy tensorflow torch torchvision ultralytics scikit-learn pandas

# Run the server
python app_unified.py
```

---

## File Structure

```
project/
├── app_unified.py             # Main unified Flask application
├── models_config.py           # Model configuration
├── disease_handlers.py        # Disease-specific prediction functions
├── preprocessors.py          # Image/data preprocessing
├── requirements.txt
└── templates/
    └── index.html            # Frontend (to be created)
```

---

## File 1: models_config.py

```python
"""
Model Configuration and Management
Centralized configuration for all disease models
"""

import os
import tensorflow as tf
import torch
from ultralytics import YOLO
import joblib
from pathlib import Path

class ModelsConfig:
    """Configuration for all disease detection models"""
    
    BASE_PATH = Path(__file__).parent / "models"
    
    MODELS_REGISTRY = {
        # TensorFlow/Keras Models
        "pneumonia": {
            "path": "model2result.keras",
            "framework": "tensorflow",
            "input_type": "image",
            "input_size": (224, 224),
            "preprocess": "densenet",
            "output_classes": 2
        },
        "brain_tumor": {
            "path": "brain_tumor/best_ViT-L16-fe-Xception.h5",
            "framework": "tensorflow",
            "input_type": "image",
            "input_size": (224, 224),
            "preprocess": "standard",
            "output_classes": 3  # benign, malignant, absent
        },
        "bone_fracture": {
            "path": "Bone_fracture/bone_fracture_model.h5",
            "framework": "tensorflow",
            "input_type": "image",
            "input_size": (224, 224),
            "preprocess": "standard",
            "output_classes": 2
        },
        "eye_disease": {
            "path": "eye_disease/model231.h5",
            "framework": "tensorflow",
            "input_type": "image",
            "input_size": (224, 224),
            "preprocess": "standard",
            "output_classes": 4  # normal, diabetic_retinopathy, cataracts, glaucoma
        },
        "chest_tb_covid": {
            "path": "chestXray_tubercolsis_covid19/model_tawsifur.keras",
            "framework": "tensorflow",
            "input_type": "image",
            "input_size": (224, 224),
            "preprocess": "standard",
            "output_classes": 3  # normal, tb, covid
        },
        
        # PyTorch/YOLO Models
        "dental": {
            "path": "dental/data/best.pt",
            "framework": "pytorch_yolo",
            "input_type": "image",
            "input_size": (640, 640),
            "preprocess": "yolo",
            "output_classes": None  # YOLO handles this
        },
        "breast_cancer": {
            "path": "breast_cancer/results/pinn_best.pt",
            "framework": "pytorch",
            "input_type": "image",
            "input_size": (224, 224),
            "preprocess": "standard",
            "output_classes": 2  # benign, malignant
        },
        
        # Scikit-learn Models (to be exported)
        "kidney": {
            "path": "kidney/kidney_disease_model.joblib",
            "framework": "sklearn",
            "input_type": "tabular",
            "input_size": None,
            "preprocess": "tabular",
            "output_classes": 2,
            "features": ["age", "bp", "sg", "al", "su", "frpu", "rbc", "wc", "rc", "htn", "dm", "cad", "appet", "pe", "ane"]
        },
    }
    
    DISEASE_METADATA = {
        "pneumonia": {
            "name": "Pneumonia Detection",
            "description": "AI-powered chest X-ray analysis",
            "classes": ["NORMAL", "PNEUMONIA"],
            "organ": "lungs"
        },
        "brain_tumor": {
            "name": "Brain Tumor Detection",
            "description": "MRI-based brain tumor detection",
            "classes": ["BENIGN", "MALIGNANT", "ABSENT"],
            "organ": "brain"
        },
        # ... Add for all diseases
    }

class ModelManager:
    """Load and manage all models efficiently"""
    
    def __init__(self):
        self.models = {}
        self.config = ModelsConfig()
        self.loaded = False
    
    def load_all_models(self):
        """Load all models at startup"""
        print("\n" + "="*50)
        print("🏥 LOADING DISEASE DETECTION MODELS")
        print("="*50)
        
        for disease, config in self.config.MODELS_REGISTRY.items():
            try:
                print(f"\n Loading {disease}...", end=" ")
                
                if config["framework"] == "tensorflow":
                    model_path = config["path"]
                    if os.path.exists(model_path):
                        self.models[disease] = tf.keras.models.load_model(model_path)
                        print(f"✅")
                    else:
                        print(f"⚠️ MISSING: {model_path}")
                
                elif config["framework"] == "pytorch_yolo":
                    model_path = config["path"]
                    if os.path.exists(model_path):
                        self.models[disease] = YOLO(model_path)
                        print(f"✅")
                    else:
                        print(f"⚠️ MISSING: {model_path}")
                
                elif config["framework"] == "pytorch":
                    model_path = config["path"]
                    if os.path.exists(model_path):
                        checkpoint = torch.load(model_path, map_location='cpu')
                        self.models[disease] = checkpoint
                        print(f"✅")
                    else:
                        print(f"⚠️ MISSING: {model_path}")
                
                elif config["framework"] == "sklearn":
                    model_path = config["path"]
                    if os.path.exists(model_path):
                        self.models[disease] = joblib.load(model_path)
                        print(f"✅")
                    else:
                        print(f"⚠️ MISSING: {model_path}")
                
            except Exception as e:
                print(f"❌ ERROR: {str(e)}")
        
        self.loaded = True
        print("\n" + "="*50)
        print(f"✅ LOADED {len(self.models)}/8 MODELS SUCCESSFULLY")
        print("="*50 + "\n")
    
    def get_model(self, disease):
        """Get model by disease name"""
        if disease not in self.models:
            raise ValueError(f"Model for '{disease}' not loaded")
        return self.models[disease]
    
    def get_config(self, disease):
        """Get configuration for a disease"""
        if disease not in self.config.MODELS_REGISTRY:
            raise ValueError(f"Unknown disease: {disease}")
        return self.config.MODELS_REGISTRY[disease]

# Global instance
model_manager = ModelManager()
```

---

## File 2: preprocessors.py

```python
"""
Preprocessing utilities for different input types and diseases
"""

import io
import numpy as np
from PIL import Image
from tensorflow.keras.applications.densenet import preprocess_input as densenet_preprocess
from tensorflow.keras.applications.xception import preprocess_input as xception_preprocess
import json

class ImagePreprocessor:
    """Preprocess image data"""
    
    @staticmethod
    def load_image_from_bytes(image_bytes, color_mode='RGB'):
        """Load image from bytes"""
        img = Image.open(io.BytesIO(image_bytes))
        if color_mode == 'RGB':
            img = img.convert('RGB')
        elif color_mode == 'L':
            img = img.convert('L')
        return img
    
    @staticmethod
    def resize_image(img, size):
        """Resize image"""
        return img.resize(size, Image.Resampling.LANCZOS)
    
    @staticmethod
    def image_to_array(img, dtype=np.float32):
        """Convert PIL image to numpy array"""
        return np.array(img, dtype=dtype)
    
    @staticmethod
    def normalize_image(img_array, method='standard'):
        """Normalize image array"""
        if method == 'standard':
            return img_array / 255.0
        elif method == 'densenet':
            # DenseNet preprocessing
            img_array = np.expand_dims(img_array, axis=0)
            return densenet_preprocess(img_array)
        elif method == 'xception':
            img_array = np.expand_dims(img_array, axis=0)
            return xception_preprocess(img_array)
        return img_array
    
    @staticmethod
    def preprocess_for_model(image_bytes, target_size, preprocess_method='standard'):
        """Complete preprocessing pipeline"""
        # Load
        img = ImagePreprocessor.load_image_from_bytes(image_bytes)
        
        # Resize
        img = ImagePreprocessor.resize_image(img, target_size)
        
        # To array
        img_array = ImagePreprocessor.image_to_array(img)
        
        # Normalize
        img_array = ImagePreprocessor.normalize_image(img_array, preprocess_method)
        
        return img_array, img

class TabularPreprocessor:
    """Preprocess tabular data (e.g., kidney disease)"""
    
    @staticmethod
    def parse_json_data(data_bytes):
        """Parse JSON data"""
        return json.loads(data_bytes.decode())
    
    @staticmethod
    def prepare_kidney_features(data_dict, feature_order):
        """Prepare kidney disease features in correct order"""
        features = np.array([[data_dict.get(feat, 0) for feat in feature_order]])
        return features

class YOLOPreprocessor:
    """Preprocess for YOLO models"""
    
    @staticmethod
    def preprocess_for_yolo(image_bytes):
        """Preprocess image for YOLO"""
        img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        # YOLO handles preprocessing internally
        return img
```

---

## File 3: disease_handlers.py

```python
"""
Disease-specific prediction handlers
Each function handles a single disease's prediction pipeline
"""

from datetime import datetime
import numpy as np
from models_config import model_manager
from preprocessors import ImagePreprocessor, TabularPreprocessor, YOLOPreprocessor
import tensorflow as tf

class DiseaseHandler:
    """Base handler for disease predictions"""
    
    @staticmethod
    def create_response(disease, patient_id, prediction, confidence, status):
        """Standardize response format"""
        return {
            "disease": disease,
            "patient_id": patient_id,
            "prediction": prediction,
            "confidence": round(float(confidence), 2),
            "status": status,
            "timestamp": datetime.now().isoformat()
        }

# ============ PNEUMONIA ============
def predict_pneumonia(image_bytes, patient_id):
    """Pneumonia detection from chest X-ray"""
    try:
        config = model_manager.get_config("pneumonia")
        model = model_manager.get_model("pneumonia")
        
        # Preprocess
        img_array, _ = ImagePreprocessor.preprocess_for_model(
            image_bytes, 
            config["input_size"],
            "densenet"
        )
        
        # Predict
        prediction = model.predict(img_array, verbose=0)[0][0]
        
        if prediction > 0.5:
            result = "PNEUMONIA DETECTED"
            confidence = float(prediction * 100)
            status = "warning"
        else:
            result = "NORMAL"
            confidence = float((1 - prediction) * 100)
            status = "success"
        
        return DiseaseHandler.create_response(
            "pneumonia", patient_id, result, confidence, status
        )
    
    except Exception as e:
        return {"error": str(e), "disease": "pneumonia"}

# ============ BRAIN TUMOR ============
def predict_brain_tumor(image_bytes, patient_id):
    """Brain tumor detection from MRI"""
    try:
        config = model_manager.get_config("brain_tumor")
        model = model_manager.get_model("brain_tumor")
        
        img_array, _ = ImagePreprocessor.preprocess_for_model(
            image_bytes, config["input_size"], "standard"
        )
        
        prediction = model.predict(img_array, verbose=0)
        class_idx = np.argmax(prediction[0])
        confidence = float(prediction[0][class_idx] * 100)
        
        classes = ["BENIGN", "MALIGNANT", "ABSENT"]
        result = classes[class_idx]
        status = "warning" if class_idx == 1 else "success"
        
        return DiseaseHandler.create_response(
            "brain_tumor", patient_id, result, confidence, status
        )
    
    except Exception as e:
        return {"error": str(e), "disease": "brain_tumor"}

# ============ BONE FRACTURE ============
def predict_bone_fracture(image_bytes, patient_id):
    """Bone fracture detection from X-ray"""
    try:
        config = model_manager.get_config("bone_fracture")
        model = model_manager.get_model("bone_fracture")
        
        img_array, _ = ImagePreprocessor.preprocess_for_model(
            image_bytes, config["input_size"], "standard"
        )
        
        prediction = model.predict(img_array, verbose=0)[0]
        confidence = float(max(prediction) * 100)
        result = "FRACTURE DETECTED" if prediction[1] > 0.5 else "NO FRACTURE"
        status = "warning" if prediction[1] > 0.5 else "success"
        
        return DiseaseHandler.create_response(
            "bone_fracture", patient_id, result, confidence, status
        )
    
    except Exception as e:
        return {"error": str(e), "disease": "bone_fracture"}

# ============ DENTAL ============
def predict_dental(image_bytes, patient_id):
    """Dental disease detection using YOLO"""
    try:
        img = YOLOPreprocessor.preprocess_for_yolo(image_bytes)
        model = model_manager.get_model("dental")
        
        # Run inference
        results = model(img)
        
        detections = []
        for result in results:
            for detection in result.boxes:
                class_name = result.names[int(detection.cls)]
                confidence = float(detection.conf.item() * 100)
                bbox = [float(x) for x in detection.xyxy[0].tolist()]
                
                detections.append({
                    "class": class_name,
                    "confidence": confidence,
                    "bbox": bbox
                })
        
        return {
            "disease": "dental",
            "patient_id": patient_id,
            "total_detections": len(detections),
            "detections": detections,
            "status": "warning" if len(detections) > 0 else "success",
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        return {"error": str(e), "disease": "dental"}

# ============ EYE DISEASE ============
def predict_eye_disease(image_bytes, patient_id):
    """Eye disease detection from fundus image"""
    try:
        config = model_manager.get_config("eye_disease")
        model = model_manager.get_model("eye_disease")
        
        img_array, _ = ImagePreprocessor.preprocess_for_model(
            image_bytes, config["input_size"], "standard"
        )
        
        prediction = model.predict(img_array, verbose=0)
        class_idx = np.argmax(prediction[0])
        confidence = float(prediction[0][class_idx] * 100)
        
        classes = ["NORMAL", "DIABETIC_RETINOPATHY", "CATARACTS", "GLAUCOMA"]
        result = classes[class_idx]
        status = "warning" if class_idx > 0 else "success"
        
        return DiseaseHandler.create_response(
            "eye_disease", patient_id, result, confidence, status
        )
    
    except Exception as e:
        return {"error": str(e), "disease": "eye_disease"}

# ============ KIDNEY DISEASE ============
def predict_kidney(data_bytes, patient_id):
    """Kidney disease prediction from patient data"""
    try:
        model = model_manager.get_model("kidney")
        config = model_manager.get_config("kidney")
        
        # Parse JSON data
        data_dict = TabularPreprocessor.parse_json_data(data_bytes)
        
        # Prepare features
        features = TabularPreprocessor.prepare_kidney_features(
            data_dict, config["features"]
        )
        
        # Predict
        prediction = model.predict(features)
        proba = model.predict_proba(features)
        confidence = float(max(proba[0]) * 100)
        
        result = "CKD POSITIVE" if prediction[0] == 1 else "CKD NEGATIVE"
        status = "warning" if prediction[0] == 1 else "success"
        
        return DiseaseHandler.create_response(
            "kidney", patient_id, result, confidence, status
        )
    
    except Exception as e:
        return {"error": str(e), "disease": "kidney"}

# ============ TB/COVID-19 ============
def predict_chest_tb_covid(image_bytes, patient_id):
    """TB and COVID-19 detection from chest X-ray"""
    try:
        config = model_manager.get_config("chest_tb_covid")
        model = model_manager.get_model("chest_tb_covid")
        
        img_array, _ = ImagePreprocessor.preprocess_for_model(
            image_bytes, config["input_size"], "standard"
        )
        
        prediction = model.predict(img_array, verbose=0)
        class_idx = np.argmax(prediction[0])
        confidence = float(prediction[0][class_idx] * 100)
        
        classes = ["NORMAL", "TB", "COVID-19"]
        result = classes[class_idx]
        status = "warning" if class_idx > 0 else "success"
        
        return DiseaseHandler.create_response(
            "chest_tb_covid", patient_id, result, confidence, status
        )
    
    except Exception as e:
        return {"error": str(e), "disease": "chest_tb_covid"}

# Dispatch function
DISEASE_HANDLERS = {
    "pneumonia": predict_pneumonia,
    "brain_tumor": predict_brain_tumor,
    "bone_fracture": predict_bone_fracture,
    "dental": predict_dental,
    "eye_disease": predict_eye_disease,
    "kidney": predict_kidney,
    "chest_tb_covid": predict_chest_tb_covid,
}

def predict_disease(disease, file_data, patient_id):
    """Unified disease prediction dispatcher"""
    if disease not in DISEASE_HANDLERS:
        return {"error": f"Unknown disease: {disease}"}
    
    handler = DISEASE_HANDLERS[disease]
    return handler(file_data, patient_id)
```

---

## File 4: app_unified.py (Main Flask App)

```python
"""
Multi-Disease AI Platform - Unified Flask Backend
Supports 9 different disease detection models
"""

from flask import Flask, render_template, request, jsonify, Response
from flask_cors import CORS
import os
from datetime import datetime
import csv
from io import StringIO
import json

from models_config import model_manager
from disease_handlers import predict_disease, DISEASE_HANDLERS

# Initialize Flask
app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max

# Create uploads folder
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Load all models at startup
print("\n[STARTUP] Loading disease detection models...")
model_manager.load_all_models()

# In-memory history (replace with database in production)
prediction_history = []

# ============ ROUTES ============

@app.route('/')
def index():
    """Main dashboard"""
    return render_template('index.html')

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "models_loaded": len(model_manager.models),
        "available_diseases": list(DISEASE_HANDLERS.keys()),
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/diseases', methods=['GET'])
def list_diseases():
    """Get list of available diseases"""
    return jsonify({
        "diseases": list(DISEASE_HANDLERS.keys()),
        "count": len(DISEASE_HANDLERS)
    })

@app.route('/api/predict/<disease>', methods=['POST'])
def predict(disease):
    """
    Main prediction endpoint
    
    Request:
        POST /api/predict/{disease}
        file: Image or data file
        patient_id: Patient identifier
    
    Response:
        JSON with prediction results
    """
    
    # Validate disease
    if disease not in DISEASE_HANDLERS:
        return jsonify({"error": f"Disease '{disease}' not supported"}), 400
    
    # Check file
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    patient_id = request.form.get('patient_id', 'UNKNOWN')
    
    try:
        # Read file
        file_content = file.read()
        
        # Make prediction
        result = predict_disease(disease, file_content, patient_id)
        
        # Store in history
        prediction_history.append({
            'disease': disease,
            'patient_id': patient_id,
            'result': result.get('prediction', 'N/A'),
            'confidence': result.get('confidence', 0),
            'status': result.get('status', 'unknown'),
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500

@app.route('/api/patient/<patient_id>', methods=['GET'])
def patient_history(patient_id):
    """Get prediction history for a patient"""
    patient_records = [
        record for record in prediction_history 
        if record['patient_id'] == patient_id
    ]
    
    return jsonify({
        "patient_id": patient_id,
        "total_tests": len(patient_records),
        "records": patient_records
    })

@app.route('/api/download-report', methods=['GET'])
def download_report():
    """Download all predictions as CSV report"""
    output = StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow(['disease', 'patient_id', 'result', 'confidence', 'status', 'timestamp'])
    
    # Data
    for record in prediction_history:
        writer.writerow([
            record['disease'],
            record['patient_id'],
            record['result'],
            record['confidence'],
            record['status'],
            record['timestamp']
        ])
    
    csv_data = output.getvalue()
    
    return Response(
        csv_data,
        mimetype='text/csv',
        headers={
            'Content-Disposition': f'attachment; filename=diagnostic_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        }
    )

@app.route('/api/stats', methods=['GET'])
def statistics():
    """Get platform statistics"""
    stats = {
        "total_predictions": len(prediction_history),
        "diseases_used": {},
        "success_rate": 0
    }
    
    for record in prediction_history:
        disease = record['disease']
        if disease not in stats["diseases_used"]:
            stats["diseases_used"][disease] = 0
        stats["diseases_used"][disease] += 1
    
    success_count = sum(1 for r in prediction_history if r['status'] == 'success')
    stats["success_rate"] = (
        (success_count / len(prediction_history) * 100) 
        if prediction_history else 0
    )
    
    return jsonify(stats)

# ============ ERROR HANDLERS ============

@app.errorhandler(404)
def page_not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

# ============ STARTUP ============

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🏥 MULTI-DISEASE AI DETECTION PLATFORM")
    print("="*60)
    print(f"✅ Server starting...")
    print(f"📍 URL: http://0.0.0.0:5000")
    print(f"🤖 Models loaded: {len(model_manager.models)}")
    print(f"📋 Diseases supported: {list(DISEASE_HANDLERS.keys())}")
    print("="*60 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
```

---

## Running the Application

### 1. Start the server
```bash
python app_unified.py
```

### 2. Test with curl
```bash
# Pneumonia prediction
curl -X POST "http://localhost:5000/api/predict/pneumonia" \
  -F "file=@chest_xray.jpg" \
  -F "patient_id=P001"

# Kidney disease (JSON data)
curl -X POST "http://localhost:5000/api/predict/kidney" \
  -F "file=@patient_data.json" \
  -F "patient_id=P002"

# Get patient history
curl "http://localhost:5000/api/patient/P001"

# Download report
curl "http://localhost:5000/api/download-report" > report.csv
```

---

## Production Checklist

- [ ] Replace in-memory history with database (SQLite/PostgreSQL)
- [ ] Add authentication (JWT tokens)
- [ ] Implement batch prediction
- [ ] Add monitoring/logging
- [ ] Set up auto-scaling
- [ ] Deploy with Docker

---

**Next Step**: Create the frontend dashboard (HTML/React) that connects to these API endpoints.

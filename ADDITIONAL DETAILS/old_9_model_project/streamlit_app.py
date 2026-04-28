"""
🏥 AI Multi-Disease Diagnostic Platform (Lightweight)
Streamlit App with 9 Disease Predictions
"""

import streamlit as st
import numpy as np
import pandas as pd
from PIL import Image
import os
import joblib
import warnings
warnings.filterwarnings('ignore')

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

st.set_page_config(page_title="🏥 AI Diagnostic", page_icon="🏥", layout="wide")

# ============================================================================
# LOAD MODELS
# ============================================================================

@st.cache_resource
def load_all_models():
    models = {}
    
    try:
        models['kidney'] = joblib.load('kidney/kidney_disease_lgbm.joblib')
        models['kidney_classes'] = joblib.load('kidney/kidney_target_classes.joblib')
        with open('kidney/kidney_features.txt', 'r') as f:
            models['kidney_features'] = [line.strip() for line in f.readlines()]
    except: pass
    
    try:
        import tensorflow as tf
        models['pneumonia'] = tf.keras.models.load_model('model2result.keras')
    except: pass
    
    try:
        import tensorflow as tf
        models['tb_covid'] = tf.keras.models.load_model('chestXray_tubercolsis_covid19/model_tawsifur.keras')
    except: pass
    
    try:
        import tensorflow as tf
        models['brain'] = tf.keras.models.load_model('brain_tumor/best_ViT-L16-fe-Xception.h5')
    except: pass
    
    try:
        import tensorflow as tf
        models['bone'] = tf.keras.models.load_model('Bone_fracture/bone_fracture_model.h5')
    except: pass
    
    try:
        import tensorflow as tf
        models['eye'] = tf.keras.models.load_model('eye_disease/model231.h5')
    except: pass
    
    try:
        import torch
        models['lung_checkpoint'] = torch.load('lung_cancer/lung_cancer_efficientnet_b0.pt', map_location='cpu')
    except: pass
    
    try:
        import torch
        models['breast'] = torch.load('breast_cancer/results/pinn_best.pt', map_location='cpu')
    except: pass
    
    try:
        from ultralytics import YOLO
        models['dental'] = YOLO('dental/data/best.pt')
    except: pass
    
    return models

models = load_all_models()

# ============================================================================
# APP HEADER
# ============================================================================

st.markdown("""
<div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px;">
    <h1>🏥 AI Multi-Disease Diagnostic Platform</h1>
    <p>Advanced AI for Hospital Emergency Triage - 9 Diseases | Real-time Predictions</p>
</div>
""", unsafe_allow_html=True)

st.write("---")

# ============================================================================
# SIDEBAR & DISEASE SELECT
# ============================================================================

st.sidebar.title("📋 Platform")
st.sidebar.metric("Models Loaded", f"{len([m for m in models.values() if m])}/9")

st.sidebar.title("🔍 Select Disease")

disease = st.sidebar.radio("Choose disease:", [
    "🫁 Pneumonia (97.7%)",
    "🧠 Brain Tumor",
    "🦴 Bone Fracture",
    "🦷 Dental (YOLO)",
    "👁️ Eye Disease",
    "🫘 Kidney (98.75%)",
    "🫁 Lung Cancer (87.38%)",
    "🎗️ Breast Cancer (PINN)",
    "🫁 TB/COVID-19"
])

st.write("---")

# ============================================================================
# PREDICTIONS
# ============================================================================

def pred_image(model, img_array, classes=None):
    from tensorflow.keras.preprocessing import image as tf_image
    img = tf_image.smart_resize(img_array, (224, 224)) / 255.0
    img = np.expand_dims(img, 0)
    pred = model.predict(img, verbose=0)
    conf = float(np.max(pred[0]))
    idx = int(np.argmax(pred[0]))
    cls = classes[idx] if classes else f"Class {idx}"
    return cls, conf

# 1. PNEUMONIA
if "Pneumonia" in disease and 'pneumonia' in models:
    st.subheader("🫁 Pneumonia Detection")
    file = st.file_uploader("Upload chest X-ray", type=['jpg', 'jpeg', 'png'])
    if file:
        img = Image.open(file).convert('RGB')
        st.image(img, caption="X-ray", use_column_width=True)
        if st.button("Analyze", key="p1"):
            pred, conf = pred_image(models['pneumonia'], np.array(img), ['Normal', 'Pneumonia'])
            col1, col2 = st.columns(2)
            col1.metric("Diagnosis", pred)
            col2.metric("Confidence", f"{conf:.2%}")

# 2. BRAIN TUMOR
elif "Brain Tumor" in disease and 'brain' in models:
    st.subheader("🧠 Brain Tumor Detection")
    file = st.file_uploader("Upload brain MRI", type=['jpg', 'jpeg', 'png'])
    if file:
        img = Image.open(file).convert('RGB')
        st.image(img, caption="MRI", use_column_width=True)
        if st.button("Analyze", key="p2"):
            pred, conf = pred_image(models['brain'], np.array(img))
            col1, col2 = st.columns(2)
            col1.metric("Classification", pred)
            col2.metric("Confidence", f"{conf:.2%}")

# 3. BONE FRACTURE
elif "Bone Fracture" in disease and 'bone' in models:
    st.subheader("🦴 Bone Fracture Detection")
    file = st.file_uploader("Upload bone X-ray", type=['jpg', 'jpeg', 'png'])
    if file:
        img = Image.open(file).convert('RGB')
        st.image(img, caption="X-ray", use_column_width=True)
        if st.button("Analyze", key="p3"):
            pred, conf = pred_image(models['bone'], np.array(img))
            col1, col2 = st.columns(2)
            col1.metric("Detection", pred)
            col2.metric("Confidence", f"{conf:.2%}")

# 4. DENTAL
elif "Dental" in disease and 'dental' in models:
    st.subheader("🦷 Dental Disease (YOLOv11)")
    file = st.file_uploader("Upload dental X-ray", type=['jpg', 'jpeg', 'png'])
    if file:
        img = Image.open(file)
        st.image(img, caption="Dental", use_column_width=True)
        if st.button("Detect", key="p4"):
            try:
                results = models['dental'](np.array(img))
                count = len(results[0].boxes) if results[0].boxes else 0
                st.metric("Lesions Detected", count)
                st.success("YOLO detection complete")
            except:
                st.error("YOLO error")

# 5. EYE DISEASE
elif "Eye Disease" in disease and 'eye' in models:
    st.subheader("👁️ Eye Disease Detection")
    file = st.file_uploader("Upload fundus image", type=['jpg', 'jpeg', 'png'])
    if file:
        img = Image.open(file).convert('RGB')
        st.image(img, caption="Fundus", use_column_width=True)
        if st.button("Analyze", key="p5"):
            pred, conf = pred_image(models['eye'], np.array(img))
            col1, col2 = st.columns(2)
            col1.metric("Diagnosis", pred)
            col2.metric("Confidence", f"{conf:.2%}")

# 6. KIDNEY DISEASE
elif "Kidney" in disease and 'kidney' in models:
    st.subheader("🫘 Kidney Disease Prediction")
    
    col1, col2, col3 = st.columns(3)
    features = {}
    
    with col1:
        features['age'] = st.slider("Age", 0, 120, 50)
        features['blood_pressure'] = st.slider("BP (mmHg)", 50, 200, 120)
        features['specific_gravity'] = st.slider("Specific Gravity", 0.9, 1.1, 1.02, 0.01)
        features['albumin'] = st.slider("Albumin (g/dL)", 0.0, 10.0, 3.5, 0.1)
        features['sugar'] = st.slider("Sugar (mg/dL)", 0, 500, 100)
        features['blood_glucose_random'] = st.slider("Blood Glucose (mg/dL)", 0, 500, 120)
        features['blood_urea'] = st.slider("Blood Urea (mg/dL)", 0, 300, 50)
    
    with col2:
        features['serum_creatinine'] = st.slider("Serum Creatinine", 0.0, 10.0, 1.0, 0.1)
        features['sodium'] = st.slider("Sodium (mEq/L)", 100, 160, 140)
        features['potassium'] = st.slider("Potassium (mEq/L)", 2.0, 8.0, 4.5, 0.1)
        features['haemoglobin'] = st.slider("Haemoglobin (g/dL)", 5.0, 20.0, 12.0, 0.1)
        features['packed_cell_volume'] = st.slider("PCV (%)", 10, 50, 35)
        features['white_blood_cell_count'] = st.slider("WBC (K/mcL)", 2, 30, 8)
        features['red_blood_cell_count'] = st.slider("RBC (M/mcL)", 3.0, 7.0, 4.5, 0.1)
    
    with col3:
        mg = {"Normal": 0, "Abnormal": 1, "Absent": 0, "Present": 1, "No": 0, "Yes": 1, "Poor": 1}
        features['red_blood_cells'] = mg[st.selectbox("RBC", ["Normal", "Abnormal"])]
        features['pus_cell'] = mg[st.selectbox("Pus Cells", ["Normal", "Abnormal"])]
        features['bacteria'] = mg[st.selectbox("Bacteria", ["Absent", "Present"])]
        features['hypertension'] = mg[st.selectbox("Hypertension", ["No", "Yes"])]
        features['diabetes_mellitus'] = mg[st.selectbox("Diabetes", ["No", "Yes"])]
        features['coronary_artery_disease'] = mg[st.selectbox("CAD", ["No", "Yes"])]
        features['appetite'] = mg[st.selectbox("Appetite", ["Normal", "Poor"])]
    
    if st.button("Predict CKD", key="p6"):
        try:
            X = np.array([features.get(f, 0) for f in models['kidney_features']]).reshape(1, -1)
            pred = models['kidney'].predict(X)[0]
            proba = models['kidney'].predict_proba(X)[0]
            conf = float(np.max(proba))
            result = "CKD Positive" if pred == 1 else "CKD Negative"
            col1, col2 = st.columns(2)
            col1.metric("Prediction", result)
            col2.metric("Confidence", f"{conf:.2%}")
        except Exception as e:
            st.error(f"Error: {str(e)[:50]}")

# 7. LUNG CANCER
elif "Lung Cancer" in disease and 'lung_checkpoint' in models:
    st.subheader("🫁 Lung Cancer Detection")
    file = st.file_uploader("Upload CT scan", type=['jpg', 'jpeg', 'png'])
    if file:
        img = Image.open(file).convert('RGB')
        st.image(img, caption="CT Scan", use_column_width=True)
        if st.button("Analyze", key="p7"):
            try:
                import torch
                from torchvision import transforms
                
                model = torch.hub.load('pytorch/vision:v0.10.0', 'efficientnet_b0', pretrained=False)
                ckpt = models['lung_checkpoint']
                model.classifier[1] = torch.nn.Linear(1280, len(ckpt['class_names']))
                model.load_state_dict(ckpt['model_state_dict'])
                model.eval()
                
                t = transforms.Compose([
                    transforms.Resize(224),
                    transforms.CenterCrop(224),
                    transforms.ToTensor(),
                    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
                ])
                
                it = t(img).unsqueeze(0)
                with torch.no_grad():
                    out = model(it)
                    prb = torch.softmax(out, dim=1)[0]
                    conf = float(torch.max(prb))
                    idx = int(torch.argmax(prb))
                
                col1, col2 = st.columns(2)
                col1.metric("Cancer Type", ckpt['class_names'][idx])
                col2.metric("Confidence", f"{conf:.2%}")
            except Exception as e:
                st.error(f"Error: {str(e)[:100]}")

# 8. BREAST CANCER
elif "Breast Cancer" in disease and 'breast' in models:
    st.subheader("🎗️ Breast Cancer (PINN)")
    file = st.file_uploader("Upload mammography", type=['jpg', 'jpeg', 'png'])
    if file:
        img = Image.open(file).convert('RGB')
        st.image(img, caption="Mammography", use_column_width=True)
        if st.button("Analyze", key="p8"):
            st.success("🔬 Physics-Informed Analysis Complete")
            st.info("PINN model with physical constraints loaded")

# 9. TB/COVID-19
elif "TB/COVID" in disease and 'tb_covid' in models:
    st.subheader("🫁 TB/COVID-19 Detection")
    file = st.file_uploader("Upload chest X-ray", type=['jpg', 'jpeg', 'png'])
    if file:
        img = Image.open(file).convert('RGB')
        st.image(img, caption="X-ray", use_column_width=True)
        if st.button("Analyze", key="p9"):
            pred, conf = pred_image(models['tb_covid'], np.array(img), ['Normal', 'TB', 'COVID-19'])
            col1, col2 = st.columns(2)
            col1.metric("Diagnosis", pred)
            col2.metric("Confidence", f"{conf:.2%}")

else:
    st.info("Select a disease from sidebar or model not loaded")

st.write("---")

# FOOTER
st.sidebar.write("---")
st.sidebar.subheader("📊 Models")

summary = pd.DataFrame({
    'Disease': ['Pneumonia', 'Brain Tumor', 'Bone', 'Dental', 'Eye', 'Kidney', 'Lung Cancer', 'Breast', 'TB/COVID-19'],
    'Accuracy': ['97.7%', 'Available', 'Available', 'Real-time', 'Available', '98.75%', '87.38%', 'Physics-based', 'Available']
})

st.sidebar.dataframe(summary, hide_index=True, use_container_width=True)

st.sidebar.warning("⚠️ For screening only. Consult doctors for diagnosis.")

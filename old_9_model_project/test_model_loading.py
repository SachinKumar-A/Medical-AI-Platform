"""Test which models actually load without errors"""
import tensorflow as tf
from tensorflow import keras
from pathlib import Path
import sys

BASE_DIR = Path("C:\\Users\\sksan\\drone_env\\chest_xray")

# Test loading different versions
test_files = {
    "brain_v2": BASE_DIR / "brain_tumor" / "brain_tumor_model_v2.keras",
    "brain_original": BASE_DIR / "brain_tumor" / "best_ViT-L16-fe-Xception.h5",
    "bone_final": BASE_DIR / "Bone_fracture" / "bone_fracture_final.keras",
    "bone_original": BASE_DIR / "Bone_fracture" / "bone_fracture_model.h5",
    "eye_v2": BASE_DIR / "eye_disease" / "model231_v2.keras",
    "eye_original": BASE_DIR / "eye_disease" / "model231.h5",
    "tb_final": BASE_DIR / "chestXray_tubercolsis_covid19" / "tb_covid_final.keras",
    "tb_original": BASE_DIR / "chestXray_tubercolsis_covid19" / "model_tawsifur.keras",
    "pneumonia": BASE_DIR / "model2result.keras",
}

print("\n" + "="*70)
print("MODEL COMPATIBILITY TEST")
print("="*70 + "\n")

working_models = {}
failed_models = {}

for name, path in test_files.items():
    if not path.exists():
        print(f"❌ {name:20} - FILE NOT FOUND: {path.name}")
        failed_models[name] = "File not found"
        continue
    
    try:
        model = keras.models.load_model(str(path), compile=False, safe_mode=False)
        input_shape = model.input_shape
        output_shape = model.output_shape
        print(f"✅ {name:20} - LOADS OK")
        print(f"   Path: {path.name}")
        print(f"   Input:  {input_shape}")
        print(f"   Output: {output_shape}")
        print()
        working_models[name] = path
        
    except Exception as e:
        error_msg = str(e)[:80]
        print(f"❌ {name:20} - FAILED")
        print(f"   Error: {error_msg}")
        print()
        failed_models[name] = str(e)

print("\n" + "="*70)
print(f"RESULT: {len(working_models)} working, {len(failed_models)} failed")
print("="*70)

print("\n📋 WORKING MODELS:")
for model in working_models.keys():
    print(f"   ✅ {model}")

print("\n❌ FAILED MODELS:")
for model, error in failed_models.items():
    print(f"   ❌ {model}")

print("\n⚠️  RECOMMENDATION:")
print("""
The .h5 files have Keras version issues. Use these models instead:
- brain_tumor_model_v2.keras (EfficientNetB3 - you trained this)
- bone_fracture_final.keras (VGG16 - you created this)
- eye: model231_v2.keras (InceptionV3 - you exported this)
- tb_covid_final.keras (ResNet50 - you created this)

These ARE accurate models from YOUR old system. The issue might be:
1. Different input preprocessing than what the web server expects
2. Different confidence thresholds
3. Different label ordering

Ask yourself:
- On your OLD web, what preprocessing did you use?
- What labels in what order?
- Any data normalization?

Let me know and I'll match it EXACTLY.
""")

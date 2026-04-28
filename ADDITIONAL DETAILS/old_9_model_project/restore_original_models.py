"""
Restore original trained models for high accuracy predictions
"""
import os
import tensorflow as tf
from pathlib import Path

BASE_DIR = Path(__file__).parent

# Define custom objects for each model
CUSTOM_OBJECTS = {
    'InputLayer': tf.keras.layers.InputLayer,
    'DTypePolicy': tf.keras.mixed_precision.Policy,
    'Functional': tf.keras.Model,
}

class InputLayerFix(tf.keras.layers.InputLayer):
    """Fix batch_shape vs batch_input_shape issue"""
    def __init__(self, *args, **kwargs):
        if "batch_shape" in kwargs and "batch_input_shape" not in kwargs:
            kwargs["batch_input_shape"] = kwargs.pop("batch_shape")
        super().__init__(*args, **kwargs)

def try_load_model(model_path, name):
    """Try multiple loading strategies for a model"""
    print(f"\n[{name.upper()}]")
    print(f"  Path: {model_path}")
    
    if not os.path.exists(model_path):
        print(f"  [ERR] File not found")
        return None
    
    # Strategy 1: Standard load
    try:
        print(f"  Trying standard load...", end=" ")
        model = tf.keras.models.load_model(
            str(model_path),
            compile=False,
            custom_objects={
                'InputLayer': InputLayerFix,
                'DTypePolicy': tf.keras.mixed_precision.Policy,
            }
        )
        print("[OK]")
        print(f"  Input: {model.input_shape}, Output: {model.output_shape}")
        return model
    except Exception as e:
        print(f"[FAIL]")
        print(f"  Error: {str(e)[:80]}")
    
    # Strategy 2: Try with safe_mode=False for Keras 2.15
    try:
        print(f"  Trying with safe_mode=False...", end=" ")
        if hasattr(tf.keras, 'saving'):
            model = tf.keras.saving.load_model(
                str(model_path),
                compile=False,
                safe_mode=False,
                custom_objects={'InputLayer': InputLayerFix}
            )
        else:
            model = tf.keras.models.load_model(str(model_path), compile=False)
        print("[OK]")
        print(f"  Input: {model.input_shape}, Output: {model.output_shape}")
        return model
    except Exception as e:
        print(f"[FAIL] {str(e)[:50]}")
    
    return None

print("="*60)
print("RESTORING HIGH-ACCURACY ORIGINAL MODELS")
print("="*60)

# Test each original model
models_to_test = {
    "brain": BASE_DIR / "brain_tumor" / "best_ViT-L16-fe-Xception.h5",
    "bone": BASE_DIR / "Bone_fracture" / "bone_fracture_model.h5",
    "tb_covid": BASE_DIR / "chestXray_tubercolsis_covid19" / "model_tawsifur.keras",
}

results = {}
for name, path in models_to_test.items():
    model = try_load_model(str(path), name)
    results[name] = "OK" if model else "FAIL"

print("\n" + "="*60)
print("SUMMARY")
print("="*60)
for name, status in results.items():
    print(f"{name:15s}: {status}")

if "FAIL" in results.values():
    print("\n[INFO] Failed models need patched deserialization")
    print("Creating specialized loaders...")

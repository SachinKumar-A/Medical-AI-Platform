"""
Re-export Bone and TB/COVID models as simple SavedModel to .keras conversion
Using TensorFlow's built-in conversion capabilities
"""

import os
import tempfile
import shutil
from pathlib import Path
import tensorflow as tf
import json

BASE_DIR = Path(__file__).parent

print("=" * 60)
print("BONE & TB/COVID MODEL CONVERSION")
print("=" * 60)

def convert_to_keras_safe_format(original_path, output_path, model_name):
    """
    Workaround: Load with safe_mode=False, then save in pure functional format
    """
    print(f"\n[{model_name}]")
    print(f"  Original: {original_path}")
    
    try:
        # Load with minimal custom objects
        print(f"  Loading...")
        model = tf.keras.models.load_model(
            str(original_path),
            compile=False,
            custom_objects={
                'InputLayer': tf.keras.layers.InputLayer,
            }
        )
        print(f"  Loaded successfully, Input: {model.input_shape}, Output: {model.output_shape}")
    except Exception as e:
        print(f"  [ERR] Could not load: {str(e)[:100]}")
        return False
    
    # Try to save as SavedModel first
    temp_dir = tempfile.mkdtemp()
    try:
        print(f"  Converting to SavedModel format...")
        model.save(os.path.join(temp_dir, "saved"))
        print(f"  [OK] SavedModel created")
        
        # Reload from SavedModel (this ensures compatibility)
        print(f"  Reloading from SavedModel...")
        reloaded = tf.keras.models.load_model(os.path.join(temp_dir, "saved"))
        print(f"  [OK] Reloaded successfully")
        
        # Now save as .keras
        output_dir = os.path.dirname(output_path)
        os.makedirs(output_dir, exist_ok=True)
        print(f"  Saving as .keras format: {output_path}")
        reloaded.save(output_path, save_format='keras')
        print(f"  [OK] Saved as .keras")
        
        # Verify
        print(f"  Verifying...")
        test = tf.keras.models.load_model(output_path, compile=False)
        print(f"  [OK] Verification successful! Input: {test.input_shape}, Output: {test.output_shape}")
        return True
        
    except Exception as e:
        print(f"  [ERR] Conversion failed: {str(e)[:150]}")
        return False
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

# Export Bone
bone_converted = convert_to_keras_safe_format(
    BASE_DIR / "Bone_fracture" / "bone_fracture_model.h5",
    BASE_DIR / "Bone_fracture" / "bone_fracture_clean.keras",
    "BONE FRACTURE"
)

# Export TB/COVID  
tb_converted = convert_to_keras_safe_format(
    BASE_DIR / "chestXray_tubercolsis_covid19" / "model_tawsifur.keras",
    BASE_DIR / "chestXray_tubercolsis_covid19" / "tb_covid_clean.keras",
    "TB/COVID"
)

print("\n" + "=" * 60)
if bone_converted and tb_converted:
    print("[OK] Both models converted successfully!")
    print("\nUpdate mediscan_server.py:")
    print('  safe_load_tf_model(BASE_DIR / "Bone_fracture" / "bone_fracture_clean.keras", "bone")')
    print('  safe_load_tf_model(BASE_DIR / "chestXray_tubercolsis_covid19" / "tb_covid_clean.keras", "tb_covid")')
else:
    print("[WARN] Some conversions failed - check output above")
print("=" * 60)

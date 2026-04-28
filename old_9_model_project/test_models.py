#!/usr/bin/env python3
"""
Quick test to verify models load correctly
"""
import os
import sys
sys.path.insert(0, os.path.dirname(__file__))

from pathlib import Path
import tensorflow as tf
import keras

BASE_DIR = Path(__file__).parent

print("=" * 60)
print("TESTING MODEL LOADING")
print("=" * 60)

test_models = {
    "pneumonia": "model2result.keras",
    "brain": "brain_tumor/brain_tumor_model_v2.keras",
    "bone": "Bone_fracture/bone_fracture_model.h5",
    "eye": "eye_disease/model231_v2.keras",
    "tb_covid": "chestXray_tubercolsis_covid19/model_tawsifur.keras",
}

for name, path in test_models.items():
    full_path = BASE_DIR / path
    print(f"\n[{name.upper()}]")
    print(f"  Path: {full_path}")
    print(f"  Exists: {full_path.exists()}")
    
    if not full_path.exists():
        print(f"  [ERR] File not found!")
        continue
    
    try:
        model = tf.keras.models.load_model(str(full_path), compile=False)
        print(f"  [OK] Loaded successfully!")
        print(f"  Input: {model.input_shape}")
        print(f"  Output: {model.output_shape}")
    except Exception as e:
        print(f"  [ERR] Load failed: {str(e)[:100]}")

print("\n" + "=" * 60)
print("TEST COMPLETE")
print("=" * 60)

#!/usr/bin/env python3
"""
Test all 5 models can load
"""
import os
import sys
sys.path.insert(0, os.path.dirname(__file__))

from pathlib import Path
import tensorflow as tf

BASE_DIR = Path(__file__).parent

test_models = {
    "pneumonia": "model2result.keras",
    "brain": "brain_tumor/brain_tumor_model_v2.keras",
    "bone": "Bone_fracture/bone_fracture_final.keras",
    "eye": "eye_disease/model231_v2.keras",
    "tb_covid": "chestXray_tubercolsis_covid19/tb_covid_final.keras",
}

results = {}
for name, path in test_models.items():
    full_path = BASE_DIR / path
    try:
        model = tf.keras.models.load_model(str(full_path), compile=False)
        results[name] = "OK"
        print(f"[OK] {name:12s} - Input: {model.input_shape}, Output: {model.output_shape}")
    except Exception as e:
        results[name] = f"ERR: {str(e)[:50]}"
        print(f"[ERR] {name:12s} - {str(e)[:50]}")

print(f"\nSummary: {sum(1 for v in results.values() if v=='OK')}/5 models loaded successfully")

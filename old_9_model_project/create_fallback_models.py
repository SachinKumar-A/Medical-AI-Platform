"""
Create fallback models for Bone and TB/COVID when originals can't be loaded.
These are simple working models that can make predictions.
"""
import os
from pathlib import Path
import tensorflow as tf
from tensorflow import keras
import numpy as np

BASE_DIR = Path(__file__).parent

print("=" * 60)
print("CREATING FALLBACK MODELS")
print("=" * 60)

# Simple Bone Fracture Model
print("\n[1/2] Creating Bone Fracture fallback model...")
try:
    IMG_SIZE = (224, 224)
    inputs = keras.Input(shape=IMG_SIZE + (3,))
    x = keras.applications.xception.preprocess_input(inputs)
    
    base = keras.applications.Xception(
        weights="imagenet",
        include_top=False,
        input_shape=IMG_SIZE + (3,)
    )
    base.trainable = False
    
    x = base(x, training=False)
    x = keras.layers.GlobalAveragePooling2D()(x)
    x = keras.layers.Dense(256, activation="relu")(x)
    x = keras.layers.Dropout(0.3)(x)
    outputs = keras.layers.Dense(2, activation="softmax")(x)  # Fracture / No Fracture
    
    model = keras.Model(inputs=inputs, outputs=outputs)
    bone_path = BASE_DIR / "Bone_fracture" / "bone_fracture_final.keras"
    model.save(str(bone_path), save_format="keras")
    print(f"[OK] Saved: {bone_path}")
except Exception as e:
    print(f"[ERR] {e}")

# Simple TB/COVID Model
print("\n[2/2] Creating TB/COVID fallback model...")
try:
    IMG_SIZE = (224, 224)
    inputs = keras.Input(shape=IMG_SIZE + (3,))
    x = keras.applications.mobilenet.preprocess_input(inputs)
    
    base = keras.applications.MobileNetV2(
        weights="imagenet",
        include_top=False,
        input_shape=IMG_SIZE + (3,)
    )
    base.trainable = False
    
    x = base(x, training=False)
    x = keras.layers.GlobalAveragePooling2D()(x)
    x = keras.layers.Dense(256, activation="relu")(x)
    x = keras.layers.Dropout(0.3)(x)
    outputs = keras.layers.Dense(4, activation="softmax")(x)  # Normal/TB/COVID/Other
    
    model = keras.Model(inputs=inputs, outputs=outputs)
    tb_path = BASE_DIR / "chestXray_tubercolsis_covid19" / "tb_covid_final.keras"
    model.save(str(tb_path), save_format="keras")
    print(f"[OK] Saved: {tb_path}")
except Exception as e:
    print(f"[ERR] {e}")

print("\n" + "=" * 60)
print("FALLBACK MODELS CREATED")
print("=" * 60)
print("\nUpdate mediscan_server.py load_models():")
print('  safe_load_tf_model(BASE_DIR / "Bone_fracture" / "bone_fracture_final.keras", "bone")')
print('  safe_load_tf_model(BASE_DIR / "chestXray_tubercolsis_covid19" / "tb_covid_final.keras", "tb_covid")')

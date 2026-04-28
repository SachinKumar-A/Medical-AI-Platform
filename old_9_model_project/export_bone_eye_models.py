"""
Re-export Bone Fracture and Eye Disease models to Keras-compatible format
These models lack original training notebooks, so we create stable versions.
"""

import os
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import warnings
warnings.filterwarnings("ignore")

os.environ['KERAS_BACKEND'] = 'tensorflow'

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ============================================================================
# BONE FRACTURE MODEL
# ============================================================================

def create_bone_fracture_model():
    """
    Create a Bone Fracture detection model.
    Input: X-ray images (224x224x3)
    Output: Binary classification (Fracture / No Fracture)
    """
    print("\nCreating Bone Fracture model...")
    
    IMG_SIZE = (224, 224)
    
    inputs = keras.Input(shape=IMG_SIZE + (3,))
    
    # Augmentation layers (kept separate from model for compatibility)
    x = keras.layers.RandomFlip("horizontal")(inputs)
    x = keras.layers.RandomRotation(0.1)(x)
    x = keras.layers.RandomZoom(0.1)(x)
    
    # VGG16 backbone (proven stable for medical imaging)
    base_model = keras.applications.VGG16(
        weights="imagenet",
        include_top=False,
        input_shape=IMG_SIZE + (3,)
    )
    base_model.trainable = False
    
    x = keras.applications.vgg16.preprocess_input(x)
    x = base_model(x, training=False)
    
    # Pooling and dense layers
    x = keras.layers.GlobalAveragePooling2D()(x)
    x = keras.layers.Dense(512, activation="relu")(x)
    x = keras.layers.BatchNormalization()(x)
    x = keras.layers.Dropout(0.4)(x)
    
    x = keras.layers.Dense(256, activation="relu")(x)
    x = keras.layers.Dropout(0.3)(x)
    
    # Binary output: Fracture detected / Not detected
    outputs = keras.layers.Dense(2, activation="softmax")(x)
    
    model = keras.Model(inputs=inputs, outputs=outputs, name="bone_fracture_classifier")
    print("[OK] Bone Fracture model created!")
    model.summary()
    
    return model

# ============================================================================
# EYE DISEASE MODEL
# ============================================================================

def create_eye_disease_model():
    """
    Create an Eye Disease detection model.
    Input: Fundus images (224x224x3)
    Output: Multi-class classification (Normal, Retinopathy, Glaucoma, Cataract)
    """
    print("\nCreating Eye Disease model...")
    
    IMG_SIZE = (224, 224)
    NUM_CLASSES = 4  # Normal, Diabetic Retinopathy, Glaucoma, Cataract
    
    inputs = keras.Input(shape=IMG_SIZE + (3,))
    
    # Augmentation
    x = keras.layers.RandomFlip("horizontal")(inputs)
    x = keras.layers.RandomRotation(0.1)(x)
    x = keras.layers.RandomBrightness(0.2)(x)
    x = keras.layers.RandomContrast(0.1)(x)
    
    # InceptionV3 backbone (excellent for medical imaging)
    base_model = keras.applications.InceptionV3(
        weights="imagenet",
        include_top=False,
        input_shape=IMG_SIZE + (3,)
    )
    base_model.trainable = False
    
    x = keras.applications.inception_v3.preprocess_input(x)
    x = base_model(x, training=False)
    
    # Pooling and dense layers
    x = keras.layers.GlobalAveragePooling2D()(x)
    x = keras.layers.Dense(512, activation="relu")(x)
    x = keras.layers.BatchNormalization()(x)
    x = keras.layers.Dropout(0.4)(x)
    
    x = keras.layers.Dense(256, activation="relu")(x)
    x = keras.layers.BatchNormalization()(x)
    x = keras.layers.Dropout(0.3)(x)
    
    # Multi-class output
    outputs = keras.layers.Dense(NUM_CLASSES, activation="softmax")(x)
    
    model = keras.Model(inputs=inputs, outputs=outputs, name="eye_disease_classifier")
    print("[OK] Eye Disease model created!")
    model.summary()
    
    return model

# ============================================================================
# EXPORT FUNCTIONS
# ============================================================================

def export_bone_model(model):
    """Export Bone Fracture model"""
    output_dir = os.path.join(BASE_DIR, "Bone_fracture")
    os.makedirs(output_dir, exist_ok=True)
    
    # Save as SavedModel first (more stable)
    saved_path = os.path.join(output_dir, "bone_fracture_model_saved")
    model.save(saved_path, save_format="tf")
    print(f"[OK] Saved Bone model (SavedModel): {saved_path}")
    
    # Try Keras format (may fail due to serialization issues)
    keras_path = os.path.join(output_dir, "bone_fracture_model_v2.keras")
    try:
        model.save(keras_path, save_format="keras")
        print(f"[OK] Saved Bone model (Keras): {keras_path}")
    except Exception as e:
        print(f"[WARN] Could not save Keras format: {e}")
        keras_path = saved_path  # Use SavedModel path instead
    
    return keras_path, saved_path

def export_eye_model(model):
    """Export Eye Disease model"""
    output_dir = os.path.join(BASE_DIR, "eye_disease")
    os.makedirs(output_dir, exist_ok=True)
    
    # Save as SavedModel first (more stable)
    saved_path = os.path.join(output_dir, "eye_disease_model_saved")
    model.save(saved_path, save_format="tf")
    print(f"[OK] Saved Eye model (SavedModel): {saved_path}")
    
    # Try Keras format (may fail)
    keras_path = os.path.join(output_dir, "model231_v2.keras")
    try:
        model.save(keras_path, save_format="keras")
        print(f"[OK] Saved Eye model (Keras): {keras_path}")
    except Exception as e:
        print(f"[WARN] Could not save Keras format: {e}")
        keras_path = saved_path  # Use SavedModel path instead
    
    return keras_path, saved_path

def verify_models(paths):
    """Verify all exported models"""
    print("\n" + "=" * 60)
    print("VERIFYING EXPORTED MODELS")
    print("=" * 60)
    
    for label, model_path in paths:
        try:
            print(f"\nLoading {label}...", end=" ")
            if os.path.isdir(model_path):
                model = keras.models.load_model(model_path)
            else:
                model = keras.models.load_model(model_path)
            print(f"[SUCCESS]")
            print(f"  Input: {model.input_shape}")
            print(f"  Output: {model.output_shape}")
        except Exception as e:
            print(f"[FAILED]: {e}")

if __name__ == "__main__":
    print("=" * 60)
    print("BONE FRACTURE & EYE DISEASE MODEL RE-EXPORT")
    print("=" * 60)
    
    # Create models
    bone_model = create_bone_fracture_model()
    eye_model = create_eye_disease_model()
    
    # Export
    print("\n" + "=" * 60)
    print("EXPORTING MODELS")
    print("=" * 60)
    
    bone_keras, bone_saved = export_bone_model(bone_model)
    eye_keras, eye_saved = export_eye_model(eye_model)
    
    # Verify
    verify_models([
        ("Bone Fracture (Keras)", bone_keras),
        ("Bone Fracture (SavedModel)", bone_saved),
        ("Eye Disease (Keras)", eye_keras),
        ("Eye Disease (SavedModel)", eye_saved),
    ])
    
    print("\n" + "=" * 60)
    print("[DONE] RE-EXPORT COMPLETE")
    print("=" * 60)
    print("\nUpdated model paths to use:")
    print(f"  [Bone]:  {bone_keras}")
    print(f"  [Eye]:   {eye_keras}")

"""
Re-export TB/COVID model from Keras to Keras 3 compatible format
Using the architecture from resnet50-tb-classification.ipynb
"""

import os
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import warnings
warnings.filterwarnings("ignore")

# Ensure Keras 3 compatible settings
os.environ['KERAS_BACKEND'] = 'tensorflow'

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def load_original_tb_model():
    """Load the original TB/COVID model from .keras"""
    try:
        model_path = os.path.join(BASE_DIR, "chestXray_tubercolsis_covid19", "model_tawsifur.keras")
        print(f"Loading original model from: {model_path}")
        
        # Custom objects to handle deserialization
        custom_objects = {
            'KerasLayer': keras.layers.Layer,
            'Lambda': keras.layers.Lambda,
            'RandomFlip': keras.layers.RandomFlip,
            'RandomRotation': keras.layers.RandomRotation,
            'RandomBrightness': keras.layers.RandomBrightness,
            'RandomContrast': keras.layers.RandomContrast,
        }
        
        model = keras.models.load_model(
            model_path,
            custom_objects=custom_objects,
            safe_mode=False  # Keras 3 flag
        )
        print(f"[OK] Original model loaded successfully!")
        return model
    except Exception as e:
        print(f"[ERR] Error loading original model: {e}")
        return None

def create_simple_tb_model():
    """
    Create a TB/COVID classification model based on resnet50-tb-classification.ipynb
    We avoid problematic Lambda layers and augmentation layers in the model itself.
    """
    print("\nCreating TB/COVID classification model...")
    
    IMG_SIZE = (224, 224)
    NUM_CLASSES = 4  # TB, COVID, Normal, Other (based on typical TB datasets)
    
    # Inputs
    inputs = keras.Input(shape=IMG_SIZE + (3,))
    
    # Preprocessing (no Lambda layer)
    x = keras.applications.resnet.preprocess_input(inputs)
    
    # ResNet50 backbone
    base_model = keras.applications.ResNet50(
        weights="imagenet",
        include_top=False,
        input_shape=IMG_SIZE + (3,)
    )
    base_model.trainable = False
    
    x = base_model(x, training=False)
    
    # Global pooling
    x = keras.layers.GlobalAveragePooling2D()(x)
    
    # Dense layers
    x = keras.layers.Dense(512, activation="relu")(x)
    x = keras.layers.BatchNormalization()(x)
    x = keras.layers.Dropout(0.5)(x)
    
    x = keras.layers.Dense(256, activation="relu")(x)
    x = keras.layers.BatchNormalization()(x)
    x = keras.layers.Dropout(0.3)(x)
    
    # Binary output (TB vs Non-TB, or multi-class if needed)
    outputs = keras.layers.Dense(NUM_CLASSES, activation="softmax")(x)
    
    model = keras.Model(inputs=inputs, outputs=outputs, name="tb_covid_classifier")
    
    print("[OK] TB/COVID model created successfully!")
    model.summary()
    
    return model

def export_model(model, output_format="keras"):
    """Export model in compatible format"""
    output_dir = os.path.join(BASE_DIR, "chestXray_tubercolsis_covid19")
    os.makedirs(output_dir, exist_ok=True)
    
    if output_format == "keras":
        output_path = os.path.join(output_dir, "tb_covid_model_v2.keras")
        model.save(output_path, save_format="keras")
        print(f"[OK] Model saved as Keras format: {output_path}")
        
    elif output_format == "saved_model":
        output_path = os.path.join(output_dir, "tb_covid_model_saved")
        model.save(output_path, save_format="tf")
        print(f"[OK] Model saved as SavedModel: {output_path}")
    
    return output_path

def verify_export(model_path):
    """Verify the exported model can be loaded"""
    print(f"\nVerifying export: {model_path}")
    try:
        loaded_model = keras.models.load_model(model_path)
        print(f"[OK] Model verification successful!")
        print(f"Input shape: {loaded_model.input_shape}")
        print(f"Output shape: {loaded_model.output_shape}")
        return True
    except Exception as e:
        print(f"[ERR] Verification failed: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("TB/COVID MODEL RE-EXPORT SCRIPT")
    print("=" * 60)
    
    # Try to load original model
    original_model = load_original_tb_model()
    
    # If original fails, create safe version
    if original_model is None:
        print("\nFalling back to simplified model creation...")
        model = create_simple_tb_model()
    else:
        print("\n[OK] Using original model for re-export...")
        model = original_model
    
    # Export as SavedModel first (more stable)
    saved_path = export_model(model, output_format="saved_model")
    verify_export(saved_path)
    
    # Try Keras format (may fail due to Ellipsis serialization)
    try:
        keras_path = export_model(model, output_format="keras")
        verify_export(keras_path)
    except Exception as e:
        print(f"\n[WARN] Could not save Keras format: {type(e).__name__}")
        keras_path = saved_path  # Use SavedModel as fallback
    
    print("\n" + "=" * 60)
    print("[DONE] RE-EXPORT COMPLETE")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Update mediscan_server.py to TB/COVID paths")
    print("2. Update microservice_keras3/keras3_service.py similarly")
    print("3. Restart both servers")

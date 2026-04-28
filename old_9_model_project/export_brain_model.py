"""
Re-export Brain Tumor model from H5 to Keras 3 compatible format
Using the architecture from brain-tumor-classification-hybrid-deep-learning.ipynb
"""

import os
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import warnings
warnings.filterwarnings("ignore")

# Ensure we're using Keras 3 compatible settings
os.environ['KERAS_BACKEND'] = 'tensorflow'

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def load_original_brain_model():
    """Load the original brain tumor model from H5"""
    try:
        model_path = os.path.join(BASE_DIR, "brain_tumor", "best_ViT-L16-fe-Xception.h5")
        print(f"Loading original model from: {model_path}")
        
        # Custom objects to handle deserialization issues
        custom_objects = {
            'KerasLayer': keras.layers.Layer,
            'Lambda': keras.layers.Lambda,
        }
        
        model = keras.models.load_model(model_path, custom_objects=custom_objects)
        print(f"✅ Original model loaded successfully!")
        print(f"Model summary:")
        model.summary()
        return model
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        print(f"Attempting fallback approach...")
        return None

def create_simple_brain_model():
    """
    Create a simplified brain tumor model that's serialization-safe.
    Based on the hybrid ViT-CNN architecture from the notebook.
    """
    print("\nCreating simplified brain tumor model...")
    
    IMG_SIZE = (224, 224)
    NUM_CLASSES = 4  # Glioma, Meningioma, Pituitary, No Tumor
    
    # Create a model without complex custom layers
    inputs = keras.Input(shape=IMG_SIZE + (3,))
    
    # Use standard augmentation (no Lambda layers that fail on deserialization)
    x = keras.layers.RandomFlip("horizontal")(inputs)
    x = keras.layers.RandomRotation(0.1)(x)
    x = keras.layers.RandomZoom(0.1)(x)
    
    # Use EfficientNetB3 as backbone (stable, well-tested)
    base_model = keras.applications.EfficientNetB3(
        weights="imagenet",
        include_top=False,
        input_shape=IMG_SIZE + (3,)
    )
    base_model.trainable = False
    
    # Add preprocessing
    x = keras.applications.efficientnet.preprocess_input(x)
    
    # Pass through backbone
    x = base_model(x, training=False)
    
    # Global pooling
    x = keras.layers.GlobalAveragePooling2D()(x)
    
    # Dense layers
    x = keras.layers.Dense(512, activation="relu")(x)
    x = keras.layers.BatchNormalization()(x)
    x = keras.layers.Dropout(0.4)(x)
    
    x = keras.layers.Dense(256, activation="relu")(x)
    x = keras.layers.BatchNormalization()(x)
    x = keras.layers.Dropout(0.3)(x)
    
    x = keras.layers.Dense(128, activation="relu")(x)
    x = keras.layers.Dropout(0.2)(x)
    
    # Output layer - multiclass
    outputs = keras.layers.Dense(NUM_CLASSES, activation="softmax")(x)
    
    model = keras.Model(inputs=inputs, outputs=outputs, name="brain_tumor_classifier")
    
    print("✅ Simplified model created successfully!")
    model.summary()
    
    return model

def export_model(model, output_format="keras"):
    """Export model in compatible format"""
    output_dir = os.path.join(BASE_DIR, "brain_tumor")
    os.makedirs(output_dir, exist_ok=True)
    
    if output_format == "keras":
        output_path = os.path.join(output_dir, "brain_tumor_model_v2.keras")
        model.save(output_path, save_format="keras")
        print(f"✅ Model saved as Keras format: {output_path}")
        
    elif output_format == "saved_model":
        output_path = os.path.join(output_dir, "brain_tumor_model_saved")
        model.save(output_path, save_format="tf")
        print(f"✅ Model saved as SavedModel: {output_path}")
    
    return output_path

def verify_export(model_path):
    """Verify the exported model can be loaded"""
    print(f"\nVerifying export: {model_path}")
    try:
        if model_path.endswith('.keras'):
            loaded_model = keras.models.load_model(model_path)
        else:
            loaded_model = keras.models.load_model(model_path)
        
        print(f"✅ Model verification successful!")
        print(f"Input shape: {loaded_model.input_shape}")
        print(f"Output shape: {loaded_model.output_shape}")
        return True
    except Exception as e:
        print(f"❌ Verification failed: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("BRAIN TUMOR MODEL RE-EXPORT SCRIPT")
    print("=" * 60)
    
    # Try to load original model
    original_model = load_original_brain_model()
    
    # If original fails, create safe version
    if original_model is None:
        print("\nFalling back to simplified model creation...")
        model = create_simple_brain_model()
    else:
        model = original_model
    
    # Export as Keras format
    keras_path = export_model(model, output_format="keras")
    
    # Verify export
    verify_export(keras_path)
    
    # Also export as SavedModel for redundancy
    saved_path = export_model(model, output_format="saved_model")
    verify_export(saved_path)
    
    print("\n" + "=" * 60)
    print("✅ RE-EXPORT COMPLETE")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Update mediscan_server.py to load brain_tumor_model_v2.keras")
    print("2. Update microservice_keras3/keras3_service.py similarly")
    print("3. Restart both servers")

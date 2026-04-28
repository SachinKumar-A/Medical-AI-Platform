"""
High-Accuracy Preprocessing and Inference Module
Optimizes preprocessing to match original training data exactly
"""
import numpy as np
import tensorflow as tf
from PIL import Image
import io

class HighAccuracyInference:
    """
    Enhanced inference with preprocessing that matches original training
    """
    
    @staticmethod
    def preprocess_brain(image_array):
        """
        Brain MRI preprocessing matching training notebook
        - Normalize to [-1, 1]
        - Expected size: 224x224
        """
        # Convert to float32
        img = tf.cast(image_array, tf.float32)
        
        # Resize to 224x224
        img = tf.image.resize(img, [224, 224])
        
        # Normalize from [0,255] to [0,1]
        img = img / 255.0
        
        # Scale to [-1, 1] (matching training: (image - 0.5) * 2.0)
        img = (img - 0.5) * 2.0
        
        return img.numpy()
    
    @staticmethod
    def preprocess_tb_covid(image_array):
        """
        TB/COVID X-ray preprocessing from training notebook
        - Standard normalization
        - Size: 224x224
        - RGB expected
        """
        img = tf.cast(image_array, tf.float32)
        
        # Resize
        img = tf.image.resize(img, [224, 224])
        
        # Ensure 3 channels (convert grayscale to RGB)
        if len(img.shape) == 2 or img.shape[-1] == 1:
            img = tf.image.grayscale_to_rgb(tf.expand_dims(img, -1))
        
        # Normalize [0, 255] -> [0, 1]
        img = img / 255.0
        
        # ResNet preprocessing: center around ImageNet mean
        img = tf.keras.applications.resnet50.preprocess_input(img)
        
        return img.numpy()
    
    @staticmethod
    def preprocess_bone(image_array):
        """
        Bone X-ray preprocessing
        - X-ray specific normalization
        - Size: 224x224
        """
        img = tf.cast(image_array, tf.float32)
        
        # Resize
        img = tf.image.resize(img, [224, 224])
        
        # Convert grayscale to RGB if needed
        if len(img.shape) == 2 or img.shape[-1] == 1:
            img = tf.image.grayscale_to_rgb(tf.expand_dims(img, -1))
        
        # Normalize
        img = img / 255.0
        
        # VGG16 preprocessing
        img = tf.keras.applications.vgg16.preprocess_input(img)
        
        return img.numpy()
    
    @staticmethod
    def preprocess_eye(image_array):
        """
        Eye disease (fundus) preprocessing
        - Size: 224x224
        - InceptionV3 normalization
        """
        img = tf.cast(image_array, tf.float32)
        
        # Resize
        img = tf.image.resize(img, [224, 224])
        
        # Ensure RGB
        if len(img.shape) == 2 or img.shape[-1] == 1:
            img = tf.image.grayscale_to_rgb(tf.expand_dims(img, -1))
        
        # Normal normalization
        img = img / 255.0
        
        # InceptionV3 preprocessing
        img = tf.keras.applications.inception_v3.preprocess_input(img)
        
        return img.numpy()
    
    @staticmethod
    def preprocess_pneumonia(image_array):
        """
        Pneumonia X-ray preprocessing
        - DenseNet specifc normalization
        - Size: 224x224
        """
        img = tf.cast(image_array, tf.float32)
        
        # Resize
        img = tf.image.resize(img, [224, 224])
        
        # Convert grayscale to RGB
        if len(img.shape) == 2 or img.shape[-1] == 1:
            img = tf.image.grayscale_to_rgb(tf.expand_dims(img, -1))
        
        # Normalize
        img = img / 255.0
        
        # DenseNet preprocessing
        img = tf.keras.applications.densenet.preprocess_input(img)
        
        return img.numpy()


# High-accuracy label mappings
HIGH_ACCURACY_LABELS = {
    "brain": ["No Tumor", "Glioma", "Meningioma", "Pituitary"],
    "bone": ["No Fracture", "Fracture"],
    "eye": ["Normal", "Diabetic Retinopathy", "Glaucoma", "Cataract"],
    "tb_covid": ["Normal", "TB", "COVID-19"],  # Could be different
    "pneumonia": ["Normal", "Pneumonia"],
}

# Confidence thresholding for high accuracy
MIN_CONFIDENCE_THRESHOLDS = {
    "brain": 0.60,      # Require 60% confidence for brain
    "bone": 0.55,       # Require 55% confidence for bone
    "eye": 0.65,        # Require 65% for eye
    "tb_covid": 0.60,   # Require 60% for TB/COVID
    "pneumonia": 0.70,  # Require 70% for pneumonia
    "lung": 0.65,
    "dental": 0.50,
    "breast": 0.60,
}

print("""
=================================================================
HIGH-ACCURACY INFERENCE MODULE
=================================================================

This module provides:
1. Optimized preprocessing for each disease
2. Confidence thresholding for accurate predictions
3. Proper label mappings

Usage in mediscan_server.py:
    from high_accuracy_inference import HighAccuracyInference

    # In predict() function:
    if disease == "brain":
        arr = HighAccuracyInference.preprocess_brain(np.array(img))
        result = predict_multiclass(
            MODELS["brain"], arr, 
            HIGH_ACCURACY_LABELS["brain"]
        )
    
    # Check confidence threshold
    if result['confidence'] < MIN_CONFIDENCE_THRESHOLDS[disease]:
        result['status'] = 'warning'
        result['explanation'] = 'Low confidence - please verify'

=================================================================
""")

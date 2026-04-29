note: [https://vercel.com/sksandysachin242-6675s-projects/medical-ai-platform](https://medical-ai-platform-rosy.vercel.app/)
the app live in this link 
this is for(Hack2skill google)

And the api key problem in deployment you can verify its working in video attacted 
email: sachinkumar31a@gmail.com
pass: hello@2025


---
title: Pneumonia Detection System
emoji: 🏥
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
app_file: app.py
---

# 🏥 Pneumonia Detection System

AI-assisted chest X-ray screening system using DenseNet121 for early pneumonia detection support.

![Status](https://img.shields.io/badge/status-active-success.svg)
![Python](https://img.shields.io/badge/python-3.10%2B-blue.svg)
![TensorFlow](https://img.shields.io/badge/tensorflow-2.10%2B-orange.svg)

## 🎯 Features

- **AI-Powered Analysis**: DenseNet121 model with 97.7% validation accuracy
- **Patient Management**: Track multiple scans per patient ID
- **CSV Reporting**: Download complete diagnostic reports
- **Professional UI**: Hospital-grade web interface
- **Real-time Predictions**: ~2-3 second analysis time

## 📊 Model Performance

- **Validation Accuracy**: 97.70%
- **Test Accuracy**: 84.13%
- **Architecture**: DenseNet121 (pre-trained on ImageNet)
- **Training**: 30 epochs with early stopping
- **Dataset**: 5,216 chest X-ray images

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- GPU (optional, recommended for faster inference)
- 4GB+ RAM

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/pneumonia-detection.git
cd pneumonia-detection
```

2. Create virtual environment:
```bash
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Download the dataset (not included in repo):
   - Place chest X-ray images in `chest_xray/` folder
   - Structure: `chest_xray/train/`, `chest_xray/test/`, `chest_xray/val/`

### Usage

#### Run Web Application
```bash
python webapp_final.py
```
Open browser at: `http://localhost:5000`

#### Train Model
```bash
python train_model.py
```

#### Evaluate Model
```bash
python evaluate_model.py
```

#### CLI Prediction
```bash
python predict.py path/to/xray.jpg
```

## 📁 Project Structure

```
pneumonia-detection/
├── webapp_final.py          # Flask web application
├── train_model.py           # Model training script
├── evaluate_model.py        # Model evaluation script
├── predict.py               # CLI prediction tool
├── model2result.keras       # Trained model (81.83 MB)
├── templates/
│   └── index.html          # Frontend UI
├── requirements.txt         # Python dependencies
└── training_log_gpu.txt    # Training history
```

## 🔧 Technology Stack

- **Backend**: Flask (Python)
- **ML Framework**: TensorFlow/Keras
- **Model**: DenseNet121
- **Frontend**: HTML5, CSS3, JavaScript
- **Image Processing**: PIL/Pillow

## 📈 Training Details

- **Optimizer**: Adam (learning rate: 0.001)
- **Loss**: Binary Cross-Entropy
- **Batch Size**: 16
- **Data Augmentation**: Random flip, rotation, zoom, translation
- **Hardware**: NVIDIA RTX 3050 (6GB VRAM)
- **Training Time**: ~6 hours (30 epochs)

## ⚠️ Disclaimer

This tool is for **educational and research purposes only**. It should be used as a triage support system alongside professional radiologist review. Do not use for clinical decision-making without proper medical supervision.

## 👥 Team

- **Sachin Kumar A** - Developer
- **R Srinivas** - R&D and Documentation
- **R Ranjitha** - R&D

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or collaborations, please open an issue on GitHub.

---

**Note**: The trained model file (`model2result.keras`) is included in this repository. The dataset is not included due to size constraints.

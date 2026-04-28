"""
Simple MediScan Flask Server
Serves the hackathon-ui frontend
"""

from flask import Flask, send_from_directory
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR / "hackathon - ui" / "hackathon - ui-updated" / "frontend"

app = Flask(__name__,
            static_folder=str(FRONTEND_DIR),
            static_url_path='')

@app.route('/')
def index():
    """Serve main dashboard"""
    return send_from_directory(str(FRONTEND_DIR), 'dashboard.html')

@app.route('/dashboard.html')
def dashboard():
    """Serve dashboard"""
    return send_from_directory(str(FRONTEND_DIR), 'dashboard.html')

@app.route('/index.html')
def home():
    """Serve index page"""
    return send_from_directory(str(FRONTEND_DIR), 'index.html')

@app.route('/css/<path:filename>')
def serve_css(filename):
    """Serve CSS files"""
    return send_from_directory(str(FRONTEND_DIR / 'css'), filename)

@app.route('/js/<path:filename>')
def serve_js(filename):
    """Serve JavaScript files"""
    return send_from_directory(str(FRONTEND_DIR / 'js'), filename)

@app.route('/assets/<path:filename>')
def serve_assets(filename):
    """Serve asset files"""
    return send_from_directory(str(FRONTEND_DIR / 'assets'), filename)

if __name__ == '__main__':
    print("\n" + "="*60)
    print("MediScan AI - Simple Frontend Server")
    print("="*60)
    print("Frontend: hackathon-ui")
    print("URL: http://localhost:5000")
    print("="*60 + "\n")

    app.run(host='0.0.0.0', port=5000, debug=False)
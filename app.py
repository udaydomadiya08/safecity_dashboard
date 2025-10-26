from flask import Flask, render_template, jsonify
import csv, os, json
app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')

def read_incidents():
    path = os.path.join(DATA_DIR, 'incidents.csv')
    incidents = []
    with open(path, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for r in reader:
            r['lat'] = float(r['lat'])
            r['lon'] = float(r['lon'])
            r['severity'] = int(r['severity'])
            incidents.append(r)
    return incidents

def read_complaints():
    path = os.path.join(DATA_DIR, 'complaints.json')
    if not os.path.exists(path):
        return []
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/incidents')
def api_incidents():
    return jsonify(read_incidents())

@app.route('/api/complaints')
def api_complaints():
    return jsonify(read_complaints())

if __name__ == '__main__':
    import socket
    s = socket.socket()
    s.bind(('', 0))  # Bind to any available port
    port = s.getsockname()[1]
    s.close()
    print(f"🚀 Running on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)


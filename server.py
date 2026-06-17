#!/usr/bin/env python3
import http.server, json, os, sys, urllib.parse
from datetime import datetime

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(DIR, "numbers.json")

def load_numbers():
    if not os.path.exists(DATA_FILE): return []
    with open(DATA_FILE) as f: return json.load(f)

def save_numbers(nums):
    with open(DATA_FILE, "w") as f: json.dump(nums, f, indent=2)

def add_number(phone, ip=""):
    nums = load_numbers()
    entry = {"phone": phone, "ip": ip,
             "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
    nums.append(entry)
    save_numbers(nums)
    return entry

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        path = urllib.parse.urlparse(self.path).path.rstrip("/") or "/"
        if path in ("/dashboard", "/dash"):
            self._serve("dashboard.html")
        elif path == "/api/numbers":
            self._json(200, load_numbers())
        elif path == "/api/numbers/export":
            data = json.dumps(load_numbers(), indent=2)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Disposition",
                             "attachment; filename=numbers.json")
            self.end_headers()
            self.wfile.write(data.encode())
        elif path == "/api/stats":
            self._json(200, {"total": len(load_numbers())})
        else:
            super().do_GET()

    def do_POST(self):
        path = urllib.parse.urlparse(self.path).path
        if path == "/api/submit":
            body = self.rfile.read(int(self.headers.get("Content-Length", 0)))
            try:
                data = json.loads(body)
                phone = data.get("phone", "").strip()
                if not phone:
                    return self._json(400, {"error": "Phone required"})
                entry = add_number(phone, self.client_address[0])
                self._json(200, {"success": True, "entry": entry})
            except Exception as e:
                self._json(500, {"error": str(e)})
        elif path == "/api/numbers/clear":
            save_numbers([])
            self._json(200, {"success": True})
        else:
            self.send_error(404)

    def _serve(self, filename):
        p = os.path.join(DIR, filename)
        if not os.path.exists(p): return self.send_error(404)
        with open(p, "rb") as f: data = f.read()
        self.send_response(200)
        if filename.endswith(".html"):
            self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()
        self.wfile.write(data)

    def _json(self, status, obj):
        resp = json.dumps(obj).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(resp)

    def log_message(self, fmt, *args): pass

if __name__ == "__main__":
    os.chdir(DIR)
    if not os.path.exists(DATA_FILE): save_numbers([])
    s = http.server.HTTPServer(("0.0.0.0", PORT), Handler)
    print(f"Server on http://0.0.0.0:{PORT}")
    print(f"  Form:      http://localhost:{PORT}/index.html")
    print(f"  Dashboard: http://localhost:{PORT}/dashboard")
    try:
        s.serve_forever()
    except KeyboardInterrupt:
        s.shutdown()

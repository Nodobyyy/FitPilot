import http.server
import socketserver
import json
import os

PORT = 8000
DATA_FILE = "../fitpilot_data.enc"

class FitPilotHandler(http.server.SimpleHTTPRequestHandler):

    def do_GET(self):
        if self.path == '/api/load':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            if os.path.exists(DATA_FILE):
                with open(DATA_FILE, 'r', encoding='utf-8') as f:
                    data = f.read()
                self.wfile.write(json.dumps({'status': 'success', 'data': data}).encode('utf-8'))
            else:
                self.wfile.write(json.dumps({'status': 'empty', 'data': None}).encode('utf-8'))
        else:
            # Serve static files
            super().do_GET()

    def do_POST(self):
        if self.path == '/api/save':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                payload = json.loads(post_data.decode('utf-8'))
                encrypted_data = payload.get('data')
                
                if encrypted_data:
                    with open(DATA_FILE, 'w', encoding='utf-8') as f:
                        f.write(encrypted_data)
                        
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'status': 'success'}).encode('utf-8'))
                else:
                    self.send_error(400, "No data provided")
            except Exception as e:
                self.send_error(500, str(e))
        else:
            self.send_error(404, "Not Found")

if __name__ == "__main__":
    Handler = FitPilotHandler
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Server started at http://localhost:{PORT}")
        print("Press Ctrl+C to stop.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")

"""Serves the Coordin8 static site. No backend logic, just files."""

import http.server
import os
import socketserver

PORT = int(os.environ.get("PORT", 8000))

with socketserver.TCPServer(("0.0.0.0", PORT), http.server.SimpleHTTPRequestHandler) as httpd:
    print(f"Coordin8 running on port {PORT}")
    httpd.serve_forever()

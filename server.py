"""Serves the Scanify landing page. Just the opening page for now, no backend logic yet."""

import http.server
import socketserver

PORT = 8000

with socketserver.TCPServer(("", PORT), http.server.SimpleHTTPRequestHandler) as httpd:
    print(f"Scanify running at http://localhost:{PORT}")
    httpd.serve_forever()

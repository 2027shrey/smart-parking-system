#!/usr/bin/env python3
"""
Simple local web server for ParkIQ Smart Parking System.
Usage:
    python3 server.py [port]
"""

import http.server
import socketserver
import sys
import os

DEFAULT_PORT = 8080

def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PORT
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    Handler = http.server.SimpleHTTPRequestHandler
    Handler.extensions_map.update({
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.html': 'text/html',
        '.json': 'application/json'
    })

    # Allow socket reuse so restarting doesn't hit "Address already in use"
    socketserver.TCPServer.allow_reuse_address = True

    try:
        with socketserver.TCPServer(("", port), Handler) as httpd:
            print("=" * 60)
            print("🚗 ParkIQ Smart Parking System is running!")
            print(f"👉 Local Access URL: http://localhost:{port}")
            print(f"📁 Serving Directory: {os.getcwd()}")
            print("Press Ctrl+C to stop the server.")
            print("=" * 60)
            httpd.serve_forever()
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"⚠️ Port {port} is busy. Trying {port + 1}...")
            port += 1
            with socketserver.TCPServer(("", port), Handler) as httpd:
                print(f"👉 Running on: http://localhost:{port}")
                httpd.serve_forever()
        else:
            raise

if __name__ == "__main__":
    main()

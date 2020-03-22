import http.server
import socketserver

PORT = 8080

class RequestHandler(http.server.BaseHTTPRequestHandler):

    def _set_headers(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length).decode('utf-8')
        self._set_headers()
        response = 'Make an actual response instead of this'.encode('utf-8')
        self.wfile.write(response)


def main():
    PORT = 8080
    server_address = ('localhost', PORT)
    server = http.server.HTTPServer(server_address, RequestHandler)
    server.serve_forever()

if __name__ == '__main__':
    main()
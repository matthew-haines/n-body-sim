import http.server
import json
import os
import numpy as np

def process_and_write(data):
    with open('input.txt', 'w') as f:
        f.write(str(data['timesteps']) + ' ' + str(data['deltaT']))
        tostr = lambda arr: ''.join([str(x)+' ' for x in arr.values()])
        for obj in data['spaceObjects']:
            f.write('\n')
            f.write(tostr(obj['initial_position']) + tostr(obj['initial_velocity']) + str(obj['mass']))

def read_output():
    with open('output.txt', 'r') as f:
        lines = [line.rstrip() for line in f]

    data = np.array([[float(num) for num in line.split()] for line in lines])
    out_list = []
    for i in range(int(data.shape[1] / 3)):
        out_list.append(data[:, 3*i:3*i+3].tolist())

    return out_list

class RequestHandler(http.server.BaseHTTPRequestHandler):

    def _set_headers(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.send_header('Access-Control-Allow-Origin', '*')                
        self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200, 'ok')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        content_length=int(self.headers['Content-Length'])
        post_data=self.rfile.read(content_length).decode('utf-8')
        data=json.loads(post_data)
        names = [obj['name'] for obj in data['spaceObjects']]
        process_and_write(data)
        os.system('./sim input.txt output.txt')

        position_list = read_output()
        response = json.dumps(dict(zip(names, position_list))).encode('utf-8')

        self._set_headers()
        self.wfile.write(response)


def main():
    PORT=8080
    server_address=('localhost', PORT)
    server=http.server.HTTPServer(server_address, RequestHandler)
    server.serve_forever()

if __name__ == '__main__':
    main()

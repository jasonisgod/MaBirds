import threading

from simple_websocket_server import WebSocketServer, WebSocket

class SimpleEcho(WebSocket):
    def handle(self):
    # echo message back to client
        print(self.data)
        self.send_message(self.data)

    def connected(self):
        print(self.address, 'connected')

    def handle_close(self):
        print(self.address, 'closed')


def run():
    server = WebSocketServer('localhost', 8765, SimpleEcho)
    server.serve_forever()

from threading import Thread

ws_run = Thread(target=run)
ws_run.start()
print("ok")


def _thread(game):
    print(f'ws _thread()')
    pass

def start(game):
    threading.Thread(target=_thread, args=(game,)).start()

def stop():
    pass

from common import *

if len(sys.argv) != 2:
    print('python3 server.py <PORT>')
    exit()

HOST = '0.0.0.0'
PORT = int(sys.argv[1])
app = Flask(__name__, template_folder='.')
CORS(app)

game = Game()
game.start_random()

@app.route("/api/start")
def api_start():
    game.start()
    return d2j({'res':'T'})

@app.route("/api/start/random")
def api_start_random():
    game.start_random()
    return d2j({'res':'T'})

@app.route("/api/data/<num>")
def api_data(num):
    data = game.get_data(int(num))
    return d2j({'res':'T', 'data':data})

@app.route("/api/play/<num>/<tile>")
def api_play(num, tile):
    ok = game.play_tile(num, tile)
    return d2j({'res':('T' if ok else 'F')})

@app.route("/api/play/bot")
def api_play_bot():
    ok = game.play_tile_bot()
    return d2j({'res':('T' if ok else 'F')})

print(f'HOST={HOST} PORT={PORT}')
app.run(host=HOST, port=PORT)

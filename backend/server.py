from common import *
from mythread import *

if len(sys.argv) != 2:
    print('python3 server.py <PORT>')
    exit()

HOST = '0.0.0.0'
PORT = int(sys.argv[1])
app = Flask(__name__, template_folder='.')
CORS(app)
logging.getLogger('werkzeug').setLevel(logging.ERROR)

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

@app.route("/api/data/<int:num>")
def api_data(num):
    data = game.get_data(num)
    return d2j({'res':'T', 'data':data})

@app.route("/api/action/<int:num>/<atype>/<group>")
def api_action(num, atype, group):
    ok = game.do_action(num, atype, to_int(s2l(group)))
    return d2j({'res':('T' if ok else 'F')})

@app.route("/api/play/<int:num>/<int:tile>")
def api_play(num, tile):
    ok = game.do_play(num, tile)
    return d2j({'res':('T' if ok else 'F')})

@app.route("/api/bot")
@app.route("/api/play/bot")
def api_bot():
    ok = game.do_bot()
    return d2j({'res':('T' if ok else 'F')})

start_thread(game)
print(f'HOST={HOST} PORT={PORT}')
app.run(host=HOST, port=PORT)
stop_thread()


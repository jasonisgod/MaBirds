from common import *
import thread_bots
import simple_websocket

if len(sys.argv) != 2:
    print('python3 server.py <PORT>')
    exit()

HOST = '0.0.0.0'
PORT = int(sys.argv[1])
app = Flask(__name__, template_folder='.')
CORS(app)
logging.getLogger('werkzeug').setLevel(logging.ERROR)

game = Game()
# game.start_random()
game.set_mask(False)

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
def api_bot():
    ok = game.do_bot()
    return d2j({'res':('T' if ok else 'F')})

@app.route("/api/bots/<bots>")
def api_bots(bots):
    ok = game.set_bots(bots)
    return d2j({'res':('T' if ok else 'F')})

@app.route('/ws', websocket=True)
def ws():
    print('/ws')
    ws = simple_websocket.Server(request.environ)
    num = None
    # ws.send('hello from server')
    # data = game.get_data(0)
    # ws.send(d2j({'res':'T', 'data':data}))
    try:
        while True:
            data = ws.receive()
            obj = json.loads(str(data))
            print(obj)
            typ_ = obj['type']
            if typ_ == 'connect':
                num = game.do_connect(obj['token'])
                res = {'type': 'connect', 'num': num}
                ws.send(d2j(res))
    except simple_websocket.ConnectionError:
        print('ConnectionError')
        game.do_disconnect(num)
    except simple_websocket.ConnectionClosed:
        print('ConnectionClosed')
        game.do_disconnect(num)
    return ''

thread_bots.start(game)
# thread_ws.start(game)
print(f'HOST={HOST} PORT={PORT}')
app.run(host=HOST, port=PORT)
thread_bots.stop()
# thread_ws.stop()


from common import *

THREAD = True
TIME_SLEEP = 2.0 # 2sec

# def _sleep(time):
#     for i in range(time):
#         if not THREAD: exit()
#         time.sleep(1)

def _thread(game):
    print(f'_thread()')
    while THREAD:
        time.sleep(0.1)
        if game.state == 'PLAY' and game.cnum != 0:
            time.sleep(TIME_SLEEP)
            game.do_bot()
        if game.state == 'PONG' and game.anum != 0:
            time.sleep(TIME_SLEEP)
            game.do_bot()

def start_thread(game):
    threading.Thread(target=_thread, args=(game,)).start()

def stop_thread():
    global THREAD
    THREAD = False

game = Game()
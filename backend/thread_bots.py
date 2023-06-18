from common import *

THREAD_BOTS = True
TIME_SLEEP = 2 # sec

def _thread(game):
    print(f'bots _thread()')
    while THREAD_BOTS:
        time.sleep(TIME_SLEEP)
        bots = game.get_bots()
        if len(bots) == 4:
            game.reset()
        if game.state == 'PLAY' and game.cnum in bots:
            game.do_bot(game.cnum)
        if game.state == 'ACTION':
            for num in bots:
                if game.prs[num].atype is None:
                    game.do_bot(num)

def start(game):
    threading.Thread(target=_thread, args=(game,)).start()

def stop():
    global THREAD_BOTS
    THREAD_BOTS = False

from common import *

THREAD = True
TIME_SLEEP = 1 # 2sec

def _thread(game):
    print(f'_thread()')
    nums = [1,2,3]
    while THREAD:
        time.sleep(0.1)
        if game.state == 'PLAY' and game.cnum in nums:
            time.sleep(TIME_SLEEP)
            game.do_bot(game.cnum)
        if game.state == 'ACTION':
            time.sleep(TIME_SLEEP)
            for num in nums:
                if game.prs[num].atype is None:
                    game.do_bot(num)

def start_thread(game):
    threading.Thread(target=_thread, args=(game,)).start()

def stop_thread():
    global THREAD
    THREAD = False

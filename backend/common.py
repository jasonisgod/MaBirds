import json, sys, random, logging, threading, time
from flask import Flask, request, render_template
from flask_cors import CORS

THREAD = True
TIME_SLEEP = 3 # 2sec

# utils
def d2j(d): return json.dumps(d)
def s2l(s): return [] if s == '' else s.split(',')
def to_int(l): return list(map(int,l))

class Player:
    def __init__(self):
        self.hide = []
        self.show = []
        self.come = []

    def pongs(self, tile):
        if self.hide.count(tile) >= 2:
            return [[tile] * 2]
        return []

    def gongs(self, tile):
        if self.hide.count(tile) == 3:
            return [[tile] * 3]
        return []
    
    def songs(self, tile):
        head, tail = tile - tile % 10, tile % 10
        if head not in [10,20,30]: return []
        table = {
            1: [[2,3]],
            2: [[1,3],[3,4]],
            3: [[1,2],[2,4],[4,5]],
            4: [[2,3],[3,5],[5,6]],
            5: [[3,4],[4,6],[6,7]],
            6: [[4,5],[5,7],[7,8]],
            7: [[5,6],[6,8],[8,9]],
            8: [[6,7],[7,9]],
            9: [[7,8]],
        }
        groups = [g for g in table[tail] if all([(t + head) in self.hide for t in g])]
        groups = [[j + head for j in i] for i in groups]
        return groups

class Game:
    def __init__(self):
        self.reset()
        
    def reset(self):
        self.prs = [Player() for i in range(4)]
        self.pool = []
        self.bag = []
        self.ctile = 0
        self.cnum = 0
        self.anum = 0
        self.state = 'STOP'

    def random_bag(self):
        self.bag = []
        self.bag += [11,12,13,14,15,16,17,18,19] * 4
        self.bag += [21,22,23,24,25,26,27,28,29] * 4
        self.bag += [31,32,33,34,35,36,37,38,39] * 4
        self.bag += [41,42,43,44,45,46,47] * 4
        random.shuffle(self.bag)

    def start(self):
        print('game.start()')
        self.reset()
        self.random_bag()
        for i in range(4):
            for j in range([14,13,13,13][i]):
                self.prs[i].hide += [self.bag.pop(0)]
            self.prs[i].hide.sort()
        self.state = 'PLAY'

    def start_random(self):
        print('game.start_random()')
        self.reset()
        self.random_bag()
        groups = []
        groups += [[j+i,j+i+1,j+i+2] for i in [1,2,3,4,5,6,7] for j in [10,20,30]]
        # groups += [[j+i,j+i,j+i] for i in [1,2,3,4,5,6,7,8,9] for j in [10,20,30]]
        groups += [[j+i,j+i,j+i] for i in [1,2,3,4,5,6,7] for j in [40]]
        random.shuffle(groups)
        for i in [0,1,2,3]:
            p = self.prs[i]
            p.show = [groups.pop(0) for j in range(random.randint(0,2))]
            for group in p.show:
                for tile in group:
                    self.bag.remove(tile)
        for i in [0,1,2,3]:
            p = self.prs[i]
            p.hide = [self.bag.pop(0) for j in range(13 - 3 * len(p.show))]
            p.hide.sort()
            p.come = []
        self.pool = [self.bag.pop(0) for i in range(random.randint(30,50))]
        self.prs[0].come = [self.bag.pop(0)]
        self.state = 'PLAY'

    def pr_to_dict(self, num, mask):
        p = self.prs[num]
        return {
            'hide': [99] * len(p.hide) if mask else p.hide,
            'show': p.show,
            'come': [99] * len(p.come) if mask else p.come
        }

    def get_data(self, num):
        data_bottom = self.pr_to_dict(num, False)
        data_right  = self.pr_to_dict((num + 1) % 4, False)
        data_top    = self.pr_to_dict((num + 2) % 4, False)
        data_left   = self.pr_to_dict((num + 3) % 4, False)
        return {
            'state': self.state,
            'top': data_top,
            'bottom': data_bottom,
            'left': data_left,
            'right': data_right,
            'pool': self.pool,
            'action': {
                'play': (self.state == 'PLAY' and num == self.cnum),
                'pong': (self.state == 'PONG' and num == self.anum),
                'song': False,
                'gong': False,
                'wooo': False,
                'cancel': (self.state in ['PONG'] and num == self.anum),
            }
        }
    
    def do_action(self, num, atype, group):
        print(f'game.do_action() {num} {atype} {group}')
        if num == self.anum:
            pr = self.prs[num]
            if self.state == 'PONG':
                if atype == 'CANCEL':
                    # print(f'do_action() cancel ed')
                    return self.next_mooo()
                if atype == 'PONG':
                    # print(f'do_action() {group} {pr.pongs(self.atile)}')
                    if group in pr.pongs(self.atile):
                        self.pool.pop()
                        pr.hide.remove(self.atile)
                        pr.hide.remove(self.atile)
                        pr.show += [[self.atile] * 3]
                        self.cnum = self.anum
                        self.anum = -1
                        self.atile = -1
                        self.state = 'PLAY'
                        # print(f'do_action() pong ed')
                        return True
        return False

    def do_play(self, num, tile):
        print(f'game.do_play() {num} {tile}')
        if int(num) != self.cnum:
            return False
        p = self.prs[self.cnum]
        if int(tile) not in (p.hide + p.come):
            return False
        p.hide += p.come
        p.hide.remove(int(tile))
        p.hide.sort()
        p.come = []
        self.pool += [tile]
        return self.wait_pong(tile)

    def wait_wooo(self):
        pass

    def wait_pong(self, tile):
        pp = [pr.pongs(tile) for pr in self.prs]
        # print(f'wait_pong {tile} {[pr.hide for pr in self.prs]} {pp}')
        if all([len(g) == 0 for g in pp]):
            # print('wait_pong() nobody can pong')
            return self.next_mooo()
        num = [i for i,e in enumerate(pp) if len(e) > 0][0]
        if num == self.cnum:
            # print('wait_pong() me can pong')
            return self.next_mooo()
        self.anum = num
        self.atile = tile
        self.state = 'PONG'
        # print('wait_pong() somebody can pong')
        return True

    def wait_song(self):
        pass

    def next_mooo(self):
        # print('next_mooo()')
        self.cnum = (self.cnum + 1) % 4
        pr = self.prs[self.cnum]
        pr.come = [self.bag.pop(0)]
        self.state = 'PLAY'
        # print('next_mooo() return')
        return True
        
    def do_bot(self):
        # print('do_bot()')
        if self.state == 'PLAY':
            num = self.cnum
            pr = self.prs[num]
            tile = random.choice(pr.hide + pr.come)
            self.do_play(num, tile)
            return True
        if self.state == 'PONG':
            self.do_action(self.anum, 'PONG', [self.atile]*2)
            return True
        return False


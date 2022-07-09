import json, sys, random
from flask import Flask, request, render_template
from flask_cors import CORS

class Player:
    def __init__(self):
        self.hide = []
        self.show = []
        self.come = []

class Game:
    def __init__(self):
        self.reset()
        
    def reset(self):
        self.players = [Player() for i in range(4)]
        self.pool = []
        self.bag = []
        self.cnum = 0

    def random_bag(self):
        self.bag = []
        self.bag += [11,12,13,14,15,16,17,18,19] * 4
        self.bag += [21,22,23,24,25,26,27,28,29] * 4
        self.bag += [31,32,33,34,35,36,37,38,39] * 4
        self.bag += [41,42,43,44,45,46,47] * 4
        random.shuffle(self.bag)

    def start(self):
        self.reset()
        self.random_bag()
        for i in range(4):
            for j in range([14,13,13,13][i]):
                self.players[i].hide += [self.bag.pop(0)]
            self.players[i].hide.sort()
        self.cnum = 0

    def start_random(self):
        self.reset()
        self.random_bag()
        groups = []
        groups += [[j+i,j+i+1,j+i+2] for i in [1,2,3,4,5,6,7] for j in [10,20,30]]
        # groups += [[j+i,j+i,j+i] for i in [1,2,3,4,5,6,7,8,9] for j in [10,20,30]]
        groups += [[j+i,j+i,j+i] for i in [1,2,3,4,5,6,7] for j in [40]]
        random.shuffle(groups)
        for i in [0,1,2,3]:
            p = self.players[i]
            p.show = [groups.pop(0) for j in range(random.randint(0,2))]
            for group in p.show:
                for tile in group:
                    self.bag.remove(tile)
        for i in [0,1,2,3]:
            p = self.players[i]
            p.hide = [self.bag.pop(0) for j in range(13 - 3 * len(p.show))]
            p.hide.sort()
            p.come = []
        self.pool = [self.bag.pop(0) for i in range(random.randint(30,50))]
        self.cnum = 0
        self.players[0].come = [self.bag.pop(0)]

    def player_to_dict(self, num, mask):
        p = self.players[num]
        return {
            'hide': [99] * len(p.hide) if mask else p.hide,
            'show': p.show,
            'come': [99] * len(p.come) if mask else p.come
        }

    def get_data(self, num):
        data_bottom = self.player_to_dict(num, False)
        data_right  = self.player_to_dict((num + 1) % 4, True)
        data_top    = self.player_to_dict((num + 2) % 4, True)
        data_left   = self.player_to_dict((num + 3) % 4, True)
        return {
            'top': data_top,
            'bottom': data_bottom,
            'left': data_left,
            'right': data_right,
            'pool': self.pool,
            'action': {
                'play': (num == self.cnum),
                'pong': False,
                'song': False,
                'gong': False,
                'wooo': False,
                'cancel': False,
            }
        }
    
    def play_tile(self, num, tile):
        if int(num) != self.cnum:
            return False
        p = self.players[self.cnum]
        if int(tile) not in (p.hide + p.come):
            return False
        p.hide += p.come
        p.hide.remove(int(tile))
        p.hide.sort()
        p.come = []
        self.pool += [tile]
        self.cnum = (self.cnum + 1) % 4
        p = self.players[self.cnum]
        p.come = [self.bag.pop(0)]
        return True
        
    def play_tile_bot(self):
        num = self.cnum
        p = self.players[num]
        tile = random.choice(p.hide + p.come)
        self.play_tile(num, tile)

# dict -> str of json
def d2j(d): return json.dumps(d)


import json, sys, random, logging, threading, time
from flask import Flask, request, render_template
from flask_cors import CORS

TIME_DELAY = 1  # 1sec

# utils
def d2j(d): return json.dumps(d)
def s2l(s): return [] if s == '' else s.split(',')
def to_int(l): return list(map(int,l))

class Player:
    def __init__(self):
        self.hide = []
        self.show = []
        self.come = []
        self.atype = None
        self.agroup = None

    def to_dict(self, mask):
        return {
            'show': self.show,
            'hide': [99] * len(self.hide) if mask else self.hide,
            'come': [99] * len(self.come) if mask else self.come,
        }

    def wooos(self, tile):
        return []

    def gongs(self, tile):
        if self.hide.count(tile) == 3:
            return [[tile] * 4]
        return []

    def pongs(self, tile):
        if self.hide.count(tile) >= 2:
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
        groups = [[j + head for j in i] + [tile] for i in groups]
        return sorted(groups)
    
    def action(self, atype, atile, diff):
        if atype == 'WOOO': return self.wooos(atile)
        if atype == 'GONG': return self.gongs(atile)
        if atype == 'PONG': return self.pongs(atile)
        if atype == 'SONG': 
            if diff != 1: return []
            return self.songs(atile)
        return []

    def actions(self, atile, diff):
        atype_list = ['WOOO','GONG','PONG','SONG']
        return {atype: self.action(atype, atile, diff) for atype in atype_list}

class Game:
    def __init__(self):
        self.reset()
        
    def reset(self):
        self.prs = [Player() for i in range(4)]
        self.pool = []
        self.bag = []
        self.atype = None
        self.ctile = 0
        self.cnum = 0
        self.state = 'STOP'
        self.mask = True

    def set_mask(self, mask):
        self.mask = mask

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

    def num_diff(self, num1, num2):
        diff, tmp = 0, num1
        while tmp != num2:
            diff += 1
            tmp = (tmp + 1) % 4
        return diff

    def get_data(self, num):
        pr = self.prs[num]
        pos_list = ['bottom','left','top','right']
        diff = self.num_diff(self.cnum, num)
        tmp = pr.actions(self.ctile, diff)
        total = tmp['WOOO'] + tmp['GONG'] + tmp['PONG'] + tmp['SONG']
        # print(f'get_data() {tmp} {diff}')
        return {
            'state': self.state,
            'pool': self.pool,
            'atype': self.atype,
            'cpos': pos_list[diff],
            'ctile': self.ctile,
            'bottom': self.prs[num].to_dict(False),
            'right': self.prs[(num + 1) % 4].to_dict(True),
            'top': self.prs[(num + 2) % 4].to_dict(True),
            'left': self.prs[(num + 3) % 4].to_dict(True),
            'action': {
                'play': (self.state == 'PLAY' and num == self.cnum),
                'wooo': (self.state == 'ACTION' and len(tmp['WOOO']) > 0 and diff != 0),
                'gong': (self.state == 'ACTION' and len(tmp['GONG']) > 0 and diff != 0),
                'pong': (self.state == 'ACTION' and len(tmp['PONG']) > 0 and diff != 0),
                'song': (self.state == 'ACTION' and len(tmp['SONG']) > 0 and diff == 1),
                'cancel': (self.state == 'ACTION' and len(total) > 0 and diff != 0),
            }
        }
    
    def do_action(self, num, atype, agroup):
        print(f'do_action() {num} {atype} {agroup}')
        if self.state != 'ACTION':
            return False
        pr = self.prs[num]
        if atype == 'CANCEL':
            pr.atype = atype
            return self.check_action()
        if atype in ['WOOO','GONG','PONG','SONG']:
            diff = self.num_diff(self.cnum, num)
            if agroup not in pr.action(atype, self.ctile, diff):
                return False
            pr.atype = atype
            pr.agroup = agroup
            return self.check_action()
        return False

    def do_action_end(self, num, atype, agroup):
        self.cnum = num
        self.atype = atype
        self.state = 'DELAY_ACTION'
        threading.Thread(target=self._do_action_end, args=(num,atype,agroup)).start()
    
    def _do_action_end(self, num, atype, agroup):
        print(f'do_action_end() {num} {atype} {agroup}')
        time.sleep(TIME_DELAY)
        print(f'do_action_end() after delay')
        self.atype = None
        pr = self.prs[num]
        if atype == 'WOOO':
            self.state = 'END'
            return True
        if atype in ['GONG','PONG','SONG']:
            pr.hide.append(self.ctile)
            for tile in agroup:
                pr.hide.remove(tile)
            pr.hide.sort()
            pr.show.append(sorted(agroup))
            if atype in ['PONG','SONG']:
                self.state = 'PLAY'
                return True
            return self.do_mooo(num)
        return False
    
    def check_action(self):
        nums = [(self.cnum + 1 + i) % 4 for i in range(3)]
        for atype in ['WOOO','GONG','PONG','SONG']:
            for num in nums:
                pr = self.prs[num]
                diff = self.num_diff(self.cnum, num)
                groups = pr.action(atype, self.ctile, diff)
                if len(groups) == 0: continue
                if pr.atype is None: return True
                if pr.atype != atype: continue
                if pr.agroup not in groups: continue
                return self.do_action_end(num, pr.atype, pr.agroup)
        self.pool += [self.ctile]
        return self.do_mooo((self.cnum + 1) % 4)

    def do_play(self, num, tile):
        print(f'do_play() {num} {tile}')
        if num != self.cnum:
            return False
        pr = self.prs[self.cnum]
        if tile not in (pr.hide + pr.come):
            return False
        self.ctile = tile
        pr.hide += pr.come
        pr.hide.remove(tile)
        pr.hide.sort()
        pr.come = []
        self.state = 'DELAY_PLAY'
        threading.Thread(target=self._do_play).start()

    def _do_play(self):
        print(f'_do_play()')
        time.sleep(TIME_DELAY)
        print(f'_do_play() after delay')
        nums = [(self.cnum + 1 + i) % 4 for i in range(3)]
        tmp = [self.prs[num].actions(self.ctile, self.num_diff(self.cnum, num)) for num in nums]
        tmp = [[len(x[key]) == 0 for key in x] for x in tmp]
        if all([all(x) for x in tmp]):
            print('_do_play() nobody can action')
            self.pool += [self.ctile]
            return self.do_mooo((self.cnum + 1) % 4)
        print(f'_do_play() {tmp}')
        for pr in self.prs: 
            pr.atype, pr.agroup = None, None
        self.state = 'ACTION'
        print('_do_play() somebody can action')
        return True

    def do_mooo(self, num):
        print(f'do_mooo() {num}')
        if len(self.bag) == 0:
            self.state = 'DRAW'
            return True
        self.cnum = num
        pr = self.prs[self.cnum]
        pr.come = [self.bag.pop(0)]
        self.state = 'PLAY'
        return True
        
    def do_bot(self, num):
        # print(f'do_bot() {num}')
        if self.state == 'PLAY':
            if num != self.cnum: return False
            pr = self.prs[num]
            tile = random.choice(pr.hide + pr.come)
            return self.do_play(num, tile)
        if self.state == 'ACTION':
            if num == self.cnum: return False
            pr = self.prs[num]
            if pr.atype is not None: return False
            for atype in ['WOOO','GONG','PONG','SONG']:
                diff = self.num_diff(self.cnum, num)
                groups = pr.action(atype, self.ctile, diff)
                if len(groups) == 0: continue
                return self.do_action(num, atype, groups[0])
            return self.do_action(num, 'CANCEL', None)
        return False


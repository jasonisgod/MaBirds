from common import *

pr = Player()
pr.show = [[11,12,13]]
pr.hide = [11,11,12,12,13,13,14,14,14,15]
ans = pr.wooos(13)
for a in ans: print(a)
# pr = Player()
# pr.hide = [11,12,13,13,15,18,18,18,19,23,25,43,45]
# tile = 34
# print('gong', pr.if_gong(tile))
# print('pong', pr.if_pong(tile))
# print('song', pr.if_song(tile))
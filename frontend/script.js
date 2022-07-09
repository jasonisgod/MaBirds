
var data = {
    hide: {
        top: [99,99,99,99,99,99,99,99,99,99],
        bottom:  [11,12,27,27,39,41,46],
        left:  [99,99,99,99,99,99,99,99,99,99],
        right: [99,99,99,99,99,99,99],
    },
    show: {
        top: [[12,13,14]],
        bottom:  [[45,45,45],[37,38,39]],
        left:  [[24,25,26]],
        right: [[42,42,42],[16,17,18]],
    },
    pool: [
        //43,12,47,47,26,43,29,31,28,11,19,24,35,25,13,26,44,
        43,12,47,47,26,31,28,11,19,24,35,25,13,26,44,43,29,31,28,11,19,24,35,25,13,26,
        44,24,35,25,13,26,44,43,29,31,28,11,19,24,35,25,13,26,44,
    ],
    action: {
        play: false,
        pong: true,
        song: true,
        gong: false,
        wooo: false
    }
}

function getName(id) {
    var digits = ['','一','二','三','四','五','六','七','八','九']
    var chars = ['','東風','南風','西風','北風','紅中','發財','白板']
    // var chars = ['','東','南','西','北','中','發','白']
    var num = id % 10
    if (11 <= id && id <= 19) return (digits[num] + '筒')
    if (21 <= id && id <= 29) return (digits[num] + '索')
    if (31 <= id && id <= 39) return (digits[num] + '萬')
    if (41 <= id && id <= 47) return (chars[num])
    return '　　' // '　'
}

function appendTiles(div, hv, rev, se, id) {
    var name = getName(id)
    var ss = [...name]
    var html_ = ss[0] + (hv == 'v'? '<br/>': '') + ss[1]
    var class_ = (hv == 'v'? 'col ': '') + ('tile ') + ('tile-' + hv + ' ') + (se? '': 'tile-bk')
    var onclick_ = (se? 'clicked(this, ' + id + ')': '')
    var tile = $('<div>').addClass(class_).attr('onclick',onclick_).html(html_)
    rev? div.prepend(tile): div.append(tile)
}

function appendGap(div, hv, rev) {
    var class_ = 'gap-' + hv;
    var gap = $('<div>').addClass(class_)
    rev? div.prepend(gap): div.append(gap)
}

function showPlayer(hide, show, pos, hv, rev, self) {
    var div = $('#pos-' + pos)
    div.html('')
    show.forEach(group => {
        group.forEach(id => {
            appendTiles(div, hv, rev, false, id)
        })
        appendGap(div, hv, rev)
    })
    appendGap(div, hv, rev)
    hide.forEach(id => {
        appendTiles(div, hv, rev, self, id)
    })
}

function showPool(data) {
    const ROW = 5, COL = 17
    var count = 0
    data.forEach(id => {
        var row = Math.floor(count / COL)
        var col = Math.floor(count % COL)
        var div = $('#pool-row-' + row)
        if (col == 0) div.html('')
        appendTiles(div, 'v', false, false, id)
        count += 1;
    })
}

function showButtons(data) {
    $('#action-play').prop('disabled', !data.play);
    $('#action-pong').prop('disabled', !data.pong);
    $('#action-song').prop('disabled', !data.song);
    $('#action-gong').prop('disabled', !data.gong);
    $('#action-wooo').prop('disabled', !data.wooo);
}

function clicked(this_, id) {
    console.log('onclick', id)
    $(this_).toggleClass('tile-se')
}

$(function() {
    showPlayer(data.hide.top,    data.show.top,    'top',    'v', true,  false)
    showPlayer(data.hide.bottom, data.show.bottom, 'bottom', 'v', false, true)
    showPlayer(data.hide.left,   data.show.left,   'left',   'h', false, false)
    showPlayer(data.hide.right,  data.show.right,  'right',  'h', true,  false)
    showPool(data.pool)
    showButtons(data.action)
});

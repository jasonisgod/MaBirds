
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
    pool: [43,12,47,47,26,43,29,31,28,11,19,24,35,25,13,26,44],
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

function showTiles(hide, show, pos, hv, rev, self) {

    function _showTiles(id, div, hv, rev, se) {
        var name = getName(id)
        var ss = [...name]
        var html_ = ss[0] + (hv == 'v'? '<br/>': '') + ss[1]
        var class_ = (hv == 'v'? 'col ': '') + ('tile ') + ('tile-' + hv + ' ') + (se? '': 'tile-bk')
        var onclick_ = (se? 'clicked(this, ' + id + ')': '')
        var tile = $('<div>').addClass(class_).attr('onclick',onclick_).html(html_)
        rev? div.prepend(tile): div.append(tile)
    }
    
    function _showGap(div, hv, rev) {
        var class_ = 'gap-' + hv;
        var gap = $('<div>').addClass(class_)
        rev? div.prepend(gap): div.append(gap)
    }

    var div = $('#pos-' + pos)
    div.html('')
    show.forEach(group => {
        group.forEach(id => {
            _showTiles(id, div, hv, rev, false)
        })
        _showGap(div, hv, rev)
    })
    _showGap(div, hv, rev)
    hide.forEach(id => {
        _showTiles(id, div, hv, rev, self)
    })
}

function clicked(this_, id) {
    console.log('onclick', id)
    $(this_).toggleClass('tile-se')
}

$(function() {
    showTiles(data.hide.top,    data.show.top,    'top',    'v', true,  false)
    showTiles(data.hide.bottom, data.show.bottom, 'bottom', 'v', false, true)
    showTiles(data.hide.left,   data.show.left,   'left',   'h', false, false)
    showTiles(data.hide.right,  data.show.right,  'right',  'h', true,  false)
});

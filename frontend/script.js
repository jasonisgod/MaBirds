
var tmpdata = {
    top: {
        hide: [99,99,99,99,99,99,99,99,99,99],
        show: [[32,33,34]],
        come: [],
    },
    bottom: {
        hide: [11,12,27,27,39,41,46],
        show: [[45,45,45],[37,38,39]],
        come: [17],
    },
    left: {
        hide: [99,99,99,99,99,99,99,99,99,99],
        show: [[14,15,16]],
        come: [],
    },
    right: {
        hide: [99,99,99,99,99,99,99],
        show: [[42,42,42],[16,17,18]],
        come: [],
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

function colorFont(color, text) {
    return "<span style='color:"+color+"'>"+text+"</span>"
}

function tileCode(id) {

    var map = {
        11:'&#x1F019;',12:'&#x1F01A;',13:'&#x1F01B;', // 筒
        14:'&#x1F01C;',15:'&#x1F01D;',16:'&#x1F01E;',
        17:'&#x1F01F;',18:'&#x1F020;',19:'&#x1F021;',
        21:'&#x1F010;',22:'&#x1F011;',23:'&#x1F012;', // 索
        24:'&#x1F013;',25:'&#x1F014;',26:'&#x1F015;',
        27:'&#x1F016;',28:'&#x1F017;',29:'&#x1F018;',
        31:'&#x1F007;',32:'&#x1F008;',33:'&#x1F009;', // 萬
        34:'&#x1F00A;',35:'&#x1F00B;',36:'&#x1F00C;',
        37:'&#x1F00D;',38:'&#x1F00E;',39:'&#x1F00F;',
        41:'&#x1F000;',42:'&#x1F001;',43:'&#x1F002;',44:'&#x1F003;', // 字
        45:'&#x1F004;',46:'&#x1F005;',47:'&#x1F006;',
        99:'&#x1F02B' // 背
    }
    return map[id];
}

function addTiles(div, hv, rev, se, id, pos) {
    var code = tileCode(id)
    var class_ = (hv == 'v'? 'col ': '') + ('tile ') + ('tile-' + hv + ' ') + (se? '': 'tile-bk')
    var onclick_ = (se? 'clicked(this, ' + id + ')': '')
    var tile = $('<div>').addClass(class_).attr('onclick',onclick_)
    var text = $('<div>').addClass('tile-' + pos + ' ').html(code)
    tile.append(text)
    rev? div.prepend(tile): div.append(tile)
}

function addGap(div, hv, rev) {
    var class_ = 'gap-' + hv;
    var gap = $('<div>').addClass(class_)
    rev? div.prepend(gap): div.append(gap)
}

function showPlayer(data, pos) {
    var div = $('#pos-' + pos)
    var self = (pos == 'bottom')
    var hv = (pos == 'top' || pos == 'bottom'? 'v': 'h')
    var rev = (pos == 'top' || pos == 'right'? true: false)
    div.html('')
    data.show.forEach(group => {
        group.forEach(id => {
            addTiles(div, hv, rev, false, id, pos)
        })
        addGap(div, hv, rev)
    })
    addGap(div, hv, rev)
    data.hide.forEach(id => {
        addTiles(div, hv, rev, self, id, pos)
    })
    addGap(div, hv, rev)
    data.come.forEach(id => {
        addTiles(div, hv, rev, self, id, pos)
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
        addTiles(div, 'v', false, false, id, 'pool')
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

function refreshAll(data) {
    showPlayer(data.top, 'top')
    showPlayer(data.bottom, 'bottom')
    showPlayer(data.left, 'left')
    showPlayer(data.right, 'right')
    showPool(data.pool)
    showButtons(data.action)
}

$(function() {
    refreshAll(tmpdata)
});

/*

    // var name = tileHtml(id)
    // var ss = [...name]
    // var html_ = ss[0] + (hv == 'v'? '<br/>': '') + ss[1]
    // var html_ = tileHtml(id)
    // var class_ = (hv == 'v'? 'col ': '') + ('tile ') + ('tile-' + hv + ' ') + (se? '': 'tile-bk')
    // var onclick_ = (se? 'clicked(this, ' + id + ')': '')
    // var tile = $('<div>').addClass(class_).attr('onclick',onclick_).html(html_)


    // var RED = '#622', GREEN = '#262', BLUE = '#226'
    // var digits = ['','一','二','三','四','五','六','七','八','九']
    // var chars = ['','東風','南風','西風','北風','紅中','發財','白板']
    // var colors = ['',BLUE,BLUE,BLUE,BLUE,RED,GREEN,BLUE]
    // var chars = ['','東','南','西','北','中','發','口']
    // var num = id % 10
    // var br = (hv == 'v'? '<br/>': '')
    // if (11 <= id && id <= 19) {
    //     return colorFont(BLUE,digits[num]) + br + colorFont(RED,'◎')
    // }
    // if (21 <= id && id <= 29) {
    //     return colorFont(GREEN,digits[num]) + br + colorFont(GREEN,'索')
    // }
    // if (31 <= id && id <= 39) {
    //     return codes[id % 10]
    //     return colorFont(RED,digits[num]) + br + colorFont(BLUE,'萬')
    // }
    // if (41 <= id && id <= 47) {
    //     return colorFont(colors[num],'&#x1F000;') + br 
    // }
    // return '　　' // '　'
*/ 

var POLL_TIME = 500
var NUM = -1
var SKIN = 4
var isSkinRefreshNeed = true
var audioEndTime = 0;
var audio;
const TOKEN_KEY = 'mabirds_token'
var DATA = {}

function colorFont(color, text) {
    return "<span style='color:"+color+"'>"+text+"</span>"
}

function tileCode(id) {
    var map = {
        11:'&#x1F019;',12:'&#x1F01A;',13:'&#x1F01B;', // tong
        14:'&#x1F01C;',15:'&#x1F01D;',16:'&#x1F01E;',
        17:'&#x1F01F;',18:'&#x1F020;',19:'&#x1F021;',
        21:'&#x1F010;',22:'&#x1F011;',23:'&#x1F012;', // sok
        24:'&#x1F013;',25:'&#x1F014;',26:'&#x1F015;',
        27:'&#x1F016;',28:'&#x1F017;',29:'&#x1F018;',
        31:'&#x1F007;',32:'&#x1F008;',33:'&#x1F009;', // man
        34:'&#x1F00A;',35:'&#x1F00B;',36:'&#x1F00C;',
        37:'&#x1F00D;',38:'&#x1F00E;',39:'&#x1F00F;',
        41:'&#x1F000;',42:'&#x1F001;',43:'&#x1F002;',44:'&#x1F003;', // word
        45:'&#x1F004;',46:'&#x1F005;',47:'&#x1F006;',
        90:'', // empty
        99:'&#x1F02B' // back
    }
    return map[id];
}

function createTile(hv, se, id, pos) {
    // var code = tileHtml(id, pos)
    if (id == 90) return $('<div>')
    var class_ = (hv == 'v'? 'col ': '') + ('tile ') + ('tile-' + hv + ' ') + (se? '': 'tile-bk')
    var onclick_ = (se? 'onclickTile(this, ' + id + ')': '')
    var img = $('<img>').addClass('tile-img-' + pos).attr('src', 'img/' + SKIN + '/' + id + '.png')
    var div = $('<div>').addClass('tile-' + pos + ' ').append(img)
    var tile = $('<div>').addClass(class_).attr('onclick',onclick_).attr('value',id).append(div)
    return tile
}

function addTile(div, hv, rev, se, id, pos) {
    var tile = createTile(hv, se, id, pos)
    rev? div.prepend(tile): div.append(tile)
}

function addGap(div, hv, rev) {
    var class_ = 'gap-' + hv;
    var gap = $('<div>').addClass(class_)
    rev? div.prepend(gap): div.append(gap)
}

function showPlayer(odata, data, pos) {
    if (odata != undefined && !isSkinRefreshNeed) {
        if (JSON.stringify(odata) == JSON.stringify(data)) {
            return
        }
    }
    var div = $('#pos-' + pos)
    var self = (pos == 'bottom')
    var hv = (pos == 'top' || pos == 'bottom'? 'v': 'h')
    var rev = (pos == 'top' || pos == 'right'? true: false)
    div.html('')
    data.show.forEach(group => {
        group.forEach(id => {
            addTile(div, hv, rev, false, id, pos)
        })
        addGap(div, hv, rev)
    })
    data.hide.forEach(id => {
        addTile(div, hv, rev, self, id, pos)
    })
    addGap(div, hv, rev)
    data.come.forEach(id => {
        addTile(div, hv, rev, self, id, pos)
    })
}

function clearLabels() {
    $('#label-top').html('').removeClass('label-showing')
    $('#label-bottom').html('').removeClass('label-showing')
    $('#label-left').html('').removeClass('label-showing')
    $('#label-right').html('').removeClass('label-showing')
}

function showLabel(pos, e) {
    $('#label-' + pos).addClass('label-showing').append(e)
}

function addTileToPool(tile, count) {
    const ROW = 5, COL = 17
    var row = Math.floor(count / COL)
    var col = Math.floor(count % COL)
    var div = $('#pool-row-' + row)
    addTile(div, 'v', false, false, tile, 'pool')
}

function clearPool() {
    $(".pool-row").each(function() {
        $(this).html('')
    })
}

function showPool(odata, data) { 
    if (odata != undefined && !isSkinRefreshNeed) {
        if (odata.toString() == data.toString()) {
            return
        }
        if (odata.length < data.length) {
            var front = data.slice(0, odata.length)
            if (odata.toString() == front.toString()) {
                var count = odata.length
                var back = data.slice(odata.length, data.length)
                back.forEach(tile => { 
                    addTileToPool(tile, count)
                    count += 1
                })
                return
            }
        }
    }
    var count = 0
    clearPool()
    data.forEach(tile => {
        addTileToPool(tile, count)
        count += 1;
    })
}

function showButtons(data) {
    $('#action-play').prop('disabled', !data.play);
    $('#action-pong').prop('disabled', !data.pong);
    $('#action-song').prop('disabled', !data.song);
    $('#action-gong').prop('disabled', !data.gong);
    $('#action-wooo').prop('disabled', !data.wooo);
    $('#action-cancel').prop('disabled', !data.cancel);
    $('#action-bot').prop('disabled', data.play);
    var flag = data.play || data.pong || data.song || data.gong || data.wooo || data.cancel;
    $('#action-box').css("visibility", flag? "visible": "hidden");
}

function onclickTile(this_, id) {
    console.log('onclick tile', id)
    $(this_).toggleClass('tile-se')
}

function onclickAction(atype) {
    console.log('onclick atype', atype)
    var arr = []
    $(".tile-se").each(function () {
        arr.push(parseInt($(this).attr('value')))
    })
    console.log(arr)
    if (atype == 'PLAY' && arr.length == 1) {
        $.get(DOMAIN + "/api/play/" + NUM + '/' + arr[0].toString())
    }
    if (atype == 'WOOO' || atype == 'GONG' || atype == 'PONG' || atype == 'SONG') {
        arr.push(DATA.ctile)
        $.get(DOMAIN + "/api/action/" + NUM + '/' + atype + '/'+ arr.join(','))
    }
    if (atype == 'CANCEL') {
        $.get(DOMAIN + "/api/action/" + NUM + '/CANCEL/99');
    }
    if (atype == 'BOT') {
        $.get(DOMAIN + "/api/bot")
    }
    if (atype == 'START') {
        $.get(DOMAIN + "/api/start")
    }
    if (atype == 'RANDOM') {
        $.get(DOMAIN + "/api/start/random")
    }
}

function showBgImg() {
    if (!isSkinRefreshNeed) {
        return
    }
    var bgImg = "url(img/" + SKIN + "/bg.png)"
    $('body').css("background-image", bgImg)
    $('#container').css("background-image", bgImg)
    $('#menu-box').css("background-image", bgImg)
}

function refreshAll(odata, data) {
    showBgImg();
    showPlayer(odata.top, data.top, 'top')
    showPlayer(odata.bottom, data.bottom, 'bottom')
    showPlayer(odata.left, data.left, 'left')
    showPlayer(odata.right, data.right, 'right')
    showPool(odata.pool, data.pool)
    showButtons(data.action)
    clearLabels()
    if (data.state == 'DELAY_PLAY' || data.state == 'ACTION') {
        var tile = createTile('vv', false, data.ctile, 'label')
        showLabel(data.cpos, tile)
    }
    var table = { 'WOOO': '糊', 'GONG': '槓', 'PONG': '碰', 'SONG': '上' }
    if (data.state == 'DELAY_ACTION') {
        var span = $('<span>').html(table[data.atype])
        showLabel(data.cpos, span)
    }
    if (data.state == 'END') {
        var span = $('<span>').html(table['WOOO'])
        showLabel(data.cpos, span)
    }
    isSkinRefreshNeed = false
}

function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r!=null) return unescape(r[2]); return null;
}

function playAudioName(name) {
    audio.src = 'audio/' + name + '.mp3';
    audio.play()
}

function playAudio(odata, data) {
    if (odata.state != 'DELAY_PLAY' && data.state == 'DELAY_PLAY') {
        console.log('playAudio() play', data.ctile)
        playAudioName(data.ctile)
    }
    if (odata.state != 'DELAY_ACTION' && data.state == 'DELAY_ACTION') {
        console.log('playAudio() action', data.atype)
        playAudioName(data.atype)
    }
}

function setPollTimer() {
    setInterval(() => {
        $.get(DOMAIN + "/api/data/" + NUM, function(data, status) {
            // console.log(data, status)
            data = JSON.parse(data).data
            if (JSON.stringify(data) === JSON.stringify(DATA) && !isSkinRefreshNeed) {
                console.log('same')
            } else {
                console.log('new', data)
                refreshAll(DATA, data)
                playAudio(DATA, data)
                DATA = data
            }
        })
    }, POLL_TIME);
}

function screenLock() {
    if (document.documentElement.requestFullscreen) {
        document.querySelector("#container").requestFullscreen()
    } else if (document.documentElement.webkitRequestFullScreen) {
        document.querySelector("#container").webkitRequestFullScreen()
    }
    if (document.webkitFullscreenElement) {
        document.webkitCancelFullScreen()
    } else {
        const el = document.documentElement
        el.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)
    }
    console.log('screen.orientation before lock',screen.orientation)
    screen.orientation.lock("landscape")
        .then(function() {
            console.log('screen.orientation after lock',screen.orientation)
        })
        .catch(function(error) {
            console.log('screen.orientation after lock',screen.orientation)
            console.log('screen.orientation.lock error', error)
    });
}

function onclickFullscreen() {
    screenLock()
}

function preloadImages() {
    var nums = [
        11,12,13,14,15,16,17,18,19,
        21,22,23,24,25,26,27,28,29,
        31,32,33,34,35,36,37,38,39,
        41,42,43,44,45,46,47,90,99
    ]
    var skins = [2,3,4]
    skins.forEach(skin => {
        nums.forEach(num => {
            var src = 'img/' + skin + '/' + num + '.png'
            var img = $('<img />').attr('src', src)
            $("#preload-box").append(img)
            // console.log('preloadImages()', skin, num)
        });
    });
}

function toggleMenu() {
    $("#menu-box").toggle();
    $("#menu-mask").toggle();
}

function audioInit() {
    audio = document.getElementById('audio-mp3');
    audio.addEventListener('timeupdate', function (){
        if (audioEndTime && audio.currentTime >= audioEndTime) {
            audio.pause();
        }   
        console.log('audio timeupdate', audio.currentTime);
    }, false);
    playAudioName('START')
}

function getNewToken() {
    return crypto.randomUUID()
}

function webSocketTest() {
    console.log('webSocketTest')
    const ws = new WebSocket(WS_URL)
    ws.onopen = () => {
        console.log('ws.onopen')
        var token = localStorage.getItem(TOKEN_KEY) || getNewToken()
        localStorage.setItem(TOKEN_KEY, token)
        console.log('token', token)
        var data = {'type':'connect', 'token': token}
        ws.send(JSON.stringify(data))
        console.log('ws.send', data)
    }
    ws.onmessage = (message) => {
        console.log(`ws.onmessage`, message.data)
        var data = JSON.parse(message.data)
        NUM = data.num
        console.log('server return num', NUM)
    }
}

$(function() {
    console.log('ready')
    preloadImages()
    setPollTimer()
    webSocketTest()
    $("#select-skin").change(function() { SKIN = this.value; isSkinRefreshNeed = true })
    $("#select-seat").change(function() { NUM = this.value })
    $("#select-bots").change(function() { $.get(DOMAIN + "/api/bots/" + this.value ) })
    $("#select-trans").change(function() {
        $('#pos-bottom').css('margin-top',this.value) 
        $('#action-box').css('margin-top',this.value) 
    })
    $("#select-screen").change(function() {
        onclickFullscreen()
    })
    $("#start-box").show()
    $("#main-box").hide()
    $("#menu-box").hide()
    $("#menu-mask").hide()
    $("#start-btn").click(function() { 
        $("#start-box").hide()
        $("#main-box").show()
        $("#menu-box").hide()
        $("#menu-mask").hide()
        audioInit()
        screenLock()
    })
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
*/ 
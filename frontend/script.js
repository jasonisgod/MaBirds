
var data = {
    hand: {
        front: [99,99,99,99,99,99,99,99,99,99,99,99,99],
        left:  [99,99,99,99,99,99,99,99,99,99],
        right: [99,99,99,99,99,99,99],
        self:  [11,12,13,27,27,34,36,37,39,39,41,43,46]
    },
    show: {
        front: [],
        left:  [[24,25,26]],
        right: [[42,42,42],[16,17,18]],
        self:  []
    }
}

function getName(id) {
    var digits = ['','一','二','三','四','五','六','七','八','九']
    var chars = ['','東','南','西','北','中','發','白']
    var num = id % 10
    if (11 <= id && id <= 19) return (digits[num] + '筒')
    if (21 <= id && id <= 29) return (digits[num] + '索')
    if (31 <= id && id <= 39) return (digits[num] + '萬')
    if (41 <= id && id <= 47) return (chars[num]  + '乂')
    return '口口'
}

function setHand(data, div, hv) {
    $('#' + div).html('')
    data.forEach(id => {
        // console.log(getName(id))
        var name = getName(id)
        var ss = [...name]
        var html = ss[0] + (hv == 'v'? '<br/>': '') + ss[1]
        var col = $('<div>').addClass((hv == 'v'? 'col ': '') + 'tile-' + hv).html(html)
        $('#' + div).append(col)
    })
    

}

var tmp = [11,12,13,27,27,34,36,37,39,39,41,43,46]
setHand(tmp, 'hand-top', 'v')
setHand(tmp, 'hand-bottom', 'v')
setHand(tmp, 'hand-left', 'h')
setHand(tmp, 'hand-right', 'h')
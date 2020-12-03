// Settings


var baseUrl = 'http://14fdc9b7b82d.ngrok.io';
//var baseUrl = 'http://localhost:8888';
var baseWsUrl = 'ws://14fdc9b7b82d.ngrok.io';
//var baseWsUrl = 'ws://localhost:8888';
var token = '246f547492cac1f9f8f5cca9c8f76d88acf334cdda674859';


var kernelName = 'python';
var options = {
    clientId: uuid(),
    username: "test",
    socket: null
}

function getUrl(path) {
    return baseUrl + path + '?token=' + token;
}

function uuid() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    var nChars = hexDigits.length;
    for (var i = 0; i < 32; i++) {
        s[i] = hexDigits.charAt(Math.floor(Math.random() * nChars));
    }
    return s.join("");
}

function createKernelMessage(options, content, metadata, buffers) {
    if (typeof content === 'undefined') {
        content = {};
    }
    if (typeof metadata === 'undefined') {
        metadata = {};
    }
    if (typeof buffers === 'undefined') {
        buffers = [];
    }
    return {
        header: {
            username: options.username || '',
            version: '5.0',
            session: options.session,
            msg_id: options.msgId || uuid(),
            msg_type: options.msgType
        },
        parent_header: {},
        channel: options.channel,
        content: content,
        metadata: metadata,
        buffers: buffers
    };
}

function serializeBinary(msg) {
    var offsets = [];
    var buffers = [];
    var encoder = new TextEncoder('utf8');
    var json_utf8 = encoder.encode(JSON.stringify(msg, replace_buffers));
    buffers.push(json_utf8.buffer);
    for (var i = 0; i < msg.buffers.length; i++) {
        // msg.buffers elements could be either views or ArrayBuffers
        // buffers elements are ArrayBuffers
        var b = msg.buffers[i];
        buffers.push(b instanceof ArrayBuffer ? b : b.buffer);
    }
    var nbufs = buffers.length;
    offsets.push(4 * (nbufs + 1));
    for (i = 0; i + 1 < buffers.length; i++) {
        offsets.push(offsets[offsets.length - 1] + buffers[i].byteLength);
    }
    var msg_buf = new Uint8Array(offsets[offsets.length - 1] + buffers[buffers.length - 1].byteLength);
    // use DataView.setUint32 for network byte-order
    var view = new DataView(msg_buf.buffer);
    // write nbufs to first 4 bytes
    view.setUint32(0, nbufs);
    // write offsets to next 4 * nbufs bytes
    for (i = 0; i < offsets.length; i++) {
        view.setUint32(4 * (i + 1), offsets[i]);
    }
    // write all the buffers at their respective offsets
    for (i = 0; i < buffers.length; i++) {
        msg_buf.set(new Uint8Array(buffers[i]), offsets[i]);
    }
    return msg_buf.buffer;
}

function serialize(msg) {
    var value;
    if (msg.buffers && msg.buffers.length) {
        value = serializeBinary(msg);
    } else {
        value = JSON.stringify(msg);
    }
    return value;
}

function showStatus(status) {
    document.getElementById('status').innerText = status;
}

function showInput(input) {
    document.getElementById('input').innerText = input;
}

function addToStream(name, text) {
    var $element = document.getElementById('output');
    var newText = $element.innerText;
    newText += text;
    $element.innerText = newText;
}

function showReply(status) {
    document.getElementById('result').innerText = status;
}

function sendMessage(socket, code) {
    console.log("Send data on server");

    var message = {
        silent: false,
        store_history: true,
        user_expressions: {},
        allow_stdin: true,
        stop_on_error: false,
        code: code
    }

    var curOptions = {
        msgType: 'execute_request',
        channel: 'shell',
        username: options.username,
        session: options.clientId
    };

    var msg = createKernelMessage(curOptions, message);

    socket.send(serialize(msg));
}

function execute(kernelInfo, code) {
    let socket = options.socket;
    var oldSocket = false;
    if (socket === null) {
        socket = new WebSocket(baseWsUrl + '/api/kernels/' + kernelInfo.id + '/channels?session_id=' + options.clientId + '&token=' + token);
        options.socket = socket;
    } else {
        oldSocket = true;
    }

    if (oldSocket) {
        sendMessage(socket, code);
    }

    socket.onopen = function (e) {
        console.log("[open] Connected");
        sendMessage(socket, code);
    };

    socket.onmessage = function (event) {
        var data = JSON.parse(event.data);
        var msgType = data.msg_type;
        console.log('[message] Data from server:', data);
        switch (msgType) {
            case 'status':
                showStatus(data.content.execution_state);
                break;
            case 'execute_input':
                showInput(data.content.code);
                break;
            case 'stream':
                addToStream(data.content.name, data.content.text);
                break;
            case 'execute_reply':
                showReply(data.content.status);
                break;
        }
    };

    socket.onclose = function (event) {
        if (event.wasClean) {
            console.log(`[close] Connection was closed normally, code=${event.code} reason=${event.reason}`);
        } else {
            console.log('[close] Connected terminated');
        }
    };

    socket.onerror = function (error) {
        console.log(`[error] ${error.message}`);
    };
}

function createNewKernel(kernelSpec, code) {
    console.log('Kernel spec ', kernelSpec);
    var data = {
        name: kernelName
    }
    fetch(getUrl('/api/kernels'), {
        method: 'POST', // или 'PUT'
        body: JSON.stringify(data), // данные могут быть 'строкой' или {объектом}!
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(async function (response) {
        execute(await response.json(), code);
    });
}

function getKernelSpecs(code) {
    fetch(getUrl('/api/kernelspecs'))
        .then(async function (response) {
            createNewKernel(await response.json(), code);
        })
}

document.getElementById('execute').onclick = function () {
    getKernelSpecs(document.getElementById('pythonText').value);
}
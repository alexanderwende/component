let counter = 0;

function sendCount () {

    postMessage(counter++);

    setTimeout(sendCount, 1000);
}

sendCount();

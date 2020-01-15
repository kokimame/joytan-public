// Grobal var to store setTimeout of YouTube control
var timeoutFunc;

function callPlayer(frame_id, func, args) {
  if (window.jQuery && frame_id instanceof jQuery) frame_id = frame_id.get(0).id;
  var iframe = document.getElementById(frame_id);
  if (iframe && iframe.tagName.toUpperCase() != 'IFRAME') {
      iframe = iframe.getElementsByTagName('iframe')[0];
  }

  // When the player is not ready yet, add the event to a queue
  // Each frame_id is associated with an own queue.
  // Each queue has three possible states:
  //  undefined = uninitialised / array = queue / 0 = ready
  if (!callPlayer.queue) callPlayer.queue = {};
  var queue = callPlayer.queue[frame_id],
      domReady = document.readyState == 'complete';

  if (domReady && !iframe) {
      // DOM is ready and iframe does not exist. Log a message
      window.console && console.log('callPlayer: Frame not found; id=' + frame_id);
      if (queue) clearInterval(queue.poller);
  } else if (func === 'listening') {
      // Sending the "listener" message to the frame, to request status updates
      if (iframe && iframe.contentWindow) {
          func = '{"event":"listening","id":' + JSON.stringify(''+frame_id) + '}';
          iframe.contentWindow.postMessage(func, '*');
      }
  } else if ((!queue || !queue.ready) && (
             !domReady ||
             iframe && !iframe.contentWindow ||
             typeof func === 'function')) {
      if (!queue) queue = callPlayer.queue[frame_id] = [];
      queue.push([func, args]);
      if (!('poller' in queue)) {
          // keep polling until the document and frame is ready
          queue.poller = setInterval(function() {
              callPlayer(frame_id, 'listening');
          }, 250);
          // Add a global "message" event listener, to catch status updates:
          messageEvent(1, function runOnceReady(e) {
                  if (!iframe) {
                      iframe = document.getElementById(frame_id);
                      if (!iframe) return;
                      if (iframe.tagName.toUpperCase() != 'IFRAME') {
                          iframe = iframe.getElementsByTagName('iframe')[0];
                          if (!iframe) return;
                      }
                  }
              if (e.source === iframe.contentWindow) {
                  // Assume that the player is ready if we receive a
                  // message from the iframe
                  clearInterval(queue.poller);
                  queue.ready = true;
                  messageEvent(0, runOnceReady);
                  // .. and release the queue:
                  while (tmp = queue.shift()) {
                      callPlayer(frame_id, tmp[0], tmp[1]);
                  }
              }
          }, false);
      }
  } else if (iframe && iframe.contentWindow) {
      // When a function is supplied, just call it (like "onYouTubePlayerReady")

      if (func === 'playDuration') {
        clearTimeout(timeoutFunc)
        iframe.contentWindow.postMessage(JSON.stringify({
          "event": "command",
          "func": "seekTo",
          "args": [args[0]],
          "id": frame_id
        }), "*");
        iframe.contentWindow.postMessage(JSON.stringify({
          "event": "command",
          "func": "playVideo",
          "args": [],
          "id": frame_id
        }), "*");
        isTimerRunning = true;
        timeoutFunc = setTimeout(() => {
          iframe.contentWindow.postMessage(JSON.stringify({
            "event": "command",
            "func": "pauseVideo",
            "args": [],
            "id": frame_id
          }), "*");
        }, (args[1] - args[0]) * 1000)
      }
      if (func.call) { return func() };
      // Frame exists, send message
      iframe.contentWindow.postMessage(JSON.stringify({
          "event": "command",
          "func": func,
          "args": args || [],
          "id": frame_id
      }), "*");
  }
  /* IE8 does not support addEventListener... */
  function messageEvent(add, listener) {
      var w3 = add ? window.addEventListener : window.removeEventListener;
      w3 ?
          w3('message', listener, !1)
      :
          (add ? window.attachEvent : window.detachEvent)('onmessage', listener);
  }
}

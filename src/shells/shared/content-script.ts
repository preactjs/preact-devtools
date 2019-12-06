/**
 * IIFE is here to isolate the variable scope of the content script
 * as it might be injected into the same window/tab multiple times.
 */
(function() {
	let port = chrome.runtime.connect({
		name: "contentScript",
	});

	/**
	 * Keeps track whether the event piping done in the background script is ready
	 * to accept events.
	 */
	let backendInitialized = false;

	/**
	 * Setup message forwarding from port.onMessage to window.onMessage and vice-versa
	 */
	const cleanupPortMessagesForward = forwardPortMessagesToWindowPostMessage();
	const cleanupWindowPostMessagesForward = forwardWindowPostMessagesToPortMessage();

	/**
	 * Cleanup message forwarding when the other end of the port disconnects
	 */
	port.onDisconnect.addListener(() => {
		backendInitialized = false;
		cleanupWindowPostMessagesForward();
		cleanupPortMessagesForward();
		// TODO(Sven): Do we need to call `port.onDisconnect.removeListener` for this listenere here or
		// is this taken care of since the port will be destroyed later anyways?
	});

	/**
	 * TODO(Sven): Why is this ping-ing needed? Found no handler of this event
	 */
	pingBackend();

	// On page reload the content script may be initialized before the backend
	if (!backendInitialized) {
		let interval: any;
		interval = setInterval(() => {
			if (backendInitialized) {
				clearInterval(interval);
			} else {
				pingBackend();
			}
		}, 500);
	}

	function pingBackend() {
		window.postMessage(
			{
				source: "preact-devtools-content-script",
				name: "ping-backend",
				payload: {
					ping: true,
				},
			},
			"*",
		);
	}

	function forwardWindowPostMessagesToPortMessage() {
		function onWindowPostMessage(ev: MessageEvent) {
			if (ev.source === window && ev.data) {
				// TODO(Sven): Why are we forwarding this message from port.onMessage to window.postMessage
				// when we are listening in the same closure?
				if (
					ev.data.source === "preact-devtools-content-script" &&
					ev.data.name === "initialized"
				) {
					backendInitialized = true;
				} else if (backendInitialized && ev.data.source === "preact-devtools") {
					port.postMessage({
						name: ev.data.name,
						data: ev.data,
					});
				}
			}
		}

		window.addEventListener("message", onWindowPostMessage);

		return () => {
			window.removeEventListener("message", onWindowPostMessage);
		};
	}

	function forwardPortMessagesToWindowPostMessage() {
		function onPortMessage(message: any) {
			window.postMessage(
				{
					source: "preact-devtools-content-script",
					...message,
				},
				"*",
			);
		}

		port.onMessage.addListener(onPortMessage);

		return () => {
			port.onMessage.removeListener(onPortMessage);
		};
	}
})();

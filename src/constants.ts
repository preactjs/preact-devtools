export const ClientToDevtools = "preact-client-to-devtools";
export const DevtoolsToClient = "preact-devtools-to-client";
export const ContentScriptName = "preact-content-script";
export const DevtoolsPanelName = "preact-devtools-panel";
export const DevtoolsPanelInlineName = "preact-devtools-panel/inline";
export const PageHookName = "preact-page-hook";

export enum Status {
	Disconnected = "disconnected",
	Connected = "connected",
	Pending = "pending",
}

export const PROFILE_RELOAD = "preact-devtools_profile-and-reload";
export const STATS_RELOAD = "preact-devtools_stats-and-reload";

export enum HookType {
	useState = 1,
	useReducer = 2,
	useEffect = 3,
	useLayoutEffect = 4,
	useRef = 5,
	useImperativeHandle = 6,
	useMemo = 7,
	useCallback = 8,
	useContext = 9,
	useErrorBoundary = 10,
	useDebugValue = 11,
	custom = 99,
	devtoolsParent = 9999,
}

export enum NodeType {
	Element = 1,
	Text = 3,
	CData = 4,
	XMLProcessingInstruction = 7,
	Comment = 8,
	Document = 9,
	DocumentType = 10, // like <!DOCTYPE html>
	DocumentFragment = 11,
}

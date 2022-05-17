import { h } from "preact";
import s from "./TreeView.module.css";
import { useObserver, useStore } from "../../store/react-bindings";
import { useEffect, useState, useRef, useCallback } from "preact/hooks";
import { getLastChild } from "../tree/windowing";
import { useKeyListNav } from "../tree/keyboard";
import { useSelection } from "../../store/selection";
import { useCollapser } from "../../store/collapser";
import { BackgroundLogo } from "./background-logo";
import { useSearch } from "../../store/search";
import { scrollIntoView, useResize } from "../utils";
import { ID } from "../../store/types";
import { debounce } from "../../../shells/shared/utils";
import { EmitFn } from "../../../adapter/hook";
import { useVirtualizedList } from "./VirtualizedList";
import { useAutoIndent } from "./useAutoIndent";
import { Hoc } from "../sidebar/HocPanel";

const ROW_HEIGHT = 18;

const highlightNode = debounce(
	(notify: EmitFn, id: ID | null) => notify("highlight", id),
	100,
);

export function TreeView() {
	const store = useStore();
	const nodeList = useObserver(() => store.nodeList.$);
	const roots = useObserver(() => store.roots.$);
	const { collapseNode, collapsed } = useCollapser();
	const { selected, selectNext, selectPrev } = useSelection();

	const onKeyDown = useKeyListNav({
		selected,
		onCollapse: collapseNode,
		canCollapse: id => {
			const node = store.nodes.$.get(id);
			return node ? node.children.length > 0 : false;
		},
		checkCollapsed: id => collapsed.has(id),
		onNext: () => {
			selectNext();
			const s = store.selection.selected.$;
			highlightNode(store.notify, s);
			store.notify("inspect", s);
		},
		onPrev: () => {
			selectPrev();
			const s = store.selection.selected.$;
			highlightNode(store.notify, s);
			store.notify("inspect", s);
		},
	});

	const onMouseLeave = useCallback(() => highlightNode(store.notify, null), []);
	const ref = useRef<HTMLDivElement | null>(null);
	const paneRef = useRef<HTMLDivElement | null>(null);

	const search = useSearch();
	useEffect(() => {
		if (ref.current && search.selectedIdx > -1) {
			const top = ROW_HEIGHT * search.selectedIdx;
			const scroll = ref.current.scrollTop;
			const height = ref.current.clientHeight;
			if (scroll > top || scroll + height < top) {
				ref.current.scrollTo({ top });
			}
		}
	}, [search.selectedIdx]);

	const [updateCount, setUpdateCount] = useState(0);
	useResize(() => setUpdateCount(updateCount + 1), [updateCount]);

	const {
		children: listItems,
		containerHeight,
		scrollToItem,
	} = useVirtualizedList({
		rowHeight: ROW_HEIGHT,
		bufferCount: 5,
		container: ref,
		items: nodeList,
		// eslint-disable-next-line react/display-name
		renderRow: (id, _, top) => <TreeItem key={id} id={id} top={top} />,
	});

	useEffect(() => {
		scrollToItem(selected);
	}, [selected]);

	useAutoIndent(paneRef, [listItems]);

	// When the devtools is connected, but nothing has been sent to the panel yet
	const isOnlyConnected = nodeList.length === 0 && roots.length === 0;
	// When client sent messages, but no nodes were sent due to filters.
	const hasNoResults = nodeList.length === 0 && roots.length > 0;

	return (
		<div
			ref={ref}
			tabIndex={0}
			class={s.tree}
			onKeyDown={onKeyDown}
			data-tree={true}
			onMouseLeave={onMouseLeave}
		>
			{isOnlyConnected && (
				<div class={s.empty} data-testid="msg-only-connected">
					<div class={s.emptyInner}>
						<BackgroundLogo class={s.bgLogo} />
						<p>
							<b>Connected</b>, listening for Preact operations...
						</p>
						<p class={s.emptyDescription}>
							<small>
								If this message doesn&apos;t go away Preact started rendering
								before devtools was initialized. You can fix this by adding the{" "}
								<code>preact/debug</code> or <code>preact/devtools</code> import
								at the <b>top</b> of your entry file.
							</small>
						</p>
					</div>
				</div>
			)}
			{hasNoResults && (
				<div class={s.empty} data-testid="msg-no-results">
					<div class={s.emptyInner}>
						<BackgroundLogo class={s.bgLogo} />
						<p>
							<b>Nothing to show</b>
						</p>
						<p class={s.emptyDescription}>
							<small>
								No nodes visible with active filters. To fix this update filters
								or make sure to render at least one component in your app.
							</small>
						</p>
					</div>
				</div>
			)}
			<div
				class={s.pane}
				ref={paneRef}
				data-testid="elements-tree"
				style={`height: ${containerHeight}px`}
			>
				{listItems}
				<HighlightPane treeDom={ref.current} />
			</div>
		</div>
	);
}

export function MarkResult(props: { text: string; id: ID }) {
	const { regex, selectedId } = useSearch();
	const { text, id } = props;
	const isActive = id === selectedId;

	const ref = useRef<HTMLSpanElement>();
	useEffect(() => {
		if (ref.current && isActive) {
			scrollIntoView(ref.current.closest('[data-testid="tree-item"]') as any);
		}
	}, [ref.current, selectedId, id]);

	if (regex != null && regex.test(text)) {
		const m = text.match(regex)!;
		const idx = m.index || 0;
		const start = idx > 0 ? text.slice(0, idx) : "";
		const end = idx < text.length ? text.slice(idx + m[0].length) : "";
		return (
			<span ref={ref} data-testid="node-name">
				{start}
				<mark
					class={`${s.mark} ${isActive ? s.markSelected : ""}`}
					data-marked={isActive}
				>
					{m[0]}
				</mark>
				{end}
			</span>
		);
	}
	return <span data-testid="node-name">{text}</span>;
}

export function TreeItem(props: { key: any; id: ID; top: number }) {
	const { id } = props;
	const store = useStore();
	const as = useSelection();
	const { collapsed, toggle } = useCollapser();
	const node = useObserver(() => store.nodes.$.get(id) || null);
	const filterHoc = useObserver(() => store.filter.filterHoc.$);
	const roots = useObserver(() => store.roots.$);
	const onToggle = () => toggle(id);
	const ref = useRef<HTMLDivElement>();

	if (!node) return null;

	// FIXME: This seems wrong
	const isRoot = roots.includes(node.id);

	return (
		<div
			ref={ref}
			class={s.item}
			data-testid="tree-item"
			data-name={node.name}
			onClick={() => {
				as.selectById(id);
				store.notify("inspect", id);
			}}
			onMouseEnter={() => highlightNode(store.notify, id)}
			data-selected={as.selected === id}
			data-id={id}
			data-depth={node.depth}
			style={`top: ${props.top}px;`}
		>
			<div
				class={s.itemHeader}
				style={`transform: translate3d(calc(var(--indent-depth) * ${node.depth}), 0, 0);`}
			>
				{node.children.length > 0 && (
					<button
						class={s.toggle}
						data-collapsed={collapsed.has(id)}
						onClick={onToggle}
					>
						<Arrow />
					</button>
				)}
				{node.children.length === 0 && <div class={s.noToggle} />}
				<span class={s.name}>
					<MarkResult text={node.name} id={id} />
					{node.key ? (
						<span class={s.keyLabel}>
							{" "}
							key=&quot;
							<span class={s.key}>
								{node.key.length > 15 ? `${node.key.slice(0, 15)}…` : node.key}
							</span>
							&quot;
						</span>
					) : (
						""
					)}
					{filterHoc && node.hocs && node.hocs.length > 0 && (
						<HocLabels hocs={node.hocs} nodeId={id} />
					)}
					{isRoot ? <span class={s.rootLabel}>(Root)</span> : ""}
				</span>
			</div>
		</div>
	);
}

export function HocLabels({
	hocs,
	nodeId,
	canMark = true,
}: {
	hocs: string[];
	nodeId: number;
	canMark?: boolean;
}) {
	return (
		<span class={s.hocs} data-testid="hoc-labels">
			{hocs.map((hoc, i) => {
				return (
					<Hoc key={i} small>
						{canMark ? <MarkResult text={hoc} id={nodeId} /> : hoc}
					</Hoc>
				);
			})}
		</span>
	);
}

export function Arrow() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 4.233 4.233"
		>
			<path d="M1.124 1.627H3.11l-.992 1.191-.993-1.19" fill="currentColor" />
		</svg>
	);
}

export function HighlightPane(props: { treeDom: HTMLDivElement | null }) {
	const store = useStore();
	const nodes = useObserver(() => store.nodes.$);
	const { selected } = useSelection();
	const { collapsed } = useCollapser();

	// Subscribe to nodeList so that we rerender whenever nodes
	// are collapsed
	const list = useObserver(() => store.nodeList.$);

	const [pos, setPos] = useState({ top: 0, height: 0 });
	useEffect(() => {
		if (selected > -1 && !collapsed.has(selected)) {
			if (props.treeDom != null) {
				const start = props.treeDom.querySelector(
					`[data-id="${selected}"`,
				) as HTMLDivElement | null;
				const lastId = getLastChild(nodes, selected);
				const last = props.treeDom.querySelector(
					`[data-id="${lastId}"]`,
				) as HTMLDivElement | null;

				if (start != null && last != null) {
					const rect = start.getBoundingClientRect();
					const top = start.offsetTop + rect.height;
					const lastRect = last.getBoundingClientRect();
					const height = last.offsetTop + lastRect.height - top;
					setPos({ top, height });
				} else {
					setPos({ top: 0, height: 0 });
				}
			} else {
				setPos({ top: 0, height: 0 });
			}
		} else {
			setPos({ top: 0, height: 0 });
		}
	}, [selected, list]);

	return (
		<div
			class={s.dimmer}
			style={`top: ${pos.top}px; height: ${pos.height}px;`}
		/>
	);
}

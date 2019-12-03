import { h } from "preact";
import { useState } from "preact/hooks";
import { Actions, ActionSeparator } from "./Actions";
import { IconBtn } from "./IconBtn";
import {
	SettingsIcon,
	Picker,
	KeyboardDown,
	KeyboardUp,
	Close,
	Search,
	Remove,
	AddCircle,
	CheckboxChecked,
	CheckboxUnChecked,
	FilterList,
	ShowUpdates,
} from "./icons";
import { useStore, useObserver } from "../store/react-bindings";
import s from "./TreeBar.css";
import { useSearch } from "../store/search";
import { OutsideClick } from "./OutsideClick";

export function TreeBar() {
	const store = useStore();
	const isPicking = useObserver(() => store.isPicking.$);
	const { value, count, selected, goPrev, goNext } = useSearch();
	const activeModal = useObserver(() => store.modal.active.$);

	const [filterVisible, setFilterVisible] = useState(false);
	const [showUpdates, setShowUpdates] = useState(false);

	const onKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			if (e.shiftKey) {
				goPrev();
			} else {
				goNext();
			}
		}
	};

	const searchActive = value !== "";

	return (
		<Actions>
			<div class={s.btnWrapper}>
				<IconBtn
					active={isPicking}
					title="Pick a Component from the page"
					onClick={() => {
						if (!isPicking) store.actions.startPickElement();
						else store.actions.stopPickElement();
					}}
				>
					<Picker />
				</IconBtn>
			</div>
			<ActionSeparator />
			<div class={s.searchContainer}>
				<Search size="xs" />
				<input
					class={s.search}
					type="text"
					placeholder="Search (text or /regex/)"
					value={value}
					onKeyDown={onKeyDown}
					onInput={e => store.search.onChange((e.target as any).value)}
				/>
				{searchActive && (
					<div class={s.searchCounter}>
						{count > 0 ? selected + 1 : 0} | {count}
					</div>
				)}
			</div>
			<ActionSeparator />
			<div class={s.btnWrapper}>
				<IconBtn
					onClick={store.search.selectNext}
					title="Select next result"
					disabled={!searchActive}
				>
					<KeyboardDown />
				</IconBtn>
			</div>
			<div class={s.btnWrapper}>
				<IconBtn
					onClick={store.search.selectPrev}
					title="Select previous result"
					disabled={!searchActive}
				>
					<KeyboardUp />
				</IconBtn>
			</div>
			<div class={s.btnWrapper}>
				<IconBtn
					onClick={store.search.reset}
					title="Clear search input"
					disabled={!searchActive}
				>
					<Close />
				</IconBtn>
			</div>
			<ActionSeparator />
			<div class={s.btnWrapper}>
				<IconBtn
					active={showUpdates}
					title="Show Updates"
					onClick={() => {
						const next = !showUpdates;
						store.actions.showUpdates(next);
						setShowUpdates(next);
					}}
				>
					<ShowUpdates size="s" />
				</IconBtn>
			</div>
			<div class={s.btnWrapper}>
				<OutsideClick
					onClick={() => setFilterVisible(false)}
					class={s.filterBtnWrapper}
				>
					<IconBtn
						title="Filter Components"
						active={filterVisible}
						onClick={() => setFilterVisible(!filterVisible)}
					>
						<FilterList />
					</IconBtn>
					{filterVisible && <FilterPopup />}
				</OutsideClick>
			</div>
			<div class={s.btnWrapper}>
				<IconBtn
					active={activeModal === "settings"}
					title="Settings"
					onClick={() => store.modal.open("settings")}
				>
					<SettingsIcon size="s" />
				</IconBtn>
			</div>
		</Actions>
	);
}

export function FilterPopup() {
	const store = useStore();
	const filters = useObserver(() => store.filter.filters.$);
	const filterDom = useObserver(() => store.filter.filterDom.$);
	const filterFragment = useObserver(() => store.filter.filterFragment.$);

	return (
		<div class={s.filter}>
			<div class={s.arrowFix} />
			<form onSubmit={e => e.preventDefault()}>
				{/* Native filters */}
				<label class={s.filterRow}>
					<span class={s.filterCheck}>
						<input
							type="checkbox"
							checked={filterFragment}
							onInput={e =>
								store.filter.setEnabled("fragment", (e.target as any).checked)
							}
						/>
						{filterFragment ? <CheckboxChecked /> : <CheckboxUnChecked />}
					</span>
					<span class={s.filterValue}>Fragments</span>
				</label>
				<label class={s.filterRow}>
					<span class={s.filterCheck}>
						<input
							type="checkbox"
							checked={filterDom}
							onInput={e =>
								store.filter.setEnabled("dom", (e.target as any).checked)
							}
						/>
						{filterDom ? <CheckboxChecked /> : <CheckboxUnChecked />}
					</span>
					<span class={s.filterValue}>DOM nodes</span>
				</label>
				{/* Custom user filters */}
				{filters.map((x, i) => {
					return (
						<div key={i} class={s.filterRow}>
							<span class={s.filterCheck}>
								<input
									type="checkbox"
									checked={x.enabled}
									onInput={e =>
										store.filter.setEnabled(x, (e.target as any).checked)
									}
								/>
							</span>
							<span class={s.filterValue}>
								<input
									className={s.filterName}
									type="text"
									placeholder="MyComponent"
									value={x.value}
									onInput={e =>
										store.filter.setValue(x, (e.target as any).value)
									}
								/>
							</span>
							<span class={s.removeWrapper}>
								<IconBtn
									title="Remove filter"
									onClick={() => store.filter.remove(x)}
								>
									<Remove />
								</IconBtn>
							</span>
						</div>
					);
				})}
				<div class={s.vSep} />
				<IconBtn title="Add new filter" onClick={() => store.filter.add()}>
					<span class={s.filterCheck}>
						<AddCircle />
					</span>
					Add filter
				</IconBtn>
			</form>
		</div>
	);
}

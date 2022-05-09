import { h } from "preact";
import { useState } from "preact/hooks";
import { Actions, ActionSeparator } from "../Actions";
import { IconBtn } from "../IconBtn";
import {
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
} from "../icons";
import { useStore, useObserver } from "../../store/react-bindings";
import s from "./TreeBar.module.css";
import { useSearch } from "../../store/search";
import { OutsideClick } from "../OutsideClick";

export function TreeBar() {
	const store = useStore();
	const isPicking = useObserver(() => store.isPicking.$);
	const { value, count, selected, goPrev, goNext } = useSearch();

	const [filterVisible, setFilterVisible] = useState(false);

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
					testId="inspect-btn"
					onClick={() => {
						store.isPicking.$ = !isPicking;
						store.notify(!isPicking ? "start-picker" : "stop-picker", null);
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
					data-testid="element-search"
					placeholder="Search (text or /regex/)"
					value={value}
					onKeyDown={onKeyDown}
					onInput={e => store.search.onChange((e.target as any).value)}
				/>
				{searchActive && (
					<div class={s.searchCounter} data-testid="search-counter">
						{count > 0 ? selected + 1 : 0} | {count}
					</div>
				)}
			</div>
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
				<OutsideClick
					onClick={() => setFilterVisible(false)}
					class={s.filterBtnWrapper}
				>
					<IconBtn
						title="Filter Components"
						active={filterVisible}
						testId="filter-menu-button"
						onClick={() => setFilterVisible(!filterVisible)}
					>
						<FilterList />
					</IconBtn>
					{filterVisible && <FilterPopup />}
				</OutsideClick>
			</div>
		</Actions>
	);
}

function FilterCheck({
	checked,
	label,
	onInput,
}: {
	checked: boolean;
	onInput: (checked: boolean) => void;
	label: string;
}) {
	return (
		<label class={s.filterRow}>
			<span class={s.filterCheck}>
				<input
					type="checkbox"
					checked={checked}
					onInput={e => onInput((e.target as any).checked)}
				/>
				{checked ? <CheckboxChecked /> : <CheckboxUnChecked />}
			</span>
			<span class={s.filterValue}>{label}</span>
		</label>
	);
}

export function FilterPopup() {
	const store = useStore();
	const [filterDom, setFilterDom] = useState(store.filter.filterDom.$);
	const [filterFragment, setFilterFragment] = useState(
		store.filter.filterFragment.$,
	);
	const [filterHoc, setFilterHoc] = useState(store.filter.filterHoc.$);
	const [filterRoot, setFilterRoot] = useState(store.filter.filterRoot.$);
	const [filters, setFilters] = useState(store.filter.filters.$);

	return (
		<div class={s.filter} data-testid="filter-popup">
			<form
				onSubmit={e => {
					e.preventDefault();

					store.filter.filterDom.$ = filterDom;
					store.filter.filterFragment.$ = filterFragment;
					store.filter.filterRoot.$ = filterRoot;
					store.filter.filterHoc.$ = filterHoc;

					store.filter.filters.$ = filters;

					store.filter.submit();
				}}
			>
				{/* Native filters */}
				<FilterCheck
					label="Roots"
					onInput={checked => setFilterRoot(checked)}
					checked={filterRoot}
				/>
				<FilterCheck
					label="Fragments"
					onInput={checked => setFilterFragment(checked)}
					checked={filterFragment}
				/>
				<FilterCheck
					label="HOC-Components"
					onInput={checked => setFilterHoc(checked)}
					checked={filterHoc}
				/>
				<FilterCheck
					label="DOM nodes"
					onInput={checked => setFilterDom(checked)}
					checked={filterDom}
				/>
				{/* Custom user filters */}
				{filters.map((x, i) => {
					return (
						<div key={i} class={s.filterRow}>
							<label class={s.filterCheck}>
								<input
									type="checkbox"
									checked={x.enabled}
									onInput={e => {
										const copy = [...filters];
										copy[i].enabled = (e.target as any).checked;
										setFilters(copy);
									}}
								/>
								{x.enabled ? <CheckboxChecked /> : <CheckboxUnChecked />}
							</label>
							<span class={s.filterValue}>
								<input
									className={s.filterName}
									type="text"
									placeholder="MyComponent"
									value={x.value}
									onInput={e => {
										const copy = [...filters];
										copy[i].value = (e.target as any).value;
										setFilters(copy);
									}}
								/>
							</span>
							<span class={s.removeWrapper}>
								<IconBtn
									title="Remove filter"
									styling="secondary"
									onClick={() => {
										const idx = filters.indexOf(x);
										if (idx > -1) {
											const copy = [...filters];
											copy.splice(idx, 1);
											setFilters(copy);
										}
									}}
								>
									<Remove />
								</IconBtn>
							</span>
						</div>
					);
				})}
				<div class={s.vSep} />
				<div class={s.filterActions}>
					<IconBtn
						styling="secondary"
						title="Add new filter"
						testId="add-filter"
						onClick={() => store.filter.add()}
					>
						<span class={s.filterCheck}>
							<AddCircle />
						</span>
						Add filter
					</IconBtn>
					<button
						type="submit"
						class={s.filterSubmitBtn}
						data-testid="filter-update"
					>
						Update
					</button>
				</div>
			</form>
		</div>
	);
}

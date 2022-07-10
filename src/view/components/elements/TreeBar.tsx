import { h } from "preact";
import { useState } from "preact/hooks";
import { Actions, ActionSeparator } from "../Actions";
import { IconBtn } from "../IconBtn";
import { Icon, Picker } from "../icons";
import { useStore, useObserver } from "../../store/react-bindings";
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
			<div class="filter-btn-wrapper">
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
			<div class="search-container">
				<Icon icon="search" />
				<input
					class="search"
					type="text"
					data-testid="element-search"
					placeholder="Search (text or /regex/)"
					value={value}
					onKeyDown={onKeyDown}
					onInput={e => store.search.onChange((e.target as any).value)}
				/>
				{searchActive && (
					<div class="search-counter" data-testid="search-counter">
						{count > 0 ? selected + 1 : 0} | {count}
					</div>
				)}
			</div>
			<div class="filter-btn-wrapper">
				<IconBtn
					onClick={store.search.selectNext}
					title="Select next result"
					disabled={!searchActive}
				>
					<Icon icon="keyboard-down" />
				</IconBtn>
			</div>
			<div class="filter-btn-wrapper">
				<IconBtn
					onClick={store.search.selectPrev}
					title="Select previous result"
					disabled={!searchActive}
				>
					<Icon icon="keyboard-up" />
				</IconBtn>
			</div>
			<div class="filter-btn-wrapper">
				<IconBtn
					onClick={store.search.reset}
					title="Clear search input"
					disabled={!searchActive}
				>
					<Icon icon="close" />
				</IconBtn>
			</div>
			<ActionSeparator />
			<div class="filter-btn-wrapper">
				<OutsideClick
					onClick={() => setFilterVisible(false)}
					class="filter-btn-wrapper"
				>
					<IconBtn
						title="Filter Components"
						active={filterVisible}
						testId="filter-menu-button"
						onClick={() => setFilterVisible(!filterVisible)}
					>
						<Icon icon="filter-list" />
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
		<label class="filter-row">
			<span class="filter-check">
				<input
					type="checkbox"
					checked={checked}
					onInput={e => onInput((e.target as any).checked)}
				/>
				<Icon icon={checked ? "checkbox-checked" : "checkbox-unchecked"} />
			</span>
			<span class="filter-value">{label}</span>
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
		<div class="filter" data-testid="filter-popup">
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
						<div key={i} class="filter-row">
							<label class="filter-check">
								<input
									type="checkbox"
									checked={x.enabled}
									onInput={e => {
										const copy = [...filters];
										copy[i].enabled = (e.target as any).checked;
										setFilters(copy);
									}}
								/>
								<Icon
									icon={x.enabled ? "checkbox-checked" : "checkbox-unchecked"}
								/>
							</label>
							<span class="filter-value">
								<input
									className="filter-name"
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
							<span class="filter-remove-wrapper">
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
									<Icon icon="remove" />
								</IconBtn>
							</span>
						</div>
					);
				})}
				<div class="v-sep" />
				<div class="filter-actions">
					<IconBtn
						styling="secondary"
						title="Add new filter"
						testId="add-filter"
						onClick={() =>
							setFilters([...filters, { enabled: false, value: "" }])
						}
					>
						<span class="filter-add">
							<span class="filter-check">
								<Icon icon="add-circle" />
							</span>
							Add filter
						</span>
					</IconBtn>
					<button
						type="submit"
						class="filter-submit-btn"
						data-testid="filter-update"
					>
						Update
					</button>
				</div>
			</form>
		</div>
	);
}

export interface LinkProvider {
	openInEditor: (file: string, line: number, column: number) => Promise<void>;
	openStory: (name: string) => Promise<void>;
	getStories: () => Promise<string[]>;
}

export interface LinkProviderOptions {
	openInEditorUrl: string;
	getStoriesUrl: string;
	openStoryUrl: string;
}

export function initLinkProvider(options: LinkProviderOptions): LinkProvider {
	async function getStories() {
		try {
			const res = await fetch(options.getStoriesUrl);

			// If the request fails we assume that there is no dev server
			// present.
			if (res.ok) {
				const data = (await res.json()) as { stories?: string[] } | undefined;
				if (data && Array.isArray(data.stories)) {
					const names = data.stories.filter(s => typeof s !== "string");
					return names;
				}
			}
			return [];
		} catch (err) {
			// ignore
			return [];
		}
	}

	async function openStory(name: string) {
		const url = new URL(options.openStoryUrl);
		url.searchParams.append("name", name);
		await fetch(url);
	}

	async function openInEditor(file: string, line: number, column: number) {
		const url = new URL(options.openStoryUrl);
		url.searchParams.append("file", file);
		url.searchParams.append("line", String(line));
		url.searchParams.append("column", String(column));
		await fetch(url);
	}

	return {
		openInEditor,
		getStories,
		openStory,
	};
}

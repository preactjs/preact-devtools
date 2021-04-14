declare module "*.css" {
	const styles: Record<string, string>;
	export default styles;
}

declare module "@preact-list-versions" {
	export const preactVersions: string[];
}

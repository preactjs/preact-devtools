declare module "*.css" {
	const styles: Record<string, string>;
	export default styles;
}

interface ImportMeta {
	env: {
		DEBUG: boolean;
	};
}

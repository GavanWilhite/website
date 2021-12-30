export interface PluginOptions {
	id: string;
	docsRoot: string;
	out: string;
	docgenJsonFile: string;
	packageName: string;
	sidebar: SidebarOptions;
}

interface SidebarOptions {
	categoryLabel: string;
	position: number | null;
}

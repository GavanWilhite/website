import type { DocumentationNamespace } from '../../../types/docgen-output';
import { resolveExternalPackage } from './resolveExternalPackage';

export function resolveNamespaces(name: string, allNamespaces: DocumentationNamespace[]): string | undefined {
	const allNamespaceNames = allNamespaces.map((c) => c.name);
	const docMeta = allNamespaces.find((c) => c.name === name)?.meta;

	if (allNamespaceNames.includes(name)) {
		const externalPackage = resolveExternalPackage(docMeta);

		if (externalPackage) {
			return `../../${externalPackage}/namespace/${name.toLowerCase().replace(/\s/g, '-')}.mdx`;
		}

		return `../namespace/${name.toLowerCase().replace(/\s/g, '-')}.mdx`;
	}

	return undefined;
}

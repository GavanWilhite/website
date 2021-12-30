import type { TypeParameterParser } from 'typedoc-json-parser';

export function parseTypeParameters(typeParameters: TypeParameterParser[]): string {
	if (!typeParameters.length) return '';

	return `| Name | Type | Default |
| :---: | :---: | :---: |
${typeParameters.map(
	(typeParameter) =>
		`| ${typeParameter.name} | ${typeParameter.type?.toString() ?? 'Not provided.'} | ${typeParameter.default?.toString() ?? 'Not provided.'}`
)}`;
}

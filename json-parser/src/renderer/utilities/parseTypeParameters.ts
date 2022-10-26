import type { TypeParameterParser } from 'typedoc-json-parser';
import { parseType } from './parseType';

export function parseTypeParameters(typeParameters: TypeParameterParser[]): string {
	if (!typeParameters.length) return '';

	return `| Name | Type | Default |
| :---: | :---: | :---: |
${typeParameters.map(
	(typeParameter) =>
		`| ${typeParameter.name} | ${typeParameter.constraint ? parseType(typeParameter.constraint) : 'Not provided.'} | ${
			typeParameter.default ? parseType(typeParameter.default) : 'Not provided.'
		}`
)}`;
}

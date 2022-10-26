import type { ParameterParser } from 'typedoc-json-parser';
import { parseType } from './parseType';

export function parseParameters(parameters: ParameterParser[]): string {
	if (!parameters.length) return '';

	return `| Name | Type | Description |
| :---: | :---: | :---: | :---: |
${parameters
	.map(
		(parameter) =>
			`| ${parameter.name} | ${parseType(parameter.type).replace(/|/g, '\\|')} | ${
				parameter.comment.description ?? 'No description provided.'
			} |`
	)
	.join('\n')}`;
}

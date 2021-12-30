import { fileURLToPath } from 'node:url';
import parser from '../dist/index.js';

const docusaurusDiscordjsDocgen = parser.default;

const siteDir = new URL('../../', import.meta.url);
const generatedFilesDir = new URL('.docusaurus/', siteDir);
const outDir = new URL('build/', siteDir);
const siteConfigPath = new URL('docusaurus.config.js', siteDir);

const docgenJsonFile = new URL('data/framework.json', siteDir);
const outDocs = new URL('docs/Documentation/sapphire-framework', siteDir);

docusaurusDiscordjsDocgen(
	{
		siteDir: fileURLToPath(siteDir),
		generatedFilesDir: fileURLToPath(generatedFilesDir),
		siteConfig: {
			title: 'Sapphire',
			url: 'https://sapphirejs.dev',
			baseUrl: '/',
			onBrokenLinks: 'warn',
			onBrokenMarkdownLinks: 'warn',
			onDuplicateRoutes: 'throw',
			favicon: 'img/favicon.ico',
			tagline:
				'Sapphire is a next-gen Discord bot framework for developers of all skill levels to make the best JavaScript/TypeScript based bots possible.',
			organizationName: 'sapphiredev',
			projectName: 'framework',
			baseUrlIssueBanner: true,
			i18n: {
				defaultLocale: 'en',
				locales: ['en'],
				localeConfigs: {}
			},
			staticDirectories: ['static'],
			customFields: {},
			scripts: [],
			stylesheets: [],
			clientModules: [],
			titleDelimiter: '|',
			noIndex: false
		},
		siteConfigPath: fileURLToPath(siteConfigPath),
		outDir: fileURLToPath(outDir),
		baseUrl: '/',
		i18n: {
			defaultLocale: 'en',
			locales: ['en'],
			currentLocale: 'en',
			localeConfigs: {
				en: {
					label: 'English',
					direction: 'ltr',
					htmlLang: 'en'
				}
			}
		},
		codeTranslations: {}
	},
	{
		id: 'framework',
		docgenJsonFile: fileURLToPath(docgenJsonFile),
		out: fileURLToPath(outDocs),
		sidebar: {
			categoryLabel: '@sapphire/framework',
			position: 0
		}
	}
).loadContent();

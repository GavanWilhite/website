import { fileURLToPath } from 'node:url';
import parser from '../dist/index.js';
import { config } from 'dotenv';

config();

const docusaurusTypeDocJsonParser = parser.default;

const siteDir = new URL('../../', import.meta.url);
const generatedFilesDir = new URL('.docusaurus/', siteDir);
const outDir = new URL('build/', siteDir);
const siteConfigPath = new URL('docusaurus.config.js', siteDir);

docusaurusTypeDocJsonParser(
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
		githubContentUrl: 'https://api.github.com/repos/sapphiredev/docs/contents/docs',
		githubToken: process.env.GITHUB_TOKEN
	}
).loadContent();

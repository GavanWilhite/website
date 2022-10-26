#!/usr/bin/env node

import { docusaurusTypeDocJsonParser } from './parser';
import { config } from 'dotenv';
import { URLSearchParams } from 'node:url';

config();

await docusaurusTypeDocJsonParser({
	githubContentUrl: `https://api.github.com/repos/sapphiredev/docs/contents/docs?${new URLSearchParams({
		ref: 'migration/2022-10-26-20-23'
	})}`,
	githubToken: process.env.GITHUB_TOKEN
});

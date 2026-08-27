import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	defineConfig,
	loadEnv
} from 'vite';
import react from '@vitejs/plugin-react';

const exampleDirectory = path.dirname(fileURLToPath(import.meta.url));
const rootDirectory = path.resolve(exampleDirectory, '../..');

export default defineConfig(function ({ mode }) {
	const env = loadEnv(mode, exampleDirectory, '');

	return {
		plugins: [
			react()
		],

		resolve: {
			alias: [
				{
					find: '@qybercom/ayle/bootstrap',
					replacement: path.resolve(rootDirectory, 'dist/ayle-bootstrap.esm.js')
				},
				{
					find: '@qybercom/ayle/ayle.css',
					replacement: path.resolve(rootDirectory, 'dist/ayle.css')
				},
				{
					find: '@qybercom/ayle-react',
					replacement: path.resolve(rootDirectory, 'bindings/react/dist/index.js')
				},
				{
					find: '@qybercom/ayle',
					replacement: path.resolve(rootDirectory, 'dist/ayle.esm.js')
				}
			]
		},

		server: {
			proxy: {
				'/server': {
					target: env.AYLE_SERVER_TARGET || 'http://localhost:8000',
					changeOrigin: true
				}
			}
		}
	};
});
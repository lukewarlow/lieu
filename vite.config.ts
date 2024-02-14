import {defineConfig} from 'vite';
import { resolve }  from 'node:path';
import dtsPlugin from "vite-plugin-dts";

export default defineConfig({
	build: {
		target: 'esnext',
		modulePreload: {
			polyfill: false,
		},
		minify: false,
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			name: 'lieu',
			formats: ['es'],
		},
		rollupOptions: {
			external: ['lit-html', '@vue/reactivity'],
		}
	},
	define: { 'process.env.NODE_ENV': '"production"' },
	plugins: [dtsPlugin({rollupTypes: true})]
})

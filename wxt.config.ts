import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type WxtViteConfig } from "wxt";

export default defineConfig({
	modules: ["@wxt-dev/module-react", "@wxt-dev/auto-icons"],
	srcDir: "src",
	vite(_env) {
		return {
			plugins: [tailwindcss()],
		} as WxtViteConfig;
	},
	manifest: {
		name: "Sacmais Enhancer",
		permissions: ["storage", "tabs"],
		web_accessible_resources: [
			{
				resources: ["custom.html"],
				matches: ["*://*.sacmais.com.br/*"],
			},
		],
		action: {
			default_popup: "",
		},
		icons: {
			16: "icons/16.png",
			32: "icons/32.png",
			48: "icons/48.png",
			128: "icons/128.png",
		},
	},
	hooks: {
		"build:manifestGenerated": (_wxt, manifest) => {
			manifest.content_scripts ??= [];
			manifest.content_scripts.push({
				css: ["assets/injected.css"],
				matches: ["*://*.sacmais.com.br/*"],
			});
		},
	},
});

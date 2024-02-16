import {Plugin} from 'vite';

export default function lieuPlugin(): Plugin {
    return {
        name: 'vite:lieu',

        handleHotUpdate(ctx) {
            console.log(ctx);
        },

        async resolveId(id) {
            return null;
        },

        load(id, opt) {
            return null;
        },

        transform(code, id, opt) {
            if (!id.endsWith('.lieu')) {
                return null;
            }

            code = code.replace(/<script>([\s\S]*?)<\/script>/g, (_, group) => group);
            const css = code.match(/<style>([\s\S]*?)<\/style>/);
            if (css && css[1]) {
                code = code.replace(
                    /(defineComponent\(\{)/,
                    `$1\n    styles: [css\`${css[1]}\`],`
                );
                code = code.replace(
                    /(import\s+\{[\s\S]*?)(defineComponent)([\s\S]*?)(;)/,
                    `$1defineComponent, css$3$4`
                );

                code = code.replace(/<style>([\s\S]*?)<\/style>/g, () => '');
            }

            return code;
        },
    }
}
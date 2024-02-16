import {Plugin} from 'vite';
import MagicString from 'magic-string';

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

            const magicCode = new MagicString(code);

            const css = code.match(/<style>([\s\S]*?)<\/style>/);
            if (css && css[1]) {
                magicCode.appendRight(
                    magicCode.original.indexOf('defineComponent({') + 'defineComponent({'.length,
                    `\nstyles: [css\`${css[1]}\`],\n`
                );
                magicCode.appendRight(
                    magicCode.original.indexOf('defineComponent') + 'defineComponent'.length,
                    `, css`
                );

                magicCode.replace(/<style>([\s\S]*?)<\/style>/, () => '');
            }
            magicCode.replace('<script>', '');
            magicCode.replace('</script>', '');

            return {
                code: magicCode.toString(),
                map: magicCode.generateMap({ hires: true }),
            };
        },
    }
}
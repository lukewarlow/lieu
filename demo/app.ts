import {css, defineComponent} from "../src";
import {html} from "lit-html";
import {ref} from "@vue/reactivity";

export default defineComponent({
    name: 'BaseApp',
    setup(props, ctx) {
        const count = ref({data: 0});

        return () =>
            html`
				<div>
                    ${count.value.data}
                    <counter-wrapper .count=${count.value} />
				</div>
			`;
    }
});

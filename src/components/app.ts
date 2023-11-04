import {defineComponent} from "../utils/component";
import {html} from "lit-html";
import {ref} from "@vue/reactivity";

export default defineComponent({
	name: 'BaseApp',
	setup(props, ctx) {
		const count = ref({data: 0});

		return (classNames: string, styles: string) =>
			html`
				<div>
                    ${count.value.data}
                    <counter-wrapper .count=${count.value} />
				</div>
			`;
	}
});

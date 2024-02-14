import {defineComponent} from "../../src";
import {html} from "lit-html";

export default defineComponent({
	name: 'BaseCounter',
	encapsulate: true,
	props: {
		count: {
			type: Object,
			default: {
				data: 0
			}
		}
	},
	setup(props, ctx) {
		function increment() {
			props.count.value.data++;
		}

		function decrement() {
			props.count.value.data--;
		}

		return () => {
			return html`
                <button @click=${decrement}>Decrement</button>
                ${props.count.value.data}
                <button @click=${increment}>Increment</button>
			`;
		}
	}
});

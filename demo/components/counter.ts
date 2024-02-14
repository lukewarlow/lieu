import {defineComponent} from "../../src";
import {html} from "lit-html";
import {watch} from "@vue-reactivity/watch";

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

		watch(props.count.value, () => {
			if (props.count.value.data < 0) {
				ctx.internals.states.add('negative');
			} else {
				ctx.internals.states.delete('negative');
			}
		});

		return () => {
			return html`
                <button @click=${decrement}>Decrement</button>
                ${props.count.value.data}
                <button @click=${increment}>Increment</button>
				<style>
					@scope {
						:scope:state(negative) {
							color: red;
						}
					}
				</style>
			`;
		}
	}
});

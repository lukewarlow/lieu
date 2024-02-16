import {defineComponent} from "../../src";
import {html} from "lit-html";

export default defineComponent({
	name: 'CounterWrapper',
	props: {
		count: {
			type: Object,
			default: {
				data: 0
			}
		}
	},
	mode: 'light',
	setup(props, ctx) {
		return () => {
			return html`
                <div>
                    ${props.count.value.data}
                    <base-counter .count=${props.count.value} />
                </div>
			`;
		}
	}
});

import CounterWrapper from "./components/counter-wrapper";
import Counter from "./components/counter";
import App from "./components/app";

window.customElements.define(CounterWrapper.compName, CounterWrapper);
window.customElements.define(Counter.compName, Counter);
window.customElements.define(App.compName, App);

// TODO move these
export type TypedEvent<T> = Omit<Event, 'target'> & {
	target: T;
}

export type HTMLEvent = TypedEvent<HTMLElement>;

import CounterWrapper from "./components/counter-wrapper";
import Counter from "./components/counter";
import App from "./app";

window.customElements.define(CounterWrapper.compName, CounterWrapper);
window.customElements.define(Counter.compName, Counter);
window.customElements.define(App.compName, App);

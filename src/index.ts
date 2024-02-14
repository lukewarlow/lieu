import {effect, ReactiveEffectRunner, Ref, ref, stop} from '@vue/reactivity';
import {render, TemplateResult} from 'lit-html';
import {ConstructorType, validateProp} from './utils/props';
import {toKebabCase} from './utils/strings';
import './utils/half-light';

let currentInstance: any;

const lifecycleHooks = ['onBeforeMount', 'onMounted', 'onBeforeUpdate', 'onUpdated', 'onUnmounted'] as const;

export type LifecycleHookName = typeof lifecycleHooks[number];

export type LifecycleHook = (hook: Function) =>  void;

function createLifecycleMethod(name: LifecycleHookName): LifecycleHook {
    return (hook: Function) => {
        if (currentInstance) {
            const hooks = currentInstance._lifecycleHooks.get(name)!;
            hooks.push(hook);
            currentInstance._lifecycleHooks.set(name, hooks);
        }
    }
}

export const onBeforeMount = createLifecycleMethod('onBeforeMount');
export const onMounted = createLifecycleMethod('onMounted');
export const onBeforeUpdate = createLifecycleMethod('onBeforeUpdate');
export const onUpdated = createLifecycleMethod('onUpdated');
export const onUnmounted = createLifecycleMethod('onUnmounted');

export interface PropDefinition {
    type?: ConstructorType;
    default?: any;
    required?: boolean;
}

export type RenderFunction = (classNames: string, styles: string) => TemplateResult;

export interface ComponentDefinition {
    name: string;
    props?: {
        [name: string]: PropDefinition
    };
    mode?: 'open' | 'closed';
    encapsulate?: boolean;

    setup(props: Record<string, Ref>, ctx: SetupContext): RenderFunction;
}

export interface SetupContext {
    emit(name: string, data?: unknown): boolean;
    internals: ElementInternals;
}

export function defineComponent(definition: ComponentDefinition): CustomElementConstructor & {compName: string} {
    return class extends HTMLElement {
        static compName: string = toKebabCase(definition.name);
        readonly encapsulate: boolean = definition.encapsulate ?? false;

        static get observedAttributes() {
            return Object.keys(definition.props ?? {});
        }

        readonly #renderRoot: DocumentFragment;
        readonly #internals: ElementInternals;
        readonly #classes: string = "";

        #render: RenderFunction | null = null;
        #renderEffect: ReactiveEffectRunner | null = null;

        // Can't use JS private because of the global lifecycle hook functions
        _lifecycleHooks: Map<LifecycleHookName, Function[]> = new Map<LifecycleHookName, Function[]>();

        reactiveProps: {
            [name: string]: Ref;
        } = {};

        constructor() {
            super();

            currentInstance = this;
            lifecycleHooks.forEach((lifecycleHook) => {
                this._lifecycleHooks.set(lifecycleHook, []);
            });
            this.#renderRoot = this.attachShadow({ mode: definition.mode ?? 'open' });
            this.#classes = this.getAttribute('class') ?? '';
            this.removeAttribute('class');
            this.#internals = this.attachInternals();
            // @ts-ignore
            onBeforeMount(() => {
                if (definition.props) {
                    Object.entries(definition.props).forEach(([key, propDefinition]) => {
                        // @ts-ignore
                        const givenValue = this[key];

                        validateProp(key, givenValue, propDefinition);

                        let defaultValue = propDefinition.default;

                        if (defaultValue instanceof Function) {
                            defaultValue = defaultValue();
                        }

                        // @ts-ignore
                        this.reactiveProps[key] = ref(givenValue ?? defaultValue);
                    });
                }
                this.#render = definition.setup(this.reactiveProps, {
                    emit: this.emit.bind(this),
                    internals: this.#internals
                });
            });
        }

        connectedCallback() {
            this._lifecycleHooks.get('onBeforeMount')!.forEach(hook => hook());
            this.#renderEffect = effect(() => {
                this._lifecycleHooks.get('onBeforeUpdate')!.forEach(hook => hook());
                render(this.#render!(this.#classes, this.style.cssText), this.#renderRoot, {host: this});
                this._lifecycleHooks.get('onUpdated')!.forEach(hook => hook());
            });

            this._lifecycleHooks.get('onMounted')!.forEach(hook => hook());
        }

        disconnectedCallback() {
            if (this.#renderEffect) {
                stop(this.#renderEffect)
            }
            this._lifecycleHooks.get('onUnmounted')!.forEach(hook => hook());
        }

        attributeChangedCallback(name: string, oldValue: any, newValue: any) {
            if (this.reactiveProps[name]) {
                this.reactiveProps[name].value = newValue;
            } else {
                this.reactiveProps[name] = ref(newValue);
            }
        }

        emit(name: string, data?: unknown): boolean {
            return this.dispatchEvent(new CustomEvent(name, {
                detail: data
            }));
        }
    }
}

import {PropDefinition} from '../index';

/** All code below this point based on Vue.js code */
export function validateProp(name: string, value: unknown, prop: PropDefinition): void {
	if (prop.required && (value === undefined || value === null)) {
		console.warn(`Missing required prop: "${name}"`);
		return;
	}

	// Missing but not required
	if (!prop.required && value == null) {
		return;
	}

	if (prop.type) {
		const { valid, expectedType } = assertType(value, prop.type);

		if (!valid) {
			console.warn(`Invalid prop: type check failed for prop "${name}". Expected ${expectedType}, got ${Object.prototype.toString.call(value).slice(8, -1)} with value ${value}.`);
		}
	}
}

export type ConstructorType<T = unknown> = new (...args : unknown[]) => T;

function assertType(value: unknown, type: ConstructorType): {valid: boolean; expectedType: string;} {
	const expectedType = getType(type);
	let valid = false;
	if (['String', 'Number', 'Boolean', 'Function', 'Symbol', 'BigInt'].includes(expectedType)) {
		const actualType = typeof value;
		valid = actualType === expectedType.toLowerCase();
		if (!valid && actualType === 'object') {
			valid = value instanceof type;
		}
	} else if (expectedType === 'Object') {
		valid = (value !== null && typeof value === 'object');
	} else if (expectedType === 'Array') {
		valid = Array.isArray(value);
	} else if (expectedType === null) {
		valid = value === null;
	} else {
		valid = value instanceof type
	}

	return {
		valid,
		expectedType
	}
}

function getType(constructor: any) {
	const match = constructor && constructor.toString().match(/^\s*function (\w+)/);
	return match ? match[1] : constructor === null ? 'null' : '';
}

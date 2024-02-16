// half-light.js from https://github.com/bkardell/half-light
// See https://github.com/bkardell/half-light/blob/main/LICENSE

// @ts-nocheck
let targetedStyles;
const openStylableElements = new Set();
const __alreadyAdopted = new WeakMap();

function processSheet(rules, where="*") {
    [...rules].forEach((rule) => {
        targetedStyles[where] = targetedStyles[where] || [];
        targetedStyles[where].push(rule.cssText);
    });
}

function parseMQ(condition) {
    let f = condition.match(/--crossroot\(?([^)]*)/);
    return {
        isCrossRoot: condition === "--crossroot" || f,
        where: f && f.length == 2 && f[1].trim() ? f[1] : "*"
    }
}

function refreshTargetedStyles() {
    targetedStyles = {};
    [...document.styleSheets].forEach((sheet) => {
        if (!sheet.ownerNode.matches("head > *")) return;

        let sheetMQResult = parseMQ(sheet.media.mediaText);
        if (sheetMQResult.isCrossRoot) {
            processSheet(sheet.cssRules, sheetMQResult.where)
        }
        [...sheet.cssRules].forEach((rule) => {
            let name = rule.constructor.name;
            let cond = rule.conditionText || "";
            let mqResult = parseMQ(cond);
            if (name === "CSSMediaRule" && mqResult.isCrossRoot) {
                processSheet(rule.cssRules, mqResult.where)
            }
        });
    });
    Object.keys(targetedStyles).forEach((where) => {
        let sheet = new CSSStyleSheet();
        sheet.insertRule(
            "@layer --crossroot {" + targetedStyles[where].join("\n") + "}"
        );
        targetedStyles[where] = sheet;
    });
}

function clearStyles(element) {
    element.shadowRoot.adoptedStyleSheets = [];
    __alreadyAdopted.get(element).forEach((s) => {
        element.shadowRoot.adoptedStyleSheets.push(s);
    });
}

function setStyles(element) {
    for (let selector in targetedStyles) {
        if (element.matches(selector)) {
            element.shadowRoot.adoptedStyleSheets.push(targetedStyles[selector]);
        }
    }
}

const init = () => {
    refreshTargetedStyles();
    for (const element of openStylableElements) {
        clearStyles(element);
        setStyles(element);
    }
}

const observer = new MutationObserver(init);

export function initialiseHalfLight() {
    requestAnimationFrame(() => {
        init()
        observer.observe(document.head, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
        });
    });
}

export function adopt(element: HTMLElement) {
    openStylableElements.add(element);
    Promise.resolve().then(() => {
        __alreadyAdopted.set(
            element,
            Array.from(element.shadowRoot!.adoptedStyleSheets)
        );
        setStyles(element);
    });
}
export default function css(strings: TemplateStringsArray, ...values: any[]) {
    const result = new CSSStyleSheet();
    result.replaceSync(String.raw(strings, ...values));
    return result;
}
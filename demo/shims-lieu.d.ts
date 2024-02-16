declare module "*.lieu" {
    const comp: CustomElementConstructor & {compName: string};
    export default comp;
}
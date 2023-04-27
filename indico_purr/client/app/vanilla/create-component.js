export default function CreateComponent(Component) {
    customElements.define(Component.name, class ReactiveElement extends HTMLElement {
        connectedCallback() {

            

            // Get element's props
            const props = {}
            Array.from(this.attributes).forEach(
                attr => (props[attr.nodeName] = attr.nodeValue)
            )

            let setup = false;

            // Attach helper methods to state
            let state = Object.create({
                _elem: this,
                _find: sel => this.querySelector(sel),
                _on: (sel, ev, cb) => {
                    const el = this.querySelector(sel)
                    if (el) {
                        el.removeEventListener(ev, cb)
                        el.addEventListener(ev, cb)
                    }
                },
                _slot: this.innerHTML
            })

            // Add proxy to state and watch for changes
            state = new Proxy(state, {
                set: (obj, prop, value) => {
                    const result = Reflect.set(obj, prop, value)
                    if (setup) renderElement()
                    return result
                }
            })

            const template = ejs.compile(
                Component.render.call(state, props)
            )

            // Render to body method
            let rendering = false
            const renderElement = () => {
                if (rendering === false) {
                    rendering = true
                    // console.log(state)
                    this.innerHTML = template(state);
                    // Component.render.call(state, props)
                    Component.run.call(state, props)
                    rendering = false
                }
            }

            // Call setup, then render
            Component.setup.call(state, props)
            setup = true
            renderElement()
        }
    })
}

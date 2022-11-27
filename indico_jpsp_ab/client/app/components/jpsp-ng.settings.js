import { h } from 'vue'

export default {
    data() {
        return { count: 0 }
    },
    methods: {
        increment() {
            this.count++
        }
    },
    mounted() {
        // `this` refers to the component instance.
        //console.log(this.count) // => 1

        // data can be mutated as well
        this.count = 2
    },
    render() {
        return [
            h('div', {
                class: 'action-box',
            }, [
                h('div', {
                    class: 'section',
                }, [
                    h('span', {
                        class: 'icon icon-link'
                    }),
                    h('div', {
                        class: "text"
                    }, [
                        h('div', {
                            class: 'label'
                        }, [
                            'Plugin connected'
                        ]),
                        h('div', {
                            class: 'description'
                        }, [
                            'http://127.0.0.1:8000/api'
                        ]),
                    ])
                ])
            ])
        ]
    }
}

/*
h('button', {
    onClick: () => this.increment()
}, this.count)

    < div class="action-box" >
        <div class="section">
            <span class="icon icon-link"></span>
            <div class="text">
                <div class="label">

                    Plugin connected</div>

                <div class="description">

                    http://127.0.0.1:8000/api

                </div>
            </div>
            <div class="toolbar">



                <button class="jpsp i-button info icon-settings" title="Settings" data-href="/event/12/manage/jpsp_ab/jpsp-settings" data-title="JPSP-NG - Settings" data-ajax-dialog=""></button>

                <button class="jpsp i-button danger icon-cross" title="Disconnect" data-href="/event/12/manage/jpsp_ab/jpsp-disconnect" data-title="JPSP-NG - Disconnect" data-reload-after="" data-ajax-dialog="">
                    Disconnect
                </button>



            </div>
        </div>
        </div >*/
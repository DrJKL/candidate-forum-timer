import {allCandidates} from './candidates';

import Vue from 'vue/dist/vue.js';

var example1 = new Vue({
    el: 'main',
    data: {
        allCandidates,
    },
})
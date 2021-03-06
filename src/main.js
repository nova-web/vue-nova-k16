import Vue from 'vue';
import router from './router';
import ElementUI from 'element-ui';
import VueI18n from 'vue-i18n';
import Locales from './locale';
import store from './store';
import 'element-ui/lib/theme-chalk/index.css'; // 默认主题
import App from './App';
// import '../static/css/theme-green/index.css';       // 浅绿色主题
import 'babel-polyfill';
import components from './components/common/index'; // 加载公共组件
// require('!style-loader!css-loader!less-loader!./style/index.less');
import { serialize, getLoc, setLoc, getSen, setSen, clearKey } from './utils';

// mock.js实现假接口
if (window.htp.mock) {
    require('./mock');
}

Vue.use(ElementUI, { size: 'small' });
Vue.use(VueI18n);

// 导入组件
Object.keys(components).forEach(key => {
    var name = key.replace(/(\w)/, v => v.toUpperCase()); //首字母大写
    Vue.component(`v${name}`, components[key]);
});

// 国际化
// let locale = window.Android.getLanguage() ? 'zh' : 'en';
// store.commit('setLang', locale);

const messages = Object.create(null);
Object.keys(Locales).forEach(local => {
    messages[local] = {
        ...Locales[local]
    };
});
const i18n = new VueI18n({
    locale: store.state.lang,
    messages
});

let count = 0;
setInterval(() => {
    count++;
    store.commit('setCount', count % 2);
    if (count % 2 && getSen('_')) {
        if (store.getters.getCommon.Switch) {
            readPolling(count);
        }
    }
}, 1000);

new Vue({
    router,
    i18n,
    store,
    render: h => h(App)
}).$mount('#app');

// 轮训常规接口
function readPolling(count) {
    console.log('----发送常规请求----');
    let command = getSen('_');
    store
        .dispatch('ajax', {
            name: 'url',
            data: {
                RW: '0',
                DevID: '0',
                DP_Sta: '0',
                HDMI_Sta: '0',
                SDI1_Sta: '0',
                SDI2_Sta: '0',
                DVI1_Sta: '0',
                DVI2_Sta: '0',
                DVI3_Sta: '0',
                DVI4_Sta: '0',
                // DVI_Mosaic_Sta: '0',
                BKG_Sta: '0',
                FRZ_Sta: '0',
                BLACK_Sta: '0',
                Account: '0',
                _: command
            }
        })
        .then(res => {
            // res { "DP_Sta":0, "HDMI_Sta":0, "SDI1_Sta":0, "SDI2_Sta":0, "DVI1_Sta":0, "DVI2_Sta":0, "DVI3_Sta":0, "DVI4_Sta":0, "DVI_Mosaic_Sta":0, "BKG_Sta":0, "FRZ_Sta":0, "BLACK_Sta":0, "Account":0000, "ERRC": 0}
            let account = getSen('_');
            if (account == res.Account) {
                store.commit('setCommon', { ...res });
            } else {
                ElementUI.Message('您的账号已被其他人登录，请重新登录');
                clearKey('_');
                router.push('/login');
            }
        });
}

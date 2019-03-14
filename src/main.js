//  temporary stubs required for Vue. These will not be required as soon as the XD environment provides setTimeout/clearTimeout
global.setTimeout = function (fn) {
  fn()
}
global.clearTimeout = function () {};

const styles = require("./style.css");
const Vue = require("vue").default;
const axios = require("axios").default;
const hello = require("./index.vue").default;

const {
  Text,
  Color
} = require("scenegraph");

let dialog;

function getDialog() {
  if (dialog == null) {
    document.body.innerHTML = `<dialog><div id="container"></div></dialog>`
    dialog = document.querySelector("dialog");
    var app4 = new Vue({
      el: "#container",
      components: {
        hello
      },
      methods: {
        getSimple() {
          const icons = [];
          axios.get('https://gitcdn.xyz/repo/simple-icons/simple-icons/develop/_data/simple-icons.json').then((res)=>{
            icons = res.data.icons;
            console.log('from main.js --- ', icons)
          }).catch((error)=>{
            console.log(error)
          })
        },
      },
      render(h) {
        return h(hello, {
          props: {
            dialog
          }
        })
      }
    })
  }
  return dialog
}

module.exports.commands = {
  menuCommand: function () {
    getDialog().showModal();
  } 
};
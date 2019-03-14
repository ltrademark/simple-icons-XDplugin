<template>
  <form id="dialog" method="dialog">
    <div class="icon-search">
      <input type="text" placeholder="Search for a Brand" v-model="isearch">
    </div>
    <p>
      <small><i>{{ icons.length }} brands loaded</i></small>
    </p>
    <div class="icon-grid">
      <div class="icon-grid--item" 
          :class="{'selected' : idx === selectedIcon}"
          v-for="(icon, idx) in filteredIcons" 
          :style="'background-color: #' + icon.hex" 
          :key="idx"
          @click="selectIcon(idx)">
        <a :href="icon.title | svgname" :download="icon.title | svgname | sanitizeURL" :style="$options.filters.contrast(icon.hex) === 'color: #ffffff' ? 'filter: invert(1)' : ''" target="_blank">
          <img :src="icon.title | svgname" :alt="icon.title">
        </a>
        <h3 :style="icon.hex | contrast">{{ icon.title }}</h3>
        <p :style="icon.hex | contrast">#{{ icon.hex }}</p>
      </div>
    </div>
    <p>Data Courtesy of <a href="https://simpleicons.org/" target="_blank">https://simpleicons.org/</a>.</p>
    <transition name="popup" mode="in-out">
      <selection-banner :selected="selectedIcon" :copy-action="copyToClipboard('#'+ icons[selectedIcon].hex)" v-if="selectedIcon !== null"></selection-banner>
    </transition>
    <transition name="popup" mode="in-out">
      <div class="notification-toast copied" v-if="copied2Clipboard">
        <div class="bubble">
          <p>Copied to clipoard!</p>
        </div>
      </div>
    </transition>
    <footer>
      <button uxp-variant="primary" v-on:click="close" type="submit">Done</button>
    </footer>
  </form>
</template>

<script>
module.exports = {
  props: {
    dialog: {
      type: Object
    }
  },
  data() {
    return {
      reactive: true,
      icons: [],
      selectedIcon: null,
      isearch: '',
      copied2Clipboard: false,
    };
  },
  filters: {
		contrast(hex){
			let threshold = 130;
			let contrastcolor;
			
			function hexToR(h) {
				return parseInt((cutHex(h)).substring(0,2),16)
			}
			function hexToG(h) {
				return parseInt((cutHex(h)).substring(2,4),16)
			}
			function hexToB(h) {
				return parseInt((cutHex(h)).substring(4,6),16)
			}
			function cutHex(h) {
				return (h.charAt(0)=="#") ? h.substring(1,7):h
			}
			
			let hRed = hexToR(hex);
			let hGreen = hexToG(hex);
			let hBlue = hexToB(hex);

			let cBrightness = ((hRed * 299) + (hGreen * 587) + (hBlue * 114)) / 1000;
			
			if (cBrightness > threshold){
				contrastcolor = "#000000";
			} else { 
				contrastcolor = "#ffffff";
			}	
			
			return 'color: ' + contrastcolor.toString();
		},
		svgname(icon) {
			let newName,
					hasSpace = icon.indexOf(' ') > -1,
					hasAmp = icon.indexOf('&') > -1,
					hasExcl = icon.indexOf('!') > -1,
					hasPeriod = icon.indexOf('.') > -1,
					periodIsFirst = icon.indexOf('.') === 0;
			let url = 'https://gitcdn.xyz/repo/simple-icons/simple-icons/develop/icons/';
			
			if(hasSpace) {
				return url + icon.toLowerCase().replace(/\s/g,'') + '.svg';
			} else if(hasAmp) {
				return url + icon.toLowerCase().replace('&', '-and-') + '.svg';
			} else if(hasExcl) {
				return url + icon.toLowerCase().replace('!', '') + '.svg';
			} else if(hasPeriod) {
				if(periodIsFirst) {
					return url + icon.toLowerCase().replace('.', 'dot-') + '.svg';
				} else {
					return url + icon.toLowerCase().replace('.', '-dot-') + '.svg';
				}
			} else {
				return url + icon.toLowerCase() + '.svg'
			}
		},
		sanitizeURL(url) {
			return url.slice(url.lastIndexOf('/')+1, url.length);
		}
	},
	computed: {
    filteredIcons() {
			let searchTerm = this.isearch;

      return this.icons.filter((color)=> {
        let parts = searchTerm.trim().split(" ");

        for(let part of parts) {
          let searchRegex = new RegExp(part, 'i');

          if(!(
            searchRegex.test(color.title) ||
            searchRegex.test(color.hex) ||
            searchRegex.test(color.source)
          )) {
            return false;
          }
        }

        return true;
      });
    }
  },
	methods: {
		getSimple() {
			axios.get('https://gitcdn.xyz/repo/simple-icons/simple-icons/develop/_data/simple-icons.json').then((res)=>{
        this.icons = res.data.icons;
			}).catch((error)=>{
				console.log(error)
			})
		},
		copyToClipboard(str) {
			let el = document.createElement('textarea');
			el.value = str;
			document.body.appendChild(el);
			el.select();
			document.execCommand('copy');
			document.body.removeChild(el);
			this.copied2Clipboard = true;
			setTimeout(()=>{
				this.copied2Clipboard = false;
			}, 3000)
		},
		sortByColour() {
			// http://jsfiddle.net/ef51xk3y/
			this.icons.sort((a, b)=> {
				console.log(a.hex, b.hex, a.hex - b.hex);
				return a.hex - b.hex;
			});
		},
		selectIcon(idx) {
			this.selectedIcon = this.selectedIcon !== null ? null : idx
		}
	},
	mounted() {
		// initiated the document
    // this.getSimple();
    this.$parent.getSimple();
    console.log('inherited from parent', icons)
	},
	components: {
		'selection-banner': {
			props: ['selected', 'copyAction'],
			template: `
		<div class="notification-toast selection">
			<div class="bubble">
				<div>{{ this.$parent.icons[selected].title }}</div>
				<button class="btn-primary" type="button" @click="copyAction">Copy Color Hex</button>
			</div>
		</div>
			`
		}
	}
};
</script>
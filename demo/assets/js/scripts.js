// scrollTo
var topNav = document.getElementById('topnav'),
		sideLinks = Array.from(topNav.getElementsByTagName("A")),
		scrollTarget = /(EDGE|Mac)/i.test(navigator.userAgent) ? document.body : document.documentElement;

sideLinks.map(function(x,i) {
	x.addEventListener('click', function(e) {
		var hrefAttr = x.getAttribute('href'),
				target = /#/.test(hrefAttr) ? document.getElementById(hrefAttr.replace('#', '')) : 0,
				scrollTop;
		e.preventDefault();
		if (target){
			scrollTop = target.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop);
			scrollTop = scrollTop < 50 || i === 0 ? 0 : scrollTop - 50;
			scrollTarget.scrollTop = scrollTop;
		}
	})
})


var tooltips = Array.from(document.querySelectorAll('[data-toggle="tooltip"]'));
tooltips.map(function(x){new Tooltip(x)})

// navbar
var navbar = document.querySelector('.navbar-wrapper'), scrollTimer = null,
    mouseHover = ('onmouseleave' in document) ? [ 'mouseenter', 'mouseleave'] : [ 'mouseover', 'mouseout' ];

if (!navbar.classList) console.error('classList polyfill required');
navbar.style.backfaceVisibility = 'hidden';
navbar.style.transition = 'background 0.5s linear 0s';
navbar.style.WebkitTransition = 'background 0.5s linear 0s';
navbar.style.msTransition = 'background 0.5s linear 0s';

function setStuffOnLoad(){
	loadCarouselMedia()
	setNavbarOpacity()
}

var SpicrMainDemo = document.getElementById('SpicrMainDemo');

function initMainSpicr(){
	new Spicr(SpicrMainDemo);
}

function loadCarouselMedia(){
	new dll(SpicrMainDemo,initMainSpicr)
}

function setNavbarOpacity(){
  if (navbar.classList.contains('HOVER')) return;
	clearTimeout(scrollTimer);
	scrollTimer = !navbar.classList.contains('HOVER') ? setTimeout(function(){
		if ( (window.pageYOffset || document.documentElement.scrollTop) < 600 ){
      // navbar.style.opacity = 1
      navbar.style.background = 'rgba(255,255,255,0.1)'
		} else {
      // navbar.style.opacity = 0.7
				navbar.style.background = 'rgba(0,0,0,.33)'
		}
	},50) : function() {return false;}
}

function setNavbarOpacityOnEnter(){
	clearTimeout(scrollTimer);
	scrollTimer = setTimeout(function(){
		if (!navbar.classList.contains('HOVER')) {
			navbar.classList.add('HOVER');
			// if ( (window.pageYOffset || document.documentElement.scrollTop) > 500 ){
        // navbar.style.opacity = 1
				navbar.style.background = 'rgba(0,0,0,.8)'
			// }
		}
	},0)
}

function setNavbarOpacityOnLeave(){
	clearTimeout(scrollTimer);
	scrollTimer = setTimeout(function(){
		if (navbar.classList.contains('HOVER')) {
			navbar.classList.remove('HOVER');
			if ( (window.pageYOffset || document.documentElement.scrollTop) > 500 ){
				// navbar.style.opacity = 0.7
				navbar.style.background = 'rgba(0,0,0,0.33)'
			} else {
				navbar.style.background = 'rgba(255,255,255,0.1)'
      }
		}
	},0)
}

document.addEventListener('DOMContentLoaded', function loadWrapper(){
	setStuffOnLoad();
	document.removeEventListener('DOMContentLoaded', loadWrapper, false)
}, false);
window.addEventListener('scroll', setNavbarOpacity, false);
navbar.addEventListener(mouseHover[0],setNavbarOpacityOnEnter,false);
navbar.addEventListener(mouseHover[1],setNavbarOpacityOnLeave,false);
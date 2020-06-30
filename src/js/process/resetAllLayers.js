export default function(element) {
  Array.from(element.getElementsByClassName('spicr-layer')).map(x=>{ 
    x.style.opacity = ''
    x.style.transform = '' 
    x.style.transformOrigin = '' 
  })
}
export default function setRem(baseWidth = 750) {
    const dpr = window.devicePixelRatio;
    const currentWidth = document.documentElement.clientWidth || document.body.clientWidth;
    let remSize = 0;
    let scale = 0;
    scale = currentWidth / baseWidth;
    remSize = baseWidth / 15;   //50
    remSize = remSize * scale;  //(750/15)*(600/750=0.8)
    if(remSize<37.5){remSize=37.5}
    document.documentElement.style.fontSize = remSize + 'px';
    document.documentElement.setAttribute('data-dpr', `${dpr}`);
  }

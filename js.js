const adjBtn = document.querySelectorAll(`.adj`);
const closeAdjBtn = document.querySelectorAll(`.cl-adj`);
const lockBtn = document.querySelectorAll(`.lock`);
const slidersCon = document.querySelectorAll(`.sliders`);
const sliders = document.querySelectorAll(`input[type="range"]`);
const cuColor = document.querySelectorAll(`.color`);
const cuHexes = document.querySelectorAll(`.color h2`);
const popup = document.querySelector(`.copy-con`);
let initialColors;
let savedPalettes = [];
// event
sliders.forEach(slider => {
  slider.addEventListener(`input`, hslControls);
});
cuColor.forEach((div, index) => {
  div.addEventListener(`change`, () => {
    updateTextUI(index);
  });
});
cuHexes.forEach(hex => {
  hex.addEventListener(`click`, () => {
    copyToclip(hex);
  });
});
popup.addEventListener(`transitionend`, () => {
  const popupBox = popup.children[0];
  popupBox.classList.remove(`active`);
  popup.classList.remove(`active`);
});
adjBtn.forEach((button, index) => {
  button.addEventListener(`click`, () => {
    openAdjPanel(index);
  });
});
closeAdjBtn.forEach((button, index) => {
  button.addEventListener(`click`, () => {
    closeAdjPanel(index);
  });
});
lockBtn.forEach((button, index) => {
  button.addEventListener(`click`, e => {
    lockLayer(e, index);
  });
});
// fun
function genHex() {
  const hexColor = chroma.random();
  return hexColor;
}
function randomColors() {
  initialColors = [];
  cuColor.forEach((div, index) => {
    const randCol = genHex();
    const hexText = div.children[0];
    if (div.classList.contains(`locked`)) {
      initialColors.push(hexText.innerText);
      return;
    } else {
      initialColors.push(chroma(randCol).hex());
    }
    div.style.backgroundColor = randCol;
    hexText.innerText = randCol;
    checkTextContrast(randCol, hexText);
    const color = chroma(randCol);
    const sliders = div.querySelectorAll(`.sliders input`);
    const hue = sliders[0];
    const saturation = sliders[1];
    const brightness = sliders[2];
    colorizeSliders(color, hue, saturation, brightness);
    cuColor[index].style.backgroundColor = color;
  });
  resetInput();
  adjBtn.forEach((button, index) => {
    checkTextContrast(initialColors[index], button);
    checkTextContrast(initialColors[index], lockBtn[index]);
  });
}
function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    text.style.color = `black`;
  } else {
    text.style.color = `white`;
  }
}
function colorizeSliders(color, hue, saturation, brightness) {
  const noSat = color.set(`hsl.s`, 0);
  const fullSat = color.set(`hsl.s`, 1);
  const scaleSat = chroma.scale([noSat, color, fullSat]);
  const midBright = color.set(`hsl.l`, 0.5);
  const scaleBright = chroma.scale([`white`, midBright, `black`]);
  saturation.style.backgroundImage = `linear-gradient(to right,${scaleSat(
    0
  )},${scaleSat(1)})`;
  brightness.style.backgroundImage = `linear-gradient(to right,${scaleBright(
    0
  )},${scaleBright(0.5)},${scaleBright(1)})`;
  hue.style.backgroundImage = `linear-gradient(to right,rgb(204,204,204),rgb(75,204,204),rgb(204,75,204),rgb(204,204,75),rgb(75,75,204),rgb(75,204,75),rgb(204,75,75),rgb(75,75,75))`;
}
function resetInput() {
  const sliders = document.querySelectorAll(`.sliders input`);
  sliders.forEach(slider => {
    if (slider.name === `hue`) {
      const hueColor = initialColors[slider.getAttribute(`data-hue`)];
      const hueValue = chroma(hueColor).hsl()[0];
      slider.value = Math.floor(hueValue);
    }
    if (slider.name === `saturation`) {
      const satColor = initialColors[slider.getAttribute(`data-sat`)];
      const satValue = chroma(satColor).hsl()[0];
      slider.value = Math.floor(satValue * 100) / 100;
    }
    if (slider.name === `brightness`) {
      const brightColor = initialColors[slider.getAttribute(`data-bright`)];
      const brightValue = chroma(brightColor).hsl()[0];
      slider.value = Math.floor(brightValue * 100) / 100;
    }
  });
}
function hslControls(e) {
  let index =
    e.target.getAttribute(`data-hue`) ||
    e.target.getAttribute(`data-sat`) ||
    e.target.getAttribute(`data-bright`);
  let sliders = e.target.parentElement.querySelectorAll(`input[type="range"]`);
  const hue = sliders[0];
  const saturation = sliders[1];
  const brightness = sliders[2];
  const bgColor = initialColors[index];
  let color = chroma(bgColor)
    .set(`hsl.h`, hue.value)
    .set(`hsl.s`, saturation.value)
    .set(`hsl.l`, brightness.value);
  colorizeSliders(color, hue, saturation, brightness);
  cuColor[index].style.backgroundColor = color;
}
function updateTextUI(index) {
  const actDiv = cuColor[index];
  const color = chroma(actDiv.style.backgroundColor);
  const hexText = actDiv.querySelector(`h2`);
  const icons = actDiv.querySelectorAll(`.con button`);
  hexText.innerText = color.hex();
  checkTextContrast(color, hexText);
  for (icon of icons) {
    checkTextContrast(color, icon);
  }
}
function copyToclip(hex) {
  const el = document.createElement(`textarea`);
  el.value = hex.innerText;
  document.body.appendChild(el);
  el.select();
  document.execCommand(`copy`);
  document.body.removeChild(el);
  const popupBox = popup.children[0];
  popupBox.classList.add(`active`);
  popup.classList.add(`active`);
}
function openAdjPanel(index) {
  slidersCon[index].classList.toggle(`active`);
}
function closeAdjPanel(index) {
  slidersCon[index].classList.remove(`active`);
}
function lockLayer(e, index) {
  const lockSVG = e.target.children[0];
  const actBg = cuColor[index];
  actBg.classList.toggle(`locked`);
  if (lockSVG.classList.contains(`fa-lock-open`)) {
    e.target.innerHTML = `<i class="fas fa-lock"></i>`;
  } else {
    e.target.innerHTML = `<i class="fas fa-lock-open"></i>`;
  }
}
const saveCon = document.querySelector(`.save-con`);
const libCon = document.querySelector(`.lib-con`);
const saveInput = document.querySelector(`.name`);
function openPalette(e) {
  const popup = saveCon.children[0];
  saveCon.classList.add(`active`);
  popup.classList.add(`active`);
}
function closePalette(e) {
  const popup = saveCon.children[0];
  saveCon.classList.remove(`active`);
  popup.classList.remove(`active`);
}
function savePalette(e) {
  saveCon.classList.remove(`active`);
  popup.classList.remove(`active`);
  const name = saveInput.value;
  const colors = [];
  cuHexes.forEach(hex => {
    colors.push(hex.innerText);
  });
  let paletteNr;
  const paletteObjs = JSON.parse(localStorage.getItem(`palettes`));
  if (paletteObjs) {
    paletteNr = paletteObjs.length;
  } else {
    paletteNr = savedPalettes.length;
  }
  const paletteObj = { name, colors, nr: paletteNr };
  savedPalettes.push(paletteObj);
  saveTolocal(paletteObj);
  saveInput.value = ``;
  const palette = document.createElement(`div`);
  palette.classList.add(`big`);
  const title = document.createElement(`h3`);
  title.innerText = paletteObj.name;
  const preview = document.createElement(`div`);
  preview.classList.add(`small`);
  paletteObj.colors.forEach(color => {
    const nDiv = document.createElement(`div`);
    nDiv.style.backgroundColor = color;
    preview.appendChild(nDiv);
  });
  const paBtn = document.createElement(`button`);
  paBtn.classList.add(`pick`);
  paBtn.classList.add(paletteObj.nr);
  paBtn.innerText = `Select`;
  paBtn.addEventListener(`click`, e => {
    closeLib();
    initialColors = [];
    const paIndex = e.target.classList[1];
    savedPalettes[paIndex].colors.forEach((color, index) => {
      cuColor[index].style.backgroundColor = color;
      const text = cuColor[index].children[0];
      checkTextContrast(color, text);
      updateTextUI(index);
    });
    resetInput();
  });
  palette.appendChild(preview);
  palette.appendChild(paBtn);
  palette.appendChild(title);
  libCon.children[0].appendChild(palette);
}
function openLib() {
  const popup = libCon.children[0];
  libCon.classList.add(`active`);
  popup.classList.add(`active`);
}
function closeLib() {
  const popup = libCon.children[0];
  libCon.classList.remove(`active`);
  popup.classList.remove(`active`);
}
function saveTolocal(paletteObj) {
  let palettes;
  if (localStorage.getItem(`palettes`) === null) {
    palettes = [];
  } else palettes = JSON.parse(localStorage.getItem(`palettes`));
  palettes.push(paletteObj);
  localStorage.setItem(`palettes`, JSON.stringify(palettes));
}
function getLocal() {
  if (localStorage.getItem(`palettes`) === null) {
    palettes = [];
  } else {
    const paletteObjs = JSON.parse(localStorage.getItem(`palettes`));
    savedPalettes = [...paletteObjs];
    paletteObjs.forEach(paletteObj => {
      const palette = document.createElement(`div`);
      palette.classList.add(`big`);
      const title = document.createElement(`h3`);
      title.innerText = paletteObj.name;
      const preview = document.createElement(`div`);
      preview.classList.add(`small`);
      paletteObj.colors.forEach(color => {
        const nDiv = document.createElement(`div`);
        nDiv.style.backgroundColor = color;
        preview.appendChild(nDiv);
      });
      const paBtn = document.createElement(`button`);
      paBtn.classList.add(`pick`);
      paBtn.classList.add(paletteObj.nr);
      paBtn.innerText = `Select`;
      paBtn.addEventListener(`click`, e => {
        closeLib();
        initialColors = [];
        const paIndex = e.target.classList[1];
        paletteObjs[paIndex].colors.forEach((color, index) => {
          cuColor[index].style.backgroundColor = color;
          const text = cuColor[index].children[0];
          checkTextContrast(color, text);
          updateTextUI(index);
        });
        resetInput();
      });
      palette.appendChild(preview);
      palette.appendChild(paBtn);
      palette.appendChild(title);
      libCon.children[0].appendChild(palette);
    });
  }
}
getLocal();
randomColors();

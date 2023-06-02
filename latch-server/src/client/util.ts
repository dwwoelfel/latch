import {Tuple} from '@mantine/core';

function shadeColor(color: string, percent: number) {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = Math.floor((R * (100 + percent)) / 100);
  G = Math.floor((G * (100 + percent)) / 100);
  B = Math.floor((B * (100 + percent)) / 100);

  R = R < 255 ? R : 255;
  G = G < 255 ? G : 255;
  B = B < 255 ? B : 255;

  const RR = R.toString(16).length == 1 ? '0' + R.toString(16) : R.toString(16);
  const GG = G.toString(16).length == 1 ? '0' + G.toString(16) : G.toString(16);
  const BB = B.toString(16).length == 1 ? '0' + B.toString(16) : B.toString(16);

  return '#' + RR + GG + BB;
}

export function shades(color: string): Tuple<string, 10> {
  return [
    shadeColor(color, -50),
    shadeColor(color, -40),
    shadeColor(color, -30),
    shadeColor(color, -20),
    shadeColor(color, -10),
    color,
    shadeColor(color, 10),
    shadeColor(color, 20),
    shadeColor(color, 30),
    shadeColor(color, 40),
  ];
}

export function getTextColor(bgColor: string): string {
  var R = parseInt(bgColor.substring(1, 3), 16);
  var G = parseInt(bgColor.substring(3, 5), 16);
  var B = parseInt(bgColor.substring(5, 7), 16);

  var brightness = (R * 299 + G * 587 + B * 114) / 1000;
  
  if (brightness > 127.5) {
      // The color is light, use black text color
      return "#000000";
  } else {
      // The color is dark, use white text color
      return "#ffffff";
  }
}


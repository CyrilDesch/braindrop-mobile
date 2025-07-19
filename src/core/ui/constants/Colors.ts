// Light
export const lightWhite = "rgb(250, 249, 246)";
export const lightGray = "rgba(255, 255, 255, 0.75)";
export const lightMediumGray1 = "rgb(230, 230, 230)";
export const lightMediumGray2 = "rgb(216, 216, 216)";

// Dark
export const darkBlack = "rgb(5, 5, 5)";
export const darkGray = "rgba(0, 0, 0, 0.75)";
export const darkMediumGray1 = "rgb(25, 25, 25)";
export const darkMediumGray2 = "rgb(39, 39, 39)";

// Base colors
export const white = "rgba(255, 255, 255, 1)";
export const black = "rgba(0, 0, 0, 1)";
export const red = "rgba(202, 89, 89, 1)";
export const magenta = "rgba(117, 50, 162, 0.9)";

export const Theme = {
  light: {
    text: darkBlack,
    textInverse: lightWhite,

    background: lightWhite,
    backgroundInverse: darkBlack,

    border1: lightMediumGray1,
    border2: lightMediumGray2,

    borderInverse1: darkMediumGray1,
    borderInverse2: darkMediumGray2,

    primary: magenta,
    secondary: darkGray,
    danger: red,

    white: white,
    black: black,
    transparent: "transparent",
  },
  dark: {
    text: lightWhite,
    textInverse: darkBlack,

    background: darkBlack,
    backgroundInverse: lightWhite,

    border1: darkMediumGray1,
    border2: darkMediumGray2,

    borderInverse1: lightMediumGray1,
    borderInverse2: lightMediumGray2,

    primary: magenta,
    secondary: lightGray,
    danger: red,

    white: white,
    black: black,
    transparent: "transparent",
  },
};
export type ThemedColorName = keyof typeof Theme.light &
  keyof typeof Theme.dark;

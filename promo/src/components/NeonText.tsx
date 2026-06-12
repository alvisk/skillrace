import React from "react";
import { colors, fonts, glow } from "../theme";

export const NeonText: React.FC<{
  children: React.ReactNode;
  color?: string;
  fontSize?: number;
  weight?: 500 | 700 | 900;
  intensity?: number;
  letterSpacing?: number;
  style?: React.CSSProperties;
}> = ({
  children,
  color = colors.pink,
  fontSize = 80,
  weight = 900,
  intensity = 1,
  letterSpacing = 4,
  style,
}) => (
  <div
    style={{
      fontFamily: fonts.display,
      fontSize,
      fontWeight: weight,
      color: colors.text,
      textShadow: glow(color, intensity),
      letterSpacing,
      textTransform: "uppercase",
      ...style,
    }}
  >
    {children}
  </div>
);

export const OutlineText: React.FC<{
  children: React.ReactNode;
  color?: string;
  fontSize?: number;
  letterSpacing?: number;
  style?: React.CSSProperties;
}> = ({ children, color = colors.cyan, fontSize = 80, letterSpacing = 4, style }) => (
  <div
    style={{
      fontFamily: fonts.display,
      fontSize,
      fontWeight: 900,
      color: "transparent",
      WebkitTextStroke: `2.5px ${color}`,
      textShadow: glow(color, 0.6),
      letterSpacing,
      textTransform: "uppercase",
      ...style,
    }}
  >
    {children}
  </div>
);

import React from "react";
import Svg, { Path, Circle, Rect, Line, Polyline } from "react-native-svg";

export type IconName =
  | "dumbbell"
  | "barbell"
  | "flame"
  | "trending-up"
  | "book-open"
  | "cog"
  | "user"
  | "users"
  | "shield"
  | "search"
  | "plus"
  | "check"
  | "x"
  | "trash"
  | "edit"
  | "more-vertical"
  | "chevron-down"
  | "chevron-up"
  | "chevron-right"
  | "play"
  | "video"
  | "award"
  | "activity"
  | "layers"
  | "calendar"
  | "clock"
  | "alert-triangle"
  | "info"
  | "check-circle"
  | "x-circle"
  | "log-out"
  | "eye"
  | "eye-off"
  | "wifi"
  | "sliders"
  | "filter"
  | "sparkles"
  | "target"
  | "zap"
  | "lock"
  | "mail"
  | "heart";

interface GymIconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  /** Color de relleno (p. ej. para el corazón de favoritos activo). */
  fill?: string;
}

/**
 * Librería centralizada de iconos vectoriales (basada en trazos Lucide 24x24 sobre react-native-svg).
 * Reemplaza por completo el uso de emojis para brindar una estética limpia, nítida y consistente
 * tanto en iOS, Android como Web.
 */
export function GymIcon({
  name,
  size = 20,
  color = "#10B981",
  strokeWidth = 2,
  fill,
}: GymIconProps) {
  const commonProps = {
    stroke: color,
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none" as const,
  };

  const renderPaths = () => {
    switch (name) {
      case "dumbbell":
        return (
          <>
            <Path
              {...commonProps}
              d="M14.4 14.4 9.6 9.6M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z"
            />
            <Path
              {...commonProps}
              d="m21.5 21.5-1.4-1.4M3.9 3.9 2.5 2.5M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z"
            />
          </>
        );

      case "barbell":
        return (
          <>
            <Line {...commonProps} x1="2" y1="12" x2="22" y2="12" />
            <Rect {...commonProps} x="4" y="6" width="3" height="12" rx="1" />
            <Rect {...commonProps} x="17" y="6" width="3" height="12" rx="1" />
            <Line {...commonProps} x1="2" y1="9" x2="2" y2="15" />
            <Line {...commonProps} x1="22" y1="9" x2="22" y2="15" />
          </>
        );

      case "flame":
        return (
          <Path
            {...commonProps}
            d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"
          />
        );

      case "trending-up":
        return (
          <>
            <Polyline {...commonProps} points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <Polyline {...commonProps} points="16 7 22 7 22 13" />
          </>
        );

      case "book-open":
        return (
          <>
            <Path {...commonProps} d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <Path
              {...commonProps}
              d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
            />
          </>
        );

      case "cog":
        return (
          <>
            <Circle {...commonProps} cx="12" cy="12" r="3" />
            <Path
              {...commonProps}
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
            />
          </>
        );

      case "user":
        return (
          <>
            <Path
              {...commonProps}
              d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"
            />
            <Circle {...commonProps} cx="12" cy="7" r="4" />
          </>
        );

      case "users":
        return (
          <>
            <Path
              {...commonProps}
              d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
            />
            <Circle {...commonProps} cx="9" cy="7" r="4" />
            <Path {...commonProps} d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <Path {...commonProps} d="M16 3.13a4 4 0 0 1 0 7.75" />
          </>
        );

      case "shield":
        return (
          <>
            <Path
              {...commonProps}
              d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            />
            <Path {...commonProps} d="m9 12 2 2 4-4" />
          </>
        );

      case "search":
        return (
          <>
            <Circle {...commonProps} cx="11" cy="11" r="8" />
            <Line {...commonProps} x1="21" y1="21" x2="16.65" y2="16.65" />
          </>
        );

      case "plus":
        return (
          <>
            <Line {...commonProps} x1="12" y1="5" x2="12" y2="19" />
            <Line {...commonProps} x1="5" y1="12" x2="19" y2="12" />
          </>
        );

      case "check":
        return <Polyline {...commonProps} points="20 6 9 17 4 12" />;

      case "x":
        return (
          <>
            <Line {...commonProps} x1="18" y1="6" x2="6" y2="18" />
            <Line {...commonProps} x1="6" y1="6" x2="18" y2="18" />
          </>
        );

      case "trash":
        return (
          <>
            <Polyline {...commonProps} points="3 6 5 6 21 6" />
            <Path
              {...commonProps}
              d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
            />
            <Line {...commonProps} x1="10" y1="11" x2="10" y2="17" />
            <Line {...commonProps} x1="14" y1="11" x2="14" y2="17" />
          </>
        );

      case "edit":
        return (
          <>
            <Path
              {...commonProps}
              d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
            />
            <Path
              {...commonProps}
              d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
            />
          </>
        );

      case "more-vertical":
        return (
          <>
            <Circle {...commonProps} cx="12" cy="12" r="1.2" fill={color} />
            <Circle {...commonProps} cx="12" cy="5" r="1.2" fill={color} />
            <Circle {...commonProps} cx="12" cy="19" r="1.2" fill={color} />
          </>
        );

      case "chevron-down":
        return <Polyline {...commonProps} points="6 9 12 15 18 9" />;

      case "chevron-up":
        return <Polyline {...commonProps} points="18 15 12 9 6 15" />;

      case "chevron-right":
        return <Polyline {...commonProps} points="9 18 15 12 9 6" />;

      case "play":
        return (
          <Path
            {...commonProps}
            d="m6 3 14 9-14 9V3z"
            fill={color}
            fillOpacity={0.18}
          />
        );

      case "video":
        return (
          <>
            <Path {...commonProps} d="m22 8-6 4 6 4V8Z" />
            <Rect {...commonProps} x="2" y="6" width="14" height="12" rx="2" ry="2" />
          </>
        );

      case "award":
        return (
          <>
            <Circle {...commonProps} cx="12" cy="8" r="6" />
            <Path {...commonProps} d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
          </>
        );

      case "activity":
        return <Polyline {...commonProps} points="22 12 18 12 15 21 9 3 6 12 2 12" />;

      case "layers":
        return (
          <>
            <Path {...commonProps} d="m12 2 10 5-10 5L2 7l10-5z" />
            <Path {...commonProps} d="m2 12 10 5 10-5" />
            <Path {...commonProps} d="m2 17 10 5 10-5" />
          </>
        );

      case "calendar":
        return (
          <>
            <Rect {...commonProps} x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <Line {...commonProps} x1="16" y1="2" x2="16" y2="6" />
            <Line {...commonProps} x1="8" y1="2" x2="8" y2="6" />
            <Line {...commonProps} x1="3" y1="10" x2="21" y2="10" />
          </>
        );

      case "clock":
        return (
          <>
            <Circle {...commonProps} cx="12" cy="12" r="10" />
            <Polyline {...commonProps} points="12 6 12 12 16 14" />
          </>
        );

      case "alert-triangle":
        return (
          <>
            <Path
              {...commonProps}
              d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
            />
            <Line {...commonProps} x1="12" y1="9" x2="12" y2="13" />
            <Line {...commonProps} x1="12" y1="17" x2="12.01" y2="17" />
          </>
        );

      case "info":
        return (
          <>
            <Circle {...commonProps} cx="12" cy="12" r="10" />
            <Line {...commonProps} x1="12" y1="16" x2="12" y2="12" />
            <Line {...commonProps} x1="12" y1="8" x2="12.01" y2="8" />
          </>
        );

      case "check-circle":
        return (
          <>
            <Path {...commonProps} d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <Polyline {...commonProps} points="22 4 12 14.01 9 11.01" />
          </>
        );

      case "x-circle":
        return (
          <>
            <Circle {...commonProps} cx="12" cy="12" r="10" />
            <Line {...commonProps} x1="15" y1="9" x2="9" y2="15" />
            <Line {...commonProps} x1="9" y1="9" x2="15" y2="15" />
          </>
        );

      case "log-out":
        return (
          <>
            <Path {...commonProps} d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <Polyline {...commonProps} points="16 17 21 12 16 7" />
            <Line {...commonProps} x1="21" y1="12" x2="9" y2="12" />
          </>
        );

      case "eye":
        return (
          <>
            <Path
              {...commonProps}
              d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"
            />
            <Circle {...commonProps} cx="12" cy="12" r="3" />
          </>
        );

      case "eye-off":
        return (
          <>
            <Path
              {...commonProps}
              d="M9.88 9.88a3 3 0 1 0 4.24 4.24"
            />
            <Path
              {...commonProps}
              d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"
            />
            <Path
              {...commonProps}
              d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"
            />
            <Line {...commonProps} x1="2" y1="2" x2="22" y2="22" />
          </>
        );

      case "wifi":
        return (
          <>
            <Path {...commonProps} d="M5 12.55a11 11 0 0 1 14.08 0" />
            <Path {...commonProps} d="M1.42 9a16 16 0 0 1 21.16 0" />
            <Path {...commonProps} d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <Line {...commonProps} x1="12" y1="20" x2="12.01" y2="20" />
          </>
        );

      case "sliders":
        return (
          <>
            <Line {...commonProps} x1="4" y1="21" x2="4" y2="14" />
            <Line {...commonProps} x1="4" y1="10" x2="4" y2="3" />
            <Line {...commonProps} x1="12" y1="21" x2="12" y2="12" />
            <Line {...commonProps} x1="12" y1="8" x2="12" y2="3" />
            <Line {...commonProps} x1="20" y1="21" x2="20" y2="16" />
            <Line {...commonProps} x1="20" y1="12" x2="20" y2="3" />
            <Line {...commonProps} x1="1" y1="14" x2="7" y2="14" />
            <Line {...commonProps} x1="9" y1="8" x2="15" y2="8" />
            <Line {...commonProps} x1="17" y1="16" x2="23" y2="16" />
          </>
        );

      case "filter":
        return (
          <Path {...commonProps} d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
        );

      case "sparkles":
        return (
          <>
            <Path
              {...commonProps}
              d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"
            />
            <Path {...commonProps} d="M5 3v4" />
            <Path {...commonProps} d="M19 17v4" />
            <Path {...commonProps} d="M3 5h4" />
            <Path {...commonProps} d="M17 19h4" />
          </>
        );

      case "target":
        return (
          <>
            <Circle {...commonProps} cx="12" cy="12" r="10" />
            <Circle {...commonProps} cx="12" cy="12" r="6" />
            <Circle {...commonProps} cx="12" cy="12" r="2" />
          </>
        );

      case "zap":
        return (
          <Path
            {...commonProps}
            d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"
          />
        );

      case "lock":
        return (
          <>
            <Rect {...commonProps} x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <Path {...commonProps} d="M7 11V7a5 5 0 0 1 10 0v4" />
          </>
        );

      case "mail":
        return (
          <>
            <Rect {...commonProps} x="2" y="4" width="20" height="16" rx="2" />
            <Path {...commonProps} d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </>
        );

      case "heart":
        return (
          <Path
            {...commonProps}
            fill={fill ?? "none"}
            d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
          />
        );

      default:
        return <Circle {...commonProps} cx="12" cy="12" r="8" />;
    }
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {renderPaths()}
    </Svg>
  );
}

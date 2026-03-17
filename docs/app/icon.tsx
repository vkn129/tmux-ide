import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0a0a0a",
        borderRadius: "6px",
      }}
    >
      <span
        style={{
          fontSize: "20px",
          fontWeight: "bold",
          color: "#fff",
          fontFamily: "monospace",
        }}
      >
        t
      </span>
    </div>,
    {
      ...size,
    },
  );
}

import { ImageResponse } from "@takumi-rs/image-response";

export const revalidate = false;

export async function GET() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0a0a0a",
        fontFamily: "monospace",
      }}
    >
      {/* Terminal window chrome */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "1040px",
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.1)",
          overflow: "hidden",
          backgroundColor: "#111",
        }}
      >
        {/* Title bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "14px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            backgroundColor: "#161616",
          }}
        >
          <div style={{ display: "flex", gap: "8px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: "#ff5f57",
              }}
            />
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: "#febc2e",
              }}
            />
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: "#28c840",
              }}
            />
          </div>
          <span
            style={{
              marginLeft: "16px",
              fontSize: "13px",
              color: "#666",
            }}
          >
            MY-APP IDE
          </span>
        </div>

        {/* Pane layout */}
        <div style={{ display: "flex", height: "240px", gap: "1px" }}>
          {/* Lead pane */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#0d0d0d",
              borderRight: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderBottom: "1px solid rgba(217,173,69,0.3)",
                fontSize: "12px",
              }}
            >
              <span style={{ color: "#d9ad45" }}>▸ Lead</span>
              <span
                style={{
                  fontSize: "10px",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  backgroundColor: "rgba(217,173,69,0.15)",
                  color: "#d9ad45",
                  marginLeft: "auto",
                }}
              >
                lead
              </span>
            </div>
            <div style={{ padding: "10px 14px", fontSize: "12px" }}>
              <div style={{ color: "#999" }}>{'> "Start the my-app team."'}</div>
              <div style={{ color: "#22c55e", marginTop: "4px" }}>
                ✓ Team ready — lead and teammates coordinating
              </div>
            </div>
          </div>

          {/* Teammate 1 */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#0d0d0d",
              borderRight: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                fontSize: "12px",
              }}
            >
              <span style={{ color: "#777" }}>· Frontend</span>
              <span
                style={{
                  fontSize: "10px",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  backgroundColor: "rgba(59,130,246,0.15)",
                  color: "#60a5fa",
                  marginLeft: "auto",
                }}
              >
                teammate
              </span>
            </div>
            <div style={{ padding: "10px 14px", fontSize: "12px" }}>
              <div style={{ color: "#666" }}>… teammate pane ready</div>
              <div style={{ color: "#60a5fa", marginTop: "4px", opacity: 0.7 }}>
                … components/Header.tsx
              </div>
            </div>
          </div>

          {/* Teammate 2 */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#0d0d0d",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                fontSize: "12px",
              }}
            >
              <span style={{ color: "#777" }}>· API Agent</span>
              <span
                style={{
                  fontSize: "10px",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  backgroundColor: "rgba(59,130,246,0.15)",
                  color: "#60a5fa",
                  marginLeft: "auto",
                }}
              >
                teammate
              </span>
            </div>
            <div style={{ padding: "10px 14px", fontSize: "12px" }}>
              <div style={{ color: "#666" }}>… teammate pane ready</div>
              <div style={{ color: "#60a5fa", marginTop: "4px", opacity: 0.7 }}>
                … src/api/routes/...
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: "flex",
            height: "80px",
            gap: "1px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              flex: 1,
              padding: "8px 14px",
              backgroundColor: "#0d0d0d",
              borderRight: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ fontSize: "12px", color: "#777", marginBottom: "4px" }}>· Next.js</div>
            <div style={{ fontSize: "11px", color: "#22c55e" }}>→ ready on localhost:3000</div>
          </div>
          <div
            style={{
              flex: 1,
              padding: "8px 14px",
              backgroundColor: "#0d0d0d",
            }}
          >
            <div style={{ fontSize: "12px", color: "#777", marginBottom: "4px" }}>· Shell</div>
            <div style={{ fontSize: "11px", color: "#999" }}>$</div>
          </div>
        </div>

        {/* Status bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "6px 14px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            backgroundColor: "#161616",
            fontSize: "11px",
          }}
        >
          <span style={{ color: "#d9ad45", opacity: 0.6 }}>MY-APP IDE</span>
          <span style={{ color: "#555" }}>team: my-app (3 members)</span>
        </div>
      </div>

      {/* Branding below */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "32px",
          gap: "8px",
        }}
      >
        <span
          style={{ fontSize: "42px", fontWeight: "bold", color: "#fff", letterSpacing: "-1px" }}
        >
          tmux-ide
        </span>
        <span style={{ fontSize: "16px", color: "#888" }}>Terminal IDE powered by tmux</span>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      format: "png",
    },
  );
}

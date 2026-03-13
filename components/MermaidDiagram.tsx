"use client";

import { useEffect, useState } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: false,
  look: "handDrawn",
  theme: "dark",
  themeVariables: {
    background: "#000000",
    mainBkg: "#0c0c0c",
    primaryColor: "#1e1e2e",
    primaryTextColor: "#cdd6f4",
    primaryBorderColor: "#585b70",
    lineColor: "#a6adc8",
    secondaryColor: "#181825",
    tertiaryColor: "#11111b",
    nodeBorder: "#585b70",
    clusterBkg: "#0c0c0c",
    titleColor: "#cdd6f4",
    edgeLabelBackground: "#0c0c0c",
    // Excalifont (Virgil) — falls back to system sans, never Comic Sans
    fontFamily: "'Excalifont', 'Virgil', ui-sans-serif, system-ui, sans-serif",
    fontSize: "14px",
  },
});

let counter = 0;

export function MermaidDiagram({ chart }: { chart: string }) {
  const [svg, setSvg] = useState("");

  useEffect(() => {
    const id = `mermaid-${++counter}`;
    // Wait for Excalifont to finish loading so Mermaid measures text with
    // the correct font metrics before laying out the diagram
    document.fonts.ready.then(() => {
      mermaid.render(id, chart).then(({ svg }) => setSvg(svg)).catch(() => {});
    });
  }, [chart]);

  if (!svg) return <div className="mermaid-placeholder" />;
  return <div className="mermaid-wrap" dangerouslySetInnerHTML={{ __html: svg }} />;
}

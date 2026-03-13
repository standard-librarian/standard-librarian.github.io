window.GraphData = {
  nodes: [
    { id: "post-hello", label: "Hello, world", type: "post", url: "/posts/hello-world/" },
    { id: "post-platforms", label: "Platform bets", type: "post", url: "/posts/platform-bets/" },
    { id: "post-go", label: "Go service baseline", type: "post", url: "/posts/go-service-baseline/" },
    { id: "post-context", label: "Context engineering", type: "post", url: "/posts/context-engineering-notes/" },
    { id: "tag-platform", label: "platform", type: "tag" },
    { id: "tag-go", label: "go", type: "tag" },
    { id: "tag-systems", label: "systems", type: "tag" },
    { id: "tag-context", label: "context", type: "tag" },
    { id: "tag-graph", label: "graph", type: "tag" }
  ],
  links: [
    { source: "post-hello", target: "tag-platform" },
    { source: "post-platforms", target: "tag-platform" },
    { source: "post-platforms", target: "tag-systems" },
    { source: "post-go", target: "tag-go" },
    { source: "post-go", target: "tag-systems" },
    { source: "post-context", target: "tag-context" },
    { source: "post-context", target: "tag-graph" },
    { source: "tag-context", target: "tag-graph" }
  ]
};

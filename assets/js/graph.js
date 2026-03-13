(function () {
  const canvas = document.getElementById("graph-canvas");
  if (!canvas || !window.GraphData) return;

  const context = canvas.getContext("2d");
  const state = {
    nodes: [],
    links: [],
    width: canvas.width,
    height: canvas.height,
    hoverId: null
  };

  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(320, rect.width * devicePixelRatio);
    canvas.height = Math.max(240, rect.height * devicePixelRatio);
    state.width = canvas.width;
    state.height = canvas.height;
  }

  function init() {
    resize();
    const { nodes, links } = window.GraphData;
    state.nodes = nodes.map((node, index) => {
      const angle = (index / nodes.length) * Math.PI * 2;
      return {
        ...node,
        x: state.width / 2 + Math.cos(angle) * (state.width * 0.18),
        y: state.height / 2 + Math.sin(angle) * (state.height * 0.18),
        vx: 0,
        vy: 0
      };
    });
    state.links = links;
    tick();
  }

  function applyForces() {
    const centerX = state.width / 2;
    const centerY = state.height / 2;

    for (const node of state.nodes) {
      let fx = (centerX - node.x) * 0.0005;
      let fy = (centerY - node.y) * 0.0005;

      for (const other of state.nodes) {
        if (node === other) continue;
        const dx = node.x - other.x;
        const dy = node.y - other.y;
        const distance = Math.max(40, Math.hypot(dx, dy));
        const repulsion = 180 / (distance * distance);
        fx += (dx / distance) * repulsion;
        fy += (dy / distance) * repulsion;
      }

      node.vx = (node.vx + fx) * 0.92;
      node.vy = (node.vy + fy) * 0.92;
    }

    for (const node of state.nodes) {
      node.x += node.vx;
      node.y += node.vy;
    }
  }

  function draw() {
    context.clearRect(0, 0, state.width, state.height);
    context.fillStyle = "#0c0f16";
    context.fillRect(0, 0, state.width, state.height);

    for (const link of state.links) {
      const source = state.nodes.find((node) => node.id === link.source);
      const target = state.nodes.find((node) => node.id === link.target);
      if (!source || !target) continue;
      context.beginPath();
      context.moveTo(source.x, source.y);
      context.lineTo(target.x, target.y);
      context.strokeStyle = "rgba(122, 162, 247, 0.25)";
      context.lineWidth = 1;
      context.stroke();
    }

    for (const node of state.nodes) {
      const isHover = node.id === state.hoverId;
      const radius = node.type === "post" ? 7 : 5;
      context.beginPath();
      context.arc(node.x, node.y, radius * (isHover ? 1.35 : 1), 0, Math.PI * 2);
      context.fillStyle = node.type === "post" ? "#7aa2f7" : "#9aa3b2";
      context.fill();
      if (isHover) {
        context.strokeStyle = "rgba(122, 162, 247, 0.5)";
        context.lineWidth = 2;
        context.stroke();
      }
    }
  }

  function tick() {
    applyForces();
    draw();
    requestAnimationFrame(tick);
  }

  function findNearestNode(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * devicePixelRatio;
    const y = (clientY - rect.top) * devicePixelRatio;
    let nearest = null;
    let minDistance = 24 * devicePixelRatio;
    for (const node of state.nodes) {
      const distance = Math.hypot(node.x - x, node.y - y);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = node;
      }
    }
    return nearest;
  }

  canvas.addEventListener("mousemove", (event) => {
    const nearest = findNearestNode(event.clientX, event.clientY);
    state.hoverId = nearest ? nearest.id : null;
    canvas.style.cursor = nearest && nearest.url ? "pointer" : "default";
  });

  canvas.addEventListener("click", (event) => {
    const nearest = findNearestNode(event.clientX, event.clientY);
    if (nearest && nearest.url) {
      window.location.href = nearest.url;
    }
  });

  window.addEventListener("resize", resize);
  init();
})();

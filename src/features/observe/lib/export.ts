export function downloadView(svg: SVGSVGElement) {
  const copy = svg.cloneNode(true) as SVGSVGElement;
  copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  // 比较着色层只用于屏幕上的差异观察，不进入下载的观察图。
  copy
    .querySelectorAll(".compare-overlay")
    .forEach((node) => node.parentNode?.removeChild(node));
  const blob = new Blob([new XMLSerializer().serializeToString(copy)], {
      type: "image/svg+xml",
    }),
    url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = "ORI-paper.svg";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

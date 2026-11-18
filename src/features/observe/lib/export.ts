export function downloadView(svg: SVGSVGElement) {
  const copy = svg.cloneNode(true) as SVGSVGElement;
  copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
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

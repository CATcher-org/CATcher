export function flattenEdges(edges: Array<any>, transformFunc?: (node) => {}): Array<any> {
  return edges.map((edge) => {
    if (transformFunc) {
      return transformFunc(edge.node);
    } else {
      return edge.node;
    }
  });
}

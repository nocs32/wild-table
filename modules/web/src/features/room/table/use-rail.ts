import { useEffect, useMemo } from 'react';
import { ExtrudeGeometry, Path, Shape } from 'three';

// The felt's size: an oval card table, wider than it is deep.
export const felt = { x: 1.6, z: 1.04 };

const rail = { x: 1.86, z: 1.3 };

// The padded rail round the felt: an oval ring, its edges rounded over like a stuffed cushion.
const railGeometry = (): ExtrudeGeometry => {
  const ring = new Shape();
  const hole = new Path();

  ring.absellipse(0, 0, rail.x, rail.z, 0, Math.PI * 2, false, 0);
  hole.absellipse(0, 0, felt.x + 0.02, felt.z + 0.02, 0, Math.PI * 2, true, 0);
  ring.holes.push(hole);

  const geometry = new ExtrudeGeometry(ring, { depth: 0.035, bevelEnabled: true, bevelThickness: 0.055, bevelSize: 0.07, bevelSegments: 6, curveSegments: 96 });

  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, 0.02, 0);

  return geometry;
};

export const useRailGeometry = (): ExtrudeGeometry => {
  const geometry = useMemo(railGeometry, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return geometry;
};

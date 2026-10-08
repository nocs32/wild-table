import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { CatmullRomCurve3, EllipseCurve, TubeGeometry, Vector3, type Mesh, type PointLight } from 'three';
import type { RoomGameMatchStore } from '../../../../stores/room/game/match';

// The fuse lies along the top of the rail at your edge of the table, from your left to your right.
const rail = { x: 1.74, z: 1.18, y: 0.13 };
const arc = { from: (155 * Math.PI) / 180, to: (25 * Math.PI) / 180 };
const tubeSegments = 160;
const radialSegments = 6;
// The fuse burns through the turn's last 8 seconds (spec D11).
const fuseMs = 8000;

export interface RoomTableRoundFuseParts {
  geometry: TubeGeometry;
  spark: RefObject<Mesh | null>;
  light: RefObject<PointLight | null>;
}

const fuseGeometry = (): TubeGeometry => {
  const flat = new EllipseCurve(0, 0, rail.x, rail.z, arc.to, arc.from, false, 0).getPoints(48);
  // From your right (where it ends) to your left (where it's lit).
  const path = new CatmullRomCurve3(flat.map((point) => new Vector3(point.x, rail.y, point.y)));

  return new TubeGeometry(path, tubeSegments, 0.016, radialSegments, false);
};

// Your fuse, every frame (spec D11, §8): it burns down from your left towards the bell on your
// right, a spark fizzing where it's burning, until your time is up.
export const useRoomTableRoundFuse = (match: RoomGameMatchStore): RoomTableRoundFuseParts => {
  const geometry = useMemo(fuseGeometry, []);
  const spark = useRef<Mesh>(null);
  const light = useRef<PointLight>(null);
  const point = useMemo(() => new Vector3(), []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(({ clock }) => {
    const endsAt = match.round?.endsAt ?? 0;
    const left = Math.max(0, Math.min(1, (endsAt - Date.now()) / fuseMs));
    const path = geometry.parameters.path;
    const fizz = 0.75 + Math.sin(clock.elapsedTime * 41) * 0.15 + Math.sin(clock.elapsedTime * 67) * 0.1;

    geometry.setDrawRange(0, Math.floor(left * tubeSegments) * radialSegments * 6);
    path.getPointAt(left, point);
    spark.current?.position.copy(point);
    spark.current?.scale.setScalar(fizz);

    if (light.current) {
      light.current.position.copy(point).setY(point.y + 0.05);
      light.current.intensity = 2.4 * fizz;
    }
  });

  return { geometry, spark, light };
};

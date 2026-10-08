import { useThree } from '@react-three/fiber';
import { autorun } from 'mobx';
import { useEffect } from 'react';
import { Plane, Raycaster, Vector2, Vector3 } from 'three';
import type { TableStore } from '../../../stores/table';
import { holdHeight } from '../../../stores/table/deck';

// The pointer on the table, outside React: the cursor and tooltip follow what it's over, and while
// a card is held, every move anywhere on the page is turned into a spot on the table at the held
// card's height. Letting go anywhere lets go of the card.
export const useRoomTablePointer = (table: TableStore): void => {
  const { camera, gl } = useThree();

  useEffect(
    () =>
      autorun(() => {
        gl.domElement.style.cursor = table.cursor;
        gl.domElement.title = table.hint;
      }),
    [gl, table],
  );

  useEffect(() => {
    const raycaster = new Raycaster();
    const plane = new Plane(new Vector3(0, 1, 0), -holdHeight);
    const hit = new Vector3();

    const move = (event: PointerEvent): void => {
      const box = gl.domElement.getBoundingClientRect();
      const pointer = new Vector2(((event.clientX - box.left) / box.width) * 2 - 1, -((event.clientY - box.top) / box.height) * 2 + 1);

      raycaster.setFromCamera(pointer, camera);

      const point = raycaster.ray.intersectPlane(plane, hit);

      table.deck.move(event.clientX, event.clientY, point ? { x: point.x, z: point.z } : null, performance.now());
    };

    const release = (): void => table.deck.release();

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);

    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
    };
  }, [camera, gl, table]);
};

import { useThree } from '@react-three/fiber';
import { autorun } from 'mobx';
import { useEffect } from 'react';
import { Plane, Raycaster, Vector2, Vector3 } from 'three';
import type { TableStore } from '../../../stores/table';

// The pointer on the table, outside React: the cursor and tooltip follow what it's over, and while
// a card is held, every move anywhere on the page is turned into a spot on the table at the held
// card's height. Letting go anywhere lets go of the card; a gesture the system cuts off plays nothing.
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
    const plane = new Plane(new Vector3(0, 1, 0), 0);
    const felt = new Plane(new Vector3(0, 1, 0), 0);
    const hit = new Vector3();
    const under = new Vector3();

    const move = (event: PointerEvent): void => {
      const box = gl.domElement.getBoundingClientRect();
      const pointer = new Vector2(((event.clientX - box.left) / box.width) * 2 - 1, -((event.clientY - box.top) / box.height) * 2 + 1);

      raycaster.setFromCamera(pointer, camera);
      plane.constant = -table.holdHeight;

      const point = raycaster.ray.intersectPlane(plane, hit);
      // The spot on the felt under the pointer: what a card is dropped on.
      const onFelt = raycaster.ray.intersectPlane(felt, under);

      table.move(event.clientX, event.clientY, point ? { x: point.x, z: point.z } : null, performance.now(), onFelt ? { x: onFelt.x, z: onFelt.z } : null);
    };

    const release = (): void => table.release();
    const cancel = (): void => table.cancel();

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', cancel);
    window.addEventListener('blur', cancel);

    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', cancel);
      window.removeEventListener('blur', cancel);
    };
  }, [camera, gl, table]);
};

import { cleanPersonName } from '@wild-table/protocol';
import type { TableClientService, TableLink } from '../types';
import { DemoReferee } from './referee';
import { freeColor } from './rules';
import type { DemoDeps, DemoMember } from './types';

const roomIdAlphabet = '0123456789abcdefghijklmnopqrstuvwxyz';

// What core-api will hand out: 12 characters of [0-9a-z].
const newRoomId = (random: () => number): string =>
  Array.from({ length: 12 }, () => roomIdAlphabet[Math.floor(random() * roomIdAlphabet.length)]).join('');

const defaultName = 'Curious Fox';

// The table without a server: a referee in the browser and a few sample players, for building
// and reviewing the UI (spec D18). Every table is new, and a reload starts over.
export const createDemoTable = (deps: DemoDeps): TableClientService => ({
  open: (roomId, name, listeners) => {
    const meId = deps.createId();
    const referee = new DemoReferee(deps, listeners, meId);

    const link: TableLink = {
      roomId: roomId ?? newRoomId(deps.random),
      meId,
      demo: {
        addPlayer: () => referee.addSample(),
        removePlayer: () => referee.removeSample(),
      },
      // A moment later, as over a network: the browser never hears back in the middle of sending.
      send: (type, message) => void deps.schedule(() => referee.handle(meId, type, message), 0),
      close: () => referee.dispose(),
    };

    // After `open` resolves, so the store already knows who it is. Three sample players sit
    // down with you, and a fourth a little later.
    deps.schedule(() => {
      const me: DemoMember = { id: meId, name: cleanPersonName(name ?? '') || defaultName, color: freeColor([]), connected: true, bot: false, sample: false, language: 'en' };

      referee.join(me);
      [0, 1, 2].forEach(() => referee.addSample());
    }, 0);

    deps.schedule(() => referee.addSample(), 5000);

    return Promise.resolve({ ok: true, link });
  },
});

import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../stores/use-root-store';
import { RoomFlightsItem } from './flights-item';
import { RoomFlightsRoot } from './styled-components';

// Huddle-style reactions rising from the dock on everyone's screen.
export const RoomFlights = observer(function RoomFlights(): ReactElement {
  const { reactions } = useRootStore().room;

  return (
    <RoomFlightsRoot aria-hidden>
      {reactions.flights.map((flight) => (
        <RoomFlightsItem key={flight.id} flight={flight} onLand={reactions.land} />
      ))}
    </RoomFlightsRoot>
  );
});

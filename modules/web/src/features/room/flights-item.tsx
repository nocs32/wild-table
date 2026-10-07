import type { ReactElement } from 'react';
import type { Flight } from '../../stores/room/reactions';
import { RoomFlightsName, RoomFlightsRise, RoomFlightsSway } from './styled-components';

interface RoomFlightsItemProps {
  flight: Flight;
  onLand: (id: string) => void;
}

export function RoomFlightsItem({ flight, onLand }: RoomFlightsItemProps): ReactElement {
  return (
    <RoomFlightsRise lane={flight.lane} onAnimationEnd={() => onLand(flight.id)}>
      <RoomFlightsSway sway={flight.sway}>
        {flight.emoji}
        {flight.sender && <RoomFlightsName>{flight.sender}</RoomFlightsName>}
      </RoomFlightsSway>
    </RoomFlightsRise>
  );
}

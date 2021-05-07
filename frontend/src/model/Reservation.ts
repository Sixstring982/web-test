import moment from 'moment';

export interface Reservation {
  readonly name: string;
  readonly email: string;
  readonly partySize: number;
  readonly moment: moment.Moment;
}

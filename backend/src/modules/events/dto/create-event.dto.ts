export class CreateEventDto {
  name: string;
  date: string;
  guestLimit: number;
  venue?: string;
}

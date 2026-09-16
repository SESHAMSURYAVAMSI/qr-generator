export interface Attendee {
  id: string;
  name: string;
  registrationNumber: string;
  code?: string;
  category?: string;
  [key: string]: string | undefined;
}

export type QRField =
  | "registrationNumber"
  | "code"
  | "custom";

export interface BadgeConfiguration {
  name: boolean;
  registrationNumber: boolean;
  qr: boolean;
  category: boolean;

  qrField: QRField;
  customQRField?: string;
}
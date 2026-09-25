import { Attendee, BadgeConfiguration } from "@/types/badge";

export function getQRValue(
  attendee: Attendee | undefined,
  configuration: BadgeConfiguration,
): string {
  if (!attendee) {
    return "PREVIEW-QR-001";
  }

  switch (configuration.qrField) {
    case "registrationNumber":
      return attendee.registrationNumber?.trim() || "NO-REGISTRATION";

    case "name":
      return attendee.name?.trim() || "NO-NAME";

    case "code":
      return attendee.code?.trim() || "NO-CODE";

    case "custom":
      if (configuration.customQRField && configuration.customQRField.trim()) {
        const customValue = attendee[configuration.customQRField.trim()];

        return customValue?.trim() || "NO-CUSTOM-VALUE";
      }

      return "NO-CUSTOM-VALUE";

    default:
      return "PREVIEW-QR-001";
  }
}

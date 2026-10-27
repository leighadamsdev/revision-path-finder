/**
 * Business details used on the Privacy, Terms, Cookies and Contact pages.
 *
 * Anything still in [square brackets] shows on the site highlighted in yellow so it's easy
 * to spot. Replace it with the real detail (and delete a line's text, e.g. companyNumber,
 * if it doesn't apply) and the highlight disappears.
 */
export const LEGAL = {
  /** Your full legal name, or your company's registered name. */
  ownerName: "[Your name or company name]",
  /** e.g. "a sole trader" or "a company registered in England and Wales". */
  ownerType: "[a sole trader / a company registered in England and Wales]",
  /** Leave as "" if you're not a limited company. */
  companyNumber: "[Company number, or delete if not a company]",
  /** A postal address where you can receive letters (a business address service is fine). */
  address: "[Postal address]",
  /** The email address people should use for questions, privacy requests and complaints. */
  contactEmail: "[Contact email, e.g. hello@yourdomain.co.uk]",
  /** Your ICO data protection fee registration number (starts with ZA or ZB). */
  icoNumber: "[ICO registration number]",
  /** Leave as "" if you're not VAT registered. */
  vatNumber: "",
  /** Update this whenever you change a policy. */
  lastUpdated: "28 October 2026",
} as const;

/** True for a detail that still needs filling in. */
export const isPlaceholder = (value: string) => value.trim().startsWith("[");

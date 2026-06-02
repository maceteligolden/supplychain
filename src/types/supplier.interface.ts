export interface SupplierInterface {
  /** Unique supplier identifier. */
  id: string;
  /** Supplier company name. */
  name: string;
  /** Primary contact person. */
  contactName: string;
  /** Contact email address. */
  email: string;
  /** Contact phone number. */
  phone: string;
  /** Supplier country. */
  country: string;
  /** Product categories supplied. */
  categories: string[];
  /** Supplier rating out of 5. */
  rating: number;
  /** Number of active contracts. */
  activeContracts: number;
  /** ISO timestamp when supplier was onboarded. */
  onboardedAt: string;
}

export type GetSuppliersOutput = {
  suppliers: SupplierInterface[];
  total: number;
};


import type { CropDiagnosisOutput } from "./ai/schemas/crop-diagnosis-schemas";

export type User = {
  uid: string;
  email: string | null;
  name: string | null;
  location: string | null;
  photoURL?: string | null;
};

// Represents a crop a user is currently growing.
// This data is stored in the `current_crops` collection.
export interface CurrentCrop {
  id: string;
  cropName: string;
  fieldSize: string;
  location: string;
  sowingDate: string; // Stored as ISO string
  additionalInfo?: string;
  soilPhotoDataUri?: string | null;
  createdAt: string; // Stored as ISO string
}

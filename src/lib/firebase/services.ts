
'use server';

import { collection, addDoc, serverTimestamp, query, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './config';
import type { CropDiagnosisOutput } from '@/ai/schemas/crop-diagnosis-schemas';
import { getCurrentUser } from './server-auth';
import { type CurrentCrop } from '@/lib/types';


export interface DiagnosisData {
    userId: string | null; // Allow userId to be null for anonymous posts
    photoDataUris: string[];
    landSize: string;
    additionalNotes: string;
    diagnosis: CropDiagnosisOutput;
    createdAt: Date | Timestamp;
}

// This is the shape of the data after it has been serialized for the client
export interface DiagnosisRecord {
    id: string;
    diagnosis: CropDiagnosisOutput;
    landSize?: string;
    additionalNotes?: string;
    userId: string | null; // Allow userId to be null
    createdAt: string; // Serialized as an ISO string
}


/**
 * Saves a new diagnosis record to Firestore. It allows anonymous submissions.
 * @param data The diagnosis data to save, without the userId.
 */
export async function saveDiagnosis(data: Omit<DiagnosisData, 'createdAt' | 'userId'> & { createdAt: Date }) {
  try {
    const user = await getCurrentUser();
    // The user can be null, we proceed anyway.
    const userId = user ? user.uid : null;

    const dataToSave = {
      userId: userId, // Save the user's UID or null if they are not logged in
      photoDataUris: ["IMAGE_DATA_TRUNCATED"], // Do not save large image data
      landSize: data.landSize || '',
      additionalNotes: data.additionalNotes || '',
      diagnosis: {
        healthStatus: {
          status: data.diagnosis.healthStatus.status,
          severity: data.diagnosis.healthStatus.severity,
          summary: data.diagnosis.healthStatus.summary,
        },
        diseaseIdentification: {
          name: data.diagnosis.diseaseIdentification.name,
          description: data.diagnosis.diseaseIdentification.description,
        },
        symptoms: data.diagnosis.symptoms,
        remedies: data.diagnosis.remedies,
        prevention: data.diagnosis.prevention,
      },
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'diagnoses'), dataToSave);
    console.log('Diagnosis record created with ID: ', docRef.id);
    return docRef.id;
  } catch (e: any) {
    console.error('Error adding document: ', e);
    // Provide a more detailed error message
    throw new Error(`Could not save diagnosis to the database. Reason: ${e.message}`);
  }
}

/**
 * Retrieves all diagnosis records for the public library.
 * @returns A promise that resolves to an array of diagnosis records.
 */
export async function getDiagnosesForUser(): Promise<DiagnosisRecord[]> {
  try {
    const diagnosesCollection = collection(db, "diagnoses");
    // We will now sort by date on the server, which requires a Firestore index.
    const q = query(diagnosesCollection, orderBy("createdAt", "desc"));
    
    const querySnapshot = await getDocs(q);
    const diagnoses: DiagnosisRecord[] = [];
    
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const createdAtTimestamp = data.createdAt as Timestamp;

        if (createdAtTimestamp) {
            diagnoses.push({ 
                id: doc.id,
                diagnosis: data.diagnosis,
                landSize: data.landSize,
                additionalNotes: data.additionalNotes,
                userId: data.userId || null,
                // Convert Firestore Timestamp to a serializable ISO string
                createdAt: createdAtTimestamp.toDate().toISOString(),
            });
        }
    });

    console.log(`Found ${diagnoses.length} diagnoses.`);
    return diagnoses;
  } catch (e: any) {
    if (e.code === 'failed-precondition') {
        console.error("Firestore index missing. Please create a composite index for 'diagnoses' on 'createdAt' descending.", e);
        throw new Error('Could not fetch diagnoses from the database. A database index is required for this query. Please check the Firebase console.');
    } else {
        console.error('Error getting documents: ', e);
        throw new Error(`Could not fetch diagnoses from the database. Reason: ${e.message}`);
    }
  }
}


/**
 * Saves a new current crop record to Firestore. This is a public collection.
 * @param data The crop data to save.
 */
export async function addCurrentCrop(data: Omit<CurrentCrop, 'id' | 'createdAt'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'current_crops'), {
      ...data,
      createdAt: serverTimestamp(),
    });
    console.log('Current crop record created with ID: ', docRef.id);
    return docRef.id;
  } catch (e: any) {
    console.error('Error adding current crop document: ', e);
    throw new Error(`Could not save your crop to the database. Reason: ${e.message}`);
  }
}

/**
 * Retrieves all current crop records from Firestore for public access.
 * @returns A promise that resolves to an array of current crop records.
 */
export async function getAllCurrentCrops(): Promise<CurrentCrop[]> {
  try {
    const cropsCollection = collection(db, "current_crops");
    const q = query(cropsCollection, orderBy("createdAt", "desc"));
    
    const querySnapshot = await getDocs(q);
    const crops: CurrentCrop[] = [];
    
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const createdAtTimestamp = data.createdAt as Timestamp;
        const sowingDateTimestamp = data.sowingDate as Timestamp;

        // Ensure sowingDate and createdAt are converted to serializable ISO strings
        let sowingDateStr: string;
        if (sowingDateTimestamp && typeof sowingDateTimestamp.toDate === 'function') {
            sowingDateStr = sowingDateTimestamp.toDate().toISOString();
        } else {
            sowingDateStr = data.sowingDate; // Assume it's already a string
        }

        let createdAtStr: string;
         if (createdAtTimestamp && typeof createdAtTimestamp.toDate === 'function') {
            createdAtStr = createdAtTimestamp.toDate().toISOString();
        } else {
            createdAtStr = data.createdAt; // It might not exist on old docs, or is already a string
        }

        crops.push({
            id: doc.id,
            cropName: data.cropName,
            fieldSize: data.fieldSize,
            location: data.location,
            sowingDate: sowingDateStr,
            additionalInfo: data.additionalInfo,
            soilPhotoDataUri: data.soilPhotoDataUri || null,
            createdAt: createdAtStr,
        });
    });
    console.log(`Found ${crops.length} current crops.`);
    return crops;
  } catch (e: any) {
    if (e.code === 'failed-precondition') {
        console.error("Firestore index missing. Please create a composite index for 'current_crops' on 'createdAt' descending.", e);
        throw new Error('Could not fetch current crops from the database. A database index is required for this query. Please check the Firebase console.');
    } else {
        console.error('Error getting current crop documents: ', e);
        throw new Error(`Could not fetch your crops from the database. Reason: ${e.message}`);
    }
  }
}

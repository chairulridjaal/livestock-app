import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { db } from './firebase'; // Actual db import to be potentially used by mocks
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  Timestamp,
  doc, // Import doc if you plan to test functions that use it (not in current scope but good for future)
} from 'firebase/firestore';
import {
  saveHealthEvent,
  getHealthEvents,
  saveVaccinationRecord,
  getVaccinationRecords,
  HealthEventData,
  VaccinationRecordData,
} from './healthService';

// Mock Firebase Firestore functions
vi.mock('firebase/firestore', async (importOriginal) => {
  const original = await importOriginal<typeof import('firebase/firestore')>();
  return {
    ...original,
    collection: vi.fn(),
    addDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    getDocs: vi.fn(),
    serverTimestamp: vi.fn(() => Timestamp.now()), // Mock serverTimestamp to return a consistent value
    doc: vi.fn(), // Mock doc as well
  };
});

describe('healthService', () => {
  const mockServerTimestamp = Timestamp.fromDate(new Date('2023-01-01T12:00:00Z'));

  beforeEach(() => {
    vi.mocked(serverTimestamp).mockReturnValue(mockServerTimestamp);
    vi.mocked(addDoc).mockResolvedValue({ id: 'test-doc-id' } as any);
    vi.mocked(collection).mockReturnValue({} as any); // Default mock for collection
    vi.mocked(query).mockReturnValue({} as any); // Default mock for query
    vi.mocked(getDocs).mockResolvedValue({ docs: [] } as any); // Default mock for getDocs
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // --- Health Events ---
  describe('saveHealthEvent', () => {
    it('should call addDoc with correct parameters and include timestamps', async () => {
      const eventData: HealthEventData = {
        animalId: 'animal1',
        farmId: 'farm1',
        eventType: 'Illness',
        eventDate: new Date('2023-10-26'),
        symptoms: 'Coughing',
      };
      const expectedData = {
        ...eventData,
        eventDate: Timestamp.fromDate(new Date('2023-10-26')),
        createdAt: mockServerTimestamp,
        updatedAt: mockServerTimestamp,
      };

      await saveHealthEvent(eventData);

      expect(collection).toHaveBeenCalledWith(db, 'health_events');
      expect(addDoc).toHaveBeenCalledWith(expect.anything(), expectedData);
    });

    it('should throw an error if addDoc fails', async () => {
      vi.mocked(addDoc).mockRejectedValueOnce(new Error('Firestore error'));
      const eventData: HealthEventData = {
        animalId: 'animal1',
        farmId: 'farm1',
        eventType: 'Illness',
        eventDate: new Date('2023-10-26'),
      };
      await expect(saveHealthEvent(eventData)).rejects.toThrow('Failed to save health event.');
    });
  });

  describe('getHealthEvents', () => {
    it('should query Firestore with correct parameters and return mapped data', async () => {
      const mockDocs = [
        { id: 'event1', data: () => ({ eventType: 'Illness', eventDate: Timestamp.fromDate(new Date('2023-10-20')) }) },
        { id: 'event2', data: () => ({ eventType: 'Injury', eventDate: Timestamp.fromDate(new Date('2023-10-22')) }) },
      ];
      vi.mocked(getDocs).mockResolvedValueOnce({ docs: mockDocs } as any);

      const events = await getHealthEvents('animal1', 'farm1');

      expect(collection).toHaveBeenCalledWith(db, 'health_events');
      expect(where).toHaveBeenCalledWith('animalId', '==', 'animal1');
      expect(where).toHaveBeenCalledWith('farmId', '==', 'farmId');
      expect(orderBy).toHaveBeenCalledWith('eventDate', 'desc');
      expect(query).toHaveBeenCalled(); // Ensure query was called with the parts
      expect(getDocs).toHaveBeenCalled();
      expect(events).toEqual([
        { id: 'event1', eventType: 'Illness', eventDate: Timestamp.fromDate(new Date('2023-10-20')) },
        { id: 'event2', eventType: 'Injury', eventDate: Timestamp.fromDate(new Date('2023-10-22')) },
      ]);
    });

     it('should throw an error if getDocs fails', async () => {
      vi.mocked(getDocs).mockRejectedValueOnce(new Error('Firestore error'));
      await expect(getHealthEvents('animal1', 'farm1')).rejects.toThrow('Failed to fetch health events.');
    });
  });

  // --- Vaccination Records ---
  describe('saveVaccinationRecord', () => {
    it('should call addDoc with correct parameters and include timestamps', async () => {
      const recordData: VaccinationRecordData = {
        animalId: 'animal1',
        farmId: 'farm1',
        vaccineName: 'Bovishield Gold',
        vaccinationDate: new Date('2023-11-15'),
        nextDueDate: new Date('2024-11-15'),
      };
      const expectedData = {
        ...recordData,
        vaccinationDate: Timestamp.fromDate(new Date('2023-11-15')),
        nextDueDate: Timestamp.fromDate(new Date('2024-11-15')),
        createdAt: mockServerTimestamp,
        updatedAt: mockServerTimestamp,
      };

      await saveVaccinationRecord(recordData);

      expect(collection).toHaveBeenCalledWith(db, 'vaccination_records');
      expect(addDoc).toHaveBeenCalledWith(expect.anything(), expectedData);
    });
    
    it('should handle null nextDueDate correctly', async () => {
      const recordData: VaccinationRecordData = {
        animalId: 'animal1',
        farmId: 'farm1',
        vaccineName: 'Bovishield Gold',
        vaccinationDate: new Date('2023-11-15'),
        nextDueDate: null,
      };
      const expectedData = {
        ...recordData,
        vaccinationDate: Timestamp.fromDate(new Date('2023-11-15')),
        nextDueDate: null,
        createdAt: mockServerTimestamp,
        updatedAt: mockServerTimestamp,
      };
      await saveVaccinationRecord(recordData);
      expect(addDoc).toHaveBeenCalledWith(expect.anything(), expectedData);
    });

    it('should throw an error if addDoc fails', async () => {
      vi.mocked(addDoc).mockRejectedValueOnce(new Error('Firestore error'));
      const recordData: VaccinationRecordData = {
        animalId: 'animal1',
        farmId: 'farm1',
        vaccineName: 'Bovishield Gold',
        vaccinationDate: new Date('2023-11-15'),
      };
      await expect(saveVaccinationRecord(recordData)).rejects.toThrow('Failed to save vaccination record.');
    });
  });

  describe('getVaccinationRecords', () => {
    it('should query Firestore with correct parameters and return mapped data', async () => {
      const mockDocs = [
        { id: 'vac1', data: () => ({ vaccineName: 'VacA', vaccinationDate: Timestamp.fromDate(new Date('2023-09-01')) }) },
        { id: 'vac2', data: () => ({ vaccineName: 'VacB', vaccinationDate: Timestamp.fromDate(new Date('2023-09-15')) }) },
      ];
      vi.mocked(getDocs).mockResolvedValueOnce({ docs: mockDocs } as any);

      const records = await getVaccinationRecords('animal1', 'farm1');

      expect(collection).toHaveBeenCalledWith(db, 'vaccination_records');
      expect(where).toHaveBeenCalledWith('animalId', '==', 'animalId');
      expect(where).toHaveBeenCalledWith('farmId', '==', 'farmId');
      expect(orderBy).toHaveBeenCalledWith('vaccinationDate', 'desc');
      expect(query).toHaveBeenCalled();
      expect(getDocs).toHaveBeenCalled();
      expect(records).toEqual([
        { id: 'vac1', vaccineName: 'VacA', vaccinationDate: Timestamp.fromDate(new Date('2023-09-01')) },
        { id: 'vac2', vaccineName: 'VacB', vaccinationDate: Timestamp.fromDate(new Date('2023-09-15')) },
      ]);
    });

    it('should throw an error if getDocs fails', async () => {
      vi.mocked(getDocs).mockRejectedValueOnce(new Error('Firestore error'));
      await expect(getVaccinationRecords('animal1', 'farm1')).rejects.toThrow('Failed to fetch vaccination records.');
    });
  });
});

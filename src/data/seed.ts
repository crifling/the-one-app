import type { AppData } from '../store/types';
import { emptyAppData } from '../store/defaults';

// Realistic seed data, installed only when no user data exists. Ids are stable
// and human-readable so they are easy to reference while developing.
const T = '2026-07-21T07:00:00.000Z';

/** Build the full seeded document (fresh copy on each call). */
export function seedData(): AppData {
  const base = emptyAppData();

  return {
    ...base,
    seeded: true,
    settings: { userName: 'Claus' },
    tracks: [
      {
        id: 'track-app',
        name: 'Min Hverdag-app',
        lifeArea: 'work',
        type: 'completable',
        status: 'active',
        focus: true,
        nextActionId: 'act-app-1',
        actions: [
          { id: 'act-app-1', title: 'Godkend struktur og flow i prototypen', completed: false, createdAt: T, updatedAt: T },
          { id: 'act-app-2', title: 'Beslut hvordan data skal gemmes', completed: false, createdAt: T, updatedAt: T },
          { id: 'act-app-3', title: 'Lav første rigtige PWA-version', completed: false, createdAt: T, updatedAt: T },
        ],
        ideas: [
          { id: 'idea-app-1', text: 'Importér et træningsprogram fra ChatGPT som tekst eller fil.', createdAt: T },
          { id: 'idea-app-2', text: 'Højst to fokusspor ad gangen.', createdAt: T },
        ],
        createdAt: T,
        updatedAt: T,
      },
      {
        id: 'track-bali',
        name: 'Bali',
        lifeArea: 'family',
        type: 'completable',
        status: 'active',
        focus: true,
        nextActionId: 'act-bali-1',
        actions: [
          { id: 'act-bali-1', title: 'Gennemgå den sidste pakkeliste', completed: false, createdAt: T, updatedAt: T },
          { id: 'act-bali-2', title: 'Tjek transport fra lufthavnen', completed: false, createdAt: T, updatedAt: T },
        ],
        ideas: [
          { id: 'idea-bali-1', text: 'Book ture lokalt, medmindre noget særligt kræver reservation.', createdAt: T },
        ],
        createdAt: T,
        updatedAt: T,
      },
      {
        id: 'track-eov',
        name: 'Echoes of Varik',
        lifeArea: 'hobby',
        type: 'ongoing',
        status: 'active',
        focus: false,
        nextActionId: 'act-eov-1',
        actions: [
          { id: 'act-eov-1', title: 'Fastlæg næste scene, der skal produceres', completed: false, createdAt: T, updatedAt: T },
        ],
        ideas: [
          { id: 'idea-eov-1', text: 'Ny overgang mellem tempelscenen og bjergpasset.', createdAt: T },
        ],
        createdAt: T,
        updatedAt: T,
      },
      {
        id: 'track-health',
        name: 'Sundhed',
        lifeArea: 'health',
        type: 'ongoing',
        status: 'active',
        focus: false,
        nextActionId: 'act-health-1',
        actions: [
          { id: 'act-health-1', title: 'Planlæg næste uges træning', completed: false, createdAt: T, updatedAt: T },
        ],
        ideas: [],
        createdAt: T,
        updatedAt: T,
      },
      {
        id: 'track-daughters',
        name: 'Mine døtre',
        lifeArea: 'family',
        type: 'ongoing',
        status: 'active',
        focus: false,
        nextActionId: null,
        actions: [],
        ideas: [
          { id: 'idea-daughters-1', text: 'Idé til en aktivitet, vi kan lave sammen i weekenden.', createdAt: T },
        ],
        createdAt: T,
        updatedAt: T,
      },
      {
        id: 'track-partner',
        name: 'Min kæreste',
        lifeArea: 'family',
        type: 'ongoing',
        status: 'active',
        focus: false,
        nextActionId: null,
        actions: [],
        ideas: [
          { id: 'idea-partner-1', text: 'Forslag til en aften uden telefoner eller arbejde.', createdAt: T },
        ],
        createdAt: T,
        updatedAt: T,
      },
    ],
    tasks: [
      { id: 'task-1', title: 'Bestil nye kufferter', dueDate: '2026-07-21', priority: 'high', completed: false, createdAt: T, updatedAt: T },
      { id: 'task-2', title: 'Ring til tandlægen', dueDate: null, priority: 'normal', completed: false, createdAt: T, updatedAt: T },
      { id: 'task-3', title: 'Besvar vigtig mail', dueDate: null, priority: 'normal', completed: false, createdAt: T, updatedAt: T },
      { id: 'task-4', title: 'Køb nye træningselastikker', dueDate: null, priority: 'low', completed: false, createdAt: T, updatedAt: T },
    ],
    routines: [
      {
        id: 'routine-morning',
        name: 'Morgenrutine',
        schedule: 'morning',
        steps: [
          { id: 'rs-m-1', text: 'Drik et glas vand' },
          { id: 'rs-m-2', text: '10 minutters mobilitet' },
          { id: 'rs-m-3', text: 'Tjek kalender og dagens fokus' },
          { id: 'rs-m-4', text: 'Vælg dagens vigtigste opgave' },
        ],
        createdAt: T,
        updatedAt: T,
      },
      {
        id: 'routine-evening',
        name: 'Aftenrutine',
        schedule: 'evening',
        steps: [
          { id: 'rs-e-1', text: 'Kort refleksion over dagen' },
          { id: 'rs-e-2', text: 'Klargør det vigtigste til i morgen' },
          { id: 'rs-e-3', text: 'Læg telefonen væk' },
        ],
        createdAt: T,
        updatedAt: T,
      },
      {
        id: 'routine-weekly',
        name: 'Ugentligt overblik',
        schedule: 'weekly',
        steps: [
          { id: 'rs-w-1', text: 'Gennemgå åbne generelle opgaver' },
          { id: 'rs-w-2', text: 'Vælg næste uges 1-2 fokusspor' },
          { id: 'rs-w-3', text: 'Se på balancen mellem livsområder' },
        ],
        createdAt: T,
        updatedAt: T,
      },
      {
        id: 'routine-packing',
        name: 'Pakkeliste',
        schedule: 'reusable',
        steps: [
          { id: 'rs-p-1', text: 'Pas og dokumenter' },
          { id: 'rs-p-2', text: 'Medicin' },
          { id: 'rs-p-3', text: 'Opladere' },
        ],
        createdAt: T,
        updatedAt: T,
      },
    ],
    exercises: [
      { id: 'ex-reverse-lunges', title: 'Reverse lunges', category: 'speediance', bodyPart: 'legs', createdAt: T, updatedAt: T },
      { id: 'ex-rdl', title: 'Romanian deadlift', category: 'speediance', bodyPart: 'legs', createdAt: T, updatedAt: T },
      { id: 'ex-woodchops', title: 'Woodchops', category: 'speediance', bodyPart: 'core', createdAt: T, updatedAt: T },
      { id: 'ex-squats', title: 'Squats', category: 'bodyweight', bodyPart: 'legs', createdAt: T, updatedAt: T },
      { id: 'ex-pushups', title: 'Push-ups', category: 'bodyweight', bodyPart: 'chest', createdAt: T, updatedAt: T },
      { id: 'ex-plank', title: 'Plank', category: 'bodyweight', bodyPart: 'core', createdAt: T, updatedAt: T },
      { id: 'ex-air-squats', title: 'Air squats', category: 'bodyweight', bodyPart: 'legs', createdAt: T, updatedAt: T },
      { id: 'ex-incline-pushups', title: 'Incline push-ups', category: 'bodyweight', bodyPart: 'chest', createdAt: T, updatedAt: T },
      { id: 'ex-cat-cow', title: 'Cat-cow', category: 'mobility', bodyPart: 'back', createdAt: T, updatedAt: T },
      { id: 'ex-wgs', title: 'World’s greatest stretch', category: 'mobility', bodyPart: 'fullbody', createdAt: T, updatedAt: T },
      { id: 'ex-glute-bridge', title: 'Glute bridge', category: 'bodyweight', bodyPart: 'glutes', createdAt: T, updatedAt: T },
    ],
    programs: [
      {
        id: 'program-legs',
        title: 'Ben + core',
        steps: [
          { id: 'ps-legs-1', kind: 'exercise', exerciseId: 'ex-reverse-lunges', sets: 3, mode: 'reps', amount: 10, restSeconds: 60, weightKg: 20 },
          { id: 'ps-legs-2', kind: 'exercise', exerciseId: 'ex-rdl', sets: 3, mode: 'reps', amount: 10, restSeconds: 75, weightKg: 40 },
          { id: 'ps-legs-3', kind: 'pause', seconds: 90 },
          { id: 'ps-legs-4', kind: 'exercise', exerciseId: 'ex-woodchops', sets: 3, mode: 'reps', amount: 12, restSeconds: 45, weightKg: 15 },
        ],
        createdAt: T,
        updatedAt: T,
      },
      {
        id: 'program-fullbody',
        title: '20 min. Full Body',
        steps: [
          { id: 'ps-fb-1', kind: 'exercise', exerciseId: 'ex-squats', sets: 3, mode: 'reps', amount: 12, restSeconds: 45, weightKg: 0 },
          { id: 'ps-fb-2', kind: 'exercise', exerciseId: 'ex-pushups', sets: 3, mode: 'reps', amount: 10, restSeconds: 45, weightKg: 0 },
          { id: 'ps-fb-3', kind: 'exercise', exerciseId: 'ex-plank', sets: 3, mode: 'time', amount: 40, restSeconds: 30, weightKg: 0 },
        ],
        createdAt: T,
        updatedAt: T,
      },
      {
        id: 'program-hotel',
        title: 'Hotel workout',
        steps: [
          { id: 'ps-h-1', kind: 'exercise', exerciseId: 'ex-air-squats', sets: 3, mode: 'reps', amount: 15, restSeconds: 30, weightKg: 0 },
          { id: 'ps-h-2', kind: 'exercise', exerciseId: 'ex-incline-pushups', sets: 3, mode: 'reps', amount: 12, restSeconds: 30, weightKg: 0 },
        ],
        createdAt: T,
        updatedAt: T,
      },
      {
        id: 'program-mobility',
        title: 'Morgenmobilitet',
        steps: [
          { id: 'ps-mob-1', kind: 'exercise', exerciseId: 'ex-cat-cow', sets: 2, mode: 'time', amount: 60, restSeconds: 0, weightKg: 0 },
          { id: 'ps-mob-2', kind: 'exercise', exerciseId: 'ex-wgs', sets: 2, mode: 'time', amount: 90, restSeconds: 0, weightKg: 0 },
        ],
        createdAt: T,
        updatedAt: T,
      },
    ],
    todaysProgram: { programId: 'program-legs', date: '2026-07-21' },
  };
}

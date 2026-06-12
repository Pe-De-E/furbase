import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const db = drizzle(pool, { schema })

async function main() {
  await db.insert(schema.adoptionChecklistItem).values([
    {
      textDe: 'Habe ich ausreichend Zeit für ein Tier?',
      textEn: 'Do I have enough time for a pet?',
      descriptionDe: 'Tiere brauchen tägliche Aufmerksamkeit, Pflege und Bewegung.',
      descriptionEn: 'Pets need daily attention, care, and exercise.',
      sortOrder: 1,
    },
    {
      textDe: 'Ist meine Wohnung/mein Haus für ein Tier geeignet?',
      textEn: 'Is my home suitable for a pet?',
      descriptionDe: 'Ausreichend Platz, keine gefährlichen Stellen, ggf. Garten oder Balkon.',
      descriptionEn: 'Enough space, no hazards, ideally a garden or balcony.',
      sortOrder: 2,
    },
    {
      textDe: 'Sind alle Familienmitglieder/Mitbewohner einverstanden?',
      textEn: 'Does everyone in the household agree?',
      descriptionDe: 'Allergien, Ängste oder Einwände sollten vorab geklärt sein.',
      descriptionEn: 'Allergies, fears, or objections should be clarified beforehand.',
      sortOrder: 3,
    },
    {
      textDe: 'Habe ich einen Tierarzt in der Nähe?',
      textEn: 'Do I have a vet nearby?',
      descriptionDe: 'Regelmäßige Vorsorge und Notfallversorgung sollten sichergestellt sein.',
      descriptionEn: 'Regular check-ups and emergency care should be accessible.',
      sortOrder: 4,
    },
    {
      textDe: 'Kann ich mir die laufenden Kosten leisten?',
      textEn: 'Can I afford the ongoing costs?',
      descriptionDe: 'Futter, Tierarzt, Versicherung, Zubehör — das kommt schnell zusammen.',
      descriptionEn: 'Food, vet, insurance, supplies — it adds up quickly.',
      sortOrder: 5,
    },
    {
      textDe: 'Habe ich für den Urlaubsfall eine Betreuung?',
      textEn: 'Do I have pet care arranged for holidays?',
      descriptionDe: 'Familie, Freunde oder professionelle Tiersitter einplanen.',
      descriptionEn: 'Plan with family, friends, or professional pet sitters.',
      sortOrder: 6,
    },
    {
      textDe: 'Habe ich das Erstgespräch mit dem Tierheim geführt?',
      textEn: 'Have I had the initial meeting with the shelter?',
      descriptionDe: 'Kennenlerngespräch, Fragen zum Tier, Erwartungen besprechen.',
      descriptionEn: 'Introduction meeting, questions about the animal, discussing expectations.',
      sortOrder: 7,
    },
    {
      textDe: 'Habe ich das Tier persönlich kennengelernt?',
      textEn: 'Have I met the animal in person?',
      descriptionDe: 'Mindestens ein Besuch vor der Adoption.',
      descriptionEn: 'At least one visit before the adoption.',
      sortOrder: 8,
    },
    {
      textDe: 'Ist die Probezeit erfolgreich abgeschlossen?',
      textEn: 'Has the trial period gone well?',
      descriptionDe: 'Das Tier hat sich in der neuen Umgebung eingelebt.',
      descriptionEn: 'The animal has settled into its new environment.',
      sortOrder: 9,
    },
    {
      textDe: 'Adoptionsvertrag unterzeichnet',
      textEn: 'Adoption contract signed',
      descriptionDe: 'Der offizielle Adoptionsvertrag mit dem Tierheim ist abgeschlossen.',
      descriptionEn: 'The official adoption contract with the shelter has been completed.',
      sortOrder: 10,
    },
  ])

  console.log('✅ Adoption checklist items seeded')
  await pool.end()
}

main().catch((e) => { console.error(e); process.exit(1) })

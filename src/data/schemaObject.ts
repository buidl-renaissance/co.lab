/**
 * Schema.org Object Types and Interfaces
 * 
 * This module defines the data models for schema.org-typed objects
 * used in the collaborative document storage system.
 */

// Supported schema.org types (core set for v1)
export type SchemaOrgType = 'Person' | 'Event' | 'Project' | 'Organization' | 'Place';

// Source of the schema object
export type SchemaObjectSource = 'voice_session' | 'manual' | 'agent' | 'import';

// Base schema object interface
export interface SchemaObjectBase {
  '@type': SchemaOrgType;
  '@id': string;
  name: string;
  description?: string;
  source: SchemaObjectSource;
  collaborationId: string;
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
  deletedAt?: string; // ISO8601, for soft delete
}

// Person schema (schema.org/Person)
export interface PersonObject extends SchemaObjectBase {
  '@type': 'Person';
  givenName?: string;
  familyName?: string;
  email?: string;
  telephone?: string;
  jobTitle?: string;
  worksFor?: string; // Organization name or ID
  url?: string;
  image?: string;
  sameAs?: string[]; // Social profile URLs
}

// Event schema (schema.org/Event)
export interface EventObject extends SchemaObjectBase {
  '@type': 'Event';
  startDate?: string; // ISO8601
  endDate?: string; // ISO8601
  location?: string; // Place name or ID
  eventStatus?: 'EventScheduled' | 'EventCancelled' | 'EventPostponed' | 'EventRescheduled';
  eventAttendanceMode?: 'OfflineEventAttendanceMode' | 'OnlineEventAttendanceMode' | 'MixedEventAttendanceMode';
  organizer?: string; // Person or Organization name/ID
  performer?: string[];
  attendee?: string[];
  maximumAttendeeCapacity?: number;
  url?: string;
  image?: string;
}

// Project schema (schema.org/Project - using CreativeWork as base)
export interface ProjectObject extends SchemaObjectBase {
  '@type': 'Project';
  dateCreated?: string; // ISO8601
  dateModified?: string; // ISO8601
  datePublished?: string; // ISO8601
  creator?: string; // Person or Organization name/ID
  contributor?: string[];
  funder?: string[];
  keywords?: string[];
  url?: string;
  status?: 'Planned' | 'Active' | 'Completed' | 'Cancelled' | 'OnHold';
}

// Organization schema (schema.org/Organization)
export interface OrganizationObject extends SchemaObjectBase {
  '@type': 'Organization';
  legalName?: string;
  alternateName?: string;
  email?: string;
  telephone?: string;
  address?: string;
  url?: string;
  logo?: string;
  foundingDate?: string; // ISO8601
  numberOfEmployees?: number;
  member?: string[]; // Person IDs
  parentOrganization?: string;
  subOrganization?: string[];
}

// Place schema (schema.org/Place)
export interface PlaceObject extends SchemaObjectBase {
  '@type': 'Place';
  address?: string;
  geo?: {
    latitude: number;
    longitude: number;
  };
  telephone?: string;
  openingHours?: string;
  url?: string;
  image?: string;
  containedInPlace?: string; // Parent place ID
  containsPlace?: string[]; // Child place IDs
  maximumAttendeeCapacity?: number;
}

// Union type for all schema objects
export type SchemaObject = PersonObject | EventObject | ProjectObject | OrganizationObject | PlaceObject;

// Schema object with embedding for LanceDB storage
export type SchemaObjectWithEmbedding = SchemaObject & {
  embedding?: number[];
  textContent?: string; // Computed text for embedding generation
};

// Collaboration model for grouping schema objects
export interface SchemaCollaboration {
  id: string;
  templateId?: string;
  chatThreadId?: string;
  name?: string;
  description?: string;
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
}

// Relationship edge between objects
export interface ObjectRelationship {
  id: string;
  sourceId: string;
  sourceType: SchemaOrgType;
  targetId: string;
  targetType: SchemaOrgType;
  relationshipType: string; // e.g., 'organizer', 'attendee', 'member', 'location'
  collaborationId: string;
  createdAt: string; // ISO8601
}

// Search parameters
export interface SchemaObjectSearchParams {
  query?: string; // Semantic search query
  types?: SchemaOrgType[]; // Filter by type
  collaborationId?: string; // Filter by collaboration
  source?: SchemaObjectSource; // Filter by source
  limit?: number;
  offset?: number;
  includeDeleted?: boolean;
}

// Search result
export interface SchemaObjectSearchResult {
  objects: SchemaObject[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// Create/Update input types (without system fields)
export type CreateSchemaObjectInput = Omit<SchemaObject, '@id' | 'createdAt' | 'updatedAt'>;
export type UpdateSchemaObjectInput = Partial<Omit<SchemaObject, '@id' | '@type' | 'createdAt' | 'updatedAt' | 'collaborationId'>>;

// JSON-LD export format
export interface JsonLdDocument {
  '@context': 'https://schema.org';
  '@graph': SchemaObject[];
}

// Helper function to get text content for embedding generation
export function getTextContentForEmbedding(obj: SchemaObject): string {
  const parts: string[] = [obj.name];
  
  if (obj.description) {
    parts.push(obj.description);
  }
  
  switch (obj['@type']) {
    case 'Person': {
      const person = obj as PersonObject;
      if (person.jobTitle) parts.push(person.jobTitle);
      if (person.worksFor) parts.push(person.worksFor);
      break;
    }
    case 'Event': {
      const event = obj as EventObject;
      if (event.location) parts.push(event.location);
      if (event.organizer) parts.push(event.organizer);
      if (event.performer?.length) parts.push(...event.performer);
      break;
    }
    case 'Project': {
      const project = obj as ProjectObject;
      if (project.creator) parts.push(project.creator);
      if (project.keywords?.length) parts.push(...project.keywords);
      break;
    }
    case 'Organization': {
      const org = obj as OrganizationObject;
      if (org.legalName) parts.push(org.legalName);
      if (org.alternateName) parts.push(org.alternateName);
      break;
    }
    case 'Place': {
      const place = obj as PlaceObject;
      if (place.address) parts.push(place.address);
      break;
    }
  }
  
  return parts.join(' ').trim();
}

// Helper to validate schema object type
export function isValidSchemaType(type: string): type is SchemaOrgType {
  return ['Person', 'Event', 'Project', 'Organization', 'Place'].includes(type);
}

// Helper to create JSON-LD output
export function toJsonLd(objects: SchemaObject[]): JsonLdDocument {
  return {
    '@context': 'https://schema.org',
    '@graph': objects.map(obj => {
      // Remove internal fields from JSON-LD output
      const {
        collaborationId: _collaborationId,
        source: _source,
        createdAt: _createdAt,
        updatedAt: _updatedAt,
        deletedAt: _deletedAt,
        ...schemaFields
      } = obj as SchemaObject & {
        collaborationId: string;
        source: string;
        createdAt: string;
        updatedAt: string;
        deletedAt?: string;
      };
      return schemaFields as SchemaObject;
    }),
  };
}

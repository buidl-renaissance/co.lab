/**
 * GET /api/schema-objects/:id - Fetch schema object by ID
 * PATCH /api/schema-objects/:id - Update schema object fields
 * DELETE /api/schema-objects/:id - Soft delete schema object
 */

import { NextApiRequest, NextApiResponse } from 'next';
import {
  getSchemaObject,
  updateSchemaObject,
  deleteSchemaObject,
} from '@/lib/lancedb';
import { UpdateSchemaObjectInput } from '@/data/schemaObject';

type ResponseData = {
  success: boolean;
  data?: unknown;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Missing or invalid id parameter',
    });
  }

  if (req.method === 'GET') {
    try {
      const obj = await getSchemaObject(id);

      if (!obj) {
        return res.status(404).json({
          success: false,
          error: 'Schema object not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: obj,
      });
    } catch (error) {
      console.error('Error fetching schema object:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch schema object',
      });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const body = req.body;

      const updates: UpdateSchemaObjectInput = {};

      if (body.name !== undefined) updates.name = body.name;
      if (body.description !== undefined) updates.description = body.description;
      if (body.source !== undefined) updates.source = body.source;

      if (body.givenName !== undefined) (updates as Record<string, unknown>).givenName = body.givenName;
      if (body.familyName !== undefined) (updates as Record<string, unknown>).familyName = body.familyName;
      if (body.email !== undefined) (updates as Record<string, unknown>).email = body.email;
      if (body.telephone !== undefined) (updates as Record<string, unknown>).telephone = body.telephone;
      if (body.jobTitle !== undefined) (updates as Record<string, unknown>).jobTitle = body.jobTitle;
      if (body.worksFor !== undefined) (updates as Record<string, unknown>).worksFor = body.worksFor;
      if (body.url !== undefined) (updates as Record<string, unknown>).url = body.url;
      if (body.image !== undefined) (updates as Record<string, unknown>).image = body.image;
      if (body.sameAs !== undefined) (updates as Record<string, unknown>).sameAs = body.sameAs;

      if (body.startDate !== undefined) (updates as Record<string, unknown>).startDate = body.startDate;
      if (body.endDate !== undefined) (updates as Record<string, unknown>).endDate = body.endDate;
      if (body.location !== undefined) (updates as Record<string, unknown>).location = body.location;
      if (body.eventStatus !== undefined) (updates as Record<string, unknown>).eventStatus = body.eventStatus;
      if (body.eventAttendanceMode !== undefined) (updates as Record<string, unknown>).eventAttendanceMode = body.eventAttendanceMode;
      if (body.organizer !== undefined) (updates as Record<string, unknown>).organizer = body.organizer;
      if (body.performer !== undefined) (updates as Record<string, unknown>).performer = body.performer;
      if (body.attendee !== undefined) (updates as Record<string, unknown>).attendee = body.attendee;
      if (body.maximumAttendeeCapacity !== undefined) (updates as Record<string, unknown>).maximumAttendeeCapacity = body.maximumAttendeeCapacity;

      if (body.dateCreated !== undefined) (updates as Record<string, unknown>).dateCreated = body.dateCreated;
      if (body.dateModified !== undefined) (updates as Record<string, unknown>).dateModified = body.dateModified;
      if (body.datePublished !== undefined) (updates as Record<string, unknown>).datePublished = body.datePublished;
      if (body.creator !== undefined) (updates as Record<string, unknown>).creator = body.creator;
      if (body.contributor !== undefined) (updates as Record<string, unknown>).contributor = body.contributor;
      if (body.funder !== undefined) (updates as Record<string, unknown>).funder = body.funder;
      if (body.keywords !== undefined) (updates as Record<string, unknown>).keywords = body.keywords;
      if (body.status !== undefined) (updates as Record<string, unknown>).status = body.status;

      if (body.legalName !== undefined) (updates as Record<string, unknown>).legalName = body.legalName;
      if (body.alternateName !== undefined) (updates as Record<string, unknown>).alternateName = body.alternateName;
      if (body.address !== undefined) (updates as Record<string, unknown>).address = body.address;
      if (body.logo !== undefined) (updates as Record<string, unknown>).logo = body.logo;
      if (body.foundingDate !== undefined) (updates as Record<string, unknown>).foundingDate = body.foundingDate;
      if (body.numberOfEmployees !== undefined) (updates as Record<string, unknown>).numberOfEmployees = body.numberOfEmployees;
      if (body.member !== undefined) (updates as Record<string, unknown>).member = body.member;
      if (body.parentOrganization !== undefined) (updates as Record<string, unknown>).parentOrganization = body.parentOrganization;
      if (body.subOrganization !== undefined) (updates as Record<string, unknown>).subOrganization = body.subOrganization;

      if (body.geo !== undefined) (updates as Record<string, unknown>).geo = body.geo;
      if (body.openingHours !== undefined) (updates as Record<string, unknown>).openingHours = body.openingHours;
      if (body.containedInPlace !== undefined) (updates as Record<string, unknown>).containedInPlace = body.containedInPlace;
      if (body.containsPlace !== undefined) (updates as Record<string, unknown>).containsPlace = body.containsPlace;

      const obj = await updateSchemaObject(id, updates);

      if (!obj) {
        return res.status(404).json({
          success: false,
          error: 'Schema object not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: obj,
      });
    } catch (error) {
      console.error('Error updating schema object:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update schema object',
      });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const hard = req.query.hard === 'true';
      const deleted = await deleteSchemaObject(id, hard);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Schema object not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: { deleted: true },
      });
    } catch (error) {
      console.error('Error deleting schema object:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete schema object',
      });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

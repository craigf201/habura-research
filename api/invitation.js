import { get } from '@vercel/blob';
import { handleInvitation } from '../lib/invitations.js';

export default {
  fetch(request) {
    return handleInvitation(request, {
      configuration: process.env.CONFERENCE_BOOKS,
      getBlob: get,
    });
  },
};

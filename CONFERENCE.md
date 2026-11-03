# Conference invitation pages

The existing public website stays static. `/invitation/<32-character-token>/`
is rendered by `api/invitation.js`. Each invitation grants access to one book
and its two PDF slots: `prospectus` and `sample-chapters`.

These are bearer invitations, not individual user accounts. Anyone with a QR
code or its complete link can view and download that book's materials. Do not
publish invitation links, QR assets, or confidential documents in this public
repository. The owner has a separate private QR kit.

## Configuration and stable links

Vercel's sensitive `CONFERENCE_BOOKS` environment variable holds an array:

```json
[
  {
    "id": "example-book",
    "title": "Book title",
    "subtitle": "Subtitle",
    "description": "Short description for editors.",
    "enabled": true,
    "tokenHash": "SHA-256 digest of a cryptographically random 24-byte base64url token",
    "documents": {}
  }
]
```

Keep each `id` and `tokenHash` unchanged when renaming a reserved book or
replacing its documents. This preserves the printed QR code. There are four
existing book slots and two additional reserved slots. No automatic expiry is
set, so conference follow-up remains possible. Set `enabled: false` to revoke
an invitation; optional `expiresAt` must be an ISO timestamp. Environment
changes require a new deployment before taking effect.

## Add materials when the author approves them

1. Use a reviewed PDF intended for editorial sharing. Keep the source DOCX
   and confidential drafts outside this public repository.
2. Upload to the private Vercel Blob store `habura-conference-materials`
   (`store_q00Pf7jmXIMnzWKM`, region `iad1`), connected to this project.
   Authenticated Vercel CLI / SDK uploads must use `access: private`.
   The project already has its storage credential. Never print or commit it.
3. Use a versioned pathname such as
   `conference/example-book/prospectus-v1.pdf` or
   `conference/example-book/sample-chapters-v1.pdf`.
   Only letters, digits, underscores and hyphens are accepted in the basename.
4. In the existing book entry's `documents`, add the relevant slot:

```json
{
  "prospectus": {
    "pathname": "conference/example-book/prospectus-v1.pdf",
    "filename": "Example-Book-Prospectus.pdf"
  },
  "sample-chapters": {
    "pathname": "conference/example-book/sample-chapters-v1.pdf",
    "filename": "Example-Book-Sample-Chapters.pdf"
  }
}
```

5. Preserve every other book entry and invitation hash. Redeploy, then verify
   both downloads through the book's invitation. Check that the PDF bytes
   match the approved originals. Confirm a missing or incorrect invitation
   returns 404. Only distribute the invitation after this check.

An empty slot renders “In preparation”, with no pretend download button.
Downloads authorize first and stream private Blob contents. Blob URLs are
never returned to readers. A requested path cannot select another book's file.
Requests and responses are not logged by application code. Invitation pages
and downloads use `no-store`, `no-referrer`, and `noindex` headers, and have no
third-party assets or analytics. Hosting access logs may still record URLs.

## Development and checks

Run `npm ci`, `npm test`, then `python3 build.py`. `vercel.json` is maintained
directly, not overwritten by the static build. The public sitemap must never
contain invitations. All static content should remain unchanged except for
the general invitation/API exclusions in `robots.txt`.

The download tests use synthetic bytes, not the author's manuscripts. Final
PDF upload and end-to-end download verification are still required when the
real materials arrive.

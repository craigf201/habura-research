# Habura Research

Static author and research website for Craig R. Fredrickson, at https://www.haburaresearch.org.

Run `python3 build.py` to regenerate `dist/`. Vercel uses `vercel.json` to build and serve it. There are no framework dependencies. The generated HTML embeds its styling and small scripts, so the homepage remains usable as a standalone file.

## Included

- Homepage, research areas, and searchable/filterable publication catalog.
- Four book project pages, with clear manuscript status.
- Essay and study-guide directories linking to the existing Spiraling Light archive.
- Printable 40-minute discussion guide for 1 John 1:5–2:2, also available as downloadable HTML.
- Author profile and contact page using the publicly listed Spiraling Light email and contact form.
- Responsive navigation, keyboard focus states, JSON-LD metadata, canonical URLs, sitemap, and robots file.

## Content sources

Publication entries were checked against the publisher pages on October 12, 2026:

- https://indieskriflig.org.za/index.php/skriflig/article/view/3323
- https://www.thegospelcoalition.org/themelios/article/the-words-transforming-work-sanctification-by-scripture-in-1-peter-1-222-3/
- https://adfontesjournal.com/web-exclusives/abiding-in-the-vine/
- https://byfaithonline.com/micah-and-the-mercy-of-god/

Spiraling Light's homepage, blog, resources, podcasts, and about pages supply the archive links and existing contact address. Book project descriptions and author background follow Craig's supplied context. The book-cover composition is explicitly marked as illustrative. Confidential manuscripts and unpublished submission details are excluded.

## Next infrastructure phase

The current release has no accounts, payments, subscriber database, or protected downloads. Implement the paid study library only with real authentication, server-side entitlement checks, protected file storage, a payment provider, and a working publishing workflow. Never embed paid files in public static assets or simulate checkout success.

Before retiring Spiraling Light, export and review the full text, downloadable files, podcast destinations, mailing-list permissions, and URL inventory. Preserve legacy redirects where possible. The current site links to the old archive; it does not claim the full archive has been migrated.

For production, confirm the Vercel project's repository is `craigf201/habura-research` and its output is `dist`. Redirect both `.com` domains to `https://www.haburaresearch.org` only after that target is verified. Keep the existing email address until a new mailbox is provisioned and tested.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { handleInvitation } from '../lib/invitations.js';

const token = 'a'.repeat(32);
const book = {id:'example',title:'A test project',enabled:true,tokenHash:createHash('sha256').update(token).digest('hex'),documents:{}};
const request = (suffix = '', options) => new Request(`https://www.haburaresearch.org/invitation/${token}/${suffix}`,options);
const run = (req, books = [book], getBlob = () => {throw Error('must not access storage');}) => handleInvitation(req,{configuration:JSON.stringify(books),getBlob});

test('valid invitation renders two honest pending states and privacy headers',async()=>{
  const response=await run(request()); const text=await response.text();
  assert.equal(response.status,200); assert.match(text,/A test project/);
  assert.equal((text.match(/class="status"/g)||[]).length,2);
  assert.doesNotMatch(text,/Download prospectus/);
  assert.match(response.headers.get('x-robots-tag'),/noindex/);
  assert.match(response.headers.get('cache-control'),/no-store/);
  assert.equal(response.headers.get('referrer-policy'),'no-referrer');
});
test('invalid, missing, expired and disabled invitations do not reveal project or fetch storage',async()=>{
  const checks=[
    [new Request('https://example.org/api/invitation'),[book]],
    [new Request('https://example.org/invitation/'+'b'.repeat(32)+'/'),[book]],
    [request(),[{...book,enabled:false}]],
    [request(),[{...book,expiresAt:'2020-01-01'}]],
    [request(),[{...book,expiresAt:'invalid date'}]],
  ];
  for(const [req,books] of checks){const res=await run(req,books);assert.equal(res.status,404);assert.doesNotMatch(await res.text(),/A test project/);}
});
test('pending, unknown, and cross-book documents cannot be downloaded',async()=>{
  assert.equal((await run(request('prospectus/'))).status,404);
  assert.equal((await run(new Request('https://example.org/api/invitation?token='+token+'&document=secret'))).status,404);
  const books=[{...book,documents:{prospectus:{pathname:'conference/another-book/prospectus.pdf',filename:'prospectus.pdf'}}}];
  assert.equal((await run(request('prospectus/'),books)).status,404);
});
test('authorized PDF is streamed with attachment and no-cache headers',async()=>{
  let calls=0;const books=[{...book,documents:{prospectus:{pathname:'conference/example/prospectus-v1.pdf',filename:'Example-Prospectus.pdf'}}}];
  const getBlob=async(path,options)=>{calls++;assert.equal(path,'conference/example/prospectus-v1.pdf');assert.equal(options.access,'private');return {statusCode:200,stream:new Response('%PDF-1.7 test').body};};
  const res=await run(request('prospectus/'),books,getBlob);
  assert.equal(res.status,200);assert.equal(await res.text(),'%PDF-1.7 test');assert.equal(calls,1);
  assert.match(res.headers.get('content-disposition'),/attachment; filename="Example-Prospectus.pdf"/);
  assert.equal(res.headers.get('content-type'),'application/pdf');assert.match(res.headers.get('cache-control'),/no-store/);
  const missing=await run(request('prospectus/'),books,async()=>null);assert.equal(missing.status,404);
});
test('page text is escaped and blob URLs and token hashes are never rendered',async()=>{
  const res=await run(request(),[{...book,title:'<script>alert(1)</script>',description:'<img src=x>',documents:{prospectus:{pathname:'conference/example/draft.pdf',filename:'draft.pdf'}}}]);
  const text=await res.text();assert.match(text,/&lt;script&gt;/);assert.doesNotMatch(text,/<script>/);assert.doesNotMatch(text,/conference\/example\/draft.pdf/);assert.doesNotMatch(text,new RegExp(book.tokenHash));
});
test('direct API requests require a valid token and reject duplicate credentials',async()=>{
  assert.equal((await run(new Request('https://example.org/api/invitation?token='+token))).status,200);
  assert.equal((await run(new Request('https://example.org/api/invitation?token='+token+'&token='+token))).status,404);
});
test('HEAD returns no body; unsupported methods cannot retrieve materials',async()=>{
  const head=await run(request('',{method:'HEAD'}));assert.equal(head.status,200);assert.equal(await head.text(),'');
  assert.equal((await run(request('',{method:'POST'}))).status,405);
});
test('missing configuration fails closed',async()=>{
  const res=await handleInvitation(request(),{configuration:undefined,getBlob:()=>assert.fail('storage accessed')});
  assert.equal(res.status,503);assert.doesNotMatch(await res.text(),/A test project/);
});

import { test } from 'node:test';
import assert from 'node:assert';
import { getPostBySlug } from '../lib/posts.ts';

test('path traversal', async () => {
    const post = await getPostBySlug("../../../README");
    console.log(post);
});

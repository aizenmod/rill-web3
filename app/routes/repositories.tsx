import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { Header } from '~/components/header/Header';
import { useEffect, useState } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { RepoList } from '~/components/repositories/RepoList.client';

export function loader({ request }: LoaderFunctionArgs) {
  return json({});
}

export default function Repositories() {
  return (
    <div className="flex flex-col min-h-full w-full bg-[var(--rill-background)]">
      <Header />
      <main className="flex-1 py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-[var(--rill-text-primary)]">
            Your Repositories
          </h1>
          <ClientOnly>
            {() => <RepoList />}
          </ClientOnly>
        </div>
      </main>
    </div>
  );
} 
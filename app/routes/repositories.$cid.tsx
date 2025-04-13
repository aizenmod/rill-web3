import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, useParams } from '@remix-run/react';
import { Header } from '~/components/header/Header';
import { ClientOnly } from 'remix-utils/client-only';
import { RepoView } from '~/components/repositories/RepoView.client';

export function loader({ params }: LoaderFunctionArgs) {
  return json({ cid: params.cid });
}

export default function RepositoryView() {
  const { cid } = useLoaderData<typeof loader>();
  
  return (
    <div className="flex flex-col min-h-full w-full bg-[var(--rill-background)]">
      <Header />
      <main className="flex-1 py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <ClientOnly>
            {() => <RepoView cid={cid} />}
          </ClientOnly>
        </div>
      </main>
    </div>
  );
} 
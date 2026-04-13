import { protocols } from '@/data/protocols';
import ProtocolDetailClient from './ProtocolDetailClient';

export function generateStaticParams() {
  return protocols.map((p) => ({ id: p.id }));
}

export default function ProtocolDetailPage({ params }: { params: { id: string } }) {
  return <ProtocolDetailClient id={params.id} />;
}

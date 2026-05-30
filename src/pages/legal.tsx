import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';

export function LegalPage({ title }: { title: string }) {
  return (
    <div className="container max-w-2xl py-10">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-4 text-muted-foreground">
        Documento legal en preparación. Para consultas, contáctanos en la página de contacto.
      </p>
      <Button asChild variant="link" className="mt-6 px-0 text-red-600">
        <Link to="/contacto">Ir a contacto</Link>
      </Button>
    </div>
  );
}

export function TermsPage() {
  return <LegalPage title="Términos y condiciones" />;
}

export function PrivacyPage() {
  return <LegalPage title="Política de privacidad" />;
}

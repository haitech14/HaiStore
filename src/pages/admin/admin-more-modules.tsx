import { AdminModuleLayout } from '@/components/admin/admin-module-layout';
import { AppearancePanel } from '@/components/admin/appearance-panel';
import { RentalPlansPanel } from '@/components/admin/rentals/rental-plans-panel';
import { ServicesPanel } from '@/components/admin/services/services-panel';
import { ShippingPanel } from '@/components/admin/shipping/shipping-panel';
import { TpvPanel } from '@/components/admin/tpv/tpv-panel';

export function AdminTpvPage() {
  return (
    <AdminModuleLayout
      title="TPV — Punto de venta"
      description="Venta en tienda con carrito, datos del cliente y emisión de proforma, factura o boleta en PDF."
    >
      <TpvPanel />
    </AdminModuleLayout>
  );
}

export function AdminServiciosPage() {
  return (
    <AdminModuleLayout
      title="Servicios"
      description="Órdenes de servicio, categorías y lista de precios para cotizaciones técnicas."
    >
      <ServicesPanel />
    </AdminModuleLayout>
  );
}

export function AdminAlquileresPage() {
  return (
    <AdminModuleLayout
      title="Alquileres y planes"
      description="Planes mensuales por volumen de impresión para equipos en alquiler."
    >
      <RentalPlansPanel />
    </AdminModuleLayout>
  );
}

export function AdminEnviosPage() {
  return (
    <AdminModuleLayout
      title="Envíos y logística"
      description="Zonas de entrega, tarifas por courier y seguimiento de despachos activos."
    >
      <ShippingPanel />
    </AdminModuleLayout>
  );
}

export function AdminAparienciaPage() {
  return (
    <AdminModuleLayout
      title="Apariencia"
      description="Logo, colores y mensajes de marca para la tienda y documentos PDF."
    >
      <AppearancePanel />
    </AdminModuleLayout>
  );
}

import type { ReactNode } from 'react';
import { ShieldCheck, Stethoscope, Workflow } from 'lucide-react';
import AuthInteractiveScene from './AuthInteractiveScene';

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: 'Acceso seguro y controlado' },
  { icon: Workflow, label: 'Operativa cl\u00ednica centralizada' },
  { icon: Stethoscope, label: 'Entorno premium para trabajo asistencial' },
];

export default function AuthShell({ eyebrow, title, description, children, footer }: AuthShellProps) {
  return (
    <div className="grid min-h-screen bg-[linear-gradient(180deg,#fbfcfe_0%,#f4f0f8_100%)] lg:grid-cols-[minmax(0,1.15fr)_30rem]">
      <div className="relative hidden p-6 lg:block xl:p-8">
        <AuthInteractiveScene />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-8 lg:px-10 xl:px-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,81,177,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(106,27,124,0.1),transparent_26%)]" />

        <div className="relative z-10 w-full max-w-[28rem] space-y-6">
          <div className="flex justify-center lg:hidden">
            <img
              src="/resources/images/LOGO-IMD-CENTRO-MEDICO_VERTICAL_COLOR.png"
              alt="IMD Centro Médico"
              className="h-24 w-auto object-contain"
            />
          </div>

          <div className="hidden justify-start lg:flex">
            <img
              src="/resources/images/LOGO-IMD-CENTRO-MEDICO_HORIZONTAL_COLOR.png"
              alt="IMD Centro Médico"
              className="h-12 w-auto object-contain"
            />
          </div>

          <div className="space-y-3 text-center lg:text-left">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-secondary-500/68">{eyebrow}</p>
            <div className="space-y-2">
              <h1 className="text-balance text-4xl font-black tracking-[-0.04em] text-gray-950 sm:text-[2.85rem] sm:leading-[0.94]">
                {title}
              </h1>
              <p className="text-sm leading-7 text-gray-500">{description}</p>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/70 bg-white/88 p-6 shadow-[0_30px_80px_rgba(82,24,105,0.12)] backdrop-blur-md sm:p-8">
            {children}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {TRUST_ITEMS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 rounded-2xl border border-gray-200/80 bg-white/72 px-2 py-3 text-center shadow-sm backdrop-blur-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-500">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <p className="text-[11px] font-medium leading-tight text-gray-600">{label}</p>
              </div>
            ))}
          </div>

          {footer && <div className="text-center text-sm text-gray-500 lg:text-left">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
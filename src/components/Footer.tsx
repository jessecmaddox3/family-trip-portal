import type { PortalConfig } from "@/lib/types";
export default function Footer({ config }: { config: PortalConfig }) {
  return (
    <footer className="bg-ocean-600 text-ocean-200 py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="font-heading text-sand-300 text-lg font-semibold mb-2">
          {config.brandName}
        </p>
        <p className="text-sm text-ocean-200">{config.footer}</p>
        <p className="text-xs text-ocean-200 mt-4">
          Built with Family Trip Portal
        </p>
      </div>
    </footer>
  );
}

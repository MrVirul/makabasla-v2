"use client";

import LetterheadTemplate from "@/components/templates/LetterheadTemplate";

export default function AdminLetterheadPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0B]">
      <div className="py-12">
        <LetterheadTemplate />
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0; padding: 0; }
          .page { margin: 0 !important; border: none !important; box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}

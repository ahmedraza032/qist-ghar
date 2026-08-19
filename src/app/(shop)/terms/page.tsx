import { createServiceClient } from "@/lib/supabase/server";

export const revalidate = 60; // revalidate every minute

export default async function TermsPage() {
  const supabase = await createServiceClient();
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "page_terms_of_service")
    .maybeSingle();

  const content = data?.value || "Terms of Service will be updated soon.";

  return (
    <main className="min-h-screen bg-bg-tinted pb-20">
      {/* Header Section */}
      <div className="bg-surface border-b border-border py-16 md:py-24 mb-10 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-text-primary mb-4 tracking-tight">Terms of Service</h1>
        <p className="text-text-secondary text-lg max-w-xl mx-auto">
          Please read these terms carefully before using our services.
        </p>
      </div>
      
      {/* Content Section */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-surface rounded-2xl p-8 md:p-12 shadow-sm border border-border">
          <div className="space-y-6 text-[17px] leading-relaxed text-text-secondary font-sans">
            {content.split("\n").map((line: string, i: number) => {
              if (!line.trim()) return null; // Skip empty lines
              // Detect section headers (e.g. "1. Something")
              if (line.match(/^\d+\.\s/)) {
                return <h2 key={i} className="text-xl font-heading font-bold text-text-primary pt-4 pb-1">{line}</h2>;
              }
              return <p key={i}>{line}</p>;
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

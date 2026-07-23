import { ShieldCheck, Cpu, Box, Compass } from "lucide-react";

const companies = [
  { name: "Lumios", icon: <ShieldCheck className="h-8 w-8" /> },
  { name: "Zenith", icon: <Cpu className="h-8 w-8" /> },
  { name: "Quantum", icon: <Box className="h-8 w-8" /> },
  { name: "Flux", icon: <Compass className="h-8 w-8" /> },
];

export function TrustedBySection() {
  return (
    <section className="mb-4">
      <div className="w-full">
        <p className="mb-4 text-center text-[10px] font-medium tracking-[1px] text-gray-400 uppercase">
          Trusted by <span className="font-bold text-gray-600">40+</span>{" "}
          Customers worldwide
        </p>
        <div className="flex flex-wrap items-center justify-center gap-10 md:gap-15">
          {companies.map((company) => (
            <div
              key={company.name}
              className="flex cursor-default items-center gap-2 text-gray-400"
            >
              <div>{company.icon}</div>
              <span className="text-xl font-bold tracking-tight md:text-2xl">
                {company.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

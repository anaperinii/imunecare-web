const logos = [
  'Clínica Princípios',
  'Hospital Sírio-Libanês',
  'A.C. Camargo',
  'HCor',
  'Einstein',
  'ASBAI',
]

export function LogosBar() {
  return (
    <div className="reveal py-8 px-[5%] border-t border-b border-(--border-custom) text-center">
      <p className="text-[0.8rem] text-(--text-muted) mb-5 uppercase tracking-[1px] font-semibold">
        Confiado por clínicas e equipes médicas em todo o Brasil
      </p>
      <div className="flex gap-6 sm:gap-12 justify-center items-center flex-wrap">
        {logos.map((logo) => (
          <div
            key={logo}
            className="text-[0.85rem] sm:text-[0.95rem] font-bold text-[#a0b5b3] tracking-[-0.3px] transition-colors duration-200 hover:text-teal-500"
          >
            {logo}
          </div>
        ))}
      </div>
    </div>
  )
}

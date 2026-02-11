export function Logo3D({ size = "large" }: { size?: "small" | "medium" | "large" }) {
  const dimensions = {
    small: { container: "w-16 h-16" },
    medium: { container: "w-28 h-28" },
    large: { container: "w-40 h-40" }
  };

  const dim = dimensions[size];

  return (
    <div className="relative group">
      {/* الظل الخارجي المتحرك الذهبي */}
      <div className={`absolute inset-0 ${dim.container} bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 rounded-full blur-3xl opacity-70 group-hover:opacity-90 transition-opacity duration-500 animate-pulse`}></div>
      
      {/* الحاوية الرئيسية 3D */}
      <div className={`relative ${dim.container} transform-gpu transition-all duration-700 group-hover:scale-110`}>
        {/* طبقة العمق الخلفية الأولى */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-800 to-yellow-900 rounded-full transform translate-x-3 translate-y-3 opacity-30 blur-sm"></div>
        
        {/* طبقة العمق الخلفية الثانية */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-700 to-yellow-800 rounded-full transform translate-x-2 translate-y-2 opacity-40 blur-sm"></div>
        
        {/* طبقة العمق الوسطى */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600 to-yellow-700 rounded-full transform translate-x-1 translate-y-1 opacity-50"></div>
        
        {/* الطبقة الأمامية - اللوجو الحقيقي */}
        <div className="relative rounded-full shadow-2xl overflow-hidden border-4 border-amber-300/60 bg-white">
          {/* تأثير اللمعان المتحرك */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          {/* حلقة ذهبية داخلية */}
          <div className="absolute inset-0 rounded-full border-4 border-amber-400/30"></div>
          
          {/* اللوجو الحقيقي */}
          <div className="relative p-2">
            <img 
              src="https://polished-pony-114.convex.cloud/api/storage/fbb7b7be-f71c-4924-8642-2022f4f9cbf2"
              alt="New Egypt Gold Logo"
              className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          
          {/* تأثير الإضاءة الذهبية */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 via-transparent to-yellow-500/20 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

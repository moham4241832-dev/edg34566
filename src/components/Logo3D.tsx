export function Logo3D({ size = "large" }: { size?: "small" | "medium" | "large" }) {
  const dimensions = {
    small: { container: "w-20 h-20", padding: "p-3" },
    medium: { container: "w-32 h-32", padding: "p-4" },
    large: { container: "w-48 h-48", padding: "p-6" }
  };

  const dim = dimensions[size];

  return (
    <div className="relative group">
      {/* توهج ذهبي خارجي فاخر */}
      <div className={`absolute inset-0 ${dim.container} bg-gradient-to-br from-amber-400/40 via-yellow-500/40 to-amber-600/40 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-all duration-700 animate-pulse`}></div>
      
      {/* الحاوية الرئيسية بخلفية ذهبية فاخرة */}
      <div className={`relative ${dim.container} transform-gpu transition-all duration-700 group-hover:scale-105`}>
        {/* خلفية ذهبية متدرجة فاخرة */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 rounded-3xl shadow-2xl"></div>
        
        {/* نمط هندسي ذهبي خفيف */}
        <div className="absolute inset-0 opacity-10 rounded-3xl" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(251, 191, 36, 0.3) 10px, rgba(251, 191, 36, 0.3) 20px)`
        }}></div>
        
        {/* حدود ذهبية لامعة */}
        <div className="absolute inset-0 rounded-3xl border-2 border-amber-300/50 shadow-inner"></div>
        
        {/* تأثير اللمعان المتحرك */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1500 rounded-3xl"></div>
        
        {/* الشعار بدون إطار مع فلاتر قوية */}
        <div className={`relative ${dim.padding} flex items-center justify-center`}>
          <img 
            src="https://polished-pony-114.convex.cloud/api/storage/fbb7b7be-f71c-4924-8642-2022f4f9cbf2"
            alt="New Egypt Gold"
            className="w-full h-full object-contain drop-shadow-2xl transform group-hover:scale-110 transition-all duration-500"
            style={{ 
              imageRendering: 'crisp-edges',
              filter: 'brightness(1.4) contrast(1.3) saturate(1.2) drop-shadow(0 0 20px rgba(251, 191, 36, 0.6))',
              mixBlendMode: 'multiply'
            }}
          />
        </div>
        
        {/* طبقة إضاءة ذهبية علوية */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-200/20 via-transparent to-amber-400/10 rounded-3xl pointer-events-none"></div>
      </div>
    </div>
  );
}

import CliPortfolio from "../components/CliPortfolio";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      {/* Header with Name and Title */}
      <header className="p-4 md:p-4 border-b border-green-500/30">
        <h1 className="text-md md:text-2xl lg:text-2xl font-semibold text-green-400">
          Sahil Makandar
        </h1>
        <p className="text-green-300/80 text-xs md:text-sm">
          Software Engineer
        </p>
      </header>

      {/* Main Content - Split Layout */}
      <main className="flex flex-col lg:flex-row min-h-[calc(100vh-100px)]">
        {/* Left Section - Interactive 3D Card */}
        <div className="w-full lg:w-2/5 xl:w-1/3 border-r border-green-500/30 flex items-center justify-center p-4 md:p-8 lg:p-12">
          <div className="relative group">
            {/* 3D Card Container */}
            <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-green-500/50 rounded-xl p-6 md:p-8 shadow-2xl transform group-hover:scale-105 transition-all duration-500 hover:shadow-green-500/20">
              {/* Card Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-transparent to-green-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Profile Image */}
              <div className="relative z-10 text-center mb-6">
                <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 rounded-full overflow-hidden border-2 border-green-500/50 group-hover:border-green-400 transition-colors duration-300">
                  <img
                    src="/idcard.png"
                    alt="Sahil Makandar"
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>

                {/* Name and Title */}
                <h2 className="text-lg md:text-xl font-bold text-green-400 mb-1">
                  Sahil Makandar
                </h2>
                <p className="text-green-300/80 text-sm">Software Engineer</p>

                {/* Status Indicator */}
                <div className="flex items-center justify-center mt-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                  <span className="text-green-400 text-xs">ONLINE</span>
                </div>
              </div>

              {/* Card Details */}
              <div className="relative z-10 space-y-2 md:space-y-3 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-green-500/20">
                  <span className="text-green-300/60">Employee ID:</span>
                  <span className="text-green-400 font-mono">SM-2024-001</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-green-500/20">
                  <span className="text-green-300/60">Security Level:</span>
                  <span className="text-green-400">Senior</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-green-500/20">
                  <span className="text-green-300/60">Department:</span>
                  <span className="text-green-400">Engineering</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-green-300/60">Access Status:</span>
                  <span className="text-green-400">AUTHORIZED</span>
                </div>
              </div>

              {/* Holographic Scan Line Effect */}
              <div className="absolute inset-0 overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/20 to-transparent h-8 transform -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-500"></div>
              </div>
            </div>

            {/* Interactive 3D Card Label */}
            <div className="text-center mt-4 md:mt-6">
              <span className="text-green-500/60 text-xs font-mono">
                [Interactive 3D Card]
              </span>
            </div>
          </div>
        </div>

        {/* Right Section - Terminal Interface */}
        <div className="w-full lg:w-3/5 xl:w-2/3 flex flex-col min-h-[50vh] lg:min-h-full">
          <CliPortfolio />
        </div>
      </main>
    </div>
  );
}

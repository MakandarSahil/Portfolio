import CliPortfolio from "../components/CliPortfolio";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      {/* Header */}
      <header className="border-b border-green-500/30 p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-green-400">
          Sahil Makandar
        </h1>
        <p className="text-green-300/80 text-sm md:text-base mt-1">
          Software Engineer
        </p>
      </header>

      {/* Main Content */}
      <main className="flex flex-col lg:flex-row min-h-[calc(100vh-120px)]">
        {/* Left Section - Profile Card */}
        <div className="w-full lg:w-2/5 xl:w-1/3 border-r border-green-500/30 flex items-center justify-center p-8 lg:p-12">
          <div className="relative">
            {/* 3D Card Effect */}
            <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 border border-green-500/50 rounded-lg p-6 shadow-2xl transform hover:scale-105 transition-transform duration-300">
              {/* Card Header */}
              <div className="text-center mb-6">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-2 border-green-500/50">
                  <img
                    src="/idcard.png"
                    alt="Sahil Makandar"
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300"
                  />
                </div>
                <h2 className="text-xl font-bold text-green-400">
                  Sahil Makandar
                </h2>
                <p className="text-green-300/80 text-sm">Software Engineer</p>
              </div>

              {/* Card Details */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-green-300/60">ID:</span>
                  <span className="text-green-400">SM-2024-001</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-300/60">Level:</span>
                  <span className="text-green-400">Senior</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-300/60">Status:</span>
                  <span className="text-green-400">Active</span>
                </div>
              </div>

              {/* Holographic Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/10 to-transparent transform -skew-x-12 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
            </div>

            {/* Interactive 3D Card Label */}
            <div className="text-center mt-4">
              <span className="text-green-500/60 text-xs">
                [Interactive 3D Card]
              </span>
            </div>
          </div>
        </div>

        {/* Right Section - Terminal */}
        <div className="w-full lg:w-3/5 xl:w-2/3 flex flex-col">
          <CliPortfolio />
        </div>
      </main>
    </div>
  );
}

"use client";
import CliPortfolio from "../components/CliPortfolio";
import ProfileCard from "@/components/ProfileCard";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 text-green-400 font-mono relative overflow-hidden">
      {/* Animated Background Elements */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div> */}
      {/* Grid Pattern Overlay */}
      {/* <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none"></div> */}
      {/* Header with Enhanced Design */}
      <header className="relative z-10 p-4 md:p-3 border-b border-green-500/20 backdrop-blur-sm bg-black/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* <div className="relative">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
              </div> */}
              <div>
                <h1 className="text-xl md:text-xl lg:text-lg font-bold text-green-400 tracking-wider">
                  Sahil Makandar
                </h1>
                <p className="text-green-300/80 text-xs flex items-center">
                  <span className="mr-2">›</span>
                  Software Engineer
                </p>
              </div>
            </div>
            {/* Navigation Dots */}
            <div className=" md:flex space-x-1 cursor-pointer">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-green-500/50 rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-green-500/30 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>
      <main className="relative z-10 flex flex-col lg:flex-row min-h-[calc(100vh-120px)]">
        <div className="w-full lg:w-2/5 xl:w-1/3 border-r border-green-500/20 flex items-center justify-center p-6 md:p-8 lg:p-12 relative">
          <div className="absolute top-8 left-8 w-20 h-20 border-l-2 border-t-2 border-green-500/30"></div>
          <div className="absolute bottom-8 right-8 w-20 h-20 border-r-2 border-b-2 border-green-500/30"></div>

          <div className="relative group">
            {/* Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Card Wrapper */}
            <div className="relative">
              <ProfileCard
                name="Sahil Makandar"
                title="Software Engineer"
                handle="MakandarSahil"
                status="Online"
                contactText="Contact Me"
                avatarUrl="/spiderman.png"
                showUserInfo={true}
                enableTilt={true}
                onContactClick={() => console.log("Contact clicked")}
              />
            </div>

            {/* Interactive Label with Animation */}
            {/* <div className="text-center mt-6 md:mt-8">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500/10 rounded-full border border-green-500/30">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400/80 text-sm font-medium">
                  Interactive 3D Profile
                </span>
              </div>
            </div> */}
          </div>
        </div>

        {/* Right Section - Terminal Interface */}
        <div className="w-full lg:w-3/5 xl:w-2/3 flex flex-col min-h-[50vh] lg:min-h-full">
          <CliPortfolio />
        </div>
      </main>
      {/* Footer Enhancement */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>
    </div>
  );
}

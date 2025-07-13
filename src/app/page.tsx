"use client";

import { useState } from "react";
import CliPortfolio from "../components/CliPortfolio";
import ProfileCard from "@/components/ProfileCard";

export default function HomePage() {
  const [showCliPortfolio, setShowCliPortfolio] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 text-green-400 font-mono relative overflow-hidden">
      {/* Changed header positioning to sticky, top-0, and increased z-index */}
      <header className="sticky top-0 z-50 p-4 md:p-3 border-b border-green-500/20 backdrop-blur-sm bg-black/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
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
            {/* Terminal Toggle Buttons and Navigation Dots */}
            <div className="flex items-center space-x-4">
              {showCliPortfolio ? (
                <button
                  onClick={() => setShowCliPortfolio(false)}
                  className="px-3 py-1 text-sm bg-red-600/70 hover:bg-red-700/80 rounded-md transition-colors duration-200 text-white"
                >
                  Close Terminal
                </button>
              ) : (
                <button
                  onClick={() => setShowCliPortfolio(true)}
                  className="px-3 py-1 text-sm bg-green-600/70 hover:bg-green-700/80 rounded-md transition-colors duration-200 text-white"
                >
                  Open Terminal
                </button>
              )}
              {/* Original Navigation Dots */}
              <div className="md:flex space-x-1 cursor-pointer">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-green-500/50 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-green-500/30 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="relative z-10 flex flex-col lg:flex-row min-h-[calc(100vh-120px)]">
        {/* Left Section - Profile Card */}
        <div
          className={`w-full ${
            showCliPortfolio ? "lg:w-2/5 xl:w-1/3 border-r" : "lg:w-full"
          } border-green-500/20 flex items-center justify-center p-6 md:p-8 lg:p-12 relative`}
        >
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
          </div>
        </div>

        {/* Right Section - Terminal Interface (Conditional Rendering) */}
        {showCliPortfolio && (
          <div className="w-full lg:w-3/5 xl:w-2/3 flex flex-col min-h-[50vh] lg:min-h-full">
            <CliPortfolio />
          </div>
        )}
      </main>
      {/* Footer Enhancement */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>
    </div>
  );
}

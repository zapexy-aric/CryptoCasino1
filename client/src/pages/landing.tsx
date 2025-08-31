import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import GameCategories from "@/components/GameCategories";
import RecentWins from "@/components/RecentWins";
import BCOriginals from "@/components/BCOriginals";
import LiveSports from "@/components/LiveSports";
import SlotsShowcase from "@/components/SlotsShowcase";
import CryptoCurrencies from "@/components/CryptoCurrencies";
import DepositModal from "@/components/modals/DepositModal";
import WithdrawModal from "@/components/modals/WithdrawModal";
import MinesModal from "@/components/modals/MinesModal";

export default function Landing() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [minesModalOpen, setMinesModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground crypto-grid">
      <Header 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isAuthenticated={false}
      />
      
      <div className="flex pt-16">
        <Sidebar 
          isOpen={sidebarOpen}
          setDepositModalOpen={setDepositModalOpen}
          setWithdrawModalOpen={setWithdrawModalOpen}
          isAuthenticated={false}
        />
        
        <main className="flex-1 lg:ml-64 min-h-screen">
          {/* Hero Banner */}
          <section className="relative overflow-hidden">
            <div className="relative h-80 bg-gradient-to-r from-primary via-accent to-blue-500 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative z-10 text-center px-4">
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-4 floating">
                  STAY UNTAMED
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6">
                  Sign Up & Get <span className="text-yellow-400 font-bold">UP TO $20,000</span>
                </p>
                <button 
                  onClick={() => window.location.href = "/auth"}
                  className="px-6 py-3 sm:px-8 sm:py-4 bg-white text-black font-bold rounded-xl text-base sm:text-lg hover:bg-yellow-400 transition-colors pulse-glow"
                  data-testid="button-join-now"
                >
                  Join Now
                </button>
              </div>
            </div>
          </section>

          <div className="p-2 sm:p-4 md:p-6 space-y-6 sm:space-y-8">
            <RecentWins />
            <GameCategories onMinesClick={() => setMinesModalOpen(true)} />
            <BCOriginals onMinesClick={() => setMinesModalOpen(true)} />
            <LiveSports />
            <SlotsShowcase />
            <CryptoCurrencies />
          </div>
        </main>
      </div>

      {/* Live Chat */}
      <div className="fixed bottom-6 right-6 z-40">
        <button className="bg-gradient-to-r from-primary to-accent text-primary-foreground w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform" data-testid="button-live-chat">
          <i className="fas fa-comments text-xl"></i>
        </button>
      </div>

      <DepositModal isOpen={depositModalOpen} onClose={() => setDepositModalOpen(false)} />
      <WithdrawModal isOpen={withdrawModalOpen} onClose={() => setWithdrawModalOpen(false)} />
      <MinesModal isOpen={minesModalOpen} onClose={() => setMinesModalOpen(false)} />
    </div>
  );
}
